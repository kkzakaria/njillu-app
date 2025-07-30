# Guide Développeur - Système de Réinitialisation de Mot de Passe

## Introduction

Ce guide explique comment utiliser, maintenir et étendre le système de réinitialisation de mot de passe sécurisé implémenté dans l'application njillu-app.

## Architecture des Composants

### Structure des Fichiers

```
lib/auth/
├── flow-guard.ts          # Validation des flux d'accès
├── reset-token.ts         # Gestion des tokens sécurisés
├── reset-actions.ts       # Server Actions (non utilisé actuellement)
└── session-guard.ts       # Guards de session existants

app/[locale]/auth/
├── forgot-password/
│   └── components/
│       └── forgot-password-form.tsx  # Formulaire de demande
└── reset-password-otp/
    ├── reset-password-otp-page.tsx   # Page OTP avec guards
    └── components/
        └── reset-password-otp-form.tsx  # Formulaire OTP

supabase/functions/
├── _shared/
│   └── cors.ts           # Configuration CORS partagée
└── request-password-reset/
    └── index.ts          # Edge Function principale
```

## API des Composants

### Flow Guards

#### `checkOtpResetAccess(searchParams: URLSearchParams)`

Valide l'accès à la page de réinitialisation OTP.

```typescript
// Usage dans une page
import { checkOtpResetAccess } from "@/lib/auth/flow-guard";

export default async function ResetPasswordOtpPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const urlSearchParams = new URLSearchParams();
  
  Object.entries(resolvedSearchParams).forEach(([key, value]) => {
    if (typeof value === 'string') {
      urlSearchParams.set(key, value);
    }
  });
  
  const { isValidAccess, shouldRedirect } = await checkOtpResetAccess(urlSearchParams);
  
  if (!isValidAccess && shouldRedirect) {
    redirect("/auth/forgot-password");
  }
  
  return <YourComponent />;
}
```

**Paramètres acceptés :**
- `email` : Email de l'utilisateur (obligatoire)
- `temp_token` : Token temporaire 16 caractères (accès immédiat)
- `token` : Token de récupération traditionnel (compatibilité)
- `type` : Type de récupération ('recovery')

**Retour :**
```typescript
{
  isValidAccess: boolean;    // true si accès autorisé  
  shouldRedirect: boolean;   // true si redirection nécessaire
}
```

### Gestion des Tokens

#### `validateResetToken(email: string)`

Valide un token de réinitialisation stocké en cookie.

```typescript
import { validateResetToken, clearResetTokens } from "@/lib/auth/reset-token";

// Validation
const isValid = await validateResetToken("user@example.com");

if (isValid) {
  // Nettoyer après usage
  await clearResetTokens();
  // Autoriser l'accès
}
```

#### `generateResetToken(email: string)`

Génère et stocke un token sécurisé (usage interne).

```typescript
// Généralement appelé automatiquement par l'Edge Function
const token = await generateResetToken("user@example.com");
```

### Edge Function

#### `POST /functions/v1/request-password-reset`

Initie le processus de réinitialisation.

**Requête :**
```typescript
const response = await fetch(`${supabaseUrl}/functions/v1/request-password-reset`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${supabaseAnonKey}`,
    'apikey': supabaseAnonKey
  },
  body: JSON.stringify({ email: "user@example.com" })
});
```

**Réponse succès :**
```typescript
{
  success: true,
  redirectUrl: "https://app.com/auth/reset-password-otp?email=user@example.com&temp_token=a1b2c3d4e5f6g7h8",
  email: "user@example.com"
}
```

**Réponse erreur :**
```typescript
{
  error: "Email is required" | "User not found" | "Internal server error"
}
```

## Intégration dans les Composants

### Formulaire de Demande de Réinitialisation

```typescript
"use client";

