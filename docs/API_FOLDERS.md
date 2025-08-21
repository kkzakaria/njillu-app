# API REST - Gestion des Dossiers

## Vue d'ensemble

Cette API REST permet la gestion complète des dossiers logistiques avec leurs étapes de traitement, relations avec les Bills of Lading, et analytics intégrées.

## Base URL

```
http://localhost:3000/api/folders
```

## Authentification

Toutes les requêtes nécessitent un token Bearer JWT Supabase.

```http
Authorization: Bearer <access_token>
```

## Endpoints Principaux

### 1. Gestion des Dossiers

#### GET /api/folders
Récupère la liste des dossiers avec pagination et filtres.

**Paramètres de requête :**
- `page` (number, défaut: 1) - Numéro de page
- `limit` (number, défaut: 20, max: 100) - Nombre d'éléments par page
- `transport_type` (string) - Type de transport (M, T, A)
- `status` (string) - Statut du dossier
- `assigned_to` (uuid) - ID de l'utilisateur assigné
- `created_by` (uuid) - ID du créateur
- `client_id` (uuid) - ID du client
- `priority` (string) - Priorité (low, normal, urgent, critical)
- `search` (string) - Recherche textuelle
- `has_bl` (boolean) - Avec/sans Bill of Lading
- `no_bl` (boolean) - Sans Bill of Lading uniquement
- `date_from` (date) - Date de dossier minimum
- `date_to` (date) - Date de dossier maximum
- `created_from` (datetime) - Date de création minimum
- `created_to` (datetime) - Date de création maximum

