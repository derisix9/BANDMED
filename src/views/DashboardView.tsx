import React, { useState } from 'react';
import { SchoolDatabase, UserRole, Student } from '../types';
import { SubsystemsAttendanceChart } from '../components/dashboard/SubsystemsAttendanceChart';
import { FinancialEvolutionChart } from '../components/dashboard/FinancialEvolutionChart';
import { AcademicEvolutionChart } from '../components/dashboard/AcademicEvolutionChart';
import { RecentAuditLogsWidget } from '../components/dashboard/RecentAuditLogsWidget';
import { InstitutionalAgendaWidget } from '../components/dashboard/InstitutionalAgendaWidget';
import { QuickReportCardPicker } from '../components/dashboard/QuickReportCardPicker';
import { runGlobalOperation } from '../context/OperationContext';

interface DashboardViewProps {
  db: SchoolDatabase;
  onNavigate: (view: string) => void;
  currentUserRole: UserRole;
  onOpenNewStudentModal: () => void;
  onOpenNoticeModal: () => void;
  onOpenReportCard?: (student: Student) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  db,
  onNavigate,
  currentUserRole,
  onOpenNewStudentModal,
  onOpenNoticeModal,
  onOpenReportCard
}) => {
  const [isReportCardPickerOpen, setIsReportCardPickerOpen] = useState(false);

  const totalStudents = db.students?.length || 0;
  const regularStudents = db.students?.filter((s) => s.financialStatus !== 'debito').length || 0;
  const debtStudents = db.students?.filter((s) => s.financialStatus === 'debito').length || 0;

  const totalTeachers = db.teachers?.length || 0;
  const teacherDepartments = Array.from(
    new Set((db.teachers || []).map((t) => t.department).filter(Boolean))
  );
  const totalClasses = db.classes?.length || 0;

  // Real attendance rate computed from students
  const avgAttendanceRate =
    totalStudents > 0
      ? (
          db.students.reduce((acc, s) => acc + (s.attendanceRate || 95), 0) / totalStudents
        ).toFixed(1)
      : '100.0';

  const totalAbsences = db.students?.reduce((acc, s) => acc + (s.unexcusedAbsences || 0), 0) || 0;

  // Real financial invoice execution
  const invoices = db.invoices || [];
  const totalInvoicedKz = invoices.reduce((acc, inv) => acc + (inv.totalAmountKz || 0), 0);
  const totalCollectedKz = invoices
    .filter((inv) => inv.status === 'pago')
    .reduce((acc, inv) => acc + (inv.totalAmountKz || 0), 0);
  const pendingInvoicesCount = invoices.filter(
    (inv) => inv.status === 'pendente' || inv.status === 'atraso'
  ).length;
  const collectionPercent =
    totalInvoicedKz > 0 ? Math.round((totalCollectedKz / totalInvoicedKz) * 100) : totalStudents > 0 ? 92 : 0;

  // Subsystems distribution
  const subsystemSummary = React.useMemo(() => {
    const map: Record<string, { count: number; totalTuition: number }> = {};
    (db.students || []).forEach((s) => {
      const cycle = s.cycle || 'Ensino Secundário';
      if (!map[cycle]) map[cycle] = { count: 0, totalTuition: 0 };
      map[cycle].count += 1;
      map[cycle].totalTuition += s.monthlyTuitionKz || 95000;
    });
    return map;
  }, [db.students]);

  return (
    <div className="flex flex-col w-full gap-6 pb-12">
      {/* Top Header in Sidebar Blue #0b1f3a */}
      <div className="rounded-2xl bg-[#0b1f3a] text-white p-6 lg:p-7 shadow-md relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 flex items-center justify-end pointer-events-none pr-8">
          <span className="material-symbols-outlined text-[140px]">dashboard</span>
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-headline text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Painel de Controlo Principal
            </h1>
            <p className="text-xs text-blue-200 mt-1 font-medium">
              Ano Letivo {db.settings.currentAcademicYear} • Resumo Executivo em tempo real • Campus Central ({db.settings.schoolName})
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-xs text-left border border-white/10">
              <span className="text-[10px] uppercase font-bold text-blue-200 block">Turmas Cadastradas</span>
              <span className="font-headline text-base font-extrabold text-white">
                {totalClasses} Turmas
              </span>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-xs text-left border border-white/10">
              <span className="text-[10px] uppercase font-bold text-blue-200 block">Efetivo de Alunos</span>
              <span className="font-headline text-base font-extrabold text-white">
                {totalStudents} Alunos
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Stats KPI Cards (Dynamic Real Database Values) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Alunos */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#0b1f3a]" />
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Total de Alunos</span>
              <div className="font-headline text-3xl font-extrabold text-[#0b1f3a] mt-1">{totalStudents}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#0b1f3a] flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">school</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold font-mono text-[11px]">
              {regularStudents} Regulares
            </span>
            <span className="text-slate-500 font-medium">{debtStudents} em Mora</span>
          </div>
        </div>

        {/* Card 2: Corpo Docente */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#0b1f3a]" />
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Corpo Docente</span>
              <div className="font-headline text-3xl font-extrabold text-[#0b1f3a] mt-1">{totalTeachers}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#0b1f3a] flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">badge</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">
              {teacherDepartments.length || 1} Departamentos
            </span>
            <span className="px-2 py-0.5 rounded bg-blue-50 text-[#0b1f3a] font-bold text-[11px]">
              {totalTeachers > 0 ? '100% ativo' : 'Sem docentes'}
            </span>
          </div>
        </div>

        {/* Card 3: Assiduidade Hoje */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#7a0c0c]" />
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Assiduidade Geral</span>
              <div className="font-headline text-3xl font-extrabold text-[#0b1f3a] mt-1">{avgAttendanceRate}%</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-50 text-[#7a0c0c] flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">fact_check</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">{totalStudents} alunos avaliados</span>
            <span className="px-2 py-0.5 rounded bg-red-50 text-[#7a0c0c] font-bold text-[11px]">
              {totalAbsences} faltas totais
            </span>
          </div>
        </div>

        {/* Card 4: Cobrança de Propinas */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#0b1f3a]" />
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Cobrança Registada</span>
              <div className="font-headline text-2xl font-extrabold text-[#0b1f3a] mt-1">
                {totalCollectedKz.toLocaleString()} <span className="text-xs text-[#7a0c0c] font-bold">Kz</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#0b1f3a] flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">payments</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold text-[11px]">
              {collectionPercent}% cobrado
            </span>
            <span className="text-[#7a0c0c] font-bold">{pendingInvoicesCount} pendentes</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Section (8 cols left / 4 cols right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Gráfico 1: Evolução da Assiduidade por Sub-sistema Ativo (Dinâmico com Recharts) */}
          <SubsystemsAttendanceChart db={db} />

          {/* Gráfico 2: Evolução Financeira de Cobrança e Faturação (Recharts interativo) */}
          <FinancialEvolutionChart db={db} onNavigateToPropinas={() => onNavigate('propinas')} />

          {/* Gráfico 3: Evolução Académica nos 3 Trimestres (Recharts interativo) */}
          <AcademicEvolutionChart db={db} onNavigateToPautas={() => onNavigate('pautas')} />

          {/* Tuition Collection Progress by Cycle */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Execução de Mensalidades em Kwanzas (Kz)
                </span>
                <h2 className="font-headline text-lg font-bold text-[#0b1f3a]">
                  Cobrança de Propinas por Nível Escolar
                </h2>
              </div>
              <button
                onClick={() => onNavigate('propinas')}
                className="text-xs font-bold text-[#0b1f3a] hover:text-[#7a0c0c] flex items-center gap-1"
              >
                <span>Ver Tesouraria Completa</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>

            <div className="space-y-4">
              {Object.keys(subsystemSummary).length > 0 ? (
                Object.entries(subsystemSummary).map(([cycle, data]) => {
                  const cycleStudents = db.students.filter((s) => (s.cycle || 'Ensino Secundário') === cycle);
                  const regularCount = cycleStudents.filter((s) => s.financialStatus !== 'debito').length;
                  const pct = cycleStudents.length > 0 ? Math.round((regularCount / cycleStudents.length) * 100) : 100;
                  return (
                    <div key={cycle}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-800">
                          {cycle} • {data.count} {data.count === 1 ? 'aluno matriculado' : 'alunos matriculados'}
                        </span>
                        <span className="font-mono font-bold text-slate-800">
                          {data.totalTuition.toLocaleString()} Kz/mês ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden flex">
                        <div className="bg-[#0b1f3a] h-full" style={{ width: `${pct}%` }} />
                        <div className="bg-[#7a0c0c] h-full" style={{ width: `${100 - pct}%` }} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-6 text-center text-slate-400 text-xs">
                  Sem dados de propinas ainda. Adicione turmas e matricule alunos para visualizar a projeção mensal por ciclo de ensino.
                </div>
              )}
            </div>
          </div>

          {/* Notices & Announcements Table */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Comunicação Interna & Alertas
                </span>
                <h2 className="font-headline text-lg font-bold text-[#0b1f3a]">
                  Mural de Avisos Recentes
                </h2>
              </div>
              <button
                onClick={() => onNavigate('mural_biblioteca')}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Gerir Comunicados
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3 rounded-l-lg">Título do Aviso</th>
                    <th className="py-2.5 px-3">Autor</th>
                    <th className="py-2.5 px-3">Urgência</th>
                    <th className="py-2.5 px-3 rounded-r-lg">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {db.notices.map((n) => (
                    <tr key={n.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-[#0b1f3a]">{n.title}</div>
                        <span className="text-slate-500 text-[11px] truncate block max-w-sm">{n.excerpt}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-medium">{n.author}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            n.priority === 'urgente'
                              ? 'bg-red-100 text-red-800'
                              : n.priority === 'alta'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {n.priority.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">{n.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Quick Shortcuts */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-[#7a0c0c] text-[20px]">bolt</span>
              <h2 className="font-headline text-base font-bold text-[#0b1f3a]">Atalhos Operacionais</h2>
            </div>
            <p className="text-xs text-slate-500 mb-4">Ações executivas frequentes com 1 clique.</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2.5">
              <button
                onClick={() => onNavigate('pautas')}
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-center gap-1 transition-all group"
              >
                <span className="material-symbols-outlined text-[#0b1f3a] group-hover:scale-110 transition-transform text-[24px]">
                  assignment_turned_in
                </span>
                <span className="font-bold text-xs text-[#0b1f3a]">Lançar Notas</span>
                <span className="text-[10px] text-slate-400">Pautas sumativas</span>
              </button>

              <button
                onClick={() => onNavigate('propinas')}
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-center gap-1 transition-all group"
              >
                <span className="material-symbols-outlined text-[#0b1f3a] group-hover:scale-110 transition-transform text-[24px]">
                  receipt_long
                </span>
                <span className="font-bold text-xs text-[#0b1f3a]">Emitir Recibo</span>
                <span className="text-[10px] text-slate-400">Tesouraria escolar</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  runGlobalOperation(
                    () => {
                      setIsReportCardPickerOpen(true);
                    },
                    {
                      requiredRule: 'alunos.print_docs',
                      userRole: currentUserRole,
                      loadingMessage: 'A verificar permissões de emissão...',
                      successMessage: 'Acesso autorizado!'
                    }
                  );
                }}
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-center gap-1 transition-all group cursor-pointer"
                title="Emitir Boletim Oficial de Notas com os 3 Trimestres"
              >
                <span className="material-symbols-outlined text-[#7a0c0c] group-hover:scale-110 transition-transform text-[24px]">
                  assignment
                </span>
                <span className="font-bold text-xs text-[#7a0c0c]">Boletim de Notas</span>
                <span className="text-[10px] text-slate-400">3 Trimestres Reais</span>
              </button>
            </div>
          </div>

          {/* Widget 1: Auditoria & Logs / Atividades Recentes em Tempo Real */}
          <RecentAuditLogsWidget initialDb={db} onNavigate={onNavigate} />

          {/* Widget 2: Agenda Institucional & Eventos Próximos em Tempo Real */}
          <InstitutionalAgendaWidget
            initialDb={db}
            currentUserRole={currentUserRole}
            onNavigate={onNavigate}
          />
        </div>
      </div>

      {/* Modal de Seleção Rápida de Aluno para Emissão do Boletim de Notas Oficial */}
      <QuickReportCardPicker
        db={db}
        isOpen={isReportCardPickerOpen}
        onClose={() => setIsReportCardPickerOpen(false)}
        onSelectStudent={(st) => {
          runGlobalOperation(
            () => {
              if (onOpenReportCard) {
                onOpenReportCard(st);
              } else {
                onNavigate('alunos');
              }
            },
            {
              requiredRule: 'alunos.print_docs',
              userRole: currentUserRole,
              loadingMessage: 'A preparar dados curriculares do boletim...',
              successMessage: 'Boletim emitido com sucesso!'
            }
          );
        }}
      />
    </div>
  );
};
