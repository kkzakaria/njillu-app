/**
 * Gestionnaire de cache multi-niveau pour les dossiers
 * Hiérarchie: Memory → SessionStorage → IndexedDB → Network
 */

import type { FolderSummary, FolderApiCounters, FolderApiAttention } from '@/lib/services/folder-api'

// ============================================================================
// Types et interfaces
// ============================================================================

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
  version: string
}

interface CacheConfig {
  memory: {
    maxSize: number // Nombre max d'entrées en mémoire
    defaultTtl: number // TTL par défaut
  }
  session: {
    keyPrefix: string
    defaultTtl: number
  }
  indexeddb: {
    dbName: string
    version: number
    storeName: string
    defaultTtl: number
  }
}

type CacheType = 'folders' | 'counters' | 'attention' | 'search'

// Types de données pour chaque type de cache
type CacheDataMap = {
  folders: FolderSummary[]
  counters: FolderApiCounters[]
  attention: FolderApiAttention[]
  search: FolderSummary[]
}

// Type union de toutes les données possibles
type CacheData = CacheDataMap[keyof CacheDataMap]

// ============================================================================
// Configuration du cache
// ============================================================================

const CACHE_CONFIG: CacheConfig = {
  memory: {
    maxSize: 1000,
    defaultTtl: 5 * 60 * 1000, // 5 minutes
  },
  session: {
    keyPrefix: 'njillu_folder_cache',
    defaultTtl: 15 * 60 * 1000, // 15 minutes
  },
  indexeddb: {
    dbName: 'NjilluFolderCache',
    version: 1,
    storeName: 'folders',
    defaultTtl: 60 * 60 * 1000, // 1 heure
  }
}

const CACHE_VERSION = '1.0.0'

// ============================================================================
// Cache Memory (Niveau 1 - Plus rapide)
// ============================================================================

class MemoryCache {
  private cache = new Map<string, CacheEntry<unknown>>()
  private accessOrder = new Array<string>() // Pour LRU
  private readonly maxSize: number

  constructor(maxSize: number = CACHE_CONFIG.memory.maxSize) {
    this.maxSize = maxSize
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    // Vérifier l'expiration
    if (Date.now() > entry.timestamp + entry.ttl) {
      this.delete(key)
      return null
    }

    // Mettre à jour l'ordre d'accès (LRU)
    this.updateAccessOrder(key)
    
    return entry.data as T
  }

  set<T>(key: string, data: T, ttl: number = CACHE_CONFIG.memory.defaultTtl): void {
    // Nettoyer les entrées expirées avant d'ajouter
    this.cleanup()
    
    // Éviction LRU si nécessaire
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU()
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      version: CACHE_VERSION
    }

    this.cache.set(key, entry as CacheEntry<unknown>)
    this.updateAccessOrder(key)
  }

  delete(key: string): void {
    this.cache.delete(key)
    const index = this.accessOrder.indexOf(key)
    if (index > -1) {
      this.accessOrder.splice(index, 1)
    }
  }

  clear(): void {
    this.cache.clear()
    this.accessOrder = []
  }

  private updateAccessOrder(key: string): void {
    // Retirer de l'ancienne position
    const index = this.accessOrder.indexOf(key)
    if (index > -1) {
      this.accessOrder.splice(index, 1)
    }
    // Ajouter à la fin (plus récemment utilisé)
    this.accessOrder.push(key)
  }

  private evictLRU(): void {
    if (this.accessOrder.length > 0) {
      const lruKey = this.accessOrder[0]
      this.delete(lruKey)
    }
  }

  private cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.timestamp + entry.ttl) {
        keysToDelete.push(key)
      }
    }
    
    keysToDelete.forEach(key => this.delete(key))
  }

  // Métriques pour debugging
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.accessOrder.length > 0 ? this.cache.size / this.accessOrder.length : 0
    }
  }
}

// ============================================================================
// Cache SessionStorage (Niveau 2 - Persistant dans l'onglet)
// ============================================================================

class SessionStorageCache {
  private readonly keyPrefix: string

  constructor(keyPrefix: string = CACHE_CONFIG.session.keyPrefix) {
    this.keyPrefix = keyPrefix
  }

  get<T>(key: string): T | null {
    try {
      const fullKey = `${this.keyPrefix}_${key}`
      const item = sessionStorage.getItem(fullKey)
      
      if (!item) {
        return null
      }

      const entry: CacheEntry<T> = JSON.parse(item)
      
      // Vérifier l'expiration
      if (Date.now() > entry.timestamp + entry.ttl) {
        this.delete(key)
        return null
      }

      return entry.data
    } catch (error) {
      console.warn('SessionStorage cache get error:', error)
      return null
    }
  }

  set<T>(key: string, data: T, ttl: number = CACHE_CONFIG.session.defaultTtl): void {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl,
        version: CACHE_VERSION
      }

