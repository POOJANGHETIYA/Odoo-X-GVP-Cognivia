import { Trip } from '@/types';

interface TripsStatsProps {
  trips: Trip[];
}

export function TripsStats({ trips }: TripsStatsProps) {
  const completedCount = trips.filter(t => t.status === 'Completed').length;
  const totalCount = trips.length;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
      <div className="flex items-center gap-1">
        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      </div>
      <span className="text-slate-800 font-semibold">{completedCount}</span>
      <span className="text-slate-400">/</span>
      <span className="text-slate-500">{totalCount}</span>
    </div>
  );
}