**Exemple de réponse :**
```json
{
  "data": [
    {
      "id": "uuid",
      "folder_number": "M250821-000001",
      "transport_type": "M",
      "status": "active",
      "title": "Expédition Marseille-Casablanca",
      "priority": "normal",
      "created_at": "2025-08-21T10:30:00Z",
      "created_by_user": {
        "id": "uuid",
        "first_name": "John",
        "last_name": "Doe",
        "email": "john@example.com"
      },
      "bill_of_lading": {
        "id": "uuid",
        "bl_number": "MSCU1234567",
        "status": "issued"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### POST /api/folders
Crée un nouveau dossier.

**Corps de requête :**
```json
{
  "transport_type": "M", // Requis: M, T, A
  "status": "draft", // Optionnel, défaut: draft
  "title": "Mon dossier",
  "description": "Description du dossier",
  "client_reference": "REF-001",
  "priority": "normal",
  "estimated_value": 15000.50,
  "estimated_value_currency": "EUR",
  "expected_delivery_date": "2025-09-15",
  "client_id": "uuid",
  "assigned_to": "uuid",
  "internal_notes": "Notes internes",
  "client_notes": "Notes client",
  "initialize_stages": true // Défaut: true
}
```

#### GET /api/folders/{id}
Récupère un dossier spécifique avec toutes ses relations.

**Réponse :**
```json
{
  "data": {
    "id": "uuid",
    "folder_number": "M250821-000001",
    // ... tous les champs du dossier
    "processing_stages": [
      {
        "id": "uuid",
        "stage": "enregistrement",
        "status": "completed",
        "sequence_order": 1,
        "completed_at": "2025-08-21T11:00:00Z"
      }
    ],
    "metrics": {
      "total_stages": 8,
      "completed_stages": 3,
      "completion_percentage": 37.5
    }
  }
}
```

#### PUT /api/folders/{id}
Met à jour un dossier existant.

**Corps de requête :** (tous les champs sont optionnels)
```json
{
  "title": "Nouveau titre",
  "status": "active",
  "priority": "urgent",
  "assigned_to": "uuid"
}
```

#### DELETE /api/folders/{id}
Supprime (soft delete) un dossier.

**Note :** Seul le créateur peut supprimer. Les dossiers avec statut `shipped`, `delivered`, ou `completed` ne peuvent pas être supprimés.

### 2. Gestion des Étapes de Traitement

#### GET /api/folders/{id}/stages
Récupère toutes les étapes d'un dossier.

**Réponse :**
```json
{
  "data": {
    "folder": {
      "id": "uuid",
      "folder_number": "M250821-000001"
    },
    "stages": [
      {
        "id": "uuid",
        "stage": "enregistrement",
        "status": "completed",
        "sequence_order": 1,
        "priority": "normal",
        "started_at": "2025-08-21T10:00:00Z",
        "completed_at": "2025-08-21T11:00:00Z",
        "assigned_to_user": {
          "id": "uuid",
          "first_name": "John",
          "last_name": "Doe"
        }
      }
    ],
    "metrics": {
      "total_stages": 8,
      "completed_stages": 1,
      "in_progress_stages": 1,
      "pending_stages": 6,
      "completion_percentage": 12.5,
      "current_stage": "revision_facture_commerciale"
    }
  }
}
```

#### POST /api/folders/{id}/stages
Initialise les étapes de traitement pour un dossier.

**Note :** Ne peut être appelé que si aucune étape n'existe déjà.

#### GET /api/folders/{id}/stages/{stage}
Récupère une étape spécifique.

**Étapes valides :**
- `enregistrement`
- `revision_facture_commerciale`
- `elaboration_fdi`
- `elaboration_rfcv`
- `declaration_douaniere`
- `service_exploitation`
- `facturation_client`
- `livraison`

#### PUT /api/folders/{id}/stages/{stage}
Met à jour ou effectue une action sur une étape.

**Actions disponibles :**

1. **Démarrer une étape :**
```json
{
  "action": "start",
  "assigned_to": "uuid", // Optionnel
  "notes": "Notes de démarrage"
}
```

2. **Compléter une étape :**
```json
{
  "action": "complete",
  "notes": "Notes de completion",
  "documents": ["doc1.pdf", "doc2.xlsx"]
}
```

3. **Bloquer une étape :**
```json
{
  "action": "block",
  "blocking_reason": "En attente de documents client"
}
```

4. **Débloquer une étape :**
```json
{
  "action": "unblock",
  "notes": "Documents reçus, reprise du traitement"
}
```

5. **Mise à jour simple :**
```json
{
  "status": "in_progress",
  "priority": "urgent",
  "assigned_to": "uuid",
  "notes": "Nouvelles notes",
  "due_date": "2025-08-25T15:00:00Z"
}
```

### 3. Recherche Avancée

#### POST /api/folders/search
Recherche avancée avec filtres multiples.

**Corps de requête :**
```json
{
  "query": "terme de recherche", // Recherche textuelle
  "filters": {
    "transport_type": ["M", "T"], // Array ou string
    "status": ["active", "shipped"],
    "priority": ["urgent", "critical"],
    "assigned_to": ["uuid1", "uuid2"],
    "created_by": "uuid",
    "client_id": ["uuid1", "uuid2"],
    "has_bl": true,
    "is_delayed": true, // Dossiers en retard
    "is_urgent": true, // Priorité urgent/critical
    "date_range": {
      "from": "2025-01-01",
      "to": "2025-12-31"
    },
    "created_range": {
      "from": "2025-08-01T00:00:00Z",
      "to": "2025-08-31T23:59:59Z"
    },
    "estimated_value_range": {
      "min": 1000,
      "max": 50000
    }
  },
  "pagination": {
    "page": 1,
    "limit": 20
  },
  "sort": {
    "field": "created_at", // created_at, folder_date, priority, etc.
    "order": "desc" // asc ou desc
  }
}
```

### 4. Statistiques et Analytics

#### GET /api/folders/stats
Récupère diverses statistiques sur les dossiers.

**Paramètres :**
- `type` (string, requis) - Type de statistique
- `period` (string) - Période spécifique (YYYY-MM ou YYYY)
- `transport_type` (string) - Filtrer par type de transport
- `assignee_id` (uuid) - Filtrer par assigné

**Types de statistiques disponibles :**

1. **Overview** (`type=overview`)
```json
{
  "type": "overview",
  "data": {
    "by_transport": [...],
    "by_status": {
      "active": 25,
      "completed": 10,
      "draft": 5
    },
    "requiring_attention": [...],
    "summary": {
      "total_folders": 40,
      "high_attention_folders": 3
    }
  }
}
```

2. **Transport** (`type=transport`)
3. **Period** (`type=period`)
4. **Assignee** (`type=assignee`)
5. **Stages** (`type=stages`) - Statistiques des étapes
6. **Performance** (`type=performance`) - Métriques de performance

## Codes d'État HTTP

- `200` - Succès
- `201` - Créé avec succès
- `400` - Requête invalide
- `401` - Non autorisé
- `403` - Permissions insuffisantes
- `404` - Ressource non trouvée
- `409` - Conflit (ex: étapes déjà initialisées)
- `500` - Erreur serveur

## Format des Erreurs

```json
{
  "error": "Description de l'erreur"
}
```

## Validation des Données

### Types de Transport
- `M` - Maritime
- `T` - Terrestre  
- `A` - Aérien

### Statuts de Dossier
- `draft` - Brouillon
- `active` - Actif
- `shipped` - Expédié
- `delivered` - Livré
- `completed` - Terminé
- `cancelled` - Annulé
- `archived` - Archivé

### Priorités
- `low` - Faible
- `normal` - Normale
- `urgent` - Urgente
- `critical` - Critique

### Statuts d'Étapes
- `pending` - En attente
- `in_progress` - En cours
- `completed` - Terminé
- `blocked` - Bloqué
- `skipped` - Ignoré

## Tests avec Bruno

### Installation

1. Installer Bruno CLI :
```bash
npm install -g @usebruno/cli
```

2. Démarrer les services :
```bash
supabase start
pnpm dev
```

3. Exécuter les tests :
```bash
./scripts/test-api.sh test
```

### Collection de Tests

La collection Bruno est organisée en 10 tests séquentiels :

1. **Get All Folders** - Liste des dossiers
2. **Create Folder** - Création d'un dossier
3. **Get Single Folder** - Récupération détaillée
4. **Update Folder** - Mise à jour
5. **Get Folder Stages** - Étapes de traitement
6. **Start Stage** - Démarrage d'étape
7. **Complete Stage** - Completion d'étape
8. **Search Folders** - Recherche avancée
9. **Get Statistics** - Analytics
10. **Delete Folder** - Suppression

### Environnements

- **local** - Développement local (port 3000)

### Variables d'Environnement

Les tests utilisent des variables partagées :
- `base_url` - URL de base de l'application
- `api_base` - URL de base de l'API
- `access_token` - Token d'authentification (auto-configuré)
- `test_folder_id` - ID du dossier de test (auto-configuré)

## Exemples d'Utilisation

### Créer et Traiter un Dossier Complet

```bash
# 1. S'authentifier
curl -X POST "http://127.0.0.1:54321/auth/v1/token?grant_type=password" \
  -H "apikey: <anon_key>" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'

