import React, { useState, useMemo } from 'react';
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

  // Modo de visualização na tela: contínuo ou por folhas
  const [screenViewMode, setScreenViewMode] = useState<'continuous' | 'sheets'>('continuous');

  // Check which sub-columns for each discipline are enabled
  const showMT1 = selectedGradeTypes.has('MT1');
  const showMT2 = selectedGradeTypes.has('MT2');
  const showMT3 = selectedGradeTypes.has('MT3');
  const showMFD = selectedGradeTypes.has('MFD');
  const showMF = selectedGradeTypes.has('MF');

  const disciplineSubCols = [showMT1, showMT2, showMT3, showMFD].filter(Boolean).length;
  // If user unselected all 4 discipline sub-cols, default to at least MFD so columns don't break
  const effectiveDisciplineSubCols = disciplineSubCols > 0 ? disciplineSubCols : 1;

  // Divisão Oficial de Disciplinas por Folha:
  // Folha 1: Dados do Aluno (N.º, Nome, Sexo, Ano Nasc., Idade) + Primeiras 4 Disciplinas
  // Folha 2+: Disciplinas restantes (SEM dados demográficos do aluno), com MF e Situação na última folha
  const firstSheetSubjects = useMemo(() => subjects.slice(0, 4), [subjects]);
  const remainingSubjects = useMemo(() => subjects.slice(4), [subjects]);

  // Quantidade de disciplinas que cabem por folha de continuação (sem colunas de aluno cabe até 7 disciplinas)
  const continuationPageSize = effectiveDisciplineSubCols >= 4 ? 6 : 7;

  const continuationPages = useMemo(() => {
    const pages: Subject[][] = [];
    for (let i = 0; i < remainingSubjects.length; i += continuationPageSize) {
      pages.push(remainingSubjects.slice(i, i + continuationPageSize));
    }
    return pages;
  }, [remainingSubjects, continuationPageSize]);

  // Lista estruturada de todas as folhas de impressão
  const allSheets = useMemo(() => {
    const sheets: { pageIndex: number; pageSubjects: Subject[]; isFirst: boolean; isLast: boolean }[] = [
      {
        pageIndex: 0,
        pageSubjects: firstSheetSubjects,
        isFirst: true,
        isLast: continuationPages.length === 0
      }
    ];

    continuationPages.forEach((pageSubjs, idx) => {
      sheets.push({
        pageIndex: idx + 1,
        pageSubjects: pageSubjs,
        isFirst: false,
        isLast: idx === continuationPages.length - 1
      });
    });

    return sheets;
  }, [firstSheetSubjects, continuationPages]);

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

    const num = typeof val === 'number' ? val : parseFloat(val as any);
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

  const renderSituationBadge = (row: StudentPautaGeralItem) => {
    if (row.isDesistente) {
      return (
        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 print:text-black print:border print:border-slate-400">
          DESISTIDO
        </span>
      );
    }
    if (row.isDebtor && hideDebtorGrades) {
      return (
        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-300 print:text-black print:border print:border-slate-400">
          RETIDO
        </span>
      );
    }
    return (
      <span
        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
          row.situation === 'APTO'
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 print:text-emerald-800 print:border print:border-emerald-300'
            : 'bg-rose-50 text-rose-700 border border-rose-200 print:text-rose-800 print:border print:border-rose-300'
        }`}
      >
        {row.situation}
      </span>
    );
  };

  // Bloco de Assinaturas Oficiais
  const renderSignatures = () => (
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
  );

  // Cabeçalho Oficial Escolar
  const renderSchoolHeader = (sheetIndex: number, totalSheets: number, isFirst: boolean) => (
    <div className="p-4 text-center border-b-2 border-slate-900 mb-2">
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
        {totalSheets > 1 && (
          <span className="ml-1 text-[#7a0c0c] font-black">
            — Folha {sheetIndex + 1} de {totalSheets}
            {!isFirst ? ' (Continuação de Disciplinas)' : ''}
          </span>
        )}
      </div>
      <div className="text-[9px] text-slate-800 mt-1 flex items-center justify-center gap-4">
        <span><strong>Turma:</strong> {activeClass?.name || 'Turma Geral'}</span>
        <span><strong>Curso / Área:</strong> {activeClass?.area || activeClass?.cycle || 'Técnico de Saúde'}</span>
        <span><strong>Ano Lectivo:</strong> {activeClass?.academicYear || institution?.currentAcademicYear || '2024/2025'}</span>
        <span><strong>Turno:</strong> {activeClass?.shift || 'Manhã'}</span>
      </div>
    </div>
  );

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden print:border-none print:rounded-none print:shadow-none">
      {/* Estilos de Impressão A4 Paisagem com quebra de página automática */}
      <style>{`
        @media print {
          @page {
            size: A4 landscape !important;
            margin: 4mm 5mm !important;
          }
          .pauta-sheet-container {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .pauta-page-break {
            page-break-after: always !important;
            break-after: page !important;
          }
          table {
            border-collapse: collapse !important;
            width: 100% !important;
          }
          th, td {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      {/* Barra de Controle e Modo de Exibição na Tela */}
      <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs print:hidden">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#0b1f3a] text-[20px]">table_chart</span>
          <span className="font-bold text-slate-800">
            Pauta Geral Oficial • {subjects.length} Disciplinas Curriculares
          </span>
          {subjects.length > 4 && (
            <span className="px-2 py-0.5 bg-blue-50 text-blue-900 border border-blue-200 rounded font-semibold text-[11px]">
              Impressão em {allSheets.length} Folhas: Folha 1 (Alunos + 4 Disc.) | Folha 2+ (Restantes)
            </span>
          )}
        </div>

        {subjects.length > 4 && (
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setScreenViewMode('continuous')}
              className={`px-3 py-1 font-bold text-[11px] rounded transition-colors cursor-pointer ${
                screenViewMode === 'continuous'
                  ? 'bg-[#0b1f3a] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Exibe todas as colunas lado a lado com rolagem horizontal"
            >
              Visualização Completa
            </button>
            <button
              type="button"
              onClick={() => setScreenViewMode('sheets')}
              className={`px-3 py-1 font-bold text-[11px] rounded transition-colors cursor-pointer ${
                screenViewMode === 'sheets'
                  ? 'bg-[#0b1f3a] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Pré-visualizar como as Folhas 1 e 2 serão impressas"
            >
              Ver Folhas de Impressão ({allSheets.length})
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. VISUALIZAÇÃO EM TELA: MODO CONTÍNUO (TABELA COMPLETA COM ROLAGEM)     */}
      {/* ========================================================================= */}
      {screenViewMode === 'continuous' && (
        <div className="print:hidden">
          <div className="bg-blue-50/70 border-b border-blue-200/80 px-4 py-1.5 flex items-center justify-between text-[11px] text-blue-900 font-medium">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#0b1f3a]">swap_horiz</span>
              <span>
                <strong>Visualização Contínua em Tela:</strong> Role horizontalmente para conferir todas as {subjects.length} disciplinas. Na impressão, a Folha 1 conterá os dados dos alunos com 4 disciplinas, e a Folha 2 continuará com as restantes.
              </span>
            </div>
          </div>

          <div className="overflow-x-auto shadow-inner">
            <table
              className="w-full text-center text-xs border-collapse border border-slate-300"
              style={{ minWidth: `${Math.max(1200, 440 + subjects.length * 110 + (showMF ? 60 : 0) + 90)}px` }}
            >
              <thead>
                <tr className="bg-[#0b1f3a] text-white font-bold uppercase text-[11px] tracking-wider border-b border-slate-700/80">
                  <th rowSpan={2} className="py-2.5 px-2 w-10 border-r border-slate-600 text-center sticky left-0 z-10 bg-[#0b1f3a]">
                    N.º
                  </th>
                  <th rowSpan={2} className="py-2.5 px-3 min-w-[170px] text-left border-r border-slate-600 sticky left-10 z-10 bg-[#0b1f3a]">
                    Nome do Aluno
                  </th>
                  <th rowSpan={2} className="py-2.5 px-1 w-10 border-r border-slate-600 text-center">
                    Sexo
                  </th>
                  <th rowSpan={2} className="py-2.5 px-1 w-14 border-r border-slate-600 text-center">
                    Ano Nasc.
                  </th>
                  <th rowSpan={2} className="py-2.5 px-1 w-11 border-r border-slate-600 text-center">
                    Idade
                  </th>

                  {subjects.map((subj) => (
                    <th
                      key={subj.id}
                      colSpan={effectiveDisciplineSubCols}
                      className="py-2 px-1 border-r border-slate-600 bg-[#12335e] text-amber-300 font-extrabold tracking-wider text-[10px]"
                    >
                      <span className="truncate block max-w-[140px] mx-auto" title={subj.name}>
                        {subj.name.split(' ')[0]} {subj.code ? `(${subj.code})` : ''}
                      </span>
                    </th>
                  ))}

                  {showMF && (
                    <th rowSpan={2} className="py-2.5 px-2 w-12 border-r border-slate-600 bg-[#7a0c0c] text-amber-300 font-extrabold text-center">
                      MF
                    </th>
                  )}
                  <th rowSpan={2} className="py-2.5 px-3 min-w-[85px] bg-[#0b1f3a] text-white font-extrabold text-center">
                    Situação
                  </th>
                </tr>

                <tr className="bg-[#183c6b] text-slate-200 font-bold uppercase text-[9.5px] tracking-wide border-b border-slate-700">
                  {subjects.map((subj) => (
                    <React.Fragment key={`sub-${subj.id}`}>
                      {showMT1 && <th className="py-1 px-1 border-r border-slate-600 w-8 text-slate-200">MT1</th>}
                      {showMT2 && <th className="py-1 px-1 border-r border-slate-600 w-8 text-slate-200">MT2</th>}
                      {showMT3 && <th className="py-1 px-1 border-r border-slate-600 w-8 text-slate-200">MT3</th>}
                      {showMFD && <th className="py-1 px-1 border-r border-slate-600 w-9 bg-[#0f2849] text-amber-300 font-black">MFD</th>}
                      {!showMT1 && !showMT2 && !showMT3 && !showMFD && (
                        <th className="py-1 px-1 border-r border-slate-600 w-9 bg-[#0f2849] text-amber-300 font-black">MFD</th>
                      )}
                    </React.Fragment>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {rows.map((row, idx) => {
                  const isDesistente = row.isDesistente;
                  const isDebtor = row.isDebtor;

                  return (
                    <tr
                      key={row.id || idx}
                      className={`border-b border-slate-200 transition-colors ${
                        isDesistente
                          ? 'bg-slate-100/80 text-slate-400 italic'
                          : idx % 2 === 1
                          ? 'bg-[#f8fafc] hover:bg-sky-50/40'
                          : 'bg-white hover:bg-sky-50/40'
                      }`}
                    >
                      <td className="py-1.5 px-2 font-mono font-bold text-slate-600 border-r border-slate-200 text-center sticky left-0 z-5 bg-inherit">
                        {row.num}
                      </td>
                      <td className="py-1.5 px-3 text-left border-r border-slate-200 sticky left-10 z-5 bg-inherit">
                        <span className="font-semibold text-slate-900 tracking-tight text-xs">
                          {row?.name || 'Aluno'}
                        </span>
                      </td>
                      <td className="py-1.5 px-1 font-bold text-slate-700 border-r border-slate-200 text-center">
                        {row.gender}
                      </td>
                      <td className="py-1.5 px-1 font-mono text-slate-600 border-r border-slate-200 text-center">
                        {row.birthYear}
                      </td>
                      <td className="py-1.5 px-1 font-mono font-bold text-slate-700 border-r border-slate-200 text-center">
                        {row.age}
                      </td>

                      {subjects.map((subj) => {
                        const grades = row.subjectGrades[subj.id] || { mt1: '', mt2: '', mt3: '', mfd: '' };
                        return (
                          <React.Fragment key={`${subj.id}-${row.id}`}>
                            {showMT1 && (
                              <td className="py-1 px-1 border-r border-slate-200 text-center">
                                {renderGrade(grades.mt1, isDebtor, isDesistente)}
                              </td>
                            )}
                            {showMT2 && (
                              <td className="py-1 px-1 border-r border-slate-200 text-center">
                                {renderGrade(grades.mt2, isDebtor, isDesistente)}
                              </td>
                            )}
                            {showMT3 && (
                              <td className="py-1 px-1 border-r border-slate-200 text-center">
                                {renderGrade(grades.mt3, isDebtor, isDesistente)}
                              </td>
                            )}
                            {showMFD && (
                              <td className="py-1 px-1 border-r border-slate-200 bg-blue-50/40 font-mono font-bold text-center">
                                {renderGrade(grades.mfd, isDebtor, isDesistente, true)}
                              </td>
                            )}
                            {!showMT1 && !showMT2 && !showMT3 && !showMFD && (
                              <td className="py-1 px-1 border-r border-slate-200 bg-blue-50/40 font-mono font-bold text-center">
                                {renderGrade(grades.mfd, isDebtor, isDesistente, true)}
                              </td>
                            )}
                          </React.Fragment>
                        );
                      })}

                      {showMF && (
                        <td className="py-1.5 px-2 border-r border-slate-200 bg-rose-50/60 font-mono font-black text-center">
                          {isDesistente ? (
                            <span className="text-slate-300 font-mono">-</span>
                          ) : isDebtor && hideDebtorGrades ? (
                            <span className="text-slate-400 font-mono font-bold text-xs select-none">
                              -
                            </span>
                          ) : (
                            <span
                              className={`font-mono text-xs font-black ${
                                typeof row.mf === 'number' && row.mf < 10 ? 'text-rose-600' : 'text-slate-900'
                              }`}
                            >
                              {row.mf !== '' ? row.mf : '-'}
                            </span>
                          )}
                        </td>
                      )}

                      <td className="py-1.5 px-2 text-center">
                        {renderSituationBadge(row)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {renderSignatures()}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MODO FOLHAS (UTILIZADO NA IMPRESSÃO E PREVIEW DE FOLHAS EM TELA)        */}
      {/* Regra estrita:                                                            */}
      {/* Folha 1: Dados do Aluno (N0, Nome, Sexo, Ano Nasc, Idade) + 4 disciplinas */}
      {/* Folha 2+: Restantes disciplinas (SEM dados de aluno) + MF + Situação      */}
      {/* ========================================================================= */}
      <div className={`pauta-sheet-container ${screenViewMode === 'continuous' ? 'hidden print:block' : 'block'}`}>
        {allSheets.map((sheet) => {
          const isFirstPage = sheet.isFirst;
          const isLastPage = sheet.isLast;
          const totalSheets = allSheets.length;

          return (
            <div
              key={`sheet-page-${sheet.pageIndex}`}
              className={`w-full bg-white mb-8 print:mb-0 ${!isLastPage ? 'pauta-page-break' : ''}`}
            >
              {/* Cabeçalho Oficial Ministerial */}
              {renderSchoolHeader(sheet.pageIndex, totalSheets, isFirstPage)}

              {/* Tabela da Folha Específica */}
              <div className="overflow-x-auto print:overflow-visible">
                <table className="w-full text-center text-xs border-collapse border border-slate-300 print:border-slate-400 print:text-[7.5pt]">
                  <thead>
                    {/* Top Tier Header */}
                    <tr className="bg-[#0b1f3a] text-white font-bold uppercase text-[11px] tracking-wider border-b border-slate-700/80 print:bg-[#0b1f3a] print:text-white">
                      {/* As colunas do aluno aparecem SOMENTE na PRIMEIRA folha */}
                      {isFirstPage && (
                        <>
                          <th rowSpan={2} className="py-2.5 px-2 w-10 border-r border-slate-600 print:border-slate-500 text-center">
                            N.º
                          </th>
                          <th rowSpan={2} className="py-2.5 px-3 min-w-[170px] print:min-w-0 text-left border-r border-slate-600 print:border-slate-500">
                            Nome do Aluno
                          </th>
                          <th rowSpan={2} className="py-2.5 px-1 w-10 print:w-7 border-r border-slate-600 print:border-slate-500 text-center">
                            Sexo
                          </th>
                          <th rowSpan={2} className="py-2.5 px-1 w-14 print:w-11 border-r border-slate-600 print:border-slate-500 text-center">
                            Ano Nasc.
                          </th>
                          <th rowSpan={2} className="py-2.5 px-1 w-11 print:w-8 border-r border-slate-600 print:border-slate-500 text-center">
                            Idade
                          </th>
                        </>
                      )}

                      {/* Disciplinas desta Folha */}
                      {sheet.pageSubjects.map((subj) => (
                        <th
                          key={`th-sheet-${sheet.pageIndex}-${subj.id}`}
                          colSpan={effectiveDisciplineSubCols}
                          className="py-2 px-1 border-r border-slate-600 print:border-slate-500 bg-[#12335e] text-amber-300 font-extrabold tracking-wider text-[10px] print:text-[7.5pt] print:bg-[#12335e] print:text-amber-300"
                        >
                          <span className="truncate block max-w-[140px] mx-auto" title={subj.name}>
                            {subj.name.split(' ')[0]} {subj.code ? `(${subj.code})` : ''}
                          </span>
                        </th>
                      ))}

                      {/* MF e Situação aparecem na ÚLTIMA folha */}
                      {isLastPage && showMF && (
                        <th rowSpan={2} className="py-2.5 px-2 w-12 print:w-9 border-r border-slate-600 print:border-slate-500 bg-[#7a0c0c] text-amber-300 font-extrabold print:bg-[#7a0c0c] print:text-amber-300 text-center">
                          MF
                        </th>
                      )}
                      {isLastPage && (
                        <th rowSpan={2} className="py-2.5 px-3 min-w-[85px] print:min-w-0 bg-[#0b1f3a] text-white font-extrabold print:bg-[#0b1f3a] print:text-white text-center">
                          Situação
                        </th>
                      )}
                    </tr>

                    {/* Sub Tier Header */}
                    <tr className="bg-[#183c6b] text-slate-200 font-bold uppercase text-[9.5px] tracking-wide border-b border-slate-700 print:bg-[#183c6b] print:text-slate-200">
                      {sheet.pageSubjects.map((subj) => (
                        <React.Fragment key={`sub-sheet-${sheet.pageIndex}-${subj.id}`}>
                          {showMT1 && <th className="py-1 px-1 border-r border-slate-600 print:border-slate-500 w-8 print:w-6 text-slate-200">MT1</th>}
                          {showMT2 && <th className="py-1 px-1 border-r border-slate-600 print:border-slate-500 w-8 print:w-6 text-slate-200">MT2</th>}
                          {showMT3 && <th className="py-1 px-1 border-r border-slate-600 print:border-slate-500 w-8 print:w-6 text-slate-200">MT3</th>}
                          {showMFD && <th className="py-1 px-1 border-r border-slate-600 print:border-slate-500 w-9 print:w-7 bg-[#0f2849] text-amber-300 font-black print:bg-[#0f2849] print:text-amber-300">MFD</th>}
                          {!showMT1 && !showMT2 && !showMT3 && !showMFD && (
                            <th className="py-1 px-1 border-r border-slate-600 print:border-slate-500 w-9 print:w-7 bg-[#0f2849] text-amber-300 font-black print:bg-[#0f2849] print:text-amber-300">MFD</th>
                          )}
                        </React.Fragment>
                      ))}
                    </tr>
                  </thead>

                  {/* Linhas de Alunos */}
                  <tbody className="divide-y divide-slate-200 print:divide-slate-300">
                    {rows.map((row, idx) => {
                      const isDesistente = row.isDesistente;
                      const isDebtor = row.isDebtor;

                      return (
                        <tr
                          key={`sheet-row-${sheet.pageIndex}-${row.id || idx}`}
                          className={`h-7 border-b border-slate-200 print:border-slate-300 transition-colors ${
                            isDesistente
                              ? 'bg-slate-100/80 text-slate-400 italic print:bg-slate-100'
                              : idx % 2 === 1
                              ? 'bg-[#f8fafc] hover:bg-sky-50/40'
                              : 'bg-white hover:bg-sky-50/40'
                          }`}
                        >
                          {/* Colunas do aluno SOMENTE na PRIMEIRA folha */}
                          {isFirstPage && (
                            <>
                              {/* N.º */}
                              <td className="py-1 px-2 font-mono font-bold text-slate-600 border-r border-slate-200 print:border-slate-300 print:text-black text-center">
                                {row.num}
                              </td>

                              {/* Nome do Aluno */}
                              <td className="py-1 px-3 text-left border-r border-slate-200 print:border-slate-300">
                                <span className="font-semibold text-slate-900 tracking-tight text-xs print:text-[7.5pt] print:text-black">
                                  {row?.name || 'Aluno'}
                                </span>
                              </td>

                              {/* Sexo */}
                              <td className="py-1 px-1 font-bold text-slate-700 border-r border-slate-200 print:border-slate-300 print:text-black text-center">
                                {row.gender}
                              </td>

                              {/* Ano de Nascimento */}
                              <td className="py-1 px-1 font-mono text-slate-600 border-r border-slate-200 print:border-slate-300 print:text-black text-center">
                                {row.birthYear}
                              </td>

                              {/* Idade */}
                              <td className="py-1 px-1 font-mono font-bold text-slate-700 border-r border-slate-200 print:border-slate-300 print:text-black text-center">
                                {row.age}
                              </td>
                            </>
                          )}

                          {/* Notas das Disciplinas desta folha */}
                          {sheet.pageSubjects.map((subj) => {
                            const grades = row.subjectGrades[subj.id] || { mt1: '', mt2: '', mt3: '', mfd: '' };

                            return (
                              <React.Fragment key={`td-${sheet.pageIndex}-${subj.id}-${row.id}`}>
                                {showMT1 && (
                                  <td className="py-1 px-1 border-r border-slate-200 print:border-slate-300 text-center">
                                    {renderGrade(grades.mt1, isDebtor, isDesistente)}
                                  </td>
                                )}
                                {showMT2 && (
                                  <td className="py-1 px-1 border-r border-slate-200 print:border-slate-300 text-center">
                                    {renderGrade(grades.mt2, isDebtor, isDesistente)}
                                  </td>
                                )}
                                {showMT3 && (
                                  <td className="py-1 px-1 border-r border-slate-200 print:border-slate-300 text-center">
                                    {renderGrade(grades.mt3, isDebtor, isDesistente)}
                                  </td>
                                )}
                                {showMFD && (
                                  <td className="py-1 px-1 border-r border-slate-200 bg-blue-50/40 font-mono font-bold print:border-slate-300 print:bg-blue-50/40 text-center">
                                    {renderGrade(grades.mfd, isDebtor, isDesistente, true)}
                                  </td>
                                )}
                                {!showMT1 && !showMT2 && !showMT3 && !showMFD && (
                                  <td className="py-1 px-1 border-r border-slate-200 bg-blue-50/40 font-mono font-bold print:border-slate-300 print:bg-blue-50/40 text-center">
                                    {renderGrade(grades.mfd, isDebtor, isDesistente, true)}
                                  </td>
                                )}
                              </React.Fragment>
                            );
                          })}

                          {/* MF na Última Folha */}
                          {isLastPage && showMF && (
                            <td className="py-1 px-2 border-r border-slate-200 bg-rose-50/60 font-mono font-black print:border-slate-300 print:bg-rose-50/60 text-center">
                              {isDesistente ? (
                                <span className="text-slate-300 font-mono">-</span>
                              ) : isDebtor && hideDebtorGrades ? (
                                <span className="text-slate-400 font-mono font-bold text-xs select-none print:text-[8pt] print:text-slate-500">
                                  -
                                </span>
                              ) : (
                                <span
                                  className={`font-mono text-xs font-black print:text-[8pt] ${
                                    typeof row.mf === 'number' && row.mf < 10 ? 'text-rose-600' : 'text-slate-900'
                                  }`}
                                >
                                  {row.mf !== '' ? row.mf : '-'}
                                </span>
                              )}
                            </td>
                          )}

                          {/* Situação na Última Folha */}
                          {isLastPage && (
                            <td className="py-1 px-2 text-center print:border-slate-300">
                              {renderSituationBadge(row)}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Rodapé da Folha */}
              {!isLastPage ? (
                <div className="p-2.5 mt-2 bg-slate-50/60 border border-slate-200 text-[11px] text-slate-700 font-bold flex items-center justify-between print:bg-white print:border-slate-300 print:text-[8pt]">
                  <span className="text-slate-600 font-normal">
                    Pauta Geral • {activeClass?.name} (Folha {sheet.pageIndex + 1} de {totalSheets}: Alunos e Primeiras 4 Disciplinas)
                  </span>
                  <span className="text-[#0b1f3a] font-extrabold">
                    👉 Continua na Folha {sheet.pageIndex + 2} com as restantes disciplinas ({remainingSubjects.map(s => s.name.split(' ')[0]).join(', ')})
                  </span>
                </div>
              ) : (
                /* Assinaturas Oficiais na Folha Final */
                renderSignatures()
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
