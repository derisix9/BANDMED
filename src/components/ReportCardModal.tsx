import React from 'react';
import { Student, SchoolDatabase } from '../types';

interface ReportCardModalProps {
  student: Student | null;
  db: SchoolDatabase;
  onClose: () => void;
}

export const ReportCardModal: React.FC<ReportCardModalProps> = ({ student, db, onClose }) => {
  if (!student) return null;

  const studentClass = db.classes.find((c) => c.id === student.classId);

  // Sample grades for the student's report card
  const subjectsData = [
    { code: 'MAT-A', name: 'Matemática A', mac: 19.4, npp: 19.0, npt: 18.5, mt: 19.1, sit: 'Transita (Dispensa)', qual: 'Excelente' },
    { code: 'FQ-A', name: 'Física e Química A', mac: 16.5, npp: 17.0, npt: 16.0, mt: 16.4, sit: 'Transita (Dispensa)', qual: 'Muito Bom' },
    { code: 'BG', name: 'Biologia e Geologia', mac: 17.0, npp: 16.5, npt: 17.5, mt: 17.1, sit: 'Transita (Dispensa)', qual: 'Muito Bom' },
    { code: 'PORT', name: 'Língua Portuguesa', mac: 15.0, npp: 15.5, npt: 15.0, mt: 15.2, sit: 'Transita (Dispensa)', qual: 'Bom' },
    { code: 'ING-T', name: 'Inglês Técnico', mac: 18.0, npp: 17.5, npt: 18.0, mt: 17.9, sit: 'Transita (Dispensa)', qual: 'Muito Bom' },
    { code: 'ED-F', name: 'Educação Física', mac: 19.0, npp: 19.0, npt: 19.5, mt: 19.2, sit: 'Transita (Dispensa)', qual: 'Excelente' },
  ];

  const averageTotal = (
    subjectsData.reduce((acc, curr) => acc + curr.mt, 0) / subjectsData.length
  ).toFixed(1);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-none max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col my-8 border border-slate-400 print:m-0 print:border-none print:shadow-none">
        {/* Top Control Bar (Hidden on print) */}
        <div className="px-6 py-3.5 bg-[#0b1f3a] text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-400 text-[20px]">verified</span>
            <span className="font-bold text-sm">Boletim Trimestral Oficial de Aproveitamento</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-none bg-[#7a0c0c] hover:bg-[#5e0909] text-white font-bold text-xs flex items-center gap-1.5 transition-colors border border-[#7a0c0c] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              <span>Imprimir / Guardar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-none cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
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
                  src="/school_emblem.png"
                  alt="BandMed Emblema"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            <h2 className="text-xs uppercase tracking-widest font-bold text-slate-600 font-sans">
              República de Angola • Ministério da Educação
            </h2>
            <h1 className="text-xl font-bold uppercase tracking-tight text-[#0b1f3a] font-sans mt-1">
              {db.settings.schoolName}
            </h1>
            <p className="text-[11px] text-slate-500 font-sans mt-0.5">
              {db.settings.decreeAuthorization} • NIF: {db.settings.nif}
            </p>
            <p className="text-[11px] text-slate-500 font-sans">
              {db.settings.address} • Contacto: {db.settings.phone}
            </p>
            <div className="inline-block mt-3 px-4 py-1 bg-slate-100 border border-slate-300 font-sans font-bold text-xs uppercase tracking-wider text-[#7a0c0c]">
              Boletim Informativo de Avaliação — 1.º Trimestre ({db.settings.currentAcademicYear})
            </div>
          </div>

          {/* Student Identifiers Grid com Foto Tipo Passe Oficial */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-slate-50 border border-slate-300 mb-6 font-sans text-xs">
            <div className="w-16 h-20 bg-slate-200 border-2 border-[#0b1f3a] overflow-hidden shrink-0">
              <img
                src={student.docPassPhoto || student.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'}
                alt={student.name}
                className="w-full h-full object-cover object-center"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1 w-full">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Nome do Aluno</span>
                <strong className="text-[#0b1f3a] text-sm block">{student.name}</strong>
                <span className="text-[10px] text-slate-500 font-semibold">{student.gender === 'Feminino' || student.gender === 'F' ? 'Feminino' : 'Masculino'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Processo & N.º BI</span>
                <strong className="font-mono text-slate-800 block">Proc. #{student.procNumber}</strong>
                <span className="font-mono text-[11px] text-slate-600 block">BI: {student.biNumber || student.citizenCard || 'Pendente'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Turma & Sala</span>
                <strong className="text-slate-800 block">{studentClass?.name || '10º Ano A'} ({studentClass?.room})</strong>
                <span className="text-[10px] text-slate-500 block">{studentClass?.shift || 'Manhã'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Encarregado / Grau</span>
                <strong className="text-slate-800 block">{student.guardianName || 'Não registado'}</strong>
                <span className="text-[10px] text-slate-600 font-bold block">{student.guardianRelation || 'Encarregado'} • {student.guardianPhone}</span>
              </div>
            </div>
          </div>

          {/* Grades Table */}
          <table className="w-full text-left border-collapse border border-slate-300 font-sans text-xs mb-6">
            <thead>
              <tr className="bg-[#0b1f3a] text-white uppercase text-[10px]">
                <th className="p-2.5 border border-slate-300">Disciplina Curricular</th>
                <th className="p-2.5 border border-slate-300 text-center">MAC (30%)</th>
                <th className="p-2.5 border border-slate-300 text-center">NPP (30%)</th>
                <th className="p-2.5 border border-slate-300 text-center">NPT (40%)</th>
                <th className="p-2.5 border border-slate-300 text-center bg-[#7a0c0c]">Média (MT)</th>
                <th className="p-2.5 border border-slate-300">Apreciação Qualitativa</th>
                <th className="p-2.5 border border-slate-300">Situação Provisória</th>
              </tr>
            </thead>
            <tbody>
              {subjectsData.map((sub, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="p-2 border border-slate-300 font-bold text-[#0b1f3a]">{sub.name}</td>
                  <td className="p-2 border border-slate-300 text-center font-mono">{sub.mac.toFixed(1)}</td>
                  <td className="p-2 border border-slate-300 text-center font-mono">{sub.npp.toFixed(1)}</td>
                  <td className="p-2 border border-slate-300 text-center font-mono">{sub.npt.toFixed(1)}</td>
                  <td className="p-2 border border-slate-300 text-center font-mono font-bold text-[#0b1f3a]">
                    {sub.mt.toFixed(1)}
                  </td>
                  <td className="p-2 border border-slate-300 font-medium">{sub.qual}</td>
                  <td className="p-2 border border-slate-300 font-semibold text-emerald-800">{sub.sit}</td>
                </tr>
              ))}
              <tr className="bg-slate-200 font-bold">
                <td className="p-2.5 border border-slate-300 uppercase text-right" colSpan={4}>
                  Média Global Ponderada do Aluno:
                </td>
                <td className="p-2.5 border border-slate-300 text-center text-sm font-mono text-[#7a0c0c] bg-amber-50">
                  {averageTotal} Valores
                </td>
                <td className="p-2.5 border border-slate-300" colSpan={2}>
                  Classificação Geral: <strong className="text-emerald-800">Muito Bom Aproveitamento</strong>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Attendance and Behavioral Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 mb-8 font-sans text-xs">
            <div>
              <h4 className="font-bold uppercase text-slate-700 mb-1">Assiduidade do 1.º Trimestre</h4>
              <ul className="space-y-1 text-slate-600">
                <li>• Total de Horas/Aulas Previstas: <strong>320 horas</strong></li>
                <li>• Presenças Registadas: <strong>314 presenças ({student.attendanceRate}%)</strong></li>
                <li>• Faltas Justificadas: <strong>{student.excusedAbsences} faltas</strong> (Atestado médico)</li>
                <li>• Faltas Injustificadas: <strong>{student.unexcusedAbsences} faltas</strong></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold uppercase text-slate-700 mb-1">Apreciação do Conselho de Turma</h4>
              <p className="text-slate-600 italic">
                "Aluno com atitude exemplar, rigor no cumprimento dos sumários laboratoriais e excelente convivência cívica."
              </p>
            </div>
          </div>

          {/* Signatures & Seal */}
          <div className="grid grid-cols-3 gap-6 text-center font-sans text-xs pt-8 border-t border-slate-300">
            <div>
              <div className="h-10 border-b border-slate-400 mx-4" />
              <span className="font-bold text-slate-800 block mt-1">O Diretor de Turma</span>
              <span className="text-[10px] text-slate-500">Prof. João Figueiredo</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-[10px] text-slate-400 font-mono">
                [Carimbo da Secretaria]
              </div>
              <span className="text-[10px] text-slate-500 mt-1">Autenticação Notarial</span>
            </div>
            <div>
              <div className="h-10 border-b border-slate-400 mx-4" />
              <span className="font-bold text-slate-800 block mt-1">O Diretor Pedagógico</span>
              <span className="text-[10px] text-slate-500">Dr. Carlos Mendes</span>
            </div>
          </div>

          <div className="text-center text-[10px] text-slate-400 font-sans mt-8">
            Emitido via Sistema BandMed Core v3.4.2 em {new Date().toLocaleDateString('pt-PT')} • Chave de Validação: BM-CERT-{(Math.random()*1e8|0).toString(16).toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
};
