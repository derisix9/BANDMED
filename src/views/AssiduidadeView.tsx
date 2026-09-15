import React, { useState, useEffect } from 'react';
import { SchoolDatabase, AttendanceSheet, AttendanceStatus, AttendanceStudentItem, UserRole, User } from '../types';
import { dbService } from '../services/db';
import { getAvailableSubjectsForUser } from '../utils/teacherSubjects';
import { runGlobalOperation } from '../context/OperationContext';

interface AssiduidadeViewProps {
  db: SchoolDatabase;
  currentUserRole: UserRole;
  currentUser?: User;
  initialClassId?: string | number;
}

export const AssiduidadeView: React.FC<AssiduidadeViewProps> = ({
  db,
  currentUserRole,
  currentUser,
  initialClassId
}) => {
  const availableSubjects = React.useMemo(() => {
    return getAvailableSubjectsForUser(db, currentUser);
  }, [db, currentUser]);

  const [selectedClassId, setSelectedClassId] = useState<string>(
    initialClassId ? String(initialClassId) : (db.classes[0]?.id || '')
  );
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    availableSubjects[0]?.id || db.subjects[0]?.id || ''
  );
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [timeSlot, setTimeSlot] = useState<string>('08:30–10:00');
  const [lessonNumber, setLessonNumber] = useState<string>('N.º 24');
  const [lessonSummary, setLessonSummary] = useState<string>('');
  const [isSigned, setIsSigned] = useState<boolean>(false);
  const [signedBy, setSignedBy] = useState<string>('');
  const [signedAt, setSignedAt] = useState<string>('');
  const [sheetStatus, setSheetStatus] = useState<'aberto' | 'sincronizado' | 'homologado'>('aberto');
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [sheetPendingDelete, setSheetPendingDelete] = useState<AttendanceSheet | null>(null);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  // Auto-align selected subject with available disciplines
  useEffect(() => {
    if (availableSubjects.length > 0 && !availableSubjects.some((s) => String(s.id) === String(selectedSubjectId))) {
      setSelectedSubjectId(String(availableSubjects[0].id));
    }
  }, [availableSubjects, selectedSubjectId]);

  // Active Class & Subject from DB
  const activeClass = db.classes.find((c) => String(c.id) === String(selectedClassId)) || db.classes[0];
  const activeSubject = db.subjects.find((s) => String(s.id) === String(selectedSubjectId)) || db.subjects[0];
  const classStudents = activeClass ? (db.students || []).filter((s) => s.classId === activeClass.id) : [];

  // Local student attendance map for currently active session
  const [studentsAttendance, setStudentsAttendance] = useState<Record<string, { status: AttendanceStatus; note: string; entryTime: string }>>({});

  // Sync state whenever Class, Subject, Date or Database changes
  useEffect(() => {
    if (!activeClass) return;

    // Look for existing attendance sheet in database
    const savedSheets = db.attendanceSheets || (db.attendance ? [db.attendance] : []);
    const existingSheet = savedSheets.find(
      (s) =>
        String(s.classId) === String(activeClass.id) &&
        String(s.subjectId) === String(activeSubject?.id) &&
        s.date === selectedDate
    );

    if (existingSheet) {
      setLessonSummary(existingSheet.lessonSummary || '');
      setIsSigned(Boolean(existingSheet.isDigitallySigned));
      setSignedBy(existingSheet.signedBy || '');
      setSignedAt(existingSheet.signedAt || '');
      setSheetStatus(existingSheet.status || 'aberto');
      setTimeSlot(existingSheet.timeSlot || '08:30–10:00');

      const mapping: Record<string, { status: AttendanceStatus; note: string; entryTime: string }> = {};
      classStudents.forEach((student) => {
        const item = existingSheet.students?.find((st) => String(st.studentId) === String(student.id));
        if (item) {
          mapping[student.id] = {
            status: item.status,
            note: item.note || '',
            entryTime: item.entryTime || (item.status === 'P' ? '08:30' : item.status === 'A' ? '08:45' : '—')
          };
        } else {
          mapping[student.id] = {
            status: 'P',
            note: '',
            entryTime: '08:30'
          };
        }
      });
      setStudentsAttendance(mapping);
    } else {
      // Draft / New attendance session for this date & class
      setLessonSummary(
        activeSubject ? `Aula n.º — Estudo curricular de ${activeSubject.name}. Resolução de exercícios e consolidação de competências.` : ''
      );
      setIsSigned(false);
      setSignedBy('');
      setSignedAt('');
      setSheetStatus('aberto');

      const mapping: Record<string, { status: AttendanceStatus; note: string; entryTime: string }> = {};
      classStudents.forEach((student) => {
        mapping[student.id] = {
          status: 'P',
          note: '',
          entryTime: '08:30'
        };
      });
      setStudentsAttendance(mapping);
    }
  }, [selectedClassId, selectedSubjectId, selectedDate, db.attendanceSheets, db.attendance]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setStudentsAttendance((prev) => {
      const current = prev[studentId] || { status: 'P', note: '', entryTime: '08:30' };
      let entryTime = current.entryTime;
      if (status === 'P') entryTime = '08:30';
      else if (status === 'A') entryTime = '08:45';
      else if (status === 'FI') entryTime = 'FALTOU';
      else entryTime = '—';

      return {
        ...prev,
        [studentId]: {
          ...current,
          status,
          entryTime
        }
      };
    });
  };

  const handleNoteChange = (studentId: string, note: string) => {
    setStudentsAttendance((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { status: 'P', note: '', entryTime: '08:30' }),
        note
      }
    }));
  };

  const handleMarkAllPresent = () => {
    const updated: Record<string, { status: AttendanceStatus; note: string; entryTime: string }> = {};
    classStudents.forEach((s) => {
      updated[s.id] = {
        status: 'P',
        note: studentsAttendance[s.id]?.note || '',
        entryTime: '08:30'
      };
    });
    setStudentsAttendance(updated);
  };

  const buildCurrentSheet = (signed: boolean = isSigned): AttendanceSheet => {
    const d = new Date(selectedDate);
    const dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const formattedDate = `${dayNames[d.getDay()]}, ${d.getDate()} de ${monthNames[d.getMonth()]} de ${d.getFullYear()}`;

    const studentItems: AttendanceStudentItem[] = classStudents.map((st) => {
      const rec = studentsAttendance[st.id] || { status: 'P', note: '', entryTime: '08:30' };
      return {
        studentId: String(st.id),
        studentName: st.name,
        procNumber: st.procNumber || '—',
        avatar: st.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
        status: rec.status,
        entryTime: rec.entryTime,
        note: rec.note,
        cumulativeAbsencesCount: (st.unexcusedAbsences || 0) + (rec.status === 'FI' ? 1 : 0),
        absencePercentage: st.attendanceRate ? Math.max(0, 100 - st.attendanceRate) : 0
      };
    });

    const currentTeacher = db.teachers.find((t) => t.id === activeClass?.headTeacherId) || db.teachers[0];

    return {
      id: `att-${activeClass?.id}-${activeSubject?.id}-${selectedDate}`,
      date: selectedDate,
      formattedDate,
      classId: activeClass?.id || 'turma-1',
      className: activeClass?.name || 'Turma A',
      subjectId: activeSubject?.id || 'sub-1',
      subjectName: activeSubject?.name || 'Disciplina',
      teacherId: currentTeacher?.id || 'prof-1',
      teacherName: currentTeacher?.name || db.currentUser.name || 'Professor Titular',
      timeSlot,
      room: activeClass?.room || 'Sala de Aulas',
      status: signed ? 'homologado' : 'sincronizado',
      lessonSummary: lessonSummary || 'Aula curricular devidamente ministrada com registo diário de assiduidade.',
      isDigitallySigned: signed,
      signedBy: signed ? (signedBy || db.currentUser.name) : undefined,
      signedAt: signed ? (signedAt || `${new Date().toLocaleDateString('pt-PT')} ${new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })} (IP 192.168.10.42)`) : undefined,
      students: studentItems
    };
  };

  const handleLoadSheet = (sheet: AttendanceSheet) => {
    setSelectedClassId(String(sheet.classId));
    setSelectedSubjectId(String(sheet.subjectId));
    setSelectedDate(sheet.date);
    if (sheet.timeSlot) setTimeSlot(sheet.timeSlot);
    setLessonSummary(sheet.lessonSummary || '');
    setIsSigned(Boolean(sheet.isDigitallySigned));
    setSignedBy(sheet.signedBy || '');
    setSignedAt(sheet.signedAt || '');
    setSheetStatus(sheet.status || 'aberto');

    const mapping: Record<string, { status: AttendanceStatus; note: string; entryTime: string }> = {};
    if (sheet.students && sheet.students.length > 0) {
      sheet.students.forEach((item) => {
        mapping[item.studentId] = {
          status: item.status,
          note: item.note || '',
          entryTime: item.entryTime || (item.status === 'P' ? '08:30' : item.status === 'A' ? '08:45' : '—')
        };
      });
    }
    setStudentsAttendance(mapping);
    setIsHistoryModalOpen(false);
    setSaveFeedback(`Caderneta de "${sheet.className}" (${sheet.subjectName} - ${sheet.date}) carregada com sucesso!`);
    setTimeout(() => setSaveFeedback(null), 3500);
  };

  const handleDeleteSheet = (sheet: AttendanceSheet) => {
    setSheetPendingDelete(sheet);
  };

  const confirmDeleteSheet = async () => {
    if (!sheetPendingDelete) return;
    const sheet = sheetPendingDelete;
    await runGlobalOperation(
      async () => {
        dbService.deleteAttendanceSheet(sheet.id);
        setSheetPendingDelete(null);
        setSaveFeedback(`Caderneta da turma "${sheet.className}" eliminada da base de dados com sucesso!`);
        setTimeout(() => setSaveFeedback(null), 3500);
      },
      {
        loadingMessage: 'A eliminar caderneta da base de dados...',
        successMessage: 'Operação feita com sucesso!'
      }
    );
  };

  const handleSaveSheet = async () => {
    if (!isSigned) {
      await runGlobalOperation(
        async () => {
          throw new Error('Sem uma caderneta ser homologada pelo professor não deve ser gravada na base de dados.');
        },
        {
          loadingMessage: 'A verificar conformidade pedagógica da caderneta...',
          errorMessage: 'Caderneta Não Homologada',
          errorDetails: 'Sem a caderneta ser homologada e rubricada digitalmente pelo professor, não é permitido gravar na base de dados.'
        }
      );
      return;
    }

    await runGlobalOperation(
      async () => {
        const sheet = buildCurrentSheet(isSigned);
        dbService.saveAttendanceSheet(sheet);
        setSaveFeedback('Caderneta Diária gravada e sincronizada com sucesso na base de dados!');
        setTimeout(() => setSaveFeedback(null), 3500);
      },
      {
        loadingMessage: 'A gravar caderneta diária na base de dados...',
        successMessage: 'Caderneta homologada gravada com sucesso!'
      }
    );
  };

  const handleSignSheet = async () => {
    await runGlobalOperation(
      async () => {
        const signer = db.currentUser.name || (currentUserRole === 'professor' ? 'Prof. Titular' : 'Coordenação Pedagógica');
        const nowStamp = `${new Date().toLocaleDateString('pt-PT')} ${new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })} (IP 192.168.10.42)`;
        setIsSigned(true);
        setSignedBy(signer);
        setSignedAt(nowStamp);
        setSheetStatus('homologado');

        const sheet = buildCurrentSheet(true);
        sheet.isDigitallySigned = true;
        sheet.signedBy = signer;
        sheet.signedAt = nowStamp;
        sheet.status = 'homologado';

        dbService.saveAttendanceSheet(sheet);
        setSaveFeedback('Caderneta Diária rubricada digitalmente e homologada no sistema!');
        setTimeout(() => setSaveFeedback(null), 3500);
      },
      {
        loadingMessage: 'A homologar e rubricar digitalmente caderneta...',
        successMessage: 'Caderneta homologada com sucesso!'
      }
    );
  };

  const handlePrintSheet = async () => {
    if (!isSigned) {
      await runGlobalOperation(
        async () => {
          throw new Error('A caderneta diária necessita de ser homologada e rubricada digitalmente pelo professor antes da impressão.');
        },
        {
          loadingMessage: 'A verificar conformidade de impressão...',
          errorMessage: 'Impressão Não Permitida',
          errorDetails: 'A caderneta de frequência só pode ser impressa após homologação com rubrica digital do professor.'
        }
      );
      return;
    }
    window.print();
  };

  // Stats calculation from real current records
  const totalStudents = classStudents.length;
  const countP = Object.values(studentsAttendance).filter((r) => r.status === 'P').length;
  const countFJ = Object.values(studentsAttendance).filter((r) => r.status === 'FJ').length;
  const countFI = Object.values(studentsAttendance).filter((r) => r.status === 'FI').length;
  const countA = Object.values(studentsAttendance).filter((r) => r.status === 'A').length;
  const presenceRate = totalStudents > 0 ? Math.round(((countP + countA) / totalStudents) * 100) : 100;

  const allRecordedSheets = db.attendanceSheets || [];

  return (
    <div className="flex flex-col w-full gap-6 pb-12 printable-document printable-landscape">
      <style>{`
        @media print {
          @page {
            size: A4 landscape !important;
            margin: 4mm 5mm !important;
          }
        }
      `}</style>
      {/* Toast Feedback */}
      {saveFeedback && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-800 text-white px-5 py-3 rounded-none shadow-xl border border-emerald-600 flex items-center gap-3 animate-fade-in">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          <span className="text-xs font-bold">{saveFeedback}</span>
        </div>
      )}

      {/* Screen Header (Hidden during Print) */}
      <div className="print:hidden flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-300 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
              Diário & Registo de Assiduidade
            </span>
            <span className="w-1.5 h-1.5 bg-[#0b1f3a]" />
            <span className="text-xs font-semibold text-[#0b1f3a]">CARDENETA DA SALA</span>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-300">
              {allRecordedSheets.length} cadernetas registadas
            </span>
          </div>
          <h1 className="font-headline text-2xl lg:text-3xl font-extrabold text-[#0b1f3a] tracking-tight">
            Assiduidade & Sumário
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Lançamento oficial de presenças, faltas justificadas (FJ), injustificadas (FI) e sumário curricular.
          </p>
        </div>

        {/* Action Buttons Strip */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsHistoryModalOpen(true)}
            className="px-3.5 py-2 rounded-none bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center gap-1.5 border border-slate-300 transition-colors shadow-none cursor-pointer"
            title="Ver histórico de cadernetas gravadas na base de dados"
          >
            <span className="material-symbols-outlined text-[17px] text-[#0b1f3a]">history_edu</span>
            <span>Histórico</span>
          </button>

          <button
            type="button"
            onClick={handleMarkAllPresent}
            className="px-3.5 py-2 rounded-none bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center gap-1.5 border border-emerald-900 transition-colors shadow-none cursor-pointer"
            title="Marcar todos os estudantes da turma como Presentes"
          >
            <span className="material-symbols-outlined text-[17px]">done_all</span>
            <span>Todos Presentes</span>
          </button>

          <button
            type="button"
            onClick={handleSaveSheet}
            className={`px-4 py-2 rounded-none font-bold text-xs flex items-center gap-1.5 border transition-colors shadow-none cursor-pointer ${
              isSigned
                ? 'bg-[#0b1f3a] hover:bg-slate-800 text-white border-[#0b1f3a]'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
            }`}
            title={
              isSigned
                ? 'Gravar caderneta homologada na base de dados institucional'
                : 'Requer homologação docente (rubrica) antes de gravar na base de dados'
            }
          >
            <span className="material-symbols-outlined text-[17px] text-amber-500">
              {isSigned ? 'save' : 'lock'}
            </span>
            <span>Gravar</span>
            {!isSigned && (
              <span className="text-[9px] px-1 py-0.2 bg-amber-100 text-amber-800 font-semibold uppercase">
                Requer Rubrica
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={handlePrintSheet}
            className={`px-3.5 py-2 rounded-none font-bold text-xs flex items-center gap-1.5 border transition-colors shadow-none cursor-pointer ${
              isSigned
                ? 'bg-slate-700 hover:bg-slate-800 text-white border-slate-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-500 border-slate-300'
            }`}
            title={
              isSigned
                ? 'Imprimir Folha Diária de Presenças A4'
                : 'Impressão bloqueada até ser homologada pelo professor'
            }
          >
            <span className="material-symbols-outlined text-[17px]">
              {isSigned ? 'print' : 'lock'}
            </span>
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {/* Class, Subject, Date & Schedule Controls (Hidden in Print) */}
      <div className="print:hidden bg-white p-4 rounded-none border border-slate-300 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="block uppercase font-bold text-slate-600 mb-1 text-[11px]">
            Turma & Classe
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full h-9 px-3 rounded-none bg-white border border-slate-300 font-bold text-slate-800 focus:outline-none focus:border-[#0b1f3a]"
          >
            {db.classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.room})
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block uppercase font-bold text-slate-600 text-[11px]">
              Disciplina
            </label>
            {currentUserRole === 'professor' && (
              <span className="text-[10px] text-blue-700 font-semibold">
                (Suas disciplinas)
              </span>
            )}
          </div>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full h-9 px-3 rounded-none bg-white border border-slate-300 font-bold text-slate-800 focus:outline-none focus:border-[#0b1f3a]"
          >
            {availableSubjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block uppercase font-bold text-slate-600 mb-1 text-[11px]">
            Data da Aula
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full h-9 px-3 rounded-none bg-white border border-slate-300 font-medium text-slate-800 focus:outline-none focus:border-[#0b1f3a]"
          />
        </div>

        <div>
          <label className="block uppercase font-bold text-slate-600 mb-1 text-[11px]">
            Horário
          </label>
          <input
            type="text"
            value={timeSlot}
            onChange={(e) => setTimeSlot(e.target.value)}
            className="w-full h-9 px-3 rounded-none bg-white border border-slate-300 font-medium text-slate-800 focus:outline-none focus:border-[#0b1f3a]"
          />
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="print:hidden grid grid-cols-2 sm:grid-cols-6 gap-3 text-center">
        <div className="bg-white p-3 rounded-none border border-slate-300">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Alunos</span>
          <span className="font-headline text-xl font-bold text-[#0b1f3a]">{totalStudents}</span>
        </div>
        <div className="bg-white p-3 rounded-none border border-slate-300">
          <span className="text-[10px] uppercase font-bold text-emerald-800 block">Presentes (P)</span>
          <span className="font-headline text-xl font-bold text-emerald-800">{countP}</span>
        </div>
        <div className="bg-white p-3 rounded-none border border-slate-300">
          <span className="text-[10px] uppercase font-bold text-amber-800 block">Faltas Just. (FJ)</span>
          <span className="font-headline text-xl font-bold text-amber-800">{countFJ}</span>
        </div>
        <div className="bg-white p-3 rounded-none border border-slate-300">
          <span className="text-[10px] uppercase font-bold text-[#7a0c0c] block">Faltas Inj. (FI)</span>
          <span className="font-headline text-xl font-bold text-[#7a0c0c]">{countFI}</span>
        </div>
        <div className="bg-white p-3 rounded-none border border-slate-300">
          <span className="text-[10px] uppercase font-bold text-orange-800 block">Atrasos (A)</span>
          <span className="font-headline text-xl font-bold text-orange-800">{countA}</span>
        </div>
        <div className="bg-white p-3 rounded-none border border-slate-300">
          <span className="text-[10px] uppercase font-bold text-[#0b1f3a] block">Taxa Presença</span>
          <span className="font-headline text-xl font-bold text-[#0b1f3a]">{presenceRate}%</span>
        </div>
      </div>

      {/* Print-Only Official Header */}
      <div className="hidden print:block border-b-2 border-black pb-4 mb-4 text-center">
        <h2 className="text-sm font-bold uppercase tracking-wider">República de Angola</h2>
        <h3 className="text-xs font-semibold uppercase">{db.settings?.schoolName || 'Complexo Escolar Privado BandMed'}</h3>
        <p className="text-[10px] text-gray-600">{db.settings?.address} • NIF: {db.settings?.nif}</p>
        <h1 className="text-base font-extrabold uppercase mt-2 tracking-wide">
          Caderneta Diária de Presenças & Sumário de Aula
        </h1>
        <div className="flex justify-between text-xs mt-3 pt-2 border-t border-black">
          <span><strong>Turma:</strong> {activeClass?.name} ({activeClass?.room})</span>
          <span><strong>Disciplina:</strong> {activeSubject?.name}</span>
          <span><strong>Data:</strong> {selectedDate} ({timeSlot})</span>
        </div>
      </div>

      {/* Real Attendance Table */}
      <div className="bg-white rounded-none border border-slate-300 overflow-hidden print:border-black">
        <div className="p-3 bg-slate-50 border-b border-slate-300 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0b1f3a] text-[20px]">how_to_reg</span>
            <span className="font-bold text-xs text-slate-800">
              Folha de Presenças: {activeClass?.name} • {activeSubject?.name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase border ${
              sheetStatus === 'homologado'
                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                : 'bg-amber-100 text-amber-900 border-amber-300'
            }`}>
              {sheetStatus === 'homologado' ? 'Homologada' : 'Em Aberto'}
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              {selectedDate} ({timeSlot})
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse border border-slate-300 print:border-slate-400 print:text-[8.5pt]">
            <thead>
              <tr className="bg-[#0b1f3a] text-white font-bold uppercase text-[10px] tracking-wider border-b-2 border-slate-900 print:bg-[#0b1f3a] print:text-white">
                <th className="py-2.5 px-3 w-12 text-center border-r border-slate-700/80 print:border-slate-500">N.º</th>
                <th className="py-2.5 px-3 border-r border-slate-700/80 print:border-slate-500">Aluno & Proc.</th>
                <th className="py-2.5 px-3 text-center border-r border-slate-700/80 print:border-slate-500">Estado de Assiduidade</th>
                <th className="py-2.5 px-3 text-center border-r border-slate-700/80 print:border-slate-500 w-24">Hora/Entrada</th>
                <th className="py-2.5 px-4 border-r border-slate-700/80 print:border-slate-500">Observações / Justificação</th>
                <th className="py-2.5 px-3 text-center w-28">Assiduidade Acumulada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 print:divide-slate-300">
              {classStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    Nenhum aluno matriculado nesta turma. Selecione outra turma acima.
                  </td>
                </tr>
              ) : (
                classStudents.map((student, idx) => {
                  const rec = studentsAttendance[student.id] || { status: 'P', note: '', entryTime: '08:30' };

                  return (
                    <tr
                      key={student.id}
                      className={`transition-colors border-b border-slate-200 print:border-slate-300 ${
                        idx % 2 === 1 ? 'bg-[#f8fafc]' : 'bg-white'
                      } hover:bg-sky-50/40`}
                    >
                      <td className="py-2 px-3 text-center font-mono font-bold text-slate-600 border-r border-slate-200 print:border-slate-300">
                        {String(idx + 1).padStart(2, '0')}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 print:border-slate-300">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={student.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'}
                            alt={student.name}
                            className="w-7 h-7 rounded-none object-cover border border-slate-300 print:hidden"
                          />
                          <div>
                            <span className="font-bold text-[#0b1f3a] text-xs block print:text-black">{student.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono">Proc: #{student.procNumber}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 print:border-slate-300">
                        {/* Screen Button Group */}
                        <div className="flex items-center justify-center gap-1 print:hidden">
                          {/* P */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'P')}
                            className={`w-8 h-7 font-bold text-xs transition-colors flex items-center justify-center border ${
                              rec.status === 'P'
                                ? 'bg-emerald-800 text-white border-emerald-900 shadow-none'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-emerald-50'
                            }`}
                            title="Presente"
                          >
                            P
                          </button>

                          {/* FJ */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'FJ')}
                            className={`w-8 h-7 font-bold text-xs transition-colors flex items-center justify-center border ${
                              rec.status === 'FJ'
                                ? 'bg-amber-700 text-white border-amber-800 shadow-none'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-amber-50'
                            }`}
                            title="Falta Justificada"
                          >
                            FJ
                          </button>

                          {/* FI */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'FI')}
                            className={`w-8 h-7 font-bold text-xs transition-colors flex items-center justify-center border ${
                              rec.status === 'FI'
                                ? 'bg-[#7a0c0c] text-white border-red-950 shadow-none'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-red-50'
                            }`}
                            title="Falta Injustificada"
                          >
                            FI
                          </button>

                          {/* A */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'A')}
                            className={`w-8 h-7 font-bold text-xs transition-colors flex items-center justify-center border ${
                              rec.status === 'A'
                                ? 'bg-orange-700 text-white border-orange-800 shadow-none'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-orange-50'
                            }`}
                            title="Atraso"
                          >
                            A
                          </button>
                        </div>

                        {/* Print Mode Status Text */}
                        <div className="hidden print:block text-center font-bold">
                          {rec.status === 'P' ? 'Presente (P)' : rec.status === 'FJ' ? 'Falta Justificada (FJ)' : rec.status === 'FI' ? 'Falta Injustificada (FI)' : 'Atraso (A)'}
                        </div>
                      </td>

                      <td className="py-2 px-3 text-center font-mono text-[11px] text-slate-600 border-r border-slate-200 print:border-slate-300">
                        {rec.entryTime || '—'}
                      </td>

                      <td className="py-2 px-4 border-r border-slate-200 print:border-slate-300">
                        <input
                          type="text"
                          value={rec.note || ''}
                          onChange={(e) => handleNoteChange(student.id, e.target.value)}
                          placeholder="Adicionar nota justificativa..."
                          className="w-full h-7 px-2 text-xs text-slate-800 placeholder:text-slate-400 bg-white border border-slate-300 focus:outline-none focus:border-[#0b1f3a] print:border-none print:p-0"
                        />
                      </td>

                      <td className="py-2 px-3 text-center">
                        <div className="text-[11px]">
                          <span className="font-bold text-slate-800">{student.attendanceRate ?? 100}%</span>
                          <span className="text-[10px] text-slate-500 block font-mono">
                            {student.unexcusedAbsences || 0} FI / {student.excusedAbsences || 0} FJ
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lesson Summary & Teacher Homologation Section */}
      <div className="bg-white rounded-none border border-slate-300 p-5 flex flex-col md:flex-row gap-6 print:border-black">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <label htmlFor="lesson-summary-field" className="block uppercase font-bold text-xs text-slate-800 tracking-wide">
                Sumário da Aula<span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-slate-500">
                Registo legal dos conteúdos lecionados
              </span>
            </div>
            <div className="flex items-center gap-2 print:hidden">
              <button
                type="button"
                onClick={() => setLessonSummary(`Aula n.º ${lessonNumber} • Unidade Temática: ${activeSubject?.name || 'Disciplina'}. Análise teórica e resolução orientada de exercícios práticos.`)}
                className="text-[11px] text-[#0b1f3a] hover:underline font-semibold cursor-pointer flex items-center gap-1"
                title="Inserir modelo base de sumário"
              >
                <span className="material-symbols-outlined text-[14px]">edit_note</span>
                <span>Modelo Padrão</span>
              </button>
              <button
                type="button"
                onClick={() => setLessonSummary('')}
                className="text-[11px] text-slate-400 hover:text-red-600 font-semibold cursor-pointer"
                title="Limpar campo de sumário"
              >
                Limpar
              </button>
            </div>
          </div>
          <textarea
            id="lesson-summary-field"
            rows={4}
            value={lessonSummary}
            onChange={(e) => setLessonSummary(e.target.value)}
            className="w-full p-3.5 rounded-none bg-white border border-slate-300 text-xs text-slate-800 leading-relaxed focus:outline-none focus:border-[#0b1f3a] focus:ring-1 focus:ring-[#0b1f3a] print:border-black"
            placeholder="Escreva aqui o sumário oficial da aula: objetivos pedagógicos, temas abordados, exercícios realizados e orientações de TPC para os estudantes..."
          />
          <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
            <span>O sumário fica gravado na caderneta e disponível para auditoria da Direção Pedagógica.</span>
            <span className="font-mono">{lessonSummary.length} caracteres</span>
          </div>
        </div>

        <div className="w-full md:w-80 flex flex-col justify-between p-4 bg-slate-50 border border-slate-300 print:bg-transparent print:border-black">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
              Homologação Docente Digital
            </span>
            <div className="flex items-center gap-2 mb-2">
              <span className={`material-symbols-outlined text-[20px] ${isSigned ? 'text-emerald-800' : 'text-amber-700'}`}>
                {isSigned ? 'verified' : 'pending'}
              </span>
              <span className="font-bold text-xs text-[#0b1f3a]">
                {isSigned ? 'Caderneta Digital Rubricada' : 'Aguardando Assinatura'}
              </span>
            </div>
            {isSigned ? (
              <p className="text-[11px] text-slate-600 leading-tight">
                Rubricado por: <strong>{signedBy}</strong>
                <br />
                <span className="text-[10px] text-slate-500 font-mono">{signedAt}</span>
              </p>
            ) : (
              <p className="text-[11px] text-slate-500">
                A rubrica fecha a folha de presença e grava o registo permanente no histórico institucional.
              </p>
            )}
          </div>

          <div className="mt-3 flex gap-2 print:hidden">
            <button
              type="button"
              onClick={handleSignSheet}
              className="flex-1 py-2 px-3 rounded-none bg-[#0b1f3a] hover:bg-[#7a0c0c] text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 border border-[#0b1f3a] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">draw</span>
              <span>{isSigned ? 'Atualizar Rubrica' : 'Rubricar Digitalmente'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* History Modal */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in print:hidden">
          <div className="bg-white rounded-none border border-slate-400 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-4 bg-[#0b1f3a] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">history_edu</span>
                <h3 className="font-bold text-sm">Histórico de Cadernetas Gravadas na Base de Dados</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(false)}
                className="text-white hover:text-slate-300 p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              {allRecordedSheets.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Ainda não existem cadernetas gravadas no histórico da base de dados.
                </div>
              ) : (
                <div className="divide-y divide-slate-200 border border-slate-300">
                  {allRecordedSheets.map((sheet) => {
                    const studentCount = sheet.students?.length || 0;
                    const presCount = sheet.students?.filter((s) => s.status === 'P' || s.status === 'A').length || 0;
                    const rate = studentCount > 0 ? Math.round((presCount / studentCount) * 100) : 0;

                    return (
                      <div
                        key={sheet.id}
                        className="p-3.5 hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-[#0b1f3a]">{sheet.className}</span>
                            <span className="text-slate-400">•</span>
                            <span className="font-semibold text-xs text-slate-700">{sheet.subjectName}</span>
                            <span className={`px-2 py-0.2 rounded-none text-[10px] font-bold uppercase border ${
                              sheet.status === 'homologado'
                                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                : 'bg-slate-100 text-slate-700 border-slate-300'
                            }`}>
                              {sheet.status || 'aberto'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Data: <strong>{sheet.date}</strong> ({sheet.timeSlot || '08:30–10:00'}) • Docente: {sheet.teacherName}
                          </p>
                          <p className="text-[11px] text-slate-600 line-clamp-1 italic mt-1">
                            "{sheet.lessonSummary}"
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <span className="font-mono font-bold text-xs text-[#0b1f3a] block">{rate}% Presenças</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {presCount} / {studentCount} alunos
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleLoadSheet(sheet)}
                            className="px-3 py-1.5 rounded-none bg-[#0b1f3a] hover:bg-slate-800 text-white font-bold text-xs cursor-pointer border border-[#0b1f3a] flex items-center gap-1 shadow-xs"
                            title="Carregar registo completo desta aula"
                          >
                            <span className="material-symbols-outlined text-[15px]">file_open</span>
                            <span>Carregar</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteSheet(sheet)}
                            className="px-2.5 py-1.5 rounded-none bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs cursor-pointer border border-red-200 flex items-center gap-1 transition-colors"
                            title="Eliminar caderneta da base de dados"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                            <span>Eliminar</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-100 border-t border-slate-300 text-right">
              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(false)}
                className="px-4 py-2 rounded-none bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                Fechar
              </button>
            </div>

            {/* In-app Confirmation Dialog to eliminate sheet */}
            {sheetPendingDelete && (
              <div className="absolute inset-0 bg-black/60 z-30 flex items-center justify-center p-4">
                <div className="bg-white border-2 border-red-500 max-w-md w-full p-5 shadow-2xl animate-fade-in">
                  <div className="flex items-center gap-3 text-red-600 mb-3">
                    <span className="material-symbols-outlined text-[28px]">warning</span>
                    <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-900">
                      Eliminação
                    </h4>
                  </div>
                  <p className="text-xs text-slate-700 mb-4 leading-relaxed">
                    Tem a certeza que deseja eliminar da base de dados a caderneta da turma{' '}
                    <strong className="text-[#0b1f3a]">{sheetPendingDelete.className}</strong> ({sheetPendingDelete.subjectName}) registada na data{' '}
                    <strong className="text-[#0b1f3a]">{sheetPendingDelete.date}</strong>?
                  </p>
                  <p className="text-[11px] text-red-600 font-semibold mb-5 bg-red-50 p-2 border border-red-200">
                    Esta ação é irreversível e removerá as presenças desta aula do histórico.
                  </p>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setSheetPendingDelete(null)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-300 cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={confirmDeleteSheet}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete_forever</span>
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
