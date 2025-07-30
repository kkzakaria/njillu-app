# Guide de Configuration Email Templates - TypeScript

Guide complet pour configurer les templates d'email d'inscription OTP avec TypeScript.

## 🚀 Quick Start

### 1. Configuration Automatique

```bash
# Générer la configuration Supabase
pnpm setup:email-templates

# Tester l'envoi d'emails (optionnel)
pnpm test:email-templates
```

### 2. Configuration Manuelle Supabase Cloud

1. **Accéder au Dashboard**
   ```
   https://app.supabase.com/project/muulrpefgswatkiaqgxu/settings/auth
   ```

2. **Naviguer vers "Email Templates"**
   - Section "Magic Link / OTP"
   - Template type: "Sign up"

3. **Configurer le Template**
   - **Subject**: `🔐 Votre code d'inscription - {{ .SiteName }}`
   - **HTML Content**: Copier depuis `templates/email/signup-otp.html`

## 📁 Structure des Fichiers

```
templates/email/
├── signup-otp.html              # Template français (principal)
├── signup-otp.txt               # Version texte (fallback)
├── en/signup-otp.html           # Template anglais
├── es/signup-otp.html           # Template espagnol
└── supabase-variables.md        # Documentation variables

scripts/
├── setup-email-templates.ts     # Script de configuration TypeScript
└── test-templates.ts            # Script de test TypeScript

docs/
├── EMAIL_TEMPLATES.md           # Documentation complète
└── EMAIL_SETUP_GUIDE.md         # Ce guide
```

## 🎨 Templates Disponibles

### Variables Supabase Utilisées

**Obligatoires** :
- `{{ .Token }}` - Code OTP à 6 chiffres
- `{{ .SiteName }}` - Nom du site
- `{{ .ConfirmationURL }}` - URL de confirmation
- `{{ .SupportEmail }}` - Email de support
- `{{ .SiteURL }}` - URL principale

**Recommandées** (non utilisées actuellement) :
- `{{ .Email }}` - Email de l'utilisateur
- `{{ .UserMetaData }}` - Métadonnées utilisateur
- `{{ .ExpiresAt }}` - Date d'expiration

### Design Features

✅ **Design responsive** - Mobile et desktop
✅ **Gradient moderne** - Violet/Indigo professionnel
✅ **Code OTP stylisé** - Police monospace, bien visible
✅ **Messages de sécurité** - Expiration 5min, info sécurité
✅ **Support multilingue** - FR/EN/ES
✅ **Accessibilité** - Contraste, taille police
✅ **Compatibility** - Tous clients email

## 🛠️ Scripts TypeScript

### Configuration Script

**Fichier**: `scripts/setup-email-templates.ts`

**Fonctionnalités** :
- ✅ Validation des templates avec types
- ✅ Génération configuration Supabase CLI
- ✅ Instructions Dashboard Supabase
- ✅ Snippets TypeScript avec types
- ✅ Vérification variables Supabase
- ✅ Gestion d'erreurs typée

**Usage** :
```bash
pnpm setup:email-templates

# Ou directement
npx tsx scripts/setup-email-templates.ts
```

### Test Script

**Fichier**: `scripts/test-templates.ts`

**Fonctionnalités** :
- ✅ Tests multilingues (FR/EN/ES)
- ✅ Vérifications préliminaires
- ✅ Tests avec métadonnées utilisateur
- ✅ Gestion du rate limiting
- ✅ Métriques de performance
- ✅ Types Supabase complets

**Usage** :
```bash
pnpm test:email-templates

# Ou directement
npx tsx scripts/test-templates.ts
```

## 🧪 Tests Automatisés

### Suites de Tests

**1. Tests Basiques** :
- Email valide avec métadonnées
- Email international (Unicode)
- Email minimal sans métadonnées

**2. Tests Multilingues** :
- Template français (locale: fr)
- Template anglais (locale: en)
- Template espagnol (locale: es)

### Vérifications Préliminaires

- ✅ Validation des templates
- ✅ Variables d'environnement
- ✅ Connexion Supabase
- ✅ Variables Supabase requises

### Exemple de Test

```typescript
import { testSignupOTP } from './scripts/test-templates';

// Test avec utilisateur français
await testSignupOTP(supabase, {
  email: "test@example.com",
  metadata: {
    full_name: "Jean Dupont",
    locale: "fr"
  }
});
```

## ⚙️ Configuration Avancée

