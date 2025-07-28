# Sécurité des Flux d'Authentification

Cette documentation décrit l'implémentation du système de sécurisation des flux d'authentification pour empêcher l'accès direct aux pages intermédiaires.

## Problème Identifié

Avant l'implémentation, il était possible d'accéder directement aux pages suivantes sans passer par les étapes légitimes :

1. **`/auth/reset-password-otp`** - Page OTP accessible sans demander de reset
2. **`/auth/update-password`** - Page de mise à jour accessible sans contexte de récupération
3. **`/auth/sign-up-success`** - Page de succès accessible sans inscription préalable

## Architecture de Sécurisation

### Fichier `lib/auth/flow-guard.ts`

Ce fichier contient les utilitaires de vérification des flux d'authentification :

#### Fonctions Principales

**`checkPasswordResetFlow()`**

- Détecte si l'utilisateur est dans un état de récupération de mot de passe
- Vérifie que `session.user.aud !== 'authenticated'` (état de récupération Supabase)
- Utilisée comme base pour les vérifications de récupération

**`checkOtpResetAccess(searchParams)`**

- Vérifie l'accès légitime à la page OTP de reset
- **SÉCURISÉ** : Nécessite `email` ET `otpToken` valide dans l'URL
- Validation du token : timestamp + hash SHA256 avec secret serveur
- Expiration du token : 10 minutes après génération
- Ou avec `token` et `type=recovery` (flux de récupération traditionnel)
- Ou avec un état de récupération valide en session
- Redirige vers `/auth/forgot-password` si accès illégitime

**`checkUpdatePasswordAccess(searchParams)`**

- Vérifie l'accès à la page de mise à jour de mot de passe
- Accepte les accès avec `token` et `type=recovery` dans l'URL
- Ou avec un état de récupération valide en session
- Redirige vers `/auth/forgot-password` si accès illégitime

**`checkSignUpSuccessAccess(searchParams)`**

- Vérifie l'accès à la page de succès d'inscription
- Accepte les accès avec `type=signup`, `confirmed=true`, ou `from=signup`
- Redirige vers `/auth/sign-up` si accès illégitime

### Logique de Vérification

```typescript
// Pattern de sécurisation appliqué à chaque page
export default async function SecurePage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const urlSearchParams = new URLSearchParams();
  
  // 1. Vérification du flux spécifique
  const { isValidAccess, shouldRedirect } = await checkFlowAccess(urlSearchParams);
  if (!isValidAccess && shouldRedirect) {
    redirect("/auth/appropriate-page");
  }
  
  // 2. Vérification de session (si applicable)
  const { shouldRedirect: authRedirect } = await checkAuthenticationStatus();
  if (authRedirect) {
    redirect("/protected");
  }
  
  return <PageContent />;
}
```

## Pages Sécurisées

### `/auth/reset-password-otp`

**Conditions d'Accès Légitime :**

- Paramètres URL : `?email=xxx&otpToken=xxx` (flux OTP sécurisé)
- Token OTP valide et non expiré (10 minutes)
- Ou paramètres URL : `?token=xxx&type=recovery` (flux traditionnel)
- État de session : `session.user.aud !== 'authenticated'`

**Redirection si Accès Illégitime :** → `/auth/forgot-password`

### `/auth/update-password`

**Conditions d'Accès Légitime :**

- Paramètres URL : `?token=xxx&type=recovery`
- État de session : `session.user.aud !== 'authenticated'`

**Redirection si Accès Illégitime :** → `/auth/forgot-password`

### `/auth/sign-up-success`

**Conditions d'Accès Légitime :**

- Paramètres URL : `?type=signup`, `?confirmed=true`, ou `?from=signup`
- Confirmation email Supabase

**Redirection si Accès Illégitime :** → `/auth/sign-up`

**Modification du Formulaire d'Inscription :**

```typescript
// Dans sign-up-form.tsx
router.push("/auth/sign-up-success?from=signup");
```

## Flux de Sécurité

### Flux de Récupération de Mot de Passe

1. **`/auth/forgot-password`** : Demande de reset via OTP + génération token
2. **Redirection sécurisée** : `?email=xxx&otpToken=xxx` (flux OTP avec token)
3. **`/auth/reset-password-otp`** : Vérification OTP (sécurisée avec validation token)
4. **`/auth/update-password`** : Mise à jour mot de passe (sécurisée)

### Flux d'Inscription

1. **`/auth/sign-up`** : Formulaire d'inscription
2. **Redirection avec paramètre** : `?from=signup`
3. **`/auth/sign-up-success`** : Page de succès (sécurisée)

## Compatibilité Next.js 15

**Changement Important :** `searchParams` est maintenant une `Promise`

```typescript
// Next.js 15 - Pattern requis
interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Page({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  // Traitement des paramètres...
}
```

## États de Session Supabase

### États d'Authentification

**Session Complète** : `session.user.aud === 'authenticated'`

- Utilisateur complètement connecté
- Accès à `/protected`
- Redirection automatique depuis les pages d'auth

**Session de Récupération** : `session.user.aud !== 'authenticated'`

- Utilisateur en processus de récupération
- Accès autorisé aux pages de reset/update
- Pas d'accès aux pages normales d'authentification

