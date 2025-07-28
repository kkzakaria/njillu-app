# Configuration Supabase pour OTP Numérique

## Problème Confirmé par la Documentation Officielle

**Confirmation**: La documentation officielle confirme que `signInWithOtp()` envoie **TOUJOURS des magic links par défaut**.

**Différences Clés** :
- **Magic Link** : `verifyOtp({ token_hash, type: 'email' })` 
- **Code OTP** : `verifyOtp({ email, token: '123456', type: 'email' })`

Pour recevoir des **codes numériques** au lieu de magic links, la seule solution est de modifier le **template email** dans Supabase Dashboard.

## Solution Officielle

### Étape 1: Modifier le Template Email dans Supabase Dashboard

⚠️ **CRITICAL** : C'est la **SEULE** solution pour recevoir des codes numériques !

1. **Aller dans le Dashboard Supabase**
   - Project → Authentication → Email Templates

2. **Modifier le Template "Magic Link"** ✅ **CONFIRMÉ PAR TEST**
   - Sélectionner "Magic Link" template (PAS "Reset Password")
   - **Remplacer complètement** le contenu par le template OTP :

```html
<h2>Code de vérification</h2>
<p>Votre code de vérification est :</p>
<h1 style="font-size: 32px; font-weight: bold; text-align: center; padding: 20px; background: #f0f0f0; border-radius: 8px;">{{ .Token }}</h1>
<p>⚠️ Ce code expire dans <strong>5 minutes</strong> pour votre sécurité.</p>
<p>Si vous n'avez pas demandé ce code, ignorez cet email.</p>
```

3. **Variables Clés** :
   - `{{ .Token }}` → Code numérique (ex: 123456)
   - `{{ .TokenHash }}` → Hash pour magic link (à éviter)
   - `{{ .ConfirmationURL }}` → URL complète (à éviter)

### Étape 2: Configuration du Code (Inchangé)

Le code reste identique car `signInWithOtp()` est la bonne méthode :

```typescript
// Pour envoyer l'OTP
const { error } = await supabase.auth.signInWithOtp({
  email: email,
  options: {
    shouldCreateUser: false,
    emailRedirectTo: undefined // Pas de redirection
  }
});

// Pour vérifier l'OTP
const { error } = await supabase.auth.verifyOtp({
  email,
  token: otp,
  type: 'email' // Type important pour les OTP email
});
```

### Étape 3: Vérification du Bon Template

**Template CORRECT pour OTP** :
```html
<h2>One time login code</h2>
<p>Please enter this code: {{ .Token }}</p>
```

**Template INCORRECT (Magic Link)** :
```html
<h2>Magic Link</h2>
<p>Follow this link to login:</p>
<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Log In</a></p>
```

## Pourquoi Cette Solution Fonctionne

Selon la documentation Supabase :
1. **`signInWithOtp()`** peut envoyer soit des magic links soit des codes OTP
2. **Le template email détermine le format** : `{{ .Token }}` = code numérique, `{{ .TokenHash }}` = magic link
3. **La vérification** se fait toujours avec `verifyOtp()` et `type: 'email'`

## 📝 Template Français Optimisé

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Code de vérification</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; padding: 20px; background-color: #f8f9fa; border-radius: 10px;">
        <h1 style="color: #333; margin-bottom: 20px;">🔒 Code de Vérification</h1>
        <p style="color: #666; font-size: 16px; margin-bottom: 30px;">
            Entrez ce code dans l'application pour continuer :
        </p>
        <div style="background: #fff; border: 2px dashed #007bff; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h2 style="font-size: 36px; font-weight: bold; color: #007bff; margin: 0; letter-spacing: 8px;">
                {{ .Token }}
            </h2>
        </div>
        <p style="color: #888; font-size: 14px; margin-top: 30px;">
            ⚠️ Ce code expire dans <strong>5 minutes</strong> pour votre sécurité<br>
            Si vous n'avez pas demandé ce code, ignorez cet email.
        </p>
    </div>
</body>
</html>
```

## Test de Configuration

1. **Modifier le template "Magic Link"** dans Email Templates
2. **Configurer l'expiration** : Auth > Providers > Email > `Email OTP Expiration = 300`
3. **Tester l'envoi** depuis votre application forgot-password
4. **Vérifier l'email** : code à 6 chiffres qui expire en 5 minutes
5. **Saisir le code** dans votre interface OTP

## Vérification Template Actuel

**Avant modification** - Template Magic Link par défaut :
```html
<h2>Magic Link</h2>
<p>Follow this link to login:</p>
<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Log In</a></p>
```

**Après modification** - Template OTP Code :
```html
<h2>Code de vérification</h2>
<p>Votre code de vérification est :</p>
<h1 style="font-size: 32px; font-weight: bold; text-align: center; padding: 20px; background: #f0f0f0; border-radius: 8px;">{{ .Token }}</h1>
<p>⚠️ Ce code expire dans <strong>5 minutes</strong> pour votre sécurité.</p>
```

## Dépannage

- **❌ Magic link encore reçu** : Template "Magic Link" pas encore modifié
- **❌ Template non sauvegardé** : Cliquer "Save" dans Email Templates
- **❌ Code expire trop vite/lentement** : Vérifier `Email OTP Expiration` dans Auth > Providers > Email
- **❌ Erreur de vérification** : Vérifier `type: 'email'` dans `verifyOtp()`
- **❌ Email non reçu** : Vérifier spam/logs Supabase
- **✅ Code numérique reçu + expire en 5 min** : Configuration parfaite ! 🎯

## ✅ Confirmation par Test Utilisateur

**Test Confirmé** : C'est bien le template **"Magic Link"** qui est utilisé par `signInWithOtp()`, même dans un contexte de reset password.

## 🔧 Configuration de l'Expiration - DÉCOUVERTE IMPORTANTE !

✅ **TROUVÉ** : L'expiration OTP est configurable dans Supabase Dashboard !

### Étape Supplémentaire : Configurer l'Expiration OTP

1. **Dashboard Supabase** → **Auth** → **Providers** → **Email**
2. **Paramètre** : `Email OTP Expiration`
3. **Valeur par défaut** : `3600s` (1 heure)
4. **Recommandation sécurité** : `300s` (5 minutes)

```
Auth > Providers > Email > Email OTP Expiration = 300
```

### 🔒 Configuration Sécurisée Recommandée

- **Template Email** : "Ce code expire dans **5 minutes**"
- **Dashboard Config** : `Email OTP Expiration = 300s`
- **Cohérence** : Message et expiration technique alignés !