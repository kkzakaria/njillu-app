/**
 * List-Detail Layout System - Main Entry Point
 * Responsive components for list-detail views
 * 
 * @module ListDetailLayout
 * @version 1.0.0
 * @since 2025-08-08
 */

// Core Layout Components
export { ListDetailLayout } from './layout/list-detail-layout';
export { ListDetailProvider, useListDetail } from './context/list-detail-context';

// List Components
export { ListView } from './list/list-view';
export { ListItem } from './list/list-item';
export { ListFilters } from './list/list-filters';
export { ListSearch } from './list/list-search';
export { ListPagination } from './list/list-pagination';

// Detail Components
export { DetailView } from './detail/detail-view';
export { DetailTabs } from './detail/detail-tabs';
export { DetailActions } from './detail/detail-actions';
export { DetailActivities } from './detail/detail-activities';

// Navigation Components
export { ResponsiveNavigation } from './navigation/responsive-navigation';
export { BreadcrumbNavigation } from './navigation/breadcrumb-navigation';

// Types
export type * from './types';

// Entity-Specific Layouts
export { BLListDetailLayout } from './entities/bl-list-detail';
export { FolderListDetailLayout } from './entities/folder-list-detail';
export { ContainerListDetailLayout } from './entities/container-list-detail';