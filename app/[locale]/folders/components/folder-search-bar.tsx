'use client'

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Filter } from 'lucide-react';

// ============================================================================
// Types et interfaces
// ============================================================================

interface FolderSearchBarProps {
  placeholder?: string;
  className?: string;
  onSearch?: (value: string) => void;
  onFilter?: () => void;
  onAdd?: () => void;
}

// ============================================================================
// Composant principal
// ============================================================================

export function FolderSearchBar({
  placeholder = 'Rechercher un dossier...',
  className = '',
  onSearch,
  onFilter,
  onAdd
}: FolderSearchBarProps) {
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch?.(e.target.value);
  };

  const handleFilterClick = () => {
    onFilter?.();
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
        <Button size="sm" onClick={handleFilterClick}>
          <Filter className="w-4 h-4" />
        </Button>
        <Button size="sm" onClick={handleAddClick}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}