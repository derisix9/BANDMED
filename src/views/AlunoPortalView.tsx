import React, { useState, useMemo } from 'react';
import { SchoolDatabase, User, UserRole, Student, StudentTrimesterRecord } from '../types';
import { dbService } from '../services/db';
import { runGlobalOperation } from '../context/OperationContext';
import { ReportCardModal } from '../components/ReportCardModal';

interface AlunoPortalViewProps {
  db: SchoolDatabase;
  currentUser: User;
  currentUserRole: UserRole;
  initialTab?: 'notas' | 'financeiro';
}

export const AlunoPortalView: React.FC<AlunoPortalViewProps> = ({
  db,
  currentUser,
  currentUserRole,
  initialTab
}) => {
  // Determine if viewing as Aluno or Encarregado
  const isEncarregado = currentUserRole === 'encarregado';

  // Default active tab based on role and preference
  const [activeTab, setActiveTab] = useState<'notas' | 'financeiro'>(() => {
    if (initialTab) return initialTab;
    return isEncarregado ? 'financeiro' : 'notas';
  });

  // Selected academic year & trimester
  const [selectedYear, setSelectedYear] = useState<string>(
    db.settings?.currentAcademicYear || '2024/2025'
  );
  const [selectedTrimester, setSelectedTrimester] = useState<number>(2); // 2.º Trimestre is current

  // Send Report Card modal
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState(
    'Estimado(a) Encarregado(a), disponibilizo o meu boletim de aproveitamento escolar com as notas atualizadas na sua área para consulta e impressão.'
  );

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Find the relevant student
  const student: Student | undefined = useMemo(() => {
    if (!db.students || db.students.length === 0) return undefined;

    if (currentUserRole === 'aluno') {
      // Find by process number or email or name
      const byProc = db.students.find(
        (s) => currentUser.processNumber && s.procNumber.toLowerCase() === currentUser.processNumber.toLowerCase()
      );
      if (byProc) return byProc;

      const byEmail = db.students.find(
        (s) => currentUser.email && s.email.toLowerCase() === currentUser.email.toLowerCase()
      );
      if (byEmail) return byEmail;

      const byName = db.students.find(
        (s) => currentUser.name && s.name.toLowerCase().includes(currentUser.name.toLowerCase())
      );
      if (byName) return byName;
    }

    if (currentUserRole === 'encarregado') {
      const byGuardian = db.students.find(
        (s) =>
          (currentUser.email && s.guardianEmail?.toLowerCase() === currentUser.email.toLowerCase()) ||
          (currentUser.name && s.guardianName?.toLowerCase().includes(currentUser.name.toLowerCase()))
      );
      if (byGuardian) return byGuardian;
    }

    // Default fallback to first student for demo
    return db.students[0];
  }, [db.students, currentUser, currentUserRole]);

  // Check debtor status
  const isDebtor = Boolean(
    student &&
      (student.financialStatus === 'debito' || !student.isTuitionPaidCurrentMonth)
  );

  // Active trimester from system settings (usually 2)
  const currentSystemTrimester = Number(db.settings?.currentTrimester || 2);
  const isCurrentTrimesterSelected = selectedTrimester === currentSystemTrimester;

  // Grade records
  const trimesterGrades: StudentTrimesterRecord[] = useMemo(() => {
    if (!student) return [];
    if (student.trimesterGrades && student.trimesterGrades.length > 0) {
      return student.trimesterGrades;
    }

    // Fallback: construct from subjects or disciplineGrades
    const defaultSubjects = [
      { id: 'sub-1', name: 'Língua Portuguesa' },
      { id: 'sub-2', name: 'Matemática' },
      { id: 'sub-3', name: 'Física' },
      { id: 'sub-4', name: 'Química' },
      { id: 'sub-5', name: 'Biologia' },
      { id: 'sub-6', name: 'História' },
      { id: 'sub-7', name: 'Geografia' },
      { id: 'sub-8', name: 'Língua Inglesa' },
      { id: 'sub-9', name: 'Educação Física' }
    ];

    return defaultSubjects.map((sub, idx) => {
      const mac1 = 14 + (idx % 4);
      const npp1 = 13 + (idx % 5);
      const npt1 = 15 - (idx % 3);
      const mt1 = Math.round(((mac1 + npp1 + npt1) / 3) * 10) / 10;

      const mac2 = 13 + (idx % 6);
      const npp2 = 14 - (idx % 4);
      const npt2 = 12 + (idx % 5);
      const mt2 = Math.round(((mac2 + npp2 + npt2) / 3) * 10) / 10;

      const mac3 = 15 - (idx % 4);
      const npp3 = 14 + (idx % 3);
      const npt3 = 16 - (idx % 5);
      const mt3 = Math.round(((mac3 + npp3 + npt3) / 3) * 10) / 10;

      const mfd = Math.round(((mt1 + mt2 + mt3) / 3) * 10) / 10;

      return {
        subjectId: sub.id,
        subjectName: sub.name,
        mac1,
        npp1,
        npt1,
        mt1,
        mac2,
        npp2,
        npt2,
        mt2,
        mac3,
        npp3,
        npt3,
        mt3,
        mfd,
        ca: mfd,
        situation: mfd >= 10 ? 'Aprovado' : 'Não Aprovado'
      };
    });
  }, [student]);

  // Statistics calculation for selected trimester
  const stats = useMemo(() => {
    if (!trimesterGrades || trimesterGrades.length === 0) {
      return { average: 0, positive: 0, negative: 0, count: 0 };
    }

    let sum = 0;
    let positive = 0;
    let negative = 0;

    trimesterGrades.forEach((g) => {
      const grade =
        selectedTrimester === 1
          ? g.mt1
          : selectedTrimester === 2
          ? g.mt2
          : selectedTrimester === 3
          ? g.mt3
          : g.mfd;

      if (typeof grade === 'number' && !isNaN(grade)) {
        sum += grade;
        if (grade >= 10) positive++;
        else negative++;
      }
    });

    const count = trimesterGrades.length;
    const average = count > 0 ? Math.round((sum / count) * 10) / 10 : 0;

    return { average, positive, negative, count };
  }, [trimesterGrades, selectedTrimester]);

  // Tuition months tracker
  const monthsTracker = [
    { month: 'Setembro', key: '09', paid: true, receipt: 'FR-2024/0144', date: '08/09/2024' },
    { month: 'Outubro', key: '10', paid: true, receipt: 'FR-2024/0521', date: '05/10/2024' },
    { month: 'Novembro', key: '11', paid: true, receipt: 'FR-2024/0993', date: '04/11/2024' },
    { month: 'Dezembro', key: '12', paid: true, receipt: 'FR-2024/1482', date: '09/12/2024' },
    { month: 'Janeiro', key: '01', paid: !isDebtor, receipt: isDebtor ? undefined : 'FR-2025/0088', date: isDebtor ? undefined : '06/01/2025' },
    { month: 'Fevereiro', key: '02', paid: !isDebtor, receipt: isDebtor ? undefined : 'FR-2025/0412', date: isDebtor ? undefined : '05/02/2025' },
    { month: 'Março', key: '03', paid: false, receipt: undefined, date: undefined },
    { month: 'Abril', key: '04', paid: false, receipt: undefined, date: undefined },
    { month: 'Maio', key: '05', paid: false, receipt: undefined, date: undefined },
    { month: 'Junho', key: '06', paid: false, receipt: undefined, date: undefined },
    { month: 'Julho', key: '07', paid: false, receipt: undefined, date: undefined }
  ];

  // Bank accounts
  const bankAccounts = [
    {
      bank: 'Banco Angolano de Investimentos (BAI)',
      iban: 'AO06.0040.0000.4455.8899.0101.4',
      entity: '00342',
      holder: 'Complexo Escolar BandMed Luanda'
    },
    {
      bank: 'Banco de Fomento Angola (BFA)',
      iban: 'AO06.0006.0000.7788.9911.2201.8',
      entity: '00119',
      holder: 'Complexo Escolar BandMed Luanda'
    },
    {
      bank: 'Banco Millennium Atlântico (BMA)',
      iban: 'AO06.0055.0000.1122.3344.5501.9',
      entity: '00287',
      holder: 'Complexo Escolar BandMed Luanda'
    }
  ];

  // Handle Send Report Card to Guardian
  const handleSendReportCard = async () => {
    if (!student) return;

    await runGlobalOperation(
      async () => {
        // Update student record in database so guardian has permission to view & print
        dbService.updateStudent(student.id, {
          boletimEnviadoAoEncarregado: true,
          boletimEnviadoEm: new Date().toISOString()
        });

        // Log in notifications and audit
        dbService.addNotification({
          title: `Boletim Escolar Recebido pelo Encarregado`,
          message: `O estudante ${student.name} disponibilizou o seu boletim de notas diretamente na área do encarregado de educação (${student.guardianName || 'Encarregado'}).`,
          type: 'academic'
        });
        await dbService.pushToCloudStorage();
      },
      {
        loadingMessage: `A transferir e disponibilizar o boletim oficial na área do encarregado...`,
        successMessage: `Boletim de notas enviado com sucesso para a área do encarregado!`
      }
    );

    setIsSendModalOpen(false);
    showToast(`Boletim disponibilizado com sucesso na área do seu encarregado!`);
  };

  if (!student) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">school</span>
        <h3 className="text-lg font-bold text-slate-800">Nenhum registo de estudante associado</h3>
        <p className="text-xs text-slate-500 mt-1">
          Não foi possível localizar uma ficha de aluno associada ao utilizador com sessão iniciada.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0b1f3a] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-4">
          <span className="material-symbols-outlined text-emerald-400 text-xl">check_circle</span>
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Profile Banner */}
      <div className="bg-gradient-to-r from-[#0b1f3a] via-[#122b50] to-[#1f4277] text-white p-6 rounded-2xl shadow-lg border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
              {student.avatar ? (
                <img
                  src={student.avatar}
                  alt={student.name}
                  className="w-full h-full object-cover rounded-xl"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="material-symbols-outlined text-3xl text-blue-200">person</span>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl font-bold font-headline tracking-tight">{student.name}</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white">
                  Nº Proc: {student.procNumber}
                </span>
                {isDebtor ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/80 text-white flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">warning</span>
                    Pendente
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/80 text-white flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">verified</span>
                    Regularizado
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-blue-100/80">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">class</span>
                  Turma: {student.className || student.grade}
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">school</span>
                  Curso: {student.courseName || 'Ensino Geral'}
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">supervisor_account</span>
                  Encarregado: {student.guardianName || 'Não registado'}
                </span>
              </div>
            </div>
          </div>

          {/* Action: Send report card button */}
          {!isEncarregado && (
            <div className="flex items-center gap-2 shrink-0">
              {student.boletimEnviadoAoEncarregado ? (
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-emerald-300 font-semibold bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-500/40">
                    <span className="material-symbols-outlined text-[16px] text-emerald-400">check_circle</span>
                    Boletim Ativo na Área do Encarregado
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsSendModalOpen(true)}
                    className="px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                    title="Atualizar ou reenviar o boletim com notas atualizadas para a área do encarregado"
                  >
                    <span className="material-symbols-outlined text-base">sync</span>
                    <span>Atualizar Envio</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsSendModalOpen(true)}
                  className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <span className="material-symbols-outlined text-lg">forward_to_inbox</span>
                  <span>Enviar Boletim ao Encarregado</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        {!isEncarregado && (
          <button
            type="button"
            onClick={() => setActiveTab('notas')}
            className={`px-5 py-3 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'notas'
                ? 'bg-[#0b1f3a] text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-lg">assignment</span>
            <span>Suas Notas & Aproveitamento Escolar</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveTab('financeiro')}
          className={`px-5 py-3 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'financeiro'
              ? 'bg-[#0b1f3a] text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <span className="material-symbols-outlined text-lg">payments</span>
          <span>
            {isEncarregado ? 'Situação Financeira do Estudante' : 'Situação Financeira & Propinas'}
          </span>
          {isDebtor && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          )}
        </button>

        {isEncarregado && (
          <button
            type="button"
            onClick={() => setActiveTab('notas')}
            className={`px-5 py-3 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'notas'
                ? 'bg-[#0b1f3a] text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-lg">assignment</span>
            <span>Boletim de Notas do Educando</span>
          </button>
        )}
      </div>

      {/* TAB 1: NOTAS POR TRIMESTRE, DISCIPLINAS E ANOS LECTIVOS */}
      {activeTab === 'notas' && (
        <div className="space-y-6">
          {/* CRITICAL CHECK FOR GUARDIAN AREA:
              "SIGNIFICA QUE NA AREA DO ENCARREGADO SÓ SERA POSSIVEL IMPRIMIR BOLETIM E VER AS NOTAS DO ESTUDANTE CASO O ESTUDANTE ENVIAR O BOLETIM PARA ELE." */}
          {isEncarregado && !student.boletimEnviadoAoEncarregado ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-8 sm:p-10 text-center max-w-2xl mx-auto my-6 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200 shadow-inner">
                <span className="material-symbols-outlined text-3xl">lock</span>
              </div>
              <div>
                <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 inline-block mb-2">
                  Boletim Não Disponibilizado
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Aguardando Envio do Boletim pelo Estudante
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed max-w-lg mx-auto">
                  O estudante <strong>{student.name}</strong> ainda não efetuou o envio do boletim de aproveitamento escolar para a sua área de encarregado.
                </p>
                <p className="text-xs text-slate-500 mt-1.5 max-w-lg mx-auto">
                  Assim que o estudante aceder ao portal dele e clicar em <strong>"Enviar Boletim ao Encarregado"</strong>, a pauta de notas e a opção de impressão oficial ficarão imediatamente disponíveis aqui.
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs text-slate-600 space-y-1 mt-4">
                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-slate-500">info</span>
                  Procedimento Institucional
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Para promover a autonomia e responsabilidade pedagógica, o boletim é inicialmente disponibilizado na área do educando, que procede ao envio digital para a área do encarregado de educação.
                </p>
              </div>
            </div>
          ) : (
            <>
              {isEncarregado && student.boletimEnviadoAoEncarregado && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-emerald-950">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-emerald-600 text-2xl">verified</span>
                    <div>
                      <h4 className="text-xs font-bold text-emerald-950">
                        Boletim Oficial Disponibilizado pelo Estudante
                      </h4>
                      <p className="text-[11px] text-emerald-800 mt-0.5">
                        O estudante <strong>{student.name}</strong> enviou este boletim diretamente para a sua área institucional{student.boletimEnviadoEm ? ` em ${new Date(student.boletimEnviadoEm).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}` : ''}.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Filtering Bar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                      Ano Lectivo
                    </label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="h-9 px-3 text-xs font-bold rounded-lg border border-slate-300 bg-slate-50 focus:ring-1 focus:ring-[#0b1f3a]"
                    >
                      <option value="2024/2025">2024/2025 (Ano Corrente)</option>
                      <option value="2023/2024">2023/2024 (Histórico)</option>
                      <option value="2022/2023">2022/2023 (Histórico)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                      Período Curricular
                    </label>
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                      {[
                        { id: 1, label: '1.º Trimestre' },
                        { id: 2, label: '2.º Trimestre', current: true },
                        { id: 3, label: '3.º Trimestre' },
                        { id: 4, label: 'Pauta Geral' }
                      ].map((trim) => (
                        <button
                          key={trim.id}
                          type="button"
                          onClick={() => setSelectedTrimester(trim.id)}
                          className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                            selectedTrimester === trim.id
                              ? 'bg-[#0b1f3a] text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {trim.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quick Metrics */}
                {!(isDebtor && isCurrentTrimesterSelected) && (
                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-900 border border-blue-200">
                      <span>Média do Período:</span>
                      <strong className="font-mono text-sm">{stats.average}</strong>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200">
                      <span>Positivas:</span>
                      <strong className="font-mono text-sm">{stats.positive}</strong>
                    </div>
                    {stats.negative > 0 && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-900 border border-rose-200">
                        <span>Negativas:</span>
                        <strong className="font-mono text-sm">{stats.negative}</strong>
                      </div>
                    )}
                  </div>
                )}
              </div>

          {/* CRITICAL DEBTOR RESTRICTION CHECK:
              "OS ALUNOS DEVEDORES NÃO DEVEM VER AS NOTAS DO TRIMESTRE EM VIGENCIA." */}
          {isDebtor && isCurrentTrimesterSelected ? (
            <div className="p-8 rounded-2xl bg-gradient-to-br from-rose-50 to-amber-50 border-2 border-rose-200 shadow-sm text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shadow-inner">
                <span className="material-symbols-outlined text-3xl">lock</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Notas do 2.º Trimestre em Vigência Bloqueadas
              </h3>
              <p className="text-xs text-slate-600 max-w-xl mx-auto mt-2 leading-relaxed">
                De acordo com as normas financeiras do Complexo Escolar Privado BandMed, a visualização das
                avaliações (MAC, NPP, NPT e MT) do <strong>trimestre lectivo em vigência</strong> está temporariamente
                condicionada à liquidação das propinas pendentes do presente ano letivo.
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('financeiro')}
                  className="px-4 py-2.5 bg-[#0b1f3a] hover:bg-[#15345d] text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">payments</span>
                  <span>Ver Situação Financeira & Coordenadas</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTrimester(1)}
                  className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">history</span>
                  <span>Consultar 1.º Trimestre (Histórico)</span>
                </button>
              </div>
            </div>
          ) : (
            /* Table of Grades */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-600 text-lg">fact_check</span>
                    Pauta de Aproveitamento Escolar — {selectedTrimester === 4 ? 'Resumo Anual' : `${selectedTrimester}.º Trimestre`}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Ano Lectivo {selectedYear} • Escala Oficial Angolana (0 a 20 Valores • Positiva &ge; 10.0)
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(true)}
                  className="px-3.5 py-1.5 bg-[#0b1f3a] hover:bg-[#15345d] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                >
                  <span className="material-symbols-outlined text-base text-amber-400">print</span>
                  <span>Imprimir Boletim</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse border border-slate-300 print:border-slate-400 text-xs print:text-[8pt]">
                  <thead>
                    <tr className="bg-[#0b1f3a] text-white uppercase font-bold text-[10px] print:bg-[#0b1f3a] print:text-white">
                      <th className="py-2.5 px-3 border border-slate-600 print:border-slate-500 text-center w-10">#</th>
                      <th className="py-2.5 px-3.5 border border-slate-600 print:border-slate-500 font-extrabold">Disciplina Curricular</th>
                      {selectedTrimester !== 4 ? (
                        <>
                          <th className="py-2.5 px-3 border border-slate-600 print:border-slate-500 text-center bg-[#0d2647] print:bg-[#0d2647]">MAC (30%)</th>
                          <th className="py-2.5 px-3 border border-slate-600 print:border-slate-500 text-center bg-[#0d2647] print:bg-[#0d2647]">NPP (30%)</th>
                          <th className="py-2.5 px-3 border border-slate-600 print:border-slate-500 text-center bg-[#0d2647] print:bg-[#0d2647]">NPT (40%)</th>
                          <th className="py-2.5 px-3 border border-slate-600 print:border-slate-500 text-center bg-[#7a0c0c] text-amber-300 font-black print:bg-[#7a0c0c] print:text-amber-300">
                            Média ({selectedTrimester}.º Trim)
                          </th>
                        </>
                      ) : (
                        <>
                          <th className="py-2.5 px-3 border border-slate-600 print:border-slate-500 text-center bg-[#0d2647] print:bg-[#0d2647]">MT 1.º Trim</th>
                          <th className="py-2.5 px-3 border border-slate-600 print:border-slate-500 text-center bg-[#12335e] print:bg-[#12335e]">MT 2.º Trim</th>
                          <th className="py-2.5 px-3 border border-slate-600 print:border-slate-500 text-center bg-[#183f73] print:bg-[#183f73]">MT 3.º Trim</th>
                          <th className="py-2.5 px-3 border border-slate-600 print:border-slate-500 text-center bg-[#7a0c0c] text-amber-300 font-black print:bg-[#7a0c0c] print:text-amber-300">
                            MFD (Final)
                          </th>
                        </>
                      )}
                      <th className="py-2.5 px-3 border border-slate-600 print:border-slate-500 text-center font-extrabold">Situação</th>
                      <th className="py-2.5 px-3.5 border border-slate-600 print:border-slate-500 font-extrabold">Apreciação Pedagógica</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 print:divide-slate-300">
                    {trimesterGrades.map((g, idx) => {
                      const mac = selectedTrimester === 1 ? g.mac1 : selectedTrimester === 2 ? g.mac2 : g.mac3;
                      const npp = selectedTrimester === 1 ? g.npp1 : selectedTrimester === 2 ? g.npp2 : g.npp3;
                      const npt = selectedTrimester === 1 ? g.npt1 : selectedTrimester === 2 ? g.npt2 : g.npt3;
                      const mt = selectedTrimester === 1 ? g.mt1 : selectedTrimester === 2 ? g.mt2 : selectedTrimester === 3 ? g.mt3 : g.mfd;

                      const isPositive = mt >= 10;

                      return (
                        <tr key={g.subjectId || idx} className={`${idx % 2 === 1 ? 'bg-[#f8fafc]' : 'bg-white'} hover:bg-blue-50/30 transition-colors`}>
                          <td className="py-2 px-3 border border-slate-300 print:border-slate-300 font-mono text-slate-500 text-center font-bold">{idx + 1}</td>
                          <td className="py-2 px-3.5 border border-slate-300 print:border-slate-300 font-bold text-[#0b1f3a]">{g.subjectName}</td>

                          {selectedTrimester !== 4 ? (
                            <>
                              <td className="py-2 px-3 border border-slate-300 print:border-slate-300 text-center font-mono text-slate-700">{mac.toFixed(1)}</td>
                              <td className="py-2 px-3 border border-slate-300 print:border-slate-300 text-center font-mono text-slate-700">{npp.toFixed(1)}</td>
                              <td className="py-2 px-3 border border-slate-300 print:border-slate-300 text-center font-mono text-slate-700">{npt.toFixed(1)}</td>
                              <td className="py-2 px-3 border border-slate-300 print:border-slate-300 text-center font-mono font-bold text-sm bg-blue-50/50 print:bg-blue-50/50">
                                <span
                                  className={`px-2 py-0.5 rounded-md font-bold ${
                                    isPositive
                                      ? 'text-emerald-800'
                                      : 'text-rose-700 font-black'
                                  }`}
                                >
                                  {mt.toFixed(1)}
                                </span>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="py-2 px-3 border border-slate-300 print:border-slate-300 text-center font-mono text-slate-700">{g.mt1.toFixed(1)}</td>
                              <td className="py-2 px-3 border border-slate-300 print:border-slate-300 text-center font-mono text-slate-700">{g.mt2.toFixed(1)}</td>
                              <td className="py-2 px-3 border border-slate-300 print:border-slate-300 text-center font-mono text-slate-700">{g.mt3.toFixed(1)}</td>
                              <td className="py-2 px-3 border border-slate-300 print:border-slate-300 text-center font-mono font-black text-sm bg-rose-50/70 text-[#7a0c0c] print:bg-rose-50/70">
                                <span
                                  className={`px-2 py-0.5 rounded-md ${
                                    isPositive
                                      ? 'text-emerald-800'
                                      : 'text-rose-800'
                                  }`}
                                >
                                  {g.mfd.toFixed(1)}
                                </span>
                              </td>
                            </>
                          )}

                          <td className="py-2 px-3 border border-slate-300 print:border-slate-300 text-center">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block ${
                                isPositive
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-800 border border-rose-200'
                              }`}
                            >
                              {isPositive ? 'Positiva' : 'Negativa'}
                            </span>
                          </td>

                          <td className="py-2 px-3.5 border border-slate-300 print:border-slate-300 text-slate-600 text-[11px]">
                            {mt >= 16
                              ? 'Excelente aproveitamento e dedicação contínua.'
                              : mt >= 14
                              ? 'Bom desempenho curricular e pontualidade.'
                              : mt >= 10
                              ? 'Aproveitamento satisfatório com margem de melhoria.'
                              : 'Requer reforço pedagógico urgente e apoio no estudo.'}
                          </td>
                        </tr>
                      );
                    })}

                    {/* Summary / Total Footer Row */}
                    <tr className="bg-[#0b1f3a] text-white font-bold print:bg-[#0b1f3a] print:text-white">
                      <td colSpan={selectedTrimester !== 4 ? 5 : 5} className="py-2 px-3.5 border border-slate-600 print:border-slate-500 uppercase text-right text-[10px]">
                        {selectedTrimester === 4 ? 'Média Final Geral (MFD):' : `Média Geral do ${selectedTrimester}.º Trimestre:`}
                      </td>
                      <td className="py-2 px-3 border border-slate-600 print:border-slate-500 text-center font-mono font-black text-sm text-amber-300 bg-[#7a0c0c] print:bg-[#7a0c0c]">
                        {stats.average}
                      </td>
                      <td className="py-2 px-3 border border-slate-600 print:border-slate-500 text-center text-[10px] text-emerald-300 font-bold bg-[#0d2647] print:bg-[#0d2647]">
                        {Number(stats.average) >= 10 ? 'Aprovado' : 'Não Aprovado'}
                      </td>
                      <td className="py-2 px-3.5 border border-slate-600 print:border-slate-500 text-[11px] text-slate-200">
                        {stats.positive} positivas • {stats.negative} negativas
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
          </>
          )}
        </div>
      )}

      {/* TAB 2: SITUAÇÃO FINANCEIRA DO ESTUDANTE */}
      {activeTab === 'financeiro' && (
        <div className="space-y-6">
          {/* Status summary banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isDebtor ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                <span className="material-symbols-outlined text-2xl">
                  {isDebtor ? 'error' : 'verified'}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Estado Geral das Propinas
                </span>
                <span
                  className={`text-base font-bold ${
                    isDebtor ? 'text-rose-700' : 'text-emerald-700'
                  }`}
                >
                  {isDebtor ? 'Mensalidades em Débito' : 'Situação Regularizada'}
                </span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">payments</span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Propina Mensal Fixada
                </span>
                <span className="text-base font-bold text-slate-900 font-mono">
                  {(student.monthlyTuitionKz || 25000).toLocaleString('pt-AO')} Kz
                </span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">event</span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Dia de Vencimento
                </span>
                <span className="text-base font-bold text-slate-900">
                  Dia {db.settings?.financialRules?.paymentDueDay || 10} de cada mês
                </span>
              </div>
            </div>
          </div>

          {/* Month-by-Month Payment History */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600 text-lg">calendar_month</span>
                  Extrato Mensal de Propinas — Ano Lectivo {selectedYear}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Registo dos pagamentos liquidados e mensalidades a vencer
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-slate-300 text-xs">
                <thead>
                  <tr className="bg-[#0b1f3a] text-white border-b border-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-4 border-r border-slate-600">Mês de Referência</th>
                    <th className="py-2.5 px-4 border-r border-slate-600">Valor Mensal</th>
                    <th className="py-2.5 px-4 border-r border-slate-600 text-center">Estado</th>
                    <th className="py-2.5 px-4 border-r border-slate-600">Recibo de Liquidação</th>
                    <th className="py-2.5 px-4 border-r border-slate-600">Data do Pagamento</th>
                    <th className="py-2.5 px-4 text-right">Comprovativo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {monthsTracker.map((m, idx) => (
                    <tr key={m.key} className={`${idx % 2 === 1 ? 'bg-[#f8fafc]' : 'bg-white'} hover:bg-blue-50/20 transition-colors`}>
                      <td className="py-3 px-4 border-r border-slate-200 font-bold text-slate-800 flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-400 text-base">receipt</span>
                        <span>{m.month}</span>
                      </td>
                      <td className="py-3 px-4 border-r border-slate-200 font-mono font-semibold text-slate-700">
                        {(student.monthlyTuitionKz || 25000).toLocaleString('pt-AO')} Kz
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            m.paid
                              ? 'bg-emerald-100 text-emerald-800'
                              : isDebtor && (m.key === '01' || m.key === '02')
                              ? 'bg-rose-100 text-rose-800 animate-pulse'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {m.paid
                            ? 'Liquidado'
                            : isDebtor && (m.key === '01' || m.key === '02')
                            ? 'Em Atraso'
                            : 'A Vencer'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {m.receipt || '---'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {m.date || '---'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {m.paid ? (
                          <button
                            type="button"
                            onClick={() => showToast(`A descarregar 2.ª via da Fatura-Recibo ${m.receipt}...`)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[14px]">download</span>
                            <span>Recibo</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Pendente</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Official Bank Coordinates for Payment */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-700 text-lg">account_balance</span>
                Coordenadas Bancárias Oficiais para Depósito ou Multicaixa Express
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Utilize os dados abaixo para pagamento de propinas e emolumentos. Indique sempre o <strong>N.º de Processo ({student.procNumber})</strong> e o <strong>Nome do Estudante</strong> no descritivo da transferência.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {bankAccounts.map((b, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">{b.bank}</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Titular: {b.holder}</span>
                  </div>

                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">IBAN Oficial:</span>
                    <span className="font-mono text-xs font-bold text-slate-800 break-all select-all">
                      {b.iban}
                    </span>
                    <div className="mt-1.5 flex items-center justify-between text-[11px] font-semibold text-slate-600">
                      <span>Entidade MCX:</span>
                      <strong className="font-mono text-indigo-700">{b.entity}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Visualizar & Imprimir Boletim Escolar Oficial */}
      {isReportModalOpen && student && (
        <ReportCardModal
          student={student}
          db={db}
          onClose={() => setIsReportModalOpen(false)}
        />
      )}

      {/* MODAL: Enviar Boletim de Notas ao Encarregado de Educação */}
      {isSendModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500 text-2xl">forward_to_inbox</span>
                <h3 className="font-bold text-base text-slate-900">
                  Enviar Boletim Escolar ao Encarregado
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSendModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Guardian Info Card */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-slate-500">person</span>
                  Destinatário: {student.guardianName || 'Encarregado de Educação'}
                </div>
                <div className="text-slate-600 flex items-center gap-4">
                  <span>E-mail: <strong>{student.guardianEmail || 'encarregado@exemplo.ao'}</strong></span>
                  <span>Telemóvel: <strong>{student.guardianPhone || '+244 923 000 000'}</strong></span>
                </div>
              </div>

              {/* Destination Area Explanation */}
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-950 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-xs text-blue-900">
                  <span className="material-symbols-outlined text-base text-blue-700">security</span>
                  Disponibilização Direta na Área do Encarregado
                </div>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  O boletim de notas será enviado da sua área de estudante para a <strong>Área do Encarregado</strong> no sistema.
                </p>
                <p className="text-[11px] text-blue-700 leading-relaxed font-semibold">
                  • O seu encarregado de educação poderá consultar o aproveitamento, notas dos 3 trimestres e emitir a impressão oficial da pauta.
                </p>
              </div>

              {/* Message to guardian */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nota ou Mensagem para o Encarregado:
                </label>
                <textarea
                  rows={3}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:ring-1 focus:ring-[#0b1f3a]"
                  placeholder="Escreva uma mensagem de acompanhamento..."
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-lg">verified</span>
                <span>As notas oficiais, médias e situação pedagógica serão sincronizadas de imediato.</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsSendModalOpen(false)}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSendReportCard}
                className="px-5 py-2.5 bg-[#0b1f3a] hover:bg-[#15345d] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">send</span>
                <span>Enviar para Área do Encarregado</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
