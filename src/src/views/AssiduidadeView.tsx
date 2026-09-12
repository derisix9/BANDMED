import React, { useState } from 'react';
import { SchoolDatabase, AttendanceRecord, UserRole } from '../types';
import { dbService } from '../services/db';

interface AssiduidadeViewProps {
  db: SchoolDatabase;
  currentUserRole: UserRole;
  initialClassId?: string | number;
}

export const AssiduidadeView: React.FC<AssiduidadeViewProps> = ({
  db,
  currentUserRole,
  initialClassId
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(
    initialClassId ? String(initialClassId) : (db.classes[0]?.id || '')
  );
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(db.subjects[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState<string>('2024-10-24');
  const [timeSlot, setTimeSlot] = useState<string>('08:30–10:00');
  const [lessonSummary, setLessonSummary] = useState<string>(
    'Introdução ao estudo das funções trigonométricas (círculo trigonométrico e radianos). Resolução dos exercícios 1 a 6 da página 48 do manual oficial.'
  );
  const [isSigned, setIsSigned] = useState<boolean>(true);
  const [signedBy, setSignedBy] = useState<string>('Prof. João Figueiredo');

  // Active class and students
  const activeClass = db.classes.find((c) => String(c.id) === String(selectedClassId)) || db.classes[0];
  const activeSubject = db.subjects.find((s) => String(s.id) === String(selectedSubjectId)) || db.subjects[0];
  const classStudents = activeClass ? (db.students || []).filter((s) => s.classId === activeClass.id) : [];

  // Local state for attendance records
  const [records, setRecords] = useState<Record<string, { status: 'P' | 'FJ' | 'FI' | 'A'; note?: string }>>({
    'std-1': { status: 'P', note: 'Presente' },
    'std-2': { status: 'P', note: 'Participativa' },
    'std-3': { status: 'FJ', note: 'Atestado médico entregue na secretaria' },
    'std-4': { status: 'A', note: 'Chegou às 08:42 com atraso justificado' },
    'std-5': { status: 'P', note: 'Presente' },
    'std-6': { status: 'FI', note: 'Faltou sem aviso prévio. SMS enviado ao encarregado.' }
  });

  const handleStatusChange = (studentId: string, status: 'P' | 'FJ' | 'FI' | 'A') => {
    setRecords((prev) => ({
      ...prev,
      [studentId]: { ...(prev[studentId] || { note: '' }), status }
    }));
  };

  const handleMarkAllPresent = () => {
    const updated: Record<string, { status: 'P' | 'FJ' | 'FI' | 'A'; note?: string }> = {};
    classStudents.forEach((s) => {
      updated[s.id] = { status: 'P', note: 'Presente' };
    });
    setRecords(updated);
  };

  const handleSignSheet = () => {
    setIsSigned(true);
    setSignedBy(currentUserRole === 'professor' ? 'Prof.ª Marta Fontes' : 'Prof. João Figueiredo');
    alert('Caderneta Diária rubricada e registada com sucesso no sistema BandMed Core!');
  };

  // Stats calculation
  const recordList = Object.values(records) as { status: 'P' | 'FJ' | 'FI' | 'A'; note?: string }[];
  const totalStudents = classStudents.length || 6;
  const countP = recordList.filter((r) => r.status === 'P').length;
  const countFJ = recordList.filter((r) => r.status === 'FJ').length;
  const countFI = recordList.filter((r) => r.status === 'FI').length;
  const countA = recordList.filter((r) => r.status === 'A').length;

  return (
    <div className="flex flex-col w-full gap-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
              Registo Operacional de Sala
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#0b1f3a]" />
            <span className="text-xs font-semibold text-[#0b1f3a]">Caderneta Diária Oficial</span>
          </div>
          <h1 className="font-headline text-2xl lg:text-3xl font-extrabold text-[#0b1f3a] tracking-tight">
            Assiduidade & Sumário de Aula
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Lançamento de presenças, faltas justificadas, atrasos e rubrica digital de homologação.
          </p>
        </div>

        {/* Quick Bulk Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllPresent}
            className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[17px]">done_all</span>
            <span>Marcar Todos Presentes</span>
          </button>
        </div>
      </div>

      {/* Class & Subject Selector Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="block uppercase font-bold text-slate-500 mb-1">Turma & Ciclo</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full h-9 px-3 rounded-lg bg-slate-100 font-bold text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#0b1f3a]"
          >
            {db.classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.room})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block uppercase font-bold text-slate-500 mb-1">Disciplina Curricular</label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full h-9 px-3 rounded-lg bg-slate-100 font-bold text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#0b1f3a]"
          >
            {db.subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block uppercase font-bold text-slate-500 mb-1">Data da Aula</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full h-9 px-3 rounded-lg bg-slate-100 font-medium text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#0b1f3a]"
          />
        </div>

        <div>
          <label className="block uppercase font-bold text-slate-500 mb-1">Bloco de Horário</label>
          <input
            type="text"
            value={timeSlot}
            onChange={(e) => setTimeSlot(e.target.value)}
            className="w-full h-9 px-3 rounded-lg bg-slate-100 font-medium text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#0b1f3a]"
          />
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total de Alunos</span>
          <span className="font-headline text-xl font-bold text-[#0b1f3a]">{totalStudents}</span>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-emerald-700 block">Presentes (P)</span>
          <span className="font-headline text-xl font-bold text-emerald-700">{countP}</span>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-amber-700 block">Faltas Just. (FJ)</span>
          <span className="font-headline text-xl font-bold text-amber-700">{countFJ}</span>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-[#7a0c0c] block">Faltas Inj. (FI)</span>
          <span className="font-headline text-xl font-bold text-[#7a0c0c]">{countFI}</span>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-orange-700 block">Atrasos (A)</span>
          <span className="font-headline text-xl font-bold text-orange-700">{countA}</span>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0b1f3a] text-[20px]">how_to_reg</span>
            <span className="font-bold text-xs text-slate-800">
              Folha de Presenças: {activeClass.name} • {activeSubject.name}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            {selectedDate} ({timeSlot})
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <th className="py-3 px-4 w-12 text-center">N.º</th>
                <th className="py-3 px-3">Aluno</th>
                <th className="py-3 px-3 text-center">Estado de Assiduidade</th>
                <th className="py-3 px-4">Observações / Justificação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classStudents.map((student, idx) => {
                const rec = records[student.id] || { status: 'P', note: '' };

                return (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-400">
                      {String(idx + 1).padStart(2, '0')}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={student.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'}
                          alt={student.name}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <span className="font-bold text-[#0b1f3a] text-sm block">{student.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">Proc: #{student.procNumber}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* P */}
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'P')}
                          className={`w-9 h-8 rounded-lg font-bold text-xs transition-colors flex items-center justify-center ${
                            rec.status === 'P'
                              ? 'bg-emerald-700 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-800'
                          }`}
                          title="Presente"
                        >
                          P
                        </button>

                        {/* FJ */}
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'FJ')}
                          className={`w-9 h-8 rounded-lg font-bold text-xs transition-colors flex items-center justify-center ${
                            rec.status === 'FJ'
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-800'
                          }`}
                          title="Falta Justificada"
                        >
                          FJ
                        </button>

                        {/* FI */}
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'FI')}
                          className={`w-9 h-8 rounded-lg font-bold text-xs transition-colors flex items-center justify-center ${
                            rec.status === 'FI'
                              ? 'bg-[#7a0c0c] text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-800'
                          }`}
                          title="Falta Injustificada"
                        >
                          FI
                        </button>

                        {/* A */}
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'A')}
                          className={`w-9 h-8 rounded-lg font-bold text-xs transition-colors flex items-center justify-center ${
                            rec.status === 'A'
                              ? 'bg-orange-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-orange-50 hover:text-orange-800'
                          }`}
                          title="Atraso"
                        >
                          A
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        value={rec.note || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setRecords((prev) => ({
                            ...prev,
                            [student.id]: { ...prev[student.id], note: val }
                          }));
                        }}
                        placeholder="Adicionar nota justificativa..."
                        className="w-full h-8 px-2.5 rounded-lg bg-slate-100 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-1 focus:ring-[#0b1f3a]"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lesson Summary & Teacher Signature Block */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <label className="block uppercase font-bold text-xs text-slate-700 mb-2">
            Sumário Oficial da Aula (Diário de Classe)
          </label>
          <textarea
            rows={3}
            value={lessonSummary}
            onChange={(e) => setLessonSummary(e.target.value)}
            className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed focus:bg-white focus:ring-1 focus:ring-[#0b1f3a]"
            placeholder="Descreva detalhadamente os tópicos abordados e exercícios resolvidos..."
          />
        </div>

        <div className="w-full md:w-80 flex flex-col justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Homologação Docente
            </span>
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-emerald-700 text-[20px]">
                {isSigned ? 'verified' : 'pending'}
              </span>
              <span className="font-bold text-xs text-[#0b1f3a]">
                {isSigned ? 'Caderneta Digital Rubricada' : 'Aguardando Assinatura'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Assinado por: <strong>{signedBy}</strong> às 09:45. Registo imutável.
            </p>
          </div>

          <button
            onClick={handleSignSheet}
            className="mt-3 w-full py-2.5 px-4 rounded-xl bg-[#0b1f3a] hover:bg-[#7a0c0c] text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span className="material-symbols-outlined text-[17px]">draw</span>
            <span>Rubricar Digitalmente</span>
          </button>
        </div>
      </div>
    </div>
  );
};
