import React from 'react';
import { GradeTypeKey, ALL_GRADE_TYPES } from '../../types/pauta';

interface GradeTypeSelectorProps {
  selectedTypes: Set<GradeTypeKey>;
  onToggleType: (key: GradeTypeKey) => void;
  onSelectAll: () => void;
  onSelectAveragesOnly: () => void;
  onSelectEvaluationsOnly: () => void;
  onResetDefaultMiniPauta: () => void;
  hideDebtorGrades: boolean;
  onToggleHideDebtorGrades: (val: boolean) => void;
  previewHiddenOnScreen: boolean;
  onTogglePreviewHiddenOnScreen: (val: boolean) => void;
  activeTab: 'minipauta' | 'pauta';
}

export const GradeTypeSelector: React.FC<GradeTypeSelectorProps> = ({
  selectedTypes,
  onToggleType,
  hideDebtorGrades,
  onToggleHideDebtorGrades,
  previewHiddenOnScreen,
  onTogglePreviewHiddenOnScreen,
}) => {
  return (
    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs mb-4 no-print print:hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Grade Column Filter Chips */}
        <div className="flex-1">
          <div className="flex flex-wrap gap-1.5">
            {ALL_GRADE_TYPES.map((gt) => {
              const isSelected = selectedTypes.has(gt.key);
              return (
                <button
                  key={gt.key}
                  type="button"
                  onClick={() => onToggleType(gt.key)}
                  title={`${gt.key}: ${gt.description}`}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-[#0b1f3a] text-white border-[#0b1f3a] shadow-2xs'
                      : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <span
                    className={`w-3 h-3 rounded-full flex items-center justify-center text-[8px] ${
                      isSelected ? 'bg-amber-400 text-slate-900 font-black' : 'bg-slate-300 text-slate-600'
                    }`}
                  >
                    {isSelected ? '✓' : ''}
                  </span>
                  <span>{gt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Debtor Students Retention Options */}
        <div className="lg:border-l lg:border-slate-200 lg:pl-4 flex flex-col justify-center gap-2 min-w-[280px]">
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800 select-none">
              <input
                type="checkbox"
                checked={hideDebtorGrades}
                onChange={(e) => onToggleHideDebtorGrades(e.target.checked)}
                className="w-4 h-4 rounded text-[#7a0c0c] border-slate-300 focus:ring-[#7a0c0c]"
              />
              <span>Ocultar notas de alunos devedores ao imprimir</span>
            </label>

            {hideDebtorGrades && (
              <label className="flex items-center gap-2 cursor-pointer text-[11px] font-medium text-slate-600 pl-6 select-none">
                <input
                  type="checkbox"
                  checked={previewHiddenOnScreen}
                  onChange={(e) => onTogglePreviewHiddenOnScreen(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-amber-600 border-slate-300 focus:ring-amber-500"
                />
                <span className="text-amber-800 font-semibold">
                  Pré-visualizar notas ocultas no ecrã (como na impressão)
                </span>
              </label>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
