# Documentation du Schéma de Base de Données

## Vue d'Ensemble

Le système de gestion des utilisateurs et des rôles a été conçu pour répondre aux besoins spécifiques des opérations douanières avec une sécurité renforcée et des permissions granulaires.

## 🏗️ Architecture

### Tables Principales

#### `public.roles`
Table de définition des rôles avec système de permissions granulaires.

**Champs Clés** :
- `permissions` (JSONB) : Structure de permissions par domaine fonctionnel
- `level` (INTEGER) : Niveau hiérarchique (0 = plus élevé)
- `is_system_role` (BOOLEAN) : Rôles système non modifiables

#### `public.users`
Profils utilisateurs étendus avec informations douanières.

**Champs Clés** :
- `customs_license_number` : Numéro d'agrément douanier
- `permissions_override` (JSONB) : Permissions spécifiques utilisateur
- `preferred_locale` : Langue préférée (fr, en, es)

## 🔐 Système de Permissions

### Structure des Permissions (JSONB)

```json
{
  "documents": {
    "create": boolean,
    "read": boolean,
    "update": boolean,
    "delete": boolean,
    "manage_versions": boolean,
    "bulk_operations": boolean
  },
  "fdi": {
    "create": boolean,
    "read": boolean,
    "update": boolean,
    "delete": boolean,
    "approve": boolean,
    "submit_customs": boolean,
    "bulk_operations": boolean
  },
  "rfcv": {
    "create": boolean,
    "read": boolean,
    "update": boolean,
    "delete": boolean,
    "approve": boolean,
    "bulk_operations": boolean
  },
  "invoicing": {
    "create": boolean,
    "read": boolean,
    "update": boolean,
    "delete": boolean,
    "approve": boolean,
    "export": boolean,
    "manage_templates": boolean
  },
  "users": {
    "create": boolean,
    "read": boolean,
    "update": boolean,
    "delete": boolean,
    "manage_roles": boolean,
    "impersonate": boolean
  },
  "system": {
    "view_audit_logs": boolean,
    "manage_configurations": boolean,
    "backup_restore": boolean,
    "system_maintenance": boolean
  }
}
```

### Rôles Système

| Rôle | Niveau | Description | Cas d'Usage |
|------|--------|-------------|-------------|
| `super_admin` | 0 | Accès complet | Gestion technique du système |
| `admin` | 1 | Administration | Gestion des utilisateurs et configurations |
| `customs_broker` | 2 | Commissionnaire agréé | Opérations douanières professionnelles |
| `customs_officer` | 3 | Agent des douanes | Validation et contrôle gouvernemental |
| `operator` | 4 | Opérateur | Saisie et traitement quotidien |
| `client` | 5 | Client | Consultation des dossiers |

## 🛡️ Row Level Security (RLS)

### Politiques Principales

#### Table `roles`
- **Lecture** : Utilisateurs authentifiés voient les rôles actifs
- **Modification** : Seuls les super_admin peuvent modifier
- **Suppression** : Impossible pour les rôles système

#### Table `users`
- **Profil Personnel** : Utilisateurs peuvent voir/modifier leur profil
- **Gestion d'Équipe** : Permissions selon le rôle
- **Hiérarchie** : Ne peut assigner que des rôles de niveau égal/inférieur

### Fonctions de Sécurité

#### `check_user_permission(user_id, category, action)`
Vérifie si un utilisateur a une permission spécifique.

```sql
SELECT check_user_permission(
  'uuid-utilisateur',
  'fdi',
  'approve'
);
```

#### `get_user_effective_permissions(user_id)`
Retourne les permissions effectives (rôle + overrides).

```sql
SELECT get_user_effective_permissions('uuid-utilisateur');
```

## 🔧 Utilisation Pratique

### Création d'un Nouvel Utilisateur

```sql
-- 1. L'utilisateur doit d'abord s'inscrire via Supabase Auth

-- 2. Créer le profil utilisateur
INSERT INTO public.users (
  id,
  email,
  first_name,
  last_name,
  role_id,
  customs_license_number,
  preferred_locale
) VALUES (
  auth.uid(), -- ID de Supabase Auth
  'user@example.com',
  'Jean',
  'Dupont',
  (SELECT id FROM public.roles WHERE name = 'operator'),
  'CDI-2024-001',
  'fr'
);
```

### Vérification des Permissions en TypeScript

