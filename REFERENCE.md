# Référence du Template Supabase + Next.js

Ce document contient tous les exemples, recommandations et documentations du template original avant nettoyage.

## Structure Originale du Projet

### Pages d'Exemple
- **Page d'accueil** (`app/page.tsx`) : Landing page avec tutoriel intégré
- **Page protégée** (`app/protected/page.tsx`) : Exemple de page nécessitant une authentification

### Composants d'Exemple Supprimés

#### Composants de Navigation et Interface
- `components/auth-button.tsx` : Bouton d'authentification avec gestion d'état
- `components/deploy-button.tsx` : Bouton de déploiement Vercel
- `components/env-var-warning.tsx` : Avertissement variables d'environnement
- `components/hero.tsx` : Section héro avec logos Supabase + Next.js

#### Composants de Tutorial (dossier `components/tutorial/`)
- `connect-supabase-steps.tsx` : Étapes de connexion à Supabase
- `sign-up-user-steps.tsx` : Étapes d'inscription utilisateur
- `fetch-data-steps.tsx` : Étapes de récupération de données
- `tutorial-step.tsx` : Composant base pour les étapes de tutorial
- `code-block.tsx` : Affichage de blocs de code

#### Logos et Assets
- `components/next-logo.tsx` : Logo Next.js SVG
- `components/supabase-logo.tsx` : Logo Supabase SVG

## Exemples de Code Utiles

### 1. Authentification avec Supabase

#### Auth Button (components/auth-button.tsx)
```tsx
import { signOutAction } from "@/app/auth/actions";
import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function AuthButton() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ? (
    <div className="flex items-center gap-4">
      Hey, {user.email}!
      <form action={signOutAction}>
        <Button type="submit" variant={"outline"}>
          Sign out
        </Button>
      </form>
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/auth/sign-up">Sign up</Link>
      </Button>
      <Button asChild size="sm" variant={"default"}>
        <Link href="/auth/login">Sign in</Link>
      </Button>
    </div>
  );
}
```

### 2. Vérification des Variables d'Environnement

#### Env Var Warning (components/env-var-warning.tsx)
```tsx
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export function EnvVarWarning() {
  return (
    <div className="flex gap-4 items-center">
      <AlertTriangle className="text-amber-500" strokeWidth={2} size={20} />
      <div className="text-sm">
        <p className="text-foreground/80">
          <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-xs font-medium text-secondary-foreground border">
            NEXT_PUBLIC_SUPABASE_URL
          </code>{" "}
          and{" "}
          <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-xs font-medium text-secondary-foreground border">
            NEXT_PUBLIC_SUPABASE_ANON_KEY
          </code>{" "}
          env vars are required.
        </p>
        <p className="text-foreground/60">
          Learn how to configure them{" "}
          <Link
            href="/protected"
            className="text-foreground font-medium hover:underline"
          >
            here
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
```

### 3. Patterns de Pages Protégées

#### Page Protégée (app/protected/page.tsx)
```tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InfoIcon } from "lucide-react";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          <InfoIcon size="16" strokeWidth={2} />
          This is a protected page that you can only see as an authenticated user
        </div>
      </div>
      <div className="flex flex-col gap-2 items-start">
        <h2 className="font-bold text-2xl mb-4">Your user details</h2>
        <pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto">
          {JSON.stringify(data.claims, null, 2)}
        </pre>
      </div>
    </div>
  );
}
```

## Instructions de Configuration Originales

### 1. Configuration Supabase

#### Étapes de Connexion (connect-supabase-steps.tsx)
1. **Créer un projet Supabase** : Aller sur database.new
2. **Déclarer les variables d'environnement** : 
   - Renommer `.env.example` en `.env.local`
   - Remplir avec les valeurs de l'API Settings Supabase
3. **Redémarrer le serveur de développement** : `npm run dev`
4. **Actualiser la page** pour charger les nouvelles variables

#### Variables d'environnement requises
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 2. Pattern d'Inscription Utilisateur

#### Étapes d'inscription (sign-up-user-steps.tsx)
1. **Aller à la page d'inscription** : `/auth/sign-up`
2. **Créer un compte utilisateur**
3. **Confirmer l'email** si requis
4. **Accéder aux pages protégées**

### 3. Pattern de Récupération de Données

#### Étapes de fetch de données (fetch-data-steps.tsx)
1. **Créer une table Supabase**
2. **Configurer les RLS policies**
3. **Utiliser le client Supabase pour les requêtes**
4. **Afficher les données dans les composants**

## Styles et Thèmes

### Hero Section Original
```tsx
export function Hero() {
  return (
    <div className="flex flex-col gap-16 items-center">
      <div className="flex gap-8 justify-center items-center">
        <SupabaseLogo />
        <span className="border-l rotate-45 h-6" />
        <NextLogo />
      </div>
      <h1 className="sr-only">Supabase and Next.js Starter Template</h1>
      <p className="text-3xl lg:text-4xl !leading-tight mx-auto max-w-xl text-center">
        The fastest way to build apps with{" "}
        <a href="https://supabase.com/" target="_blank" className="font-bold hover:underline">
          Supabase
        </a>{" "}
        and{" "}
        <a href="https://nextjs.org/" target="_blank" className="font-bold hover:underline">
          Next.js
        </a>
      </p>
      <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8" />
    </div>
  );
}
```

### Navigation Original
```tsx
<nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
  <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
    <div className="flex gap-5 items-center font-semibold">
      <Link href={"/"}>Next.js Supabase Starter</Link>
      <div className="flex items-center gap-2">
        <DeployButton />
      </div>
    </div>
    {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
  </div>
</nav>
```

## Recommandations pour le Développement

### 1. Structure de Projet Recommandée
- Garder la séparation des clients Supabase (client/server/middleware)
- Utiliser les formulaires avec Server Actions pour l'authentification
- Implémenter les RLS policies pour la sécurité des données
- Utiliser shadcn/ui pour les composants UI cohérents

### 2. Bonnes Pratiques Authentification
- Toujours vérifier l'authentification côté serveur
- Utiliser les redirections appropriées pour les pages protégées
- Gérer les états de chargement et d'erreur
- Implémenter la gestion des sessions avec cookies

### 3. Patterns UI Recommandés
- Utiliser Tailwind CSS avec les variables CSS pour les thèmes
- Implémenter le dark/light mode avec next-themes
- Utiliser Lucide React pour les icônes
- Suivre les conventions shadcn/ui pour la cohérence

### 4. Configuration Déploiement
- Variables d'environnement configurées sur Vercel/plateform
- Build optimisé avec Next.js
- Configuration Supabase en production
- Tests d'authentification avant déploiement

Cette référence peut servir de base pour réimplémenter des fonctionnalités similaires selon les besoins du projet.