# Configuration Supabase Auth - OTP 5 Minutes

Guide de configuration pour définir la durée des OTP à 5 minutes dans Supabase.

## 🎯 Objectif

Configurer les OTP (One-Time Passwords) pour expirer après **5 minutes** au lieu de la durée par défaut plus longue, améliorant ainsi la sécurité.

## 🔧 Méthodes de Configuration

### Method 1: Supabase Cloud Dashboard (Recommandé)

**Pour les projets Supabase Cloud hébergés** :

1. **Accéder au Dashboard**
   ```
   https://app.supabase.com/project/muulrpefgswatkiaqgxu/settings/auth
   ```

2. **Naviguer vers Auth Settings**
   - Sidebar : "Authentication" → "Settings"
   - Section : "Email Auth" ou "Phone Auth"

3. **Configurer les Durées**
   - **Email OTP Expiry** : `300` (secondes)
   - **SMS OTP Expiry** : `300` (secondes)
   - **Email Rate Limit** : `300` (secondes entre envois)

4. **Sauvegarder**
   - Cliquer "Save" pour appliquer les changements

### Method 2: Configuration Locale (Self-Hosted)

**Pour les installations self-hosted** :

1. **Fichier de Configuration**
   ```toml
   # supabase/config/auth.toml
   [auth]
   mailer_otp_exp = 300     # Email OTP - 5 minutes
   sms_otp_exp = 300        # SMS OTP - 5 minutes
   smtp_max_frequency = 300 # Rate limit emails - 5 minutes
   jwt_exp = 3600           # JWT expiration - 1 heure (standard)
   ```

2. **Variables d'Environnement**
   ```env
   # .env.local (pour development local)
   MAILER_OTP_EXP=300
   SMS_OTP_EXP=300
   SMTP_MAX_FREQUENCY=300
   ```

3. **Redémarrage Requis**
   ```bash
   supabase stop
   supabase start
   ```

### Method 3: Supabase CLI (Avancé)

**Pour la gestion par CLI** :

1. **Configuration via CLI**
   ```bash
   # Mettre à jour les settings auth
   supabase settings update --auth-otp-exp=300
   ```

2. **Déploiement des Changements**
   ```bash
   # Appliquer les changements
   supabase db push
   ```

## 🛡️ Sécurité et Bonnes Pratiques

### Avantages de 5 Minutes

**Sécurité Renforcée** :
- ✅ **Fenêtre d'attaque réduite** : 5 minutes vs 1 heure par défaut
- ✅ **Protection contre interception** : Code expire rapidement
- ✅ **Conformité sécurité** : Respecte les standards industriels
- ✅ **Réduction du spam** : Moins de codes valides simultanés

**Expérience Utilisateur** :
- ✅ **Sécurité visible** : Utilisateurs voient la sécurité active
- ✅ **Urgence appropriée** : Encourage utilisation immédiate
- ✅ **Pas de frustration** : 5 minutes suffisent largement
- ✅ **Nouvelle demande facile** : Peut redemander un code

### Configuration Recommandée Complète

```toml
# supabase/config/auth.toml
[auth]
# OTP Configuration - 5 minutes
mailer_otp_exp = 300         # Email OTP expiry
sms_otp_exp = 300           # SMS OTP expiry

# Rate Limiting - Sécurité
smtp_max_frequency = 300    # 5 min entre emails
sms_max_frequency = 60      # 1 min entre SMS

# JWT Configuration - Standard
jwt_exp = 3600              # 1 heure (standard)

# Sécurité Additionnelle
enable_confirmations = false # Si confirmation email pas nécessaire
password_min_length = 8     # Minimum 8 caractères
```

## 🧪 Test de Configuration

### Vérification Manuelle

1. **Test Email OTP**
   ```bash
   # 1. Demander OTP
   curl -X POST https://muulrpefgswatkiaqgxu.supabase.co/auth/v1/otp \
        -H "Content-Type: application/json" \
        -d '{"email": "test@example.com"}'
   
   # 2. Attendre 6 minutes
   sleep 360
   
   # 3. Tenter validation (doit échouer)
   curl -X POST https://muulrpefgswatkiaqgxu.supabase.co/auth/v1/verify \
        -H "Content-Type: application/json" \
        -d '{"type": "email", "email": "test@example.com", "token": "123456"}'
   ```

2. **Test dans l'Application**
   ```
   1. Aller sur /auth/forgot-password
   2. Entrer email et envoyer
   3. Noter l'heure d'envoi
   4. Attendre 6 minutes
   5. Essayer le code OTP → Doit être expiré
   ```

### Logs de Vérification

**Dans Supabase Dashboard** :
- Aller à "Logs" → "Auth Logs"
- Chercher les événements `otp_expired`
- Vérifier que l'expiration se fait à 5 minutes

## 📊 Monitoring et Alertes

### Métriques à Surveiller

- **Taux d'expiration OTP** : Doit augmenter avec 5 minutes
- **Demandes multiples** : Utilisateurs demandant nouveaux codes
- **Succès de connexion** : Impact sur conversion
- **Support utilisateur** : Demandes d'aide liées aux OTP

### Alertes Recommandées

```yaml
# Exemple configuration monitoring
alerts:
  - name: "OTP Expiry Rate High"
    condition: "otp_expired_rate > 30%"
    action: "Considérer augmenter à 10 minutes"
  
  - name: "Multiple OTP Requests"
    condition: "otp_requests_per_user > 3/hour"
    action: "Vérifier rate limiting"
```

## 🔄 Rollback Plan

Si 5 minutes s'avère trop court :

### Durées Alternatives

- **10 minutes** : `mailer_otp_exp = 600` (équilibre)
- **15 minutes** : `mailer_otp_exp = 900` (plus confortable)
- **Défaut** : Supprimer la configuration (retour à 1 heure)

### Processus de Rollback

1. **Dashboard Supabase Cloud**
   - Changer la valeur à 600 ou 900 secondes
   - Sauvegarder immédiatement

2. **Self-Hosted**
   ```bash
   # Modifier auth.toml
   mailer_otp_exp = 600  # 10 minutes
   
   # Redémarrer
   supabase restart
   ```

## 📈 Résultats Attendus

Après configuration à 5 minutes :

- **✅ Sécurité** : Réduction significative de la fenêtre d'attaque
- **✅ Conformité** : Respect des bonnes pratiques industrielles
- **✅ Performance** : Pas d'impact sur la performance système
- **✅ UX** : Expérience utilisateur maintenue ou améliorée

**Métriques de Succès** :
- Taux d'expiration OTP : 15-25% (acceptable)
- Temps moyen utilisation : < 2 minutes (optimal)
- Demandes de support : Pas d'augmentation significative
- Sécurité : Aucune tentative d'attaque prolongée réussie