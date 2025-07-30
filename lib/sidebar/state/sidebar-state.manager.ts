// Gestionnaire d'état pour la sidebar selon SRP
import React, { useState, useCallback } from 'react'
import { ISidebarStateManager } from '@/types/sidebar.types'

/**
 * Implémentation du gestionnaire d'état de la sidebar
 * SRP: Responsabilité unique - gestion de l'état de la sidebar
 */
export class SidebarStateManager implements ISidebarStateManager {
  private _isExpanded: boolean = false
  private _isSheetOpen: boolean = false
  private listeners: Array<() => void> = []

  constructor(initialExpanded = false, initialSheetOpen = false) {
    this._isExpanded = initialExpanded
    this._isSheetOpen = initialSheetOpen
  }

  get isExpanded(): boolean {
    return this._isExpanded
  }

  get isSheetOpen(): boolean {
    return this._isSheetOpen
  }

  setExpanded(expanded: boolean): void {
    if (this._isExpanded !== expanded) {
      this._isExpanded = expanded
      this.notifyListeners()
    }
  }

  setSheetOpen(open: boolean): void {
    if (this._isSheetOpen !== open) {
      this._isSheetOpen = open
      this.notifyListeners()
    }
  }

  toggleExpansion(): void {
    this.setExpanded(!this._isExpanded)
  }

  toggleSheet(): void {
    this.setSheetOpen(!this._isSheetOpen)
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener())
  }

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener)
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }
}

/**
 * Hook React pour utiliser le gestionnaire d'état sidebar
 * Intégration avec React tout en respectant SRP
 */
export const useSidebarState = (
  initialExpanded = false,
  initialSheetOpen = false
): ISidebarStateManager & { 
  forceUpdate: () => void
} => {
  const [, setUpdateTrigger] = useState(0)
  const [stateManager] = useState(() => new SidebarStateManager(initialExpanded, initialSheetOpen))

  const forceUpdate = useCallback(() => {
    setUpdateTrigger(prev => prev + 1)
  }, [])

  // Subscribe to state changes
  React.useEffect(() => {
    const unsubscribe = stateManager.subscribe(() => {
      forceUpdate()
    })
    return unsubscribe
  }, [stateManager, forceUpdate])

  return {
    isExpanded: stateManager.isExpanded,
    isSheetOpen: stateManager.isSheetOpen,
    setExpanded: stateManager.setExpanded.bind(stateManager),
    setSheetOpen: stateManager.setSheetOpen.bind(stateManager),
    toggleExpansion: stateManager.toggleExpansion.bind(stateManager),
    toggleSheet: stateManager.toggleSheet.bind(stateManager),
    forceUpdate
  }
}

/**
 * Factory pour créer un gestionnaire d'état
 * SRP: Factory spécialisée dans la création de gestionnaires d'état
 */
export const createSidebarStateManager = (
  initialExpanded = false,
  initialSheetOpen = false
): ISidebarStateManager => {
  return new SidebarStateManager(initialExpanded, initialSheetOpen)
}