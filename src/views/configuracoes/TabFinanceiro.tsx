import React, { useState } from 'react';
import { InstitutionSettings, UserRole, SchoolServiceItem } from '../../types';
import { dbService } from '../../services/db';
import { runGlobalOperation } from '../../context/OperationContext';

interface TabFinanceiroProps {
  settings: InstitutionSettings;
  currentUserRole?: UserRole;
  onUpdateSettings?: (newSettings: Partial<InstitutionSettings>) => void;
  onSaveAll: (options?: { loadingMessage?: string; successMessage?: string; requiredRule?: string }) => void;
}

interface BankAccountConfig {
  id: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  iban: string;
  multicaixaEntity?: string;
  active: boolean;
}

interface TuitionRowConfig {
  id: string;
  levelName: string;
  cycle: string;
  grades: string;
  matriculaKz: number;
  confirmacaoKz: number;
  monthlyTuitionKz: number;
  lateFeeLimitDays: number;
}

const DEFAULT_BANKS: BankAccountConfig[] = [
  {
    id: 'bank-bai',
    bankName: 'Banco Angolano de Investimentos (BAI)',
    accountHolder: 'Complexo Escolar BandMed Luanda',
    accountNumber: '4455889901',
    iban: 'AO06.0040.0000.4455.8899.0101.4',
    multicaixaEntity: '00342',
    active: true
  },
  {
    id: 'bank-bfa',
    bankName: 'Banco de Fomento Angola (BFA)',
    accountHolder: 'Complexo Escolar BandMed Luanda',
    accountNumber: '7788991122',
    iban: 'AO06.0006.0000.7788.9911.2201.8',
    multicaixaEntity: '00119',
    active: true
  },
  {
    id: 'bank-bma',
    bankName: 'Banco Millennium Atlântico (BMA)',
    accountHolder: 'Complexo Escolar BandMed Luanda',
    accountNumber: '1122334455',
    iban: 'AO06.0055.0000.1122.3344.5501.9',
    multicaixaEntity: '00287',
    active: false
  }
];

const DEFAULT_TUITION_ROWS: TuitionRowConfig[] = [
  {
    id: 't-iniciacao',
    levelName: 'Educação Pré-Escolar / Iniciação',
    cycle: 'Pré-Escolar',
    grades: 'Creche à Iniciação',
    matriculaKz: 25000,
    confirmacaoKz: 15000,
    monthlyTuitionKz: 28000,
    lateFeeLimitDays: 10
  },
  {
    id: 't-primario',
    levelName: 'Ensino Primário',
    cycle: 'I e II Ciclo do Primário',
    grades: '1.ª à 6.ª Classe',
    matriculaKz: 28000,
    confirmacaoKz: 18000,
    monthlyTuitionKz: 32000,
    lateFeeLimitDays: 10
  },
  {
    id: 't-iciclo',
    levelName: 'I Ciclo do Ensino Secundário',
    cycle: 'Geral',
    grades: '7.ª, 8.ª e 9.ª Classe',
    matriculaKz: 32000,
    confirmacaoKz: 20000,
    monthlyTuitionKz: 36500,
    lateFeeLimitDays: 10
  },
  {
    id: 't-iiciclo-geral',
    levelName: 'II Ciclo do Ensino Secundário Geral (PUNIV)',
    cycle: 'Ciências Físicas e Biológicas / Económicas',
    grades: '10.ª, 11.ª e 12.ª Classe',
    matriculaKz: 38000,
    confirmacaoKz: 24000,
    monthlyTuitionKz: 42000,
    lateFeeLimitDays: 10
  },
  {
    id: 't-tecnico-saude',
    levelName: 'Ensino Técnico-Profissional (Saúde & Tecnologias)',
    cycle: 'Enfermagem, Farmácia, Análises Clínicas',
    grades: '10.ª, 11.ª, 12.ª e 13.ª Classe',
    matriculaKz: 45000,
    confirmacaoKz: 28000,
    monthlyTuitionKz: 48500,
    lateFeeLimitDays: 10
  }
];

