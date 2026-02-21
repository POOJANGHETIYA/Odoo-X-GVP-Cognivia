import React, { useState } from 'react';
import { OperationalAnalytics } from './OperationalAnalytics';
import { FinancialReports } from './FinancialReports';
import { DetailedReportView } from './DetailedReportView';
import { BarChart2, PieChart, ClipboardList } from 'lucide-react';

export const ReportsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'financials' | 'detailed'>('analytics');

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-[1600px] mx-auto px-8 py-6">
        {/* Sub-navigation */}
        <div className="flex gap-8 mb-8 border-b border-[#F3F4F6]">
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
            label="Financial Reports"
          />
          <TabButton
            active={activeTab === 'detailed'}
            onClick={() => setActiveTab('detailed')}
            icon={ClipboardList}
            label="Detailed Logs"
          />
        </div>

        {/* Content Area with smooth transitions */}
        <div className="transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
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
    className={`flex items-center gap-2 pb-4 pt-2 text-[13px] font-bold transition-all border-b-2 relative ${active ? 'border-[#2CC197] text-[#111827]' : 'border-transparent text-gray-400 hover:text-gray-600'
      }`}
  >
    <Icon className={`w-4 h-4 ${active ? 'text-[#2CC197]' : 'text-gray-400'}`} />
    {label}
  </button>
);
