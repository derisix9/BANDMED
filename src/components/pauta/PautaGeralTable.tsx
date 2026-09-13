import React from 'react';
import { StudentPautaGeralItem, GradeTypeKey } from '../../types/pauta';
import { ClassRoom, Subject, InstitutionSettings } from '../../types';
import { dbService } from '../../services/db';

interface PautaGeralTableProps {
  rows: StudentPautaGeralItem[];
  subjects: Subject[];
  selectedGradeTypes: Set<GradeTypeKey>;
  hideDebtorGrades: boolean;
  previewHiddenOnScreen: boolean;
  activeClass?: ClassRoom;
  onUpdateGrade?: (studentIndex: number, subjectId: string, field: 'mt1' | 'mt2' | 'mt3' | 'mfd', value: number | '') => void;
  onToggleDesistente?: (studentIndex: number) => void;
  settings?: InstitutionSettings;
}

export const PautaGeralTable: React.FC<PautaGeralTableProps> = ({
  rows,
  subjects,
  selectedGradeTypes,
  hideDebtorGrades,
  previewHiddenOnScreen,
  activeClass,
  settings
}) => {
  // Sempre reflete os Dados da Instituição definidos em Configurações
  const institution = settings || dbService.getSettings();
  // Check which sub-columns for each discipline are enabled
  const showMT1 = selectedGradeTypes.has('MT1');
  const showMT2 = selectedGradeTypes.has('MT2');
  const showMT3 = selectedGradeTypes.has('MT3');
  const showMFD = selectedGradeTypes.has('MFD');
  const showMF = selectedGradeTypes.has('MF');

  const disciplineSubCols = [showMT1, showMT2, showMT3, showMFD].filter(Boolean).length;
  // If user unselected all 4 discipline sub-cols, default to at least MFD so columns don't break
  const effectiveDisciplineSubCols = disciplineSubCols > 0 ? disciplineSubCols : 1;

  const renderGrade = (val: number | '', isDebtor: boolean, isDesistente: boolean, isMFD = false) => {
    if (isDesistente) {
      return <span className="text-slate-300 font-mono">-</span>;
    }

    if (isDebtor && hideDebtorGrades) {
      return (
        <span className="text-slate-400 font-mono font-bold text-xs select-none print:text-[9px] print:text-slate-500">
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
        className={`font-mono font-bold text-xs print:text-[9px] ${
          isNegative ? 'text-rose-600 font-extrabold print:text-red-600' : 'text-slate-900 print:text-black'
        } ${isMFD ? 'text-[#0b1f3a]' : ''}`}
      >
        {num}
      </span>
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
          Pauta Geral Oficial de Aproveitamento Escolar
        </div>
        <div className="text-[9px] text-slate-800 mt-1 flex items-center justify-center gap-4">
          <span><strong>Turma:</strong> {activeClass?.name || 'Turma Geral'}</span>
          <span><strong>Curso / Área:</strong> {activeClass?.area || activeClass?.cycle || 'Técnico de Saúde'}</span>
          <span><strong>Ano Lectivo:</strong> {activeClass?.academicYear || institution?.currentAcademicYear || '2024/2025'}</span>
          <span><strong>Turno:</strong> {activeClass?.shift || 'Manhã'}</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-center text-xs border-collapse print:text-[8px]">
          {/* Table Headers */}
          <thead>
            {/* Top Tier */}
            <tr className="bg-[#0b1f3a] text-white font-bold uppercase text-[11px] tracking-wider border-b border-slate-700/80 print:bg-slate-100 print:text-black print:border-black">
              <th rowSpan={2} className="py-3 px-2 w-11 border-r border-slate-700/60 print:border-black text-center">
                N.º
              </th>
              <th rowSpan={2} className="py-3 px-3 min-w-[210px] text-left border-r border-slate-700/60 print:border-black">
                Nome do Aluno
              </th>
              <th rowSpan={2} className="py-3 px-1 w-11 border-r border-slate-700/60 print:border-black text-center">
                Sexo
              </th>
              <th rowSpan={2} className="py-3 px-1.5 w-16 border-r border-slate-700/60 print:border-black text-center">
                Ano Nasc.
              </th>
              <th rowSpan={2} className="py-3 px-1 w-12 border-r border-slate-700/60 print:border-black text-center">
                Idade
              </th>

              {/* Disciplines Taught in Class */}
              {subjects.map((subj) => (
                <th
                  key={subj.id}
                  colSpan={effectiveDisciplineSubCols}
                  className="py-2.5 px-1 border-r border-slate-700/60 print:border-black bg-[#0d2647] text-white font-extrabold tracking-wider text-[10px] print:text-[8px]"
                >
                  <span className="truncate block max-w-[150px] mx-auto" title={subj.name}>
                    {subj.name.split(' ')[0]} {subj.code ? `(${subj.code})` : ''}
                  </span>
                </th>
              ))}

              {/* Final Summary */}
              {showMF && (
                <th rowSpan={2} className="py-3 px-2 w-14 border-r border-slate-700/60 bg-[#13325c] text-amber-300 font-extrabold print:border-black print:bg-slate-200 print:text-black text-center">
                  MF
                </th>
              )}
              <th rowSpan={2} className="py-3 px-3 min-w-[95px] bg-[#0b1f3a] text-white font-extrabold print:border-black print:bg-slate-100 print:text-black text-center">
                Situação
              </th>
            </tr>

            {/* Sub Tier for Disciplines */}
            <tr className="bg-[#122c50] text-slate-200 font-bold uppercase text-[10px] tracking-wide border-b border-slate-700 print:bg-white print:text-black print:border-black">
              {subjects.map((subj) => (
                <React.Fragment key={`sub-${subj.id}`}>
                  {showMT1 && <th className="py-2 px-1 border-r border-slate-700/40 w-10 text-slate-300 print:text-black print:border-black">MT1</th>}
                  {showMT2 && <th className="py-2 px-1 border-r border-slate-700/40 w-10 text-slate-300 print:text-black print:border-black">MT2</th>}
                  {showMT3 && <th className="py-2 px-1 border-r border-slate-700/40 w-10 text-slate-300 print:text-black print:border-black">MT3</th>}
                  {showMFD && <th className="py-2 px-1 border-r border-slate-700/80 w-11 bg-[#1a3d6f] text-amber-300 font-black print:border-black print:bg-slate-100 print:text-black">MFD</th>}
                  {!showMT1 && !showMT2 && !showMT3 && !showMFD && (
                    <th className="py-2 px-1 border-r border-slate-700/80 w-11 bg-[#1a3d6f] text-amber-300 font-black">MFD</th>
                  )}
                </React.Fragment>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-200/80 print:divide-black">
            {rows.map((row, idx) => {
              const isDesistente = row.isDesistente;
              const isDebtor = row.isDebtor;

              return (
                <tr
                  key={row.id || idx}
                  className={`border-b border-slate-200/80 transition-colors print:border-black ${
                    isDesistente
                      ? 'bg-slate-100/80 text-slate-400 italic print:bg-slate-100'
                      : idx % 2 === 1
                      ? 'bg-slate-50/40 hover:bg-sky-50/30'
                      : 'bg-white hover:bg-sky-50/30'
                  }`}
                >
                  {/* N.º */}
                  <td className="py-2 px-2 font-mono font-bold text-slate-600 border-r border-slate-200/80 print:border-black print:text-black text-center">
                    {row.num}
                  </td>

                  {/* Nome do Aluno - Clean without badges/buttons as requested */}
                  <td className="py-2 px-3 text-left border-r border-slate-200/80 print:border-black">
                    <span className="font-semibold text-slate-900 tracking-tight text-xs print:text-black">
                      {row?.name || 'Aluno'}
                    </span>
                  </td>

                  {/* Sexo */}
                  <td className="py-2 px-1 font-bold text-slate-700 border-r border-slate-200/80 print:border-black print:text-black text-center">
                    {row.gender}
                  </td>

                  {/* Ano de Nascimento */}
                  <td className="py-2 px-1 font-mono text-slate-600 border-r border-slate-200/80 print:border-black print:text-black text-center">
                    {row.birthYear}
                  </td>

                  {/* Idade */}
                  <td className="py-2 px-1 font-mono font-bold text-slate-700 border-r border-slate-200/80 print:border-black print:text-black text-center">
                    {row.age}
                  </td>

                  {/* Disciplines Grades */}
                  {subjects.map((subj) => {
                    const grades = row.subjectGrades[subj.id] || { mt1: '', mt2: '', mt3: '', mfd: '' };

                    return (
                      <React.Fragment key={`${subj.id}-${row.id}`}>
                        {showMT1 && (
                          <td className="py-1.5 px-1 border-r border-slate-200/80 print:border-black text-center">
                            {renderGrade(grades.mt1, isDebtor, isDesistente)}
                          </td>
                        )}
                        {showMT2 && (
                          <td className="py-1.5 px-1 border-r border-slate-200/80 print:border-black text-center">
                            {renderGrade(grades.mt2, isDebtor, isDesistente)}
                          </td>
                        )}
                        {showMT3 && (
                          <td className="py-1.5 px-1 border-r border-slate-200/80 print:border-black text-center">
                            {renderGrade(grades.mt3, isDebtor, isDesistente)}
                          </td>
                        )}
                        {showMFD && (
                          <td className="py-1.5 px-1 border-r border-slate-200/80 bg-slate-100/60 font-mono font-bold print:border-black print:bg-slate-100 text-center">
                            {renderGrade(grades.mfd, isDebtor, isDesistente, true)}
                          </td>
                        )}
                        {!showMT1 && !showMT2 && !showMT3 && !showMFD && (
                          <td className="py-1.5 px-1 border-r border-slate-200/80 bg-slate-100/60 font-mono font-bold print:border-black print:bg-slate-100 text-center">
                            {renderGrade(grades.mfd, isDebtor, isDesistente, true)}
                          </td>
                        )}
                      </React.Fragment>
                    );
                  })}

                  {/* MF (Média Final Global) */}
                  {showMF && (
                    <td className="py-2 px-2 border-r border-slate-200/80 bg-amber-50/50 font-mono font-black print:border-black print:bg-slate-200 text-center">
                      {isDesistente ? (
                        <span className="text-slate-300 font-mono">-</span>
                      ) : isDebtor && hideDebtorGrades ? (
                        <span className="text-slate-400 font-mono font-bold text-xs select-none print:text-[9px] print:text-slate-500">
                          -
                        </span>
                      ) : (
                        <span
                          className={`font-mono text-xs font-black print:text-[9px] ${
                            typeof row.mf === 'number' && row.mf < 10 ? 'text-rose-600' : 'text-slate-900'
                          }`}
                        >
                          {row.mf !== '' ? row.mf : '-'}
                        </span>
                      )}
                    </td>
                  )}

                  {/* Situação: APTO, DESISTIDO, N/APTO, RETIDO */}
                  <td className="py-2 px-3 text-center print:border-black">
                    {isDesistente ? (
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 print:text-black print:border print:border-black">
                        DESISTIDO
                      </span>
                    ) : isDebtor && hideDebtorGrades ? (
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-300 print:text-black print:border print:border-black">
                        RETIDO
                      </span>
                    ) : (
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          row.situation === 'APTO'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 print:text-black print:border print:border-black'
                            : 'bg-rose-50 text-rose-700 border border-rose-200 print:text-black print:border print:border-black'
                        }`}
                      >
                        {row.situation}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Signatures for Pauta Geral */}
      {/* Requirement: "COM AS ASSINATURAS DO RESPONSAVEL DA TURMA, DIRECTOR PEDAGOGICO E GERAL PARA PAUTA" */}
      <div className="p-6 bg-slate-50/70 border-t border-slate-200 print:bg-white print:border-black print:p-4 print-break-avoid">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-xs print:grid-cols-3 print:gap-4 print:text-[9px]">
          {/* O Responsável da Turma */}
          <div className="flex flex-col items-center">
            <div className="w-48 border-b border-dashed border-slate-400 mb-2 print:border-black print:w-36" />
            <span className="font-bold text-slate-900 uppercase text-[11px] print:text-[9px] print:text-black">
              O Responsável da Turma
            </span>
            <span className="text-slate-600 print:text-black text-xs">
              {activeClass?.headTeacherName || 'Director de Turma'}
            </span>
          </div>

          {/* O Director Pedagógico */}
          <div className="flex flex-col items-center">
            <div className="w-48 border-b border-dashed border-slate-400 mb-2 print:border-black print:w-36" />
            <span className="font-bold text-slate-900 uppercase text-[11px] print:text-[9px] print:text-black">
              O Director Pedagógico
            </span>
            <span className="text-slate-600 print:text-black text-xs">
              {institution.directorPedagogico || 'A definir em Configurações'}
            </span>
          </div>

          {/* O Director Geral */}
          <div className="flex flex-col items-center">
            <div className="w-48 border-b border-dashed border-slate-400 mb-2 print:border-black print:w-36" />
            <span className="font-bold text-slate-900 uppercase text-[11px] print:text-[9px] print:text-black">
              O Director Geral
            </span>
            <span className="text-slate-600 print:text-black text-xs">
              {institution.directorGeral || 'A definir em Configurações'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
