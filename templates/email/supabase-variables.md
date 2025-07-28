# Variables Supabase pour Templates d'Email

Ce fichier documente les variables disponibles dans les templates d'email Supabase.

## 🔗 Variables Système Supabase

### Variables OTP Standard
```
{{ .Token }}                    // Code OTP à 6 chiffres (ex: 123456)
{{ .Email }}                    // Email de l'utilisateur
{{ .ConfirmationURL }}          // URL de confirmation avec token
{{ .RedirectTo }}               // URL de redirection après confirmation
```

### Variables de Site
```
{{ .SiteName }}                 // Nom du site (configurable)
{{ .SiteURL }}                  // URL principale du site
{{ .SupportEmail }}             // Email de support (configurable)
```

### Variables Utilisateur
```
{{ .UserID }}                   // ID unique de l'utilisateur
{{ .UserMetaData }}             // Métadonnées utilisateur
{{ .UserMetaData.full_name }}   // Nom complet si disponible
{{ .UserMetaData.avatar_url }}  // Avatar si disponible
```

### Variables de Sécurité
```
{{ .TokenHash }}                // Hash du token pour tracking
{{ .ExpiresAt }}                // Date d'expiration du token
{{ .IPAddress }}                // Adresse IP de la demande
{{ .UserAgent }}                // User agent du navigateur
```

### Variables de Localisation
```
{{ .Locale }}                   // Locale détectée (fr, en, es)
{{ .TimeZone }}                 // Fuseau horaire de l'utilisateur
{{ .Country }}                  // Pays détecté
```

## ⚙️ Configuration des Variables

### Dans Supabase Dashboard

1. **Site Settings** (`Settings > General`):
   ```
   Site Name: "Njillu App"
   Site URL: "https://njillu-app.vercel.app"
   ```

2. **Auth Settings** (`Settings > Authentication`):
   ```
   Site URL: "https://njillu-app.vercel.app"
   Additional Redirect URLs: 
   - https://njillu-app.vercel.app/auth/callback
   ```

3. **Email Settings** (`Settings > Authentication > Email`):
   ```
   Support Email: "support@njillu-app.com"
   From Email: "noreply@njillu-app.com"
   ```

### Variables d'Environnement (Self-Hosted)

```env
# .env.local
SUPABASE_SITE_NAME="Njillu App"
SUPABASE_SITE_URL="https://njillu-app.vercel.app"
SUPABASE_SUPPORT_EMAIL="support@njillu-app.com"
SUPABASE_FROM_EMAIL="noreply@njillu-app.com"
```

### Configuration API

```javascript
// Configuration des variables du site
const { data, error } = await supabase.auth.admin.updateSettings({
  site_name: "Njillu App",
  site_url: "https://njillu-app.vercel.app",
  support_email: "support@njillu-app.com",
  mailer_from_email: "noreply@njillu-app.com",
  mailer_from_name: "Njillu App"
});
```

## 🎨 Exemples d'Usage dans Templates

### Personnalisation Basique
```html
<!-- Header personnalisé -->
<h1>Bienvenue sur {{ .SiteName }} !</h1>
<p>Votre code d'accès : <strong>{{ .Token }}</strong></p>

<!-- Lien de retour -->
<a href="{{ .SiteURL }}">Retour au site</a>
```

### Informations de Sécurité
```html
<!-- Détails de sécurité -->
<div class="security-info">
    <p>Demande effectuée depuis : {{ .IPAddress }}</p>
    <p>Navigateur : {{ .UserAgent }}</p>
    <p>Expire le : {{ .ExpiresAt }}</p>
</div>
```

### Support Multilingue
```html
<!-- Contenu conditionnel par langue -->
{{#if (eq .Locale "fr")}}
    <h1>🎉 Bienvenue !</h1>
    <p>Votre code : {{ .Token }}</p>
{{else if (eq .Locale "en")}}
    <h1>🎉 Welcome!</h1>
    <p>Your code: {{ .Token }}</p>
{{else if (eq .Locale "es")}}
    <h1>🎉 ¡Bienvenido!</h1>
    <p>Tu código: {{ .Token }}</p>
{{else}}
    <h1>🎉 Welcome!</h1>
    <p>Your code: {{ .Token }}</p>
{{/if}}
```

