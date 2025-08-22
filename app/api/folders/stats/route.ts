import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { StatsData, FolderStatEntry } from '@/types/api';

// GET /api/folders/stats - Récupérer les statistiques des dossiers
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const statsType = searchParams.get('type') || 'overview';
    const period = searchParams.get('period'); // format: YYYY-MM ou YYYY
    const transportType = searchParams.get('transport_type');
    const assigneeId = searchParams.get('assignee_id');

    let statsData: StatsData = {};

    switch (statsType) {
      case 'overview':
        // Statistiques générales d'aperçu
        const { data: overviewStats, error: overviewError } = await supabase
          .from('folder_stats_by_transport')
          .select('*');

        if (overviewError) {
          throw overviewError;
        }

        // Statistiques par statut
        const { data: statusStats, error: statusError } = await supabase
          .from('folders')
          .select('status')
          .is('deleted_at', null);

        if (statusError) {
          throw statusError;
        }

        // Calculer les statistiques par statut
        const statusCounts = statusStats?.reduce((acc: Record<string, number>, folder: FolderStatEntry) => {
          acc[folder.status] = (acc[folder.status] || 0) + 1;
          return acc;
        }, {});

        // Dossiers nécessitant attention
        const { data: attentionStats, error: attentionError } = await supabase
          .from('folders_requiring_attention')
          .select('attention_score, issues')
          .order('attention_score', { ascending: false })
          .limit(10);

        if (attentionError) {
          throw attentionError;
        }

        statsData = {
          by_transport: overviewStats,
          by_status: statusCounts,
          requiring_attention: attentionStats,
          summary: {
            total_folders: statusStats?.length || 0,
            high_attention_folders: attentionStats?.filter(f => f.attention_score > 50).length || 0
          }
        };
        break;

      case 'transport':
        // Statistiques détaillées par type de transport
        let transportQuery = supabase
          .from('folder_stats_by_transport')
          .select('*');

        if (transportType) {
          transportQuery = transportQuery.eq('transport_type', transportType);
        }

        const { data: transportStats, error: transportError } = await transportQuery;

        if (transportError) {
          throw transportError;
        }

        statsData = { by_transport: transportStats };
        break;

      case 'period':
        // Statistiques par période
        let periodQuery = supabase
          .from('folder_stats_by_period')
          .select('*')
          .order('period_start', { ascending: false })
          .limit(12); // 12 derniers mois

        if (period) {
          // Filtrer par période spécifique
          if (period.length === 4) {
            // Année complète
            periodQuery = periodQuery
              .gte('period_start', `${period}-01-01`)
              .lte('period_start', `${period}-12-31`);
          } else if (period.length === 7) {
            // Mois spécifique (YYYY-MM)
            periodQuery = periodQuery
              .gte('period_start', `${period}-01`)
              .lt('period_start', `${period}-31`);
          }
        }

        const { data: periodStats, error: periodError } = await periodQuery;

        if (periodError) {
          throw periodError;
        }

        statsData = { by_period: periodStats };
        break;

      case 'assignee':
        // Statistiques par assigné
        let assigneeQuery = supabase
          .from('folder_stats_by_assignee')
          .select('*');

        if (assigneeId) {
          assigneeQuery = assigneeQuery.eq('assigned_to', assigneeId);
        }

        const { data: assigneeStats, error: assigneeError } = await assigneeQuery;

        if (assigneeError) {
          throw assigneeError;
        }

        statsData = { by_assignee: assigneeStats };
        break;

      case 'stages':
        // Statistiques des étapes de traitement
        const { data: stageStats, error: stageError } = await supabase
          .from('folder_stage_statistics')
          .select('*');

        if (stageError) {
          throw stageError;
        }

        // Vue executive des étapes
        const { data: executiveStats, error: executiveError } = await supabase
          .from('executive_stage_dashboard')
          .select('*');

        if (executiveError) {
          throw executiveError;
        }

        // Alertes par étapes
        const { data: alertStats, error: alertError } = await supabase
          .from('stage_alerts_dashboard')
          .select('*')
          .order('severity', { ascending: false })
          .limit(20);

        if (alertError) {
          throw alertError;
        }

        statsData = {
          stage_statistics: stageStats,
          executive_view: executiveStats,
          alerts: alertStats
        };
        break;

      case 'performance':
        // Métriques de performance
        const { data: progressStats, error: progressError } = await supabase
          .from('folders_with_stage_progress')
          .select(`
            folder_id, folder_number, completion_percentage,
            current_stage, estimated_completion_date, is_delayed
          `)
          .order('completion_percentage', { ascending: true });

        if (progressError) {
          throw progressError;
        }

        // Calculer les métriques agrégées
        const totalFolders = progressStats?.length || 0;
        const completedFolders = progressStats?.filter(f => f.completion_percentage === 100).length || 0;
        const delayedFolders = progressStats?.filter(f => f.is_delayed).length || 0;
        const averageProgress = totalFolders > 0 
          ? progressStats.reduce((sum, f) => sum + f.completion_percentage, 0) / totalFolders 
          : 0;

        statsData = {
          folders_progress: progressStats,
          summary: {
            total_folders: totalFolders,
            completed_folders: completedFolders,
            delayed_folders: delayedFolders,
            average_progress: Math.round(averageProgress * 100) / 100,
            completion_rate: totalFolders > 0 ? Math.round((completedFolders / totalFolders) * 100) : 0,
            delay_rate: totalFolders > 0 ? Math.round((delayedFolders / totalFolders) * 100) : 0
          }
        };
        break;

      default:
        return NextResponse.json(
          { error: 'Type de statistique non supporté. Types disponibles: overview, transport, period, assignee, stages, performance' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      type: statsType,
      data: statsData,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' }, 
      { status: 500 }
    );
  }
}