export const TabFinanceiro: React.FC<TabFinanceiroProps> = ({
  settings,
  currentUserRole,
  onUpdateSettings,
  onSaveAll
}) => {
  const initialFinancialRules = settings.financialRules || {
    paymentDueDay: 10,
    lateFeePercent: 10.0,
    discountPercent: 5.0,
    siblingDiscountPercent: 10.0
  };

  // State: Financial Rules & Policies
  const [paymentDueDay, setPaymentDueDay] = useState<number>(initialFinancialRules.paymentDueDay ?? 10);
  const [lateFeePercent, setLateFeePercent] = useState<number>(initialFinancialRules.lateFeePercent ?? 10.0);
  const [discountPercent, setDiscountPercent] = useState<number>(initialFinancialRules.discountPercent ?? 5.0);
  const [siblingDiscountPercent, setSiblingDiscountPercent] = useState<number>(initialFinancialRules.siblingDiscountPercent ?? 10.0);
  const [graceDays, setGraceDays] = useState<number>(initialFinancialRules.graceDays ?? 3);
  const [allowPartialPayments, setAllowPartialPayments] = useState<boolean>(initialFinancialRules.allowPartialPayments ?? true);
  const [blockExamsWithDebt, setBlockExamsWithDebt] = useState<boolean>(initialFinancialRules.blockExamsWithDebt ?? false);
  const [blockCertificatesWithDebt, setBlockCertificatesWithDebt] = useState<boolean>(initialFinancialRules.blockCertificatesWithDebt ?? true);

  // State: Tuition Table Rows
  const [tuitionRows, setTuitionRows] = useState<TuitionRowConfig[]>(
    settings.tuitionRows && settings.tuitionRows.length > 0 ? settings.tuitionRows : DEFAULT_TUITION_ROWS
  );

  // State: Bank Accounts
  const [bankAccounts, setBankAccounts] = useState<BankAccountConfig[]>(
    (settings as any).bankAccounts && (settings as any).bankAccounts.length > 0
      ? (settings as any).bankAccounts
      : DEFAULT_BANKS
  );

  // UI States
  const [activeSubSection, setActiveSubSection] = useState<'politicas' | 'tabela' | 'bancos' | 'fiscal'>('politicas');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [newBankName, setNewBankName] = useState('');
  const [newBankHolder, setNewBankHolder] = useState('Complexo Escolar BandMed Luanda');
  const [newBankAccountNumber, setNewBankAccountNumber] = useState('');
  const [newBankIban, setNewBankIban] = useState('AO06.');
  const [newBankEntity, setNewBankEntity] = useState('');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const formatKz = (val: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      maximumFractionDigits: 0
    }).format(val).replace('AOA', 'Kz');
  };

  const handleUpdateTuitionRow = (id: string, field: keyof TuitionRowConfig, val: number) => {
    setTuitionRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: Number(val) || 0 } : row))
    );
  };

  const handleToggleBank = (id: string) => {
    setBankAccounts((prev) =>
      prev.map((bank) => (bank.id === id ? { ...bank, active: !bank.active } : bank))
    );
  };

  const handleDeleteBank = (id: string) => {
    if (confirm('Deseja realmente remover esta conta bancária das coordenadas institucionais?')) {
      setBankAccounts((prev) => prev.filter((b) => b.id !== id));
      triggerToast('Conta bancária removida.');
    }
  };

  const handleAddBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBankName.trim() || !newBankIban.trim()) {
      alert('Por favor, informe o nome do banco e o IBAN.');
      return;
    }

    const newAccount: BankAccountConfig = {
      id: `bank-${Date.now()}`,
      bankName: newBankName.trim(),
      accountHolder: newBankHolder.trim() || settings.schoolName || 'Instituição de Ensino',
      accountNumber: newBankAccountNumber.trim() || '---',
      iban: newBankIban.trim(),
      multicaixaEntity: newBankEntity.trim() || undefined,
      active: true
    };

    setBankAccounts((prev) => [...prev, newAccount]);
    setShowAddBankModal(false);
    setNewBankName('');
    setNewBankAccountNumber('');
    setNewBankIban('AO06.');
    setNewBankEntity('');
    triggerToast('Nova conta bancária adicionada com sucesso.');
  };

  const handleSaveAllFinancial = async () => {
    const updatedFinancialRules = {
      ...initialFinancialRules,
      paymentDueDay,
      lateFeePercent,
      discountPercent,
      siblingDiscountPercent,
      graceDays,
      allowPartialPayments,
      blockExamsWithDebt,
      blockCertificatesWithDebt
    };

    const newPartialSettings: Partial<InstitutionSettings> = {
      financialRules: updatedFinancialRules,
      tuitionRows,
      currencyCode: 'Kz',
      ...({ bankAccounts } as any)
    };

    if (onUpdateSettings) {
      onUpdateSettings(newPartialSettings);
    }

    dbService.updateSettings(newPartialSettings);

    dbService.addAuditLog({
      userName: 'Direção Financeira',
      userRole: currentUserRole || 'financeiro',
      action: 'Configuração da Tabela Financeira',
      details: `Políticas de mora (${lateFeePercent}%), dia limite (${paymentDueDay}) e tabelas de propinas/emolumentos atualizadas.`,
      module: 'propinas',
      timestamp: 'Agora mesmo',
      badgeColor: '#0b1f3a'
    });

    await runGlobalOperation(
      async () => {
        await new Promise((res) => setTimeout(res, 600));
      },
      {
        loadingMessage: 'A gravar tabelas de propinas, regras de mora e catálogo financeiro...',
        successMessage: 'Configurações financeiras e emolumentos sincronizados com sucesso!'
      }
    );

    triggerToast('Tabela financeira guardada com êxito no sistema.');
  };

  return (
    <div className="flex flex-col gap-6" id="tab-financeiro-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-[#0b1f3a] text-white rounded-xl shadow-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <span className="material-symbols-outlined text-emerald-400 text-xl">check_circle</span>
          <p className="text-sm font-medium">{toastMessage}</p>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-700 shrink-0">
            <span className="material-symbols-outlined text-2xl">payments</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider text-[#ac332b] font-bold">Módulo 03</span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span className="text-[11px] text-slate-500 font-medium">Gestão Financeira & Cobranças</span>
            </div>
            <h2 className="text-lg lg:text-xl font-bold text-slate-900">
              Tabela Financeira, Políticas de Propinas & Emolumentos
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Prazos de pagamento, taxas de mora, descontos por agregado, preçário de propinas e coordenadas bancárias oficiais de Angola.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          <button
            type="button"
            id="btn-save-financeiro"
            onClick={handleSaveAllFinancial}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#0b1f3a] hover:bg-[#15345d] text-white text-sm font-semibold rounded-xl transition-all shadow-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">save</span>
            Guardar Configurações
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        {[
          { id: 'politicas', label: '1. Prazos & Multas (Políticas Gerais)', icon: 'schedule' },
          { id: 'tabela', label: '2. Propinas por Nível / Ciclo', icon: 'table_chart' },
          { id: 'bancos', label: '3. Contas Bancárias & IBAN', icon: 'account_balance' },
          { id: 'fiscal', label: '4. Regime Fiscal & AGT', icon: 'verified' }
        ].map((tab) => (
          <button
            key={tab.id}
            id={`subtab-${tab.id}`}
            type="button"
            onClick={() => setActiveSubSection(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeSubSection === tab.id
                ? 'bg-[#0b1f3a] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-base">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* SECTION 1: POLÍTICAS GERAIS, PRAZOS & MULTAS */}
      {activeSubSection === 'politicas' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card: Prazos e Multas de Mensalidades */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-600 text-lg">event_available</span>
                  Prazos de Vencimento e Taxa de Mora (Multa)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Regras oficiais aplicadas na emissão mensal e no cálculo automatizado de juros por atraso.
                </p>
              </div>
              <span className="px-2.5 py-1 bg-amber-50 text-amber-800 text-[11px] font-bold rounded-lg border border-amber-200">
                Padrão Angola
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Dia Limite de Pagamento */}
              <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Dia Limite sem Multa</span>
                  <span className="text-[11px] font-mono text-slate-500">Dia do mês</span>
                </label>
                <div className="relative mt-1">
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={paymentDueDay}
                    onChange={(e) => setPaymentDueDay(Math.min(31, Math.max(1, Number(e.target.value))))}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-semibold text-slate-900"
                  />
                </div>
                <span className="text-[11px] text-slate-500 mt-1">
                  Propinas pagas após o dia <strong>{paymentDueDay}</strong> incidem acréscimo de multa.
                </span>
              </div>

              {/* Taxa de Multa */}
              <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Taxa de Multa por Atraso</span>
                  <span className="text-[11px] font-mono text-amber-700 font-bold">{lateFeePercent}%</span>
                </label>
                <div className="relative mt-1">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={lateFeePercent}
                    onChange={(e) => setLateFeePercent(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-semibold text-slate-900"
                  />
                </div>
                <span className="text-[11px] text-slate-500 mt-1">
                  Percentual sobre a mensalidade base adicionado à fatura no 1.º mês de incumprimento.
                </span>
              </div>

              {/* Dias de Carência / Tolerância */}
              <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Dias de Carência / Tolerância</span>
                  <span className="text-[11px] font-mono text-slate-500">{graceDays} dias</span>
                </label>
                <input
                  type="number"
                  min={0}
                  max={15}
                  value={graceDays}
                  onChange={(e) => setGraceDays(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-semibold text-slate-900 mt-1"
                />
                <span className="text-[11px] text-slate-500 mt-1">
                  Margem de tolerância antes do disparo do cálculo automático de mora.
                </span>
              </div>

              {/* Desconto de Antecipação */}
              <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Desconto por Pagamento Antecipado</span>
                  <span className="text-[11px] font-mono text-emerald-700 font-bold">{discountPercent}%</span>
                </label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  step={0.5}
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-900 mt-1"
                />
                <span className="text-[11px] text-slate-500 mt-1">
                  Desconto concedido se a liquidação ocorrer até ao dia 05 de cada mês.
                </span>
              </div>
            </div>

            {/* Desconto Familiar / Irmãos */}
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-[#0b1f3a] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-blue-600 text-sm">diversity_3</span>
                  Desconto por Agregado Familiar (Irmãos Matriculados)
                </h4>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Redução aplicada a partir do 2.º educando com mesmo encarregado de educação.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={siblingDiscountPercent}
                  onChange={(e) => setSiblingDiscountPercent(Math.max(0, Number(e.target.value)))}
                  className="w-24 px-3 py-1.5 text-sm bg-white border border-blue-300 rounded-lg font-bold text-blue-900 text-center"
                />
                <span className="text-xs font-bold text-blue-900">%</span>
              </div>
            </div>
          </div>

          {/* Card: Restrições & Bloqueios Administrativos */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col gap-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-600 text-lg">gavel</span>
                Restrições por Inadimplência
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Diretrizes de secretaria e conformidade legal MED.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  checked={blockCertificatesWithDebt}
                  onChange={(e) => setBlockCertificatesWithDebt(e.target.checked)}
                  className="mt-1 rounded text-[#0b1f3a] focus:ring-[#0b1f3a] h-4 w-4"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Bloquear Emissão de Certificados & Declarações
                  </span>
                  <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                    Impede a geração de novos certificados para alunos com saldo devedor em aberto.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  checked={allowPartialPayments}
                  onChange={(e) => setAllowPartialPayments(e.target.checked)}
                  className="mt-1 rounded text-[#0b1f3a] focus:ring-[#0b1f3a] h-4 w-4"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Permitir Pagamentos Parciais (Amortização)
                  </span>
                  <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                    Permite ao encarregado abater valores inferiores ao total da mensalidade.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  checked={blockExamsWithDebt}
                  onChange={(e) => setBlockExamsWithDebt(e.target.checked)}
                  className="mt-1 rounded text-rose-600 focus:ring-rose-500 h-4 w-4"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Aviso Prévio em Época de Exames
                  </span>
                  <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                    Exibe alerta de situação irregular nas folhas de chamada das provas trimestrais.
                  </span>
                </div>
              </label>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/70 text-amber-900 text-xs">
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <span className="material-symbols-outlined text-amber-700 text-sm">info</span>
                Regulamento Escolar MED
              </div>
              De acordo com a Lei de Bases do Sistema de Educação e Ensino de Angola, o atraso no pagamento de propinas não pode impedir o estudante de assistir às aulas presenciais regulares.
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: TABELA DE PROPINAS POR NÍVEL / CICLO */}
      {activeSubSection === 'tabela' && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-lg">price_check</span>
                Tabela Oficial de Mensalidades por Nível de Ensino (Angola)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Valores base em Kwanzas (Kz) para matrícula, confirmação e mensalidade regular de cada ciclo.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
              Moeda: <strong>Kwanzas (Kz / AOA)</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Subsistema / Nível de Ensino</th>
                  <th className="py-3.5 px-4">Classes / Abrangência</th>
                  <th className="py-3.5 px-4 text-right">Matrícula (Kz)</th>
                  <th className="py-3.5 px-4 text-right">Confirmação (Kz)</th>
                  <th className="py-3.5 px-4 text-right">Propina Mensal (Kz)</th>
                  <th className="py-3.5 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tuitionRows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-xs">{row.levelName}</div>
                      <div className="text-[11px] text-slate-500">{row.cycle}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                        {row.grades}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <input
                        type="number"
                        min={0}
                        step={500}
                        value={row.matriculaKz}
                        onChange={(e) => handleUpdateTuitionRow(row.id, 'matriculaKz', Number(e.target.value))}
                        className="w-28 px-2.5 py-1 text-right bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <input
                        type="number"
                        min={0}
                        step={500}
                        value={row.confirmacaoKz}
                        onChange={(e) => handleUpdateTuitionRow(row.id, 'confirmacaoKz', Number(e.target.value))}
                        className="w-28 px-2.5 py-1 text-right bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <input
                        type="number"
                        min={0}
                        step={500}
                        value={row.monthlyTuitionKz}
                        onChange={(e) => handleUpdateTuitionRow(row.id, 'monthlyTuitionKz', Number(e.target.value))}
                        className="w-32 px-2.5 py-1 text-right bg-emerald-50 border border-emerald-300 rounded-lg text-xs font-bold text-emerald-900 focus:ring-1 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="text-[11px] text-slate-400 font-mono">
                        {formatKz(row.monthlyTuitionKz)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="text-xs text-slate-600">
              Estes valores serão aplicados automaticamente ao matricular novos alunos e na emissão em lote das faturas mensais do ano letivo <strong>{settings.currentAcademicYear || '2024/2025'}</strong>.
            </div>
            <button
              type="button"
              onClick={handleSaveAllFinancial}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
            >
              Aplicar Tabela
            </button>
          </div>
        </div>
      )}

      {/* SECTION 3: CONTAS BANCÁRIAS & COORDENADAS IBAN */}
      {activeSubSection === 'bancos' && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600 text-lg">account_balance</span>
                Contas Bancárias & Coordenadas para Depósito / Transferência
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Coordenadas impressas nas faturas-recibo e disponibilizadas aos encarregados para liquidação de propinas (Bancos de Angola).
              </p>
            </div>
            <button
              type="button"
              id="btn-add-bank-account"
              onClick={() => setShowAddBankModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0b1f3a] hover:bg-[#15345d] text-white text-xs font-bold rounded-xl transition-all shadow-xs"
            >
              <span className="material-symbols-outlined text-base">add</span>
              Nova Conta Bancária
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {bankAccounts.map((bank) => (
              <div
                key={bank.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                  bank.active
                    ? 'bg-slate-50/70 border-slate-300 shadow-xs'
                    : 'bg-slate-100/50 border-slate-200 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-sm text-[#0b1f3a] flex items-center gap-2">
                      <span className="material-symbols-outlined text-indigo-700 text-lg">account_balance</span>
                      {bank.bankName}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleBank(bank.id)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        bank.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {bank.active ? 'Em Uso' : 'Inativo'}
                    </button>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block">Titular da Conta</span>
                      <span className="font-medium text-slate-800">{bank.accountHolder}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block">Número de Conta</span>
                      <span className="font-mono font-bold text-slate-800">{bank.accountNumber}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block">IBAN Oficial (Angola)</span>
                      <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md inline-block">
                        {bank.iban}
                      </span>
                    </div>
                    {bank.multicaixaEntity && (
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase block">Entidade Multicaixa</span>
                        <span className="font-mono font-bold text-slate-700">{bank.multicaixaEntity}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => handleDeleteBank(bank.id)}
                    className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 5: REGIME FISCAL & ENQUADRAMENTO AGT */}
      {activeSubSection === 'fiscal' && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col gap-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-700 text-lg">verified</span>
              Regime Fiscal, Isenção de IVA & Conformidade AGT
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Parâmetros para faturamento eletrónico, relatórios SAF-T (AO) e certificação de software de gestão escolar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Enquadramento em Imposto sobre o Valor Acrescentado (IVA)
              </h4>
              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex justify-between py-1.5 border-b border-slate-200">
                  <span className="text-slate-500">Regime Geral da Escola:</span>
                  <span className="font-bold text-emerald-800">Isenção Legal (Art. 12.º do CIVA)</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-200">
                  <span className="text-slate-500">Código de Motivo de Isenção:</span>
                  <span className="font-mono font-bold text-slate-800">M02 - Isento Artigo 12.º do CIVA</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-200">
                  <span className="text-slate-500">NIF da Instituição:</span>
                  <span className="font-mono font-bold text-slate-900">{settings.nif || '5417089901'}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Moeda Base de Emissão:</span>
                  <span className="font-bold text-slate-800">AOA (Kwanzas)</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-indigo-50/50 border border-indigo-200 space-y-3">
              <div className="flex items-center gap-2 text-indigo-950 font-bold text-xs">
                <span className="material-symbols-outlined text-indigo-700 text-lg">shield_locked</span>
                Certificação de Faturação & Auditoria
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                As faturas-recibo de propinas e emolumentos emitidas pelo BandMed possuem hash criptográfico, numeração sequencial cronológica ininterrupta e conformidade com as diretrizes da Administração Geral Tributária (AGT) da República de Angola.
              </p>
              <div className="p-3 bg-white rounded-lg border border-indigo-100 text-[11px] text-slate-600">
                <strong>Nota de Emissão:</strong> Cada documento gerado traz expressamente a menção: <em>"Isento de IVA nos termos do Artigo 12.º do CIVA - Educação e Ensino".</em>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Adicionar Conta Bancária */}
      {showAddBankModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-700 text-lg">account_balance</span>
                Adicionar Conta Bancária Institucional
              </h3>
              <button
                type="button"
                onClick={() => setShowAddBankModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleAddBank} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nome do Banco *</label>
                <input
                  type="text"
                  required
                  value={newBankName}
                  onChange={(e) => setNewBankName(e.target.value)}
                  placeholder="Ex: Banco Angolano de Investimentos (BAI)"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Titular da Conta</label>
                <input
                  type="text"
                  value={newBankHolder}
                  onChange={(e) => setNewBankHolder(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Número de Conta</label>
                <input
                  type="text"
                  value={newBankAccountNumber}
                  onChange={(e) => setNewBankAccountNumber(e.target.value)}
                  placeholder="Ex: 5544332211"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">IBAN Oficial (Angola - AO06...) *</label>
                <input
                  type="text"
                  required
                  value={newBankIban}
                  onChange={(e) => setNewBankIban(e.target.value)}
                  placeholder="AO06.0040.0000.1122.3344.5501.2"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono font-semibold focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Entidade Multicaixa (Opcional)</label>
                <input
                  type="text"
                  value={newBankEntity}
                  onChange={(e) => setNewBankEntity(e.target.value)}
                  placeholder="Ex: 00342"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 mt-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddBankModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-[#0b1f3a] text-white rounded-lg hover:bg-[#15345d]"
                >
                  Salvar Conta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
