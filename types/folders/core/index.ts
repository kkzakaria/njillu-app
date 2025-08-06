/**
 * Module Core - Point d'entrée des interfaces principales
 * Export des entités centrales du système de dossiers
 */

export * from './folder';
export * from './folder-relations';

// Re-exports pour compatibilité
export type {
  Folder,
  FolderSummary,
  FolderDisplayConfig
} from './folder';

export type {
  FolderBLRelation,
  FolderDocument,
  DocumentCategory,
  DocumentType,
  FolderActivity,
  ActivityType,
  ActivityCategory
} from './folder-relations';

// Export des constantes
export { DOCUMENT_TYPES } from './folder-relations';