import { useState } from "react";
import { useLocale } from 'next-intl';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const locale = useLocale();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Configuration Supabase
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase configuration missing');
      }
      
      // Appel Edge Function
      const response = await fetch(`${supabaseUrl}/functions/v1/request-password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'apikey': supabaseAnonKey
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send reset email');
      }

      const result = await response.json();
      
      if (result.success && result.redirectUrl) {
        // Parser l'URL pour extraire les paramètres
        const url = new URL(result.redirectUrl, window.location.origin);
        const email = url.searchParams.get('email');
        const tempToken = url.searchParams.get('temp_token');
        
        // Mapping des URLs localisées
        const localizedPaths = {
          fr: '/fr/auth/verification-code',
          en: '/en/auth/reset-password-otp', 
          es: '/es/auth/codigo-verificacion'
        };
        
        // Redirection avec paramètres localisés
        const localizedUrl = `${localizedPaths[locale as keyof typeof localizedPaths]}?email=${encodeURIComponent(email || '')}&temp_token=${tempToken || ''}`;
        window.location.href = localizedUrl;
      }
      
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Votre JSX de formulaire */}
    </form>
  );
}
```

### Page de Vérification OTP

```typescript
import { checkAuthenticationStatus } from "@/lib/auth/session-guard";
import { checkOtpResetAccess } from "@/lib/auth/flow-guard";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ResetPasswordOtpPage({ searchParams }: PageProps) {
  // Conversion des paramètres
  const resolvedSearchParams = await searchParams;
  const urlSearchParams = new URLSearchParams();
  
  Object.entries(resolvedSearchParams).forEach(([key, value]) => {
    if (typeof value === 'string') {
      urlSearchParams.set(key, value);
    }
  });
  
  // Vérification session (permet les sessions OTP temporaires)
  const { shouldRedirect, isAuthenticated } = await checkAuthenticationStatus();
  
  if (shouldRedirect && isAuthenticated) {
    // TODO: Différencier sessions OTP des sessions complètes
    // redirect("/protected");
  }
  
  // Vérification flux de réinitialisation
  const { isValidAccess, shouldRedirect: shouldRedirectToForgot } = await checkOtpResetAccess(urlSearchParams);
  
  if (!isValidAccess && shouldRedirectToForgot) {
    redirect("/auth/forgot-password");
  }
  
  return <ResetPasswordOtpForm />;
}
```

## Configuration et Déploiement

### Variables d'Environnement

#### `.env.local` (Client)
```bash
# Supabase Public
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Secret pour tokens (minimum 32 caractères)
NEXTAUTH_SECRET=your-super-secret-key-minimum-32-characters-long
```

#### Supabase Edge Functions (Secrets)
```bash
# Déploiement des secrets
supabase secrets set NEXTAUTH_SECRET=your-super-secret-key-minimum-32-characters-long

# Vérification
supabase secrets list
```

### Déploiement Edge Functions

```bash
# Déploiement initial
supabase functions deploy request-password-reset

# Redéploiement après modifications
supabase functions deploy request-password-reset

# Vérification logs
supabase functions logs request-password-reset
```

### Configuration CORS

Le fichier `supabase/functions/_shared/cors.ts` configure les headers CORS :

```typescript
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
```

## Debugging et Troubleshooting

### Problèmes Courants

#### 1. Edge Function retourne 401

**Cause :** Headers d'authentification manquants ou incorrects

**Solution :**
```typescript
// ✅ Headers requis
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${supabaseAnonKey}`, // Obligatoire
  'apikey': supabaseAnonKey // Obligatoire
}
```

#### 2. Redirection ne fonctionne pas

**Cause :** URLs non localisées ou problème de parsing

**Solution :**
```typescript
// ✅ Vérifier le mapping des URLs
const localizedPaths = {
  fr: '/fr/auth/verification-code',      // Français
  en: '/en/auth/reset-password-otp',     // Anglais  
  es: '/es/auth/codigo-verificacion'     // Espagnol
};

