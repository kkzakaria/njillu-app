# Mon Application

Application Next.js avec Supabase - Base propre prête pour le développement.

## Stack Technique

- **Framework**: Next.js avec App Router
- **Database & Auth**: Supabase
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Language**: TypeScript

## Installation et Configuration

### Prérequis

1. Node.js 18+
2. Docker (pour Supabase local)
3. Un projet Supabase créé sur [database.new](https://database.new)

### Configuration Locale

1. **Cloner et installer les dépendances**

   ```bash
   git clone <votre-repo>
   cd njillu-app
   pnpm install
   ```

2. **Variables d'environnement**

   Créer un fichier `.env.local` :

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

3. **Démarrer Supabase local** (optionnel)

   ```bash
   supabase start
   ```

4. **Démarrer le serveur de développement**

   ```bash
   pnpm dev
   ```

## Commandes Disponibles

### Développement

- `pnpm dev` - Serveur de développement avec Turbopack
- `pnpm build` - Build de production
- `pnpm start` - Serveur de production
- `pnpm lint` - Linter ESLint

### Supabase (Optionnel - Développement Local)

- `supabase start` - Démarrer les services locaux
- `supabase stop` - Arrêter les services locaux
- `supabase status` - Statut des services
- `supabase db reset` - Reset de la base avec migrations

## Structure du Projet

```text
app/
├── auth/           # Pages d'authentification
├── protected/      # Routes protégées
├── layout.tsx      # Layout racine
└── page.tsx        # Page d'accueil

components/
├── ui/             # Composants shadcn/ui
└── theme-switcher.tsx

lib/
├── supabase/       # Configuration clients Supabase
└── utils.ts        # Utilitaires

supabase/
├── config.toml     # Configuration locale
└── migrations/     # Migrations de base
```

## Authentification

L'application utilise le système d'authentification de Supabase avec :

- Gestion des sessions par cookies via `@supabase/ssr`
- Trois clients configurés (client/server/middleware)
- Protection automatique des routes via middleware
- Pages d'authentification complètes (login, signup, mot de passe oublié)

## Base de Données

- Configuration locale avec Supabase CLI
- Migrations versionnées dans `supabase/migrations/`
- RLS (Row Level Security) activé par défaut
- Studio local accessible sur `http://localhost:54323`

## Référence

Consultez `REFERENCE.md` pour voir tous les exemples et patterns du template original avant nettoyage.

## Commentaires

Cette base propre est prête pour commencer le développement de votre application. Tous les exemples ont été supprimés mais documentés dans le fichier de référence.
