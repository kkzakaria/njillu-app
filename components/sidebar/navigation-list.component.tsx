// Composant pour la liste de navigation selon OCP
'use client'

import React from 'react'
import { INavigationItem, INavigationComponent } from '@/types/sidebar.types'
import { NavigationItem, NavigationSeparator, NavigationGroup } from './navigation-item.component'

/**
 * Props pour le composant NavigationList
 * OCP: Extensible par composition sans modification
 */
interface NavigationListProps extends INavigationComponent {
  groupBy?: (item: INavigationItem) => string | null
  renderCustomItem?: (item: INavigationItem, defaultRenderer: (item: INavigationItem) => React.ReactNode) => React.ReactNode
  showSeparators?: boolean
  className?: string
}

/**
 * Composant pour la liste de navigation
 * SRP: Responsabilité unique - gestion de la liste de navigation
 * OCP: Ouvert à l'extension (groupBy, renderCustomItem) mais fermé à la modification
 * LSP: Implémente le contrat INavigationComponent
 */
export const NavigationList: React.FC<NavigationListProps> = ({
  items,
  isExpanded,
  onItemClick,
  groupBy,
  renderCustomItem,
  showSeparators = false,
  className = ''
}) => {
  // Fonction par défaut pour rendre un élément
  const defaultItemRenderer = (item: INavigationItem) => (
    <NavigationItem
      key={item.id}
      item={item}
      isExpanded={isExpanded}
      onClick={onItemClick}
    />
  )

  // Si pas de groupement, afficher la liste simple
  if (!groupBy) {
    return (
      <nav className={`space-y-1 ${className}`}>
        {items.map((item, index) => {
          const renderedItem = renderCustomItem 
            ? renderCustomItem(item, defaultItemRenderer)
            : defaultItemRenderer(item)

          return (
            <React.Fragment key={item.id}>
              {showSeparators && index > 0 && <NavigationSeparator />}
              {renderedItem}
            </React.Fragment>
          )
        })}
      </nav>
    )
  }

  // Grouper les éléments
  const groupedItems = items.reduce((groups, item) => {
    const groupKey = groupBy(item) || 'default'
    if (!groups[groupKey]) {
      groups[groupKey] = []
    }
    groups[groupKey].push(item)
    return groups
  }, {} as Record<string, INavigationItem[]>)

  return (
    <nav className={`space-y-4 ${className}`}>
      {Object.entries(groupedItems).map(([groupKey, groupItems], groupIndex) => (
        <React.Fragment key={groupKey}>
          {groupIndex > 0 && showSeparators && <NavigationSeparator />}
          
          <NavigationGroup 
            title={groupKey === 'default' ? '' : groupKey}
            isExpanded={isExpanded}
          >
            {groupItems.map(item => {
              return renderCustomItem 
                ? renderCustomItem(item, defaultItemRenderer)
                : defaultItemRenderer(item)
            })}
          </NavigationGroup>
        </React.Fragment>
      ))}
    </nav>
  )
}

/**
 * Composant NavigationList avec templates prédéfinis
 * OCP: Extension par templates sans modification du composant de base
 */
interface TemplatedNavigationListProps extends Omit<NavigationListProps, 'groupBy'> {
  template?: 'simple' | 'grouped' | 'categorized'
  categories?: Record<string, string[]> // categoryName -> itemIds
}

export const TemplatedNavigationList: React.FC<TemplatedNavigationListProps> = ({
  template = 'simple',
  categories,
  ...props
}) => {
  const getGroupBy = () => {
    switch (template) {
      case 'grouped':
        return (item: INavigationItem) => {
          // Grouper par type d'item ou par préfixe dans l'ID
          const parts = item.id.split('-')
          return parts.length > 1 ? parts[0] : null
        }
      
      case 'categorized':
        return (item: INavigationItem) => {
          if (!categories) return null
          
          for (const [categoryName, itemIds] of Object.entries(categories)) {
            if (itemIds.includes(item.id)) {
              return categoryName
            }
          }
          return 'Autres'
        }
      
      default:
        return undefined
    }
  }

  return (
    <NavigationList
      {...props}
      groupBy={getGroupBy()}
      showSeparators={template !== 'simple'}
    />
  )
}

/**
 * Factory pour créer des listes de navigation spécialisées
 * OCP: Extension par factory sans modification des composants
 */
export const createNavigationList = (
  config: {
    template?: 'simple' | 'grouped' | 'categorized'
    customRenderer?: (item: INavigationItem) => React.ReactNode
    groupFunction?: (item: INavigationItem) => string | null
  } = {}
) => {
  return function CreatedNavigationList(props: NavigationListProps) {
    return (
      <NavigationList
        {...props}
        groupBy={config.groupFunction}
        renderCustomItem={config.customRenderer ? 
          (item) => config.customRenderer!(item) : 
          undefined
        }
      />
    )
  }
}