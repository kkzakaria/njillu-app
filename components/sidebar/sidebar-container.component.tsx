// Composant conteneur pour la sidebar selon SRP et OCP
'use client'

import React, { ReactNode } from 'react'
import { SidebarConfig, Breakpoint } from '@/types/sidebar.types'

/**
 * Props pour le composant SidebarContainer
 * ISP: Interface spécifique au conteneur
 */
interface SidebarContainerProps {
  isExpanded: boolean
  isVisible: boolean
  config: SidebarConfig
  currentBreakpoint: Breakpoint
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  children: ReactNode
  className?: string
}

/**
 * Composant conteneur pour la sidebar
 * SRP: Responsabilité unique - gestion du conteneur et du layout
 * OCP: Extensible par composition sans modification
 */
export const SidebarContainer: React.FC<SidebarContainerProps> = ({
  isExpanded,
  isVisible,
  config,
  currentBreakpoint,
  onMouseEnter,
  onMouseLeave,
  children,
  className = ''
}) => {
  const {
    position,
    collapsedWidth,
    expandedWidth,
    animationDuration
  } = config

  // Classes CSS dynamiques basées sur la configuration
  const containerClasses = [
    'fixed top-0 h-full bg-white dark:bg-gray-900',
    'border-gray-200 dark:border-gray-700 z-30',
    'transition-all ease-in-out',
    position === 'left' ? 'left-0 border-r' : 'right-0 border-l',
    isVisible ? 'translate-x-0' : position === 'left' ? '-translate-x-full' : 'translate-x-full',
    className
  ].join(' ')

  const width = isExpanded ? expandedWidth : collapsedWidth

  const containerStyle: React.CSSProperties = {
    width: `${width}px`,
    transitionDuration: `${animationDuration}ms`
  }

  // Gestion du hover seulement sur desktop
  const handleMouseEnter = () => {
    if (currentBreakpoint === 'desktop' && onMouseEnter) {
      onMouseEnter()
    }
  }

  const handleMouseLeave = () => {
    if (currentBreakpoint === 'desktop' && onMouseLeave) {
      onMouseLeave()
    }
  }

  return (
    <div
      className={containerClasses}
      style={containerStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  )
}

/**
 * Composant pour l'overlay mobile/tablet
 * SRP: Responsabilité unique - gestion de l'overlay
 */
interface SidebarOverlayProps {
  isOpen: boolean
  onClose: () => void
  className?: string
}

export const SidebarOverlay: React.FC<SidebarOverlayProps> = ({
  isOpen,
  onClose,
  className = ''
}) => {
  if (!isOpen) return null

  return (
    <div 
      className={`
        fixed inset-0 bg-black/50 z-40 lg:hidden
        transition-opacity duration-300
        ${className}
      `}
      onClick={onClose}
    />
  )
}

/**
 * Composant pour le sheet mobile
 * SRP: Responsabilité unique - gestion du sheet mobile
 */
interface SidebarSheetProps {
  isOpen: boolean
  onClose: () => void
  config: SidebarConfig
  title: string
  children: ReactNode
  className?: string
}

export const SidebarSheet: React.FC<SidebarSheetProps> = ({
  isOpen,
  onClose,
  config,
  title,
  children,
  className = ''
}) => {
  const { position, expandedWidth, animationDuration } = config

  const sheetClasses = [
    'fixed top-0 h-full bg-white dark:bg-gray-900 shadow-xl z-50',
    'transform transition-transform ease-in-out lg:hidden',
    position === 'left' ? 'left-0' : 'right-0',
    isOpen ? 'translate-x-0' : position === 'left' ? '-translate-x-full' : 'translate-x-full',
    className
  ].join(' ')

  const sheetStyle: React.CSSProperties = {
    width: `${expandedWidth}px`,
    transitionDuration: `${animationDuration}ms`
  }

  return (
    <>
      <SidebarOverlay isOpen={isOpen} onClose={onClose} />
      
      <div 
        className={sheetClasses}
        style={sheetStyle}
      >
        {/* En-tête du sheet */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <svg 
              className="w-5 h-5 text-gray-700 dark:text-gray-300" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Contenu du sheet */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </>
  )
}

/**
 * Hook pour gérer les dimensions du conteneur
 * SRP: Responsabilité unique - calcul des dimensions
 */
export const useSidebarDimensions = (
  isExpanded: boolean,
  config: SidebarConfig
) => {
  const { collapsedWidth, expandedWidth } = config
  
  return {
    width: isExpanded ? expandedWidth : collapsedWidth,
    marginClass: config.position === 'left' 
      ? `ml-${isExpanded ? Math.floor(expandedWidth / 4) : Math.floor(collapsedWidth / 4)}`
      : `mr-${isExpanded ? Math.floor(expandedWidth / 4) : Math.floor(collapsedWidth / 4)}`,
    widthPx: isExpanded ? expandedWidth : collapsedWidth
  }
}