/**
 * Types pour les métriques et statistiques des arrivées
 * Analyses de performance et indicateurs KPI
 * 
 * @module Containers/Metrics
 * @version 2.0.0
 * @since 2025-01-06
 */

// ============================================================================
// Métriques et statistiques des arrivées
// ============================================================================

/**
 * Métriques de performance des arrivées par période
 */
export interface ArrivalPerformanceMetrics {
  period_start: string;
  period_end: string;
  
  // Volumes
  total_containers: number;
  containers_arrived: number;
  containers_delayed: number;
  containers_early: number;
  containers_on_time: number;
  
  // Taux de performance
  on_time_delivery_rate: number;      // Pourcentage
  early_arrival_rate: number;
  delay_rate: number;
  
  // Temps moyens
  average_delay_days: number;
  average_early_days: number;
  longest_delay_days: number;
  
  // Distribution des retards
  delay_distribution: {
    minor_delays: number;             // 1-2 jours
    moderate_delays: number;          // 3-6 jours
    major_delays: number;             // 7+ jours
  };
  
  // Top des causes de retard
  top_delay_reasons: Array<{
    reason: string;
    count: number;
    average_delay_days: number;
    percentage_of_total: number;
  }>;
  
  // Performance par compagnie maritime
  by_shipping_company: Array<{
    company_id: string;
    company_name: string;
    total_containers: number;
    on_time_rate: number;
    average_delay_days: number;
    ranking: number;
  }>;
  
  // Tendances
  trend_analysis: {
    volume_trend: 'increasing' | 'stable' | 'decreasing';
    performance_trend: 'improving' | 'stable' | 'declining';
    delay_trend: 'reducing' | 'stable' | 'increasing';
  };
}

/**
 * Insights et analyses de performance pour un conteneur
 */
export interface ContainerPerformanceInsights {
  container_id: string;
  
  // Score de performance global
  performance_score: number;          // 0-100
  performance_grade: 'A' | 'B' | 'C' | 'D' | 'F';
  
  // Comparaison avec benchmarks
  vs_company_average: number;         // Écart en jours
  vs_port_average: number;
  vs_historical_performance: number;
  
  // Prédictions
  predicted_arrival_accuracy: 'high' | 'medium' | 'low';
  confidence_interval_days: number;
  risk_factors: Array<{
    factor: string;
    risk_level: 'low' | 'medium' | 'high';
    description: string;
  }>;
  
  // Recommandations d'amélioration
  improvement_opportunities: Array<{
    category: 'communication' | 'tracking' | 'planning' | 'logistics';
    recommendation: string;
    potential_impact: 'minor' | 'moderate' | 'significant';
    implementation_effort: 'low' | 'medium' | 'high';
  }>;
  
  // Historique de performance
  historical_performance: {
    last_30_days_score: number;
    last_90_days_score: number;
    year_to_date_score: number;
    best_performance_period: string;
    worst_performance_period: string;
  };
}