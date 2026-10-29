import React from 'react';
import { LayoutDashboard, ReceiptText, PlusCircle, Users, BarChart3 } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../utils/translations';

export type TabType = 'dashboard' | 'expenses' | 'labor' | 'stages' | 'reports';

interface BottomNavProps {
  currentTab: TabType;
  onChangeTab: (tab: TabType) => void;
  onQuickAdd: () => void;
  language: Language;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onChangeTab,
  onQuickAdd,
  language,
}) => {
  const t = translations[language];

  const navItems = [
    {
      id: 'dashboard' as TabType,
      label: t.dashboard,
      icon: LayoutDashboard,
    },
    {
      id: 'expenses' as TabType,
      label: t.expenses,
      icon: ReceiptText,
    },
    {
      id: 'add' as const,
      label: t.addExpense,
      icon: PlusCircle,
      isAction: true,
    },
    {
      id: 'labor' as TabType,
      label: t.workersContractors,
      icon: Users,
    },
    {
      id: 'reports' as TabType,
      label: t.reports,
      icon: BarChart3,
    },
  ];

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#fbfaf6] border-t border-stone-200/90 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] px-2 py-1.5 safe-area-bottom"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          if (item.isAction) {
            return (
              <button
                key="quick-add"
                onClick={onQuickAdd}
                className="flex flex-col items-center justify-center -mt-5 group focus:outline-none"
                aria-label={t.addExpense}
              >
                <div className="w-13 h-13 rounded-full bg-emerald-700 group-hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-900/30 border-2 border-[#fbfaf6] active:scale-95 transition">
                  <PlusCircle className="w-7 h-7" />
                </div>
                <span className="text-[10px] font-bold text-emerald-900 mt-0.5 tracking-tight">
                  {t.addExpense}
                </span>
              </button>
            );
          }

          const isActive = currentTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onChangeTab(item.id as TabType)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition min-w-[56px] ${
                isActive
                  ? 'text-emerald-800 font-bold'
                  : 'text-stone-500 hover:text-stone-800 font-medium'
              }`}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className={`p-1 rounded-lg transition ${isActive ? 'bg-emerald-100/70 text-emerald-900' : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              </div>
              <span className="text-[10.5px] mt-0.5 truncate max-w-[64px]">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
