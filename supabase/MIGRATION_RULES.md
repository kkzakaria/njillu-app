# Règles de Migration Supabase

## 🚨 Règle d'Or

> **"Never modify a migration that has left your machine"**

## ✅ Quand modifier directement

- Migration créée localement et jamais appliquée
- Migration pas encore commitée dans git
- Travail solo et aucun risque de conflit

## ❌ Quand créer une nouvelle migration

- Migration déjà commitée dans git
- Migration appliquée sur staging/production
- Migration partagée avec l'équipe
- Migration appliquée localement + travail en équipe

## 🛠️ Comment procéder

### Nouvelle migration
```bash
./scripts/generate-migration.sh "create_documents_table"
```

### Mise à jour avec suffixe de version
```bash
./scripts/generate-migration.sh "users_roles_schema_v2" --update "users_roles_initial_schema"
```

### Convention de nommage
```bash
# Migration originale
20250726141430_users_roles_initial_schema.sql

# Mises à jour
20250726143000_users_roles_initial_schema_v2.sql
20250726144500_users_roles_initial_schema_v3.sql

# Ou avec description spécifique
20250726143000_users_roles_add_department_field.sql
```

## 🔍 Commandes utiles

```bash
# Vérifier les migrations appliquées
supabase migration list

# Voir les différences
supabase db diff

# Reset local (si pas encore partagée)
supabase db reset

# Appliquer les migrations
supabase migration up
```

## 💡 Bonnes pratiques

1. **Toujours vérifier** le statut avant modification : `supabase migration list`
2. **Tester localement** avec `supabase db reset`
3. **Documenter les changements** dans le header de la migration
4. **Référencer la migration de base** pour les mises à jour
5. **Garder les migrations atomiques** et indépendantes