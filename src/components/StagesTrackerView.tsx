import React from 'react';
import { Layers, CheckCircle2, Clock, CircleDot, ChevronRight } from 'lucide-react';
import { ConstructionStage, Expense, StageStatus, Language, FinancialSummary } from '../types';
import { calculateStageSpending, formatPKR } from '../utils/calculations';
import { translations } from '../utils/translations';

interface StagesTrackerViewProps {
  stages: ConstructionStage[];
  expenses: Expense[];
  summary: FinancialSummary;
  language: Language;
  onUpdateStageStatus: (stageId: string, status: StageStatus) => void;
  onViewStageExpenses: (stageId: string) => void;
}

export const StagesTrackerView: React.FC<StagesTrackerViewProps> = ({
  stages,
  expenses,
  summary,
  language,
  onUpdateStageStatus,
  onViewStageExpenses,
}) => {
  const t = translations[language];
  const isUrdu = language === 'ur';

  const stageData = calculateStageSpending(expenses, stages);

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
          {t.stages}
        </h2>
        <p className="text-xs text-stone-500">
          {isUrdu 
            ? 'مکان کی تعمیر کے 11 اہم مراحل کی پیش رفت اور اخراجات' 
            : 'Track progress and recorded costs across the 11 construction milestones'}
        </p>
      </div>

      {/* Stages List */}
      <div className="space-y-3">
        {stageData.map(({ stage, cost, percentageOfTotal }) => {
          const isCompleted = stage.status === 'completed';
          const isInProgress = stage.status === 'in_progress';
          const isNotStarted = stage.status === 'not_started';

          return (
            <div
              key={stage.id}
              className={`p-4 sm:p-5 rounded-2xl border transition shadow-xs ${
                isCompleted
                  ? 'bg-emerald-50/40 border-emerald-200'
                  : isInProgress
                  ? 'bg-amber-50/30 border-amber-300'
                  : 'bg-white border-stone-200/90'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Stage Info */}
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                    isCompleted
                      ? 'bg-emerald-700 text-white'
                      : isInProgress
                      ? 'bg-amber-500 text-white'
                      : 'bg-stone-100 text-stone-600'
                  }`}>
                    {stage.order}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-stone-900 text-sm sm:text-base">
                        {isUrdu ? stage.nameUrdu : stage.name}
                      </h3>
                      <span className="text-xs text-stone-400">
                        ({isUrdu ? stage.name : stage.nameUrdu})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-stone-500 mt-1">
                      <span>{t.stageRecordedCost}:</span>
                      <span className="font-bold text-stone-900">{formatPKR(cost, { isUrdu })}</span>
                      <span>•</span>
                      <span className="text-stone-500 font-medium">
                        {percentageOfTotal}% {isUrdu ? 'کل پروجیکٹ کا' : 'of spent'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Switcher Buttons */}
                <div className="flex items-center gap-1.5 self-end sm:self-center">
                  <div className="bg-stone-100 p-1 rounded-xl flex items-center gap-1 border border-stone-200">
                    <button
                      onClick={() => onUpdateStageStatus(stage.id, 'not_started')}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                        isNotStarted
                          ? 'bg-stone-700 text-white shadow-xs'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      {t.notStarted}
                    </button>
                    <button
                      onClick={() => onUpdateStageStatus(stage.id, 'in_progress')}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                        isInProgress
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      {t.inProgress}
                    </button>
                    <button
                      onClick={() => onUpdateStageStatus(stage.id, 'completed')}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                        isCompleted
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      {t.completed}
                    </button>
                  </div>
                </div>
              </div>

              {/* Progress bar of spent cost */}
              {cost > 0 && (
                <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                  <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden mr-3 rtl:mr-0 rtl:ml-3">
                    <div
                      className={`h-full rounded-full ${isCompleted ? 'bg-emerald-600' : 'bg-amber-500'}`}
                      style={{ width: `${Math.min(100, Math.max(5, percentageOfTotal))}%` }}
                    />
                  </div>
                  <button
                    onClick={() => onViewStageExpenses(stage.id)}
                    className="shrink-0 text-emerald-800 font-bold hover:underline flex items-center gap-0.5"
                  >
                    <span>{isUrdu ? 'اس مرحلے کے اخراجات' : 'View Expenses'}</span>
                    <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