```typescript
// Hook pour vérifier les permissions
export function useUserPermissions() {
  const { data: permissions } = useQuery({
    queryKey: ['user-permissions'],
    queryFn: async () => {
      const { data } = await supabase.rpc(
        'get_user_effective_permissions',
        { user_id: (await supabase.auth.getUser()).data.user?.id }
      );
      return data;
    }
  });

  const hasPermission = (category: string, action: string) => {
    return permissions?.[category]?.[action] === true;
  };

  return { permissions, hasPermission };
}

// Utilisation dans un composant
function DocumentActions() {
  const { hasPermission } = useUserPermissions();

  return (
    <div>
      {hasPermission('documents', 'create') && (
        <Button>Créer Document</Button>
      )}
      {hasPermission('documents', 'delete') && (
        <Button variant="destructive">Supprimer</Button>
      )}
    </div>
  );
}
```

### Patterns de Sécurité

#### Vérification Côté Serveur

```typescript
// pages/api/documents/create.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createServerSupabaseClient({ req, res });
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  // Vérifier les permissions
  const { data: hasPermission } = await supabase.rpc(
    'check_user_permission',
    {
      user_id: user.id,
      permission_category: 'documents',
      permission_action: 'create'
    }
  );

  if (!hasPermission) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }

  // Procéder avec la création du document
  // ...
}
```

#### Protection des Routes

```typescript
// middleware.ts addition
export async function middleware(request: NextRequest) {
  // ... existing i18n and auth middleware

  // Check specific permissions for protected routes
  if (request.nextUrl.pathname.includes('/admin')) {
    const supabase = createMiddlewareClient({ req: request, res: NextResponse.next() });
    
    const { data: hasPermission } = await supabase.rpc(
      'check_user_permission',
      {
        user_id: user.id,
        permission_category: 'users',
        permission_action: 'read'
      }
    );

    if (!hasPermission) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }
}
```

## 📊 Requêtes Utiles

### Statistiques des Utilisateurs par Rôle

```sql
SELECT 
  r.display_name->>'fr' as role_name,
  COUNT(u.id) as user_count,
  COUNT(CASE WHEN u.is_active THEN 1 END) as active_users
FROM public.roles r
LEFT JOIN public.users u ON r.id = u.role_id
GROUP BY r.id, r.display_name, r.level
ORDER BY r.level;
```

### Utilisateurs avec Licences Expirées

```sql
SELECT 
  u.display_name,
  u.email,
  u.customs_license_number,
  u.customs_license_expiry,
  r.display_name->>'fr' as role
FROM public.users u
JOIN public.roles r ON u.role_id = r.id
WHERE u.customs_license_expiry < CURRENT_DATE
AND u.is_active = true;
```

### Audit des Permissions par Utilisateur

```sql
SELECT 
  u.display_name,
  u.email,
  r.name as role_name,
  r.permissions,
  u.permissions_override
FROM public.users u
JOIN public.roles r ON u.role_id = r.id
WHERE u.is_active = true
ORDER BY r.level, u.display_name;
```

## ⚠️ Considérations de Sécurité

### Bonnes Pratiques

1. **Principe du Moindre Privilège** : Accordez uniquement les permissions nécessaires
2. **Rotation des Permissions** : Révisez régulièrement les permissions utilisateur
3. **Audit Trail** : Implémentez un système de logs pour les actions sensibles
4. **Validation Hiérarchique** : Respectez la hiérarchie des rôles

### Points d'Attention

- Les `permissions_override` ne peuvent qu'**ajouter** des permissions, pas les retirer
- Les rôles système (`is_system_role = true`) ne peuvent pas être supprimés
- La hiérarchie des rôles est basée sur le champ `level` (plus petit = plus de privilèges)
- Les politiques RLS empêchent l'auto-modification des permissions critiques

## 📁 Fichiers de Migration

### Ordre d'Exécution
1. `20250724181317_remote_schema.sql` - Schéma initial Supabase
2. `20250726141430_users_roles_initial_schema.sql` - Tables users et roles  
3. `20250726141431_rls_policies.sql` - Politiques de sécurité RLS

### Application des Migrations

```bash
# Réinitialiser et appliquer toutes les migrations
supabase db reset

# Ou appliquer les nouvelles migrations seulement
supabase migration up

# Vérifier le statut des migrations
supabase migration list
```

### Création de Nouvelles Migrations

Utilisez le script fourni pour générer des timestamps corrects :

