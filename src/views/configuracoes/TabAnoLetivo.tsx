import React, { useState } from 'react';
import { InstitutionSettings, UserRole } from '../../types';
import { dbService } from '../../services/db';
import { runGlobalOperation } from '../../context/OperationContext';

interface TabAnoLetivoProps {
  settings: InstitutionSettings;
  currentUserRole?: UserRole;
  onUpdateSettings?: (newSettings: Partial<InstitutionSettings>) => void;
  onSaveAll: (options?: { loadingMessage?: string; successMessage?: string; requiredRule?: string }) => void;
}

const DEFAULT_PAUSAS = [
  { id: 1, desc: 'Pausa de Fim de Ano & Natal', periodo: '14 Dez 2024 — 05 Jan 2025', dias: '22 Dias' },
  { id: 2, desc: 'Interrupção de Carnaval', periodo: '03 Mar 2025 — 05 Mar 2025', dias: '3 Dias' },
  { id: 3, desc: 'Pausa Pedagógica da Páscoa', periodo: '12 Abr 2025 — 27 Abr 2025', dias: '16 Dias' },
  { id: 4, desc: 'Férias Maiores (Verão Académico)', periodo: '01 Ago 2025 — 31 Ago 2025', dias: '31 Dias' }
];

export const TabAnoLetivo: React.FC<TabAnoLetivoProps> = ({ settings, currentUserRole, onUpdateSettings, onSaveAll }) => {
  const currentTrimester = settings.currentTrimester || '2';

  const [bloqueioSumarios, setBloqueioSumarios] = useState(settings.academicLockingRules?.bloqueioSumarios ?? true);
  const [toleranciaNotas, setToleranciaNotas] = useState(settings.academicLockingRules?.toleranciaNotas ?? true);
  const [chaveFecho, setChaveFecho] = useState(settings.academicLockingRules?.chaveFecho ?? true);
  const [showAddPauseModal, setShowAddPauseModal] = useState(false);
  const [showCloseTrimesterModal, setShowCloseTrimesterModal] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  // Período de Atividade e Semanas Letivas definidos pelo Admin
  const [academicPeriod, setAcademicPeriod] = useState(
    settings.academicPeriod || '02 Set 2024 — 31 Jul 2025'
  );
  const [academicWeeks, setAcademicWeeks] = useState(
    settings.academicWeeks || '38 Semanas Globais'
  );
  const [showEditPeriodModal, setShowEditPeriodModal] = useState(false);
  const [tempAcademicPeriod, setTempAcademicPeriod] = useState(academicPeriod);
  const [tempAcademicWeeks, setTempAcademicWeeks] = useState(academicWeeks);

  // Cadastrar / Definir Ano Letivo pelo Admin
  const [showEditYearModal, setShowEditYearModal] = useState(false);
  const [newYearInput, setNewYearInput] = useState('');

  const handleOpenEditAcademicYear = () => {
    setNewYearInput(settings.currentAcademicYear || `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`);
    setShowEditYearModal(true);
  };

  const handleSaveAcademicYear = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanYear = newYearInput.trim();
    if (!cleanYear) return;

    const existingYears = settings.availableAcademicYears || [];
    const updatedYears = existingYears.includes(cleanYear)
      ? existingYears
      : [...existingYears, cleanYear];

    await runGlobalOperation(
      async () => {
        dbService.setAcademicYear(cleanYear);
        if (onUpdateSettings) {
          onUpdateSettings({
            currentAcademicYear: cleanYear,
            availableAcademicYears: updatedYears
          });
        }
        dbService.updateSettings({
          currentAcademicYear: cleanYear,
          availableAcademicYears: updatedYears
        });
      },
      {
        loadingMessage: `A configurar Ano Letivo ${cleanYear}...`,
        successMessage: `Ano Letivo ${cleanYear} registado e ativado com sucesso!`
      }
    );

    setShowEditYearModal(false);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  // Estrutura das datas e semanas dos 3 Trimestres definidas pelo Admin
  const initialTrimesterSchedules = {
    t1: {
      startDate: settings.trimesterSchedules?.t1?.startDate || '02 Set 2024',
      endDate: settings.trimesterSchedules?.t1?.endDate || '13 Dez 2024',
      examPeriod: settings.trimesterSchedules?.t1?.examPeriod || '25 Nov – 06 Dez',
      gradesCouncilDate: settings.trimesterSchedules?.t1?.gradesCouncilDate || '18 Dez 2024',
      weeksCount: settings.trimesterSchedules?.t1?.weeksCount || '14 Semanas Úteis'
    },
    t2: {
      startDate: settings.trimesterSchedules?.t2?.startDate || '06 Jan 2025',
      endDate: settings.trimesterSchedules?.t2?.endDate || '11 Abr 2025',
      examPeriod: settings.trimesterSchedules?.t2?.examPeriod || '24 Mar – 04 Abr',
      gradesCouncilDate: settings.trimesterSchedules?.t2?.gradesCouncilDate || '14 Abr 2025',
      weeksCount: settings.trimesterSchedules?.t2?.weeksCount || '13 Semanas Úteis'
    },
    t3: {
      startDate: settings.trimesterSchedules?.t3?.startDate || '28 Abr 2025',
      endDate: settings.trimesterSchedules?.t3?.endDate || '11 Jul 2025',
      examPeriod: settings.trimesterSchedules?.t3?.examPeriod || '23 Jun – 04 Jul',
      gradesCouncilDate: settings.trimesterSchedules?.t3?.gradesCouncilDate || '18 Jul 2025',
      weeksCount: settings.trimesterSchedules?.t3?.weeksCount || '11 Semanas Úteis'
    }
  };

  const [trimesterSchedules, setTrimesterSchedules] = useState(initialTrimesterSchedules);
  const [editingTrimester, setEditingTrimester] = useState<'1' | '2' | '3' | null>(null);
  const [trimForm, setTrimForm] = useState({
    startDate: '',
    endDate: '',
    examPeriod: '',
    gradesCouncilDate: '',
    weeksCount: ''
  });

  const handleOpenEditPeriod = () => {
    setTempAcademicPeriod(academicPeriod);
    setTempAcademicWeeks(academicWeeks);
    setShowEditPeriodModal(true);
  };

  const handleSaveAcademicPeriod = async (e: React.FormEvent) => {
    e.preventDefault();
    setAcademicPeriod(tempAcademicPeriod);
    setAcademicWeeks(tempAcademicWeeks);
    await runGlobalOperation(
      async () => {
        if (onUpdateSettings) {
          onUpdateSettings({ academicPeriod: tempAcademicPeriod, academicWeeks: tempAcademicWeeks });
        }
        dbService.updateSettings({ academicPeriod: tempAcademicPeriod, academicWeeks: tempAcademicWeeks });
      },
      {
        loadingMessage: 'A gravar período letivo e semanas...',
        successMessage: 'Período letivo atualizado com sucesso!'
      }
    );
    setShowEditPeriodModal(false);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const handleOpenEditTrimester = (trimKey: '1' | '2' | '3') => {
    const k = ('t' + trimKey) as 't1' | 't2' | 't3';
    setTrimForm({ ...trimesterSchedules[k] });
    setEditingTrimester(trimKey);
  };

  const handleSaveTrimesterSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrimester) return;
    const k = ('t' + editingTrimester) as 't1' | 't2' | 't3';
    const updated = {
      ...trimesterSchedules,
      [k]: { ...trimForm }
    };
    setTrimesterSchedules(updated);
    await runGlobalOperation(
      async () => {
        if (onUpdateSettings) {
          onUpdateSettings({ trimesterSchedules: updated });
        }
        dbService.updateSettings({ trimesterSchedules: updated });
      },
      {
        loadingMessage: `A atualizar datas e prazos do ${editingTrimester}.º Trimestre...`,
        successMessage: `Datas do ${editingTrimester}.º Trimestre atualizadas com sucesso!`
      }
    );
    setEditingTrimester(null);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const [pausas, setPausas] = useState(
    Array.isArray(settings.academicPauses)
      ? settings.academicPauses
      : (settings.schoolName ? DEFAULT_PAUSAS : [])
  );
  const [pauseToDelete, setPauseToDelete] = useState<{ id: number | string; desc: string; periodo: string; dias: string } | null>(null);

  const [novaPausaDesc, setNovaPausaDesc] = useState('');
  const [novaPausaPeriodo, setNovaPausaPeriodo] = useState('');
  const [novaPausaDias, setNovaPausaDias] = useState('');

  const handleToggleRule = (ruleKey: 'bloqueioSumarios' | 'toleranciaNotas' | 'chaveFecho') => {
    let newSumarios = bloqueioSumarios;
    let newNotas = toleranciaNotas;
    let newChave = chaveFecho;

    if (ruleKey === 'bloqueioSumarios') {
      newSumarios = !bloqueioSumarios;
      setBloqueioSumarios(newSumarios);
    } else if (ruleKey === 'toleranciaNotas') {
      newNotas = !toleranciaNotas;
      setToleranciaNotas(newNotas);
    } else if (ruleKey === 'chaveFecho') {
      newChave = !chaveFecho;
      setChaveFecho(newChave);
    }

    if (onUpdateSettings) {
      onUpdateSettings({
        academicLockingRules: {
          bloqueioSumarios: newSumarios,
          toleranciaNotas: newNotas,
          chaveFecho: newChave
        }
      });
    }
  };

  const handleSetActiveTrimester = (trim: '1' | '2' | '3') => {
    dbService.setAcademicTrimester(trim);
    if (onUpdateSettings) {
      onUpdateSettings({ currentTrimester: trim });
    }
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const handleAddPause = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaPausaDesc || !novaPausaPeriodo) return;

    await runGlobalOperation(
      async () => {
        const updated = [
          ...pausas,
          {
            id: Date.now(),
            desc: novaPausaDesc,
            periodo: novaPausaPeriodo,
            dias: novaPausaDias || '5 Dias'
          }
        ];
        setPausas(updated);
        if (onUpdateSettings) {
          onUpdateSettings({ academicPauses: updated });
        }
        dbService.updateSettings({ academicPauses: updated });
      },
      {
        loadingMessage: 'A registar pausa pedagógica no calendário escolar...',
        successMessage: 'Operação feita com sucesso!',
        requiredRule: 'config.institution',
        userRole: currentUserRole
      }
    );

    setNovaPausaDesc('');
    setNovaPausaPeriodo('');
    setNovaPausaDias('');
    setShowAddPauseModal(false);
  };

  const handleConfirmCloseTrimester = async () => {
    setShowCloseTrimesterModal(false);
    await runGlobalOperation(
      async () => {
        dbService.addAuditLog({
          userName: dbService.getDatabase().currentUser?.name || 'Direção Pedagógica',
          userRole: 'Diretor Pedagógico',
          action: 'Encerramento de Trimestre',
          details: `O ${currentTrimester}.º Trimestre foi oficialmente homologado e trancado para lançamento de notas.`,
          module: 'pautas',
          timestamp: 'Agora mesmo',
          badgeColor: '#ac332b'
        });
      },
      {
        requiredRule: 'pautas.lock',
        userRole: currentUserRole,
        loadingMessage: `A homologar e trancar o ${currentTrimester}.º Trimestre...`,
        successMessage: 'Operação feita com sucesso!'
      }
    );
  };

  const handleSaveModule = () => {
    if (onUpdateSettings) {
      onUpdateSettings({
        academicPeriod,
        academicWeeks,
        trimesterSchedules,
        academicPauses: pausas,
        academicLockingRules: {
          bloqueioSumarios,
          toleranciaNotas,
          chaveFecho
        }
      });
    }
    dbService.updateSettings({
      academicPeriod,
      academicWeeks,
      trimesterSchedules,
      academicPauses: pausas,
      academicLockingRules: {
        bloqueioSumarios,
        toleranciaNotas,
        chaveFecho
      }
    });
    onSaveAll({
      loadingMessage: 'A guardar calendário letivo, trimestres e pausas pedagógicas...',
      successMessage: 'Operação feita com sucesso!'
    });
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3500);
  };

  const feriados = [
    { dia: '11', mes: 'NOV', nome: 'Dia da Independência', trim: 'Feriado Nacional (1.º Trim.)' },
    { dia: '04', mes: 'FEV', nome: 'Início da Luta Armada', trim: 'Feriado Nacional (2.º Trim.)' },
    { dia: '08', mes: 'MAR', nome: 'Dia da Mulher', trim: 'Feriado Nacional (2.º Trim.)' },
    { dia: '04', mes: 'ABR', nome: 'Dia da Paz e Reconciliação', trim: 'Feriado Nacional (2.º Trim.)' },
    { dia: '01', mes: 'MAI', nome: 'Dia do Trabalhador', trim: 'Feriado Nacional (3.º Trim.)' },
    { dia: '25', mes: 'MAI', nome: 'Dia de África', trim: 'Feriado Oficial (3.º Trim.)' },
    { dia: '01', mes: 'JUN', nome: 'Dia da Criança', trim: 'Comemoração Escolar Ativa' },
    { dia: '17', mes: 'SET', nome: 'Dia do Herói Nacional', trim: 'Feriado Nacional (1.º Trim.)' }
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Toast */}
      {saveToast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-xs">
          <span className="material-symbols-outlined text-[20px] text-emerald-600">check_circle</span>
          <span>Configurações do Ano Letivo e Trimestres atualizadas com sucesso!</span>
        </div>
      )}

      {/* Section Header Hero Panel */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#0b1f3a] text-white flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[26px]">date_range</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase tracking-wider text-[#ac332b] font-bold">Módulo 02</span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="text-[11px] text-slate-500 font-medium">Decreto Executivo n.º 24/MED</span>
              </div>
              <h2 className="font-headline text-xl lg:text-2xl font-bold text-slate-900">
                Gestão do Ano Letivo & Calendário Curricular
              </h2>
              <p className="text-xs text-slate-500 max-w-3xl leading-relaxed mt-0.5">
                Definição dos trimestres em vigor, limites de tolerância para publicação de pautas, bloqueio de sumários e paragens regulamentares.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              <span>Imprimir</span>
            </button>
            <button
              type="button"
              onClick={() => setShowCloseTrimesterModal(true)}
              className="px-3.5 py-2 rounded-xl bg-[#ac332b] text-white hover:bg-red-800 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">lock_clock</span>
              <span>Encerrar</span>
            </button>
          </div>
        </div>

        {/* Active Academic Year Banner Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 items-center">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ano Letivo Vigente</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-headline text-lg font-extrabold text-[#0b1f3a]">
                {settings.currentAcademicYear || 'Não definido'}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                EM CURSO
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Período de Atividade</span>
              <button
                type="button"
                onClick={handleOpenEditPeriod}
                className="text-slate-500 hover:text-[#0b1f3a] text-[11px] font-bold flex items-center gap-0.5 cursor-pointer bg-slate-200/70 hover:bg-slate-200 px-1.5 py-0.5 rounded"
                title="Admin: Definir período de atividade letiva"
              >
                <span className="material-symbols-outlined text-[13px]">edit</span>
                <span>Definir</span>
              </button>
            </div>
            <span className="text-xs font-semibold text-slate-800 mt-0.5">{academicPeriod || 'Não definido (definir)'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Semanas Letivas</span>
            <span className="text-xs font-semibold text-slate-800 mt-0.5">{academicWeeks || 'Não definido (definir)'}</span>
          </div>
          <div className="flex items-center gap-2 lg:justify-end">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Alternar:</span>
            <select
              value={settings.currentAcademicYear || ''}
              onChange={(e) => {
                dbService.setAcademicYear(e.target.value);
                if (onUpdateSettings) onUpdateSettings({ currentAcademicYear: e.target.value });
              }}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-[#0b1f3a]"
            >
              {Array.from(
                new Set(
                  [
                    settings.currentAcademicYear,
                    ...(settings.availableAcademicYears || [])
                  ].filter(Boolean)
                )
              ).map((yr) => (
                <option key={yr as string} value={yr as string}>
                  Ano {yr}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleOpenEditAcademicYear}
              className="px-2 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-[11px] flex items-center gap-1 cursor-pointer shrink-0"
              title="Cadastrar Novo Ano Letivo"
            >
              <span className="material-symbols-outlined text-[14px]">add</span>
              <span></span>
            </button>
          </div>
        </div>
      </div>

      {/* Estrutura Curricular dos 3 Trimestres */}
      <div className="flex flex-col gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-headline text-base lg:text-lg font-bold text-slate-900">
              Estrutura Curricular dos 3 Trimestres (MED Angola)
            </h3>
            <p className="text-xs text-slate-500">
              O Administrador define as datas, períodos de provas e semanas letivas de cada trimestre.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-blue-50 text-[#0b1f3a] font-mono text-[11px] font-bold border border-blue-200">
            Trimestre em Curso: {currentTrimester}.º Trimestre
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-1">
          {/* 1º Trimestre */}
          <div
            className={`flex flex-col p-5 rounded-xl justify-between border transition-all ${
              currentTrimester === '1'
                ? 'bg-white ring-2 ring-[#0b1f3a] shadow-md border-transparent relative overflow-hidden'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            {currentTrimester === '1' && (
              <div className="absolute top-0 right-0 bg-[#0b1f3a] text-white text-[9px] font-bold px-3 py-0.5 rounded-bl-lg tracking-wider">
                EM ANDAMENTO
              </div>
            )}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${currentTrimester === '1' ? 'bg-[#0b1f3a] text-white' : 'bg-slate-200 text-slate-800'}`}>
                  1.º TRIMESTRE
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEditTrimester('1')}
                    className="flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                    title="Definir datas e semanas do 1.º Trimestre"
                  >
                    <span className="material-symbols-outlined text-[13px]">edit_calendar</span>
                    <span>Definir</span>
                  </button>
                  {currentTrimester === '1' ? (
                    <span className="flex items-center gap-1 text-[11px] text-[#ac332b] font-bold bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ac332b] animate-pulse" />
                      Ativo
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-500 font-semibold bg-slate-200 px-2 py-0.5 rounded-full">
                      Concluído
                    </span>
                  )}
                </div>
              </div>
              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">Início das Aulas:</span>
                  <span className="font-semibold text-slate-900">{trimesterSchedules.t1.startDate || 'Não definido'}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">Término Letivo:</span>
                  <span className="font-semibold text-slate-900">{trimesterSchedules.t1.endDate || 'Não definido'}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">Provas Trimestrais:</span>
                  <span className="font-semibold text-slate-900">{trimesterSchedules.t1.examPeriod || 'Não definido'}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">Conselho de Notas:</span>
                  <span className="font-semibold text-slate-900">{trimesterSchedules.t1.gradesCouncilDate || 'Não definido'}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-semibold">{trimesterSchedules.t1.weeksCount || 'Não definido'}</span>
              {currentTrimester === '1' ? (
                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>Trimestre Vigente</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSetActiveTrimester('1')}
                  className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-[#0b1f3a] hover:text-white text-slate-800 font-bold text-xs transition-colors cursor-pointer"
                >
                  Definir como Ativo
                </button>
              )}
            </div>
          </div>

          {/* 2º Trimestre */}
          <div
            className={`flex flex-col p-5 rounded-xl justify-between border transition-all ${
              currentTrimester === '2'
                ? 'bg-white ring-2 ring-[#0b1f3a] shadow-md border-transparent relative overflow-hidden'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            {currentTrimester === '2' && (
              <div className="absolute top-0 right-0 bg-[#0b1f3a] text-white text-[9px] font-bold px-3 py-0.5 rounded-bl-lg tracking-wider">
                EM ANDAMENTO
              </div>
            )}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${currentTrimester === '2' ? 'bg-[#0b1f3a] text-white' : 'bg-slate-200 text-slate-800'}`}>
                  2.º TRIMESTRE
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEditTrimester('2')}
                    className="flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                    title="Definir datas e semanas do 2.º Trimestre"
                  >
                    <span className="material-symbols-outlined text-[13px]">edit_calendar</span>
                    <span>Definir</span>
                  </button>
                  {currentTrimester === '2' ? (
                    <span className="flex items-center gap-1 text-[11px] text-[#ac332b] font-bold bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ac332b] animate-pulse" />
                      Ativo
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-500 font-semibold bg-slate-200 px-2 py-0.5 rounded-full">
                      Inativo
                    </span>
                  )}
                </div>
              </div>
              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">Início das Aulas:</span>
                  <span className="font-semibold text-slate-900">{trimesterSchedules.t2.startDate || 'Não definido'}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">Término Letivo:</span>
                  <span className="font-semibold text-slate-900">{trimesterSchedules.t2.endDate || 'Não definido'}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">Provas Trimestrais:</span>
                  <span className="font-bold text-[#0b1f3a]">{trimesterSchedules.t2.examPeriod || 'Não definido'}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">Conselho de Notas:</span>
                  <span className="font-semibold text-slate-900">{trimesterSchedules.t2.gradesCouncilDate || 'Não definido'}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-semibold">{trimesterSchedules.t2.weeksCount || 'Não definido'}</span>
              {currentTrimester === '2' ? (
                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>Trimestre Vigente</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSetActiveTrimester('2')}
                  className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-[#0b1f3a] hover:text-white text-slate-800 font-bold text-xs transition-colors cursor-pointer"
                >
                  Definir como Ativo
                </button>
              )}
            </div>
          </div>

          {/* 3º Trimestre */}
          <div
            className={`flex flex-col p-5 rounded-xl justify-between border transition-all ${
              currentTrimester === '3'
                ? 'bg-white ring-2 ring-[#0b1f3a] shadow-md border-transparent relative overflow-hidden'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            {currentTrimester === '3' && (
              <div className="absolute top-0 right-0 bg-[#0b1f3a] text-white text-[9px] font-bold px-3 py-0.5 rounded-bl-lg tracking-wider">
                EM ANDAMENTO
              </div>
            )}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${currentTrimester === '3' ? 'bg-[#0b1f3a] text-white' : 'bg-slate-200 text-slate-800'}`}>
                  3.º TRIMESTRE
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEditTrimester('3')}
                    className="flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                    title="Definir datas e semanas do 3.º Trimestre"
                  >
                    <span className="material-symbols-outlined text-[13px]">edit_calendar</span>
                    <span>Definir</span>
                  </button>
                  {currentTrimester === '3' ? (
                    <span className="flex items-center gap-1 text-[11px] text-[#ac332b] font-bold bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ac332b] animate-pulse" />
                      Ativo
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-500 font-semibold bg-slate-200 px-2 py-0.5 rounded-full">
                      Planeado
                    </span>
                  )}
                </div>
              </div>
              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">Início das Aulas:</span>
                  <span className="font-semibold text-slate-900">{trimesterSchedules.t3.startDate || 'Não definido'}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">Término Letivo:</span>
                  <span className="font-semibold text-slate-900">{trimesterSchedules.t3.endDate || 'Não definido'}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">Exames Nacionais:</span>
                  <span className="font-semibold text-slate-900">{trimesterSchedules.t3.examPeriod || 'Não definido'}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">Divulgação Final:</span>
                  <span className="font-semibold text-slate-900">{trimesterSchedules.t3.gradesCouncilDate || 'Não definido'}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-semibold">{trimesterSchedules.t3.weeksCount || 'Não definido'}</span>
              {currentTrimester === '3' ? (
                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>Trimestre Vigente</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSetActiveTrimester('3')}
                  className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-[#0b1f3a] hover:text-white text-slate-800 font-bold text-xs transition-colors cursor-pointer"
                >
                  Definir como Ativo
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pausas Letivas & Regras de Trancamento */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pausas Letivas (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[#0b1f3a] text-[22px]">beach_access</span>
              <h3 className="font-headline text-base font-bold text-slate-900">
                Interrupções & Pausas Letivas ({pausas.length})
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowAddPauseModal(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">add</span>
              <span>Adicionar</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100">
                  <th className="py-2.5 px-3 rounded-l-lg">Descrição da Pausa</th>
                  <th className="py-2.5 px-3">Período</th>
                  <th className="py-2.5 px-3">Duração</th>
                  <th className="py-2.5 px-3 text-right rounded-r-lg">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {pausas.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-900">{p.desc}</td>
                    <td className="py-3 px-3 text-slate-600">{p.periodo}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] font-mono font-semibold">
                        {p.dias}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => setPauseToDelete(p)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer"
                        title="Remover pausa"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Regras de Trancamento (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#ac332b] text-[22px]">gavel</span>
            <h3 className="font-headline text-base font-bold text-slate-900">
              Regras de Trancamento
            </h3>
          </div>

          <div className="flex flex-col gap-3">
            {/* Rule 1 */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3">
              <div className="flex flex-col">
                <span className="font-bold text-slate-800 text-xs">Bloqueio Automático de Sumários</span>
                <span className="text-[11px] text-slate-500 mt-0.5">
                  Professor fica impedido de editar aula lecionada após prazo legal.
                </span>
                <span className="mt-1 font-mono text-[11px] text-[#ac332b] font-bold">
                  Tolerância: 48 Horas
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleToggleRule('bloqueioSumarios')}
                className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer shrink-0 mt-1 ${
                  bloqueioSumarios ? 'bg-[#0b1f3a]' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-0.5 ${
                    bloqueioSumarios ? 'right-0.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Rule 2 */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3">
              <div className="flex flex-col">
                <span className="font-bold text-slate-800 text-xs">Prazo de Lançamento de Provas</span>
                <span className="text-[11px] text-slate-500 mt-0.5">
                  Janela para inserir notas de MAC e Provas Trimestrais na pauta digital.
                </span>
                <span className="mt-1 font-mono text-[11px] text-[#0b1f3a] font-bold">
                  Janela: 5 Dias Úteis
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleToggleRule('toleranciaNotas')}
                className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer shrink-0 mt-1 ${
                  toleranciaNotas ? 'bg-[#0b1f3a]' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-0.5 ${
                    toleranciaNotas ? 'right-0.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Rule 3 */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3">
              <div className="flex flex-col">
                <span className="font-bold text-slate-800 text-xs">Chave Criptográfica de Fecho</span>
                <span className="text-[11px] text-slate-500 mt-0.5">
                  Exige assinatura eletrónica do Diretor Pedagógico para trancar o trimestre.
                </span>
                <span className="mt-1 font-mono text-[11px] text-slate-600 font-semibold">
                  Exigência Legal MED
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleToggleRule('chaveFecho')}
                className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer shrink-0 mt-1 ${
                  chaveFecho ? 'bg-[#0b1f3a]' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-0.5 ${
                    chaveFecho ? 'right-0.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feriados Oficiais da República de Angola */}
      <div className="flex flex-col gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#ac332b] text-[22px]">flag</span>
            <div>
              <h3 className="font-headline text-base font-bold text-slate-900">
                Feriados Oficiais da República de Angola
              </h3>
              <p className="text-xs text-slate-500">
                Dias não letivos integrados obrigatoriamente no controlo de faltas e presenças docentes.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => alert('Calendário validado com o Diário da República de Angola (Iª Série).')}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors self-start cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">sync</span>
            <span>Sincronizar</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {feriados.map((f, i) => (
            <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex flex-col items-center justify-center font-mono text-[11px] font-bold text-[#ac332b] shrink-0">
                <span>{f.dia}</span>
                <span className="text-[9px] -mt-1 uppercase">{f.mes}</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-slate-800 truncate">{f.nome}</span>
                <span className="text-[11px] text-slate-500 truncate">{f.trim}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 text-slate-500 text-xs">
          <span className="material-symbols-outlined text-slate-400">verified_user</span>
          <span>
            Trimestre ativo no sistema: <strong className="text-slate-800">{currentTrimester}.º Trimestre</strong>
          </span>
        </div>
        <div className="flex items-center gap-2 justify-end">
          <button
            type="button"
            onClick={handleSaveModule}
            className="px-5 py-2 rounded-xl bg-[#0b1f3a] text-white font-bold text-xs hover:bg-[#7a0c0c] transition-colors shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px]">check</span>
            <span>Guardar</span>
          </button>
        </div>
      </div>

      {/* Modal Nova Pausa */}
      {showAddPauseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-headline font-bold text-slate-900 text-base">Adicionar Interrupção / Pausa</h3>
              <button
                type="button"
                onClick={() => setShowAddPauseModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <form onSubmit={handleAddPause} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Descrição</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Pausa Pedagógica Trimestral"
                  value={novaPausaDesc}
                  onChange={(e) => setNovaPausaDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-[#0b1f3a]"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Período de Datas</label>
                <input
                  type="text"
                  required
                  placeholder="ex: 15 Mai 2025 — 18 Mai 2025"
                  value={novaPausaPeriodo}
                  onChange={(e) => setNovaPausaPeriodo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-[#0b1f3a]"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Duração Total</label>
                <input
                  type="text"
                  placeholder="ex: 4 Dias"
                  value={novaPausaDias}
                  onChange={(e) => setNovaPausaDias(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-[#0b1f3a]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddPauseModal(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[#0b1f3a] text-white font-bold hover:bg-[#7a0c0c] cursor-pointer"
                >
                  Registar Pausa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Encerrar Trimestre */}
      {showCloseTrimesterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-[#ac332b] flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">lock</span>
              </div>
              <div>
                <h3 className="font-headline font-bold text-slate-900 text-base">Encerrar e Trancar Trimestre</h3>
                <span className="text-xs text-slate-500">Ação administrativa do Conselho Pedagógico</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tem a certeza de que deseja encerrar e trancar o <strong>{currentTrimester}.º Trimestre</strong> do ano letivo <strong>{settings.currentAcademicYear || '2024/2025'}</strong>?
              Após a confirmação, os professores não poderão alterar notas ou diários sem autorização explícita da Direção.
            </p>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => setShowCloseTrimesterModal(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmCloseTrimester}
                className="px-4 py-1.5 rounded-xl bg-[#ac332b] text-white font-bold hover:bg-red-800 cursor-pointer"
              >
                Confirmar Encerramento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar Pausa Pedagógica com Padrão de Eliminar Turma */}
      {pauseToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-none max-w-md w-full p-6 border border-slate-300 shadow-2xl">
            <div className="w-12 h-12 rounded-none bg-red-100 text-red-700 flex items-center justify-center mx-auto mb-4 border border-red-300">
              <span className="material-symbols-outlined text-[28px]">delete_forever</span>
            </div>
            <h3 className="font-headline text-lg font-bold text-slate-900 text-center">
              Eliminar Pausa Pedagógica da Base de Dados?
            </h3>
            <p className="text-xs text-slate-600 text-center mt-2 leading-relaxed">
              Tem a certeza de que deseja eliminar a pausa <strong>{pauseToDelete.desc}</strong> ({pauseToDelete.periodo} • {pauseToDelete.dias})? Esta ação é definitiva na base de dados.
            </p>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setPauseToDelete(null)}
                className="px-4 py-2 rounded-none bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs border border-slate-300 cursor-pointer transition-colors"
                type="button"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  const p = pauseToDelete;
                  setPauseToDelete(null);
                  await runGlobalOperation(
                    async () => {
                      const updated = pausas.filter((item) => item.id !== p.id);
                      setPausas(updated);
                      if (onUpdateSettings) {
                        onUpdateSettings({ academicPauses: updated });
                      }
                      dbService.updateSettings({ ...settings, academicPauses: updated });
                    },
                    {
                      requiredRule: 'config.edit',
                      userRole: currentUserRole,
                      loadingMessage: `A eliminar pausa pedagógica ${p.desc}...`,
                      successMessage: 'Operação feita com sucesso!'
                    }
                  );
                }}
                className="px-5 py-2.5 rounded-none bg-[#b91c1c] hover:bg-[#7a0c0c] text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-none border-none"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                <span>Eliminar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Definir Período de Atividade & Semanas Letivas */}
      {showEditPeriodModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0b1f3a] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">calendar_month</span>
                </div>
                <div>
                  <h3 className="font-headline font-bold text-slate-900 text-base">Definir Período & Semanas</h3>
                  <span className="text-xs text-slate-500">Configuração oficial definida pelo Administrador</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditPeriodModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveAcademicPeriod} className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                  Período de Atividade Letiva
                </label>
                <input
                  type="text"
                  required
                  value={tempAcademicPeriod}
                  onChange={(e) => setTempAcademicPeriod(e.target.value)}
                  placeholder="Ex.: 02 Set 2024 — 31 Jul 2025"
                  className="w-full px-3.5 py-2.5 bg-slate-50 text-slate-900 rounded-xl border border-slate-200 outline-none focus:bg-white focus:ring-2 focus:ring-[#0b1f3a] text-xs font-semibold"
                />
                <span className="text-[10px] text-slate-400">Intervalo do calendário letivo institucional</span>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                  Total de Semanas Letivas
                </label>
                <input
                  type="text"
                  required
                  value={tempAcademicWeeks}
                  onChange={(e) => setTempAcademicWeeks(e.target.value)}
                  placeholder="Ex.: 38 Semanas Globais"
                  className="w-full px-3.5 py-2.5 bg-slate-50 text-slate-900 rounded-xl border border-slate-200 outline-none focus:bg-white focus:ring-2 focus:ring-[#0b1f3a] text-xs font-semibold"
                />
                <span className="text-[10px] text-slate-400">Total de semanas de atividade docente e letiva</span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditPeriodModal(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#0b1f3a] hover:bg-[#122c50] text-white font-bold cursor-pointer"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Definir Datas & Prazos do Trimestre Selecionado */}
      {editingTrimester && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0b1f3a] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">edit_calendar</span>
                </div>
                <div>
                  <h3 className="font-headline font-bold text-slate-900 text-base">
                    Definir Datas: {editingTrimester}.º Trimestre
                  </h3>
                  <span className="text-xs text-slate-500">Definição oficial de datas e prazos de avaliação</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingTrimester(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveTrimesterSchedule} className="flex flex-col gap-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                    Início das Aulas
                  </label>
                  <input
                    type="text"
                    value={trimForm.startDate}
                    onChange={(e) => setTrimForm({ ...trimForm, startDate: e.target.value })}
                    placeholder="Ex.: 02 Set 2024"
                    className="w-full px-3 py-2 bg-slate-50 text-slate-900 rounded-xl border border-slate-200 outline-none focus:bg-white focus:ring-2 focus:ring-[#0b1f3a] text-xs font-semibold"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                    Término Letivo
                  </label>
                  <input
                    type="text"
                    value={trimForm.endDate}
                    onChange={(e) => setTrimForm({ ...trimForm, endDate: e.target.value })}
                    placeholder="Ex.: 13 Dez 2024"
                    className="w-full px-3 py-2 bg-slate-50 text-slate-900 rounded-xl border border-slate-200 outline-none focus:bg-white focus:ring-2 focus:ring-[#0b1f3a] text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                    Provas Trimestrais / Exames
                  </label>
                  <input
                    type="text"
                    value={trimForm.examPeriod}
                    onChange={(e) => setTrimForm({ ...trimForm, examPeriod: e.target.value })}
                    placeholder="Ex.: 25 Nov – 06 Dez"
                    className="w-full px-3 py-2 bg-slate-50 text-slate-900 rounded-xl border border-slate-200 outline-none focus:bg-white focus:ring-2 focus:ring-[#0b1f3a] text-xs font-semibold"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                    Conselho de Notas / Divulgação
                  </label>
                  <input
                    type="text"
                    value={trimForm.gradesCouncilDate}
                    onChange={(e) => setTrimForm({ ...trimForm, gradesCouncilDate: e.target.value })}
                    placeholder="Ex.: 18 Dez 2024"
                    className="w-full px-3 py-2 bg-slate-50 text-slate-900 rounded-xl border border-slate-200 outline-none focus:bg-white focus:ring-2 focus:ring-[#0b1f3a] text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Semanas Úteis do Trimestre
                </label>
                <input
                  type="text"
                  value={trimForm.weeksCount}
                  onChange={(e) => setTrimForm({ ...trimForm, weeksCount: e.target.value })}
                  placeholder="Ex.: 14 Semanas Úteis"
                  className="w-full px-3 py-2 bg-slate-50 text-slate-900 rounded-xl border border-slate-200 outline-none focus:bg-white focus:ring-2 focus:ring-[#0b1f3a] text-xs font-semibold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingTrimester(null)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#0b1f3a] hover:bg-[#122c50] text-white font-bold cursor-pointer"
                >
                  Guardar Datas do {editingTrimester}.º Trimestre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal para Cadastrar / Definir Ano Letivo pelo Admin */}
      {showEditYearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-blue-50 text-[#0b1f3a] material-symbols-outlined text-[20px]">
                  calendar_month
                </span>
                <div>
                  <h3 className="font-headline text-base font-bold text-slate-900">
                    Definir / Cadastrar Ano Letivo
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    O ano letivo em vigor aplica-se a todas as turmas, pautas e matrículas
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditYearModal(false)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveAcademicYear} className="mt-4 space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Designação do Ano Letivo
                </label>
                <input
                  type="text"
                  value={newYearInput}
                  onChange={(e) => setNewYearInput(e.target.value)}
                  placeholder="Ex.: 2024/2025, 2025/2026"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 text-slate-900 rounded-xl border border-slate-200 outline-none focus:bg-white focus:ring-2 focus:ring-[#0b1f3a] text-sm font-bold"
                />
                <div className="flex flex-wrap gap-1.5 mt-1">
                  <span className="text-[10px] text-slate-400 self-center">Sugestões:</span>
                  {[
                    `${new Date().getFullYear() - 1}/${new Date().getFullYear()}`,
                    `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
                    `${new Date().getFullYear() + 1}/${new Date().getFullYear() + 2}`
                  ].map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setNewYearInput(sug)}
                      className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-mono font-semibold cursor-pointer"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              {settings.availableAcademicYears && settings.availableAcademicYears.length > 0 && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Anos Letivos Já Registados na Base de Dados:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {settings.availableAcademicYears.map((ay) => (
                      <button
                        key={ay}
                        type="button"
                        onClick={() => setNewYearInput(ay)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          newYearInput === ay
                            ? 'bg-[#0b1f3a] text-white'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {ay}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditYearModal(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#0b1f3a] hover:bg-[#122c50] text-white font-bold text-xs cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>Guardar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
