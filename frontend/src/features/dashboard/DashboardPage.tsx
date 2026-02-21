import { format } from 'date-fns';
import { Truck, Navigation2, Wrench, Clock, TrendingUp } from 'lucide-react';
import { KPICard } from './components/KPICard';
import { RevenueExpenseChart } from './components/RevenueExpenseChart';
import { SLAWarningsTable } from './components/SLAWarningsTable';
import { useDashboardKPIs } from './hooks/useDashboardData';

export function DashboardPage() {
  const { activeFleet, idleFleet, maintenanceAlerts, pendingTrips, isLoading } = useDashboardKPIs();
  const today = format(new Date(), 'EEEE, MMMM do, yyyy');

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Command Center</h1>
          <p className="text-slate-500 text-sm mt-1">{today}</p>
        </div>
        <div className="flex bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
          <button className="px-4 py-1.5 text-sm font-medium bg-slate-100 text-slate-800 rounded-md">Today</button>
          <button className="px-4 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-800 rounded-md transition-colors">7 Days</button>
          <button className="px-4 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-800 rounded-md transition-colors">30 Days</button>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Active Fleet"
          value={isLoading ? 0 : activeFleet}
          icon={Navigation2}
          colorClass="bg-[#3bb273]/10 text-[#3bb273]"
          trend="+12%"
          trendDirection="up"
          trendIcon={TrendingUp}
        />
        <KPICard
          title="Pending Trips"
          value={isLoading ? 0 : pendingTrips}
          icon={Clock}
          colorClass="bg-blue-50 text-blue-600"
        />
        <KPICard
          title="Idle Fleet"
          value={isLoading ? 0 : idleFleet}
          icon={Truck}
          colorClass="bg-slate-100 text-slate-600"
        />
        <KPICard
          title="Maintenance Alerts"
          value={isLoading ? 0 : maintenanceAlerts}
          icon={Wrench}
          colorClass={maintenanceAlerts > 0 ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-600"}
          trend={maintenanceAlerts > 0 ? "Needs Action" : "Healthy"}
          trendDirection={maintenanceAlerts > 0 ? "down" : "neutral"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden text-sm flex flex-col h-full">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Financial Overview</h2>
              <p className="text-slate-500 text-xs mt-1">Revenue vs Expenses (Last 7 Days)</p>
            </div>
            <button className="text-sm font-medium text-[#3bb273] hover:text-[#2da061]">View Detailed Report</button>
          </div>
          <div className="p-6 flex-1 flex flex-col justify-end bg-slate-50/30">
            <RevenueExpenseChart />
          </div>
        </div>

        {/* SLA / Alerts Panel */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
          <div className="p-6 border-b border-slate-100 bg-red-50/30">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center">
              <span className="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse"></span>
              SLA Warnings
            </h2>
            <p className="text-slate-500 text-xs mt-1">Trips requiring dispatcher attention.</p>
          </div>
          <div className="flex-1 bg-white">
            <SLAWarningsTable />
          </div>
        </div>
      </div>
    </div>
  );
}