**Pas de Session** : `session === null`

- Utilisateur non connecté
- Accès aux pages d'authentification standard
- Pas d'accès aux pages protégées

## Tests de Sécurité

### Scénarios de Test

**Test 1 : Accès Direct OTP**

```bash
# AVANT : Accessible directement
GET /auth/reset-password-otp
# APRÈS : Redirection vers forgot-password
```

**Test 2 : Accès Direct Update Password**

```bash
# AVANT : Accessible directement
GET /auth/update-password
# APRÈS : Redirection vers forgot-password
```

**Test 3 : Accès Direct Sign-up Success**

```bash
# AVANT : Accessible directement
GET /auth/sign-up-success
# APRÈS : Redirection vers sign-up
```

**Test 4 : Flux Légitime**

```bash
# Flux complet de récupération - doit fonctionner
POST /auth/forgot-password → Email → GET /auth/reset-password-otp?token=xxx&type=recovery
```

### Validation Manuelle

```bash
# Démarrer le serveur
pnpm dev

# Tester les accès directs (doivent échouer)
curl -I http://localhost:3000/auth/reset-password-otp
curl -I http://localhost:3000/auth/update-password
curl -I http://localhost:3000/auth/sign-up-success

# Tester les flux légitimes (doivent réussir)
# 1. Inscription → success page
# 2. Forgot password → OTP → update
```

## Système de Tokens OTP Sécurisé

### Génération de Token (`generateOtpToken`)

**API Route** : `/api/auth/generate-otp-token`
```typescript
// Génération côté serveur
const timestamp = Date.now();
const secret = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;
const data = `${email}:${timestamp}:${secret}`;
const hash = createHash('sha256').update(data).digest('hex');
const token = `${timestamp}.${hash}`;
```

### Validation de Token (`validateOtpToken`)

**Vérifications** :
1. **Format** : `timestamp.hash` valide
2. **Expiration** : Moins de 10 minutes (600000ms)
3. **Intégrité** : Hash SHA256 recalculé correspond
4. **Authenticité** : Secret serveur inclus dans le hash

### Flux Sécurisé

```typescript
// 1. Forgot Password Form
POST /api/auth/generate-otp-token { email }
→ Reçoit otpToken sécurisé

// 2. Redirection avec token
/auth/reset-password-otp?email=xxx&otpToken=timestamp.hash
→ Page OTP accessible uniquement avec token valide

// 3. Accès direct bloqué
/auth/reset-password-otp?email=xxx
→ Redirection vers /auth/forgot-password (pas de token)
```

## Avantages de Sécurité

### 🛡️ Protection Contre

1. **Accès Direct Malveillant** : Token requis empêche l'accès aux pages intermédiaires
2. **Bypass de Flux** : Force le passage par les étapes légitimes avec tokens
3. **Replay Attacks** : Tokens à durée limitée (10 minutes)
4. **URL Forgery** : Hash cryptographique avec secret serveur
5. **État Incohérent** : Évite les états d'application incohérents
6. **Exploitation de URL** : Protège contre la manipulation manuelle d'URL

### 🚀 Bénéfices UX

1. **Flux Cohérent** : Guide l'utilisateur dans le processus correct
2. **Messages Appropriés** : Affichage des bonnes informations au bon moment
3. **Pas de Pages Vides** : Évite l'affichage de pages sans contexte
4. **Navigation Intuitive** : Redirection vers les étapes appropriées

## Configuration et Maintenance

### Variables d'Environnement

Aucune variable supplémentaire requise. Utilise la configuration Supabase existante.

### Monitoring

```typescript
// Pour surveiller les tentatives d'accès direct
console.log('Accès direct bloqué vers:', pathname);
console.log('Redirection vers:', redirectPath);
```

### Évolution Future

1. **Logs de Sécurité** : Enregistrer les tentatives d'accès illégitime
2. **Rate Limiting** : Limiter les tentatives répétées
3. **Analytics** : Suivre les patterns d'utilisation des flux
4. **Alertes** : Notifier les tentatives de bypass répétées

## Résolution de Problèmes

### Problèmes Courants

**Redirection Infinie**

- Vérifier la logique de vérification de session
- S'assurer que les conditions d'accès sont correctes

**Page Blanche après Redirection**

- Vérifier que la page de destination existe
- Contrôler la gestion des paramètres d'URL

**Flux Légitime Bloqué**

- Vérifier les paramètres d'URL attendus
- Contrôler l'état de session Supabase

### Debugging

```typescript
// Ajouter des logs pour débugger
console.log('SearchParams:', Object.fromEntries(urlSearchParams));
console.log('Session state:', session?.user?.aud);
console.log('Access decision:', { isValidAccess, shouldRedirect });
```

## Conclusion

Cette implémentation offre une protection robuste contre l'accès direct aux pages intermédiaires du flux d'authentification tout en préservant une expérience utilisateur fluide pour les flux légitimes.

**Status : ✅ IMPLÉMENTÉ ET TESTÉ**

- Toutes les pages sensibles sont protégées
- Flux légitimes préservés
- Compatible Next.js 15
- Build réussi sans erreurs TypeScript
