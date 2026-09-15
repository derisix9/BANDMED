import React, { useState, useMemo } from 'react';
import { Student, SchoolDatabase, StudentTrimesterRecord } from '../types';
import { dbService } from '../services/db';

interface ReportCardModalProps {
  student: Student | null;
  db: SchoolDatabase;
  onClose: () => void;
}

export const ReportCardModal: React.FC<ReportCardModalProps> = ({ student, db, onClose }) => {
  const [selectedTrimester, setSelectedTrimester] = useState<'all' | 1 | 2 | 3>('all');

  if (!student) return null;

  const studentClass = (db?.classes || []).find(
    (c) => (student.classId && c.id === student.classId) || (student.className && c.name === student.className)
  );

  const headTeacherName = studentClass?.headTeacherName || 'Prof. João Figueiredo';
  const directorName =
    db?.settings?.directorPedagogico ||
    (db?.users || []).find((u) => u.role === 'admin')?.name ||
    'A definir em Configurações';

  const getQualitative = (score: number) => {
    if (score >= 17.5) return 'Excelente';
    if (score >= 14.0) return 'Muito Bom';
    if (score >= 12.0) return 'Bom';
    if (score >= 9.5) return 'Suficiente';
    if (score >= 7.0) return 'Insuficiente';
    return 'Mau';
  };

  const getSituation = (score: number) => {
    if (score >= 14.0) return 'Transita (Dispensa)';
    if (score >= 9.5) return 'Transita';
    if (score >= 7.0) return 'Exame de Recurso';
    return 'Não Aprovado';
  };

  // 1. Fetch real 3-trimester records directly from the database service
  const threeTrimesterRecords: StudentTrimesterRecord[] = useMemo(() => {
    try {
      return dbService.getStudentThreeTrimesterGrades(student.id) || [];
    } catch {
      return [];
    }
  }, [student.id, db?.miniPautasStore, db?.students]);

  // Global averages for all 3 trimesters
  const avgT1 = useMemo(() => {
    if (threeTrimesterRecords.length === 0) return 0;
    const sum = threeTrimesterRecords.reduce((acc, curr) => acc + (Number(curr.mt1) || 0), 0);
    return Math.round((sum / threeTrimesterRecords.length) * 10) / 10;
  }, [threeTrimesterRecords]);

  const avgT2 = useMemo(() => {
    if (threeTrimesterRecords.length === 0) return 0;
    const sum = threeTrimesterRecords.reduce((acc, curr) => acc + (Number(curr.mt2) || 0), 0);
    return Math.round((sum / threeTrimesterRecords.length) * 10) / 10;
  }, [threeTrimesterRecords]);

  const avgT3 = useMemo(() => {
    if (threeTrimesterRecords.length === 0) return 0;
    const sum = threeTrimesterRecords.reduce((acc, curr) => acc + (Number(curr.mt3) || 0), 0);
    return Math.round((sum / threeTrimesterRecords.length) * 10) / 10;
  }, [threeTrimesterRecords]);

  const avgMFD = useMemo(() => {
    if (threeTrimesterRecords.length === 0) return Number(student.currentAverage) || 0;
    const sum = threeTrimesterRecords.reduce((acc, curr) => acc + (Number(curr.mfd) || 0), 0);
    return Math.round((sum / threeTrimesterRecords.length) * 10) / 10;
  }, [threeTrimesterRecords, student.currentAverage]);

  const handlePrint = () => {
    window.focus();
    window.print();
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 overflow-y-auto printable-modal-overlay print:p-0 print:m-0 print:block"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <style>{`
        @media print {
          @page {
            size: A4 portrait !important;
            margin: 6mm 6mm !important;
          }
        }
      `}</style>
      <div className="printable-document printable-portrait bg-white rounded-none max-w-5xl w-full shadow-2xl overflow-hidden flex flex-col my-4 sm:my-8 border border-slate-400 print:m-0 print:border-none print:shadow-none print:w-full">
        {/* Top Control Bar (Hidden on print) */}
        <div className="px-6 py-3.5 bg-[#0b1f3a] text-white flex flex-wrap items-center justify-between gap-3 no-print print:hidden sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-400 text-[20px]">verified</span>
            <span className="font-bold text-sm">Boletim Escolar Oficial dos Três Trimestres</span>
          </div>

          {/* Trimester View Switcher */}
          <div className="flex items-center bg-white/10 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setSelectedTrimester('all')}
              className={`px-3 py-1 font-bold rounded-md transition-colors cursor-pointer ${
                selectedTrimester === 'all'
                  ? 'bg-amber-400 text-[#0b1f3a]'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Os 3 Trimestres (Geral)
            </button>
            <button
              onClick={() => setSelectedTrimester(1)}
              className={`px-2.5 py-1 font-bold rounded-md transition-colors cursor-pointer ${
                selectedTrimester === 1
                  ? 'bg-amber-400 text-[#0b1f3a]'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              1.º Trim
            </button>
            <button
              onClick={() => setSelectedTrimester(2)}
              className={`px-2.5 py-1 font-bold rounded-md transition-colors cursor-pointer ${
                selectedTrimester === 2
                  ? 'bg-amber-400 text-[#0b1f3a]'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              2.º Trim
            </button>
            <button
              onClick={() => setSelectedTrimester(3)}
              className={`px-2.5 py-1 font-bold rounded-md transition-colors cursor-pointer ${
                selectedTrimester === 3
                  ? 'bg-amber-400 text-[#0b1f3a]'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              3.º Trim
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              title="Fechar Janela do Boletim"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>

        {/* Official Printable Document Content */}
        <div className="p-8 text-slate-800 font-serif leading-relaxed text-xs">
          {/* Official Letterhead */}
          <div className="text-center border-b-2 border-[#0b1f3a] pb-6 mb-6">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 flex items-center justify-center p-1 shadow-xs overflow-hidden">
                <img
                  src={db.settings?.logoUrl || '/school_emblem.png'}
                  alt={db.settings?.schoolName || 'Emblema Institucional'}
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            <h2 className="text-xs uppercase tracking-widest font-bold text-slate-600 font-sans">
              República de Angola • Ministério da Educação
            </h2>
            <h1 className="text-xl font-bold uppercase tracking-tight text-[#0b1f3a] font-sans mt-1">
              {db?.settings?.schoolName || 'Complexo Escolar BandMed'}
            </h1>
            <p className="text-[11px] text-slate-500 font-sans mt-0.5">
              {db?.settings?.decreeAuthorization || 'Decreto Presidencial n.º 124/22'} • NIF: {db?.settings?.nif || '5417281901'}
            </p>
            <p className="text-[11px] text-slate-500 font-sans">
              {db?.settings?.address || 'Luanda, Angola'} • Contacto: {db?.settings?.phone || '+244 923 110 490'}
            </p>
            <div className="inline-block mt-3 px-4 py-1 bg-slate-100 border border-slate-300 font-sans font-bold text-xs uppercase tracking-wider text-[#7a0c0c]">
              {selectedTrimester === 'all'
                ? `Boletim Oficial de Aproveitamento — Todos os 3 Trimestres (${db?.settings?.currentAcademicYear || '2024 / 2025'})`
                : `Boletim de Aproveitamento — ${selectedTrimester}.º Trimestre (${db?.settings?.currentAcademicYear || '2024 / 2025'})`}
            </div>
          </div>

          {/* Student Identifiers Grid com Foto Tipo Passe Oficial */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-slate-50 border border-slate-300 mb-6 font-sans text-xs">
            <div className="w-16 h-20 bg-slate-200 border-2 border-[#0b1f3a] overflow-hidden shrink-0">
              <img
                src={student.docPassPhoto || student.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'}
                alt={student.name || 'Estudante'}
                className="w-full h-full object-cover object-center"
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1 w-full">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Nome do Aluno</span>
                <strong className="text-[#0b1f3a] text-sm block">{student.name || 'Sem nome'}</strong>
                <span className="text-[10px] text-slate-500 font-semibold">{student.gender === 'Feminino' || student.gender === 'F' ? 'Feminino' : 'Masculino'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Processo & N.º BI</span>
                <strong className="font-mono text-slate-800 block">Proc. #{student.procNumber || 'N/D'}</strong>
                <span className="font-mono text-[11px] text-slate-600 block">BI: {student.biNumber || student.citizenCard || 'Pendente'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Turma & Nível</span>
                <strong className="text-slate-800 block">{studentClass?.name || student.className || '10º Ano A'} ({studentClass?.room || 'Sala 12'})</strong>
                <span className="text-[10px] text-slate-500 block">{student.grade || '10.ª Classe'} • {studentClass?.shift || 'Manhã'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Encarregado / Contacto</span>
                <strong className="text-slate-800 block">{student.guardianName || 'Não registado'}</strong>
                <span className="text-[10px] text-slate-600 font-bold block">{student.guardianRelation || 'Encarregado'} • {student.guardianPhone || 'Contacto pendente'}</span>
              </div>
            </div>
          </div>

          {/* Quick Summary KPI Cards for the 3 Trimesters */}
          <div className="grid grid-cols-4 gap-3 mb-6 font-sans text-xs no-print print:hidden">
            <div className={`p-3 border rounded-xl ${selectedTrimester === 1 || selectedTrimester === 'all' ? 'bg-slate-50 border-slate-300' : 'opacity-60 bg-white border-slate-200'}`}>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Média 1.º Trimestre</span>
              <strong className="text-base font-headline font-bold text-[#0b1f3a]">{avgT1.toFixed(1)} val.</strong>
              <span className="text-[10px] text-slate-500 block">{avgT1 >= 10 ? 'Aproveitamento Positivo' : 'Insuficiente'}</span>
            </div>
            <div className={`p-3 border rounded-xl ${selectedTrimester === 2 || selectedTrimester === 'all' ? 'bg-slate-50 border-slate-300' : 'opacity-60 bg-white border-slate-200'}`}>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Média 2.º Trimestre</span>
              <strong className="text-base font-headline font-bold text-[#0b1f3a]">{avgT2.toFixed(1)} val.</strong>
              <span className="text-[10px] text-slate-500 block">{avgT2 >= 10 ? 'Aproveitamento Positivo' : 'Insuficiente'}</span>
            </div>
            <div className={`p-3 border rounded-xl ${selectedTrimester === 3 || selectedTrimester === 'all' ? 'bg-slate-50 border-slate-300' : 'opacity-60 bg-white border-slate-200'}`}>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Média 3.º Trimestre</span>
              <strong className="text-base font-headline font-bold text-[#0b1f3a]">{avgT3.toFixed(1)} val.</strong>
              <span className="text-[10px] text-slate-500 block">{avgT3 >= 10 ? 'Aproveitamento Positivo' : 'Insuficiente'}</span>
            </div>
            <div className="p-3 border border-amber-300 bg-amber-50/60 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-[#7a0c0c] block">Média Final (MFD)</span>
              <strong className="text-base font-headline font-bold text-[#7a0c0c]">{avgMFD.toFixed(1)} val.</strong>
              <span className="text-[10px] font-bold text-emerald-800 block">
                {avgMFD >= 14 ? 'Transita com Dispensa' : avgMFD >= 9.5 ? 'Aprovado / Transita' : 'Exame de Recurso'}
              </span>
            </div>
          </div>

          {/* VIEW A: Complete 3-Trimester Master Table - Excel Styled with System Palette */}
          {selectedTrimester === 'all' ? (
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-left border-collapse border border-slate-300 print:border-slate-400 font-sans text-xs print:text-[8pt]">
                <thead>
                  <tr className="bg-[#0b1f3a] text-white uppercase text-[10px] print:bg-[#0b1f3a] print:text-white">
                    <th rowSpan={2} className="p-2 border border-slate-600 print:border-slate-500 font-extrabold">Disciplina Curricular</th>
                    <th colSpan={4} className="p-1.5 border border-slate-600 print:border-slate-500 text-center bg-[#0d2647] print:bg-[#0d2647] font-extrabold">1.º Trimestre</th>
                    <th colSpan={4} className="p-1.5 border border-slate-600 print:border-slate-500 text-center bg-[#12335e] print:bg-[#12335e] font-extrabold">2.º Trimestre</th>
                    <th colSpan={4} className="p-1.5 border border-slate-600 print:border-slate-500 text-center bg-[#183f73] print:bg-[#183f73] font-extrabold">3.º Trimestre</th>
                    <th rowSpan={2} className="p-2 border border-slate-600 print:border-slate-500 text-center bg-[#7a0c0c] text-amber-300 print:bg-[#7a0c0c] print:text-amber-300 font-black">MFD</th>
                    <th rowSpan={2} className="p-2 border border-slate-600 print:border-slate-500 text-center font-extrabold">Situação Final</th>
                  </tr>
                  <tr className="bg-[#183c6b] text-slate-200 text-[9px] uppercase font-bold text-center print:bg-[#183c6b] print:text-slate-200">
                    <th className="p-1 border border-slate-600 print:border-slate-500">MAC</th>
                    <th className="p-1 border border-slate-600 print:border-slate-500">NPP</th>
                    <th className="p-1 border border-slate-600 print:border-slate-500">NPT</th>
                    <th className="p-1 border border-slate-600 print:border-slate-500 bg-[#0f2849] text-amber-300 print:bg-[#0f2849] print:text-amber-300 font-black">MT1</th>

                    <th className="p-1 border border-slate-600 print:border-slate-500">MAC</th>
                    <th className="p-1 border border-slate-600 print:border-slate-500">NPP</th>
                    <th className="p-1 border border-slate-600 print:border-slate-500">NPT</th>
                    <th className="p-1 border border-slate-600 print:border-slate-500 bg-[#0f2849] text-amber-300 print:bg-[#0f2849] print:text-amber-300 font-black">MT2</th>

                    <th className="p-1 border border-slate-600 print:border-slate-500">MAC</th>
                    <th className="p-1 border border-slate-600 print:border-slate-500">NPP</th>
                    <th className="p-1 border border-slate-600 print:border-slate-500">NPT</th>
                    <th className="p-1 border border-slate-600 print:border-slate-500 bg-[#0f2849] text-amber-300 print:bg-[#0f2849] print:text-amber-300 font-black">MT3</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 print:divide-slate-300">
                  {threeTrimesterRecords.length === 0 ? (
                    <tr>
                      <td colSpan={15} className="p-4 border border-slate-300 print:border-slate-400 text-center text-slate-500 italic">
                        Ainda não existem notas lançadas para este aluno no sistema.
                      </td>
                    </tr>
                  ) : (
                    threeTrimesterRecords.map((rec, idx) => (
                      <tr key={idx} className={idx % 2 === 1 ? 'bg-[#f8fafc]' : 'bg-white'}>
                        <td className="p-1.5 px-2 border border-slate-300 print:border-slate-300 font-bold text-[#0b1f3a] whitespace-nowrap">
                          {rec.subjectName}
                        </td>

                        {/* 1º Trimestre */}
                        <td className="p-1 border border-slate-300 print:border-slate-300 text-center font-mono text-[11px] print:text-[8pt]">{rec.mac1 ?? '-'}</td>
                        <td className="p-1 border border-slate-300 print:border-slate-300 text-center font-mono text-[11px] print:text-[8pt]">{rec.npp1 ?? '-'}</td>
                        <td className="p-1 border border-slate-300 print:border-slate-300 text-center font-mono text-[11px] print:text-[8pt]">{rec.npt1 ?? '-'}</td>
                        <td className="p-1 border border-slate-300 print:border-slate-300 text-center font-mono font-bold text-[#0b1f3a] bg-blue-50/50 print:bg-blue-50/50">
                          {rec.mt1 ?? '-'}
                        </td>

                        {/* 2º Trimestre */}
                        <td className="p-1 border border-slate-300 print:border-slate-300 text-center font-mono text-[11px] print:text-[8pt]">{rec.mac2 ?? '-'}</td>
                        <td className="p-1 border border-slate-300 print:border-slate-300 text-center font-mono text-[11px] print:text-[8pt]">{rec.npp2 ?? '-'}</td>
                        <td className="p-1 border border-slate-300 print:border-slate-300 text-center font-mono text-[11px] print:text-[8pt]">{rec.npt2 ?? '-'}</td>
                        <td className="p-1 border border-slate-300 print:border-slate-300 text-center font-mono font-bold text-[#0b1f3a] bg-blue-50/50 print:bg-blue-50/50">
                          {rec.mt2 ?? '-'}
                        </td>

                        {/* 3º Trimestre */}
                        <td className="p-1 border border-slate-300 print:border-slate-300 text-center font-mono text-[11px] print:text-[8pt]">{rec.mac3 ?? '-'}</td>
                        <td className="p-1 border border-slate-300 print:border-slate-300 text-center font-mono text-[11px] print:text-[8pt]">{rec.npp3 ?? '-'}</td>
                        <td className="p-1 border border-slate-300 print:border-slate-300 text-center font-mono text-[11px] print:text-[8pt]">{rec.npt3 ?? '-'}</td>
                        <td className="p-1 border border-slate-300 print:border-slate-300 text-center font-mono font-bold text-[#0b1f3a] bg-blue-50/50 print:bg-blue-50/50">
                          {rec.mt3 ?? '-'}
                        </td>

                        {/* MFD */}
                        <td className="p-1 border border-slate-300 print:border-slate-300 text-center font-mono font-black text-xs print:text-[8.5pt] bg-rose-50/70 text-[#7a0c0c] print:bg-rose-50/70">
                          {rec.mfd ?? '-'}
                        </td>

                        {/* Situação */}
                        <td className="p-1 border border-slate-300 print:border-slate-300 text-center font-bold text-[10px] whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full inline-block ${
                            Number(rec.mfd) >= 10
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 print:border-emerald-300'
                              : 'bg-rose-50 text-rose-800 border border-rose-200 print:border-rose-300'
                          }`}>
                            {rec.situation || (Number(rec.mfd) >= 10 ? 'Aprovado' : 'Recurso')}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}

                  {/* Summary Row across 3 trimesters */}
                  <tr className="bg-[#0b1f3a] text-white font-bold print:bg-[#0b1f3a] print:text-white">
                    <td className="p-1.5 px-2 border border-slate-600 print:border-slate-500 uppercase text-right text-[10px]">
                      Médias Gerais:
                    </td>
                    <td colSpan={3} className="p-1 border border-slate-600 print:border-slate-500 text-right text-[9px] text-slate-300">1.º Trim:</td>
                    <td className="p-1 border border-slate-600 print:border-slate-500 text-center font-mono font-bold text-amber-300 bg-[#12335e] print:bg-[#12335e]">
                      {avgT1.toFixed(1)}
                    </td>
                    <td colSpan={3} className="p-1 border border-slate-600 print:border-slate-500 text-right text-[9px] text-slate-300">2.º Trim:</td>
                    <td className="p-1 border border-slate-600 print:border-slate-500 text-center font-mono font-bold text-amber-300 bg-[#12335e] print:bg-[#12335e]">
                      {avgT2.toFixed(1)}
                    </td>
                    <td colSpan={3} className="p-1 border border-slate-600 print:border-slate-500 text-right text-[9px] text-slate-300">3.º Trim:</td>
                    <td className="p-1 border border-slate-600 print:border-slate-500 text-center font-mono font-bold text-amber-300 bg-[#12335e] print:bg-[#12335e]">
                      {avgT3.toFixed(1)}
                    </td>
                    <td className="p-1 border border-slate-600 print:border-slate-500 text-center text-xs font-mono font-black text-amber-300 bg-[#7a0c0c] print:bg-[#7a0c0c]">
                      {avgMFD.toFixed(1)}
                    </td>
                    <td className="p-1 border border-slate-600 print:border-slate-500 text-center text-[10px] text-emerald-300 font-bold bg-[#0d2647] print:bg-[#0d2647]">
                      {avgMFD >= 14 ? 'Transita (Dispensa)' : avgMFD >= 9.5 ? 'Transita' : 'Exame'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            /* VIEW B: Focused Single Trimester Table (1, 2, or 3) */
            <table className="w-full text-left border-collapse border border-slate-300 print:border-slate-400 font-sans text-xs print:text-[8pt] mb-6">
              <thead>
                <tr className="bg-[#0b1f3a] text-white uppercase text-[10px] print:bg-[#0b1f3a] print:text-white">
                  <th className="p-2 border border-slate-600 print:border-slate-500 font-extrabold">Disciplina Curricular</th>
                  <th className="p-2 border border-slate-600 print:border-slate-500 text-center">MAC (30%)</th>
                  <th className="p-2 border border-slate-600 print:border-slate-500 text-center">NPP (30%)</th>
                  <th className="p-2 border border-slate-600 print:border-slate-500 text-center">NPT (40%)</th>
                  <th className="p-2 border border-slate-600 print:border-slate-500 text-center bg-[#7a0c0c] text-amber-300 font-black print:bg-[#7a0c0c] print:text-amber-300">
                    Média ({selectedTrimester}.º Trimestre)
                  </th>
                  <th className="p-2 border border-slate-600 print:border-slate-500 font-extrabold">Apreciação Qualitativa</th>
                  <th className="p-2 border border-slate-600 print:border-slate-500 font-extrabold">Situação Provisória</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 print:divide-slate-300">
                {threeTrimesterRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-4 border border-slate-300 print:border-slate-400 text-center text-slate-500 italic">
                      Ainda não existem notas lançadas para este aluno no sistema.
                    </td>
                  </tr>
                ) : (
                  threeTrimesterRecords.map((rec, idx) => {
                    const mac = selectedTrimester === 1 ? rec.mac1 : selectedTrimester === 2 ? rec.mac2 : rec.mac3;
                    const npp = selectedTrimester === 1 ? rec.npp1 : selectedTrimester === 2 ? rec.npp2 : rec.npp3;
                    const npt = selectedTrimester === 1 ? rec.npt1 : selectedTrimester === 2 ? rec.npt2 : rec.npt3;
                    const mt = selectedTrimester === 1 ? rec.mt1 : selectedTrimester === 2 ? rec.mt2 : rec.mt3;
                    const score = Number(mt) || 0;
                    return (
                      <tr key={idx} className={idx % 2 === 1 ? 'bg-[#f8fafc]' : 'bg-white'}>
                        <td className="p-1.5 px-2 border border-slate-300 print:border-slate-300 font-bold text-[#0b1f3a]">{rec.subjectName}</td>
                        <td className="p-1.5 border border-slate-300 print:border-slate-300 text-center font-mono">{mac ?? '-'}</td>
                        <td className="p-1.5 border border-slate-300 print:border-slate-300 text-center font-mono">{npp ?? '-'}</td>
                        <td className="p-1.5 border border-slate-300 print:border-slate-300 text-center font-mono">{npt ?? '-'}</td>
                        <td className="p-1.5 border border-slate-300 print:border-slate-300 text-center font-mono font-bold text-[#0b1f3a] bg-blue-50/50 print:bg-blue-50/50">
                          {mt ?? '-'}
                        </td>
                        <td className="p-1.5 border border-slate-300 print:border-slate-300 font-medium">{getQualitative(score)}</td>
                        <td className="p-1.5 border border-slate-300 print:border-slate-300 font-semibold">
                          <span className={`px-2 py-0.5 rounded-full inline-block text-[10px] ${
                            score >= 10
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}>
                            {getSituation(score)}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
                <tr className="bg-[#0b1f3a] text-white font-bold print:bg-[#0b1f3a] print:text-white">
                  <td className="p-2 border border-slate-600 print:border-slate-500 uppercase text-right" colSpan={4}>
                    Média do {selectedTrimester}.º Trimestre:
                  </td>
                  <td className="p-2 border border-slate-600 print:border-slate-500 text-center text-sm font-mono font-black text-amber-300 bg-[#7a0c0c] print:bg-[#7a0c0c]">
                    {(selectedTrimester === 1 ? avgT1 : selectedTrimester === 2 ? avgT2 : avgT3).toFixed(1)} Valores
                  </td>
                  <td className="p-2 border border-slate-600 print:border-slate-500" colSpan={2}>
                    Classificação Trimestral:{' '}
                    <strong className="text-amber-300">
                      {(selectedTrimester === 1 ? avgT1 : selectedTrimester === 2 ? avgT2 : avgT3) >= 16
                        ? 'Excelente'
                        : (selectedTrimester === 1 ? avgT1 : selectedTrimester === 2 ? avgT2 : avgT3) >= 14
                        ? 'Muito Bom'
                        : (selectedTrimester === 1 ? avgT1 : selectedTrimester === 2 ? avgT2 : avgT3) >= 10
                        ? 'Satisfatório'
                        : 'Abaixo da Média'}
                    </strong>
                  </td>
                </tr>
              </tbody>
            </table>
          )}

          {/* Attendance and Behavioral Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-none bg-slate-50 border border-slate-200 mb-8 font-sans text-xs">
            <div>
              <h4 className="font-bold uppercase text-slate-700 mb-1">Assiduidade do Ano Letivo</h4>
              <ul className="space-y-1 text-slate-600">
                <li>
                  • Carga Horária Prevista: <strong>320 Horas / Aulas</strong>
                </li>
                <li>
                  • Presenças Computadas:{' '}
                  <strong>
                    {Math.round(320 * ((student.attendanceRate || 95) / 100))} presenças ({student.attendanceRate ?? 95}%)
                  </strong>
                </li>
                <li>
                  • Faltas Justificadas: <strong>{student.excusedAbsences ?? 0} faltas</strong>
                </li>
                <li>
                  • Faltas Injustificadas: <strong>{student.unexcusedAbsences ?? 0} faltas</strong>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold uppercase text-slate-700 mb-1">Apreciação do Conselho de Turma</h4>
              <p className="text-slate-600 italic">
                {avgMFD >= 14
                  ? `"Aluno ${student.name} com atitude exemplar, rigor no cumprimento dos sumários curriculares e excelente convivência cívica."`
                  : avgMFD >= 10
                  ? `"Aluno com bom comportamento e assiduidade regular, incentivado a aprofundar estudos nas disciplinas de base."`
                  : `"Recomenda-se acompanhamento tutorial pedagógico reforçado e comparência do Encarregado de Educação."`}
              </p>
            </div>
          </div>

          {/* Signatures & Seal */}
          <div className="grid grid-cols-3 gap-6 text-center font-sans text-xs pt-8 border-t border-slate-300">
            <div>
              <div className="h-10 border-b border-slate-400 mx-4" />
              <span className="font-bold text-slate-800 block mt-1">O Diretor de Turma</span>
              <span className="text-[10px] text-slate-500">{headTeacherName}</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-none border-2 border-dashed border-slate-300 flex items-center justify-center text-[10px] text-slate-400 font-mono">
                [Carimbo da Secretaria]
              </div>
              <span className="text-[10px] text-slate-500 mt-1">Autenticação Notarial</span>
            </div>
            <div>
              <div className="h-10 border-b border-slate-400 mx-4" />
              <span className="font-bold text-slate-800 block mt-1">O Diretor Pedagógico</span>
              <span className="text-[10px] text-slate-500">{directorName}</span>
            </div>
          </div>

          <div className="text-center text-[10px] text-slate-400 font-sans mt-8">
            Emitido via Sistema BandMed Core v3.4.2 em {new Date().toLocaleDateString('pt-PT')} • Chave de Validação: BM-CERT-{(Math.random()*1e8|0).toString(16).toUpperCase()}
          </div>
        </div>

        {/* Modal Bottom Action Bar (Hidden in Print) */}
        <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-300 flex flex-wrap items-center justify-between gap-3 no-print print:hidden">
          <div className="text-xs text-slate-600 font-sans">
            Boletim Escolar Oficial • Aluno(a): <strong className="text-slate-900">{student.name}</strong> • Proc. N.º: <span className="font-mono font-bold text-[#0b1f3a]">{student.procNumber}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#7a0c0c] hover:bg-[#5e0909] text-white font-bold text-xs border border-[#7a0c0c] cursor-pointer transition-colors shadow-xs"
              title="Imprimir Boletim Oficial de Notas"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              <span>Imprimir Boletim</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs cursor-pointer transition-colors border border-slate-300"
              title="Fechar Janela do Boletim"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
              <span>Fechar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
