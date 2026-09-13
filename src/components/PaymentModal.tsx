import React, { useState, useMemo } from 'react';
import { SchoolDatabase, Student, TuitionInvoice, InvoiceItem, SchoolServiceItem } from '../types';
import { dbService } from '../services/db';
import { runGlobalOperation, AsyncButton } from '../context/OperationContext';

interface PaymentModalProps {
  db: SchoolDatabase;
  onClose: () => void;
  onSuccess: (invoice: TuitionInvoice) => void;
  onOpenServicesCatalog?: () => void;
}

const MONTHS_LIST = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

interface CartItem {
  id: string;
  code: string;
  name: string;
  priceKz: number;
  quantity: number;
  periodRef: string;
  taxRegime: string;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  db,
  onClose,
  onSuccess,
  onOpenServicesCatalog
}) => {
  const students = db.students || [];
  const servicesCatalog: SchoolServiceItem[] = dbService.getServices();
  const currentUser = dbService.getCurrentUser();

  // Selected student
  const defaultStudent = students.find((s) => s.name.includes('Afonso')) || students[0];
  const [selectedStudentId, setSelectedStudentId] = useState<string>(defaultStudent ? String(defaultStudent.id) : '');
  const [studentSearch, setStudentSearch] = useState('');

  // Tuition months
  const [includeTuition, setIncludeTuition] = useState<boolean>(true);
  const currentMonthName = 'Setembro';
  const [selectedMonths, setSelectedMonths] = useState<string[]>([currentMonthName]);

  // Outros Emolumentos e Serviços (Shopping Cart)
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 'cart-init-1',
      code: 'CAD-AVAL',
      name: 'Caderno de Encargos e Avaliação',
      priceKz: 5000,
      quantity: 1,
      periodRef: 'Ano 2026',
      taxRegime: 'Isento (Art. 12 CIVA)'
    },
    {
      id: 'cart-init-2',
      code: 'SEG-ESC',
      name: 'Seguro Escolar Anual Obrigatório',
      priceKz: 4500,
      quantity: 1,
      periodRef: 'Ano 2026',
      taxRegime: 'Isento (Art. 12 CIVA)'
    }
  ]);

  // Inputs for adding a service
  const [serviceInputName, setServiceInputName] = useState<string>('');
  const [serviceInputValue, setServiceInputValue] = useState<number | string>(3500);
  const [serviceInputCode, setServiceInputCode] = useState<string>('EMOL-01');

  // Automatic Transaction Number
  const [autoTransactionNumber] = useState<string>(() => dbService.getNextTransactionNumber());

  // Payment details
  const [paymentMethod, setPaymentMethod] = useState<'tpa' | 'mcx' | 'debito' | 'numerario'>('tpa');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedStudent = useMemo(() => {
    return students.find((s) => String(s.id) === String(selectedStudentId)) || students[0];
  }, [students, selectedStudentId]);

  const monthlyTuition = selectedStudent?.monthlyTuitionKz || 35000;

  // Filtered student list
  const filteredStudents = useMemo(() => {
    if (!studentSearch.trim()) return students;
    const term = studentSearch.toLowerCase();
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        (s.procNumber && s.procNumber.toLowerCase().includes(term)) ||
        (s.className && s.className.toLowerCase().includes(term))
    );
  }, [students, studentSearch]);

  const toggleMonth = (m: string) => {
    if (selectedMonths.includes(m)) {
      if (selectedMonths.length > 1) {
        setSelectedMonths(selectedMonths.filter((item) => item !== m));
      }
    } else {
      setSelectedMonths([...selectedMonths, m]);
    }
  };

  // Handle service selection from catalog dropdown/datalist
  const handleSelectCatalogService = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const val = e.target.value;
    setServiceInputName(val);
    const found = servicesCatalog.find(
      (s) => s.name.toLowerCase() === val.toLowerCase() || s.code.toLowerCase() === val.toLowerCase()
    );
    if (found) {
      setServiceInputValue(found.defaultPriceKz);
      setServiceInputCode(found.code);
    }
  };

  // Quick add from catalog pill
  const handleQuickAddService = (srv: SchoolServiceItem) => {
    const existingIndex = cartItems.findIndex((c) => c.code === srv.code || c.name === srv.name);
    if (existingIndex >= 0) {
      // Increase quantity
      setCartItems((prev) =>
        prev.map((item, idx) => (idx === existingIndex ? { ...item, quantity: item.quantity + 1 } : item))
      );
    } else {
      const newItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        code: srv.code,
        name: srv.name,
        priceKz: srv.defaultPriceKz,
        quantity: 1,
        periodRef: '2026',
        taxRegime: srv.taxRegime || 'Isento (Art. 12 CIVA)'
      };
      setCartItems((prev) => [...prev, newItem]);
    }
  };

  // Add custom or catalog service from text box
  const handleAddToCart = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!serviceInputName.trim()) return;

    const numVal = Math.max(0, Number(serviceInputValue) || 0);
    const matchedService = servicesCatalog.find(
      (s) => s.name.toLowerCase() === serviceInputName.trim().toLowerCase()
    );

    const newItem: CartItem = {
      id: `cart-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      code: matchedService?.code || serviceInputCode || `EMOL-${Math.floor(10 + Math.random() * 90)}`,
      name: serviceInputName.trim(),
      priceKz: numVal,
      quantity: 1,
      periodRef: '2026',
      taxRegime: matchedService?.taxRegime || 'Isento (Art. 12 CIVA)'
    };

    setCartItems((prev) => [...prev, newItem]);
    setServiceInputName('');
    setServiceInputValue(3500);
    setServiceInputCode(`EMOL-${Math.floor(10 + Math.random() * 90)}`);
  };

  const handleUpdateCartQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Totals calculations
  const tuitionTotal = includeTuition ? monthlyTuition * selectedMonths.length : 0;
  const servicesTotal = cartItems.reduce((sum, item) => sum + item.priceKz * item.quantity, 0);
  const subtotal = tuitionTotal + servicesTotal;
  const stampDuty = Math.round(subtotal * 0.001); // Imposto de Selo (0.1%)
  const grandTotal = subtotal + stampDuty;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Build Invoice Items
    const items: InvoiceItem[] = [];

    if (includeTuition && selectedMonths.length > 0) {
      items.push({
        code: 'PROP-ESC',
        description: `Propinas Escolares Regulares (${selectedMonths.join(', ')})`,
        periodOrRef: `${selectedMonths.join(', ')} / 2026`,
        unitPriceKz: monthlyTuition,
        quantity: selectedMonths.length,
        discountKz: 0,
        taxRegime: 'Isento (Art. 12 CIVA)',
        liquidTotalKz: tuitionTotal
      });
    }

    cartItems.forEach((c) => {
      items.push({
        code: c.code,
        description: c.name,
        periodOrRef: c.periodRef,
        unitPriceKz: c.priceKz,
        quantity: c.quantity,
        discountKz: 0,
        taxRegime: c.taxRegime,
        liquidTotalKz: c.priceKz * c.quantity
      });
    });

    const methodLabels: Record<string, string> = {
      tpa: 'TPA Multicaixa / Caixa Geral',
      mcx: 'Multicaixa Express (MCX)',
      debito: 'Depósito / Transferência Bancária',
      numerario: 'Numerário / Dinheiro em Mão'
    };

    const currentYear = new Date().getFullYear();
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const formattedCurrentDate = `${day}/${month}/${currentYear}`;
    const nextInvNumber = dbService.getNextInvoiceNumber();
    const receiptNum = `RC ${currentYear}/${nextInvNumber.replace(`FT ${currentYear}/`, '')}`;
    const operatorString = `${currentUser.name} (${currentUser.roleTitle || 'Operador de Caixa'})`;

    const invoiceData: Partial<TuitionInvoice> & { studentId: string; totalAmountKz: number } = {
      invoiceNumber: nextInvNumber,
      studentId: String(selectedStudent.id),
      studentName: selectedStudent.name,
      procNumber: selectedStudent.procNumber || '0000',
      avatar: selectedStudent.avatar,
      className: selectedStudent.className || '10ª Classe - Turno Matutino',
      guardianName: selectedStudent.guardianName || 'Encarregado de Educação',
      guardianNif: selectedStudent.guardianNif || '241890112',
      guardianPhone: selectedStudent.guardianPhone || '+244 923 000 000',
      guardianAddress: selectedStudent.address || 'Luanda, Angola',
      studentBiNumber: selectedStudent.biNumber || '008912340BA042',
      operatorName: operatorString,
      description: `Liquidação de ${items.map((i) => i.description.split('(')[0].trim()).join(' + ')}`,
      period: selectedMonths.length > 0 ? selectedMonths.join(', ') : 'Março 2026',
      dueDate: formattedCurrentDate,
      totalAmountKz: grandTotal,
      baseAmountKz: subtotal,
      lateFeeKz: 0,
      status: 'pago',
      daysLate: 0,
      method: paymentMethod,
      methodLabel: methodLabels[paymentMethod] || 'TPA Multicaixa',
      bankName: 'Caixa Central / Tesouraria Escolar',
      transactionNumber: autoTransactionNumber,
      paymentDate: formattedCurrentDate,
      receiptNumber: receiptNum,
      receiptGeneratedAt: `${formattedCurrentDate} ${new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}`,
      saftHash: '4hB9-xK29-91La-qP40',
      items: items,
      subtotalKz: subtotal,
      discountName: 'Sem Desconto',
      discountAmountKz: 0,
      stampDutyKz: stampDuty,
      totalPaidKz: grandTotal,
      selectedMonths: selectedMonths
    };

    try {
      await runGlobalOperation(
        async () => {
          const created = dbService.recordFullPaymentInvoice(invoiceData);
          setIsSubmitting(false);
          onSuccess(created);
        },
        {
          loadingMessage: 'A processar pagamento e emitir recibo...',
          successMessage: 'Operação feita com sucesso!'
        }
      );
    } catch (err) {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-6 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div className="bg-white rounded-none max-w-4xl w-full shadow-2xl border border-slate-400 overflow-hidden flex flex-col max-h-[95vh]">
        {/* HEADER */}
        <div className="px-6 py-4 bg-[#0b1f3a] text-white flex items-center justify-between border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-none bg-white/10 flex items-center justify-center text-white border border-white/20">
              <span className="material-symbols-outlined text-[24px]">point_of_sale</span>
            </div>
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wider">
                Registo de Pagamento de Propinas & Serviços
              </h3>
              <p className="text-[11px] text-blue-200">
                Emissão de Recibo Oficial Certificado com N.º de Transação Sequencial
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-300 hover:text-white hover:bg-white/10 p-1 cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* FORM CONTAINER */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs bg-white">
          {/* SEÇÃO 1: SELEÇÃO E DADOS DO ALUNO */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-300 pb-1.5">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[17px] text-[#0b1f3a]">person_search</span>
                1. Seleção do Estudante
              </span>
              <span className="text-[11px] text-slate-500">
                Total de Alunos Matriculados: <strong>{students.length}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="relative">
                <label className="block font-bold text-slate-700 mb-1 text-[11px] uppercase">
                  Pesquisar por Nome, Turma ou Processo:
                </label>
                <div className="relative flex items-center border border-slate-400/30 bg-slate-50/60 rounded-none focus-within:border-slate-400/70 focus-within:bg-white transition-colors">
                  <span className="material-symbols-outlined ml-2.5 text-slate-400 text-[18px] shrink-0">
                    search
                  </span>
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Digite para filtrar estudantes..."
                    className="w-full h-8 pl-2 pr-3 bg-transparent border-0 border-none outline-none focus:ring-0 text-slate-800 text-xs placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 text-[11px] uppercase">
                  Aluno Selecionado para Pagamento *
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full h-8 px-3 bg-white border border-slate-300 text-slate-900 font-bold focus:border-[#0b1f3a] focus:outline-none"
                >
                  {filteredStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — Turma: {s.className || 'Sem Turma'} (Proc: {s.procNumber || 'S/N'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selected Student Information Card */}
            {selectedStudent && (
              <div className="p-3.5 bg-slate-50 border border-slate-300 flex flex-wrap items-center gap-4">
                <img
                  src={selectedStudent.avatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150'}
                  alt={selectedStudent.name}
                  className="w-12 h-14 object-cover border border-[#0b1f3a] shrink-0"
                />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1 text-xs flex-1">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Nome Completo:</span>
                    <strong className="text-slate-900 font-bold">{selectedStudent.name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Turma / Turno:</span>
                    <span className="font-semibold text-slate-800">{selectedStudent.className || '10ª Classe'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Bilhete de Identidade (BI):</span>
                    <span className="font-mono font-bold text-slate-800">{selectedStudent.biNumber || '008912340BA042'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Propina Mensal Base:</span>
                    <span className="font-mono font-bold text-[#0b1f3a]">
                      {monthlyTuition.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} Kz
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SEÇÃO 2: PROPINAS ESCOLARES (MENSALIDADES) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-300 pb-1.5">
              <label className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeTuition}
                  onChange={(e) => setIncludeTuition(e.target.checked)}
                  className="w-4 h-4 accent-[#0b1f3a] rounded-none cursor-pointer"
                />
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[17px] text-[#0b1f3a]">calendar_month</span>
                  2. Propinas Escolares (Mensalidades)
                </span>
              </label>
              {includeTuition && (
                <span className="font-mono font-bold text-[#0b1f3a] text-xs">
                  {selectedMonths.length} Mês(es) = {tuitionTotal.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} Kz
                </span>
              )}
            </div>

            {includeTuition && (
              <div className="p-3.5 bg-slate-50 border border-slate-300 space-y-2">
                <p className="text-slate-600 text-[11px]">
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {MONTHS_LIST.map((m) => {
                    const isSelected = selectedMonths.includes(m);
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => toggleMonth(m)}
                        className={`h-9 px-2 text-xs font-bold border transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                          isSelected
                            ? 'bg-[#0b1f3a] text-white border-[#0b1f3a]'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {isSelected && <span className="material-symbols-outlined text-[14px]">check</span>}
                        <span>{m}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* SEÇÃO 3: OUTROS EMOLUMENTOS E SERVIÇOS (COM CARRINHO DE COMPRAS) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-300 pb-1.5">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[17px] text-[#0b1f3a]">shopping_cart</span>
                3. Outros Emolumentos e Serviços
              </span>

              {onOpenServicesCatalog && (
                <button
                  type="button"
                  onClick={onOpenServicesCatalog}
                  className="text-xs text-[#0b1f3a] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px]">settings</span>
                  <span>Gerir Catálogo de Serviços</span>
                </button>
              )}
            </div>

            {/* Input Box to type service name and value */}
            <div className="p-3.5 bg-slate-50 border border-slate-300 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                <div className="sm:col-span-7">
                  <label className="block uppercase font-bold text-slate-700 mb-1 text-[11px]">
                    Nome ou Descrição do Serviço / Emolumento
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      list="services-catalog-list"
                      value={serviceInputName}
                      onChange={handleSelectCatalogService}
                      placeholder="Ex: Declaração de Frequência, Bata de Laboratório, etc..."
                      className="w-full h-9 px-3 bg-white border border-slate-300 text-slate-900 font-semibold focus:border-[#0b1f3a] focus:outline-none"
                    />
                    <datalist id="services-catalog-list">
                      {servicesCatalog.map((s) => (
                        <option key={s.id} value={s.name}>
                          {s.name} ({s.defaultPriceKz.toLocaleString('pt-PT')} Kz)
                        </option>
                      ))}
                    </datalist>
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label className="block uppercase font-bold text-slate-700 mb-1 text-[11px]">
                    Valor do Serviço (Kz)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={serviceInputValue}
                    onChange={(e) => setServiceInputValue(e.target.value)}
                    className="w-full h-9 px-3 bg-white border border-slate-300 font-mono font-bold text-slate-900 focus:border-[#0b1f3a] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <button
                    type="button"
                    onClick={() => handleAddToCart()}
                    className="w-full h-9 bg-[#0b1f3a] hover:bg-[#7a0c0c] text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors border border-[#0b1f3a]"
                  >
                    <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span>
                    <span>Adicionar</span>
                  </button>
                </div>
              </div>

              {/* Shopping Cart Table of Added Services */}
              <div className="mt-3 border border-slate-300 bg-white">
                <div className="px-3 py-2 bg-slate-100 border-b border-slate-300 flex items-center justify-between font-bold text-slate-700 text-[11px] uppercase">
                  <span>Carrinho de Serviços Selecionados ({cartItems.length})</span>
                  <span className="font-mono text-[#0b1f3a]">
                    Total Serviços: {servicesTotal.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} Kz
                  </span>
                </div>

                {cartItems.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 italic">
                    Nenhum emolumento ou serviço adicional adicionado ao carrinho.
                  </div>
                ) : (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                        <th className="p-2 w-20">Código</th>
                        <th className="p-2">Descrição do Serviço</th>
                        <th className="p-2 w-24 text-center">Qtd</th>
                        <th className="p-2 w-32 text-right">Preço Unit. (Kz)</th>
                        <th className="p-2 w-32 text-right">Total (Kz)</th>
                        <th className="p-2 w-14 text-center">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {cartItems.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="p-2 font-mono font-bold text-[#0b1f3a]">{item.code}</td>
                          <td className="p-2 font-medium text-slate-900">{item.name}</td>
                          <td className="p-2 text-center">
                            <div className="inline-flex items-center border border-slate-300 bg-white">
                              <button
                                type="button"
                                onClick={() => handleUpdateCartQuantity(item.id, -1)}
                                className="px-1.5 py-0.5 text-slate-600 hover:bg-slate-100 cursor-pointer font-bold"
                              >
                                -
                              </button>
                              <span className="px-2 font-mono font-bold">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => handleUpdateCartQuantity(item.id, 1)}
                                className="px-1.5 py-0.5 text-slate-600 hover:bg-slate-100 cursor-pointer font-bold"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="p-2 text-right font-mono text-slate-800">
                            {item.priceKz.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} Kz
                          </td>
                          <td className="p-2 text-right font-mono font-bold text-[#0b1f3a]">
                            {(item.priceKz * item.quantity).toLocaleString('pt-PT', { minimumFractionDigits: 2 })} Kz
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveFromCart(item.id)}
                              className="text-slate-400 hover:text-red-700 p-1 cursor-pointer"
                              title="Remover do Carrinho"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* SEÇÃO 4: DETALHES DE LIQUIDAÇÃO & DADOS DO OPERADOR */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-300 pb-1.5">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[17px] text-[#0b1f3a]">account_balance_wallet</span>
                4. Dados de Liquidação & Caixa
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block uppercase font-bold text-slate-700 mb-1 text-[11px]">
                  N.º de Transação
                </label>
                <div className="h-9 px-3 bg-slate-100 border border-slate-300 font-mono font-bold text-[#0b1f3a] flex items-center justify-between">
                  <span>{autoTransactionNumber}</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-800 font-bold">
                  </span>
                </div>
              </div>

              <div>
                <label className="block uppercase font-bold text-slate-700 mb-1 text-[11px]">
                  Operador de Caixa
                </label>
                <div className="h-9 px-3 bg-slate-100 border border-slate-300 font-bold text-slate-800 flex items-center truncate">
                  {currentUser.name} ({currentUser.roleTitle || 'Secretaria Geral'})
                </div>
              </div>

              <div>
                <label className="block uppercase font-bold text-slate-700 mb-1 text-[11px]">
                  Data do Pagamento *
                </label>
                <input
                  type="date"
                  required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full h-9 px-3 bg-white border border-slate-300 font-semibold text-slate-800 focus:border-[#0b1f3a] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block uppercase font-bold text-slate-700 mb-1 text-[11px]">
                  Forma de Pagamento
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'tpa', label: 'TPA Multicaixa', icon: 'credit_card' },
                    { id: 'mcx', label: 'Multicaixa Express', icon: 'smartphone' },
                    { id: 'debito', label: 'Depósito Bancário', icon: 'account_balance' },
                    { id: 'numerario', label: 'Numerário / Caixa', icon: 'payments' }
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`h-9 px-2 text-xs font-bold border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        paymentMethod === m.id
                          ? 'bg-[#0b1f3a] text-white border-[#0b1f3a]'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">{m.icon}</span>
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* QUADRO DE RESUMO FINANCEIRO */}
          <div className="flex flex-col sm:flex-row justify-end items-end pt-2">
            <div className="w-full sm:w-80 bg-slate-50 border border-slate-300 p-3.5 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Propinas:</span>
                <span className="font-mono font-semibold">
                  {tuitionTotal.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} Kz
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Serviços / Emolumentos:</span>
                <span className="font-mono font-semibold">
                  {servicesTotal.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} Kz
                </span>
              </div>
              <div className="flex justify-between text-slate-600 border-b border-slate-200 pb-2">
                <span>Imposto de Selo Legal (0.1%):</span>
                <span className="font-mono">
                  {stampDuty.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} Kz
                </span>
              </div>
              <div className="flex justify-between items-center text-[#0b1f3a] pt-1">
                <span className="font-black text-xs uppercase tracking-wider">TOTAL A LIQUIDAR:</span>
                <span className="font-mono font-black text-base">
                  {grandTotal.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} Kz
                </span>
              </div>
            </div>
          </div>

          {/* ACTIONS FOOTER */}
          <div className="pt-4 flex items-center justify-between border-t border-slate-300">
            <div className="text-slate-500 text-[11px]">
              O recibo de quitação fiscal será emitido logo após a confirmação.
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs cursor-pointer border border-slate-300"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSubmitting || grandTotal <= 0}
                className="px-6 py-2 bg-[#0b1f3a] hover:bg-[#7a0c0c] text-white font-bold text-xs cursor-pointer transition-colors border border-[#0b1f3a] flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>A Processar Pagamento...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">receipt</span>
                    <span>PAGAR</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
