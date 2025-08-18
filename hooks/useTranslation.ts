import { useTranslations } from 'next-intl';

export function useAuth() {
  return useTranslations('auth');
}

export function useCommon() {
  return useTranslations('common');
}

export function useNavigation() {
  return useTranslations('navigation');
}

export function useCustoms() {
  return useTranslations('customs');
}

export function useLanguage() {
  return useTranslations('language');
}

export function useFolders() {
  return useTranslations('folders.card');
}

export function useDemo() {
  return useTranslations('demo');
}

export function useFolderFilters() {
  return useTranslations('folder-filters');
}

export function useClients() {
  return useTranslations('clients');
}

// Hooks spécialisés pour les clients
export function useClientActions() {
  return useTranslations('clients.actions');
}

export function useClientForm() {
  return useTranslations('clients.form');
}

export function useClientTable() {
  return useTranslations('clients.table');
}

export function useClientSearch() {
  return useTranslations('clients.search');
}

export function useClientFilters() {
  return useTranslations('clients.filters');
}

export function useClientNotifications() {
  return useTranslations('clients.notifications');
}

export function useClientErrors() {
  return useTranslations('clients.errors');
}

export function useClientConfirmations() {
  return useTranslations('clients.confirmations');
}

export function useClientImport() {
  return useTranslations('clients.import');
}

export function useClientExport() {
  return useTranslations('clients.export');
}

export function useClientStatistics() {
  return useTranslations('clients.statistics');
}