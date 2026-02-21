import { format } from 'date-fns';
import { Navigation2, Wrench, Clock, TrendingUp, Activity } from 'lucide-react';
import { KPICard } from './components/KPICard';
import { RevenueExpenseChart } from './components/RevenueExpenseChart';
import { SLAWarningsTable } from './components/SLAWarningsTable';
import { useDashboardKPIs } from './hooks/useDashboardData';

export function DashboardPage() {
  const { activeFleet, utilizationRate, maintenanceAlerts, pendingCargo, isLoading } = useDashboardKPIs();
  const today = format(new Date(), 'EEEE, MMMM do, yyyy');

  return (
    <div className="space-y-8 pb-8">
      {/* Premium Header Area */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 rounded-2xl p-8 shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-48 h-48 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-48 h-48 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>

        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <Activity className="w-8 h-8 text-indigo-200" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                Command Center
              </h1>
              <p className="text-indigo-200 text-sm mt-1 font-medium">{today}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-lg p-1 shadow-inner">
              <button className="px-5 py-2 text-sm font-semibold bg-indigo-500 text-white rounded-md shadow-sm">Today</button>
              <button className="px-5 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-md transition-colors">7 Days</button>
              <button className="px-5 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-md transition-colors">30 Days</button>
            </div>

            {/* Rapid Filters */}
            <div className="flex gap-2">
              <select className="bg-slate-800/50 border border-slate-700 text-indigo-100 text-[11px] font-bold uppercase tracking-wider rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-indigo-400">
                <option>All Types</option>
                <option>Truck</option>
                <option>Van</option>
                <option>Bike</option>
              </select>
              <select className="bg-slate-800/50 border border-slate-700 text-indigo-100 text-[11px] font-bold uppercase tracking-wider rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-indigo-400">
                <option>All Status</option>
                <option>On Trip</option>
                <option>Available</option>
                <option>In Shop</option>
              </select>
              <select className="bg-slate-800/50 border border-slate-700 text-indigo-100 text-[11px] font-bold uppercase tracking-wider rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-indigo-400">
                <option>All Regions</option>
                <option>North</option>
                <option>South</option>
                <option>East</option>
                <option>West</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Active Fleet"
          value={isLoading ? 0 : activeFleet}
          icon={Navigation2}
          description="Vehicles On Trip"
          colorClass="bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100"
          trend="+12%"
          trendDirection="up"
          trendIcon={TrendingUp}
        />
        <KPICard
          title="Maintenance Alerts"
          value={isLoading ? 0 : maintenanceAlerts}
          icon={Wrench}
          description="Vehicles In Shop"
          colorClass={maintenanceAlerts > 0 ? "bg-rose-50 text-rose-600 ring-1 ring-rose-100" : "bg-slate-50 text-slate-600 ring-1 ring-slate-100"}
          trend={maintenanceAlerts > 0 ? "Needs Action" : "Healthy"}
          trendDirection={maintenanceAlerts > 0 ? "down" : "neutral"}
        />
        <KPICard
          title="Utilization Rate"
          value={isLoading ? '0%' : `${utilizationRate}%`}
          icon={Activity}
          description="Assigned vs Idle"
          colorClass="bg-amber-50 text-amber-600 ring-1 ring-amber-100"
        />
        <KPICard
          title="Pending Cargo"
          value={isLoading ? 0 : pendingCargo}
          icon={Clock}
          description="Waiting for Assignment"
          colorClass="bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow duration-300">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white/50 backdrop-blur-sm">
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-500" />
                Financial Overview
              </h2>
              <p className="text-slate-500 text-sm mt-1">Revenue vs Expenses (Last 7 Days)</p>
            </div>
            <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-lg transition-colors">
              Detailed Report
            </button>
          </div>
          <div className="p-6 flex-1 flex flex-col justify-end bg-gradient-to-b from-slate-50/30 to-white">
            <RevenueExpenseChart />
          </div>
        </div>

        {/* SLA / Alerts Panel */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow duration-300">
          <div className="p-6 border-b border-rose-100 bg-gradient-to-r from-rose-50/50 to-white">
            <h2 className="text-lg font-bold text-slate-800 flex items-center">
              <span className="relative flex h-3 w-3 mr-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </span>
              SLA Warnings
            </h2>
            <p className="text-slate-500 text-sm mt-1 ml-6">Trips requiring dispatcher attention.</p>
          </div>
          <div className="flex-1 bg-white">
            <SLAWarningsTable />
          </div>
        </div>
      </div>
    </div>
  );
}
