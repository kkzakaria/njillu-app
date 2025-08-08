# List-Detail Layout API Documentation

## Overview

This document describes the backend architecture for the responsive list-detail layout system, designed for managing Bills of Lading, Folders, and Container Arrivals in the NJILLU application.

## Architecture Components

### 1. Type System Integration

#### Core Types
- **Location**: `/types/shared/list-detail.ts`
- **Main Entry**: Import from `@/types` for common types
- **Integration**: Fully compatible with existing modular type system

```typescript
import type {
  ListViewResponse,
  DetailViewData,
  ListDetailLayoutConfig,
  ListViewItem
} from '@/types';
```

#### Key Interfaces

**ListViewItem<T>** - Minimal data for list display:
```typescript
interface ListViewItem<T extends EntityType> {
  readonly id: EntityId;
  readonly entityType: T;
  readonly title: string;
  readonly subtitle?: string;
  readonly status: string;
  readonly priority?: 'low' | 'medium' | 'high' | 'urgent';
  readonly updatedAt: Timestamp;
  readonly preview: Partial<EntityTypeMap[T]>;
  readonly badges?: ListItemBadge[];
  readonly actions?: ListItemAction[];
}
```

**DetailViewData<T>** - Complete entity with relationships:
```typescript
interface DetailViewData<T extends EntityType> {
  readonly entity: EntityTypeMap[T];
  readonly related?: DetailViewRelated;
  readonly activities?: DetailViewActivity[];
  readonly metadata: DetailViewMetadata;
}
```

### 2. API Endpoint Design

#### RESTful Routes
```
GET    /api/v1/:entityType              # List with pagination/filtering
GET    /api/v1/:entityType/aggregates   # Aggregated statistics
GET    /api/v1/:entityType/facets       # Filter facets
GET    /api/v1/:entityType/:id          # Detail view
GET    /api/v1/:entityType/:id/activities # Activity history
POST   /api/v1/:entityType/bulk         # Bulk operations
GET    /api/v1/:entityType/search       # Search with suggestions
```

#### Supported Entity Types
- `bill_of_lading` → `bills_of_lading` table
- `folder` → `folders` table  
- `container_arrival_tracking` → `container_arrival_tracking` table
- `bl_container` → `bl_containers` table
- `folder_alert` → `folder_alerts` table

### 3. Server Actions

#### Location
`/lib/actions/list-detail-actions.ts`

#### Core Functions

**fetchListData<T>(params: ListApiParams)**
- Paginated list with search, filtering, and sorting
- Automatic badge and action generation
- Optimistic caching with revalidation
- Authentication verification

**fetchDetailData<T>(params: DetailApiParams)**
- Complete entity data with relationships
- Activity history and audit trail
- Permission-based metadata
- Breadcrumb navigation

**searchEntities<T>(entityType, query, limit)**
- Full-text search across searchable fields
- Fuzzy matching and highlighting
- Search suggestions and autocomplete

**performBulkOperation(params: BulkOperationParams)**
- Bulk delete (soft delete with audit)
- Bulk status updates
- Bulk assignments and operations

### 4. Query Configuration

#### Entity-Specific Configurations

Each entity type has a dedicated query configuration defining:
- **List Fields**: Minimal fields for list display
- **Detail Fields**: Complete fields for detail view
- **Search Fields**: Full-text searchable fields
- **Filter Fields**: Available for filtering/faceting
- **Sort Fields**: Available for sorting
- **Relations**: Foreign key relationships

Example for Bills of Lading:
```typescript
export const BL_QUERY_CONFIG: EntityQueryConfig = {
  table: 'bills_of_lading',
  listFields: ['id', 'bl_number', 'vessel_name', 'status', 'created_at'],
  detailFields: ['*'],
  searchFields: ['bl_number', 'vessel_name', 'shipper_name'],
  filterFields: ['status', 'port_of_loading', 'created_at'],
  sortFields: ['created_at', 'bl_number', 'vessel_name'],
  relations: {
    containers: { table: 'bl_containers', foreignKey: 'bill_of_lading_id' }
  }
};
```

### 5. Supabase Integration

#### Client Pattern
Following established three-client pattern:
- Server actions use `createClient()` from `/lib/supabase/server.ts`
- Automatic cookie-based session management
- Row Level Security (RLS) policy enforcement

#### Query Patterns

**List Queries with RLS**:
```typescript
const { data, count } = await supabase
  .from(tableName)
  .select(config.listFields.join(', '), { count: 'exact' })
  .is('deleted_at', null) // Soft delete filter
  .ilike('search_field', `%${searchTerm}%`)
  .eq('status', filterValue)
  .order('created_at', { ascending: false })
  .range(offset, offset + limit - 1);
```

**Detail Queries with Relations**:
```typescript
// Main entity
const { data: entity } = await supabase
  .from(tableName)
  .select('*')
  .eq('id', entityId)
  .single();

// Related data
const { data: related } = await supabase
  .from(relationTable)
  .select(relationFields)
  .eq(foreignKey, entityId);
```

