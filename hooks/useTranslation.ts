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