# 2. Créer un dossier
curl -X POST "http://localhost:3000/api/folders" \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "transport_type": "M",
    "title": "Export Textile Maroc",
    "priority": "urgent"
  }'

# 3. Démarrer la première étape
curl -X PUT "http://localhost:3000/api/folders/{id}/stages/enregistrement" \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "start",
    "notes": "Début du traitement"
  }'

# 4. Rechercher des dossiers urgents
curl -X POST "http://localhost:3000/api/folders/search" \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "filters": {"is_urgent": true},
    "sort": {"field": "created_at", "order": "desc"}
  }'
```

## Sécurité

- **Authentication JWT** : Toutes les requêtes nécessitent un token valide
- **RLS (Row Level Security)** : Contrôle d'accès au niveau base de données
- **Permissions** : Créateurs et assignés peuvent modifier leurs dossiers
- **Soft Delete** : Suppression logique avec audit trail
- **Validation** : Validation complète des données en entrée
- **Rate Limiting** : Protection contre l'abus (à implémenter si nécessaire)

## Monitoring et Observabilité

- **Logs structurés** : Toutes les erreurs sont loggées avec contexte
- **Métriques** : Progression des dossiers calculée en temps réel
- **Analytics** : Vues statistiques précalculées pour performance
- **Health Checks** : Vérification de l'état des services

Cette API offre une solution complète et robuste pour la gestion des dossiers logistiques avec une architecture évolutive et des performances optimisées.