### 6. Performance Optimization

#### Caching Strategy
- **List Cache**: 5-minute TTL for list responses
- **Detail Cache**: 10-minute TTL for detail data
- **Aggregates Cache**: 15-minute TTL for statistics
- **Search Cache**: 2-minute TTL for search results

#### Query Optimization
- Field selection to minimize data transfer
- Pagination limits (max 100 items per request)
- Index-optimized filtering and sorting
- Parallel relation queries where possible

#### Response Size Management
- List items include only preview data
- Detail views lazy-load heavy content
- Aggregates calculated asynchronously
- Infinite scroll pagination support

## Usage Examples

### 1. Basic List Implementation

```typescript
// Server Action Call
const listResponse = await fetchListData({
  entityType: 'bill_of_lading',
  search: 'MAERSK',
  filters: [
    { field: 'status', operator: 'eq', value: 'in_transit' }
  ],
  sort: [
    { field: 'created_at', direction: 'desc' }
  ],
  limit: 20,
  offset: 0,
  includePreview: true
});

if (listResponse.success) {
  const { data: listData, pagination } = listResponse.data;
  // Render list items with badges and actions
}
```

### 2. Detail View with Relations

```typescript
// Fetch complete detail data
const detailResponse = await fetchDetailData({
  entityType: 'bill_of_lading',
  id: 'bl-123',
  includeRelated: true,
  includeActivities: true,
  activityLimit: 10
});

if (detailResponse.success) {
  const { entity, related, activities, metadata } = detailResponse.data;
  // Render detail view with tabs and permissions
}
```

### 3. Search with Suggestions

```typescript
// Get search suggestions
const suggestions = await getSearchSuggestions(
  'folder',
  'client name',
  5
);

// Perform full search
const searchResults = await searchEntities(
  'folder',
  'urgent delivery client',
  10
);
```

### 4. Bulk Operations

```typescript
// Bulk status update
const bulkResponse = await performBulkOperation({
  entityType: 'folder',
  ids: ['folder-1', 'folder-2', 'folder-3'],
  operation: 'update_status',
  params: { status: 'completed' }
});
```

## Security Considerations

### Authentication
- All server actions verify user authentication
- Unauthorized requests return 401 status
- Session-based access control

### Authorization
- RLS policies enforce row-level security
- User can only access permitted entities
- Audit trail for all modifications

### Data Protection
- Soft delete prevents data loss
- Audit logging for compliance
- Field-level access control

### Input Validation
- Server-side parameter validation
- SQL injection prevention
- XSS protection through sanitization

## Error Handling

### Standardized Error Responses
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
}
```

### Common Error Scenarios
- **401 Unauthorized**: Invalid or missing authentication
- **404 Not Found**: Entity does not exist or access denied
- **400 Bad Request**: Invalid parameters or unsupported operation
- **500 Internal Server Error**: Database or server-side errors

### Client-Side Error Handling
```typescript
const response = await fetchListData(params);

if (!response.success) {
  switch (response.status) {
    case 401:
      // Redirect to login
      break;
    case 404:
      // Show not found message
      break;
    default:
      // Show generic error message
      break;
  }
}
```

## Internationalization Support

### Translation Keys Structure
```typescript
interface ListDetailI18nKeys {
  list: {
    title: string;
    search: { placeholder: string; noResults: string };
    filters: { title: string; clear: string };
    actions: { select: string; delete: string };
  };
  detail: {
    loading: string;
    error: string;
    tabs: Record<string, string>;
  };
}
```

### Using Translation Hooks
```typescript
import { useCommon } from '@/hooks/useTranslation';

function ListComponent() {
  const t = useCommon();
  
  return (
    <input 
      placeholder={t('search.placeholder')}
      // ... other props
    />
  );
}
```

## Migration from Existing Code

### Type System Migration
```typescript
// Old approach
import { BillOfLading } from '@/types/bl.types.legacy';

// New approach  
import type { BillOfLading, ListViewItem } from '@/types';
```

### Server Action Migration
```typescript
// Replace direct Supabase calls
const { data } = await supabase.from('bills_of_lading').select('*');

// With server actions
const response = await fetchListData({ 
  entityType: 'bill_of_lading' 
});
```

## Next Steps

### Recommended Implementation Order
1. **Setup Types**: Add list-detail types to existing type system ✅
2. **Create Server Actions**: Implement fetchListData and fetchDetailData ✅
3. **Build API Routes**: Create Next.js API routes (optional for server actions)
4. **Implement UI Components**: Create list and detail view components
5. **Add Internationalization**: Integrate with existing next-intl setup
6. **Performance Testing**: Validate query performance and caching
7. **Security Audit**: Review RLS policies and access controls

### Future Enhancements
- **Real-time Updates**: WebSocket integration for live data
- **Advanced Search**: Full-text search with PostgreSQL FTS
- **Export Functionality**: CSV/Excel export with background jobs
- **Mobile Optimization**: Touch-friendly gestures and interactions
- **Offline Support**: Service worker caching for list data