import React, { useState } from 'react';
import { InstitutionSettings } from '../../types';

interface TabAnoLetivoProps {
  settings: InstitutionSettings;
  onSaveAll: () => void;
}

export const TabAnoLetivo: React.FC<TabAnoLetivoProps> = ({ settings, onSaveAll }) => {
  const [bloqueioSumarios, setBloqueioSumarios] = useState(true);
  const [toleranciaNotas, setToleranciaNotas] = useState(true);
  const [chaveFecho, setChaveFecho] = useState(true);
  const [showAddPauseModal, setShowAddPauseModal] = useState(false);

  const [pausas, setPausas] = useState([
    { id: 1, desc: 'Pausa de Fim de Ano & Natal', periodo: '14 Dez 2024 — 05 Jan 2025', dias: '22 Dias' },
    { id: 2, desc: 'Interrupção de Carnaval', periodo: '03 Mar 2025 — 05 Mar 2025', dias: '3 Dias' },
    { id: 3, desc: 'Pausa Pedagógica da Páscoa', periodo: '12 Abr 2025 — 27 Abr 2025', dias: '16 Dias' },
    { id: 4, desc: 'Férias Maiores (Verão Académico)', periodo: '01 Ago 2025 — 31 Ago 2025', dias: '31 Dias' }
  ]);

  const [novaPausaDesc, setNovaPausaDesc] = useState('');
  const [novaPausaPeriodo, setNovaPausaPeriodo] = useState('');
  const [novaPausaDias, setNovaPausaDias] = useState('');

  const handleAddPause = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaPausaDesc || !novaPausaPeriodo) return;
    setPausas([
      ...pausas,
      {
        id: Date.now(),
        desc: novaPausaDesc,
        periodo: novaPausaPeriodo,
        dias: novaPausaDias || '5 Dias'
      }
    ]);
    setNovaPausaDesc('');
    setNovaPausaPeriodo('');
    setNovaPausaDias('');
    setShowAddPauseModal(false);
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
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">file_download</span>
              <span>Exportar PDF</span>
            </button>
            <button
              type="button"
              onClick={() => alert('Aviso do Conselho Pedagógico: O encerramento do trimestre tranca os diários e gera as atas finais homologadas.')}
              className="px-3.5 py-2 rounded-xl bg-[#ac332b] text-white hover:bg-red-800 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">lock_clock</span>
              <span>Encerrar Trimestre</span>
            </button>
          </div>
        </div>

        {/* Active Academic Year Banner Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 items-center">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ano Letivo Vigente</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-headline text-lg font-extrabold text-[#0b1f3a]">
                {settings.currentAcademicYear || '2024 / 2025'}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                EM CURSO
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Período de Atividade</span>
            <span className="text-xs font-semibold text-slate-800 mt-0.5">02 Set 2024 — 31 Jul 2025</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Semanas Letivas</span>
            <span className="text-xs font-semibold text-slate-800 mt-0.5">38 Semanas Globais</span>
          </div>
          <div className="flex items-center lg:justify-end">
            <button
              type="button"
              onClick={() => alert(`Ano Letivo configurado: ${settings.currentAcademicYear}. Para alterar o ano letivo completo, solicite ao Administrador Geral.`)}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs flex items-center gap-2 transition-colors shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">tune</span>
              <span>Mudar Ano Letivo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Estrutura Curricular dos 3 Trimestres */}
      <div className="flex flex-col gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-headline text-base lg:text-lg font-bold text-slate-900">
              Estrutura Curricular dos 3 Trimestres
            </h3>
            <p className="text-xs text-slate-500">
              Períodos obrigatórios de aulas, provas parcelares, exames e conselhos pedagógicos.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-mono text-[11px] font-bold">
            MED ANGOLA • CICLO REGULAR
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-1">
          {/* 1º Trimestre (Concluído) */}
          <div className="flex flex-col p-5 rounded-xl bg-slate-50 border border-slate-200 justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-200 text-slate-800">
                  1.º TRIMESTRE
                </span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  Pautas Fechadas
                </span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">Início das Aulas:</span>
                  <span className="font-semibold text-slate-900">02 Set 2024</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">Término Letivo:</span>
                  <span className="font-semibold text-slate-900">13 Dez 2024</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">Provas Trimestrais:</span>
                  <span className="font-semibold text-slate-900">25 Nov – 06 Dez</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">Conselho de Notas:</span>
                  <span className="font-semibold text-slate-900">16 Dez 2024</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">14 Semanas Úteis</span>
              <button
                type="button"
                onClick={() => alert('Ata Geral de Notas do 1.º Trimestre: 100% das turmas homologadas sem pendências.')}
                className="text-[#0b1f3a] hover:text-[#ac332b] font-bold flex items-center gap-1 transition-colors"
              >
                <span>Ver Ata Geral</span>
                <span className="material-symbols-outlined text-[14px]">open_in_new</span>
              </button>
            </div>
          </div>

          {/* 2º Trimestre (Ativo - Em Curso) */}
          <div className="flex flex-col p-5 rounded-xl bg-white ring-2 ring-[#0b1f3a] shadow-md relative overflow-hidden justify-between">
            <div className="absolute top-0 right-0 bg-[#0b1f3a] text-white text-[9px] font-bold px-3 py-0.5 rounded-bl-lg tracking-wider">
              EM ANDAMENTO
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#0b1f3a] text-white">
                  2.º TRIMESTRE
                </span>
                <span className="flex items-center gap-1 text-[11px] text-[#ac332b] font-bold bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ac332b] animate-pulse" />
                  Pautas Abertas
                </span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">Início das Aulas:</span>
                  <span className="font-semibold text-slate-900">06 Jan 2025</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">Término Letivo:</span>
                  <span className="font-semibold text-slate-900">11 Abr 2025</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">Provas Trimestrais:</span>
                  <span className="font-bold text-[#0b1f3a]">24 Mar – 04 Abr</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">Conselho de Notas:</span>
                  <span className="font-semibold text-slate-900">14 Abr 2025</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[#ac332b] font-bold">13 Semanas Úteis</span>
              <button
                type="button"
                onClick={() => alert('Edição das datas do 2.º Trimestre: janela de provas e conselho homologadas pela Direção.')}
                className="px-3 py-1 rounded-lg bg-[#0b1f3a] text-white hover:bg-[#7a0c0c] font-bold flex items-center gap-1 transition-colors shadow-xs"
              >
                <span className="material-symbols-outlined text-[14px]">edit_calendar</span>
                <span>Editar Datas</span>
              </button>
            </div>
          </div>

          {/* 3º Trimestre (Planeado) */}
          <div className="flex flex-col p-5 rounded-xl bg-slate-50 border border-slate-200 justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-200 text-slate-800">
                  3.º TRIMESTRE
                </span>
                <span className="text-[11px] text-slate-500 font-bold bg-slate-200 px-2 py-0.5 rounded-full">
                  Planeado
                </span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">Início das Aulas:</span>
                  <span className="font-semibold text-slate-900">28 Abr 2025</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">Término Letivo:</span>
                  <span className="font-semibold text-slate-900">11 Jul 2025</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">Exames Nacionais:</span>
                  <span className="font-semibold text-slate-900">23 Jun – 04 Jul</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">Divulgação Final:</span>
                  <span className="font-semibold text-slate-900">18 Jul 2025</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">11 Semanas Úteis</span>
              <button
                type="button"
                onClick={() => alert('Parâmetros do 3º Trimestre sincronizados com o calendário escolar nacional.')}
                className="text-slate-700 hover:text-[#0b1f3a] font-bold flex items-center gap-1 transition-colors"
              >
                <span>Configurar</span>
                <span className="material-symbols-outlined text-[14px]">settings</span>
              </button>
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
                Interrupções & Pausas Letivas
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowAddPauseModal(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[15px]">add</span>
              <span>Adicionar Pausa</span>
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
                        onClick={() => alert(`Detalhes da pausa: ${p.desc} (${p.periodo})`)}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                      >
                        <span className="material-symbols-outlined text-[18px]">more_vert</span>
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
                onClick={() => setBloqueioSumarios(!bloqueioSumarios)}
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
                onClick={() => setToleranciaNotas(!toleranciaNotas)}
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
                onClick={() => setChaveFecho(!chaveFecho)}
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
            onClick={() => alert('Calendário sincronizado com o Diário da República de Angola (Iª Série).')}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors self-start"
          >
            <span className="material-symbols-outlined text-[16px]">sync</span>
            <span>Sincronizar com Diário da República</span>
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
            Última alteração guardada por <strong className="text-slate-800">Dr. Carlos Mendes</strong> em 14/02/2025 às 09:42.
          </span>
        </div>
        <div className="flex items-center gap-2 justify-end">
          <button
            type="button"
            onClick={() => alert('Modificações descartadas com sucesso.')}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
          >
            Descartar Modificações
          </button>
          <button
            type="button"
            onClick={onSaveAll}
            className="px-5 py-2 rounded-xl bg-[#0b1f3a] text-white font-bold text-xs hover:bg-[#7a0c0c] transition-colors shadow-md flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[17px]">check</span>
            <span>Guardar Configurações do Ano Letivo</span>
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
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
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
                  placeholder="ex: Pausa de Avaliação Especial"
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
                  className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[#0b1f3a] text-white font-bold hover:bg-[#7a0c0c]"
                >
                  Registar Pausa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