// ✅ Utiliser window.location.href pour redirection immédiate
window.location.href = localizedUrl;
```

#### 3. Flow Guard bloque l'accès légitime

**Cause :** Token temporaire manquant ou invalide

**Diagnostic :**
```typescript
// Ajouter logs temporaires pour debugging
console.log('URL params:', {
  email: searchParams.get('email'),
  tempToken: searchParams.get('temp_token'),
  tokenLength: searchParams.get('temp_token')?.length
});
```

#### 4. Cookies non définis

**Cause :** Problème de domaine ou configuration sécurisée

**Solution :**
```typescript
// ✅ Vérifier la configuration des cookies
'Set-Cookie': [
  `reset-token=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=600; Path=/auth`,
  `reset-email=${email}; HttpOnly; Secure; SameSite=Strict; Max-Age=600; Path=/auth`
].join(', ')
```

### Logs de Debug Recommandés

```typescript
// ✅ Logs sécurisés (sans données sensibles)
console.log('Password reset initiated for domain:', email.split('@')[1]);
console.log('Token validation result:', { isValid: !!isValid, hasEmail: !!email });
console.log('Flow guard decision:', { isValidAccess, shouldRedirect, reason });
```

### Tests Manuels

#### Test du Flux Complet

1. **Demande de réinitialisation :**
   ```bash
   curl -X POST https://your-project.supabase.co/functions/v1/request-password-reset \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     -H "apikey: YOUR_ANON_KEY" \
     -d '{"email":"test@example.com"}'
   ```

2. **Vérification de l'email OTP reçu**

3. **Test d'accès à la page OTP :**
   ```
   GET /fr/auth/verification-code?email=test@example.com&temp_token=a1b2c3d4e5f6g7h8
   ```

4. **Soumission du code OTP**

5. **Redirection vers update-password**

## Sécurité et Bonnes Pratiques

### Validation des Entrées

```typescript
// ✅ Validation email côté client
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  setError('Please enter a valid email address');
  return;
}

// ✅ Validation côté serveur (Edge Function)
if (!email || typeof email !== 'string' || !email.includes('@')) {
  return new Response(
    JSON.stringify({ error: 'Valid email is required' }),
    { status: 400, headers: corsHeaders }
  );
}
```

### Gestion des Erreurs

```typescript
// ✅ Messages d'erreur utilisateur-friendly
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    // Mapper les erreurs techniques vers messages utilisateur
    if (error.message.includes('User not found')) {
      return 'If this email exists, you will receive a reset link.';
    }
    return error.message;
  }
  return 'An unexpected error occurred. Please try again.';
};
```

### Rate Limiting (Recommandé)

```typescript
// TODO: Implémenter rate limiting par IP/email
// Exemple avec Supabase Edge Functions + Upstash Redis
const rateLimit = await checkRateLimit(email, clientIP);
if (rateLimit.exceeded) {
  return new Response(
    JSON.stringify({ error: 'Too many requests. Please try again later.' }),
    { status: 429, headers: corsHeaders }
  );
}
```

## Extensibilité

### Ajout de Nouveaux Flow Guards

```typescript
// Exemple : Guard pour réinitialisation admin
export async function checkAdminResetAccess(searchParams: URLSearchParams, userRole: string) {
  if (userRole !== 'admin') {
    return { isValidAccess: false, shouldRedirect: true };
  }
  
  // Logique spécifique admin...
  return { isValidAccess: true, shouldRedirect: false };
}
```

### Support de Nouveaux Providers d'Email

```typescript
// Extension pour SendGrid, Mailgun, etc.
interface EmailProvider {
  sendResetEmail(email: string, otp: string): Promise<boolean>;
}

class SendGridProvider implements EmailProvider {
  async sendResetEmail(email: string, otp: string): Promise<boolean> {
    // Implementation SendGrid
  }
}
```

### Personnalisation des Tokens

```typescript
// Extension pour différents types de tokens
interface TokenGenerator {
  generate(email: string, type: 'reset' | 'verification' | 'admin'): Promise<string>;
  validate(email: string, token: string, type: string): Promise<boolean>;
}
```

## Monitoring et Métriques

### Métriques Recommandées

- **Taux de succès** : Réinitialisations complétées / Demandes initiées
- **Temps de conversion** : Délai demande → finalisation  
- **Taux d'abandon** : Utilisateurs qui n'entrent pas l'OTP
- **Erreurs fréquentes** : Types d'erreurs les plus courants

### Alertes de Sécurité

- **Pic de demandes** : Détection d'attaques de masse
- **Tokens invalides** : Tentatives d'accès direct
- **Échecs répétés** : Comptes possiblement compromis

---

**Version :** 1.0  
**Dernière mise à jour :** 30 Juillet 2025  
**Compatibilité :** Next.js 15.4.4, Supabase Auth v2