"use client"

import React, { useState, useEffect } from 'react';
import { 
  Home, 
  User, 
  Settings, 
  FileText, 
  BarChart3, 
  Shield, 
  HelpCircle,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useNavigation } from "@/hooks/useTranslation"
import { CurrentUserAvatar } from "@/components/current-user-avatar"
import { useCurrentUserName } from "@/hooks/use-current-user-name"
import { createClient } from "@/lib/supabase/client"

// Composant UserInfo pour afficher les informations utilisateur
const UserInfo = ({ isExpanded }: { isExpanded: boolean }) => {
  const userName = useCurrentUserName()
  const [userEmail, setUserEmail] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchUserEmail = async () => {
      const { data } = await createClient().auth.getSession()
      setUserEmail(data.session?.user.email ?? null)
    }
    fetchUserEmail()
  }, [])

  return (
    <>
      <p 
        className={`
          text-sm font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap
          transition-all duration-300 ease-in-out
          ${isExpanded 
            ? 'opacity-100 w-auto' 
            : 'opacity-0 w-0'
          }
        `}
      >
        {userName}
      </p>
      <p 
        className={`
          text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap
          transition-all duration-300 ease-in-out
          ${isExpanded 
            ? 'opacity-100 w-auto' 
            : 'opacity-0 w-0'
          }
        `}
      >
        {userEmail}
      </p>
    </>
  )
}

export function AppSidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const t = useNavigation()

  // Détecter la taille d'écran
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const menuItems = [
    { icon: Home, label: t('dashboard'), href: '/dashboard' },
    { icon: User, label: t('profile'), href: '/profile' },
    { icon: FileText, label: t('documents'), href: '/documents' },
    { icon: BarChart3, label: t('analytics'), href: '/analytics' },
    { icon: Shield, label: t('security'), href: '/security' },
    { icon: Settings, label: t('settings'), href: '/settings' },
    { icon: HelpCircle, label: t('help'), href: '/help' },
    { icon: LogOut, label: t('logout'), href: '/logout' },
  ];

  // Composant MenuItem réutilisable
  const MenuItem = ({ icon: Icon, label, href, showLabel = false }: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    href: string;
    showLabel?: boolean;
  }) => (
    <a
      href={href}
      className="
        flex items-center px-2 py-2 rounded-lg
        text-gray-700 hover:text-gray-900 hover:bg-gray-100
        dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-800
        transition-colors duration-300 group
      "
    >
      <div className="w-5 h-5 flex-shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <span 
        className={`
          ml-3 text-sm font-medium whitespace-nowrap
          transition-all duration-300 ease-in-out
          ${showLabel 
            ? 'opacity-100 w-auto' 
            : 'opacity-0 w-0 overflow-hidden'
          }
        `}
      >
        {label}
      </span>
    </a>
  );

  // Sheet overlay pour mobile/tablette
  const Sheet = ({ isOpen, onClose, children }: {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
  }) => (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sheet content */}
      <div className={`
        fixed top-0 left-0 h-full bg-white dark:bg-gray-900 shadow-xl z-50
        transform transition-transform duration-300 ease-in-out
        lg:hidden w-64
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>
        {children}
      </div>
    </>
  );

  return (
    <>
      {/* Bouton menu mobile */}
      {isMobile && (
        <button
          onClick={() => setIsSheetOpen(true)}
          className="fixed top-4 left-4 z-30 p-2 bg-white dark:bg-gray-900 rounded-lg shadow-md lg:hidden border border-gray-200 dark:border-gray-700"
        >
          <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        </button>
      )}

      {/* Sidebar Desktop */}
      {!isMobile && (
        <div
          className={`
            fixed left-0 top-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700
            transition-all duration-300 ease-in-out z-30
            ${isExpanded ? 'w-64' : 'w-16'}
          `}
          onMouseEnter={() => setIsExpanded(true)}
          onMouseLeave={() => setIsExpanded(false)}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-start">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">A</span>
              </div>
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
                  Mon App
                </h1>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-2">
            {menuItems.map((item, index) => (
              <MenuItem
                key={index}
                icon={item.icon}
                label={item.label}
                href={item.href}
                showLabel={isExpanded}
              />
            ))}
          </nav>

          {/* Footer */}
          <div className="absolute bottom-4 left-0 right-0 px-2">
            <div className="flex items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
              <CurrentUserAvatar />
              <div className="ml-3 overflow-hidden">
                <UserInfo isExpanded={isExpanded} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sheet Mobile/Tablette */}
      <Sheet isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)}>
        <nav className="p-4 space-y-2">
          {menuItems.map((item, index) => (
            <MenuItem
              key={index}
              icon={item.icon}
              label={item.label}
              href={item.href}
              showLabel={true}
            />
          ))}
        </nav>

        {/* Footer Mobile */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
            <CurrentUserAvatar />
            <div>
              <UserInfo isExpanded={true} />
            </div>
          </div>
        </div>
      </Sheet>
    </>
  );
}