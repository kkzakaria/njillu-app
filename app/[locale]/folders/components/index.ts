// Composants principaux des dossiers
export { FolderCard } from './folder-card';
export { FoldersListPanel } from './folders-list-panel';
export { FolderDetailsPanel } from './folder-details-panel';
export { FolderDetailsHeader } from './folder-details-header';
export { FolderSearchBar } from './folder-search-bar';
export { default as FolderListVirtualized } from './folder-list-virtualized';

// Composants utilitaires
export { InfoBanner } from './info-banner';
export { PriorityBadge } from './priority-badge';
export { ProcessingStageBadge } from './processing-stage-badge';

// Actions et helpers
export { getFolderActions, isActionAvailable, getActionContext } from './folder-actions';

// Types re-exports
export type { FolderAction } from './folder-card';