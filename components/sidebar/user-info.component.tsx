// Composant pour les informations utilisateur selon SRP
'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { CurrentUserAvatar } from '@/components/current-user-avatar'
import { IUserDataProvider, IUserComponent } from '@/types/sidebar.types'

/**
 * Props pour le composant UserInfo
 * ISP: Interface spécifique aux informations utilisateur
 */
interface UserInfoProps extends IUserComponent {
  userDataProvider?: IUserDataProvider
  onClick?: () => void
  className?: string
}

/**
 * Composant pour afficher les informations utilisateur
 * SRP: Responsabilité unique - affichage des informations utilisateur
 * DIP: Utilise l'abstraction IUserDataProvider
 */
export const UserInfo: React.FC<UserInfoProps> = ({
  isExpanded,
  showAvatar = true,
  showName = true,
  showEmail = true,
  userDataProvider,
  onClick,
  className = ''
}) => {
  const [userName, setUserName] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [dataLoaded, setDataLoaded] = useState(false)
  
  // Référence pour éviter les re-fetches inutiles
  const lastProviderRef = useRef<IUserDataProvider | undefined>(undefined)

  // Mémoriser la fonction de fetch pour éviter les re-créations
  const fetchUserData = useCallback(async (provider: IUserDataProvider) => {
    if (!provider) return
    
    setLoading(true)
    try {
      const [name, email] = await Promise.all([
        showName ? provider.getUserName() : Promise.resolve(null),
        showEmail ? provider.getUserEmail() : Promise.resolve(null)
      ])
      
      setUserName(name)
      setUserEmail(email)
      setDataLoaded(true)
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }, [showName, showEmail])

  useEffect(() => {
    // Éviter le re-fetch si c'est le même provider et que les données sont déjà chargées
    if (!userDataProvider || 
        (userDataProvider === lastProviderRef.current && dataLoaded)) {
      return
    }

    lastProviderRef.current = userDataProvider
    fetchUserData(userDataProvider)
  }, [userDataProvider, fetchUserData, dataLoaded])

  if (loading) {
    return (
      <div className={`
        flex items-center rounded-lg
        ${showAvatar ? 'p-2' : ''}
        ${isExpanded ? '' : 'justify-center'} 
        ${className}
      `}>
        {showAvatar && (
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full animate-pulse" />
        )}
        {isExpanded && (
          <div className={`space-y-1 ${showAvatar ? 'ml-3' : ''}`}>
            {showName && (
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-24" />
            )}
            {showEmail && (
              <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-32" />
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div 
      className={`
        flex items-center rounded-lg cursor-pointer
        hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
        ${showAvatar ? 'p-2' : ''}
        ${isExpanded ? '' : 'justify-center'}
        ${className}
      `}
      onClick={onClick}
    >
      {showAvatar && <CurrentUserAvatar />}
      
      {isExpanded && (
        <div className={`overflow-hidden min-w-0 flex-1 ${showAvatar ? 'ml-3' : ''}`}>
          {showName && userName && (
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap overflow-hidden text-ellipsis">
              {userName}
            </p>
          )}
          {showEmail && userEmail && (
            <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap overflow-hidden text-ellipsis">
              {userEmail}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Composant simplifié pour l'avatar seul
 * SRP: Responsabilité unique - affichage de l'avatar
 */
interface UserAvatarProps {
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  className?: string
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  size = 'md',
  onClick,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  }

  return (
    <div 
      className={`
        ${sizeClasses[size]} cursor-pointer hover:opacity-80 transition-opacity
        ${className}
      `}
      onClick={onClick}
    >
      <CurrentUserAvatar />
    </div>
  )
}