      const fullKey = `${this.keyPrefix}_${key}`
      sessionStorage.setItem(fullKey, JSON.stringify(entry))
    } catch (error) {
      console.warn('SessionStorage cache set error:', error)
      // Nettoyer si quota dépassé
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        this.cleanup()
      }
    }
  }

  delete(key: string): void {
    try {
      const fullKey = `${this.keyPrefix}_${key}`
      sessionStorage.removeItem(fullKey)
    } catch (error) {
      console.warn('SessionStorage cache delete error:', error)
    }
  }

  clear(): void {
    try {
      const keysToDelete: string[] = []
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key && key.startsWith(this.keyPrefix)) {
          keysToDelete.push(key)
        }
      }
      
      keysToDelete.forEach(key => sessionStorage.removeItem(key))
    } catch (error) {
      console.warn('SessionStorage cache clear error:', error)
    }
  }

  private cleanup(): void {
    try {
      const now = Date.now()
      const keysToDelete: string[] = []
      
      for (let i = 0; i < sessionStorage.length; i++) {
        const fullKey = sessionStorage.key(i)
        if (!fullKey || !fullKey.startsWith(this.keyPrefix)) continue
        
        const item = sessionStorage.getItem(fullKey)
        if (!item) continue
        
        try {
          const entry = JSON.parse(item)
          if (now > entry.timestamp + entry.ttl) {
            keysToDelete.push(fullKey)
          }
        } catch {
          // Entrée corrompue, la supprimer
          keysToDelete.push(fullKey)
        }
      }
      
      keysToDelete.forEach(key => sessionStorage.removeItem(key))
    } catch (error) {
      console.warn('SessionStorage cache cleanup error:', error)
    }
  }
}

// ============================================================================
// Gestionnaire de cache principal
// ============================================================================

export class FolderCacheManager {
  private memoryCache: MemoryCache
  private sessionCache: SessionStorageCache
  private isClient: boolean

  constructor() {
    this.memoryCache = new MemoryCache()
    this.sessionCache = new SessionStorageCache()
    this.isClient = typeof window !== 'undefined'
  }

  /**
   * Récupère une valeur du cache (essaie tous les niveaux)
   */
  async get<T>(key: string, type: CacheType): Promise<T | null> {
    const cacheKey = `${type}_${key}`

    // Niveau 1: Memory cache (le plus rapide)
    let data = this.memoryCache.get<T>(cacheKey)
    if (data) {
      return data
    }

    // Niveau 2: Session storage (si côté client)
    if (this.isClient) {
      data = this.sessionCache.get<T>(cacheKey)
      if (data) {
        // Remettre en memory cache pour les prochaines fois
        this.memoryCache.set(cacheKey, data)
        return data
      }
    }

    return null
  }

  /**
   * Stocke une valeur dans tous les niveaux de cache
   */
  async set<T>(key: string, data: T, type: CacheType, options?: {
    memoryTtl?: number
    sessionTtl?: number
  }): Promise<void> {
    const cacheKey = `${type}_${key}`
    
    // Stocker dans memory cache
    this.memoryCache.set(
      cacheKey, 
      data, 
      options?.memoryTtl || CACHE_CONFIG.memory.defaultTtl
    )

    // Stocker dans session cache (si côté client)
    if (this.isClient) {
      this.sessionCache.set(
        cacheKey, 
        data, 
        options?.sessionTtl || CACHE_CONFIG.session.defaultTtl
      )
    }
  }

  /**
   * Supprime une entrée de tous les caches
   */
  async delete(key: string, type: CacheType): Promise<void> {
    const cacheKey = `${type}_${key}`
    
    this.memoryCache.delete(cacheKey)
    if (this.isClient) {
      this.sessionCache.delete(cacheKey)
    }
  }

  /**
   * Vide un type de cache spécifique
   */
  async clear(type?: CacheType): Promise<void> {
    if (type) {
      // Clear seulement un type spécifique
      // TODO: Implémenter clear par type
      console.warn('Clear by type not yet implemented')
    } else {
      // Clear tout
      this.memoryCache.clear()
      if (this.isClient) {
        this.sessionCache.clear()
      }
    }
  }

  /**
   * Invalidation intelligente basée sur les relations
   */
  async invalidateRelated(type: CacheType, keys?: string[]): Promise<void> {
    // Logique d'invalidation basée sur les relations entre types de données
    switch (type) {
      case 'folders':
        // Quand les dossiers changent, invalider les compteurs et attention
        await this.clear('counters')
        await this.clear('attention')
        break
      case 'counters':
        // Les compteurs peuvent être invalidés seuls
        break
      case 'attention':
        // L'attention peut être invalidé seul
        break
      case 'search':
        // Les recherches peuvent être invalidées seules
        break
    }
  }

  /**
   * Préchargement intelligent des données
   */
  async warmCache<T extends CacheType>(
    type: T, 
    dataLoader: () => Promise<CacheDataMap[T]>
  ): Promise<void> {
    try {
      const data = await dataLoader()
      await this.set(`warm_${Date.now()}`, data, type)
    } catch (error) {
      console.warn('Cache warming failed:', error)
    }
  }

  /**
   * Métriques du cache pour monitoring
   */
  getMetrics() {
    return {
      memory: this.memoryCache.getStats(),
      sessionStorage: this.isClient ? {
        available: true,
        usage: this.getSessionStorageUsage()
      } : { available: false },
      isClient: this.isClient
    }
  }

  private getSessionStorageUsage(): number {
    if (!this.isClient) return 0
    
    let totalSize = 0
    try {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key && key.startsWith(CACHE_CONFIG.session.keyPrefix)) {
          const item = sessionStorage.getItem(key)
          if (item) {
            totalSize += item.length
          }
        }
      }
    } catch (error) {
      console.warn('Error calculating session storage usage:', error)
    }
    
    return totalSize
  }
}

// ============================================================================
// Export de l'instance singleton
// ============================================================================

export const folderCacheManager = new FolderCacheManager()

// Export des types pour utilisation externe
export type { CacheType, CacheEntry, CacheConfig }