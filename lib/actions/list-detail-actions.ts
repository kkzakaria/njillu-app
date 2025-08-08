/**
 * Server Actions for List-Detail Layout System  
 * Next.js App Router server actions with Supabase integration
 * 
 * @module Actions/ListDetailActions
 * @version 1.0.0
 * @since 2025-08-08
 */

'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type {
  EntityType,
  EntityId,
  ListViewResponse,
  ListViewItem,
  DetailViewData,
  ListApiParams,
  DetailApiParams,
  BulkOperationParams,
  SearchSuggestion,
  ListViewAggregates,
  ListViewFacet,
  ApiResponse
} from '@/types';
import {
  getQueryConfig,
  SUPABASE_TABLES,
  transformToListViewItem,
  buildListQuery,
  buildDetailQuery,
  buildAggregatesQuery,
  buildFacetsQuery,
  CACHE_KEYS
} from '@/lib/api/list-detail-endpoints';

// ============================================================================
// LIST OPERATIONS
// ============================================================================

/**
 * Fetch list data with pagination, filtering, and search
 */
export async function fetchListData<T extends EntityType>(
  params: ListApiParams
): Promise<ApiResponse<ListViewResponse<T>>> {
  try {
    const supabase = await createClient();
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return {
        status: 'error',
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'Authentication required'
        }
      };
    }

    const config = getQueryConfig(params.entityType);
    const tableName = SUPABASE_TABLES[params.entityType];
    
    // Build base query
    let query = supabase
      .from(tableName)
      .select(config.listFields.join(', '), { count: 'exact' })
      .is('deleted_at', null);

    // Apply search
    if (params.search && params.search.trim()) {
      const searchTerms = params.search.trim().split(' ').filter(term => term.length > 0);
      
      for (const term of searchTerms) {
        const searchCondition = config.searchFields
          .map(field => `${field}.ilike.%${term}%`)
          .join(',');
        query = query.or(searchCondition);
      }
    }

    // Apply filters
    if (params.filters && params.filters.length > 0) {
      for (const filter of params.filters) {
        if (!config.filterFields.includes(filter.field)) continue;
        
        switch (filter.operator) {
          case 'equals':
            query = query.eq(filter.field, filter.value);
            break;
          case 'not_equals':
            query = query.neq(filter.field, filter.value);
            break;
          case 'greater_than':
            query = query.gt(filter.field, filter.value);
            break;
          case 'greater_than_or_equal':
            query = query.gte(filter.field, filter.value);
            break;
          case 'less_than':
            query = query.lt(filter.field, filter.value);
            break;
          case 'less_than_or_equal':
            query = query.lte(filter.field, filter.value);
            break;
          case 'in':
            const values = Array.isArray(filter.value) ? filter.value : [filter.value];
            query = query.in(filter.field, values);
            break;
          case 'contains':
            query = query.ilike(filter.field, `%${filter.value}%`);
            break;
          case 'is_null':
            query = query.is(filter.field, null);
            break;
          case 'is_not_null':
            query = query.not(filter.field, 'is', null);
            break;
        }
      }
    }

    // Apply sorting
    if (params.sort && params.sort.length > 0) {
      for (const sort of params.sort) {
        if (config.sortFields.includes(sort.field)) {
          query = query.order(sort.field, { ascending: sort.direction === 'asc' });
        }
      }
    } else {
      query = query.order('created_at', { ascending: false });
    }

    // Apply pagination
    const limit = Math.min(params.limit || 20, 100); // Max 100 items per request
    const offset = params.offset || 0;
    
    query = query.range(offset, offset + limit - 1);

    // Execute query
    const { data: rows, error, count } = await query;
    
    if (error) {
      console.error('List query error:', error);
      return {
        status: 'error',
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message
        }
      };
    }

    // Transform rows to list view items
    const items: ListViewItem<T>[] = (rows || []).map(row => 
      transformToListViewItem(params.entityType as T, row as unknown as Record<string, unknown>)
    );

    // Calculate pagination info
    const totalCount = count || 0;
    const hasMore = offset + limit < totalCount;
    const totalPages = Math.ceil(totalCount / limit);
    const currentPage = Math.floor(offset / limit) + 1;

    // Create response object
    let response: ListViewResponse<T> = {
      data: items,
      pagination: {
        current_page: currentPage,
        page_size: limit,
        total_count: totalCount,
        total_pages: totalPages,
        has_next_page: hasMore,
        has_previous_page: offset > 0
      }
    };

    // Fetch aggregates if requested
    if (params.includePreview) {
      const aggregates = await fetchAggregatesData(params.entityType);
      if (aggregates.status === 'success' && aggregates.data) {
        response = {
          ...response,
          aggregates: aggregates.data
        };
      }
    }

    return {
      data: response,
      status: 'success'
    };

  } catch (error) {
    console.error('fetchListData error:', error);
    return {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      },
      status: 'error'
    };
  }
}

