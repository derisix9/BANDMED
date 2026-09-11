import React, { useState } from 'react';
import { SchoolDatabase, TuitionFee, UserRole } from '../types';
import { dbService } from '../services/db';

interface PropinasViewProps {
  db: SchoolDatabase;
  currentUserRole: UserRole;
}

export const PropinasView: React.FC<PropinasViewProps> = ({ db, currentUserRole }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedFeeForReceipt, setSelectedFeeForReceipt] = useState<TuitionFee | null>(null);

  // Form State
  const [newInvoiceData, setNewInvoiceData] = useState({
    studentId: db.students[0]?.id.toString() || '1',
    period: 'Dezembro 2024',
    description: 'Propina Mensal - Dezembro 2024',
    amountKz: 95000,
    dueDate: '2024-12-08'
  });

  const feesList = db.tuitionFees || db.invoices || [];

  const filteredFees = feesList.filter((fee) => {
    const student = db.students.find((s) => s.id === fee.studentId);
    const matchesSearch =
      fee.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fee.period.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student && student.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || fee.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // KPI Calculations
  const totalBilledKz = feesList.reduce((acc, f) => acc + f.totalAmountKz, 0);
  const totalPaidKz = feesList
    .filter((f) => f.status === 'pago')
    .reduce((acc, f) => acc + f.totalAmountKz, 0);
  const totalLateKz = feesList
    .filter((f) => f.status === 'atraso')
    .reduce((acc, f) => acc + f.totalAmountKz, 0);
  const totalPendingKz = feesList
    .filter((f) => f.status === 'pendente')
    .reduce((acc, f) => acc + f.totalAmountKz, 0);

  const handleMarkAsPaid = (feeId: number) => {
    const receiptNum = `RC 2024/${Math.floor(1400 + Math.random() * 500)}`;
    dbService.updateTuitionFee(feeId, {
      status: 'pago',
      paymentDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
      receiptNumber: receiptNum,
      method: 'mcx'
    });
    alert(`Pagamento registado com sucesso! Recibo ${receiptNum} gerado.`);
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const invNum = `FT 2024/${Math.floor(2100 + Math.random() * 900)}`;
    const randomRef = `${Math.floor(100 + Math.random() * 900)} ${Math.floor(100 + Math.random() * 900)} ${Math.floor(100 + Math.random() * 900)}`;

    dbService.addTuitionFee({
      studentId: Number(newInvoiceData.studentId),
      invoiceNumber: invNum,
      period: newInvoiceData.period,
      description: newInvoiceData.description,
      baseAmountKz: Number(newInvoiceData.amountKz),
      lateFeeKz: 0,
      totalAmountKz: Number(newInvoiceData.amountKz),
      dueDate: newInvoiceData.dueDate,
      status: 'pendente',
      multicaixaEntity: '00192',
      multicaixaRef: randomRef
    });

    setIsInvoiceModalOpen(false);
  };

  return (
    <div className="flex flex-col w-full gap-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
              Tesouraria & Facturação
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#0b1f3a]" />
            <span className="text-xs font-semibold text-[#0b1f3a]">Moeda Nacional (Kwanzas - Kz)</span>
          </div>
          <h1 className="font-headline text-2xl lg:text-3xl font-extrabold text-[#0b1f3a] tracking-tight">
            Gestão de Propinas & Pagamentos
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cobrança de mensalidades escolares, geração de referências Multicaixa Express e emissão de recibos fiscais.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentUserRole === 'admin' && (
            <button
              onClick={() => setIsInvoiceModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#0b1f3a] hover:bg-[#7a0c0c] text-white font-bold text-xs flex items-center gap-2 transition-all shadow-sm shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">add_card</span>
              <span>+ Emitir Mensalidade / Fatura</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Faturado</span>
          <div className="font-headline text-2xl font-extrabold text-[#0b1f3a] mt-1">
            {totalBilledKz.toLocaleString()} <span className="text-xs text-slate-500">Kz</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-2">
            {feesList.length} faturas emitidas
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200">
          <span className="text-[10px] uppercase font-bold text-emerald-700 block">Total Cobrado (Liquidado)</span>
          <div className="font-headline text-2xl font-extrabold text-emerald-700 mt-1">
            {totalPaidKz.toLocaleString()} <span className="text-xs">Kz</span>
          </div>
          <span className="text-[11px] text-emerald-800 font-semibold block mt-2">
            {Math.round((totalPaidKz / totalBilledKz) * 100 || 0)}% taxa de cobrança
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200">
          <span className="text-[10px] uppercase font-bold text-[#7a0c0c] block">Em Atraso (Mora Ativa)</span>
          <div className="font-headline text-2xl font-extrabold text-[#7a0c0c] mt-1">
            {totalLateKz.toLocaleString()} <span className="text-xs">Kz</span>
          </div>
          <span className="text-[11px] text-[#7a0c0c] font-semibold block mt-2">
            Sujeito a juros regulamentares
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200">
          <span className="text-[10px] uppercase font-bold text-amber-700 block">Pendente (A Vencer)</span>
          <div className="font-headline text-2xl font-extrabold text-amber-700 mt-1">
            {totalPendingKz.toLocaleString()} <span className="text-xs">Kz</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-2">
            Vencimento até 28 de cada mês
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por fatura, período ou nome do aluno..."
            className="w-full h-9 pl-9 pr-3 rounded-lg bg-slate-100 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#0b1f3a]"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-lg bg-slate-100 text-xs font-semibold text-slate-700 border-0 focus:ring-1 focus:ring-[#0b1f3a]"
          >
            <option value="all">Todos os Estados</option>
            <option value="pago">Pagas (Liquidadas)</option>
            <option value="atraso">Em Atraso (Mora)</option>
            <option value="pendente">Pendentes</option>
          </select>
          <span className="text-xs text-slate-400 font-mono">
            {filteredFees.length} faturas
          </span>
        </div>
      </div>

      {/* Tuition Fees Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <th className="py-3.5 px-4">Fatura & Descrição</th>
                <th className="py-3.5 px-3">Aluno & Processo</th>
                <th className="py-3.5 px-3">Período</th>
                <th className="py-3.5 px-3">Total (Kz)</th>
                <th className="py-3.5 px-3">Vencimento</th>
                <th className="py-3.5 px-3">Multicaixa</th>
                <th className="py-3.5 px-3">Estado</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFees.map((fee) => {
                const student = db.students.find((s) => s.id === fee.studentId);

                return (
                  <tr key={fee.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#0b1f3a] font-mono text-xs">{fee.invoiceNumber}</div>
                      <span className="text-slate-500 text-[11px] block">{fee.description}</span>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-slate-800">{student?.name || 'Aluno'}</div>
                      <span className="text-slate-400 font-mono text-[10px]">Proc: #{student?.procNumber}</span>
                    </td>
                    <td className="py-3.5 px-3 font-medium text-slate-700">{fee.period}</td>
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-[#0b1f3a] font-mono text-xs">
                        {fee.totalAmountKz.toLocaleString()} Kz
                      </div>
                      {fee.lateFeeKz > 0 && (
                        <span className="text-[10px] text-[#7a0c0c] block">
                          +{fee.lateFeeKz.toLocaleString()} Kz mora
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-600">{fee.dueDate}</td>
                    <td className="py-3.5 px-3">
                      {fee.multicaixaRef ? (
                        <div className="text-[11px] font-mono">
                          <span className="text-slate-400 block">Ent: {fee.multicaixaEntity}</span>
                          <span className="font-bold text-slate-800">{fee.multicaixaRef}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Balcão</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3">
                      {fee.status === 'pago' ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          PAGO
                        </span>
                      ) : fee.status === 'atraso' ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-[#7a0c0c] font-bold text-[10px]">
                          EM ATRASO
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px]">
                          PENDENTE
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {fee.status !== 'pago' && currentUserRole === 'admin' && (
                          <button
                            onClick={() => handleMarkAsPaid(fee.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs"
                            title="Registar Pagamento Manual / MCX"
                          >
                            <span className="material-symbols-outlined text-[14px]">check_circle</span>
                            <span>Pagar</span>
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedFeeForReceipt(fee)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-[#0b1f3a] hover:bg-slate-100"
                          title="Ver Recibo Fiscal"
                        >
                          <span className="material-symbols-outlined text-[18px]">receipt</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Modal */}
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-[#0b1f3a] text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Emitir Nova Mensalidade Escolar</h3>
              <button onClick={() => setIsInvoiceModalOpen(false)} className="text-slate-400 hover:text-white">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block uppercase font-bold text-slate-600 mb-1">Aluno Beneficiário</label>
                <select
                  value={newInvoiceData.studentId}
                  onChange={(e) => setNewInvoiceData({ ...newInvoiceData, studentId: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg bg-slate-100 text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#0b1f3a]"
                >
                  {db.students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Proc: #{s.procNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase font-bold text-slate-600 mb-1">Mês de Referência</label>
                  <input
                    type="text"
                    required
                    value={newInvoiceData.period}
                    onChange={(e) => setNewInvoiceData({ ...newInvoiceData, period: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg bg-slate-100 text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#0b1f3a]"
                  />
                </div>
                <div>
                  <label className="block uppercase font-bold text-slate-600 mb-1">Valor (Kwanzas)</label>
                  <input
                    type="number"
                    required
                    value={newInvoiceData.amountKz}
                    onChange={(e) => setNewInvoiceData({ ...newInvoiceData, amountKz: Number(e.target.value) })}
                    className="w-full h-9 px-3 rounded-lg bg-slate-100 font-mono font-bold text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#0b1f3a]"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase font-bold text-slate-600 mb-1">Data Limite de Vencimento</label>
                <input
                  type="date"
                  required
                  value={newInvoiceData.dueDate}
                  onChange={(e) => setNewInvoiceData({ ...newInvoiceData, dueDate: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg bg-slate-100 text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#0b1f3a]"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsInvoiceModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0b1f3a] hover:bg-[#7a0c0c] text-white font-bold transition-colors"
                >
                  Emitir Documento Fiscal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {selectedFeeForReceipt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 border border-slate-200">
            <div className="text-center pb-4 border-b border-slate-200">
              <span className="font-extrabold text-[#0b1f3a] font-headline text-lg block">BandMed Core</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                Recibo de Tesouraria Escolar
              </span>
            </div>

            <div className="py-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Documento:</span>
                <strong className="font-mono">{selectedFeeForReceipt.receiptNumber || selectedFeeForReceipt.invoiceNumber}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Beneficiário:</span>
                <strong className="text-[#0b1f3a]">
                  {db.students.find((s) => s.id === selectedFeeForReceipt.studentId)?.name}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Período:</span>
                <span>{selectedFeeForReceipt.period}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Estado:</span>
                <span className="font-bold text-emerald-800 uppercase">{selectedFeeForReceipt.status}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-sm">
                <strong className="text-slate-800">Total Liquidado:</strong>
                <strong className="font-mono text-[#0b1f3a]">
                  {selectedFeeForReceipt.totalAmountKz.toLocaleString()} Kz
                </strong>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-[#0b1f3a] text-white font-bold text-xs flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                <span>Imprimir</span>
              </button>
              <button
                onClick={() => setSelectedFeeForReceipt(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 font-semibold text-xs"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
