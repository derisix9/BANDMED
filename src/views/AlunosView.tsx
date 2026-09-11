import React, { useState, useMemo } from 'react';
import { SchoolDatabase, Student, UserRole } from '../types';
import { dbService } from '../services/db';
import { getSubsystemForGrade } from '../utils/educationSubsystems';

interface AlunosViewProps {
  db: SchoolDatabase;
  currentUserRole: UserRole;
  onOpenReportCard: (student: Student) => void;
}

export const AlunosView: React.FC<AlunosViewProps> = ({ db, currentUserRole, onOpenReportCard }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedFinanceStatus, setSelectedFinanceStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    procNumber: '',
    email: '',
    birthDate: '2008-05-10',
    citizenCard: '',
    classId: db.classes[0]?.id.toString() || '1',
    guardianName: '',
    guardianPhone: '+244 9',
    guardianEmail: '',
    address: 'Luanda, Angola',
    monthlyTuitionKz: 95000,
    financialStatus: 'regular' as 'regular' | 'debito' | 'isento'
  });

  const studentList = db.students || [];
  const filteredStudents = studentList.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.procNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.guardianName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClass = selectedClassId === 'all' || s.classId.toString() === selectedClassId;
    const matchesFinance = selectedFinanceStatus === 'all' || s.financialStatus === selectedFinanceStatus;

    return matchesSearch && matchesClass && matchesFinance;
  });

  const handleOpenAdd = () => {
    setEditingStudent(null);
    const initialClass = db.classes[0];
    let initialTuition = 95000;
    if (initialClass) {
      const sub = getSubsystemForGrade(initialClass.grade);
      if (sub?.id === 'pre_escolar') initialTuition = 45000;
      else if (sub?.id === 'primario') initialTuition = 65000;
      else if (sub?.id === 'secundario_1') initialTuition = 75000;
      else if (sub?.id === 'secundario_2') initialTuition = 95000;
      else if (sub?.id === 'superior') initialTuition = 140000;
    }

    setFormData({
      name: '',
      procNumber: `PROC-${Math.floor(1000 + Math.random() * 9000)}`,
      email: '',
      birthDate: '2008-05-10',
      citizenCard: '',
      classId: initialClass?.id.toString() || '1',
      guardianName: '',
      guardianPhone: '+244 9',
      guardianEmail: '',
      address: 'Luanda, Angola',
      monthlyTuitionKz: initialTuition,
      financialStatus: 'regular'
    });
    setIsModalOpen(true);
  };

  const handleClassChange = (selectedClassId: string) => {
    const targetClass = db.classes.find((c) => String(c.id) === String(selectedClassId));
    let suggestedTuition = formData.monthlyTuitionKz;
    if (!editingStudent && targetClass) {
      const sub = getSubsystemForGrade(targetClass.grade);
      if (sub?.id === 'pre_escolar') suggestedTuition = 45000;
      else if (sub?.id === 'primario') suggestedTuition = 65000;
      else if (sub?.id === 'secundario_1') suggestedTuition = 75000;
      else if (sub?.id === 'secundario_2') suggestedTuition = 95000;
      else if (sub?.id === 'superior') suggestedTuition = 140000;
    }
    setFormData((prev) => ({
      ...prev,
      classId: selectedClassId,
      monthlyTuitionKz: suggestedTuition
    }));
  };

  const selectedClassObj = useMemo(() => {
    return db.classes.find((c) => String(c.id) === String(formData.classId));
  }, [db.classes, formData.classId]);

  const selectedClassSubsystem = useMemo(() => {
    return selectedClassObj ? getSubsystemForGrade(selectedClassObj.grade) : null;
  }, [selectedClassObj]);

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      procNumber: student.procNumber,
      email: student.email,
      birthDate: student.birthDate,
      citizenCard: student.citizenCard,
      classId: student.classId.toString(),
      guardianName: student.guardianName,
      guardianPhone: student.guardianPhone,
      guardianEmail: student.guardianEmail,
      address: student.address,
      monthlyTuitionKz: student.monthlyTuitionKz,
      financialStatus: student.financialStatus
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent) {
      dbService.updateStudent(editingStudent.id, {
        name: formData.name,
        procNumber: formData.procNumber,
        email: formData.email,
        birthDate: formData.birthDate,
        citizenCard: formData.citizenCard,
        classId: String(formData.classId),
        guardianName: formData.guardianName,
        guardianPhone: formData.guardianPhone,
        guardianEmail: formData.guardianEmail,
        address: formData.address,
        monthlyTuitionKz: Number(formData.monthlyTuitionKz),
        financialStatus: formData.financialStatus
      });
    } else {
      const selectedCls = db.classes.find((c) => String(c.id) === String(formData.classId));
      dbService.addStudent({
        name: formData.name,
        email: formData.email || `${formData.name.toLowerCase().replace(/\s+/g, '.')}@bandmed.edu.pt`,
        birthDate: formData.birthDate,
        citizenCard: formData.citizenCard,
        nif: '5419' + Math.floor(100000 + Math.random() * 900000),
        address: formData.address,
        guardianName: formData.guardianName,
        guardianPhone: formData.guardianPhone,
        guardianEmail: formData.guardianEmail,
        guardianNif: '2418' + Math.floor(10000 + Math.random() * 90000),
        classId: String(formData.classId),
        className: selectedCls?.name || '10º Ano - Turma A',
        section: selectedCls?.section || 'A',
        cycle: selectedCls?.cycle || 'Ensino Secundário',
        grade: selectedCls?.grade || '10º Ano',
        financialStatus: formData.financialStatus,
        status: 'active',
        unexcusedAbsences: 0,
        excusedAbsences: 0,
        monthlyTuitionKz: Number(formData.monthlyTuitionKz),
        isTuitionPaidCurrentMonth: true,
        disciplineGrades: [
          { subject: 'Matemática A', score: 15.0, maxScore: 20 },
          { subject: 'Física e Química A', score: 14.5, maxScore: 20 }
        ],
        avatar: `https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150`
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Pretende remover o registo de matrícula do aluno ${name}?`)) {
      dbService.deleteStudent(id);
    }
  };

  return (
    <div className="flex flex-col w-full gap-6 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
              Módulo Académico
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#0b1f3a]" />
            <span className="text-xs font-semibold text-[#0b1f3a]">Registo Biográfico</span>
          </div>
          <h1 className="font-headline text-2xl lg:text-3xl font-extrabold text-[#0b1f3a] tracking-tight">
            Gestão de Alunos & Matrículas
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Listagem oficial de discentes, processos individuais, assiduidade e situação de tesouraria.
          </p>
        </div>

        {currentUserRole === 'admin' && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0b1f3a] hover:bg-[#7a0c0c] text-white font-bold text-xs transition-all shadow-sm shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>+ Matricular Novo Aluno</span>
          </button>
        )}
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
            placeholder="Pesquisar por nome, processo ou encarregado..."
            className="w-full h-9 pl-9 pr-3 rounded-lg bg-slate-100 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#0b1f3a]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="h-9 px-3 rounded-lg bg-slate-100 text-xs font-semibold text-slate-700 border-0 focus:ring-1 focus:ring-[#0b1f3a]"
          >
            <option value="all">Todas as Turmas</option>
            {db.classes.map((c) => (
              <option key={c.id} value={c.id.toString()}>
                {c.name} ({c.shift})
              </option>
            ))}
          </select>

          <select
            value={selectedFinanceStatus}
            onChange={(e) => setSelectedFinanceStatus(e.target.value)}
            className="h-9 px-3 rounded-lg bg-slate-100 text-xs font-semibold text-slate-700 border-0 focus:ring-1 focus:ring-[#0b1f3a]"
          >
            <option value="all">Todos os Estados Financeiros</option>
            <option value="regular">Regular (Sem dívidas)</option>
            <option value="debito">Em Débito (Mora)</option>
            <option value="isento">Isento / Bolseiro</option>
          </select>

          <span className="text-xs text-slate-400 font-mono pl-2 hidden sm:inline">
            {filteredStudents.length} {filteredStudents.length === 1 ? 'aluno' : 'alunos'}
          </span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <th className="py-3.5 px-4">Aluno & Identificação</th>
                <th className="py-3.5 px-3">Turma</th>
                <th className="py-3.5 px-3">Encarregado de Educação</th>
                <th className="py-3.5 px-3 text-center">Assiduidade</th>
                <th className="py-3.5 px-3 text-center">Média</th>
                <th className="py-3.5 px-3">Tesouraria</th>
                <th className="py-3.5 px-4 text-right">Ações Oficiais</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    Nenhum registo de aluno encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const studentClass = db.classes.find((c) => c.id === student.classId);
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={student.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'}
                            alt={student.name}
                            className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200"
                          />
                          <div>
                            <div className="font-bold text-[#0b1f3a] text-sm">{student.name}</div>
                            <div className="flex items-center gap-1 text-slate-400 text-[11px] font-mono">
                              <span>Proc: #{student.procNumber}</span>
                              <span>•</span>
                              <span>BI: {student.citizenCard || 'Emitido'}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="font-semibold text-slate-800 block">
                          {studentClass ? studentClass.name : 'Turma 10º A'}
                        </span>
                        <span className="text-[10px] text-slate-400">{studentClass?.shift || 'Manhã'}</span>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-slate-800">{student.guardianName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{student.guardianPhone}</div>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <div className="font-bold text-[#0b1f3a]">{student.attendanceRate}%</div>
                        <span className="text-[10px] text-slate-400">
                          {student.unexcusedAbsences} {student.unexcusedAbsences === 1 ? 'falta' : 'faltas'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full font-bold font-mono text-[11px] ${
                            student.currentAverage >= 14
                              ? 'bg-emerald-100 text-emerald-800'
                              : student.currentAverage >= 10
                              ? 'bg-blue-100 text-blue-900'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {student.currentAverage.toFixed(1)}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        {student.financialStatus === 'regular' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-semibold text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            Regular
                          </span>
                        ) : student.financialStatus === 'debito' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-50 text-[#7a0c0c] font-semibold text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#7a0c0c]" />
                            Em Débito
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[11px]">
                            Isento
                          </span>
                        )}
                        <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                          {student.monthlyTuitionKz.toLocaleString()} Kz/mês
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Boletim de Notas */}
                          <button
                            onClick={() => onOpenReportCard(student)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-[#0b1f3a] hover:bg-slate-100 transition-colors"
                            title="Emitir Boletim Oficial de Notas"
                          >
                            <span className="material-symbols-outlined text-[18px]">assignment</span>
                          </button>

                          {currentUserRole === 'admin' && (
                            <>
                              <button
                                onClick={() => handleOpenEdit(student)}
                                className="p-1.5 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                                title="Editar dados"
                              >
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                              </button>
                              <button
                                onClick={() => handleDelete(student.id, student.name)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-700 hover:bg-red-50 transition-colors"
                                title="Remover aluno"
                              >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            </>
                          )}
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

      {/* Add / Edit Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-[#0b1f3a] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[22px]">person_add</span>
                <h3 className="font-bold text-base">
                  {editingStudent ? 'Editar Ficha do Aluno' : 'Nova Matrícula Escolar'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase font-bold text-slate-600 mb-1">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Manuel António da Costa"
                    className="w-full h-9 px-3 rounded-lg bg-slate-100 text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#0b1f3a]"
                  />
                </div>

                <div>
                  <label className="block uppercase font-bold text-slate-600 mb-1">N.º de Processo</label>
                  <input
                    type="text"
                    required
                    value={formData.procNumber}
                    onChange={(e) => setFormData({ ...formData, procNumber: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg bg-slate-100 font-mono text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#0b1f3a]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block uppercase font-bold text-slate-600">Turma de Ingresso</label>
                    {selectedClassSubsystem && (
                      <span className="text-[10px] font-mono text-[#0b1f3a] bg-blue-50 px-1.5 py-0.5 rounded font-bold border border-blue-200 truncate max-w-[120px]" title={selectedClassSubsystem.fullName}>
                        {selectedClassSubsystem.shortName}
                      </span>
                    )}
                  </div>
                  <select
                    value={formData.classId}
                    onChange={(e) => handleClassChange(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-slate-100 text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#0b1f3a] text-xs font-semibold"
                  >
                    {db.classes.map((c) => (
                      <option key={c.id} value={c.id.toString()}>
                        {c.name} ({c.grade})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block uppercase font-bold text-slate-600 mb-1">Bilhete de Identidade (BI)</label>
                  <input
                    type="text"
                    required
                    value={formData.citizenCard}
                    onChange={(e) => setFormData({ ...formData, citizenCard: e.target.value })}
                    placeholder="004819201LA042"
                    className="w-full h-9 px-3 rounded-lg bg-slate-100 font-mono text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#0b1f3a]"
                  />
                </div>

                <div>
                  <label className="block uppercase font-bold text-slate-600 mb-1">Data de Nascimento</label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg bg-slate-100 text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#0b1f3a]"
                  />
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <h4 className="font-bold text-slate-800 text-xs uppercase mb-3">Encarregado de Educação & Contactos</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block uppercase font-bold text-slate-600 mb-1">Nome do Encarregado</label>
                    <input
                      type="text"
                      required
                      value={formData.guardianName}
                      onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                      placeholder="Ex: Dr. Afonso Silva"
                      className="w-full h-9 px-3 rounded-lg bg-slate-100 text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#0b1f3a]"
                    />
                  </div>
                  <div>
                    <label className="block uppercase font-bold text-slate-600 mb-1">Telefone Principal</label>
                    <input
                      type="text"
                      required
                      value={formData.guardianPhone}
                      onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                      placeholder="+244 923 000 000"
                      className="w-full h-9 px-3 rounded-lg bg-slate-100 font-mono text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#0b1f3a]"
                    />
                  </div>
                  <div>
                    <label className="block uppercase font-bold text-slate-600 mb-1">E-mail do Encarregado</label>
                    <input
                      type="email"
                      value={formData.guardianEmail}
                      onChange={(e) => setFormData({ ...formData, guardianEmail: e.target.value })}
                      placeholder="encarregado@gmail.com"
                      className="w-full h-9 px-3 rounded-lg bg-slate-100 text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#0b1f3a]"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <h4 className="font-bold text-slate-800 text-xs uppercase mb-3">Plano Financeiro de Propinas</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block uppercase font-bold text-slate-600">Propina Mensal (Kz)</label>
                      {selectedClassSubsystem && (
                        <span className="text-[10px] text-blue-700 font-semibold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">auto_awesome</span>
                          <span>{selectedClassSubsystem.shortName}</span>
                        </span>
                      )}
                    </div>
                    <input
                      type="number"
                      required
                      value={formData.monthlyTuitionKz}
                      onChange={(e) => setFormData({ ...formData, monthlyTuitionKz: Number(e.target.value) })}
                      className="w-full h-9 px-3 rounded-lg bg-slate-100 font-mono font-bold text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#0b1f3a]"
                    />
                  </div>
                  <div>
                    <label className="block uppercase font-bold text-slate-600 mb-1">Situação Inicial</label>
                    <select
                      value={formData.financialStatus}
                      onChange={(e) => setFormData({ ...formData, financialStatus: e.target.value as any })}
                      className="w-full h-9 px-3 rounded-lg bg-slate-100 text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#0b1f3a]"
                    >
                      <option value="regular">Regular</option>
                      <option value="debito">Em Débito</option>
                      <option value="isento">Isento / Bolseiro</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0b1f3a] hover:bg-[#7a0c0c] text-white font-bold transition-colors"
                >
                  {editingStudent ? 'Salvar Alterações' : 'Concluir Matrícula'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
