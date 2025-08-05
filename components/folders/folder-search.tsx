'use client'

import { useEffect, useState, useCallback } from 'react'
import { useQueryState } from 'nuqs'
import { Search, X, Loader2 } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import { folderSearchParsers } from '@/lib/search-params/folder-params'
import { useFolders } from '@/hooks/useTranslation'

interface FolderSearchProps {
  className?: string
  placeholder?: string
  isLoading?: boolean
  resultCount?: number
}

export function FolderSearch({ 
  className, 
  placeholder,
  isLoading = false,
  resultCount 
}: FolderSearchProps) {
  const t = useFolders()
  
  // État URL pour la recherche
  const [searchQuery, setSearchQuery] = useQueryState(
    'search',
    folderSearchParsers.search.withOptions({
      shallow: false,
      clearOnDefault: true
    })
  )

  // État local pour l'input (pour le debounce) avec vérification null
  const [localSearch, setLocalSearch] = useState(searchQuery || '')
  const [isSearching, setIsSearching] = useState(false)

  // Debounce de la recherche
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout
      return (value: string) => {
        setIsSearching(true)
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          setSearchQuery(value || null)
          setIsSearching(false)
        }, 300) // 300ms de délai
      }
    })(),
    [setSearchQuery]
  )

  // Synchroniser l'état local avec l'URL quand l'URL change
  useEffect(() => {
    setLocalSearch(searchQuery || '')
  }, [searchQuery])

  // Déclencher le debounce quand l'input change
  useEffect(() => {
    if (localSearch !== searchQuery) {
      debouncedSearch(localSearch)
    }
  }, [localSearch, searchQuery, debouncedSearch])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearch(e.target.value)
  }

  const handleClear = () => {
    setLocalSearch('')
    setSearchQuery(null)
    setIsSearching(false)
  }

  const hasSearch = Boolean(searchQuery && searchQuery.length > 0)
  const showLoading = isLoading || isSearching

  return (
    <div className={className}>
      <div className="relative">
        {/* Icône de recherche */}
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        
        {/* Input de recherche */}
        <Input
          type="text"
          placeholder={placeholder || t('search.placeholder')}
          value={localSearch || ''}
          onChange={handleInputChange}
          className="pl-9 pr-20"
        />

        {/* Indicateurs et actions à droite */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
          {/* Loader pendant la recherche */}
          {showLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
          
          {/* Bouton pour effacer */}
          {hasSearch && !showLoading && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
              aria-label={t('search.clear')}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Résultats de recherche */}
      {hasSearch && (
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {resultCount !== undefined 
                ? t('search.results_count', { count: resultCount })
                : t('search.no_results')
              }
            </Badge>
            
            {/* Badge de recherche active */}
            <Badge variant="secondary" className="text-xs">
              "{searchQuery}"
            </Badge>
          </div>

          {/* Bouton pour effacer (version texte sur mobile) */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="text-xs h-6"
          >
            {t('search.clear')}
          </Button>
        </div>
      )}

      {/* Message d'aide pour la recherche */}
      {hasSearch && resultCount === 0 && !showLoading && (
        <div className="mt-2 text-sm text-muted-foreground">
          {t('search.no_results')}
        </div>
      )}
    </div>
  )
}

// Hook utilitaire pour extraire les termes de recherche
export function useSearchTerms() {
  const [searchQuery] = useQueryState('search', folderSearchParsers.search)
  
  return {
    searchQuery: searchQuery || '',
    hasSearch: Boolean(searchQuery && searchQuery.length > 0),
    searchTerms: searchQuery 
      ? searchQuery.split(' ').filter(term => term.length > 0)
      : []
  }
}

// Composant pour mettre en évidence les termes de recherche dans le texte
interface HighlightSearchProps {
  text: string
  className?: string
}

export function HighlightSearch({ text, className }: HighlightSearchProps) {
  const { searchTerms } = useSearchTerms()
  
  if (searchTerms.length === 0) {
    return <span className={className}>{text}</span>
  }

  // Créer une regex pour tous les termes de recherche
  const regex = new RegExp(`(${searchTerms.join('|')})`, 'gi')
  const parts = text.split(regex)

  return (
    <span className={className}>
      {parts.map((part, index) => {
        const isMatch = searchTerms.some(term => 
          part.toLowerCase() === term.toLowerCase()
        )
        
        return isMatch ? (
          <mark 
            key={index} 
            className="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded"
          >
            {part}
          </mark>
        ) : (
          part
        )
      })}
    </span>
  )
}