import { format } from 'date-fns';
import { Navigation2, Wrench, Clock, TrendingUp, Activity } from 'lucide-react';
import { KPICard } from './components/KPICard';
import { RevenueExpenseChart } from './components/RevenueExpenseChart';
import { SLAWarningsTable } from './components/SLAWarningsTable';
import { useDashboardKPIs } from './hooks/useDashboardData';

export function DashboardPage() {
  const { activeFleet, utilizationRate, maintenanceAlerts, pendingCargo, isLoading } = useDashboardKPIs();
  const today = format(new Date(), 'MMMM do, yyyy');

  return (
    <div className="space-y-8 pb-10 max-w-[1600px] mx-auto">
      {/* Dynamic Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <Activity className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Operational Overview</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Command Center</h1>
          <p className="text-zinc-500 text-sm mt-1 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" />
            {today}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center bg-zinc-100/80 border border-zinc-200 p-1 rounded-lg shadow-sm">
            <button className="px-4 py-1.5 text-xs font-bold bg-white text-zinc-900 rounded-md shadow-sm border border-zinc-200 transition-all">Today</button>
            <button className="px-4 py-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors">7D</button>
            <button className="px-4 py-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors">30D</button>
          </div>

          <div className="h-6 w-[1px] bg-zinc-200 mx-1 hidden sm:block" />

          <button className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-md text-xs shadow-sm shadow-indigo-100 transition-all active:scale-[0.98]">
            <TrendingUp className="w-3.5 h-3.5" />
            Export Monthly Report
          </button>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard
          title="Active Fleet"
          value={isLoading ? 0 : activeFleet}
          icon={Navigation2}
          description="Vehicles currently in transit"
          colorClass="bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-600/20"
          trend="+12%"
          trendDirection="up"
          trendIcon={TrendingUp}
        />
        <KPICard
          title="Maintenance Alerts"
          value={isLoading ? 0 : maintenanceAlerts}
          icon={Wrench}
          description="Vehicles requiring service"
          colorClass={maintenanceAlerts > 0 ? "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10" : "bg-zinc-50 text-zinc-600 ring-1 ring-inset ring-zinc-500/10"}
          trend={maintenanceAlerts > 0 ? "Needs Action" : "Healthy"}
          trendDirection={maintenanceAlerts > 0 ? "down" : "neutral"}
        />
        <KPICard
          title="Utilization Rate"
          value={isLoading ? '0%' : `${utilizationRate}%`}
          icon={Activity}
          description="Efficiency across all assets"
          colorClass="bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20"
          trend="+3.2%"
          trendDirection="up"
        />
        <KPICard
          title="Pending Cargo"
          value={isLoading ? 0 : pendingCargo}
          icon={Clock}
          description="Unassigned logistics units"
          colorClass="bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/30">
            <div>
              <h2 className="text-base font-bold text-zinc-900 tracking-tight">Financial Overview</h2>
              <p className="text-zinc-500 text-xs mt-0.5">Rolling 7-day revenue vs operational costs</p>
            </div>
            <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-3 py-1.5 rounded-md transition-colors border border-indigo-100 bg-white">
              Analytical View
            </button>
          </div>
          <div className="p-6 flex-1 bg-white">
            <RevenueExpenseChart />
          </div>
        </div>

        {/* SLA / Alerts Panel */}
        <div className="lg:col-span-1 bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden flex flex-col h-full">
          <div className="px-6 py-5 border-b border-zinc-100 bg-zinc-50/30">
            <h2 className="text-base font-bold text-zinc-900 tracking-tight flex items-center">
              <span className="relative flex h-2 w-2 mr-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
              </span>
              Priority SLA Alerts
            </h2>
            <p className="text-zinc-500 text-xs mt-0.5 ml-5">Immediate dispatcher attention required</p>
          </div>
          <div className="flex-1 bg-white overflow-auto">
            <SLAWarningsTable />
          </div>
        </div>
      </div>
    </div>
  );
}
