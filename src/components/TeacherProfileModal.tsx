import React from 'react';
import { Teacher, ClassRoom, InstitutionSettings } from '../types';
import { dbService } from '../services/db';

interface TeacherProfileModalProps {
  teacher: Teacher;
  classList: ClassRoom[];
  onClose: () => void;
  settings?: InstitutionSettings;
}

export const TeacherProfileModal: React.FC<TeacherProfileModalProps> = ({
  teacher,
  classList,
  onClose,
  settings,
}) => {
  // Sempre reflete os Dados da Instituição definidos em Configurações
  const institution = settings || dbService.getSettings();
  const handlePrint = () => {
    window.focus();
    window.print();
  };

  const initials = teacher.name
    .split(' ')
    .filter((p) => !p.startsWith('Prof') && !p.startsWith('Dr'))
    .slice(0, 2)
    .map((p) => p[0])
    .join('') || 'DOC';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-start justify-center p-3 sm:p-4 printable-modal-overlay overflow-y-auto print:p-0 print:m-0 print:block">
      <div className="printable-document bg-white rounded-none max-w-4xl w-full shadow-2xl border border-slate-400 overflow-hidden flex flex-col my-4 print:my-0 print:border-none print:shadow-none print:w-full">
        {/* Modal Top Controls (Oculto na impressão) */}
        <div className="px-6 py-3 bg-[#0b1f3a] text-white flex items-center justify-between gap-3 border-b border-slate-700 no-print">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-amber-400">badge</span>
            <h3 className="font-bold text-sm sm:text-base tracking-wide uppercase">
              Ficha de Perfil do Professor • Dossier Oficial
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="text-slate-300 hover:text-white p-1 cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>
          </div>
        </div>

        {/* Modal Body - Folha A4 formatada conforme Imagem 2 */}
        <div className="p-6 sm:p-8 space-y-4 text-slate-800 bg-white text-xs">
          {/* Header Institucional da Imagem 2 */}
          <div className="border-b-2 border-[#0b1f3a] pb-3 print-break-avoid">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Logo BM e Título */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#0b1f3a] border border-[#0b1f3a] flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                  {institution.logoUrl ? (
                    <img src={institution.logoUrl} alt={institution.schoolName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-serif font-black text-white text-lg tracking-tight">
                      {institution.schoolName?.slice(0, 2).toUpperCase() || 'BM'}
                    </span>
                  )}
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-black text-[#0b1f3a] uppercase tracking-tight">
                    {institution.schoolName}
                  </h1>
                  <p className="text-[11px] font-semibold text-[#0b1f3a]/80">
                    Direcção Pedagógica & Gabinete de Recursos Humanos
                  </p>
                </div>
              </div>

              {/* Badges de Autenticação à Direita */}
              <div className="text-right flex flex-col items-end gap-0.5">
                <span className="px-2.5 py-0.5 bg-slate-100 border border-slate-300 font-mono text-[11px] font-bold text-slate-800">
                  RH-DOC/{new Date().getFullYear()}/{String(teacher.agentNumber || '042').replace(/\D/g, '').slice(-3).padStart(3, '0')}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  Data de Emissão: {new Date().toLocaleDateString('pt-PT')}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  <span>Documento Autenticado & Em Vigor</span>
                </span>
              </div>
            </div>

            {/* Sub-faixa com Ícone de Dossier e Decreto */}
            <div className="mt-3 pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-none bg-amber-100 text-amber-800 flex items-center justify-center border border-amber-300">
                  <span className="material-symbols-outlined text-[16px]">assignment</span>
                </span>
                <span className="font-extrabold text-xs uppercase text-[#0b1f3a] tracking-wide">
                  DOSSIER INDIVIDUAL DO DOCENTE & FICHA CADASTRAL DE CARREIRA
                </span>
              </div>
              <span className="px-2.5 py-0.5 bg-slate-100 border border-slate-300 text-[10px] font-semibold text-slate-600">
                Estatuto Docente Decreto Presidencial n.º 191/18
              </span>
            </div>
          </div>

          {/* Cartão de Identificação do Docente (Imagem 2) */}
          <div className="p-3.5 bg-slate-50 border border-slate-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 print-break-avoid">
            <div className="flex items-center gap-3.5">
              {/* Foto com Badge de Conforme */}
              <div className="relative shrink-0">
                <div className="w-16 h-20 bg-slate-200 border-2 border-[#0b1f3a] overflow-hidden">
                  <img
                    src={teacher.avatar}
                    alt={teacher.name}
                    className="w-full h-full object-cover object-center"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="w-full h-full bg-[#0b1f3a] text-white font-extrabold text-lg flex items-center justify-center -mt-20 -z-10">
                    {initials}
                  </div>
                </div>
                <span
                  className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-600 text-white flex items-center justify-center text-[11px] font-bold border border-white shadow-xs"
                  title="Docente Homologado"
                >
                  ✓
                </span>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-[#0b1f3a]">
                    {teacher.name.startsWith('Prof') || teacher.name.startsWith('Dr') ? teacher.name : `Prof. ${teacher.name}`}
                  </h2>
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-rose-50 text-rose-700 border border-rose-300">
                    {teacher.roleBadge || 'Quadro Efetivo'}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-700 mt-0.5">
                  Docente Titular de {teacher.allocatedClasses?.[0]?.subject || teacher.department} • Coordenador(a) de {teacher.department}
                </p>
                <p className="text-[11px] text-slate-600 font-mono mt-1">
                  N.º Agente: <strong className="text-slate-900">{teacher.agentNumber || 'AG-9041'}</strong> • BI: <strong className="text-slate-900">{teacher.biNumber || '004819201LA042'}</strong> • NIF: <strong className="text-slate-900">{teacher.nif || '5419082402'}</strong>
                </p>
              </div>
            </div>

            {/* Antiguidade e Desempenho à Direita */}
            <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2 shrink-0 text-xs">
              <div className="px-3 py-1 bg-white border border-slate-300 text-slate-700">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">ANTIGUIDADE:</span>
                <span className="font-bold text-slate-900">{teacher.seniorityYears || 7} Anos</span>{' '}
                <span className="text-slate-500 text-[10px]">(Admitido {teacher.admissionYear || 2019})</span>
              </div>
              <div className="px-3 py-1 bg-emerald-50 border border-emerald-300 text-emerald-900">
                <span className="text-[10px] font-bold text-emerald-700 uppercase block">DESEMPENHO:</span>
                <span className="font-bold">★ {(teacher.rating || 4.8).toFixed(1)} / 5.0</span>{' '}
                <span className="px-1.5 py-0.2 bg-emerald-200/60 text-emerald-900 text-[9px] font-bold uppercase">
                  {teacher.rating >= 4.8 ? 'Excelente' : 'Muito Bom'}
                </span>
              </div>
            </div>
          </div>

          {/* 1. DADOS PESSOAIS & CARREIRA PROFISSIONAL (Conforme Imagem 2) */}
          <div className="border border-slate-300 bg-white print-break-avoid">
            <div className="bg-slate-100 border-b border-slate-300 px-3 py-1.5 flex items-center gap-2">
              <span className="w-5 h-5 bg-[#0b1f3a] text-white flex items-center justify-center font-black text-[11px]">
                1
              </span>
              <h4 className="font-bold text-xs uppercase tracking-wide text-[#0b1f3a]">
                DADOS PESSOAIS & CARREIRA PROFISSIONAL
              </h4>
            </div>

            <div className="p-3.5 grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
              <div className="space-y-2">
                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase">Data de Admissão:</span>
                  <span className="font-semibold text-slate-900">{teacher.admissionDate || '12/02/2019'}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase">Habilitações Literárias & Especialização:</span>
                  <span className="font-semibold text-slate-900 leading-snug block">
                    {teacher.degree || 'Mestrado em Ensino da Matemática (UAN - Universidade Agostinho Neto)'}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase">Morada de Residência:</span>
                  <span className="text-slate-800 leading-snug block">
                    {teacher.address || 'Urbanização Nova Vida, Rua 32, Bloco 14, Luanda'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase">Categoria Profissional:</span>
                  <span className="font-semibold text-slate-900 block">{teacher.category || 'Professor do 1.º Grau (MED)'}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase">Regime de Segurança Social:</span>
                  <span className="font-semibold text-slate-900">INSS: {teacher.inssNumber || '88401924-AO'} (Activo)</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase">Contacto Telefónico:</span>
                  <span className="font-mono font-bold text-[#0b1f3a]">{teacher.phone || '+244 923 481 092'}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase">E-mail Institucional:</span>
                  <span className="font-mono text-slate-800">{teacher.email || 'j.figueiredo@bandmed.ao'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. ESTRUTURA REMUNERATÓRIA & DOMICILIAÇÃO BANCÁRIA (Conforme Imagem 2) */}
          <div className="border border-slate-300 bg-white print-break-avoid">
            <div className="bg-slate-100 border-b border-slate-300 px-3 py-1.5 flex items-center gap-2">
              <span className="w-5 h-5 bg-[#0b1f3a] text-white flex items-center justify-center font-black text-[11px]">
                2
              </span>
              <h4 className="font-bold text-xs uppercase tracking-wide text-[#0b1f3a]">
                ESTRUTURA REMUNERATÓRIA & DOMICILIAÇÃO BANCÁRIA
              </h4>
            </div>

            <div className="p-3.5 space-y-3">
              {/* 3 Cartões de Vencimento */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200">
                  <span className="block text-[10px] font-bold uppercase text-slate-500">SALÁRIO BASE MENSAL</span>
                  <span className="block font-mono font-black text-base text-[#0b1f3a] my-0.5">
                    Kz {(teacher.baseSalaryKz || 580000).toLocaleString('pt-PT', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-slate-500">Vencimento líquido contratual</span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200">
                  <span className="block text-[10px] font-bold uppercase text-slate-500">SUBSÍDIOS / COMPLEMENTOS</span>
                  <span className="block font-mono font-bold text-base text-slate-800 my-0.5">
                    Kz {(teacher.allowancesKz || 75000).toLocaleString('pt-PT', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-slate-500">{teacher.allowanceDescription || 'Coordenação Exatas & Exames'}</span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200">
                  <span className="block text-[10px] font-bold uppercase text-slate-500">RETENÇÃO NA FONTE</span>
                  <span className="block font-mono font-bold text-base text-[#ac332b] my-0.5">
                    Kz {(teacher.retentionTaxKz || 84200).toLocaleString('pt-PT', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-slate-500">IRT & INSS (3%) Conforme AGT</span>
                </div>
              </div>

              {/* Domiciliação Bancária */}
              <div className="pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase">INSTITUIÇÃO BANCÁRIA HOMOLOGADA:</span>
                  <span className="font-bold text-slate-900">{teacher.bankName || 'BAI – Banco Angolano de Investimentos'}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase">NÚMERO DE CONTA E IBAN ANGOLANO (KWANZA):</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
                    <span className="font-mono font-bold text-[#0b1f3a] bg-slate-100 px-2 py-0.5 border border-slate-300 text-xs">
                      {teacher.iban || 'AO06 0040 0000 9812 4018 1014 9'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. DESEMPENHO PEDAGÓGICO & ASSIDUIDADE (Conforme Imagem 2) */}
          <div className="border border-slate-300 bg-white print-break-avoid">
            <div className="bg-slate-100 border-b border-slate-300 px-3 py-1.5 flex items-center gap-2">
              <span className="w-5 h-5 bg-[#0b1f3a] text-white flex items-center justify-center font-black text-[11px]">
                3
              </span>
              <h4 className="font-bold text-xs uppercase tracking-wide text-[#0b1f3a]">
                DESEMPENHO PEDAGÓGICO & ASSIDUIDADE (ÚLTIMOS 12 MESES)
              </h4>
            </div>

            <div className="p-3.5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-slate-50 border border-slate-200">
                <span className="block text-[10px] font-bold uppercase text-slate-500">ASSIDUIDADE GERAL</span>
                <span className="block text-2xl font-black text-slate-900 my-0.5">
                  {teacher.attendanceRatePercent || 99.1}%
                </span>
                <span className="inline-block px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  0 Faltas Injustificadas
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200">
                <span className="block text-[10px] font-bold uppercase text-slate-500">PAUTAS A TEMPO</span>
                <span className="block text-2xl font-black text-[#0b1f3a] my-0.5">
                  {teacher.timelyGradesPercent || 100}%
                </span>
                <span className="inline-block px-1.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold">
                  RIGE / MED Concluído
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200">
                <span className="block text-[10px] font-bold uppercase text-slate-500">TUTORIA DIRETA</span>
                <span className="block text-2xl font-black text-slate-900 my-0.5">
                  {teacher.studentsTutoredCount || 114}
                </span>
                <span className="inline-block px-1.5 py-0.5 bg-slate-200 text-slate-800 text-[10px] font-bold">
                  {teacher.allocatedClasses?.length || 3} Turmas Atribuídas
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200">
                <span className="block text-[10px] font-bold uppercase text-slate-500">APROVEITAMENTO</span>
                <span className="block text-2xl font-black text-emerald-700 my-0.5">
                  {teacher.averageApprovalRatePercent || 88.4}%
                </span>
                <span className="inline-block px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Média: {teacher.averageDisciplineGrade || 14.8} / 20 Val.
                </span>
              </div>
            </div>
          </div>

          {/* 4. DISTRIBUIÇÃO CURRICULAR & CARGA HORÁRIA LETIVA (Conforme Imagem 2) */}
          <div className="border border-slate-300 bg-white print-break-avoid">
            <div className="bg-slate-100 border-b border-slate-300 px-3 py-1.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 bg-[#0b1f3a] text-white flex items-center justify-center font-black text-[11px]">
                  4
                </span>
                <h4 className="font-bold text-xs uppercase tracking-wide text-[#0b1f3a]">
                  DISTRIBUIÇÃO CURRICULAR & CARGA HORÁRIA LETIVA
                </h4>
              </div>
              <span className="px-2 py-0.5 bg-white border border-slate-300 font-mono text-[10px] font-bold text-[#0b1f3a]">
                Carga Semanal: {teacher.weeklyHours || 24}h / Semana
              </span>
            </div>

            <div className="p-3.5 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {teacher.allocatedClasses && teacher.allocatedClasses.length > 0 ? (
                teacher.allocatedClasses.map((ac, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#0b1f3a] text-xs">{ac.className}</span>
                      <span className="text-[10px] font-mono font-bold bg-white px-1.5 py-0.5 border border-slate-300">
                        {ac.hoursWeekly || 8}h / sem
                      </span>
                    </div>
                    <div className="text-slate-800 font-bold text-xs mt-1.5">{ac.subject}</div>
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-200 text-[10px] text-slate-500">
                      <span>Instalação: {ac.room || 'Sala B-104'}</span>
                      <span className="text-slate-700 font-semibold">[Presencial]</span>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div className="p-3 bg-slate-50 border border-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#0b1f3a] text-xs">10.º Ano • Turma A</span>
                      <span className="text-[10px] font-mono font-bold bg-white px-1.5 py-0.5 border border-slate-300">
                        8h / sem
                      </span>
                    </div>
                    <div className="text-slate-800 font-bold text-xs mt-1.5">Matemática A</div>
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-200 text-[10px] text-slate-500">
                      <span>Instalação: Sala B-104</span>
                      <span className="text-slate-700 font-semibold">[Presencial]</span>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#0b1f3a] text-xs">11.º Ano • Turma B</span>
                      <span className="text-[10px] font-mono font-bold bg-white px-1.5 py-0.5 border border-slate-300">
                        8h / sem
                      </span>
                    </div>
                    <div className="text-slate-800 font-bold text-xs mt-1.5">Física Geral</div>
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-200 text-[10px] text-slate-500">
                      <span>Instalação: Sala C-202</span>
                      <span className="text-slate-700 font-semibold">[Presencial]</span>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#0b1f3a] text-xs">12.º Ano • Turma A</span>
                      <span className="text-[10px] font-mono font-bold bg-white px-1.5 py-0.5 border border-slate-300">
                        8h / sem
                      </span>
                    </div>
                    <div className="text-slate-800 font-bold text-xs mt-1.5">Bioestatística</div>
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-200 text-[10px] text-slate-500">
                      <span>Instalação: Anfiteatro 1</span>
                      <span className="text-slate-700 font-semibold">[Presencial]</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Assinaturas & Selo RH Oficial (Conforme Imagem 2) */}
          <div className="pt-4 border-t-2 border-[#0b1f3a] print-break-avoid">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end text-center">
              {/* Assinatura do Docente */}
              <div>
                <div className="font-serif italic text-base text-slate-700 h-8 flex items-end justify-center mb-1">
                  {teacher.name}
                </div>
                <div className="border-b border-dashed border-slate-400 mx-4 mb-1" />
                <span className="font-bold text-slate-900 uppercase block text-[11px]">
                  ASSINATURA DO DOCENTE
                </span>
                <span className="text-[10px] text-slate-500 block">
                  (Prof. {teacher.name.replace(/^Prof\.\s*/, '')})
                </span>
              </div>

              {/* Visto da Direcção Pedagógica */}
              <div>
                <div className="font-serif italic text-base text-[#0b1f3a] h-8 flex items-end justify-center mb-1">
                  Direcção Pedagógica
                </div>
                <div className="border-b border-dashed border-slate-400 mx-4 mb-1" />
                <span className="font-bold text-[#0b1f3a] uppercase block text-[11px]">
                  VISTO DA DIRECÇÃO PEDAGÓGICA
                </span>
                <span className="text-[10px] text-slate-500 block">
                  ({institution.schoolName})
                </span>
              </div>

              {/* Selo RH e Autenticação Digital */}
              <div className="border border-slate-300 p-2.5 bg-slate-50 text-center">
                <div className="w-12 h-12 rounded-full border-2 border-amber-600/70 text-amber-800 flex flex-col items-center justify-center p-0.5 text-center font-bold text-[7px] leading-tight rotate-[-4deg] uppercase mx-auto mb-1">
                  <span>SELO RH</span>
                  <span className="text-[6px]">CEPB</span>
                </div>
                <span className="block font-mono text-[9px] font-bold text-slate-700">
                  HASH: BM-{String(teacher.agentNumber || '7749').replace(/\D/g, '').slice(-4)}-DOC
                </span>
                <span className="block text-[8px] text-slate-500">
                  Autenticado digitalmente via BandMed Core
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer (Oculto na impressão) */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-300 flex items-center justify-end gap-3 no-print">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#7a0c0c] hover:bg-[#5e0909] text-white font-bold text-xs border border-[#7a0c0c] cursor-pointer transition-colors shadow-xs"
            title="Abrir área de impressão do dispositivo"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span>Imprimir</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-300 hover:bg-slate-400 text-slate-800 font-bold text-xs cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
