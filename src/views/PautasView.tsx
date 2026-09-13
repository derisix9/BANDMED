import React, { useState, useEffect, useMemo } from 'react';
import { SchoolDatabase, UserRole, User, ClassRoom, Subject } from '../types';
import { GradeTypeKey, StudentMiniPautaItem, StudentPautaGeralItem } from '../types/pauta';
import { getAvailableSubjectsForUser } from '../utils/teacherSubjects';
import { runGlobalOperation } from '../context/OperationContext';
import { dbService } from '../services/db';
import { getStudentsForClass } from '../utils/classStudentsRoster';
import {
  buildMiniPautaRows,
  buildPautaGeralRows,
  calculateMT,
  calculateMFD,
  calculateCA
} from '../utils/pautaCalculations';
import { GradeTypeSelector } from '../components/pauta/GradeTypeSelector';
import { MiniPautaTable } from '../components/pauta/MiniPautaTable';
import { PautaGeralTable } from '../components/pauta/PautaGeralTable';

interface PautasViewProps {
  db: SchoolDatabase;
  currentUserRole: UserRole;
  currentUser?: User;
}

export const PautasView: React.FC<PautasViewProps> = ({ db, currentUserRole, currentUser }) => {
  // Navigation Tabs: 'minipauta' (Mini Pauta por Disciplina) vs 'pauta' (Pauta Geral)
  const [activeTab, setActiveTab] = useState<'minipauta' | 'pauta'>('minipauta');

  const availableSubjects = useMemo(() => {
    return getAvailableSubjectsForUser(db, currentUser);
  }, [db, currentUser]);

  const [selectedClassId, setSelectedClassId] = useState<string>(
    db.classes[0]?.id ? String(db.classes[0].id) : ''
  );

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    availableSubjects[0]?.id ? String(availableSubjects[0].id) : (db.subjects[0]?.id ? String(db.subjects[0].id) : '')
  );

  const [isDirectorSigned, setIsDirectorSigned] = useState<boolean>(false);

  // Filter for Grade Types (MT1, MT2, MT3, MFD, MF, MAC, NPP, NPT, PG, CA)
  const [selectedGradeTypes, setSelectedGradeTypes] = useState<Set<GradeTypeKey>>(
    new Set<GradeTypeKey>(['MAC', 'NPP', 'NPT', 'MT1', 'MT2', 'MT3', 'MFD', 'PG', 'CA', 'MF'])
  );

  // Financial Compliance: Hide debtor grades on print option
  const [hideDebtorGrades, setHideDebtorGrades] = useState<boolean>(true);
  const [previewHiddenOnScreen, setPreviewHiddenOnScreen] = useState<boolean>(false);

  // Fallback defaults if institution has no classes or subjects yet
  const fallbackClass: ClassRoom = useMemo(() => ({
    id: 'turma-padrao',
    name: '10.ª Classe • Turma A',
    grade: '10ª Classe',
    section: 'A',
    cycle: 'II Ciclo do Ensino Secundário',
    area: 'Ciências Físicas e Biológicas',
    shift: 'Manhã',
    room: 'Sala 1',
    studentCount: db.students?.length || 0,
    maxCapacity: 45,
    headTeacherId: '',
    headTeacherName: 'Director de Turma',
    academicYear: db.settings?.currentAcademicYear || `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`
  }), [db.students?.length, db.settings?.currentAcademicYear]);

  const fallbackSubject: Subject = useMemo(() => ({
    id: 'sub-padrao',
    name: 'Disciplina Curricular',
    code: 'GER-10',
    cycle: 'II Ciclo do Ensino Secundário',
    weeklyHours: 4,
    area: 'Tronco Comum'
  }), []);

  // Ensure selectedClassId is valid
  useEffect(() => {
    if (db.classes && db.classes.length > 0 && !db.classes.some((c) => String(c.id) === String(selectedClassId))) {
      setSelectedClassId(String(db.classes[0].id));
    }
  }, [db.classes, selectedClassId]);

  // Ensure selectedSubjectId is valid
  useEffect(() => {
    if (availableSubjects.length > 0 && !availableSubjects.some((s) => String(s.id) === String(selectedSubjectId))) {
      setSelectedSubjectId(String(availableSubjects[0].id));
    }
  }, [availableSubjects, selectedSubjectId]);

  const activeClass = (db.classes || []).find((c) => String(c.id) === String(selectedClassId)) || db.classes?.[0] || fallbackClass;
  const activeSubject = (db.subjects || []).find((s) => String(s.id) === String(selectedSubjectId)) || availableSubjects?.[0] || db.subjects?.[0] || fallbackSubject;

  // Students belonging strictly to the selected class
  const classStudents = useMemo(() => {
    return getStudentsForClass(selectedClassId, db.students || [], activeClass?.name);
  }, [selectedClassId, db.students, activeClass?.name]);

  // Subjects taught in the active class
  const classSubjects = useMemo(() => {
    return (db.subjects && db.subjects.length > 0) ? db.subjects : [activeSubject];
  }, [db.subjects, activeSubject]);

  // Persistent cache of edited grades per class, subject, and student
  const [gradesCache, setGradesCache] = useState<Record<string, Record<string, Record<string, StudentMiniPautaItem>>>>({});

  // Main Grade Rows state
  const [miniPautaRows, setMiniPautaRows] = useState<StudentMiniPautaItem[]>(() => {
    const subjectCache = gradesCache[selectedClassId]?.[selectedSubjectId];
    return buildMiniPautaRows(classStudents, selectedSubjectId, db.students, subjectCache);
  });

  const [pautaGeralRows, setPautaGeralRows] = useState<StudentPautaGeralItem[]>(() => {
    const classCache = gradesCache[selectedClassId];
    return buildPautaGeralRows(classStudents, classSubjects, db.students, classCache);
  });

  // Rebuild rows when class or subject changes
  useEffect(() => {
    const stored = dbService.getMiniPautaRows(selectedClassId, selectedSubjectId);
    if (stored && Array.isArray(stored) && stored.length > 0) {
      setMiniPautaRows(stored);
      return;
    }
    const subjectCache = gradesCache[selectedClassId]?.[selectedSubjectId];
    setMiniPautaRows(buildMiniPautaRows(classStudents, selectedSubjectId, db.students, subjectCache));
  }, [selectedClassId, selectedSubjectId, classStudents, db.students]);

  useEffect(() => {
    const classCache = gradesCache[selectedClassId];
    setPautaGeralRows(buildPautaGeralRows(classStudents, classSubjects, db.students, classCache));
  }, [selectedClassId, classSubjects, classStudents, db.students]);

  // Toggle single grade type
  const handleToggleGradeType = (key: GradeTypeKey) => {
    setSelectedGradeTypes((prev) => {
      const updated = new Set(prev);
      if (updated.has(key)) {
        updated.delete(key);
      } else {
        updated.add(key);
      }
      return updated;
    });
  };

  // Preset Handlers
  const handleSelectAllTypes = () => {
    setSelectedGradeTypes(new Set<GradeTypeKey>(['MAC', 'NPP', 'NPT', 'MT1', 'MT2', 'MT3', 'MFD', 'PG', 'CA', 'MF']));
  };

  const handleSelectAveragesOnly = () => {
    setSelectedGradeTypes(new Set<GradeTypeKey>(['MT1', 'MT2', 'MT3', 'MFD', 'MF']));
  };

  const handleSelectEvaluationsOnly = () => {
    setSelectedGradeTypes(new Set<GradeTypeKey>(['MAC', 'NPP', 'NPT', 'PG']));
  };

  const handleResetDefaultMiniPauta = () => {
    setSelectedGradeTypes(new Set<GradeTypeKey>(['MAC', 'NPP', 'NPT', 'MT1', 'MT2', 'MT3', 'MFD', 'PG', 'CA', 'MF']));
  };

  // Real-time calculation when editing a grade cell in Mini-Pauta
  const handleMiniPautaCellChange = (rowIndex: number, field: keyof StudentMiniPautaItem, value: any) => {
    let updatedRow: StudentMiniPautaItem | null = null;

    setMiniPautaRows((prev) => {
      const updated = [...prev];
      const row = { ...updated[rowIndex], [field]: value };

      if (row.isDesistente) {
        updated[rowIndex] = row;
        updatedRow = row;
        return updated;
      }

      // Recalculate MT1
      if (field === 'mac1' || field === 'npp1' || field === 'npt1') {
        row.mt1 = calculateMT(row.mac1, row.npp1, row.npt1);
      }

      // Recalculate MT2
      if (field === 'mac2' || field === 'npp2' || field === 'npt2') {
        row.mt2 = calculateMT(row.mac2, row.npp2, row.npt2);
      }

      // Recalculate MT3
      if (field === 'mac3' || field === 'npp3' || field === 'npt3') {
        row.mt3 = calculateMT(row.mac3, row.npp3, row.npt3);
      }

      // Recalculate MFD & CA
      row.mfd = calculateMFD(row.mt1, row.mt2, row.mt3, row.pg);
      row.ca = calculateCA(row.mfd);

      if (typeof row.mfd === 'number') {
        row.obs = row.mfd >= 10 ? 'Aprovado' : 'Exame de Recurso';
      }

      updated[rowIndex] = row;
      updatedRow = row;
      return updated;
    });

    if (updatedRow) {
      const r = updatedRow as StudentMiniPautaItem;
      setGradesCache((prev) => {
        const classCache = prev[selectedClassId] || {};
        const subjectCache = classCache[selectedSubjectId] || {};
        return {
          ...prev,
          [selectedClassId]: {
            ...classCache,
            [selectedSubjectId]: {
              ...subjectCache,
              [r.studentId]: r
            }
          }
        };
      });
    }

    // Also synchronize corresponding student discipline grades in Pauta Geral
    setPautaGeralRows((prev) => {
      const updated = [...prev];
      if (updated[rowIndex]) {
        const studentRow = { ...updated[rowIndex] };
        const currentSubjGrades = { ...studentRow.subjectGrades };
        const miniRow = miniPautaRows[rowIndex];

        if (miniRow && !miniRow.isDesistente) {
          const mt1 = field === 'mt1' ? value : (field === 'mac1' || field === 'npp1' || field === 'npt1' ? calculateMT(field === 'mac1' ? value : miniRow.mac1, field === 'npp1' ? value : miniRow.npp1, field === 'npt1' ? value : miniRow.npt1) : miniRow.mt1);
          const mt2 = field === 'mt2' ? value : (field === 'mac2' || field === 'npp2' || field === 'npt2' ? calculateMT(field === 'mac2' ? value : miniRow.mac2, field === 'npp2' ? value : miniRow.npp2, field === 'npt2' ? value : miniRow.npt2) : miniRow.mt2);
          const mt3 = field === 'mt3' ? value : (field === 'mac3' || field === 'npp3' || field === 'npt3' ? calculateMT(field === 'mac3' ? value : miniRow.mac3, field === 'npp3' ? value : miniRow.npp3, field === 'npt3' ? value : miniRow.npt3) : miniRow.mt3);
          const mfd = calculateMFD(mt1, mt2, mt3, field === 'pg' ? value : miniRow.pg);

          currentSubjGrades[selectedSubjectId] = { mt1, mt2, mt3, mfd };
          studentRow.subjectGrades = currentSubjGrades;

          // Recalculate overall MF
          const allMfds = Object.values(currentSubjGrades)
            .map((g) => g.mfd)
            .filter((m): m is number => typeof m === 'number');

          if (allMfds.length > 0) {
            const mf = Math.round(allMfds.reduce((a, b) => a + b, 0) / allMfds.length);
            studentRow.mf = mf;
            studentRow.situation = mf >= 10 ? 'APTO' : 'N/APTO';
          }
          updated[rowIndex] = studentRow;
        }
      }
      return updated;
    });
  };

  // Toggle student as Desistente
  const handleToggleDesistente = (rowIndex: number) => {
    setMiniPautaRows((prev) => {
      const updated = [...prev];
      const target = { ...updated[rowIndex] };
      target.isDesistente = !target.isDesistente;
      if (target.isDesistente) {
        target.obs = 'Desistente';
      } else {
        target.mfd = calculateMFD(target.mt1, target.mt2, target.mt3, target.pg);
        target.ca = calculateCA(target.mfd);
        target.obs = typeof target.mfd === 'number' && target.mfd >= 10 ? 'Aprovado' : 'Exame de Recurso';
      }
      updated[rowIndex] = target;
      return updated;
    });

    setPautaGeralRows((prev) => {
      const updated = [...prev];
      if (updated[rowIndex]) {
        const studentRow = { ...updated[rowIndex] };
        studentRow.isDesistente = !studentRow.isDesistente;
        studentRow.situation = studentRow.isDesistente ? 'DESISTIDO' : (typeof studentRow.mf === 'number' && studentRow.mf >= 10 ? 'APTO' : 'N/APTO');
        updated[rowIndex] = studentRow;
      }
      return updated;
    });
  };

  // Stats calculation
  const totalStudents = miniPautaRows.length;
  const debtorStudentsCount = miniPautaRows.filter((r) => r.isDebtor).length;
  const desistentesCount = miniPautaRows.filter((r) => r.isDesistente).length;
  const activeStudentsCount = totalStudents - desistentesCount;

  const validMfds = miniPautaRows
    .filter((r) => !r.isDesistente && typeof r.mfd === 'number')
    .map((r) => r.mfd as number);

  const averageScore = validMfds.length > 0 ? (validMfds.reduce((a, b) => a + b, 0) / validMfds.length).toFixed(1) : '0.0';
  const approvedCount = validMfds.filter((score) => score >= 10).length;
  const approvalRate = activeStudentsCount > 0 ? Math.round((approvedCount / activeStudentsCount) * 100) : 0;
  const resourceCount = validMfds.filter((score) => score < 10).length;

  return (
    <div className="flex flex-col w-full gap-5 pb-16 printable-document">
      {/* Action Header & Tabs Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
              Gestão Acadêmica & Avaliação
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#0b1f3a]" />
            <span className="text-xs font-semibold text-[#0b1f3a]">
              {activeTab === 'minipauta' ? 'Mini-Pauta por Disciplina' : 'Pauta Geral da Turma'}
            </span>
          </div>
          <h1 className="font-headline text-2xl lg:text-3xl font-extrabold text-[#0b1f3a] tracking-tight">
            Lançamento de Notas & Pautas
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Print Button */}
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-xl bg-[#0b1f3a] hover:bg-[#122c50] text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-amber-400">print</span>
            <span>{activeTab === 'minipauta' ? 'Imprimir' : 'Imprimir'}</span>
          </button>

          {/* Save & Sync Button */}
          <button
            onClick={async () => {
              await runGlobalOperation(
                async () => {
                  dbService.saveMiniPautaRows(selectedClassId, selectedSubjectId, miniPautaRows, currentUser?.name);
                  await dbService.pushToCloudStorage();
                },
                {
                  loadingMessage: 'A gravar notas e a sincronizar na base de dados...',
                  successMessage: 'Pauta e notas gravadas com sucesso na base de dados!'
                }
              );
            }}
            className="px-3.5 py-2 rounded-xl bg-[#0b1f3a] hover:bg-[#122c50] text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">cloud_sync</span>
            <span>Gravar & Sincronizar</span>
          </button>

          {/* Homologate Button for Admin */}
          {currentUserRole === 'admin' && (
            <button
              onClick={async () => {
                await runGlobalOperation(
                  async () => {
                    setIsDirectorSigned(true);
                    dbService.homologatePauta('Dr. Afonso Henriques', '901923');
                  },
                  {
                    loadingMessage: 'A homologar pauta pedagógica...',
                    successMessage: 'Pauta homologada pela Direção Pedagógica!'
                  }
                );
              }}
              className="px-3.5 py-2 rounded-xl bg-[#7a0c0c] hover:bg-[#8f1010] text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>{isDirectorSigned ? 'Homologada' : 'Homologar'}</span>
            </button>
          )}
        </div>
      </div>

      {/* TWO PRIMARY TABS (Mini Pauta & Pauta) */}
      {/* Requirement: "CRIA DUAS ABAS UMA PARA MINI PAUTA E OUTRA PARA PAUTA." */}
      <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-2 border border-slate-200 no-print print:hidden shadow-2xs max-w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('minipauta')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'minipauta'
              ? 'bg-[#0b1f3a] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">view_week</span>
          <span>Mini-Pauta</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-white/20 text-white">
            Trimestral
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pauta')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'pauta'
              ? 'bg-[#0b1f3a] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">table_chart</span>
          <span>Pauta Final</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-amber-400 text-slate-900 font-black">
            Geral
          </span>
        </button>
      </div>


      {/* Class & Subject Selectors */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs no-print print:hidden">
        <div>
          <label className="block uppercase font-bold text-slate-500 mb-1">Turma Curricular</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full h-9 px-3 rounded-lg bg-slate-100 font-bold text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#0b1f3a]"
          >
            {(!db.classes || db.classes.length === 0) ? (
              <option value="">Nenhuma turma cadastrada</option>
            ) : (
              db.classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.room})
                </option>
              ))
            )}
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block uppercase font-bold text-slate-500 text-[11px]">
              {activeTab === 'minipauta' ? 'Disciplina da Mini-Pauta' : 'Foco Curricular'}
            </label>
            {currentUserRole === 'professor' && (
              <span className="text-[10px] text-blue-700 font-semibold">(Suas disciplinas)</span>
            )}
          </div>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            disabled={activeTab === 'pauta'}
            className={`w-full h-9 px-3 rounded-lg font-bold text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#0b1f3a] ${
              activeTab === 'pauta' ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-slate-100'
            }`}
          >
            {availableSubjects.length === 0 ? (
              <option value="">Nenhuma disciplina disponível</option>
            ) : (
              availableSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))
            )}
          </select>
        </div>

        <div>
          <label className="block uppercase font-bold text-slate-500 mb-1">Ano Lectivo / Regime</label>
          <div className="relative">
            <select
              value={activeClass?.academicYear || db.settings?.currentAcademicYear || ''}
              onChange={(e) => {
                dbService.setAcademicYear(e.target.value);
              }}
              className="w-full h-9 px-3 pr-7 rounded-lg bg-slate-100 font-bold text-slate-700 focus:bg-white focus:ring-1 focus:ring-[#0b1f3a] text-xs cursor-pointer truncate"
              title="Ano Lectivo e Regime vigentes"
            >
              {Array.from(
                new Set(
                  [
                    activeClass?.academicYear,
                    db.settings?.currentAcademicYear,
                    ...(db.settings?.availableAcademicYears || [])
                  ].filter(Boolean)
                )
              ).map((yr) => (
                <option key={yr as string} value={yr as string}>
                  {yr as string} • {activeClass?.shift ? `Presencial (${activeClass.shift})` : 'Presencial'}
                </option>
              ))}
            </select>
            <span
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-500 pointer-events-none"
              title="Ano letivo ativo"
            />
          </div>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center no-print print:hidden">
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Média da Turma</span>
          <span className="font-headline text-2xl font-extrabold text-[#0b1f3a]">{averageScore}</span>
          <span className="text-[10px] text-slate-400">Escala 0 a 20 (Ensino Médio)</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-emerald-700 block">Taxa de Aproveitamento</span>
          <span className="font-headline text-2xl font-extrabold text-emerald-700">{approvalRate}%</span>
          <span className="text-[10px] text-slate-400">{approvedCount} de {activeStudentsCount} alunos aptos</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-[#7a0c0c] block">Em Recurso / Reprovados</span>
          <span className="font-headline text-2xl font-extrabold text-[#7a0c0c]">{resourceCount}</span>
          <span className="text-[10px] text-slate-400">Classificação &lt; 10 valores</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-amber-700 block">Alunos com Propinas Pendentes</span>
          <span className="font-headline text-2xl font-extrabold text-amber-800">{debtorStudentsCount}</span>
          <span className="text-[10px] text-slate-400">
            {hideDebtorGrades ? 'Notas ocultadas ao imprimir' : 'Visível'}
          </span>
        </div>
      </div>

      {/* Interactive Grade Type Selector & Debtor Controls */}
      {/* Requirements:
          1. "DEVE SER POSSIVEL SELECIONAR QUAIS TIPOS DE NOTAS (MT1,MT2,MT3,MFD,MF,MAC,NPP,NPT,PG,CA) VAI CONSTAR OU SER VISTO NA PAUTA OU MINI PAUTA."
          2. "COLOQUE OPÇÃO DE VER E OCULTAR NOTAS DOS ALUNOS DEVEDORES DA PAUTA AO IMPIRMIR."
      */}
      <GradeTypeSelector
        selectedTypes={selectedGradeTypes}
        onToggleType={handleToggleGradeType}
        onSelectAll={handleSelectAllTypes}
        onSelectAveragesOnly={handleSelectAveragesOnly}
        onSelectEvaluationsOnly={handleSelectEvaluationsOnly}
        onResetDefaultMiniPauta={handleResetDefaultMiniPauta}
        hideDebtorGrades={hideDebtorGrades}
        onToggleHideDebtorGrades={setHideDebtorGrades}
        previewHiddenOnScreen={previewHiddenOnScreen}
        onTogglePreviewHiddenOnScreen={setPreviewHiddenOnScreen}
        activeTab={activeTab}
      />

      {/* TAB CONTENT 1: MINI-PAUTA */}
      {activeTab === 'minipauta' && (
        <MiniPautaTable
          rows={miniPautaRows}
          onCellChange={handleMiniPautaCellChange}
          onToggleDesistente={handleToggleDesistente}
          selectedGradeTypes={selectedGradeTypes}
          hideDebtorGrades={hideDebtorGrades}
          previewHiddenOnScreen={previewHiddenOnScreen}
          activeClass={activeClass}
          activeSubject={activeSubject}
          settings={db.settings}
        />
      )}

      {/* TAB CONTENT 2: PAUTA GERAL */}
      {activeTab === 'pauta' && (
        <PautaGeralTable
          rows={pautaGeralRows}
          subjects={classSubjects}
          selectedGradeTypes={selectedGradeTypes}
          hideDebtorGrades={hideDebtorGrades}
          previewHiddenOnScreen={previewHiddenOnScreen}
          activeClass={activeClass}
          onToggleDesistente={handleToggleDesistente}
          settings={db.settings}
        />
      )}
    </div>
  );
};
