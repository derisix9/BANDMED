import React, { useState } from 'react';
import { SchoolDatabase, Teacher, UserRole } from '../types';
import { dbService } from '../services/db';

interface ProfessoresViewProps {
  db: SchoolDatabase;
  currentUserRole: UserRole;
}

export const ProfessoresView: React.FC<ProfessoresViewProps> = ({ db, currentUserRole }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    agentNumber: '',
    email: '',
    phone: '+244 9',
    department: 'Ciências Exatas',
    degree: 'Mestrado em Ensino da Matemática',
    weeklyHours: 24,
    status: 'ativo' as 'ativo' | 'licenca' | 'contrato_vencer',
    bio: ''
  });

  const teacherList = db.teachers || [];
  const classList = db.classes || [];

  const filteredTeachers = teacherList.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.agentNumber && t.agentNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.department && t.department.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDept = selectedDept === 'all' || t.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const handleOpenAdd = () => {
    setEditingTeacher(null);
    setFormData({
      name: '',
      agentNumber: `AG-${Math.floor(1000 + Math.random() * 9000)}`,
      email: '',
      phone: '+244 9',
      department: 'Ciências Exatas',
      degree: 'Mestrado',
      weeklyHours: 22,
      status: 'ativo',
      bio: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: Teacher) => {
    setEditingTeacher(t);
    setFormData({
      name: t.name,
      agentNumber: t.agentNumber,
      email: t.email,
      phone: t.phone,
      department: t.department,
      degree: t.degree,
      weeklyHours: t.weeklyHours,
      status: t.status,
      bio: t.bio
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTeacher) {
      dbService.updateTeacher(editingTeacher.id, {
        name: formData.name,
        agentNumber: formData.agentNumber,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        degree: formData.degree,
        weeklyHours: Number(formData.weeklyHours),
        status: formData.status,
        bio: formData.bio
      });
    } else {
      dbService.addTeacher({
        name: formData.name,
        email: formData.email || `${formData.name.toLowerCase().replace(/\s+/g, '.')}@bandmed.ao`,
        phone: formData.phone,
        department: formData.department,
        degree: formData.degree,
        weeklyHours: Number(formData.weeklyHours),
        status: formData.status,
        bio: formData.bio,
        biNumber: '0048' + Math.floor(100000 + Math.random() * 900000) + 'LA042',
        nif: '5419' + Math.floor(100000 + Math.random() * 900000),
        admissionDate: '2024-02-01',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
        allocatedClasses: [
          { classId: 'turma-10a', className: '10º Ano - Turma A', subject: formData.department, hoursWeekly: Number(formData.weeklyHours) }
        ]
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col w-full gap-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
              Módulo Docente
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#0b1f3a]" />
            <span className="text-xs font-semibold text-[#0b1f3a]">Corpo Catedrático</span>
          </div>
          <h1 className="font-headline text-2xl lg:text-3xl font-extrabold text-[#0b1f3a] tracking-tight">
            Gestão do Corpo Docente
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Docentes titulares, regentes de disciplina, número de agente e distribuição de carga horária.
          </p>
        </div>

        {currentUserRole === 'admin' && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0b1f3a] hover:bg-[#7a0c0c] text-white font-bold text-xs transition-all shadow-sm shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>+ Contratar Docente</span>
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
            placeholder="Pesquisar por nome, n.º de agente ou departamento..."
            className="w-full h-9 pl-9 pr-3 rounded-lg bg-slate-100 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#0b1f3a]"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="h-9 px-3 rounded-lg bg-slate-100 text-xs font-semibold text-slate-700 border-0 focus:ring-1 focus:ring-[#0b1f3a]"
          >
            <option value="all">Todos os Departamentos</option>
            <option value="Ciências Exatas">Ciências Exatas</option>
            <option value="Saúde / Biológicas">Saúde / Biológicas</option>
            <option value="Letras & Humanidades">Letras & Humanidades</option>
          </select>
          <span className="text-xs text-slate-400 font-mono">
            {filteredTeachers.length} {filteredTeachers.length === 1 ? 'docente' : 'docentes'}
          </span>
        </div>
      </div>

      {/* Teachers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTeachers.map((teacher) => {
          // Find classes where teacher is head teacher
          const teacherClasses = classList.filter((c) => c.headTeacherId === teacher.id);

          return (
            <div
              key={teacher.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#0b1f3a]" />

              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[#0b1f3a] font-extrabold text-lg">
                      {teacher.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#0b1f3a] leading-snug">{teacher.name}</h3>
                      <span className="text-[11px] font-mono text-slate-400 block">
                        Agente: {teacher.agentNumber}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      teacher.status === 'ativo'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {teacher.status === 'ativo' ? 'Ativo' : 'Em Licença'}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Departamento & Grau</span>
                    <span className="font-semibold text-slate-800">{teacher.department}</span>
                    <span className="text-slate-500 block text-[11px]">{teacher.degree}</span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Turmas Atribuídas</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {teacherClasses.length > 0 ? (
                        teacherClasses.map((c) => (
                          <span key={c.id} className="px-2 py-0.5 rounded bg-blue-50 text-[#0b1f3a] font-bold text-[10px]">
                            {c.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Docente Regente Modular</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-500">Carga Letiva:</span>
                    <strong className="text-slate-800 font-mono">{teacher.weeklyHours}h / semana</strong>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Avaliação do Corpo Discente:</span>
                    <span className="flex items-center gap-1 font-bold text-amber-600">
                      <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        star
                      </span>
                      <span>{teacher.rating.toFixed(1)} / 5.0</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <a
                  href={`tel:${teacher.phone}`}
                  className="text-slate-600 hover:text-[#0b1f3a] flex items-center gap-1 font-mono text-[11px]"
                >
                  <span className="material-symbols-outlined text-[15px]">call</span>
                  <span>{teacher.phone}</span>
                </a>
                {currentUserRole === 'admin' && (
                  <button
                    onClick={() => handleOpenEdit(teacher)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-slate-100"
                    title="Editar perfil"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Teacher Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-[#0b1f3a] text-white flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingTeacher ? 'Editar Docente' : 'Registo de Novo Professor'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block uppercase font-bold text-slate-600 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Prof. Doutor..."
                  className="w-full h-9 px-3 rounded-lg bg-slate-100 text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#0b1f3a]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase font-bold text-slate-600 mb-1">N.º de Agente</label>
                  <input
                    type="text"
                    required
                    value={formData.agentNumber}
                    onChange={(e) => setFormData({ ...formData, agentNumber: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg bg-slate-100 font-mono text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#0b1f3a]"
                  />
                </div>
                <div>
                  <label className="block uppercase font-bold text-slate-600 mb-1">Telefone</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg bg-slate-100 font-mono text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#0b1f3a]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase font-bold text-slate-600 mb-1">Departamento</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg bg-slate-100 text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#0b1f3a]"
                  >
                    <option value="Ciências Exatas">Ciências Exatas</option>
                    <option value="Saúde / Biológicas">Saúde / Biológicas</option>
                    <option value="Letras & Humanidades">Letras & Humanidades</option>
                  </select>
                </div>
                <div>
                  <label className="block uppercase font-bold text-slate-600 mb-1">Horas Semanais</label>
                  <input
                    type="number"
                    value={formData.weeklyHours}
                    onChange={(e) => setFormData({ ...formData, weeklyHours: Number(e.target.value) })}
                    className="w-full h-9 px-3 rounded-lg bg-slate-100 font-mono text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#0b1f3a]"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase font-bold text-slate-600 mb-1">Habilitações Literárias</label>
                <input
                  type="text"
                  value={formData.degree}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  placeholder="Licenciatura / Mestrado / Doutoramento"
                  className="w-full h-9 px-3 rounded-lg bg-slate-100 text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#0b1f3a]"
                />
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
                  Salvar Docente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
