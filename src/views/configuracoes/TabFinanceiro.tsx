import React, { useState, useMemo } from 'react';
import { InstitutionSettings } from '../../types';
import { getActiveSubsystems, EducationLevelId } from '../../utils/educationSubsystems';

interface TabFinanceiroProps {
  settings: InstitutionSettings;
  onSaveAll: () => void;
}

interface TuitionRow {
  id: string;
  subsystemId: EducationLevelId;
  nivel: string;
  classes: string;
  matutino: string;
  vespertino: string;
  noturno: string;
  icon?: string;
}

const DEFAULT_TUITION_ROWS: TuitionRow[] = [
  {
    id: 't-pre',
    subsystemId: 'pre_escolar',
    nivel: 'Educação Pré-Escolar (Creche & Iniciação)',
    classes: 'Creche, Jardim de Infância e Iniciação',
    matutino: '45.000',
    vespertino: '45.000',
    noturno: '60.000 (Integral)',
    icon: 'child_care'
  },
  {
    id: 't-prim',
    subsystemId: 'primario',
    nivel: 'Ensino Primário (1.ª à 6.ª Classe)',
    classes: '1.ª à 6.ª Classe (Monodocência até à 4.ª)',
    matutino: '55.000',
    vespertino: '55.000',
    noturno: '—',
    icon: 'school'
  },
  {
    id: 't-sec1',
    subsystemId: 'secundario_1',
    nivel: 'I Ciclo do Ensino Secundário',
    classes: '7.ª, 8.ª e 9.ª Classes, I e II Ano EJA',
    matutino: '75.000',
    vespertino: '75.000',
    noturno: '70.000 (EJA)',
    icon: 'menu_book'
  },
  {
    id: 't-sec2-cfb',
    subsystemId: 'secundario_2',
    nivel: 'II Ciclo Geral (Ciências Físicas e Biológicas)',
    classes: '10.ª à 12.ª Classes',
    matutino: '95.000',
    vespertino: '90.000',
    noturno: '—',
    icon: 'biotech'
  },
  {
    id: 't-sec2-cej',
    subsystemId: 'secundario_2',
    nivel: 'II Ciclo Geral (Ciências Económicas e Jurídicas)',
    classes: '10.ª à 12.ª Classes',
    matutino: '90.000',
    vespertino: '85.000',
    noturno: '—',
    icon: 'gavel'
  },
  {
    id: 't-sec2-tec',
    subsystemId: 'secundario_2',
    nivel: 'II Ciclo Técnico Profissional (Saúde & Tecnologias)',
    classes: '10.ª à 13.ª Classes (Finalistas)',
    matutino: '120.000',
    vespertino: '120.000',
    noturno: '130.000',
    icon: 'medical_services'
  },
  {
    id: 't-sup',
    subsystemId: 'superior',
    nivel: 'Ensino Superior (Graduação & Pós-Graduação)',
    classes: 'Bacharelato, Licenciatura, Mestrado',
    matutino: '140.000',
    vespertino: '140.000',
    noturno: '155.000 (Pós-laboral)',
    icon: 'history_edu'
  }
];

