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
        flex items-center px-2 py-2 rounded-lg group
        text-gray-700 hover:text-gray-900 hover:bg-gray-100
        dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-800
        transition-colors duration-300
        ${isActive ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' : ''}
        ${className}
      `}
    >
      {/* Icône - toujours visible */}
      <div className="w-5 h-5 flex-shrink-0 relative">
        <Icon className="w-5 h-5" />
        {badge && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            {typeof badge === 'number' && badge > 99 ? '99+' : badge}
          </span>
        )}
      </div>

      {/* Label - visible selon l'état d'expansion */}
      <span 
        className={`
          ml-3 text-sm font-medium whitespace-nowrap
          transition-all duration-300 ease-in-out
          ${isExpanded 
            ? 'opacity-100 w-auto' 
            : 'opacity-0 w-0 overflow-hidden'
          }
        `}
      >
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
  <div className={`my-2 border-t border-gray-200 dark:border-gray-700 ${className}`} />
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
      <h3 className="px-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
        {title}
      </h3>
    )}
    <div className="space-y-1">
      {children}
    </div>
  </div>
)