### Variables d'Environnement

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://muulrpefgswatkiaqgxu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Pour les tests (optionnel)
NODE_ENV=development
```

### Configuration Supabase CLI

**Fichier généré**: `supabase/config/auth.toml`

```toml
# Configuration des templates d'email
[auth.email.template.signup]
subject = "🔐 Votre code d'inscription - {{ .SiteName }}"
content_path = "./templates/email/signup-otp.html"

# Configuration OTP - 5 minutes
[auth]
mailer_otp_exp = 300     # 5 minutes
smtp_max_frequency = 300 # 5 minutes entre emails
jwt_exp = 3600           # 1 heure
enable_signup = true
enable_confirmations = false
```

### Configuration API TypeScript

```typescript
import { createClient } from "@supabase/supabase-js";

interface EmailTemplate {
  subject: string;
  content_html: string;
  content_text?: string;
}

const supabase = createClient(url, serviceKey);

const settings = {
  email_template: {
    signup: {
      subject: "🔐 Votre code d'inscription - {{ .SiteName }}",
      content_html: templateHtml
    } as EmailTemplate
  }
};

const { data, error } = await supabase.auth.admin.updateSettings(settings);
```

## 🔧 Personnalisation

### Modifier les Couleurs

Dans les templates HTML, modifier les variables CSS :

```css
:root {
  --primary-gradient: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  --background-color: #f8fafc;
  --text-primary: #334155;
}
```

### Ajouter un Logo

```html
<div class="header">
    <img src="{{ .SiteURL }}/logo.png" alt="{{ .SiteName }}" 
         style="max-height: 40px; margin-bottom: 20px;">
    <h1>🎉 Bienvenue !</h1>
</div>
```

### Personnaliser les Messages

Modifier directement dans les templates :
- `templates/email/signup-otp.html` (français)
- `templates/email/en/signup-otp.html` (anglais)  
- `templates/email/es/signup-otp.html` (espagnol)

## 📊 Monitoring et Analytics

### Ajouter du Tracking

```html
<!-- Pixel de tracking -->
<img src="{{ .SiteURL }}/track/email-open?template=signup-otp" 
     width="1" height="1" style="display: none;">

<!-- Lien avec UTM -->
<a href="{{ .ConfirmationURL }}&utm_source=email&utm_medium=signup-otp">
    Confirmer
</a>
```

### Métriques Scripts

Les scripts TypeScript fournissent :
- ✅ Temps de réponse API
- ✅ Taux de succès/échec
- ✅ Validation des templates
- ✅ Statistiques détaillées

## 🚨 Dépannage

### Problèmes Courants

**1. Templates non trouvés**
```bash
❌ Template file not found: ./templates/email/signup-otp.html

# Solution
pnpm setup:email-templates  # Vérifier les chemins
```

**2. Variables Supabase manquantes**
```bash
❌ Missing required variables: {{ .Token }}

# Solution
# Vérifier que les variables sont présentes dans le template
```

**3. Erreur de connexion Supabase**
```bash
❌ Connection failed: Invalid API key

# Solution
# Vérifier .env.local avec les bonnes clés
```

**4. Emails non reçus**
- Vérifier les dossiers spam/junk
- Tester avec différents fournisseurs email
- Vérifier la configuration SMTP Supabase

### Debug Mode

```bash
# Activer les logs détaillés
NODE_ENV=development pnpm test:email-templates
```

## 📋 Checklist de Déploiement

### Avant Déploiement

- [ ] Templates validés avec `pnpm setup:email-templates`
- [ ] Tests réussis avec `pnpm test:email-templates`  
- [ ] Configuration Supabase Dashboard appliquée
- [ ] Variables d'environnement correctes en production
- [ ] Tests sur différents clients email

### Post-Déploiement

- [ ] Test d'inscription réelle en production
- [ ] Vérification template email reçu
- [ ] Monitoring des métriques d'email
- [ ] Analytics tracking fonctionnel
- [ ] Support utilisateur informé

## 🎯 Résultats Attendus

Après configuration complète :

- **✅ Emails professionnels** - Design cohérent et moderne
- **✅ Taux d'engagement élevé** - Templates attractifs  
- **✅ Expérience utilisateur optimale** - Responsive, accessible
- **✅ Sécurité visible** - Messages rassurants, expiration claire
- **✅ Support multilingue** - Adaptation culturelle
- **✅ Monitoring complet** - Métriques et analytics

**Status** : 🎯 **PRÊT POUR PRODUCTION** - Templates TypeScript complets avec scripts automatisés !