export const TabFinanceiro: React.FC<TabFinanceiroProps> = ({ settings, onSaveAll }) => {
  const [tuitionRows, setTuitionRows] = useState<TuitionRow[]>(DEFAULT_TUITION_ROWS);
  const [editingRow, setEditingRow] = useState<TuitionRow | null>(null);
  const [editMatutino, setEditMatutino] = useState('');
  const [editVespertino, setEditVespertino] = useState('');
  const [editNoturno, setEditNoturno] = useState('');

  const activeSubsystemList = useMemo(() => {
    return getActiveSubsystems(settings.selectedSubsystems);
  }, [settings.selectedSubsystems]);

  const visibleTuitionRows = useMemo(() => {
    if (!settings.selectedSubsystems || settings.selectedSubsystems.length === 0) {
      return tuitionRows;
    }
    return tuitionRows.filter((r) => settings.selectedSubsystems!.includes(r.subsystemId));
  }, [tuitionRows, settings.selectedSubsystems]);

  const [emolumentos, setEmolumentos] = useState([
    { id: 'EMOL-001', nome: 'Matrícula Nova (Ano Letivo 2024/2025)', valor: '35.000', tipo: 'Taxa Única', prazo: 'No ato da inscrição' },
    { id: 'EMOL-002', nome: 'Confirmação de Matrícula (Alunos Internos)', valor: '25.000', tipo: 'Taxa Única', prazo: 'Até 31 de Agosto' },
    { id: 'EMOL-003', nome: 'Certificado de Habilitações com Notas', valor: '15.000', tipo: 'Por Pedido', prazo: '5 dias úteis de emissão' },
    { id: 'EMOL-004', nome: 'Declaração com Notas / Frequência', valor: '5.000', tipo: 'Por Pedido', prazo: '48 horas úteis' },
    { id: 'EMOL-005', nome: '2ª Via de Cartão de Estudante (RFID)', valor: '3.500', tipo: 'Por Pedido', prazo: '24 horas úteis' },
    { id: 'EMOL-006', nome: 'Exame de Recurso (Por Disciplina)', valor: '12.000', tipo: 'Por Exame', prazo: 'Antes da realização' }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novoValor, setNovoValor] = useState('');
  const [novoTipo, setNovoTipo] = useState('Por Pedido');
  const [novoPrazo, setNovoPrazo] = useState('');

  const handleStartEditRow = (row: TuitionRow) => {
    setEditingRow(row);
    setEditMatutino(row.matutino);
    setEditVespertino(row.vespertino);
    setEditNoturno(row.noturno);
  };

  const handleSaveEditRow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRow) return;
    setTuitionRows((prev) =>
      prev.map((r) =>
        r.id === editingRow.id
          ? {
              ...r,
              matutino: editMatutino,
              vespertino: editVespertino,
              noturno: editNoturno
            }
          : r
      )
    );
    setEditingRow(null);
    onSaveAll();
  };

  const handleAddEmolumento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome || !novoValor) return;
    const newId = `EMOL-00${emolumentos.length + 1}`;
    setEmolumentos([
      ...emolumentos,
      {
        id: newId,
        nome: novoNome,
        valor: novoValor,
        tipo: novoTipo,
        prazo: novoPrazo || 'A consultar'
      }
    ]);
    setNovoNome('');
    setNovoValor('');
    setNovoPrazo('');
    setShowModal(false);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Context & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-[#0b1f3a] shrink-0">
            <span className="material-symbols-outlined text-[26px]">payments</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider text-[#ac332b] font-bold">Finanças & Emolumentos</span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span className="text-[11px] text-slate-500 font-medium">Decreto Presidencial n.º 128/20</span>
            </div>
            <h2 className="font-headline text-lg lg:text-xl font-bold text-slate-900">
              Tabela Geral de Propinas & Emolumentos Oficiais (Kz)
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>AGT Conforme • Isenção IVA (Art. 12 CIVA)</span>
          </div>
        </div>
      </div>

      {/* 3 Top KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] uppercase tracking-wider font-bold">Moeda Base do Sistema</span>
            <span className="material-symbols-outlined text-[20px] text-[#ac332b]">account_balance_wallet</span>
          </div>
          <div className="mt-2">
            <div className="font-headline text-2xl font-extrabold text-slate-900">Kwanza (Kz)</div>
            <div className="text-xs text-slate-500 font-mono mt-0.5">Código ISO: AOA • Divisões em Cêntimos</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] uppercase tracking-wider font-bold">Sub-sistemas & Cursos Ativos</span>
            <span className="material-symbols-outlined text-[20px] text-[#0b1f3a]">layers</span>
          </div>
          <div className="mt-2">
            <div className="font-headline text-2xl font-extrabold text-slate-900">
              {visibleTuitionRows.length} Escalões Ativos
            </div>
            <div className="text-xs text-slate-500 mt-0.5 truncate" title={activeSubsystemList.map(s => s.fullName).join(', ')}>
              {activeSubsystemList.map(s => s.shortName).join(' • ')}
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] uppercase tracking-wider font-bold">Vencimento Mensal Padrão</span>
            <span className="material-symbols-outlined text-[20px] text-[#0b1f3a]">event_upcoming</span>
          </div>
          <div className="mt-2">
            <div className="font-headline text-2xl font-extrabold text-[#0b1f3a]">Dia 10 de Cada Mês</div>
            <div className="text-xs text-slate-500 mt-0.5">Carência: 0 dias • Multa automática</div>
          </div>
        </div>
      </div>

      {/* Section 1: Tabela de Propinas por Ciclo e Turno */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-headline text-base lg:text-lg font-bold text-slate-900">
              1. Tabela de Propinas por Sub-sistema e Turno
            </h3>
            <p className="text-xs text-slate-500">
              Mensalidades fixas homologadas pela comissão de pais e Gabinete Provincial de Educação para os regimes da instituição.
            </p>
          </div>
          <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-mono text-[11px] font-bold rounded-lg self-start">
            TABELA VIGENTE 2024/2025
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100">
                <th className="py-3 px-4 rounded-l-lg">Ciclo / Nível de Ensino</th>
                <th className="py-3 px-4">Classes Abrangidas</th>
                <th className="py-3 px-4">Turno Matutino</th>
                <th className="py-3 px-4">Turno Vespertino</th>
                <th className="py-3 px-4">Regime Noturno / Especial</th>
                <th className="py-3 px-4 text-center rounded-r-lg">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {visibleTuitionRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                    {row.icon && (
                      <span className="material-symbols-outlined text-[17px] text-[#0b1f3a]">
                        {row.icon}
                      </span>
                    )}
                    <span>{row.nivel}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{row.classes}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {row.matutino !== '—' ? `${row.matutino} Kz` : '—'}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {row.vespertino !== '—' ? `${row.vespertino} Kz` : '—'}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-mono font-bold">
                    {row.noturno !== '—' && !row.noturno.includes('Kz') && !row.noturno.includes('—')
                      ? `${row.noturno} Kz`
                      : row.noturno}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleStartEditRow(row)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#0b1f3a] hover:text-white text-[#0b1f3a] font-bold text-xs transition-colors"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 2: Outras Taxas & Emolumentos da Secretaria */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-headline text-base lg:text-lg font-bold text-slate-900">
              2. Outras Taxas & Emolumentos da Secretaria
            </h3>
            <p className="text-xs text-slate-500">
              Custos operacionais de emissão documental, certidões, cartões de acesso e confirmações.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="px-3.5 py-2 rounded-xl bg-[#0b1f3a] hover:bg-[#7a0c0c] text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs self-start"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Adicionar Novo Emolumento</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100">
                <th className="py-3 px-4 rounded-l-lg">Código</th>
                <th className="py-3 px-4">Designação do Serviço / Emolumento</th>
                <th className="py-3 px-4">Valor Fixado (Kz)</th>
                <th className="py-3 px-4">Regime de Cobrança</th>
                <th className="py-3 px-4">Prazo de Emissão</th>
                <th className="py-3 px-4 text-right rounded-r-lg">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {emolumentos.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-500">{item.id}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{item.nome}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{item.valor} Kz</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 font-medium text-slate-700 text-[11px]">
                      {item.tipo}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">{item.prazo}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => alert(`Configuração do emolumento ${item.nome}`)}
                      className="text-[#0b1f3a] hover:text-[#ac332b] font-bold"
                    >
                      Alterar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 3: Prazos, Multas & Descontos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prazos & Multas */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#ac332b] text-[22px]">alarm</span>
            <h3 className="font-headline text-base font-bold text-slate-900">
              Prazos de Pagamento & Multas de Mora
            </h3>
          </div>

          <div className="flex flex-col gap-3 text-xs">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <div className="font-bold text-slate-900">Dia de Vencimento</div>
                <div className="text-slate-500 text-[11px]">Prazo regular sem incidência de juros</div>
              </div>
              <span className="font-mono text-xs font-bold text-slate-900 bg-white px-3 py-1 rounded-lg border border-slate-200">
                Dia 10 de cada mês
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <div className="font-bold text-slate-900">Multa de Mora Diária</div>
                <div className="text-slate-500 text-[11px]">Aplicada a partir do dia 11</div>
              </div>
              <span className="font-mono text-xs font-bold text-[#ac332b] bg-white px-3 py-1 rounded-lg border border-slate-200">
                0.25% ao dia
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <div className="font-bold text-slate-900">Limite Máximo de Agravamento</div>
                <div className="text-slate-500 text-[11px]">Teto legal acumulado de penalização</div>
              </div>
              <span className="font-mono text-xs font-bold text-slate-900 bg-white px-3 py-1 rounded-lg border border-slate-200">
                10.0% do valor base
              </span>
            </div>
          </div>
        </div>

        {/* Descontos e Fraternidade */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#0b1f3a] text-[22px]">loyalty</span>
            <h3 className="font-headline text-base font-bold text-slate-900">
              Política de Descontos e Fraternidade
            </h3>
          </div>

          <div className="flex flex-col gap-3 text-xs">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <div className="font-bold text-slate-900">Segundo Filho Matriculado</div>
                <div className="text-slate-500 text-[11px]">Desconto automático aplicado na mensalidade menor</div>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                -10% Desconto
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <div className="font-bold text-slate-900">Terceiro Irmão ou Mais</div>
                <div className="text-slate-500 text-[11px]">Desconto para famílias com 3 ou mais estudantes</div>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                -15% Desconto
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <div className="font-bold text-slate-900">Liquidação Anual Integral</div>
                <div className="text-slate-500 text-[11px]">Pagamento adiantado das 10 mensalidades do ano letivo</div>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                -8% Desconto
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Faturação Certificada & Isenções Fiscais AGT */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[#0b1f3a] shrink-0">
            <span className="material-symbols-outlined text-[24px]">verified</span>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">
              Faturação Certificada & Isenções Fiscais AGT
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Regime de IVA: <strong>Isenção Art. 12 do CIVA (Código de Isenção M04)</strong> • SAF-T AO N.º 312/AGT/2024
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => alert('Comunicação com a AGT testada: WebService SAF-T AO operacional.')}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
          >
            Testar Comunicação AGT
          </button>
          <button
            type="button"
            onClick={onSaveAll}
            className="px-4 py-2 rounded-xl bg-[#0b1f3a] hover:bg-[#7a0c0c] text-white font-bold text-xs transition-colors shadow-xs flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">save</span>
            <span>Guardar Tabela Financeira</span>
          </button>
        </div>
      </div>

      {/* Modal Adicionar Emolumento */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-2xl flex flex-col gap-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-headline font-bold text-slate-900 text-base">Novo Emolumento da Secretaria</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <form onSubmit={handleAddEmolumento} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Designação do Serviço</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Certidão para Fins Militares"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-[#0b1f3a]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Valor em Kz</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: 8.000"
                    value={novoValor}
                    onChange={(e) => setNovoValor(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono outline-none focus:ring-1 focus:ring-[#0b1f3a]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipo de Cobrança</label>
                  <select
                    value={novoTipo}
                    onChange={(e) => setNovoTipo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-[#0b1f3a]"
                  >
                    <option value="Por Pedido">Por Pedido</option>
                    <option value="Taxa Única">Taxa Única</option>
                    <option value="Por Exame">Por Exame</option>
                    <option value="Anual">Anual</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Prazo de Emissão</label>
                <input
                  type="text"
                  placeholder="ex: 48 horas úteis"
                  value={novoPrazo}
                  onChange={(e) => setNovoPrazo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-[#0b1f3a]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[#0b1f3a] text-white font-bold hover:bg-[#7a0c0c]"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal de Edição de Propina */}
      {editingRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0b1f3a] text-[20px]">edit_note</span>
                <h3 className="font-headline font-bold text-slate-900 text-sm">
                  Editar Propina • {editingRow.nivel}
                </h3>
              </div>
              <button
                onClick={() => setEditingRow(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveEditRow} className="mt-4 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-600 text-[11px]">
                Classes abrangidas: <strong>{editingRow.classes}</strong>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Turno Matutino (Kz)</label>
                <input
                  type="text"
                  required
                  placeholder="ex: 65.000"
                  value={editMatutino}
                  onChange={(e) => setEditMatutino(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono outline-none focus:ring-1 focus:ring-[#0b1f3a]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Turno Vespertino (Kz)</label>
                <input
                  type="text"
                  required
                  placeholder="ex: 65.000"
                  value={editVespertino}
                  onChange={(e) => setEditVespertino(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono outline-none focus:ring-1 focus:ring-[#0b1f3a]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Regime Noturno / Especial (Kz ou —)</label>
                <input
                  type="text"
                  placeholder="ex: 70.000 ou —"
                  value={editNoturno}
                  onChange={(e) => setEditNoturno(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono outline-none focus:ring-1 focus:ring-[#0b1f3a]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingRow(null)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#0b1f3a] text-white font-bold hover:bg-[#7a0c0c] transition-colors"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
