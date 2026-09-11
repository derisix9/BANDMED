import React from 'react';
import { SchoolDatabase, UserRole } from '../types';

interface DashboardViewProps {
  db: SchoolDatabase;
  onNavigate: (view: string) => void;
  currentUserRole: UserRole;
  onOpenNewStudentModal: () => void;
  onOpenNoticeModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  db,
  onNavigate,
  currentUserRole,
  onOpenNewStudentModal,
  onOpenNoticeModal
}) => {
  return (
    <div className="flex flex-col w-full gap-6 pb-12">
      {/* Top Header with Context and Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
              Visão Global de Governação
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#7a0c0c]" />
            <span className="text-xs font-semibold text-[#7a0c0c]">Live Feed</span>
          </div>
          <h1 className="font-headline text-2xl lg:text-3xl font-extrabold text-[#0b1f3a] tracking-tight">
            Painel de Controlo Principal
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Ano Letivo {db.settings.currentAcademicYear} • Resumo Executivo em tempo real • Campus Central ({db.settings.schoolName})
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('relatorios')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-all shadow-xs border border-slate-200"
          >
            <span className="material-symbols-outlined text-[17px] text-slate-500">picture_as_pdf</span>
            <span>Relatório Diário</span>
          </button>

          {currentUserRole === 'admin' && (
            <button
              onClick={onOpenNoticeModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#7a0c0c] hover:bg-[#5e0909] text-white font-bold text-xs transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[17px]">campaign</span>
              <span>+ Lançar Aviso</span>
            </button>
          )}

          {(currentUserRole === 'admin' || currentUserRole === 'professor') && (
            <button
              onClick={onOpenNewStudentModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0b1f3a] hover:bg-[#05101e] text-white font-bold text-xs transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[17px]">person_add</span>
              <span>+ Matricular Aluno</span>
            </button>
          )}
        </div>
      </div>

      {/* Institutional Banner Highlight */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0b1f3a] via-[#10294e] to-[#0b1f3a] text-white p-6 shadow-sm border border-slate-700/50">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 flex items-center justify-end pointer-events-none pr-8">
          <span className="material-symbols-outlined text-[160px]">shield_person</span>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-amber-400 text-[28px]">verified</span>
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200">
                Estatuto de Conformidade Institucional
              </span>
              <p className="font-headline text-lg font-bold text-white leading-tight">
                Conselho Pedagógico Validado • 1.º Trimestre Homologado
              </p>
              <span className="text-xs text-blue-100/80">
                Última sincronização de cadernetas digitais efetuada hoje às 09:45 (IP 192.168.10.42).
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-xs text-left">
              <div className="text-[10px] uppercase font-bold text-blue-200">Turmas Homologadas</div>
              <div className="font-headline text-base font-extrabold text-white">
                {db.classes.length} / {db.classes.length} (100%)
              </div>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-xs text-left">
              <div className="text-[10px] uppercase font-bold text-blue-200">Efetivo Total</div>
              <div className="font-headline text-base font-extrabold text-white">1.428 Alunos</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Stats KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Alunos */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#0b1f3a]" />
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Total de Alunos</span>
              <div className="font-headline text-3xl font-extrabold text-[#0b1f3a] mt-1">1.428</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#0b1f3a] flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">school</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold font-mono text-[11px]">
              +4.2% este ano
            </span>
            <span className="text-slate-500 font-medium">1.398 Ativos</span>
          </div>
        </div>

        {/* Card 2: Corpo Docente */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#0b1f3a]" />
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Corpo Docente</span>
              <div className="font-headline text-3xl font-extrabold text-[#0b1f3a] mt-1">{db.teachers.length + 82}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#0b1f3a] flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">badge</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">12 Departamentos</span>
            <span className="px-2 py-0.5 rounded bg-blue-50 text-[#0b1f3a] font-bold text-[11px]">
              100% alocados
            </span>
          </div>
        </div>

        {/* Card 3: Assiduidade Hoje */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#7a0c0c]" />
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Assiduidade Hoje</span>
              <div className="font-headline text-3xl font-extrabold text-[#0b1f3a] mt-1">95.8%</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-50 text-[#7a0c0c] flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">fact_check</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">1.368 presentes</span>
            <span className="px-2 py-0.5 rounded bg-red-50 text-[#7a0c0c] font-bold text-[11px]">
              18 por justificar
            </span>
          </div>
        </div>

        {/* Card 4: Cobrança de Propinas */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#0b1f3a]" />
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Cobrança Novembro</span>
              <div className="font-headline text-2xl font-extrabold text-[#0b1f3a] mt-1">
                78.450.000 <span className="text-xs text-[#7a0c0c] font-bold">Kz</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#0b1f3a] flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">payments</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold text-[11px]">
              92.3% cobrado
            </span>
            <span className="text-[#7a0c0c] font-bold">47 pendentes</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Section (8 cols left / 4 cols right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Chart Card: Attendance Evolution */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Monitorização Académica Semanal
                </span>
                <h2 className="font-headline text-lg font-bold text-[#0b1f3a]">
                  Evolução da Assiduidade por Ciclo de Ensino
                </h2>
              </div>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
                <span className="px-3 py-1 bg-white rounded-lg font-bold text-[#0b1f3a] shadow-xs">
                  Esta Semana
                </span>
                <button
                  onClick={() => alert('Visualização do mês')}
                  className="px-3 py-1 text-slate-500 hover:text-slate-800 font-medium"
                >
                  Mês
                </button>
              </div>
            </div>

            {/* Attendance Chart (Pure SVG) */}
            <div className="w-full bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="flex flex-wrap items-center gap-4 mb-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#0b1f3a]" />
                  <span className="text-slate-700 font-medium">1.º Ciclo (98.4%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#20406d]" />
                  <span className="text-slate-700 font-medium">2.º Ciclo (96.8%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#4d6a97]" />
                  <span className="text-slate-700 font-medium">3.º Ciclo (95.1%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#7a0c0c]" />
                  <span className="text-slate-700 font-medium">Secundário (93.2%)</span>
                </div>
              </div>

              <svg className="w-full h-44 overflow-visible" fill="none" preserveAspectRatio="none" viewBox="0 0 650 180">
                <line stroke="#e2e8f0" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="650" y1="20" y2="20" />
                <line stroke="#e2e8f0" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="650" y1="65" y2="65" />
                <line stroke="#e2e8f0" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="650" y1="110" y2="110" />
                <line stroke="#e2e8f0" strokeWidth="1" x1="0" x2="650" y1="155" y2="155" />

                <text fill="#94a3b8" fontSize="10" x="5" y="18">100%</text>
                <text fill="#94a3b8" fontSize="10" x="5" y="63">96%</text>
                <text fill="#94a3b8" fontSize="10" x="5" y="108">92%</text>
                <text fill="#94a3b8" fontSize="10" x="5" y="152">88%</text>

                {/* Segments: Seg, Ter, Qua, Qui, Sex */}
                <rect fill="#0b1f3a" height="127" rx="2" width="14" x="75" y="28" />
                <rect fill="#20406d" height="117" rx="2" width="14" x="91" y="38" />
                <rect fill="#4d6a97" height="107" rx="2" width="14" x="107" y="48" />
                <rect fill="#7a0c0c" height="93" rx="2" width="14" x="123" y="62" />

                <rect fill="#0b1f3a" height="131" rx="2" width="14" x="195" y="24" />
                <rect fill="#20406d" height="123" rx="2" width="14" x="211" y="32" />
                <rect fill="#4d6a97" height="103" rx="2" width="14" x="227" y="52" />
                <rect fill="#7a0c0c" height="89" rx="2" width="14" x="243" y="66" />

                <rect fill="#0b1f3a" height="133" rx="2" width="14" x="315" y="22" />
                <rect fill="#20406d" height="121" rx="2" width="14" x="331" y="34" />
                <rect fill="#4d6a97" height="111" rx="2" width="14" x="347" y="44" />
                <rect fill="#7a0c0c" height="97" rx="2" width="14" x="363" y="58" />

                <rect fill="#0b1f3a" height="129" rx="2" width="14" x="435" y="26" />
                <rect fill="#20406d" height="125" rx="2" width="14" x="451" y="30" />
                <rect fill="#4d6a97" height="106" rx="2" width="14" x="467" y="49" />
                <rect fill="#7a0c0c" height="91" rx="2" width="14" x="483" y="64" />

                <rect fill="#0b1f3a" height="135" rx="2" width="14" x="555" y="20" />
                <rect fill="#20406d" height="119" rx="2" width="14" x="571" y="36" />
                <rect fill="#4d6a97" height="109" rx="2" width="14" x="587" y="46" />
                <rect fill="#7a0c0c" height="83" rx="2" width="14" x="603" y="72" />
              </svg>

              <div className="grid grid-cols-5 text-center pt-2 text-xs font-semibold text-slate-500">
                <span>Segunda</span>
                <span>Terça</span>
                <span>Quarta</span>
                <span>Quinta</span>
                <span className="text-[#7a0c0c] font-bold">Sexta (Hoje)</span>
              </div>
            </div>
          </div>

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
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-800">1.º Ciclo (Iniciação à 6.ª Classe) • 65.000 Kz/mês</span>
                  <span className="font-mono font-bold text-slate-800">22.400.000 Kz (97.4%)</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden flex">
                  <div className="bg-[#0b1f3a] h-full" style={{ width: '97.4%' }} />
                  <div className="bg-[#7a0c0c] h-full" style={{ width: '2.6%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-800">2.º Ciclo (7.ª à 9.ª Classe) • 75.000 Kz/mês</span>
                  <span className="font-mono font-bold text-slate-800">19.800.000 Kz (93.8%)</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden flex">
                  <div className="bg-[#0b1f3a] h-full" style={{ width: '93.8%' }} />
                  <div className="bg-[#7a0c0c] h-full" style={{ width: '6.2%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-800">Ensino Secundário Geral (10.ª à 12.ª) • 90.000 Kz/mês</span>
                  <span className="font-mono font-bold text-slate-800">20.950.000 Kz (90.3%)</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden flex">
                  <div className="bg-[#0b1f3a] h-full" style={{ width: '90.3%' }} />
                  <div className="bg-[#7a0c0c] h-full" style={{ width: '9.7%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-800">Ensino Técnico de Saúde / Enfermagem • 120.000 Kz/mês</span>
                  <span className="font-mono font-bold text-slate-800">15.300.000 Kz (86.4%)</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden flex">
                  <div className="bg-[#0b1f3a] h-full" style={{ width: '86.4%' }} />
                  <div className="bg-[#7a0c0c] h-full" style={{ width: '13.6%' }} />
                </div>
              </div>
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

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => onNavigate('assiduidade')}
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-center gap-1 transition-all group"
              >
                <span className="material-symbols-outlined text-[#0b1f3a] group-hover:scale-110 transition-transform text-[24px]">
                  checklist
                </span>
                <span className="font-bold text-xs text-[#0b1f3a]">Marcar Faltas</span>
                <span className="text-[10px] text-slate-400">Caderneta diária</span>
              </button>

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
                onClick={() => onNavigate('relatorios')}
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-center gap-1 transition-all group"
              >
                <span className="material-symbols-outlined text-[#7a0c0c] group-hover:scale-110 transition-transform text-[24px]">
                  print
                </span>
                <span className="font-bold text-xs text-[#7a0c0c]">Boletim de Notas</span>
                <span className="text-[10px] text-slate-400">Pauta oficial</span>
              </button>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Auditoria & Logs</span>
                <h2 className="font-headline text-base font-bold text-[#0b1f3a]">Atividades Recentes</h2>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-[#7a0c0c] animate-pulse" />
            </div>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 text-xs">
              <div className="relative">
                <span className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-[#0b1f3a] ring-4 ring-white" />
                <div className="font-bold text-slate-800">Prof.ª Margarida Fontes</div>
                <p className="text-slate-500 text-[11px]">Submeteu a pauta do 10º Ano A de Física e Química para homologação.</p>
                <span className="font-mono text-[10px] text-slate-400">Há 6 min • Pautas</span>
              </div>

              <div className="relative">
                <span className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-[#7a0c0c] ring-4 ring-white" />
                <div className="font-bold text-slate-800">Tesouraria Central</div>
                <p className="text-slate-500 text-[11px]">Recibo RC 2024/1420 emitido para Mariana Silva Rocha (245.000 Kz).</p>
                <span className="font-mono text-[10px] text-slate-400">Há 22 min • Propinas</span>
              </div>

              <div className="relative">
                <span className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-[#0b1f3a] ring-4 ring-white" />
                <div className="font-bold text-slate-800">Prof. João Figueiredo</div>
                <p className="text-slate-500 text-[11px]">Rubrica digital concluída na caderneta de Matemática do 10º A.</p>
                <span className="font-mono text-[10px] text-slate-400">Hoje às 09:45 • Assiduidade</span>
              </div>
            </div>
          </div>

          {/* Institutional Agenda */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Agenda Institucional</span>
                <h2 className="font-headline text-base font-bold text-[#0b1f3a]">Eventos Próximos</h2>
              </div>
              <span className="material-symbols-outlined text-slate-400 text-[20px]">calendar_today</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-11 h-11 rounded-lg bg-[#0b1f3a] text-white flex flex-col items-center justify-center shrink-0">
                  <span className="text-[9px] font-bold uppercase leading-none">NOV</span>
                  <span className="font-headline text-sm font-extrabold leading-none mt-0.5">11</span>
                </div>
                <div>
                  <div className="font-bold text-[#0b1f3a]">Dia da Independência Nacional</div>
                  <p className="text-slate-500 text-[11px]">Feriado Nacional • Não letivo</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-11 h-11 rounded-lg bg-[#7a0c0c] text-white flex flex-col items-center justify-center shrink-0">
                  <span className="text-[9px] font-bold uppercase leading-none">NOV</span>
                  <span className="font-headline text-sm font-extrabold leading-none mt-0.5">25</span>
                </div>
                <div>
                  <div className="font-bold text-[#0b1f3a]">Início das Provas Trimestrais (NPT)</div>
                  <p className="text-slate-500 text-[11px]">1.º Trimestre • Provas Globais de Escola</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
