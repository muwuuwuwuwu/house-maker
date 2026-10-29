import React from 'react';
import { LayoutDashboard, ReceiptText, Users, Layers, PiggyBank, BarChart3 } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../utils/translations';

export type MainTab = 'dashboard' | 'expenses' | 'labor' | 'stages' | 'planner' | 'reports';

interface TopTabsProps {
  currentTab: MainTab;
  onChangeTab: (tab: MainTab) => void;
  language: Language;
}

export const TopTabs: React.FC<TopTabsProps> = ({ currentTab, onChangeTab, language }) => {
  const t = translations[language];

  const tabs: { id: MainTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'expenses', label: t.expenses, icon: ReceiptText },
    { id: 'labor', label: t.workersContractors, icon: Users },
    { id: 'stages', label: t.stages, icon: Layers },
    { id: 'planner', label: t.budgetPlanner, icon: PiggyBank },
    { id: 'reports', label: t.reports, icon: BarChart3 },
  ];

  return (
    <div className="hidden md:block bg-[#f5f2eb] border-b border-stone-200/90 shadow-xs px-3 sm:px-6">
      <div className="max-w-6xl mx-auto flex items-center space-x-1 sm:space-x-2 rtl:space-x-reverse overflow-x-auto scrollbar-none py-2">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm whitespace-nowrap transition font-semibold ${
                isActive
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/70'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-200' : 'text-stone-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