/**
 * Fetch aggregated data for list view
 */
export async function fetchAggregatesData(
  entityType: EntityType
): Promise<ApiResponse<ListViewAggregates>> {
  try {
    const supabase = await createClient();
    const tableName = SUPABASE_TABLES[entityType];
    
    // Status counts
    const { data: statusCounts, error: statusError } = await supabase
      .from(tableName)
      .select('status')
      .is('deleted_at', null);
    
    if (statusError) {
      return {
        status: 'error',
        error: {
          code: 'INTERNAL_ERROR',
          message: statusError.message
        }
      };
    }

    // Calculate status distribution
    const statusDistribution = (statusCounts || []).reduce((acc, item) => {
      const status = (item as any).status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate priority distribution for supported entities
    let priorityDistribution: Record<string, number> | undefined;
    if (entityType === 'folder' || entityType === 'container_arrival_tracking') {
      const priorityField = entityType === 'folder' ? 'priority' : 'urgency_level';
      
      const { data: priorityCounts } = await supabase
        .from(tableName)
        .select(priorityField)
        .is('deleted_at', null);
        
      if (priorityCounts) {
        priorityDistribution = priorityCounts.reduce((acc, item) => {
          const priority = (item as any)[priorityField] || 'unknown';
          acc[priority] = (acc[priority] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
      }
    }

    const aggregates: ListViewAggregates = {
      statusCounts: statusDistribution,
      totalValue: Object.values(statusDistribution).reduce((sum, count) => sum + count, 0),
      ...(priorityDistribution && { priorityCounts: priorityDistribution })
    };

    return {
      data: aggregates,
      status: 'success'
    };
    
  } catch (error) {
    console.error('fetchAggregatesData error:', error);
    return {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      },
      status: 'error'
    };
  }
}

/**
 * Fetch facet data for filtering
 */
export async function fetchFacetsData(
  entityType: EntityType
): Promise<ApiResponse<ListViewFacet[]>> {
  try {
    const supabase = await createClient();
    const config = getQueryConfig(entityType);
    const tableName = SUPABASE_TABLES[entityType];
    
    const facets: ListViewFacet[] = [];
    
    // Build facets for filterable fields (excluding date fields)
    const facetFields = config.filterFields.filter(field => 
      !field.includes('date') && !field.includes('_at')
    );
    
    for (const field of facetFields) {
      const { data: facetData, error } = await supabase
        .from(tableName)
        .select(field)
        .is('deleted_at', null)
        .not(field, 'is', null);
        
      if (error) continue;
      
      // Calculate value counts
      const valueCounts = (facetData || []).reduce((acc, item) => {
        const value = String((item as any)[field]);
        acc[value] = (acc[value] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Convert to facet format
      const values = Object.entries(valueCounts)
        .map(([value, count]) => ({
          value,
          label: formatFacetLabel(field, value),
          count
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20); // Limit to top 20 values
      
      if (values.length > 0) {
        facets.push({
          field,
          label: formatFieldLabel(field),
          values
        });
      }
    }
    
    return {
      data: facets,
      status: 'success'
    };
    
  } catch (error) {
    console.error('fetchFacetsData error:', error);
    return {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      },
      status: 'error'
    };
  }
}

// ============================================================================
// DETAIL OPERATIONS
// ============================================================================

/**
 * Fetch detailed entity data with relations and activities
 */
export async function fetchDetailData<T extends EntityType>(
  params: DetailApiParams
): Promise<ApiResponse<DetailViewData<T>>> {
  try {
    const supabase = await createClient();
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return {
        status: 'error',
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'Authentication required'
        }
      };
    }

    const config = getQueryConfig(params.entityType);
    const tableName = SUPABASE_TABLES[params.entityType];
    
    // Fetch main entity
    const { data: entityData, error: entityError } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', params.id)
      .is('deleted_at', null)
      .single();
    
    if (entityError) {
      if (entityError.code === 'PGRST116') {
        return {
            error: {
            code: 'NOT_FOUND',
            message: 'Entity not found'
          },
          status: 'error'
        };
      }
      return {
        status: 'error',
        error: {
          code: 'INTERNAL_ERROR',
          message: entityError.message
        }
      };
    }
    
    // Fetch related data if requested
    let relatedData: any = {};
    if (params.includeRelated) {
      for (const [relationName, relationConfig] of Object.entries(config.relations)) {
        const { data: data } = await supabase
          .from(relationConfig.table)
          .select(relationConfig.fields.join(', '))
          .eq(relationConfig.foreignKey, params.id)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (data && data.length > 0) {
          relatedData[relationName] = {
            count: data.length,
            items: data.map(item => ({
              id: (item as any).id,
              title: (item as any).name || (item as any).title || 'Untitled',
              type: params.entityType,
              status: (item as any).status
            }))
          };
        }
      }
    }

    // Fetch activities if requested
    let activities: any[] = [];
    if (params.includeActivities) {
      // Note: This assumes an audit_logs table exists
      const { data: activitiesData } = await supabase
        .from('audit_logs')
        .select(`
          id, action, description, changes, comment,
          created_at, created_by_id
        `)
        .eq('entity_type', params.entityType)
        .eq('entity_id', params.id)
        .order('created_at', { ascending: false })
        .limit(params.activityLimit || 20);
      
      if (activitiesData) {
        activities = activitiesData.map(activity => ({
          id: (activity as any).id,
          action: (activity as any).action as any,
          description: (activity as any).description,
          changes: (activity as any).changes,
          comment: (activity as any).comment,
          created_at: (activity as any).created_at,
          created_by: (activity as any).created_by_id,
          updated_at: (activity as any).created_at,
          updated_by: (activity as any).created_by_id
        }));
      }
    }

    const detailData: DetailViewData<T> = {
      entity: entityData as any, // Type assertion for EntityTypeMap[T]
      related: relatedData,
      activities: activities,
      metadata: {
        permissions: {
          canEdit: true,  // TODO: Implement proper permissions
          canDelete: true,
          canComment: true,
          canShare: true
        },
        breadcrumbs: [
          { label: 'Home', href: '/' },
          { label: formatEntityTypeLabel(params.entityType), href: `/${params.entityType}` },
          { label: getEntityBreadcrumbTitle(params.entityType, entityData) }
        ]
      }
    };
    
    return {
      data: detailData,
      status: 'success'
    };
    
  } catch (error) {
    console.error('fetchDetailData error:', error);
    return {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      },
      status: 'error'
    };
  }
}

// ============================================================================
// SEARCH OPERATIONS
// ============================================================================

/**
 * Search entities with suggestions
 */
export async function searchEntities<T extends EntityType>(
  entityType: T,
  query: string,
  limit = 20
): Promise<ApiResponse<ListViewItem<T>[]>> {
  try {
    const params: ListApiParams = {
      entityType,
      search: query,
      limit,
      offset: 0,
      includePreview: true
    };
    
    const result = await fetchListData<T>(params);
    
    if (result.status !== 'success') {
      return {
        status: result.status,
        error: result.error
      };
    }
    
    return {
      data: result.data!.data,
      status: 'success'
    };
    
  } catch (error) {
    console.error('searchEntities error:', error);
    return {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      },
      status: 'error'
    };
  }
}

/**
 * Get search suggestions
 */
export async function getSearchSuggestions(
  entityType: EntityType,
  query: string,
  limit = 10
): Promise<ApiResponse<SearchSuggestion[]>> {
  try {
    const supabase = await createClient();
    const config = getQueryConfig(entityType);
    const tableName = SUPABASE_TABLES[entityType];
    
    const suggestions: SearchSuggestion[] = [];
    
    // Get suggestions from searchable fields
    for (const field of config.searchFields) {
      const { data: fieldData } = await supabase
        .from(tableName)
        .select(field)
        .ilike(field, `%${query}%`)
        .is('deleted_at', null)
        .limit(limit);
      
      if (fieldData) {
        const fieldSuggestions = fieldData
          .map(item => String(item[field]))
          .filter(Boolean)
          .map(text => ({
            text,
            field,
            count: 1, // TODO: Implement proper count
            highlight: text.replace(new RegExp(`(${query})`, 'gi'), '<mark>$1</mark>')
          }));
        
        suggestions.push(...fieldSuggestions);
      }
    }
    
    // Remove duplicates and limit results
    const uniqueSuggestions = suggestions
      .filter((suggestion, index, array) => 
        array.findIndex(s => s.text === suggestion.text) === index
      )
      .slice(0, limit);
    
    return {
      data: uniqueSuggestions,
      status: 'success'
    };
    
  } catch (error) {
    console.error('getSearchSuggestions error:', error);
    return {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      },
      status: 'error'
    };
  }
}

// ============================================================================
// BULK OPERATIONS
// ============================================================================

/**
 * Perform bulk operations on entities
 */
export async function performBulkOperation(
  params: BulkOperationParams
): Promise<ApiResponse<{ affected: number }>> {
  try {
    const supabase = await createClient();
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return {
        status: 'error',
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'Authentication required'
        }
      };
    }

    const tableName = SUPABASE_TABLES[params.entityType];
    let result;
    
    switch (params.operation) {
      case 'delete':
        // Soft delete
        result = await supabase
          .from(tableName)
          .update({ 
            deleted_at: new Date().toISOString(),
            updated_by_id: user.id
          })
          .in('id', params.ids);
        break;
        
      case 'update_status':
        result = await supabase
          .from(tableName)
          .update({ 
            status: params.params?.status,
            updated_by_id: user.id,
            updated_at: new Date().toISOString()
          })
          .in('id', params.ids);
        break;
        
      default:
        return {
            error: `Unsupported bulk operation: ${params.operation}`,
          status: 400
        };
    }
    
    if (result.error) {
      return {
        error: result.error.message,
        status: 'error'
      };
    }
    
    // Revalidate the list cache
    revalidatePath(`/${params.entityType}`);
    
    return {
      data: { affected: params.ids.length },
      status: 'success'
    };
    
  } catch (error) {
    console.error('performBulkOperation error:', error);
    return {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      },
      status: 'error'
    };
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format facet label for display
 */
function formatFacetLabel(field: string, value: string): string {
  // Convert snake_case to Title Case
  const formatted = field
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  return value.replace('_', ' ').toUpperCase();
}

/**
 * Format field label for display
 */
function formatFieldLabel(field: string): string {
  return field
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Format entity type label for display
 */
function formatEntityTypeLabel(entityType: EntityType): string {
  switch (entityType) {
    case 'bill_of_lading':
      return 'Bills of Lading';
    case 'folder':
      return 'Folders';
    case 'container_arrival_tracking':
      return 'Container Arrivals';
    default:
      return entityType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}

/**
 * Get entity breadcrumb title
 */
function getEntityBreadcrumbTitle(entityType: EntityType, entity: Record<string, unknown>): string {
  switch (entityType) {
    case 'bill_of_lading':
      return `BL ${entity.bl_number || 'N/A'}`;
    case 'folder':
      return `Folder ${entity.folder_number || 'N/A'}`;
    case 'container_arrival_tracking':
      return `Container ${entity.container_number || 'N/A'}`;
    default:
      return entity.name as string || entity.title as string || 'Untitled';
  }
}