### Personnalisation Utilisateur
```html
<!-- Salutation personnalisée -->
{{#if .UserMetaData.full_name}}
    <h2>Bonjour {{ .UserMetaData.full_name }} !</h2>
{{else}}
    <h2>Bonjour !</h2>
{{/if}}

<!-- Avatar utilisateur -->
{{#if .UserMetaData.avatar_url}}
    <img src="{{ .UserMetaData.avatar_url }}" alt="Avatar" style="width: 50px; height: 50px; border-radius: 50%;">
{{/if}}
```

## 🛠️ Fonctions Helper Disponibles

### Fonctions de Date
```html
{{ formatDate .ExpiresAt "15:04" }}          // Format heure
{{ formatDate .ExpiresAt "02/01/2006" }}     // Format date
{{ timeUntil .ExpiresAt }}                   // Temps restant
```

### Fonctions de Texte
```html
{{ upper .SiteName }}                        // MAJUSCULES
{{ lower .Email }}                           // minuscules
{{ title .UserMetaData.full_name }}          // Title Case
```

### Fonctions Conditionnelles
```html
{{#if .UserMetaData}}
    <!-- Contenu si métadonnées présentes -->
{{/if}}

{{#unless .UserMetaData.full_name}}
    <!-- Contenu si nom absent -->
{{/unless}}
```

## 🔍 Test des Variables

### Script de Test Local

```javascript
// test-variables.js
const testVariables = {
  Token: "123456",
  Email: "test@example.com",
  SiteName: "Njillu App",
  SiteURL: "https://njillu-app.vercel.app",
  SupportEmail: "support@njillu-app.com",
  ConfirmationURL: "https://njillu-app.vercel.app/auth/confirm?token=abc123",
  UserMetaData: {
    full_name: "Jean Dupont",
    avatar_url: "https://example.com/avatar.jpg"
  },
  Locale: "fr",
  ExpiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString()
};

console.log("Variables de test:", testVariables);
```

### Rendu de Test

1. **Installer Handlebars** (pour test local):
   ```bash
   npm install handlebars
   ```

2. **Script de rendu**:
   ```javascript
   const Handlebars = require('handlebars');
   const fs = require('fs');
   
   const template = fs.readFileSync('./templates/email/signup-otp.html', 'utf8');
   const compiled = Handlebars.compile(template);
   const result = compiled(testVariables);
   
   fs.writeFileSync('./test-output.html', result);
   ```

## 📊 Variables Analytics

### Tracking des Emails
```html
<!-- Pixel de tracking -->
<img src="{{ .SiteURL }}/track/email-open?user={{ .UserID }}&template=signup-otp&token={{ .TokenHash }}" 
     width="1" height="1" style="display: none;">
```

### UTM Parameters
```html
<!-- Liens avec tracking -->
<a href="{{ .ConfirmationURL }}&utm_source=email&utm_medium=signup-otp&utm_campaign=registration">
    Confirmer mon inscription
</a>
```

## 🔒 Sécurité des Variables

### Variables Sécurisées
- ✅ `{{ .Token }}` - Sécurisé, expire automatiquement
- ✅ `{{ .TokenHash }}` - Hash sécurisé pour tracking
- ✅ `{{ .ConfirmationURL }}` - URL signée et sécurisée

### Variables à Éviter en Production
- ❌ `{{ .UserID }}` dans les URLs publiques
- ❌ `{{ .IPAddress }}` dans le contenu visible
- ❌ `{{ .UserAgent }}` dans le contenu visible

### Bonnes Pratiques
1. **Toujours valider** les variables avant usage
2. **Échapper les contenus** utilisateur dans HTML
3. **Utiliser HTTPS** pour toutes les URLs
4. **Limiter l'exposition** des données sensibles

**Status** : 📧 **TEMPLATES EMAIL COMPLETS** - Prêts pour configuration Supabase !