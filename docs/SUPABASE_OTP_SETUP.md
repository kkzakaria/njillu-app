# Configuration Supabase pour OTP Numérique

## Problème
Par défaut, Supabase envoie des magic links même quand on utilise `signInWithOtp()`. Pour recevoir des codes OTP numériques (6 chiffres) par email, une configuration spéciale est nécessaire.

## Solution

### Option 1: Configuration Dashboard Supabase (Recommandée)

1. **Aller dans le Dashboard Supabase**
   - Project → Authentication → Settings

2. **Désactiver les Magic Links**
   - Auth → Settings → Magic Link
   - Décocher "Enable Magic Links"

3. **Activer les OTP par Email**
   - Auth → Settings → OTP
   - Cocher "Enable OTP via Email"
   - Configurer la durée de validité (par défaut 1 heure)

### Option 2: Configuration par Code (Alternative)

Si vous ne pouvez pas modifier la configuration Supabase, utilisez cette approche :

```typescript
// Pour envoyer l'OTP
const { error } = await supabase.auth.signInWithOtp({
  email: email,
  options: {
    shouldCreateUser: false,
    // Ne pas spécifier emailRedirectTo pour forcer l'OTP numérique
    emailRedirectTo: undefined
  }
});

// Pour vérifier l'OTP
const { error } = await supabase.auth.verifyOtp({
  email,
  token: otp,
  type: 'email' // Type important pour les OTP email
});
```

## Configuration Email Template

Pour personnaliser l'email OTP, aller dans :
- Auth → Templates → Magic Link
- Remplacer par un template OTP numérique

Exemple de template :
```html
<h2>Code de vérification</h2>
<p>Votre code de vérification est :</p>
<h1>{{ .Token }}</h1>
<p>Ce code expire dans 1 heure.</p>
```

## Test de Configuration

1. Tester l'envoi d'OTP depuis l'application
2. Vérifier que l'email contient un code numérique (pas un lien)
3. Tester la vérification du code dans l'interface OTP

## Dépannage

- **Magic link reçu au lieu d'OTP** : Vérifier la configuration Auth → OTP
- **Erreur de vérification** : S'assurer que le type est 'email' et non 'recovery'
- **Email non reçu** : Vérifier les templates et la configuration SMTP