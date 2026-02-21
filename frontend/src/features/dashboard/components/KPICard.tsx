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
  colorClass = 'text-slate-600 bg-slate-100 ring-1 ring-slate-200'
}: KPICardProps) {

  const trendColors = {
    up: 'text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full ring-1 ring-emerald-200',
    down: 'text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full ring-1 ring-rose-200',
    neutral: 'text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full ring-1 ring-slate-200'
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group relative overflow-hidden">
      <div className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 bg-gradient-to-br from-slate-50 to-slate-100 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className={`p-3.5 rounded-xl shadow-sm ${colorClass}`}>
            <Icon className="w-6 h-6" strokeWidth={2.5} />
          </div>
          {trend && (
            <div className={`flex items-center space-x-1 text-xs font-bold ${trendColors[trendDirection]}`}>
              {TrendIcon && <TrendIcon className="w-3.5 h-3.5" />}
              <span>{trend}</span>
            </div>
          )}
        </div>
        <div>
          <h3 className="text-slate-500 text-sm font-semibold mb-1 uppercase tracking-wider">{title}</h3>
          <p className="text-4xl font-black text-slate-800 tracking-tight group-hover:text-indigo-900 transition-colors">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {description && (
            <p className="mt-2 text-slate-400 text-xs font-medium">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
