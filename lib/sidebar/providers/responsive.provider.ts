// Service pour la détection responsive selon DIP
import { useEffect, useState } from 'react'
import { IResponsiveProvider, Breakpoint } from '@/types/sidebar.types'

/**
 * Implémentation du fournisseur responsive basé sur les media queries
 * DIP: Implémentation concrète de l'interface abstraite
 */
export class MediaQueryResponsiveProvider implements IResponsiveProvider {
  private mobileBreakpoint: number
  private tabletBreakpoint: number
  private listeners: Array<(breakpoint: Breakpoint) => void> = []

  constructor(mobileBreakpoint = 1024, tabletBreakpoint = 768) {
    this.mobileBreakpoint = mobileBreakpoint
    this.tabletBreakpoint = tabletBreakpoint
    
    if (typeof window !== 'undefined') {
      this.setupListeners()
    }
  }

  private setupListeners() {
    const handleResize = () => {
      const currentBreakpoint = this.getCurrentBreakpoint()
      this.listeners.forEach(listener => listener(currentBreakpoint))
    }

    window.addEventListener('resize', handleResize)
    
    // Cleanup sera géré par le composant qui utilise ce provider
    return () => window.removeEventListener('resize', handleResize)
  }

  private getCurrentBreakpoint(): Breakpoint {
    if (typeof window === 'undefined') return 'desktop'
    
    const width = window.innerWidth
    
    if (width < this.tabletBreakpoint) return 'mobile'
    if (width < this.mobileBreakpoint) return 'tablet'
    return 'desktop'
  }

  isMobile(): boolean {
    return this.getCurrentBreakpoint() === 'mobile'
  }

  isTablet(): boolean {
    return this.getCurrentBreakpoint() === 'tablet'
  }

  isDesktop(): boolean {
    return this.getCurrentBreakpoint() === 'desktop'
  }

  onBreakpointChange(callback: (breakpoint: Breakpoint) => void): () => void {
    this.listeners.push(callback)
    
    // Retourner une fonction de cleanup
    return () => {
      const index = this.listeners.indexOf(callback)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }
}

/**
 * Hook React pour utiliser le responsive provider
 * Intégration avec React tout en respectant DIP
 */
export const useResponsiveProvider = (
  mobileBreakpoint = 1024,
  tabletBreakpoint = 768
): IResponsiveProvider & { currentBreakpoint: Breakpoint } => {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>('desktop')
  const [provider] = useState(() => new MediaQueryResponsiveProvider(mobileBreakpoint, tabletBreakpoint))

  useEffect(() => {
    const cleanup = provider.onBreakpointChange((breakpoint) => {
      setCurrentBreakpoint(breakpoint)
    })

    // Set initial breakpoint
    if (typeof window !== 'undefined') {
      setCurrentBreakpoint(
        provider.isMobile() ? 'mobile' :
        provider.isTablet() ? 'tablet' : 'desktop'
      )
    }

    return cleanup
  }, [provider])

  return {
    isMobile: provider.isMobile.bind(provider),
    isTablet: provider.isTablet.bind(provider),
    isDesktop: provider.isDesktop.bind(provider),
    onBreakpointChange: provider.onBreakpointChange.bind(provider),
    currentBreakpoint
  }
}

/**
 * Factory pour créer le provider responsive
 * DIP: Factory pattern pour l'injection de dépendance
 */
export const createResponsiveProvider = (
  mobileBreakpoint = 1024,
  tabletBreakpoint = 768
): IResponsiveProvider => {
  return new MediaQueryResponsiveProvider(mobileBreakpoint, tabletBreakpoint)
}