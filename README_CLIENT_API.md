# Client Management API

Comprehensive REST API for managing clients (individuals and businesses) with full CRUD operations, search, validation, and batch processing.

## Overview

The Client API provides a complete solution for managing client data with:
- ✅ Individual and business client support
- ✅ Complete CRUD operations
- ✅ Advanced search and filtering
- ✅ Data validation and business rules
- ✅ Batch operations
- ✅ Contact management for business clients
- ✅ Export/import functionality
- ✅ Authentication and authorization
- ✅ TypeScript integration

## Architecture

### Service Layer
```
lib/services/clients/
├── index.ts              # Main exports
├── client-service.ts     # Core CRUD operations
├── search-service.ts     # Advanced search and filtering
├── validation-service.ts # Data validation and business rules
├── batch-service.ts      # Batch operations
└── contact-service.ts    # Business contact management
```

### API Routes
```
app/api/clients/
├── route.ts                    # GET (list/search), POST (create)
├── [id]/
│   ├── route.ts               # GET (details), PUT (update), DELETE
│   ├── statistics/route.ts    # GET client statistics
│   └── contacts/
│       ├── route.ts           # POST (add contact)
│       └── [contactId]/route.ts # PUT, DELETE contact
├── batch/route.ts             # POST batch operations
├── validate/route.ts          # POST validation
├── export/route.ts            # POST export
└── import/route.ts            # POST import
```

## API Endpoints

### Core Operations

#### `GET /api/clients`
List and search clients with advanced filtering.

**Query Parameters:**
- `search` - Text search across names, emails, and company names
- `client_types` - Filter by client type: `individual`, `business`
- `statuses` - Filter by status: `active`, `inactive`, `suspended`, `archived`
- `countries` - Filter by country codes
- `industries` - Filter by industry (business clients only)
- `priorities` - Filter by priority level
- `languages` - Filter by preferred language
- `sort_field` - Sort by field (default: `created_at`)
- `sort_direction` - Sort direction: `asc`, `desc` (default: `desc`)
- `page` - Page number (default: 1)
- `page_size` - Items per page (max: 100, default: 50)
- `include_deleted` - Include soft-deleted clients

**Response:**
```json
{
  "success": true,
  "data": {
    "clients": [...],
    "total_count": 150,
    "current_page": 1,
    "page_size": 50,
    "total_pages": 3,
    "has_next_page": true,
    "has_previous_page": false,
    "facets": { ... }
  }
}
```

#### `POST /api/clients`
Create a new client (individual or business).

**Request Body:**
```json
{
  "client_type": "individual|business",
  "individual_info": { ... },  // For individual clients
  "business_info": { ... },    // For business clients
  "contact_info": { ... },
  "commercial_info": { ... },
  "tags": ["tag1", "tag2"]
}
```

#### `GET /api/clients/{id}`
Get client details.

**Query Parameters:**
- `detailed` - Include computed information and statistics

#### `PUT /api/clients/{id}`
Update client data.

**Headers:**
- `If-Match` - Version for optimistic concurrency control

#### `DELETE /api/clients/{id}`
Soft delete client.

**Query Parameters:**
- `type` - Deletion type: `soft` (default), `hard`
- `reason` - Reason for deletion
- `force` - Force deletion even with active folders
- `handle_folders` - How to handle associated folders: `keep`, `transfer`, `archive`
- `transfer_to` - Target client ID for folder transfer

### Specialized Endpoints

#### `GET /api/clients/{id}/statistics`
Get client performance metrics and statistics.

#### `POST /api/clients/{id}/contacts`
Add contact to business client.

#### `PUT /api/clients/{id}/contacts/{contactId}`
Update business client contact.

#### `DELETE /api/clients/{id}/contacts/{contactId}`
Remove or deactivate business client contact.

**Query Parameters:**
- `deactivate_only` - Just deactivate instead of removing

### Batch Operations

#### `POST /api/clients/batch`
Execute batch operations on multiple clients.

**Request Body:**
```json
{
  "operation": "update|delete|change_status|add_tags|remove_tags",
  "client_ids": ["id1", "id2", ...],
  "data": {
    "updates": { ... },      // For update operation
    "new_status": "active",  // For change_status
    "tags": ["tag1", "tag2"] // For tag operations
  },
  "force": false
}
```

### Validation

#### `POST /api/clients/validate`
Validate client data before creation or update.

**Request Body:**
```json
{
  "data": { ... },
  "operation_type": "create|update",
  "client_id": "uuid",  // Required for update validation
  "options": {
    "check_email_uniqueness": true,
    "check_siret_uniqueness": true,
    "check_formats": true,
    "check_business_rules": true
  }
}
```

