'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X, Clock } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useListDetail as useTranslations } from '@/hooks/useTranslation';
import type { ListSearchProps } from '../types';

// ============================================================================
// LIST SEARCH COMPONENT
// ============================================================================

export function ListSearch({
  query,
  onQueryChange,
  onClear,
  suggestions = [],
  placeholder = 'Search...',
  className
}: ListSearchProps) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(query);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('listSearchHistory');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch {
        // Ignore parsing errors
      }
    }
  }, []);

  // Update input value when query changes externally
  useEffect(() => {
    setInputValue(query);
  }, [query]);

  // Handle input change
  const handleInputChange = (value: string) => {
    setInputValue(value);
    
    // Show suggestions dropdown if there's input
    if (value.length > 0) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  };

  // Handle search submission
  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || inputValue.trim();
    
    if (finalQuery) {
      // Add to recent searches
      const newRecentSearches = [
        finalQuery,
        ...recentSearches.filter(s => s !== finalQuery)
      ].slice(0, 5);
      
      setRecentSearches(newRecentSearches);
      localStorage.setItem('listSearchHistory', JSON.stringify(newRecentSearches));
    }

    onQueryChange(finalQuery);
    setOpen(false);
  };

  // Handle clear
  const handleClear = () => {
    setInputValue('');
    onClear();
    setOpen(false);
    inputRef.current?.focus();
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    } else if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    handleSearch(suggestion);
  };

  // Clear recent search
  const clearRecentSearch = (searchToRemove: string) => {
    const newRecentSearches = recentSearches.filter(s => s !== searchToRemove);
    setRecentSearches(newRecentSearches);
    localStorage.setItem('listSearchHistory', JSON.stringify(newRecentSearches));
  };

  return (
    <div className={cn('relative', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="text"
              placeholder={placeholder}
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyPress}
              onFocus={() => {
                if (inputValue.length > 0 || recentSearches.length > 0) {
                  setOpen(true);
                }
              }}
              className="pl-9 pr-9"
            />
            {inputValue && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0 hover:bg-transparent"
                onClick={handleClear}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </PopoverTrigger>

        <PopoverContent
          className="w-[--radix-popover-trigger-width] p-0"
          side="bottom"
          align="start"
        >
          <Command shouldFilter={false}>
            <CommandList>
              {/* Current suggestions */}
              {suggestions.length > 0 && (
                <CommandGroup heading={t('search.suggestions')}>
                  {suggestions.map((suggestion, index) => (
                    <CommandItem
                      key={index}
                      value={suggestion}
                      onSelect={() => handleSuggestionClick(suggestion)}
                      className="cursor-pointer"
                    >
                      <Search className="mr-2 h-4 w-4" />
                      <span>{suggestion}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* Recent searches */}
              {recentSearches.length > 0 && (
                <CommandGroup heading="Recent searches">
                  {recentSearches.map((recent, index) => (
                    <CommandItem
                      key={index}
                      value={recent}
                      onSelect={() => handleSuggestionClick(recent)}
                      className="cursor-pointer group"
                    >
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="flex-1">{recent}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearRecentSearch(recent);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* No results */}
              {suggestions.length === 0 && recentSearches.length === 0 && inputValue.length > 0 && (
                <CommandEmpty>{t('search.noResults')}</CommandEmpty>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Active search indicator */}
      {query && (
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="secondary" className="text-xs">
            <Search className="mr-1 h-3 w-3" />
            {query}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="ml-1 h-4 w-4 p-0 hover:bg-transparent"
              onClick={handleClear}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        </div>
      )}
    </div>
  );
}