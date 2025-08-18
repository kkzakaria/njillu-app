# Guide d'utilisation des hooks de traduction pour les clients

## Vue d'ensemble

Le système de traduction pour la gestion des clients fournit des hooks spécialisés pour différentes sections de l'interface utilisateur. Cela permet une meilleure organisation et une meilleure performance en chargeant uniquement les traductions nécessaires.

## Hooks disponibles

### Hook principal
```typescript
import { useClients } from '@/hooks/useTranslation';

const t = useClients();
// Accès à toutes les traductions clients : t('actions.create'), t('form.required'), etc.
```

### Hooks spécialisés
```typescript
import { 
  useClientActions,
  useClientForm,
  useClientTable,
  useClientSearch,
  useClientFilters,
  useClientNotifications,
  useClientErrors,
  useClientConfirmations,
  useClientImport,
  useClientExport,
  useClientStatistics
} from '@/hooks/useTranslation';
```

## Exemples d'utilisation

### 1. Actions sur les clients
```typescript
'use client';
import { useClientActions } from '@/hooks/useTranslation';

export function ClientActionButtons({ client }) {
  const tActions = useClientActions();
  
  return (
    <div>
      <button>{tActions('create')}</button>
      <button>{tActions('edit')}</button>
      <button>{tActions('delete')}</button>
      <button>{tActions('archive')}</button>
    </div>
  );
}
```

### 2. Formulaire de client
```typescript
'use client';
import { useClientForm } from '@/hooks/useTranslation';

export function ClientForm() {
  const tForm = useClientForm();
  
  return (
    <form>
      <h1>{tForm('create_title')}</h1>
      <label>
        {tForm('personal_info')}
        <span className="required">{tForm('required')}</span>
      </label>
      <input type="email" placeholder={tForm('invalid_email')} />
    </form>
  );
}
```

### 3. Tableau des clients
```typescript
'use client';
import { useClientTable } from '@/hooks/useTranslation';

export function ClientTable({ clients }) {
  const tTable = useClientTable();
  
  return (
    <table>
      <thead>
        <tr>
          <th>{tTable('columns.name')}</th>
          <th>{tTable('columns.type')}</th>
          <th>{tTable('columns.email')}</th>
          <th>{tTable('columns.status')}</th>
          <th>{tTable('columns.actions')}</th>
        </tr>
      </thead>
      <tbody>
        {clients.map(client => (
          <tr key={client.id}>
            {/* Contenu du tableau */}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### 4. Recherche et filtres
```typescript
'use client';
import { useClientSearch, useClientFilters } from '@/hooks/useTranslation';

export function ClientSearchAndFilters() {
  const tSearch = useClientSearch();
  const tFilters = useClientFilters();
  
  return (
    <div>
      <input 
        type="search" 
        placeholder={tSearch('placeholder')}
      />
      <div>
        <label>{tFilters('type')}</label>
        <label>{tFilters('status')}</label>
        <label>{tFilters('country')}</label>
        <button>{tSearch('clear_filters')}</button>
      </div>
    </div>
  );
}
```

### 5. Notifications
```typescript
'use client';
import { useClientNotifications } from '@/hooks/useTranslation';
import { toast } from 'sonner';

export function useClientOperations() {
  const tNotifications = useClientNotifications();
  
  const createClient = async (data) => {
    try {
      // Logique de création
      toast.success(tNotifications('created'));
    } catch (error) {
      toast.error(tNotifications('error'));
    }
  };

  const deleteClient = async (id) => {
    // Logique de suppression
    toast.success(tNotifications('deleted'));
  };

  return { createClient, deleteClient };
}
```

### 6. Gestion des erreurs
```typescript
'use client';
import { useClientErrors } from '@/hooks/useTranslation';

export function ClientErrorHandler({ error }) {
  const tErrors = useClientErrors();
  
  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'NOT_FOUND':
        return tErrors('not_found');
      case 'EMAIL_EXISTS':
        return tErrors('email_exists');
      case 'INSUFFICIENT_PERMISSIONS':
        return tErrors('insufficient_permissions');
      default:
        return tErrors('server_error');
    }
  };

  return <div className="error">{getErrorMessage(error.code)}</div>;
}
```

### 7. Confirmations
```typescript
'use client';
import { useClientConfirmations } from '@/hooks/useTranslation';

export function DeleteClientDialog({ client, onConfirm }) {
  const tConfirmations = useClientConfirmations();
  
  return (
    <div>
      <h3>{tConfirmations('delete')}</h3>
      <p>{tConfirmations('delete_description')}</p>
      <button onClick={onConfirm}>
        {tConfirmations('delete')}
      </button>
    </div>
  );
}
```

### 8. Import/Export
```typescript
'use client';
import { useClientImport, useClientExport } from '@/hooks/useTranslation';

export function ClientImportExport() {
  const tImport = useClientImport();
  const tExport = useClientExport();
  
  return (
    <div>
      <section>
        <h2>{tImport('title')}</h2>
        <p>{tImport('description')}</p>
        <p>{tImport('formats')}</p>
        <div>{tImport('drop_zone')}</div>
      </section>
      
      <section>
        <h2>{tExport('title')}</h2>
        <p>{tExport('description')}</p>
        <label>
          <input type="checkbox" />
          {tExport('include_contacts')}
        </label>
      </section>
    </div>
  );
}
```

### 9. Statistiques
```typescript
'use client';
import { useClientStatistics } from '@/hooks/useTranslation';

export function ClientStats({ stats }) {
  const tStats = useClientStatistics();
  
  return (
    <div className="stats-grid">
      <div>
        <h3>{tStats('total')}</h3>
        <p>{stats.total}</p>
      </div>
      <div>
        <h3>{tStats('active')}</h3>
        <p>{stats.active}</p>
      </div>
      <div>
        <h3>{tStats('individuals')}</h3>
        <p>{stats.individuals}</p>
      </div>
      <div>
        <h3>{tStats('businesses')}</h3>
        <p>{stats.businesses}</p>
      </div>
    </div>
  );
}
```

## Avantages des hooks spécialisés

1. **Performance** : Charge uniquement les traductions nécessaires pour chaque composant
2. **Organisation** : Structure claire et logique des traductions
3. **Maintenance** : Plus facile de maintenir et mettre à jour
4. **Type Safety** : Meilleure suggestion d'autocomplétion avec TypeScript
5. **Réutilisabilité** : Hooks réutilisables dans différents composants

## Structure des traductions

Les traductions sont organisées dans `i18n/messages/[locale]/clients.json` :

```json
{
  "actions": { ... },
  "form": { ... },
  "table": { ... },
  "search": { ... },
  "filters": { ... },
  "notifications": { ... },
  "errors": { ... },
  "confirmations": { ... },
  "import": { ... },
  "export": { ... },
  "statistics": { ... }
}
```

Cette structure permet aux hooks spécialisés d'accéder directement à leur section respective.