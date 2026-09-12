import React, { useState } from 'react';
import { SchoolDatabase, GradeRecord, UserRole } from '../types';

interface PautasViewProps {
  db: SchoolDatabase;
  currentUserRole: UserRole;
}

export const PautasView: React.FC<PautasViewProps> = ({ db, currentUserRole }) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(
    db.classes[0]?.id ? String(db.classes[0].id) : ''
  );
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    db.subjects[1]?.id ? String(db.subjects[1].id) : (db.subjects[0]?.id ? String(db.subjects[0].id) : '')
  );
  const [selectedTrimester, setSelectedTrimester] = useState<'1' | '2' | '3'>('1');
  const [isDirectorSigned, setIsDirectorSigned] = useState<boolean>(false);

  const activeClass = db.classes.find((c) => String(c.id) === String(selectedClassId)) || db.classes[0];
  const activeSubject = db.subjects.find((s) => String(s.id) === String(selectedSubjectId)) || db.subjects[1] || db.subjects[0];

  // Editable grades state
  const [gradeRows, setGradeRows] = useState<GradeRecord[]>([
    {
      id: 1,
      examId: 1,
      studentId: 1,
      mac: 19.4,
      npp: 19.0,
      npt: 18.5,
      finalScore: 19.1,
      qualitative: 'Excelente',
      situation: 'Transita (Dispensa)',
      teacherNote: 'Excelente rigor conceitual e laboratorial.'
    },
    {
      id: 2,
      examId: 1,
      studentId: 2,
      mac: 14.8,
      npp: 15.2,
      npt: 16.0,
      finalScore: 15.4,
      qualitative: 'Bom',
      situation: 'Transita (Dispensa)',
      teacherNote: 'Participativa e dedicada.'
    },
    {
      id: 3,
      examId: 1,
      studentId: 3,
      mac: 14.5,
      npp: 15.0,
      npt: 15.5,
      finalScore: 15.0,
      qualitative: 'Bom',
      situation: 'Transita (Dispensa)',
      teacherNote: 'Bom aproveitamento.'
    },
    {
      id: 4,
      examId: 1,
      studentId: 4,
      mac: 10.2,
      npp: 11.5,
      npt: 13.0,
      finalScore: 11.7,
      qualitative: 'Suficiente',
      situation: 'Transita',
      teacherNote: 'Progresso satisfatório.'
    },
    {
      id: 5,
      examId: 1,
      studentId: 5,
      mac: 16.5,
      npp: 17.0,
      npt: 17.5,
      finalScore: 17.1,
      qualitative: 'Muito Bom',
      situation: 'Transita (Dispensa)',
      teacherNote: 'Autonomia exemplar.'
    },
    {
      id: 6,
      examId: 1,
      studentId: 6,
      mac: 7.2,
      npp: 8.5,
      npt: 8.0,
      finalScore: 7.9,
      qualitative: 'Insuficiente',
      situation: 'Exame de Recurso',
      teacherNote: 'Dificuldades no cálculo estequiométrico.'
    }
  ]);

  const handleScoreChange = (index: number, field: 'mac' | 'npp' | 'npt', value: number) => {
    setGradeRows((prev) => {
      const updated = [...prev];
      const row = { ...updated[index], [field]: Math.max(0, Math.min(20, value)) };
      // Formula: MT = (MAC * 0.3) + (NPP * 0.3) + (NPT * 0.4)
      const calculatedMt = parseFloat(((row.mac * 0.3) + (row.npp * 0.3) + (row.npt * 0.4)).toFixed(1));
      row.finalScore = calculatedMt;

      if (calculatedMt >= 18) {
        row.qualitative = 'Excelente';
        row.situation = 'Transita (Dispensa)';
      } else if (calculatedMt >= 16) {
        row.qualitative = 'Muito Bom';
        row.situation = 'Transita (Dispensa)';
      } else if (calculatedMt >= 14) {
        row.qualitative = 'Bom';
        row.situation = 'Transita (Dispensa)';
      } else if (calculatedMt >= 10) {
        row.qualitative = 'Suficiente';
        row.situation = 'Transita';
      } else {
        row.qualitative = 'Insuficiente';
        row.situation = 'Exame de Recurso';
      }

      updated[index] = row;
      return updated;
    });
  };

  // Class Stats
  const classAvg = (gradeRows.reduce((sum, r) => sum + r.finalScore, 0) / gradeRows.length).toFixed(1);
  const approvedCount = gradeRows.filter((r) => r.finalScore >= 10).length;
  const approvalRate = Math.round((approvedCount / gradeRows.length) * 100);
  const resourceCount = gradeRows.filter((r) => r.finalScore < 10).length;

  return (
    <div className="flex flex-col w-full gap-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
              Avaliação Pedagógica
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#0b1f3a]" />
            <span className="text-xs font-semibold text-[#0b1f3a]">Pautas & Exames Oficiais</span>
          </div>
          <h1 className="font-headline text-2xl lg:text-3xl font-extrabold text-[#0b1f3a] tracking-tight">
            Pautas de Frequência & Trimestre
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Lançamento de MAC (30%), NPP (30%), NPT (40%) e homologação pelo Conselho de Turma.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 shadow-xs hover:bg-slate-50"
          >
            <span className="material-symbols-outlined text-[17px]">print</span>
            <span>Imprimir Pauta</span>
          </button>

          {currentUserRole === 'admin' && (
            <button
              onClick={() => {
                setIsDirectorSigned(true);
                alert('Pauta homologada oficialmente pelo Diretor Pedagógico!');
              }}
              className="px-4 py-2 rounded-xl bg-[#0b1f3a] hover:bg-[#7a0c0c] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <span className="material-symbols-outlined text-[17px]">verified</span>
              <span>{isDirectorSigned ? 'Pauta Homologada' : 'Homologar Pauta'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Class / Subject / Trimester Selector */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <label className="block uppercase font-bold text-slate-500 mb-1">Turma</label>
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
          <label className="block uppercase font-bold text-slate-500 mb-1">Trimestre Letivo</label>
          <select
            value={selectedTrimester}
            onChange={(e) => setSelectedTrimester(e.target.value as any)}
            className="w-full h-9 px-3 rounded-lg bg-slate-100 font-bold text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#0b1f3a]"
          >
            <option value="1">1.º Trimestre (Atual)</option>
            <option value="2">2.º Trimestre</option>
            <option value="3">3.º Trimestre (Final)</option>
          </select>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Média da Turma</span>
          <span className="font-headline text-2xl font-extrabold text-[#0b1f3a]">{classAvg}</span>
          <span className="text-[10px] text-slate-400">Escala 0 a 20</span>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-emerald-700 block">Taxa de Transição</span>
          <span className="font-headline text-2xl font-extrabold text-emerald-700">{approvalRate}%</span>
          <span className="text-[10px] text-slate-400">{approvedCount} de {gradeRows.length} alunos</span>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-[#7a0c0c] block">Em Recurso</span>
          <span className="font-headline text-2xl font-extrabold text-[#7a0c0c]">{resourceCount}</span>
          <span className="text-[10px] text-slate-400">Classificação &lt; 10</span>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Fórmula de Cálculo</span>
          <span className="font-mono text-xs font-bold text-slate-700 block mt-1">MAC(30%) + NPP(30%) + NPT(40%)</span>
          <span className="text-[10px] text-slate-400">Regulamento Geral MED</span>
        </div>
      </div>

      {/* Grades Table with Live Calculation */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <span className="font-bold text-xs text-slate-800">
              Pauta Oficial: {activeClass.name} • {activeSubject.name} ({selectedTrimester}.º Trimestre)
            </span>
            <span className="text-[11px] text-slate-500 block">
              Altere os valores de MAC, NPP ou NPT para recalcular a média em tempo real.
            </span>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 font-mono">
            {isDirectorSigned ? 'HOMOLOGADA' : 'EM LANÇAMENTO'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <th className="py-3 px-4 w-12 text-center">N.º</th>
                <th className="py-3 px-3">Aluno</th>
                <th className="py-3 px-3 text-center w-24">MAC (30%)</th>
                <th className="py-3 px-3 text-center w-24">NPP (30%)</th>
                <th className="py-3 px-3 text-center w-24">NPT (40%)</th>
                <th className="py-3 px-3 text-center w-24 bg-slate-200 text-slate-800">Média (MT)</th>
                <th className="py-3 px-3">Apreciação</th>
                <th className="py-3 px-3">Situação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {gradeRows.map((row, idx) => {
                const student = db.students.find((s) => s.id === row.studentId);

                return (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-400">
                      {String(idx + 1).padStart(2, '0')}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-[#0b1f3a] block">
                        {student ? student.name : `Aluno #${row.studentId}`}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Proc: #{student?.procNumber || '2400'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="20"
                        value={row.mac}
                        onChange={(e) => handleScoreChange(idx, 'mac', parseFloat(e.target.value) || 0)}
                        className="w-16 h-8 text-center rounded-lg bg-slate-100 font-mono font-bold text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#0b1f3a]"
                      />
                    </td>
                    <td className="py-3 px-3 text-center">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="20"
                        value={row.npp}
                        onChange={(e) => handleScoreChange(idx, 'npp', parseFloat(e.target.value) || 0)}
                        className="w-16 h-8 text-center rounded-lg bg-slate-100 font-mono font-bold text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#0b1f3a]"
                      />
                    </td>
                    <td className="py-3 px-3 text-center">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="20"
                        value={row.npt}
                        onChange={(e) => handleScoreChange(idx, 'npt', parseFloat(e.target.value) || 0)}
                        className="w-16 h-8 text-center rounded-lg bg-slate-100 font-mono font-bold text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#0b1f3a]"
                      />
                    </td>
                    <td className="py-3 px-3 text-center bg-slate-50">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg font-mono font-bold text-xs ${
                          row.finalScore >= 14
                            ? 'bg-emerald-100 text-emerald-800'
                            : row.finalScore >= 10
                            ? 'bg-blue-100 text-blue-900'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {row.finalScore.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-700">{row.qualitative}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          row.finalScore >= 14
                            ? 'bg-emerald-50 text-emerald-800'
                            : row.finalScore >= 10
                            ? 'bg-blue-50 text-blue-800'
                            : 'bg-red-50 text-[#7a0c0c]'
                        }`}
                      >
                        {row.situation}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
