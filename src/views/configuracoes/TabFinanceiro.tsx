import React, { useState, useMemo } from 'react';
import { InstitutionSettings, UserRole } from '../../types';
import { getActiveSubsystems, EducationLevelId } from '../../utils/educationSubsystems';
import { runGlobalOperation } from '../../context/OperationContext';
import { dbService } from '../../services/db';

interface TabFinanceiroProps {
  settings: InstitutionSettings;
  currentUserRole?: UserRole;
  onUpdateSettings?: (newSettings: Partial<InstitutionSettings>) => void;
  onSaveAll: (options?: { loadingMessage?: string; successMessage?: string; requiredRule?: string }) => void;
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

const DEFAULT_EMOLUMENTOS = [
  { id: 'EMOL-001', nome: 'Matrícula Nova (Ano Letivo 2024/2025)', valor: '35.000', tipo: 'Taxa Única', prazo: 'No ato da inscrição' },
  { id: 'EMOL-002', nome: 'Confirmação de Matrícula (Alunos Internos)', valor: '25.000', tipo: 'Taxa Única', prazo: 'Até 31 de Agosto' },
  { id: 'EMOL-003', nome: 'Certificado de Habilitações com Notas', valor: '15.000', tipo: 'Por Pedido', prazo: '5 dias úteis de emissão' },
  { id: 'EMOL-004', nome: 'Declaração com Notas / Frequência', valor: '5.000', tipo: 'Por Pedido', prazo: '48 horas úteis' },
  { id: 'EMOL-005', nome: '2ª Via de Cartão de Estudante (RFID)', valor: '3.500', tipo: 'Por Pedido', prazo: '24 horas úteis' },
  { id: 'EMOL-006', nome: 'Exame de Recurso (Por Disciplina)', valor: '12.000', tipo: 'Por Exame', prazo: 'Antes da realização' }
];

export const TabFinanceiro: React.FC<TabFinanceiroProps> = ({ settings, currentUserRole, onUpdateSettings, onSaveAll }) => {
  const [tuitionRows, setTuitionRows] = useState<TuitionRow[]>(
    Array.isArray(settings.tuitionRows)
      ? settings.tuitionRows
      : (settings.schoolName ? DEFAULT_TUITION_ROWS : [])
  );

  const [editingRow, setEditingRow] = useState<TuitionRow | null>(null);
  const [editMatutino, setEditMatutino] = useState('');
  const [editVespertino, setEditVespertino] = useState('');
  const [editNoturno, setEditNoturno] = useState('');

  const [emolumentos, setEmolumentos] = useState<any[]>(
    Array.isArray(settings.emolumentos)
      ? settings.emolumentos
      : (settings.schoolName ? DEFAULT_EMOLUMENTOS : [])
  );
  const [showModal, setShowModal] = useState(false);
  const [editingEmolumento, setEditingEmolumento] = useState<{ id: string; nome: string; valor: string; tipo: string; prazo: string } | null>(null);
  const [emolumentoToDelete, setEmolumentoToDelete] = useState<{ id: string; nome: string; valor: string } | null>(null);
  const [novoNome, setNovoNome] = useState('');
  const [novoValor, setNovoValor] = useState('');
  const [novoTipo, setNovoTipo] = useState('Por Pedido');
  const [novoPrazo, setNovoPrazo] = useState('');

  // Financial Rules
  const [paymentDueDay, setPaymentDueDay] = useState(settings.financialRules?.paymentDueDay || '10');
  const [lateFeePercent, setLateFeePercent] = useState(settings.financialRules?.lateFeePercent || '10.0');
  const [discountPercent, setDiscountPercent] = useState(settings.financialRules?.discountPercent || '8.0');
  const [siblingDiscountPercent, setSiblingDiscountPercent] = useState(settings.financialRules?.siblingDiscountPercent || '10.0');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const activeSubsystemList = useMemo(() => {
    return getActiveSubsystems(settings.selectedSubsystems);
  }, [settings.selectedSubsystems]);

  const visibleTuitionRows = useMemo(() => {
    if (!settings.selectedSubsystems || settings.selectedSubsystems.length === 0) {
      return tuitionRows;
    }
    return tuitionRows.filter((r) => settings.selectedSubsystems!.includes(r.subsystemId));
  }, [tuitionRows, settings.selectedSubsystems]);

  const handleStartEditRow = (row: TuitionRow) => {
    setEditingRow(row);
    setEditMatutino(row.matutino);
    setEditVespertino(row.vespertino);
    setEditNoturno(row.noturno);
  };

  const handleSaveEditRow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRow) return;
    const updated = tuitionRows.map((r) =>
      r.id === editingRow.id
        ? {
            ...r,
            matutino: editMatutino,
            vespertino: editVespertino,
            noturno: editNoturno
          }
        : r
    );
    setTuitionRows(updated);
    if (onUpdateSettings) {
      onUpdateSettings({ subsystemTuitions: updated });
    }
    setEditingRow(null);
    triggerToast('Valores de propinas da classe atualizados com sucesso!');
  };

  const handleSaveEmolumento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome || !novoValor) return;

    await runGlobalOperation(
      async () => {
        let updated: any[];
        if (editingEmolumento) {
          updated = emolumentos.map((item) =>
            item.id === editingEmolumento.id
              ? {
                  ...item,
                  nome: novoNome,
                  valor: novoValor,
                  tipo: novoTipo,
                  prazo: novoPrazo || 'Até 48 horas úteis'
                }
              : item
          );
        } else {
          const newId = `EMOL-00${emolumentos.length + 1}`;
          updated = [
            ...emolumentos,
            {
              id: newId,
              nome: novoNome,
              valor: novoValor,
              tipo: novoTipo,
              prazo: novoPrazo || 'Até 48 horas úteis'
            }
          ];
        }
        setEmolumentos(updated);
        if (onUpdateSettings) {
          onUpdateSettings({ emolumentos: updated });
        }
        dbService.updateSettings({ emolumentos: updated });
      },
      {
        loadingMessage: editingEmolumento ? 'A atualizar emolumento na tabela...' : 'A registar novo emolumento na tabela financeira...',
        successMessage: 'Operação feita com sucesso!',
        requiredRule: 'config.institution',
        userRole: currentUserRole
      }
    );

    setShowModal(false);
    setEditingEmolumento(null);
    setNovoNome('');
    setNovoValor('');
    setNovoTipo('Por Pedido');
    setNovoPrazo('');
  };

  const handleStartEditEmolumento = (item: { id: string; nome: string; valor: string; tipo: string; prazo: string }) => {
    setEditingEmolumento(item);
    setNovoNome(item.nome);
    setNovoValor(item.valor);
    setNovoTipo(item.tipo);
    setNovoPrazo(item.prazo);
    setShowModal(true);
  };

  const handleDeleteEmolumento = (id: string) => {
    const updated = emolumentos.filter((e) => e.id !== id);
    setEmolumentos(updated);
    if (onUpdateSettings) {
      onUpdateSettings({ emolumentos: updated });
    }
    triggerToast('Emolumento removido da tabela de taxas.');
  };

  const handleSaveAllFinance = () => {
    if (onUpdateSettings) {
      onUpdateSettings({
        tuitionRows,
        emolumentos,
        financialRules: {
          paymentDueDay: Number(paymentDueDay) || 10,
          lateFeePercent: Number(lateFeePercent) || 10,
          discountPercent: Number(discountPercent) || 8,
          siblingDiscountPercent: Number(siblingDiscountPercent) || 10
        }
      });
    }
    onSaveAll({
      loadingMessage: 'A guardar tabela de propinas, taxas e regras financeiras...',
      successMessage: 'Operação feita com sucesso!'
    });
    triggerToast('Tabela de propinas, taxas e regras financeiras guardadas com sucesso!');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Toast Notice */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-xs">
          <span className="material-symbols-outlined text-[20px] text-emerald-600">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-[#0b1f3a] shrink-0">
            <span className="material-symbols-outlined text-[26px]">payments</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider text-[#ac332b] font-bold">Módulo 03</span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span className="text-[11px] text-slate-500 font-medium">Tabela Oficial de Propinas & Emolumentos</span>
            </div>
            <h2 className="font-headline text-lg lg:text-xl font-bold text-slate-900">
              Parametrização Financeira, Mensalidades & Taxas da Secretaria
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-800 font-mono text-xs font-bold self-start">
            MOEDA: KWANZA (AOA / Kz)
          </span>
        </div>
      </div>

      {/* Subsystems Filter Summary */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700">Sub-sistemas Ativos:</span>
          <div className="flex flex-wrap gap-1.5">
            {activeSubsystemList.map((sub) => (
              <span
                key={sub.id}
                className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800 font-semibold text-[11px]"
              >
                {sub.shortName || sub.name}
              </span>
            ))}
          </div>
        </div>
        <span className="text-slate-500 text-[11px]">
          Exibindo <strong>{visibleTuitionRows.length}</strong> tabelas de mensalidade
        </span>
      </div>

      {/* Section 1: Tabela de Mensalidades por Nível */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-headline text-base lg:text-lg font-bold text-slate-900">
              1. Tabela Base de Mensalidades / Propinas por Ciclo e Turno
            </h3>
            <p className="text-xs text-slate-500">
              Valores expressos em Kwanzas (Kz), cobrados mensalmente de Setembro a Julho (10 prestações).
            </p>
          </div>
          <button
            type="button"
            onClick={handleSaveAllFinance}
            className="px-3.5 py-2 rounded-xl bg-[#0b1f3a] hover:bg-[#7a0c0c] text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs self-start cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">save</span>
            <span>Guardar Tabela</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100">
                <th className="py-3 px-4 rounded-l-lg">Ciclo / Nível de Ensino</th>
                <th className="py-3 px-4">Classes Abrangidas</th>
                <th className="py-3 px-4">Turno Matutino</th>
                <th className="py-3 px-4">Turno Vespertino</th>
                <th className="py-3 px-4">Turno Noturno / Pós-Laboral</th>
                <th className="py-3 px-4 text-right rounded-r-lg">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {visibleTuitionRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      {row.icon && (
                        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-[#0b1f3a] shrink-0">
                          <span className="material-symbols-outlined text-[16px]">{row.icon}</span>
                        </div>
                      )}
                      <span className="font-semibold text-slate-900">{row.nivel}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{row.classes}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{row.matutino} Kz</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{row.vespertino} Kz</td>
                  <td className="py-3 px-4 font-mono text-slate-600">{row.noturno}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleStartEditRow(row)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#0b1f3a] hover:text-white text-[#0b1f3a] font-bold text-xs transition-colors cursor-pointer"
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
            onClick={() => {
              setEditingEmolumento(null);
              setNovoNome('');
              setNovoValor('');
              setNovoTipo('Por Pedido');
              setNovoPrazo('');
              setShowModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-[#0b1f3a] hover:bg-[#7a0c0c] text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs self-start cursor-pointer"
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
                <th className="py-3 px-4 text-right rounded-r-lg">Ações</th>
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
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleStartEditEmolumento(item)}
                        className="text-[#0b1f3a] hover:text-[#ac332b] font-bold p-1 cursor-pointer"
                        title="Editar emolumento"
                      >
                        <span className="material-symbols-outlined text-[17px]">edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEmolumentoToDelete(item)}
                        className="text-slate-400 hover:text-red-600 font-bold p-1 cursor-pointer"
                        title="Eliminar emolumento"
                      >
                        <span className="material-symbols-outlined text-[17px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 3: Prazos, Multas & Descontos (Formulário Editável) */}
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
                <div className="font-bold text-slate-900">Dia Limite de Vencimento</div>
                <div className="text-slate-500 text-[11px]">Prazo regular sem incidência de multa</div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Dia</span>
                <input
                  type="number"
                  min="1"
                  max="28"
                  value={paymentDueDay}
                  onChange={(e) => setPaymentDueDay(e.target.value)}
                  className="w-16 px-2.5 py-1 text-center bg-white border border-slate-300 rounded-lg font-bold text-slate-900 outline-none focus:ring-1 focus:ring-[#0b1f3a]"
                />
                <span className="text-slate-500">de cada mês</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <div className="font-bold text-slate-900">Taxa de Multa Acumulada</div>
                <div className="text-slate-500 text-[11px]">Percentual máximo de agravamento após vencimento</div>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={lateFeePercent}
                  onChange={(e) => setLateFeePercent(e.target.value)}
                  className="w-16 px-2.5 py-1 text-center bg-white border border-slate-300 rounded-lg font-bold text-[#ac332b] outline-none focus:ring-1 focus:ring-[#0b1f3a]"
                />
                <span className="font-bold text-slate-700">%</span>
              </div>
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
                <div className="font-bold text-slate-900">Desconto por Irmãos (2.º e 3.º Filhos)</div>
                <div className="text-slate-500 text-[11px]">Aplicado na mensalidade de menor valor</div>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={siblingDiscountPercent}
                  onChange={(e) => setSiblingDiscountPercent(e.target.value)}
                  className="w-16 px-2.5 py-1 text-center bg-white border border-slate-300 rounded-lg font-bold text-emerald-800 outline-none focus:ring-1 focus:ring-[#0b1f3a]"
                />
                <span className="font-bold text-slate-700">%</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <div className="font-bold text-slate-900">Liquidação Anual Integral Antecipada</div>
                <div className="text-slate-500 text-[11px]">Pagamento adiantado de todas as mensalidades do ano</div>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  className="w-16 px-2.5 py-1 text-center bg-white border border-slate-300 rounded-lg font-bold text-emerald-800 outline-none focus:ring-1 focus:ring-[#0b1f3a]"
                />
                <span className="font-bold text-slate-700">%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer com Botão Guardar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 text-slate-500 text-xs">
          <span className="material-symbols-outlined text-slate-400">price_check</span>
          <span>
            Regras de faturação ativas com vencimento no dia <strong>{paymentDueDay}</strong> de cada mês.
          </span>
        </div>
        <div className="flex items-center gap-2 justify-end">
          <button
            type="button"
            onClick={handleSaveAllFinance}
            className="px-6 py-2.5 rounded-xl bg-[#0b1f3a] text-white font-bold text-xs hover:bg-[#7a0c0c] transition-colors shadow-md flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            <span>Guardar</span>
          </button>
        </div>
      </div>

      {/* Modal Editar Propinas de uma Linha */}
      {editingRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-headline font-bold text-slate-900 text-sm lg:text-base">
                Editar Tabela: {editingRow.nivel}
              </h3>
              <button
                type="button"
                onClick={() => setEditingRow(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
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
                  className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#0b1f3a] text-white font-bold hover:bg-[#7a0c0c] transition-colors cursor-pointer"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Novo / Editar Emolumento */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-headline font-bold text-slate-900 text-sm lg:text-base">
                {editingEmolumento ? 'Editar Emolumento' : 'Registar Novo Emolumento'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setEditingEmolumento(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveEmolumento} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Designação do Serviço</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Certificado de Habilitações com Notas"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-[#0b1f3a]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Valor Fixado em Kwanzas (Kz)</label>
                <input
                  type="text"
                  required
                  placeholder="ex: 15.000"
                  value={novoValor}
                  onChange={(e) => setNovoValor(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono outline-none focus:ring-1 focus:ring-[#0b1f3a]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Regime de Cobrança</label>
                <select
                  value={novoTipo}
                  onChange={(e) => setNovoTipo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-[#0b1f3a]"
                >
                  <option value="Por Pedido">Por Pedido</option>
                  <option value="Taxa Única">Taxa Única</option>
                  <option value="Por Exame">Por Exame</option>
                  <option value="Semestral">Semestral</option>
                  <option value="Anual">Anual</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Prazo de Emissão / Resposta</label>
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
                  onClick={() => {
                    setShowModal(false);
                    setEditingEmolumento(null);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#0b1f3a] text-white font-bold hover:bg-[#7a0c0c] transition-colors cursor-pointer"
                >
                  {editingEmolumento ? 'Salvar Emolumento' : 'Adicionar Emolumento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Eliminar Emolumento com Padrão de Eliminar Turma */}
      {emolumentoToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-none max-w-md w-full p-6 border border-slate-300 shadow-2xl">
            <div className="w-12 h-12 rounded-none bg-red-100 text-red-700 flex items-center justify-center mx-auto mb-4 border border-red-300">
              <span className="material-symbols-outlined text-[28px]">delete_forever</span>
            </div>
            <h3 className="font-headline text-lg font-bold text-slate-900 text-center">
              Eliminar Emolumento da Base de Dados?
            </h3>
            <p className="text-xs text-slate-600 text-center mt-2 leading-relaxed">
              Tem a certeza de que deseja eliminar o emolumento <strong>{emolumentoToDelete.nome}</strong> (Valor: {emolumentoToDelete.valor} Kz)? Esta ação é definitiva na base de dados.
            </p>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setEmolumentoToDelete(null)}
                className="px-4 py-2 rounded-none bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs border border-slate-300 cursor-pointer transition-colors"
                type="button"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  const emo = emolumentoToDelete;
                  setEmolumentoToDelete(null);
                  await runGlobalOperation(
                    async () => {
                      const updated = emolumentos.filter((e) => e.id !== emo.id);
                      setEmolumentos(updated);
                      if (onUpdateSettings) {
                        onUpdateSettings({ emolumentos: updated });
                      }
                      dbService.updateSettings({ ...settings, emolumentos: updated });
                    },
                    {
                      requiredRule: 'config.edit',
                      userRole: currentUserRole,
                      loadingMessage: `A eliminar emolumento ${emo.nome}...`,
                      successMessage: 'Operação feita com sucesso!'
                    }
                  );
                }}
                className="px-5 py-2.5 rounded-none bg-[#b91c1c] hover:bg-[#7a0c0c] text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-none border-none"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                <span>Sim, Eliminar Emolumento</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