```bash
# Générer une nouvelle migration avec timestamp automatique
./scripts/generate-migration.sh "create_documents_table"

# Générer une mise à jour d'une migration existante avec suffixe
./scripts/generate-migration.sh "users_roles_schema_v2" --update "users_roles_initial_schema"

# Ou manuellement avec bash
timestamp=$(date +%Y%m%d%H%M%S)
touch "supabase/migrations/${timestamp}_nom_migration.sql"
```

## ⚠️ **Règles de Modification des Migrations**

### **Règle d'Or : "Never modify a migration that has left your machine"**

#### ✅ **Migration NON appliquée (locale uniquement)**
**→ Modifier directement le fichier existant**

```bash
# Vérifier le statut
supabase migration list

# Si jamais appliquée, modification autorisée
vim supabase/migrations/20250726141430_users_roles_initial_schema.sql
```

#### ❌ **Migration DÉJÀ appliquée (production/staging/équipe)**
**→ Créer une NOUVELLE migration avec suffixe de version**

**Convention de nommage pour les mises à jour :**
```bash
# Migration originale
20250726141430_users_roles_initial_schema.sql

# Mise à jour v2 (ajout de champs)
20250726143000_users_roles_initial_schema_v2.sql

# Mise à jour v3 (correction contraintes)
20250726144500_users_roles_initial_schema_v3.sql

# Ou avec description spécifique
20250726143000_users_roles_add_department_field.sql
20250726144500_users_roles_fix_phone_constraint.sql
```

### **Quand créer une nouvelle migration :**

- ✅ Migration déjà commitée dans git
- ✅ Migration appliquée sur staging/production
- ✅ Migration partagée avec l'équipe
- ✅ Migration appliquée localement + travail en équipe

### **Exemple pratique :**

```bash
# ❌ Mauvaise pratique
# Modifier: 20250726141430_users_roles_initial_schema.sql

# ✅ Bonne pratique
./scripts/generate-migration.sh "users_roles_initial_schema_v2"
# Génère: 20250726143000_users_roles_initial_schema_v2.sql
```

**Contenu de la migration v2 :**
```sql
-- Migration: users_roles_initial_schema_v2
-- Description: Ajout validation téléphone et champ département
-- Date: 2025-07-26
-- Base: 20250726141430_users_roles_initial_schema.sql

-- Ajouter contrainte téléphone
ALTER TABLE public.users 
ADD CONSTRAINT users_phone_format 
CHECK (phone IS NULL OR phone ~ '^[+]?[0-9-\s()]+$');

-- Ajouter champ département
ALTER TABLE public.users 
ADD COLUMN department_code varchar(10);
```

### **Commandes de vérification :**

```bash
# Vérifier les migrations appliquées
supabase migration list

# Voir l'état de la base locale
supabase db diff

# Reset local si migration pas encore partagée
supabase db reset
```

## 🔄 Migration et Maintenance

### Ajout d'un Nouveau Rôle

```sql
INSERT INTO public.roles (
  name,
  display_name,
  level,
  permissions,
  description
) VALUES (
  'warehouse_manager',
  '{"fr": "Gestionnaire Entrepôt", "en": "Warehouse Manager", "es": "Gerente de Almacén"}',
  3,
  '{"documents": {"create": true, "read": true, "update": true, "delete": false}}',
  '{"fr": "Gestionnaire des opérations d\'entrepôt"}'
);
```

### Modification des Permissions

```sql
-- Ajouter une nouvelle permission à un rôle existant
UPDATE public.roles 
SET permissions = permissions || '{"new_module": {"create": true, "read": true}}'
WHERE name = 'operator';
```

### Sauvegarde des Permissions

```sql
-- Exporter la configuration des rôles
COPY (
  SELECT name, display_name, level, permissions, description
  FROM public.roles
  WHERE is_system_role = true
) TO '/tmp/system_roles_backup.csv' WITH CSV HEADER;
```

## 📈 Monitoring et Performance

### Index Recommandés

Les migrations incluent déjà les index optimaux pour :
- Recherche par email/nom d'utilisateur
- Filtrage par rôle et statut actif
- Requêtes de permissions (index GIN sur JSONB)
- Recherche par numéro de licence douanière

### Métriques à Surveiller

1. **Temps de réponse** des vérifications de permissions
2. **Fréquence d'utilisation** des permissions par domaine
3. **Tentatives d'accès non autorisé** (logs d'erreur 403)
4. **Distribution des rôles** dans l'organisation

Cette architecture offre une base solide, sécurisée et évolutive pour le système de gestion des opérations douanières.