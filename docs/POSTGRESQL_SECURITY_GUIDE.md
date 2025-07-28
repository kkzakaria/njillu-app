# Guide de Sécurité PostgreSQL pour Supabase

## ⚠️ Avertissement Important : Search Path Mutable

### Le Problème

Lorsque vous créez des fonctions PostgreSQL sans spécifier explicitement le `search_path`, vous exposez votre base de données à des vulnérabilités de sécurité potentielles :

```sql
-- ❌ MAUVAISE PRATIQUE - Search path mutable
CREATE OR REPLACE FUNCTION my_function()
RETURNS TRIGGER AS $$
BEGIN
    -- Le code ici peut être trompé pour utiliser des objets malveillants
    -- si quelqu'un modifie le search_path
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### La Solution

Toujours définir un `search_path` immutable pour vos fonctions :

```sql
-- ✅ BONNE PRATIQUE - Search path fixe et sécurisé
CREATE OR REPLACE FUNCTION my_function()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public  -- Définit explicitement où chercher les objets
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## 📋 Checklist de Sécurité pour les Fonctions

### 1. **Toujours définir `SET search_path`**

```sql
-- Pour une fonction utilisant uniquement le schéma public
SET search_path = public

-- Pour une fonction nécessitant plusieurs schémas
SET search_path = public, auth

-- Pour une fonction système très restrictive
SET search_path = ''  -- Aucun schéma, tout doit être qualifié
```

### 2. **Utiliser `SECURITY DEFINER` avec précaution**

```sql
-- SECURITY DEFINER exécute la fonction avec les privilèges du propriétaire
CREATE OR REPLACE FUNCTION sensitive_function()
RETURNS void
SECURITY DEFINER        -- ⚠️ Attention : privilèges élevés
SET search_path = public -- ✅ Obligatoire avec SECURITY DEFINER
AS $$
BEGIN
    -- Code avec privilèges élevés
END;
$$ LANGUAGE plpgsql;
```

### 3. **Qualifier complètement les objets dans les fonctions critiques**

```sql
CREATE OR REPLACE FUNCTION critical_function()
RETURNS void
SECURITY DEFINER
SET search_path = ''  -- Aucun search path
AS $$
BEGIN
    -- Tout est explicitement qualifié
    UPDATE public.users 
    SET updated_at = public.now()  -- Même les fonctions système !
    WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql;
```

## 🛡️ Patterns de Sécurité Recommandés

### Pattern 1 : Trigger de mise à jour

```sql
-- Trigger pour updated_at sécurisé
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Pattern 2 : Fonction avec accès multi-schémas

```sql
-- Fonction accédant à auth et public
CREATE OR REPLACE FUNCTION handle_user_creation()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    INSERT INTO public.users (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Pattern 3 : Fonction de vérification de permissions

```sql
-- Fonction de vérification sans search path
CREATE OR REPLACE FUNCTION check_user_permission(
    user_id uuid,
    permission text
)
RETURNS boolean
SECURITY INVOKER  -- Utilise les privilèges de l'appelant
SET search_path = ''  -- Tout doit être qualifié
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.user_permissions 
        WHERE public.user_permissions.user_id = $1
        AND public.user_permissions.permission = $2
    );
END;
$$ LANGUAGE plpgsql;
```

## 🚨 Erreurs Courantes à Éviter

### ❌ Erreur 1 : Oublier le search_path

```sql
-- DANGEREUX
CREATE FUNCTION my_func() RETURNS void AS $$
BEGIN
    -- Vulnérable aux attaques par manipulation du search_path
END;
$$ LANGUAGE plpgsql;
```

### ❌ Erreur 2 : Search_path trop permissif

```sql
-- ÉVITER
SET search_path = public, extensions, "$user"  -- Trop de schémas
```

### ❌ Erreur 3 : SECURITY DEFINER sans search_path

```sql
-- TRÈS DANGEREUX
CREATE FUNCTION admin_func() 
RETURNS void 
SECURITY DEFINER  -- Privilèges élevés
-- MANQUE: SET search_path = ...
AS $$ ... $$;
```

## 📝 Template de Migration Sécurisée

```sql
-- Migration: create_secure_functions
-- Description: Créer des fonctions avec search_path sécurisé
-- Date: YYYY-MM-DD

-- ============================================================================
-- Fonction 1 : Trigger standard
-- ============================================================================
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION trigger_set_timestamp() IS 
    'Met à jour le timestamp avec search_path sécurisé';

-- ============================================================================
-- Fonction 2 : Logique métier
-- ============================================================================
CREATE OR REPLACE FUNCTION calculate_user_stats(user_id uuid)
RETURNS jsonb
SECURITY INVOKER  -- Privilèges de l'appelant
SET search_path = public
AS $$
DECLARE
    stats jsonb;
BEGIN
    SELECT jsonb_build_object(
        'total_documents', COUNT(*),
        'last_activity', MAX(created_at)
    ) INTO stats
    FROM documents
    WHERE owner_id = user_id;
    
    RETURN stats;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Fonction 3 : Administration (haute sécurité)
-- ============================================================================
CREATE OR REPLACE FUNCTION admin_delete_user(target_user_id uuid)
RETURNS void
SECURITY DEFINER
SET search_path = ''  -- Aucun search path, tout qualifié
AS $$
BEGIN
    -- Vérifications de sécurité
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Non authentifié';
    END IF;
    
    -- Suppression avec qualification complète
    DELETE FROM public.user_data WHERE user_id = target_user_id;
    DELETE FROM auth.users WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql;
```

## 🔍 Comment Détecter les Problèmes

### Requête pour trouver les fonctions sans search_path fixe :

```sql
-- Lister toutes les fonctions avec search_path mutable
SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
AND p.prosecdef = true  -- SECURITY DEFINER
AND NOT p.proconfig @> ARRAY['search_path=public']
AND NOT p.proconfig @> ARRAY['search_path=""']
ORDER BY n.nspname, p.proname;
```

### Vérifier dans Supabase Dashboard :

1. Aller dans "Database" → "Functions"
2. Chercher les avertissements : "Function has a role mutable search_path"
3. Corriger chaque fonction identifiée

## 📚 Ressources et Références

- [PostgreSQL Security Documentation](https://www.postgresql.org/docs/current/sql-createfunction.html#SQL-CREATEFUNCTION-SECURITY)
- [OWASP Database Security](https://owasp.org/www-project-database-security/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/database/security)

## 🎯 Règle d'Or

> **"Si votre fonction utilise `SECURITY DEFINER`, elle DOIT avoir `SET search_path`"**

Cette règle simple vous évitera 99% des problèmes de sécurité liés aux fonctions PostgreSQL.