'use client'

import { Users, User, Building2, Activity, Archive, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useClients } from '@/hooks/useTranslation';

interface ClientStatsProps {
  stats: {
    total: number;
    active: number;
    inactive: number;
    archived: number;
    individuals: number;
    businesses: number;
  };
}

export function ClientStats({ stats }: ClientStatsProps) {
  const t = useClients();

  const statItems = [
    {
      label: t('statistics.total'),
      value: stats.total,
      icon: Users,
      color: 'text-blue-600'
    },
    {
      label: t('statistics.active'),
      value: stats.active,
      icon: Activity,
      color: 'text-green-600'
    },
    {
      label: t('statistics.inactive'),
      value: stats.inactive,
      icon: AlertCircle,
      color: 'text-orange-600'
    },
    {
      label: t('statistics.archived'),
      value: stats.archived,
      icon: Archive,
      color: 'text-gray-600'
    },
    {
      label: t('statistics.individuals'),
      value: stats.individuals,
      icon: User,
      color: 'text-purple-600'
    },
    {
      label: t('statistics.businesses'),
      value: stats.businesses,
      icon: Building2,
      color: 'text-indigo-600'
    }
  ];

  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
      {statItems.map((item) => (
        <Card key={item.label} className="p-2">
          <CardContent className="p-0">
            <div className="flex flex-col items-center text-center space-y-1">
              <item.icon className={`h-4 w-4 ${item.color}`} />
              <div className="text-lg font-semibold">{item.value}</div>
              <div className="text-xs text-muted-foreground leading-tight">
                {item.label}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}