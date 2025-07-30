# Guide des Edge Functions Supabase

## Vue d'ensemble

Ce guide documente l'utilisation des Edge Functions Supabase dans l'application njillu-app, avec un focus sur la fonction `request-password-reset` qui gère la réinitialisation sécurisée des mots de passe.

## Architecture des Edge Functions

### Structure des Fichiers

```
supabase/functions/
├── _shared/
│   └── cors.ts                    # Configuration CORS partagée
└── request-password-reset/
    └── index.ts                   # Fonction principale de réinitialisation
```

### Configuration CORS Partagée

**Fichier :** `supabase/functions/_shared/cors.ts`

```typescript
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
```

**Utilisation :**
- Headers sécurisés pour requêtes cross-origin
- Support des méthodes POST et OPTIONS (preflight)
- Headers d'autorisation requis pour Supabase Auth

## Fonction `request-password-reset`

### Description

Edge Function sécurisée qui initie le processus de réinitialisation de mot de passe en :
1. Validant l'email utilisateur
2. Générant un token cryptographique sécurisé
3. Envoyant l'OTP via Supabase Auth
4. Retournant une URL de redirection avec token temporaire

### Endpoint

```
POST /functions/v1/request-password-reset
```

### Authentification

La fonction utilise la **SERVICE_ROLE_KEY** pour les privilèges administrateur nécessaires à `signInWithOtp()`.

```typescript
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
```

### Implémentation Complète

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  email: string
}

Deno.serve(async (req) => {
  // Gestion preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email }: RequestBody = await req.json()
    
    // Validation de l'email
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Client Supabase avec privilèges admin
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Envoi de l'OTP automatique
    const { error } = await supabaseAdmin.auth.signInWithOtp({
      email: email,
      options: {
        shouldCreateUser: false, // Sécurité : pas de création utilisateur
        emailRedirectTo: undefined // Pas de redirection email automatique
      }
    })

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Génération token cryptographique sécurisé
    const timestamp = Date.now().toString()
    const secret = Deno.env.get('NEXTAUTH_SECRET') ?? 'fallback-secret'
    const randomBytes = crypto.getRandomValues(new Uint8Array(16))
    const randomString = Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('')
    
    // Combinaison des données pour hash unique
    const tokenData = `${email}:${timestamp}:${randomString}`
    const encoder = new TextEncoder()
    const data_encoded = encoder.encode(tokenData + secret)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data_encoded)
    const hashArray = new Uint8Array(hashBuffer)
    const fullHash = Array.from(hashArray).map(b => b.toString(16).padStart(2, '0')).join('')
    
    // Token temporaire (16 premiers caractères du hash)
    const tempToken = fullHash.substring(0, 16)

    const redirectUrl = `${req.headers.get('origin')}/auth/reset-password-otp?email=${encodeURIComponent(email)}&temp_token=${tempToken}`
    
    // Token complet pour les cookies
    const token = fullHash
    
    return new Response(
      JSON.stringify({
        success: true,
        redirectUrl,
        email
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Set-Cookie': [
            `reset-token=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=600; Path=/auth`,
            `reset-email=${email}; HttpOnly; Secure; SameSite=Strict; Max-Age=600; Path=/auth`
          ].join(', ')
        }
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
```

### Paramètres d'Entrée

**Body (JSON) :**
```typescript
{
  email: string  // Email de l'utilisateur (obligatoire)
}
```

**Headers requis :**
```typescript
{
  'Content-Type': 'application/json',
  'Authorization': 'Bearer YOUR_ANON_KEY',  // Obligatoire
  'apikey': 'YOUR_ANON_KEY'                 // Obligatoire
}
```

### Réponses

#### Succès (200)

```typescript
{
  success: true,
  redirectUrl: "https://app.com/auth/reset-password-otp?email=user@example.com&temp_token=a1b2c3d4e5f6g7h8",
  email: "user@example.com"
}
```

**Cookies définis :**
- `reset-token` : Token complet SHA-256 (64 chars)
- `reset-email` : Email de l'utilisateur

#### Erreur (400)

```typescript
{
  error: "Email is required" | "User not found" | "Rate limited"
}
```

#### Erreur (500)

```typescript
{
  error: "Internal server error"
}
```

## Configuration et Déploiement

### Variables d'Environnement

#### Variables Locales (supabase/config.toml)

```toml
[functions.request-password-reset]
verify_jwt = false  # Permet l'accès avec ANON_KEY

[functions.request-password-reset.env]
NEXTAUTH_SECRET = "env_var_or_default"
```

#### Secrets Supabase (Production)

```bash
# Définir le secret pour génération de tokens
supabase secrets set NEXTAUTH_SECRET=your-super-secret-key-minimum-32-characters-long

# Vérifier les secrets définis
supabase secrets list

# Variables automatiques disponibles :
# - SUPABASE_URL (automatique)
# - SUPABASE_SERVICE_ROLE_KEY (automatique)
# - SUPABASE_ANON_KEY (automatique)
```

### Commandes de Déploiement

#### Développement Local

```bash
# Démarrer Supabase local avec Edge Functions
supabase start

# La fonction sera disponible sur :
# http://localhost:54321/functions/v1/request-password-reset
```

#### Déploiement Production

```bash
# Déploiement de la fonction
supabase functions deploy request-password-reset

# Vérification du déploiement
supabase functions list

# Consultation des logs
supabase functions logs request-password-reset

# Surveillance en temps réel
supabase functions logs request-password-reset --follow
```

### Permissions et Sécurité

#### Row Level Security (RLS)

Les Edge Functions avec SERVICE_ROLE_KEY **bypassent automatiquement** les politiques RLS. C'est voulu pour `signInWithOtp()` mais nécessite une vigilance supplémentaire.

#### Validation des Données

```typescript
// ✅ Validation robuste de l'email
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

if (!email || !validateEmail(email)) {
  return new Response(
    JSON.stringify({ error: 'Valid email is required' }),
    { status: 400, headers: corsHeaders }
  );
}
```

#### Rate Limiting (Recommandé)

```typescript
// TODO: Implémenter avec Upstash Redis ou similaire
interface RateLimit {
  key: string;           // IP ou email
  limit: number;         // Requêtes par fenêtre
  windowMs: number;      // Fenêtre de temps
}

const checkRateLimit = async (email: string, ip: string): Promise<boolean> => {
  // Implémentation avec cache Redis/KV
};
```

## Intégration Client

### Appel depuis React

```typescript
const handlePasswordReset = async (email: string) => {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
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
      throw new Error(errorData.error || 'Request failed');
    }

    const result = await response.json();
    
    if (result.success) {
      // Traitement de la redirection
      handleRedirection(result.redirectUrl);
    }
    
  } catch (error) {
    console.error('Password reset error:', error);
    // Gestion d'erreur utilisateur
  }
};
```

### Gestion des Erreurs Réseau

```typescript
const fetchWithRetry = async (url: string, options: RequestInit, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      
      if (!response.ok && response.status >= 500 && i < maxRetries - 1) {
        // Retry sur les erreurs serveur
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }
      
      return response;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};
