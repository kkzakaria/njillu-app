'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, LucideIcon } from 'lucide-react';

interface InfoSectionProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  className?: string;
}

export function InfoSection({
  title,
  icon: Icon,
  children,
  collapsible = false,
  defaultExpanded = true,
  className = ""
}: InfoSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <Card className={className}>
      <CardHeader className={collapsible ? "pb-3" : ""}>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Icon className="w-5 h-5 mr-2" />
            {title}
          </CardTitle>
          {collapsible && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="pt-0">
          {children}
        </CardContent>
      )}
    </Card>
  );
}

interface DataFieldProps {
  label: string;
  value?: string | number | null;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
}

export function DataField({ 
  label, 
  value, 
  placeholder = "Non renseigné",
  className = "",
  multiline = false
}: DataFieldProps) {
  const displayValue = value ?? placeholder;
  
  return (
    <div className={`space-y-1 ${className}`}>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`${multiline ? 'whitespace-pre-wrap' : ''} ${
        !value ? 'text-gray-400 italic' : ''
      }`}>
        {displayValue}
      </p>
    </div>
  );
}

interface StatusIndicatorProps {
  status: string;
  type?: 'success' | 'warning' | 'danger' | 'info' | 'default';
  className?: string;
}

export function StatusIndicator({ status, type = 'default', className = "" }: StatusIndicatorProps) {
  const getStatusColor = (statusType: string) => {
    switch (statusType) {
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      case 'warning':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100';
      case 'danger':
        return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
      case 'info':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  return (
    <span className={`inline-block px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(type)} ${className}`}>
      {status}
    </span>
  );
}

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  color?: 'blue' | 'green' | 'orange' | 'red';
  className?: string;
}

export function ProgressBar({ 
  value, 
  max = 100, 
  label, 
  showPercentage = true, 
  color = 'blue',
  className = ""
}: ProgressBarProps) {
  const percentage = Math.round((value / max) * 100);
  
  const getColorClasses = (colorName: string) => {
    switch (colorName) {
      case 'green':
        return 'bg-green-200 dark:bg-green-800';
      case 'orange':
        return 'bg-orange-200 dark:bg-orange-800';
      case 'red':
        return 'bg-red-200 dark:bg-red-800';
      default:
        return 'bg-blue-200 dark:bg-blue-800';
    }
  };

  const getProgressColor = (colorName: string) => {
    switch (colorName) {
      case 'green':
        return 'bg-green-600 dark:bg-green-400';
      case 'orange':
        return 'bg-orange-600 dark:bg-orange-400';
      case 'red':
        return 'bg-red-600 dark:bg-red-400';
      default:
        return 'bg-blue-600 dark:bg-blue-400';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">{label}</span>
          {showPercentage && (
            <span className="text-sm text-gray-600 dark:text-gray-400">{percentage}%</span>
          )}
        </div>
      )}
      <div className={`w-full h-2 rounded-full ${getColorClasses(color)}`}>
        <div 
          className={`h-full rounded-full transition-all duration-300 ${getProgressColor(color)}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface RiskBadgeProps {
  level: 'low' | 'medium' | 'high' | 'critical';
  className?: string;
}

export function RiskBadge({ level, className = "" }: RiskBadgeProps) {
  const getRiskConfig = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return {
          color: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
          label: 'Faible'
        };
      case 'medium':
        return {
          color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100',
          label: 'Moyen'
        };
      case 'high':
        return {
          color: 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100',
          label: 'Élevé'
        };
      case 'critical':
        return {
          color: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100',
          label: 'Critique'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
          label: 'Inconnu'
        };
    }
  };

  const config = getRiskConfig(level);
  
  return (
    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${config.color} ${className}`}>
      {config.label}
    </span>
  );
}