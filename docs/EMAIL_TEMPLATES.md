# Templates d'Email - Configuration Supabase

Guide de configuration des templates d'email personnalisés pour l'inscription OTP.

## 📧 Templates Créés

### 1. Template HTML (`templates/email/signup-otp.html`)

**Design Moderne** :
- 🎨 Gradient violet/indigo professionnel
- 📱 Responsive design (mobile-first)
- 🔢 Code OTP centré et stylisé
- ⏰ Notifications d'expiration claires
- 🔒 Messages de sécurité intégrés

**Variables Supabase** :
- `{{ .Token }}` - Code OTP à 6 chiffres
- `{{ .ConfirmationURL }}` - URL de confirmation directe
- `{{ .SiteName }}` - Nom du site
- `{{ .SupportEmail }}` - Email de support
- `{{ .SiteURL }}` - URL du site principal

### 2. Template Texte (`templates/email/signup-otp.txt`)

**Version Plain Text** :
- 📄 Compatible avec tous les clients email
- 🎯 Format ASCII clair et lisible
- ⚡ Chargement rapide, accessible
- 🔢 Code OTP bien mis en évidence

## ⚙️ Configuration Supabase

### Method 1: Supabase Cloud Dashboard

1. **Accéder aux Email Templates**
   ```
   https://app.supabase.com/project/muulrpefgswatkiaqgxu/settings/auth
   ```

2. **Section "Email Templates"**
   - Sélectionner "Magic Link / OTP"
   - Choisir "Sign up" template

3. **Configuration HTML**
   ```html
   <!-- copier le contenu de templates/email/signup-otp.html -->
   ```

4. **Configuration Subject**
   ```
   🔐 Votre code d'inscription - {{ .SiteName }}
   ```

### Method 2: Supabase CLI (Self-Hosted)

1. **Fichier de Configuration**
   ```toml
   # supabase/config/auth.toml
   [auth.email.template.signup]
   subject = "🔐 Votre code d'inscription - {{ .SiteName }}"
   content_path = "./templates/email/signup-otp.html"
   ```

2. **Variables d'Environnement**
   ```env
   # .env.local
   SUPABASE_AUTH_EMAIL_SIGNUP_TEMPLATE_PATH=./templates/email/signup-otp.html
   SUPABASE_AUTH_EMAIL_SIGNUP_SUBJECT="🔐 Votre code d'inscription - {{ .SiteName }}"
   ```

### Method 3: Configuration API

```javascript
// Configuration via API Supabase
const { data, error } = await supabase.auth.admin.updateSettings({
  email_template: {
    signup: {
      subject: "🔐 Votre code d'inscription - {{ .SiteName }}",
      content_html: `<!-- HTML template content -->`,
      content_text: `<!-- Text template content -->`
    }
  }
});
```

## 🎨 Personnalisation Design

### Variables CSS Principales

```css
:root {
  --primary-gradient: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  --background-color: #f8fafc;
  --text-primary: #334155;
  --text-secondary: #64748b;
  --border-color: #e2e8f0;
  --success-color: #10b981;
  --warning-color: #f59e0b;
}
```

### Modification des Couleurs

1. **Changer le thème** : Modifier `--primary-gradient`
2. **Ajuster les textes** : Modifier `--text-primary` et `--text-secondary`
3. **Personnaliser les alertes** : Modifier `--success-color` et `--warning-color`

### Logo et Branding

```html
<!-- Ajouter un logo dans le header -->
<div class="header">
    <img src="{{ .SiteURL }}/logo.png" alt="{{ .SiteName }}" style="max-height: 40px; margin-bottom: 20px;">
    <h1>🎉 Bienvenue !</h1>
    <p>Confirmez votre inscription</p>
</div>
```

## 🌐 Support Multilingue

### Templates par Langue

1. **Français** : `templates/email/fr/signup-otp.html`
2. **Anglais** : `templates/email/en/signup-otp.html`
3. **Espagnol** : `templates/email/es/signup-otp.html`

### Configuration Conditionnelle

```html
<!-- Exemple de template multilingue -->
{{#if (eq .Locale "fr")}}
    <h1>🎉 Bienvenue !</h1>
    <p>Confirmez votre inscription</p>
{{else if (eq .Locale "en")}}
    <h1>🎉 Welcome!</h1>
    <p>Confirm your registration</p>
{{else if (eq .Locale "es")}}
    <h1>🎉 ¡Bienvenido!</h1>
    <p>Confirma tu registro</p>
{{/if}}
```

## 🧪 Test des Templates

### Test Local

1. **Serveur de Test**
   ```bash
   # Installer un serveur SMTP local pour test
   npm install -g maildev
   maildev --web 1080 --smtp 1025
   ```

2. **Configuration Test**
   ```env
   # .env.local
   SMTP_HOST=localhost
   SMTP_PORT=1025
   SMTP_USER=test
   SMTP_PASS=test
   ```

3. **Interface Web**
   ```
   http://localhost:1080
   ```

### Test Production

1. **Email de Test**
   ```javascript
   // Envoyer un OTP de test
   const { error } = await supabase.auth.signInWithOtp({
     email: 'test@example.com',
     options: { shouldCreateUser: true }
   });
   ```

2. **Vérification**
   - ✅ Code OTP visible et lisible
   - ✅ Bouton de confirmation fonctionnel
   - ✅ Design responsive sur mobile
   - ✅ Temps d'expiration affiché
   - ✅ Messages de sécurité présents

## 📊 Métriques et Analytics

### Tracking des Emails

```html
<!-- Ajouter des pixels de tracking -->
<img src="{{ .SiteURL }}/track/email-open?user={{ .UserID }}&template=signup-otp" 
     width="1" height="1" style="display: none;">
```

### Liens Trackés

```html
<!-- Tracker les clics sur le bouton -->
<a href="{{ .ConfirmationURL }}?utm_source=email&utm_medium=signup-otp&utm_campaign=registration" 
   class="cta-button">
    Confirmer mon inscription
</a>
```

## 🔧 Maintenance

### Mise à Jour des Templates

1. **Modifier le template local**
2. **Tester avec maildev**
3. **Uploader via Dashboard Supabase**
4. **Tester en production**
5. **Monitorer les métriques**

### Bonnes Pratiques

- ✅ **Always test** sur différents clients email
- ✅ **Version plain text** obligatoire pour compatibilité
- ✅ **Images optimisées** et hébergées de manière fiable
- ✅ **Liens absolus** uniquement
- ✅ **Code OTP visible** même sans CSS
- ✅ **Accessibilité** respectée (contraste, taille de police)

## 📈 Résultats Attendus

Après implémentation des templates personnalisés :

- **✅ Professionnalisme** : Design cohérent avec la marque
- **✅ Taux d'engagement** : Meilleure conversion grâce au design attractif
- **✅ Sécurité visible** : Messages de sécurité rassurent les utilisateurs
- **✅ Mobile-friendly** : Expérience optimale sur tous les appareils
- **✅ Accessibilité** : Compatible avec tous les clients email

**Status** : 🎯 **TEMPLATES PRÊTS** - Ready for Supabase configuration!