```

## Monitoring et Debug

### Logs Recommandés

```typescript
// ✅ Logs sécurisés (pas de données sensibles)
console.log('Password reset requested for domain:', email.split('@')[1]);
console.log('Token generation completed:', { length: tempToken.length });
console.log('Supabase signInWithOtp result:', { success: !error, hasError: !!error });
```

### Métriques de Performance

- **Temps de réponse** : < 2 secondes cible
- **Taux de succès** : > 99% pour requêtes valides
- **Temps génération token** : < 100ms
- **Délai envoi email** : < 5 secondes via Supabase

### Debug en Développement

```bash
# Logs en temps réel
supabase functions logs request-password-reset --follow

# Test direct avec curl
curl -X POST http://localhost:54321/functions/v1/request-password-reset \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "apikey: YOUR_ANON_KEY" \
  -d '{"email":"test@example.com"}' \
  -v

# Test des headers CORS
curl -X OPTIONS http://localhost:54321/functions/v1/request-password-reset \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

## Problèmes Courants et Solutions

### 1. Erreur 401 "Unauthorized"

**Cause :** Headers d'authentification manquants ou incorrects

**Solution :**
```typescript
// ✅ Headers obligatoires
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${supabaseAnonKey}`, // OBLIGATOIRE
  'apikey': supabaseAnonKey                     // OBLIGATOIRE
}
```

### 2. Erreur CORS

**Cause :** Configuration CORS ou preflight incorrect

**Diagnostic :**
```bash
# Vérifier preflight
curl -X OPTIONS your-url \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

**Solution :**
```typescript
// ✅ Gestion preflight obligatoire
if (req.method === 'OPTIONS') {
  return new Response('ok', { headers: corsHeaders })
}
```

### 3. signInWithOtp échoue

**Cause :** SERVICE_ROLE_KEY manquante ou invalide

**Diagnostic :**
```typescript
// Vérifier la clé dans les logs (attention sécurité)
console.log('SERVICE_ROLE_KEY available:', !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
```

**Solution :**
```bash
# Vérifier les variables d'environnement
supabase secrets list
supabase functions logs request-password-reset
```

### 4. Tokens corrompus ou invalides

**Cause :** Problème de génération ou d'encodage

**Diagnostic :**
```typescript
// Logs de validation
console.log('Token components:', {
  timestamp: timestamp.length,
  randomString: randomString.length,
  hash: fullHash.length,
  tempToken: tempToken.length
});
```

## Bonnes Pratiques

### Sécurité

1. **Validation stricte des entrées**
2. **Rate limiting par IP et email**
3. **Logs sans données sensibles**
4. **Gestion des erreurs sans révéler l'architecture**
5. **Headers de sécurité appropriés**

### Performance

1. **Génération de tokens optimisée**
2. **Réutilisation des clients Supabase**
3. **Timeout appropriés**
4. **Gestion de la mémoire**

### Maintenabilité

1. **Code modulaire et réutilisable**
2. **Configuration par environnement**
3. **Documentation inline**
4. **Tests unitaires** (à implémenter)

## Évolutions Futures

### Améliorations Possibles

1. **Rate Limiting Avancé**
   - Implémentation avec Upstash Redis
   - Différents seuils par type d'utilisateur

2. **Audit et Logging**
   - Logs structurés avec Winston
   - Métriques avec OpenTelemetry

3. **Templates d'Email Personnalisés**
   - Support de templates HTML
   - Multilangue basé sur locale utilisateur

4. **Validation d'Email Avancée**
   - Vérification de domaine
   - Détection d'emails temporaires

---

**Version :** 1.0  
**Dernière mise à jour :** 30 Juillet 2025  
**Compatibilité :** Supabase Edge Functions v2, Deno 1.37+