### Export/Import

#### `POST /api/clients/export`
Export clients to various formats.

**Request Body:**
```json
{
  "format": "csv|excel|json",
  "client_ids": ["id1", "id2"],  // Optional: specific clients
  "search_params": { ... },      // Optional: search criteria
  "fields": ["field1", "field2"], // Optional: specific fields
  "include_sensitive_data": false,
  "language": "fr|en|es"
}
```

#### `POST /api/clients/import`
Import clients from data array.

**Request Body:**
```json
{
  "data": [{ ... }, { ... }],  // Array of client data
  "duplicate_strategy": "skip|update|error",
  "validate_before_import": true,
  "mode": "test|import"
}
```

## Data Models

### Individual Client
```typescript
{
  client_type: 'individual',
  individual_info: {
    first_name: string,
    last_name: string,
    date_of_birth?: string,
    profession?: string,
    // ...
  },
  contact_info: { /* ContactInfo */ },
  commercial_info: { /* CommercialInfo */ }
}
```

### Business Client
```typescript
{
  client_type: 'business',
  business_info: {
    company_name: string,
    industry: Industry,
    contacts: ContactPerson[],
    legal_info?: {
      siret?: string,
      vat_number?: string,
      // ...
    }
  },
  contact_info: { /* ContactInfo */ },
  commercial_info: { /* CommercialInfo */ }
}
```

## Authentication

All endpoints require authentication. Include a valid session token in your requests.

**Headers:**
```
Authorization: Bearer <token>
```

The API uses Supabase authentication with `supabase.auth.getClaims()` for session validation.

## Error Handling

The API returns structured error responses:

```json
{
  "success": false,
  "error": "Error Type",
  "message": "Human-readable error message",
  "details": { /* Additional error context */ }
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `409` - Conflict (duplicates, version conflicts)
- `422` - Validation Error
- `500` - Internal Server Error

## Validation Rules

### Email Validation
- Required for all clients
- Must be unique across all clients
- Valid email format required

### Business Clients
- Company name required
- Industry required
- At least one active contact required
- At least one primary contact required
- SIRET validation for French companies (14 digits)
- VAT number format validation

### Individual Clients
- First name and last name required
- Date of birth validation (age checks)
- Name length limits (50 characters)

### Commercial Information
- Credit limit cannot be negative
- Payment terms validation
- Warning for high credit limits (>€1M)
- Warning for long payment terms (>365 days)

## Rate Limiting

The API implements the following limits:
- List operations: 100 clients per request max
- Batch operations: 1,000 clients max
- Import operations: 1,000 clients max
- Export operations: 10,000 clients max

## Testing

Run the test suite to validate API functionality:

```bash
node scripts/test-client-api.js
```

The test suite covers:
- ✅ Individual client creation
- ✅ Business client creation
- ✅ Client listing and search
- ✅ Client retrieval (basic and detailed)
- ✅ Client updates
- ✅ Contact management
- ✅ Data validation
- ✅ Statistics retrieval

## Integration Examples

### Create Individual Client
```javascript
const response = await fetch('/api/clients', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    client_type: 'individual',
    individual_info: {
      first_name: 'Jean',
      last_name: 'Dupont'
    },
    contact_info: {
      email: 'jean.dupont@example.com',
      address: { country: 'FR' }
    }
  })
});
```

### Search Clients
```javascript
const params = new URLSearchParams({
  search: 'dupont',
  client_types: 'individual',
  statuses: 'active',
  page: '1',
  page_size: '20'
});

const response = await fetch(`/api/clients?${params}`);
```

### Batch Update
```javascript
const response = await fetch('/api/clients/batch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operation: 'add_tags',
    client_ids: ['id1', 'id2', 'id3'],
    data: { tags: ['vip', 'premium'] }
  })
});
```

## Performance Considerations

- Use pagination for large datasets
- Implement client-side caching for frequently accessed data
- Use search facets to help users refine large result sets
- Consider batch operations for bulk changes
- Monitor database performance with complex search queries

## Security Features

- ✅ Authentication required for all endpoints
- ✅ Input validation and sanitization
- ✅ SQL injection prevention
- ✅ CORS configuration
- ✅ Rate limiting
- ✅ Soft delete by default
- ✅ Audit trail support
- ✅ Data export controls

## Future Enhancements

Potential improvements for future versions:
- Real-time notifications for client changes
- Advanced analytics and reporting
- Integration with external CRM systems
- Automated duplicate detection
- Document attachment support
- Activity timeline tracking
- Advanced permission system
- API versioning support