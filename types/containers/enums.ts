/**
 * Énumérations pour le système de suivi des arrivées de conteneurs
 * Types pour les statuts, urgences et niveaux de santé
 * 
 * @module Containers/Enums
 * @version 2.0.0
 * @since 2025-01-06
 */

// ============================================================================
// Statuts d'arrivée des conteneurs
// ============================================================================

/**
 * Statut d'arrivée d'un conteneur dans son cycle de vie logistique
 * 
 * @example
 * ```typescript
 * const status: ContainerArrivalStatus = 'in_transit';
 * 
 * // Workflow typique:
 * // scheduled → in_transit → port_arrival → customs_clearance → ready_for_delivery → delivered
 * //                ↓              ↓              ↓               ↓
 * //             delayed      port_delay    customs_delay   delivery_delay
 * ```
 */
export type ContainerArrivalStatus = 
  | 'scheduled'           // Arrivée programmée, ETA établie
  | 'in_transit'          // En transit vers port de destination
  | 'delayed'             // Retard confirmé par compagnie maritime
  | 'port_arrival'        // Arrivé au port, en attente déchargement
  | 'port_delay'          // Retard au port (congestion, grèves)
  | 'customs_clearance'   // En cours de dédouanement
  | 'customs_delay'       // Retard douanier (vérifications, documents)
  | 'ready_for_delivery'  // Prêt pour enlèvement/livraison
  | 'delivery_delay'      // Retard livraison finale
  | 'delivered'           // Livré au client final
  | 'early'               // Arrivé en avance sur ETA
  | 'cancelled';          // Arrivée annulée (changement d'itinéraire)

// ============================================================================
// Indicateurs d'urgence et de criticité
// ============================================================================

/**
 * Niveau d'urgence d'un conteneur basé sur son statut d'arrivée
 * Utilisé pour prioriser les actions et communications client
 * 
 * @example
 * ```typescript
 * const urgency: ArrivalUrgency = 'high';
 * 
 * // Mapping avec actions automatiques:
 * // critical → escalade immédiate + notification SMS
 * // high → notification email + suivi quotidien  
 * // medium → notification standard + suivi hebdomadaire
 * // low → pas d'action automatique
 * ```
 */
export type ArrivalUrgency = 
  | 'critical'    // Critique - action immédiate requise
  | 'high'        // Élevé - attention rapide nécessaire
  | 'medium'      // Moyen - suivi standard
  | 'low';        // Faible - surveillance passive

/**
 * Sévérité d'un retard de conteneur
 * Détermine le niveau d'escalade et les actions correctives
 * 
 * @example
 * ```typescript
 * const severity: DelaySeverity = 'major';
 * 
 * // Seuils standards:
 * // critical: >= 7 jours (escalade direction + compensation client)
 * // major: >= 3 jours (alerte manager + plan d'action)
 * // moderate: >= 1 jour (notification équipe + suivi)
 * // minor: < 1 jour (information seulement)
 * ```
 */
export type DelaySeverity = 
  | 'critical'    // Critique >= 7 jours
  | 'major'       // Majeur >= 3 jours
  | 'moderate'    // Modéré >= 1 jour
  | 'minor';      // Mineur < 1 jour

/**
 * Niveau d'urgence détaillé avec labels d'interface utilisateur
 * Version localisée pour affichage dashboard et rapports
 * 
 * @example
 * ```typescript
 * const level: ContainerUrgencyLevel = 'critical_delay';
 * 
 * // Codes couleur UI:
 * // critical_delay, high_delay: rouge
 * // delayed, arriving_tomorrow: orange  
 * // arriving_soon: jaune
 * // scheduled: vert
 * // arrived, no_eta: gris
 * ```
 */
export type ContainerUrgencyLevel = 
  | 'arrived'          // Arrivé - processus terminé
  | 'no_eta'           // Pas d'ETA - suivi compagnie requis
  | 'critical_delay'   // Retard critique > 7 jours
  | 'high_delay'       // Retard élevé 3-7 jours
  | 'delayed'          // En retard 1-3 jours
  | 'arriving_tomorrow'// Arrive demain - préparation livraison
  | 'arriving_soon'    // Arrive bientôt 2-7 jours
  | 'scheduled';       // Programmé > 7 jours

// ============================================================================
// Indicateurs de santé des conteneurs
// ============================================================================

/**
 * Statut de santé globale d'un conteneur ou d'un portefeuille de conteneurs
 * Indicateur synthétique pour dashboards et alertes
 * 
 * @example
 * ```typescript
 * const health: ContainerHealthStatus = 'at_risk';
 * 
 * // Algorithme de calcul de santé:
 * // healthy: ETA à temps, pas de retard, documentation complète
 * // at_risk: retard potentiel, ETA proche, documentation manquante
 * // problematic: retards confirmés, multiples alertes
 * // critical: retards majeurs, escalade requise
 * ```
 */
export type ContainerHealthStatus = 
  | 'healthy'       // Sain - aucun problème détecté
  | 'at_risk'       // À risque - surveillance renforcée
  | 'problematic'   // Problématique - action corrective requise
  | 'critical';     // Critique - intervention immédiate

/**
 * Priorité d'une alerte dans le système
 * Détermine l'ordre de traitement et le niveau d'escalade
 * 
 * @example
 * ```typescript
 * const priority: AlertPriority = 'high';
 * 
 * // SLA de traitement:
 * // critical: < 1 heure (escalade automatique)
 * // high: < 4 heures (notification manager)
 * // medium: < 24 heures (suivi standard)
 * // low: < 72 heures (traitement différé)
 * ```
 */
export type AlertPriority = 
  | 'critical'      // Critique - traitement immédiat
  | 'high'          // Élevé - traitement prioritaire
  | 'medium'        // Moyen - traitement standard
  | 'low';          // Faible - traitement différé

/**
 * Canal de notification disponible pour communications
 * Support multi-canal avec fallback automatique
 * 
 * @example
 * ```typescript
 * const channels: NotificationChannel[] = ['email', 'sms'];
 * 
 * // Configuration par type d'alerte:
 * // Retard critique: SMS + email + push
 * // ETA changé: email + push
 * // Arrivée confirmée: email + webhook
 * // Information générale: push seulement
 * ```
 */
export type NotificationChannel = 
  | 'email'         // Email - communication détaillée
  | 'sms'           // SMS - alertes urgentes courtes
  | 'push'          // Push notification - temps réel
  | 'webhook'       // Webhook - intégration système
  | 'phone';        // Appel téléphonique - escalade ultime