import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  trend?: string;
  trendIcon?: LucideIcon;
  trendDirection?: 'up' | 'down' | 'neutral';
  colorClass?: string;
}

export function KPICard({
  title,
  value,
  icon: Icon,
  trend,
  trendIcon: TrendIcon,
  trendDirection = 'neutral',
  colorClass = 'text-slate-600 bg-slate-100'
}: KPICardProps) {

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-slate-500'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 transition-all hover:shadow-md">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-lg ${colorClass}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 text-sm font-medium ${trendColors[trendDirection]}`}>
            {TrendIcon && <TrendIcon className="w-4 h-4" />}
            <span>{trend}</span>
          </div>
        )}
      </div>
      <div>
        <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
        <p className="text-3xl font-bold text-slate-800 tracking-tight">{value}</p>
      </div>
    </div>
  );
}
