import React from 'react';
import { StudentMiniPautaItem, GradeTypeKey } from '../../types/pauta';
import { ClassRoom, Subject, InstitutionSettings } from '../../types';
import { dbService } from '../../services/db';

interface MiniPautaTableProps {
  rows: StudentMiniPautaItem[];
  onCellChange: (rowIndex: number, field: keyof StudentMiniPautaItem, value: any) => void;
  onToggleDesistente: (rowIndex: number) => void;
  selectedGradeTypes: Set<GradeTypeKey>;
  hideDebtorGrades: boolean;
  previewHiddenOnScreen: boolean;
  activeClass?: ClassRoom;
  activeSubject?: Subject;
  settings?: InstitutionSettings;
  isReadOnly?: boolean;
}

export const MiniPautaTable: React.FC<MiniPautaTableProps> = ({
  rows,
  onCellChange,
  selectedGradeTypes,
  hideDebtorGrades,
  previewHiddenOnScreen,
  activeClass,
  activeSubject,
  settings,
  isReadOnly = false
}) => {
  // Sempre reflete os Dados da Instituição definidos em Configurações
  const institution = settings || dbService.getSettings();
  // Check which sub-columns are visible
  const showMAC = selectedGradeTypes.has('MAC');
  const showNPP = selectedGradeTypes.has('NPP');
  const showNPT = selectedGradeTypes.has('NPT');
  const showMT1 = selectedGradeTypes.has('MT1');
  const showMT2 = selectedGradeTypes.has('MT2');
  const showMT3 = selectedGradeTypes.has('MT3');
  const showMFD = selectedGradeTypes.has('MFD');
  const showPG = selectedGradeTypes.has('PG');
  const showCA = selectedGradeTypes.has('CA');

  const t1Cols = [showMAC, showNPP, showNPT, showMT1].filter(Boolean).length;
  const t2Cols = [showMAC, showNPP, showNPT, showMT2].filter(Boolean).length;
  const t3Cols = [showMAC, showNPP, showNPT, showMT3].filter(Boolean).length;
  const finalCols = [showMFD, showPG, showCA, true].filter(Boolean).length; // +1 for Obs

  const renderGradeValue = (
    val: number | '',
    isDebtor: boolean,
    isDesistente: boolean,
    isAverageCol = false
  ) => {
    if (isDesistente) {
      return <span className="text-slate-300 font-mono select-none">-</span>;
    }

    if (isDebtor && hideDebtorGrades) {
      return (
        <span className="text-slate-400 font-mono font-bold text-xs print:text-[10px] print:text-slate-500 select-none">
          -
        </span>
      );
    }

    if (val === '' || val === undefined || val === null) {
      return <span className="text-slate-400 font-mono">-</span>;
    }

    const num = typeof val === 'number' ? val : parseFloat(val);
    const isNegative = !isNaN(num) && num < 10;

    return (
      <span
        className={`font-mono font-bold text-xs print:text-[10px] ${
          isNegative ? 'text-rose-600 font-extrabold print:text-red-600' : 'text-slate-900 print:text-black'
        } ${isAverageCol ? 'text-xs' : ''}`}
      >
        {num}
      </span>
    );
  };

  const renderEditableCell = (
    field: keyof StudentMiniPautaItem,
    value: number | '',
    idx: number,
    isDebtor: boolean,
    isDesistente: boolean
  ) => {
    if (isDesistente) {
      return <span className="text-slate-300 font-mono select-none">-</span>;
    }

    if (isDebtor && hideDebtorGrades) {
      return (
        <span className="text-slate-400 font-mono font-bold text-xs print:text-[10px] print:text-slate-500 select-none">
          -
        </span>
      );
    }

    if (isReadOnly) {
      return renderGradeValue(value, isDebtor, isDesistente);
    }

    return (
      <>
        <input
          type="number"
          step="1"
          min="0"
          max="20"
          value={value}
          onChange={(e) => onCellChange(idx, field, e.target.value === '' ? '' : parseFloat(e.target.value))}
          className={`w-9 h-7 text-center rounded border font-mono text-xs font-bold transition-all print:hidden ${
            typeof value === 'number' && value < 10
              ? 'bg-rose-50 border-rose-200 text-rose-600 focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-400'
              : 'bg-slate-50/90 border-slate-200 text-slate-800 hover:bg-white hover:border-slate-300 focus:bg-white focus:border-[#0b1f3a] focus:ring-1 focus:ring-[#0b1f3a]'
          }`}
        />
        <span className="hidden print:inline">
          {renderGradeValue(value, isDebtor, isDesistente)}
        </span>
      </>
    );
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden print:border-black print:rounded-none print:shadow-none">
      {/* Official School Header - Printed only */}
      <div className="hidden print:block p-4 text-center border-b-2 border-slate-900 mb-2">
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-700">
          República de Angola • {institution.subTitle || 'Ministério da Educação'}
        </div>
        <div className="text-sm font-black uppercase text-black tracking-wide mt-0.5">
          {institution.schoolName}
        </div>
        <div className="text-[9px] text-slate-700">
          {institution.decreeAuthorization} • NIF: {institution.nif}
        </div>
        <div className="text-xs font-bold uppercase tracking-wider text-black mt-1">
          Mini-Pauta Oficial de Avaliação Contínua e Trimestral — {activeSubject?.name || 'Disciplina'}
        </div>
        <div className="text-[9px] text-slate-800 mt-1 flex items-center justify-center gap-4">
          <span><strong>Turma:</strong> {activeClass?.name || 'Turma Geral'}</span>
          <span><strong>Curso / Área:</strong> {activeClass?.area || activeClass?.cycle || 'Técnico de Saúde'}</span>
          <span><strong>Ano Lectivo:</strong> {activeClass?.academicYear || institution?.currentAcademicYear || '2024/2025'}</span>
          <span><strong>Turno:</strong> {activeClass?.shift || 'Manhã'}</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-center text-xs border-collapse border border-slate-300 print:border-slate-400 print:text-[8pt]">
          {/* Header Rows */}
          <thead>
            {/* Top Tier Header */}
            <tr className="bg-[#0b1f3a] text-white font-bold uppercase text-[11px] tracking-wider border-b border-slate-700/80 print:bg-[#0b1f3a] print:text-white">
              <th rowSpan={2} className="py-2.5 px-2 w-10 border-r border-slate-600 print:border-slate-500 text-center">
                N.º
              </th>
              <th rowSpan={2} className="py-2.5 px-3 min-w-[170px] print:min-w-0 text-left border-r border-slate-600 print:border-slate-500">
                NOME COMPLETO
              </th>
              <th rowSpan={2} className="py-2.5 px-1.5 w-11 print:w-8 border-r border-slate-600 print:border-slate-500 text-center">
                Sexo
              </th>
              <th rowSpan={2} className="py-2.5 px-1.5 w-14 print:w-11 border-r border-slate-600 print:border-slate-500 text-center">
                Ano Nasc.
              </th>
              <th rowSpan={2} className="py-2.5 px-1.5 w-11 print:w-9 border-r border-slate-600 print:border-slate-500 text-center">
                Idade
              </th>

              {/* Trimester 1 */}
              {t1Cols > 0 && (
                <th colSpan={t1Cols} className="py-2 px-1 border-r border-slate-600 print:border-slate-500 bg-[#0e2c53] text-amber-300 font-extrabold tracking-wider print:bg-[#0e2c53] print:text-amber-300">
                  I TRIMESTRE
                </th>
              )}

              {/* Trimester 2 */}
              {t2Cols > 0 && (
                <th colSpan={t2Cols} className="py-2 px-1 border-r border-slate-600 print:border-slate-500 bg-[#143765] text-amber-300 font-extrabold tracking-wider print:bg-[#143765] print:text-amber-300">
                  II TRIMESTRE
                </th>
              )}

              {/* Trimester 3 */}
              {t3Cols > 0 && (
                <th colSpan={t3Cols} className="py-2 px-1 border-r border-slate-600 print:border-slate-500 bg-[#1a4378] text-amber-300 font-extrabold tracking-wider print:bg-[#1a4378] print:text-amber-300">
                  III TRIMESTRE
                </th>
              )}

              {/* Final Classification */}
              {finalCols > 0 && (
                <th colSpan={finalCols} className="py-2 px-1 bg-[#7a0c0c] text-white font-extrabold tracking-wider print:bg-[#7a0c0c] print:text-white">
                  CLASSIFICAÇÃO FINAL
                </th>
              )}
            </tr>

            {/* Sub Tier Header */}
            <tr className="bg-[#122c50] text-slate-200 font-bold uppercase text-[10px] tracking-wide border-b border-slate-700 print:bg-[#122c50] print:text-slate-200">
              {/* T1 sub-columns */}
              {showMAC && <th className="py-1.5 px-1 border-r border-slate-600 print:border-slate-500 w-11 print:w-7 text-slate-200">MAC</th>}
              {showNPP && <th className="py-1.5 px-1 border-r border-slate-600 print:border-slate-500 w-11 print:w-7 text-slate-200">NPP</th>}
              {showNPT && <th className="py-1.5 px-1 border-r border-slate-600 print:border-slate-500 w-11 print:w-7 text-slate-200">NPT</th>}
              {showMT1 && <th className="py-1.5 px-1 border-r border-slate-600 print:border-slate-500 w-11 print:w-8 bg-[#09203d] text-amber-300 font-black print:bg-[#09203d] print:text-amber-300">MT1</th>}

              {/* T2 sub-columns */}
              {showMAC && <th className="py-1.5 px-1 border-r border-slate-600 print:border-slate-500 w-11 print:w-7 text-slate-200">MAC</th>}
              {showNPP && <th className="py-1.5 px-1 border-r border-slate-600 print:border-slate-500 w-11 print:w-7 text-slate-200">NPP</th>}
              {showNPT && <th className="py-1.5 px-1 border-r border-slate-600 print:border-slate-500 w-11 print:w-7 text-slate-200">NPT</th>}
              {showMT2 && <th className="py-1.5 px-1 border-r border-slate-600 print:border-slate-500 w-11 print:w-8 bg-[#0d284a] text-amber-300 font-black print:bg-[#0d284a] print:text-amber-300">MT2</th>}

              {/* T3 sub-columns */}
              {showMAC && <th className="py-1.5 px-1 border-r border-slate-600 print:border-slate-500 w-11 print:w-7 text-slate-200">MAC</th>}
              {showNPP && <th className="py-1.5 px-1 border-r border-slate-600 print:border-slate-500 w-11 print:w-7 text-slate-200">NPP</th>}
              {showNPT && <th className="py-1.5 px-1 border-r border-slate-600 print:border-slate-500 w-11 print:w-7 text-slate-200">NPT</th>}
              {showMT3 && <th className="py-1.5 px-1 border-r border-slate-600 print:border-slate-500 w-11 print:w-8 bg-[#123157] text-amber-300 font-black print:bg-[#123157] print:text-amber-300">MT3</th>}

              {/* Final sub-columns */}
              {showMFD && <th className="py-1.5 px-1 border-r border-slate-600 print:border-slate-500 w-11 print:w-8 bg-[#5c0909] text-amber-300 font-black print:bg-[#5c0909] print:text-amber-300">MFD</th>}
              {showPG && <th className="py-1.5 px-1 border-r border-slate-600 print:border-slate-500 w-11 print:w-7 text-slate-200">PG</th>}
              {showCA && <th className="py-1.5 px-1 border-r border-slate-600 print:border-slate-500 w-10 print:w-7 text-rose-300 font-black">CA</th>}
              <th className="py-1.5 px-2 min-w-[90px] print:min-w-0 text-left text-slate-200 font-bold">Obs.</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-200 print:divide-slate-300">
            {rows.map((row, idx) => {
              const isDesistente = row.isDesistente;
              const isDebtor = row.isDebtor;

              return (
                <tr
                  key={row.id || idx}
                  className={`border-b border-slate-200 print:border-slate-300 transition-colors ${
                    isDesistente
                      ? 'bg-slate-100/80 text-slate-400 italic print:bg-slate-100'
                      : idx % 2 === 1
                      ? 'bg-[#f8fafc] hover:bg-sky-50/40'
                      : 'bg-white hover:bg-sky-50/40'
                  }`}
                >
                  {/* N/O */}
                  <td className="py-1.5 px-2 font-mono font-bold text-slate-600 border-r border-slate-200 print:border-slate-300 print:text-black text-center">
                    {row.num}
                  </td>

                  {/* NOME COMPLETO */}
                  <td className="py-1.5 px-3 text-left border-r border-slate-200 print:border-slate-300">
                    <span className="font-semibold text-slate-900 tracking-tight text-xs print:text-[8pt] print:text-black">
                      {row?.name || 'Aluno'}
                    </span>
                  </td>

                  {/* Sexo */}
                  <td className="py-1.5 px-1 font-bold text-slate-700 border-r border-slate-200 print:border-slate-300 print:text-black text-center">
                    {row.gender}
                  </td>

                  {/* Ano Nasc. */}
                  <td className="py-1.5 px-1 font-mono text-slate-600 border-r border-slate-200 print:border-slate-300 print:text-black text-center">
                    {row.birthYear}
                  </td>

                  {/* Idade */}
                  <td className="py-1.5 px-1 font-mono font-bold text-slate-700 border-r border-slate-200 print:border-slate-300 print:text-black text-center">
                    {row.age}
                  </td>

                  {/* ============= TRIMESTRE 1 ============= */}
                  {showMAC && (
                    <td className="py-1 px-1 border-r border-slate-200 print:border-slate-300 text-center">
                      {renderEditableCell('mac1', row.mac1, idx, isDebtor, isDesistente)}
                    </td>
                  )}

                  {showNPP && (
                    <td className="py-1 px-1 border-r border-slate-200 print:border-slate-300 text-center">
                      {renderEditableCell('npp1', row.npp1, idx, isDebtor, isDesistente)}
                    </td>
                  )}

                  {showNPT && (
                    <td className="py-1 px-1 border-r border-slate-200 print:border-slate-300 text-center">
                      {renderEditableCell('npt1', row.npt1, idx, isDebtor, isDesistente)}
                    </td>
                  )}

                  {showMT1 && (
                    <td className="py-1.5 px-1 border-r border-slate-200 bg-blue-50/50 font-mono font-bold print:border-slate-300 print:bg-blue-50/50 text-center">
                      {renderGradeValue(row.mt1, isDebtor, isDesistente, true)}
                    </td>
                  )}

                  {/* ============= TRIMESTRE 2 ============= */}
                  {showMAC && (
                    <td className="py-1 px-1 border-r border-slate-200 print:border-slate-300 text-center">
                      {renderEditableCell('mac2', row.mac2, idx, isDebtor, isDesistente)}
                    </td>
                  )}

                  {showNPP && (
                    <td className="py-1 px-1 border-r border-slate-200 print:border-slate-300 text-center">
                      {renderEditableCell('npp2', row.npp2, idx, isDebtor, isDesistente)}
                    </td>
                  )}

                  {showNPT && (
                    <td className="py-1 px-1 border-r border-slate-200 print:border-slate-300 text-center">
                      {renderEditableCell('npt2', row.npt2, idx, isDebtor, isDesistente)}
                    </td>
                  )}

                  {showMT2 && (
                    <td className="py-1.5 px-1 border-r border-slate-200 bg-blue-50/50 font-mono font-bold print:border-slate-300 print:bg-blue-50/50 text-center">
                      {renderGradeValue(row.mt2, isDebtor, isDesistente, true)}
                    </td>
                  )}

                  {/* ============= TRIMESTRE 3 ============= */}
                  {showMAC && (
                    <td className="py-1 px-1 border-r border-slate-200 print:border-slate-300 text-center">
                      {renderEditableCell('mac3', row.mac3, idx, isDebtor, isDesistente)}
                    </td>
                  )}

                  {showNPP && (
                    <td className="py-1 px-1 border-r border-slate-200 print:border-slate-300 text-center">
                      {renderEditableCell('npp3', row.npp3, idx, isDebtor, isDesistente)}
                    </td>
                  )}

                  {showNPT && (
                    <td className="py-1 px-1 border-r border-slate-200 print:border-slate-300 text-center">
                      {renderEditableCell('npt3', row.npt3, idx, isDebtor, isDesistente)}
                    </td>
                  )}

                  {showMT3 && (
                    <td className="py-1.5 px-1 border-r border-slate-200 bg-blue-50/50 font-mono font-bold print:border-slate-300 print:bg-blue-50/50 text-center">
                      {renderGradeValue(row.mt3, isDebtor, isDesistente, true)}
                    </td>
                  )}

                  {/* ============= CLASSIFICAÇÃO FINAL ============= */}
                  {showMFD && (
                    <td className="py-1.5 px-1 border-r border-slate-200 bg-rose-50/60 font-mono font-black print:border-slate-300 print:bg-rose-50/60 text-center">
                      {renderGradeValue(row.mfd, isDebtor, isDesistente, true)}
                    </td>
                  )}

                  {showPG && (
                    <td className="py-1 px-1 border-r border-slate-200 print:border-slate-300 text-center">
                      {renderEditableCell('pg', row.pg, idx, isDebtor, isDesistente)}
                    </td>
                  )}

                  {showCA && (
                    <td className="py-1.5 px-1 border-r border-slate-200 font-bold print:border-slate-300 text-center">
                      {renderGradeValue(row.ca, isDebtor, isDesistente, true)}
                    </td>
                  )}

                  {/* Obs. */}
                  <td className="py-1.5 px-2 text-left print:border-slate-300">
                    {isDesistente ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 inline-block">
                        Desistente
                      </span>
                    ) : isDebtor && hideDebtorGrades ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-300 inline-block print:text-black print:border-black">
                        Retido
                      </span>
                    ) : (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-block ${
                        typeof row.mfd === 'number' && row.mfd >= 10
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : typeof row.mfd === 'number'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'text-slate-400'
                      }`}>
                        {row.obs || (typeof row.mfd === 'number' ? (row.mfd >= 10 ? 'Aprovado' : 'Exame de Recurso') : 'Pendente')}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Signatures for Mini-Pauta */}
      {/* Requirement: "E MINI PAUTA DO PORFESSOR, RESPONSAVEL DA TURMA E O DIRECTOR PEDAGOGICO." */}
      <div className="p-6 bg-slate-50/70 border-t border-slate-200 print:bg-white print:border-black print:p-4 print-break-avoid">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-xs print:grid-cols-3 print:gap-4 print:text-[9px]">
          {/* Professor da Disciplina */}
          <div className="flex flex-col items-center">
            <div className="w-48 border-b border-dashed border-slate-400 mb-2 print:border-black print:w-36" />
            <span className="font-bold text-slate-900 uppercase text-[11px] print:text-[9px] print:text-black">
              O Professor da Disciplina
            </span>
            <span className="text-slate-600 print:text-black text-xs">
              {activeSubject?.coordinatorName || 'Prof. da Disciplina'}
            </span>
          </div>

          {/* Responsável da Turma */}
          <div className="flex flex-col items-center">
            <div className="w-48 border-b border-dashed border-slate-400 mb-2 print:border-black print:w-36" />
            <span className="font-bold text-slate-900 uppercase text-[11px] print:text-[9px] print:text-black">
              O Responsável da Turma
            </span>
            <span className="text-slate-600 print:text-black text-xs">
              {activeClass?.headTeacherName || 'Director de Turma'}
            </span>
          </div>

          {/* Director Pedagógico */}
          <div className="flex flex-col items-center">
            <div className="w-48 border-b border-dashed border-slate-400 mb-2 print:border-black print:w-36" />
            <span className="font-bold text-slate-900 uppercase text-[11px] print:text-[9px] print:text-black">
              O Director Pedagógico
            </span>
            <span className="text-slate-600 print:text-black text-xs">
              {institution?.directorPedagogico || institution?.directorGeral || 'Director Pedagógico'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
