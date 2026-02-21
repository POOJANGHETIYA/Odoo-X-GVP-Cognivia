import React, { useState } from 'react';
import { OperationalAnalytics } from './OperationalAnalytics';
import { FinancialReports } from './FinancialReports';
import { DetailedReportView } from './DetailedReportView';
import { BarChart2, PieChart, ClipboardList } from 'lucide-react';

export const ReportsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'financials' | 'detailed'>('analytics');

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-[1600px] mx-auto px-1 group-data-[sidebar=collapsed]:px-4 transition-all">
        {/* Module Segment Picker */}
        <div className="flex items-center gap-1 bg-zinc-100/80 p-1.5 rounded-xl border border-zinc-200 w-fit mb-10 shadow-sm">
          <TabButton
            active={activeTab === 'analytics'}
            onClick={() => setActiveTab('analytics')}
            icon={BarChart2}
            label="Operational Analytics"
          />
          <TabButton
            active={activeTab === 'financials'}
            onClick={() => setActiveTab('financials')}
            icon={PieChart}
            label="Capital Reports"
          />
          <TabButton
            active={activeTab === 'detailed'}
            onClick={() => setActiveTab('detailed')}
            icon={ClipboardList}
            label="Detailed Audit"
          />
        </div>

        {/* Content Area with smooth transitions */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'analytics' && <OperationalAnalytics />}
          {activeTab === 'financials' && <FinancialReports />}
          {activeTab === 'detailed' && <DetailedReportView />}
        </div>
      </div>
    </div>
  );
};

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: any;
  label: string;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2.5 px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all border ${active
        ? 'bg-white text-indigo-600 border-zinc-200 shadow-sm'
        : 'border-transparent text-zinc-500 hover:text-zinc-900'
      }`}
  >
    <Icon className={`w-3.5 h-3.5 ${active ? 'text-indigo-600' : 'text-zinc-400'}`} />
    {label}
  </button>
);
