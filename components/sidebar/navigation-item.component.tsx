// Composant pour un élément de navigation selon SRP
'use client'

import React from 'react'
import { INavigationItem } from '@/types/sidebar.types'

/**
 * Props pour le composant NavigationItem
 * ISP: Interface spécifique aux éléments de navigation
 */
interface NavigationItemProps {
  item: INavigationItem
  isExpanded: boolean
  onClick?: (item: INavigationItem) => void
  className?: string
}

/**
 * Composant pour un élément de navigation
 * SRP: Responsabilité unique - affichage d'un élément de navigation
 * LSP: Respecte le contrat INavigationComponent
 */
export const NavigationItem: React.FC<NavigationItemProps> = ({
  item,
  isExpanded,
  onClick,
  className = ''
}) => {
  const { icon: Icon, labelKey, href, badge, isActive } = item

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (onClick) {
      onClick(item)
    } else if (href.startsWith('http')) {
      window.open(href, '_blank')
    } else {
      window.location.href = href
    }
  }

  return (
    <a
      href={href}
      onClick={handleClick}
      className={`
        flex items-center py-2 rounded-lg group relative
        text-foreground/70 hover:text-foreground 
        hover:bg-gray-200 dark:hover:bg-gray-800 hover:shadow-sm
        focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-gray-50 dark:focus:bg-gray-900
        transition-all duration-200 ease-in-out
        before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-primary 
        before:rounded-r-full before:scale-y-0 hover:before:scale-y-100 
        before:transition-transform before:duration-200 before:ease-in-out
        ${isActive ? 
          'bg-primary/10 text-primary hover:bg-primary/20 before:scale-y-100' :   
          ''
        }
        ${className}
      `}
    >
      {/* Zone icône TOUJOURS fixe (48px) pour position stable */}
      <div className="w-12 flex justify-center items-center flex-shrink-0">
        <div className="w-5 h-5 relative">
          <Icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200 ease-in-out" />
          {badge && (
            <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center shadow-sm animate-pulse">
              {typeof badge === 'number' && badge > 99 ? '99+' : badge}
            </span>
          )}
        </div>
      </div>

      {/* Label - synchronisé avec l'expansion du background */}
      <span className={`
        ml-2 text-sm font-medium whitespace-nowrap
        transition-all duration-300 ease-in-out
        group-hover:text-foreground
        ${isExpanded 
          ? 'opacity-100 translate-x-0 transition-delay-150' 
          : 'opacity-0 -translate-x-2 transition-delay-0'
        }
      `}>
        {labelKey}
      </span>
    </a>
  )
}

/**
 * Composant pour un séparateur de navigation
 * SRP: Responsabilité unique - affichage d'un séparateur
 */
export const NavigationSeparator: React.FC<{ className?: string }> = ({ 
  className = '' 
}) => (
  <div className={`my-2 border-t border-border/50 ${className}`} />
)

/**
 * Composant pour un groupe de navigation avec titre
 * SRP: Responsabilité unique - affichage d'un groupe de navigation
 */
interface NavigationGroupProps {
  title: string
  isExpanded: boolean
  children: React.ReactNode
  className?: string
}

export const NavigationGroup: React.FC<NavigationGroupProps> = ({
  title,
  isExpanded,
  children,
  className = ''
}) => (
  <div className={`space-y-2 ${className}`}>
    {isExpanded && (
      <h3 className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {title}
      </h3>
    )}
    <div className="space-y-1">
      {children}
    </div>
  </div>
)