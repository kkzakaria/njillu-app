// Composant pour l'en-tête de la sidebar selon SRP
'use client'

import React from 'react'
import Image from 'next/image'

/**
 * Props pour le composant SidebarHeader
 * ISP: Interface spécifique à l'en-tête
 */
interface SidebarHeaderProps {
  title: string
  logo?: React.ReactNode | string
  isExpanded: boolean
  onClick?: () => void
  className?: string
}

/**
 * Composant pour l'en-tête de la sidebar
 * SRP: Responsabilité unique - affichage de l'en-tête
 */
export const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  title,
  logo,
  isExpanded,
  onClick,
  className = ''
}) => {
  const renderLogo = () => {
    if (!logo) {
      // Logo par défaut avec la première lettre du titre
      return (
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-bold">
            {title.charAt(0).toUpperCase()}
          </span>
        </div>
      )
    }

    if (typeof logo === 'string') {
      return (
        <Image 
          src={logo} 
          alt={title}
          width={32}
          height={32}
          className="w-8 h-8 rounded-lg flex-shrink-0 object-cover"
        />
      )
    }

    return logo
  }

  return (
    <div 
      className={`
        p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer
        hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors
        ${className}
      `}
      onClick={onClick}
    >
      <div className="flex items-center">
        {renderLogo()}
        
        <div className="ml-3 overflow-hidden">
          <h1 
            className={`
              text-lg font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap
              transition-all duration-300 ease-in-out
              ${isExpanded 
                ? 'opacity-100 w-auto' 
                : 'opacity-0 w-0'
              }
            `}
          >
            {title}
          </h1>
        </div>
      </div>
    </div>
  )
}

/**
 * Composant pour un logo simple
 * SRP: Responsabilité unique - affichage du logo
 */
interface LogoProps {
  src?: string
  alt: string
  size?: 'sm' | 'md' | 'lg'
  fallbackText?: string
  className?: string
}

export const Logo: React.FC<LogoProps> = ({
  src,
  alt,
  size = 'md',
  fallbackText,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  }

  if (src) {
    const dimensions = {
      sm: { width: 24, height: 24 },
      md: { width: 32, height: 32 },
      lg: { width: 40, height: 40 }
    }
    
    return (
      <Image 
        src={src} 
        alt={alt}
        width={dimensions[size].width}
        height={dimensions[size].height}
        className={`${sizeClasses[size]} rounded-lg object-cover ${className}`}
      />
    )
  }

  const displayText = fallbackText || alt.charAt(0).toUpperCase()

  return (
    <div className={`
      ${sizeClasses[size]} bg-blue-600 rounded-lg flex items-center justify-center
      ${className}
    `}>
      <span className="text-white text-sm font-bold">
        {displayText}
      </span>
    </div>
  )
}