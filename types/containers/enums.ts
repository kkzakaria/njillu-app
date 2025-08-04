/**
 * Enums pour le système de suivi des arrivées de conteneurs
 * Types pour les statuts, urgences et niveaux de santé
 */

// ============================================================================
// Statuts d'arrivée des conteneurs
// ============================================================================

export type ContainerArrivalStatus = 
  | 'scheduled'    // Arrivée programmée
  | 'delayed'      // Retard confirmé
  | 'arrived'      // Arrivé à destination
  | 'early'        // Arrivé en avance
  | 'cancelled';   // Arrivée annulée

// ============================================================================
// Indicateurs d'urgence et de criticité
// ============================================================================

export type ArrivalUrgency = 
  | 'Arrivé'
  | 'Pas d\'ETA'
  | 'En retard'
  | 'Aujourd\'hui'
  | 'Imminent'
  | 'Programmé';

export type DelaySeverity = 
  | 'Critique'     // >= 7 jours
  | 'Élevé'        // >= 3 jours
  | 'Modéré'       // >= 1 jour
  | 'Faible';      // < 1 jour

export type ContainerUrgencyLevel = 
  | 'Arrivé'
  | 'Pas d\'ETA'
  | 'Retard critique'
  | 'Retard élevé'
  | 'En retard'
  | 'Arrive demain'
  | 'Arrive bientôt'
  | 'Programmé';

// ============================================================================
// Indicateurs de santé des conteneurs
// ============================================================================

export type ContainerHealthStatus = 
  | 'Pas de conteneurs'
  | 'Conteneurs en retard'
  | 'Préparation urgente'
  | 'Tous arrivés'
  | 'Sous contrôle'
  | 'ETA manquants'
  | 'À vérifier';