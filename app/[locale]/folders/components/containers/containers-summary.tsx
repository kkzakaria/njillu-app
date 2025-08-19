'use client';

import React from 'react';
import { Package, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  label: string;
  value: string | number;
  status?: 'success' | 'warning' | 'danger' | 'info';
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

interface ContainersSummaryProps {
  totalContainers: number;
  totalTEU: number;
  inTransit: number;
  delayed: number;
  arrived: number;
  className?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  label, 
  value, 
  status = 'info', 
  icon: Icon = Package,
  className 
}) => {
  const statusClasses = {
    success: 'border-green-200 bg-green-50',
    warning: 'border-orange-200 bg-orange-50',
    danger: 'border-red-200 bg-red-50',
    info: 'border-blue-200 bg-blue-50'
  };

  const textClasses = {
    success: 'text-green-800',
    warning: 'text-orange-800',
    danger: 'text-red-800',
    info: 'text-blue-800'
  };

  const iconClasses = {
    success: 'text-green-600',
    warning: 'text-orange-600',
    danger: 'text-red-600',
    info: 'text-blue-600'
  };

  return (
    <Card className={cn("p-4", statusClasses[status], className)}>
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-600">{label}</span>
          <span className={cn("text-2xl font-bold", textClasses[status])}>{value}</span>
        </div>
        <Icon className={cn("w-6 h-6", iconClasses[status])} />
      </div>
    </Card>
  );
};

export const ContainersSummary: React.FC<ContainersSummaryProps> = ({ 
  totalContainers,
  totalTEU,
  inTransit,
  delayed,
  arrived,
  className 
}) => {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4", className)}>
      <MetricCard 
        label="Total Conteneurs" 
        value={totalContainers} 
        status="info"
        icon={Package}
      />
      <MetricCard 
        label="TEU Total" 
        value={totalTEU.toFixed(1)} 
        status="info"
        icon={TrendingUp}
      />
      <MetricCard 
        label="En Transit" 
        value={inTransit} 
        status="warning"
        icon={Clock}
      />
      <MetricCard 
        label="En Retard" 
        value={delayed} 
        status={delayed > 0 ? 'danger' : 'success'}
        icon={AlertTriangle}
      />
      <MetricCard 
        label="Arrivés" 
        value={arrived} 
        status="success"
        icon={Package}
      />
    </div>
  );
};

export default ContainersSummary;