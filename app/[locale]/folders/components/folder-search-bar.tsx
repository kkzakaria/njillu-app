'use client'

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';
import { FolderFiltersMenu, type FolderFilters } from './folder-filters-menu';

// ============================================================================
// Types et interfaces
// ============================================================================

interface FolderSearchBarProps {
  placeholder?: string;
  className?: string;
  statusCategory?: 'active' | 'completed' | 'archived' | 'deleted';
  filters?: FolderFilters;
  onSearch?: (value: string) => void;
  onFiltersChange?: (filters: FolderFilters) => void;
  onAdd?: () => void;
  activeFiltersCount?: number;
}

// ============================================================================
// Composant principal
// ============================================================================

export function FolderSearchBar({
  placeholder = 'Rechercher un dossier...',
  className = '',
  statusCategory = 'active',
  filters = {},
  onSearch,
  onFiltersChange,
  onAdd,
  activeFiltersCount = 0
}: FolderSearchBarProps) {
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch?.(e.target.value);
  };

  const handleFiltersChange = (newFilters: FolderFilters) => {
    onFiltersChange?.(newFilters);
  };

  const handleAddClick = () => {
    onAdd?.();
  };

  return (
    <div className={`mb-4 ${className}`}>
      {/* Search and action buttons */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={placeholder}
            className="pl-9 bg-card border-border"
            onChange={handleSearchChange}
          />
        </div>
        <FolderFiltersMenu
          statusCategory={statusCategory}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          activeFiltersCount={activeFiltersCount}
        />
        <Button size="sm" onClick={handleAddClick}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}