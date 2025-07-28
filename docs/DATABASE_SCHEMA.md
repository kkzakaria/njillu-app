# Documentation du Schéma de Base de Données

## Vue d'Ensemble

Le système utilise une approche minimaliste et évolutive pour la gestion des utilisateurs, en s'appuyant sur Supabase Auth pour l'authentification et en étendant avec une table `users` pour les profils.

## 🏗️ Architecture

### Table Principale

#### `public.users`
Table de profils utilisateurs étendant Supabase Auth.

**Structure** :
```sql
CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email varchar(255) NOT NULL UNIQUE,
  first_name varchar(100) NOT NULL,
  last_name varchar(100) NOT NULL,
  phone varchar(50),
  avatar_url text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);
```

**Champs** :
- `id` : UUID de l'utilisateur (clé étrangère vers `auth.users`)
- `email` : Email principal avec validation de format
- `first_name` : Prénom de l'utilisateur
- `last_name` : Nom de famille
- `phone` : Numéro de téléphone (optionnel)
- `avatar_url` : URL de l'image de profil
- `created_at` : Date de création du profil
- `updated_at` : Date de dernière modification (automatique)

**Index** :
- `idx_users_email` : Recherche rapide par email
- `idx_users_created_at` : Tri par date de création
- `idx_users_full_name` : Recherche par nom complet

## 🔐 Sécurité Row Level Security (RLS)

### Politiques RLS

| Politique | Action | Description |
|-----------|--------|-------------|
| `users_select_all` | SELECT | Tous les utilisateurs authentifiés peuvent voir tous les profils |
| `users_insert_own` | INSERT | Les utilisateurs peuvent créer uniquement leur propre profil |
| `users_update_own` | UPDATE | Les utilisateurs peuvent modifier uniquement leur propre profil |

### Automatisation

**Trigger `on_auth_user_created`** :
- Se déclenche automatiquement lors de l'inscription d'un nouvel utilisateur
- Crée un profil dans `public.users` avec les métadonnées fournies
- Utilise `first_name` et `last_name` depuis `raw_user_meta_data`

## 🔧 Utilisation Pratique

### Inscription d'un Nouvel Utilisateur

```typescript
// Lors de l'inscription via Supabase Auth
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password',
  options: {
    data: {
      first_name: 'Jean',
      last_name: 'Dupont'
    }
  }
});
// Le trigger créera automatiquement le profil dans public.users
```

### Récupération du Profil

```typescript
// Récupérer le profil de l'utilisateur connecté
const { data: profile } = await supabase
  .from('users')
  .select('*')
  .eq('id', user.id)
  .single();
```

### Mise à Jour du Profil

```typescript
// Mettre à jour son propre profil
const { error } = await supabase
  .from('users')
  .update({
    first_name: 'Jean-Pierre',
    phone: '+33 6 12 34 56 78',
    avatar_url: 'https://example.com/avatar.jpg'
  })
  .eq('id', user.id);
```

### Liste des Utilisateurs

```typescript
// Récupérer tous les profils (lecture autorisée pour tous)
const { data: users } = await supabase
  .from('users')
  .select('*')
  .order('created_at', { ascending: false });
```

## 📊 Requêtes Utiles

### Statistiques des Utilisateurs

```sql
-- Nombre total d'utilisateurs
SELECT COUNT(*) as total_users FROM public.users;

-- Utilisateurs récents (7 derniers jours)
SELECT * FROM public.users 
WHERE created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- Utilisateurs avec téléphone
SELECT COUNT(*) as users_with_phone 
FROM public.users 
WHERE phone IS NOT NULL;
```

### Recherche d'Utilisateurs

```sql
-- Recherche par nom
SELECT * FROM public.users
WHERE 
  LOWER(first_name) LIKE LOWER('%jean%')
  OR LOWER(last_name) LIKE LOWER('%jean%');

-- Recherche par email partiel
SELECT * FROM public.users
WHERE email ILIKE '%@example.com';
```

## ⚠️ Considérations de Sécurité

### Bonnes Pratiques

1. **Validation des Données** : Les contraintes CHECK garantissent la validité des emails et téléphones
2. **Isolation des Données** : Chaque utilisateur ne peut modifier que son propre profil
3. **Cascade Delete** : La suppression d'un compte auth.users supprime automatiquement le profil
4. **Timestamps Automatiques** : `updated_at` se met à jour automatiquement via trigger

### Points d'Attention

- L'email dans `public.users` doit correspondre à celui dans `auth.users`
- Les profils sont visibles par tous les utilisateurs authentifiés (ajuster si besoin de plus de confidentialité)
- Le trigger de création automatique nécessite que les métadonnées soient passées lors de l'inscription

## 📁 Fichiers de Migration

### Migrations Actuelles

1. `20250727095022_create_basic_users_table.sql` - Création de la table users
2. `20250727095145_basic_users_rls_policies.sql` - Politiques RLS et trigger

### Application des Migrations

```bash
# Réinitialiser et appliquer toutes les migrations
supabase db reset

# Appliquer les nouvelles migrations seulement
supabase migration up

# Vérifier le statut des migrations
supabase migration list
```

### Évolution Future

Cette structure basique peut être étendue avec :
- Système de rôles et permissions
- Préférences utilisateur (langue, timezone, thème)
- Informations professionnelles
- Métriques et statistiques d'utilisation
- Intégration avec d'autres tables métier

## 🔄 Migration et Maintenance

### Ajout de Nouveaux Champs

Pour ajouter de nouveaux champs, créer une nouvelle migration :

```bash
./scripts/generate-migration.sh "add_user_preferences"
```

Exemple de migration d'évolution :
```sql
-- Ajouter des préférences utilisateur
ALTER TABLE public.users
ADD COLUMN preferred_locale varchar(5) DEFAULT 'fr',
ADD COLUMN timezone varchar(100) DEFAULT 'Europe/Paris';
```

### Modification des Politiques RLS

Pour des besoins de confidentialité accrus :
```sql
-- Limiter la visibilité des profils
DROP POLICY "users_select_all" ON public.users;

CREATE POLICY "users_select_own" ON public.users
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);
```

Cette architecture minimaliste offre une base solide et évolutive pour la gestion des utilisateurs dans l'application.