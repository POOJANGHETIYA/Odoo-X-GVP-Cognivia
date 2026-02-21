import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  trend?: string;
  trendIcon?: LucideIcon;
  trendDirection?: 'up' | 'down' | 'neutral';
  colorClass?: string;
}

export function KPICard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  trendIcon: TrendIcon,
  trendDirection = 'neutral',
  colorClass = 'text-zinc-600 bg-zinc-100 ring-1 ring-zinc-200'
}: KPICardProps) {

  const trendColors = {
    up: 'text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full ring-1 ring-inset ring-emerald-600/20',
    down: 'text-red-700 bg-red-50 px-2 py-0.5 rounded-full ring-1 ring-inset ring-red-600/10',
    neutral: 'text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded-full ring-1 ring-inset ring-zinc-500/10'
  };

  return (
    <div className="bg-white rounded-lg border border-zinc-200 shadow-sm p-5 hover:border-zinc-300 transition-all duration-200 group relative">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg ${colorClass}`}>
          <Icon className="w-5 h-5" strokeWidth={2} />
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 text-[11px] font-bold ${trendColors[trendDirection]}`}>
            {TrendIcon && <TrendIcon className="w-3 h-3" />}
            <span>{trend}</span>
          </div>
        )}
      </div>
      <div>
        <h3 className="text-zinc-500 text-sm font-medium mb-1">{title}</h3>
        <p className="text-3xl font-bold text-zinc-900 tabular-nums tracking-tight">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {description && (
          <p className="mt-2 text-zinc-400 text-[11px] font-medium tracking-wide flex items-center">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
