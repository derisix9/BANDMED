import React, { useState, useRef } from 'react';
import { SchoolDatabase, Teacher, UserRole } from '../types';
import { dbService } from '../services/db';
import { AsyncButton } from '../components/AsyncButton';

const DEFAULT_TEACHER_PHOTOS = [
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150'
];

interface ProfessoresViewProps {
  db: SchoolDatabase;
  currentUserRole: UserRole;
}

export const ProfessoresView: React.FC<ProfessoresViewProps> = ({ db, currentUserRole }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [viewingTeacher, setViewingTeacher] = useState<Teacher | null>(null);
  const [deletingTeacher, setDeletingTeacher] = useState<Teacher | null>(null);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    agentNumber: '',
    email: '',
    phone: '+244 9',
    department: 'Ciências Exatas',
    degree: 'Licenciatura em Ensino',
    weeklyHours: 24,
    status: 'ativo' as 'ativo' | 'licenca' | 'contrato_vencer',
    bio: '',
    avatar: DEFAULT_TEACHER_PHOTOS[0]
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
    setSubmitStatus('idle');
    setFormData({
      name: '',
      agentNumber: `AG-${Math.floor(1000 + Math.random() * 9000)}`,
      email: '',
      phone: '+244 9',
      department: 'Ciências Exatas',
      degree: 'Licenciatura',
      weeklyHours: 22,
      status: 'ativo',
      bio: '',
      avatar: DEFAULT_TEACHER_PHOTOS[Math.floor(Math.random() * DEFAULT_TEACHER_PHOTOS.length)]
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: Teacher) => {
    setEditingTeacher(t);
    setSubmitStatus('idle');
    setFormData({
      name: t.name,
      agentNumber: t.agentNumber,
      email: t.email,
      phone: t.phone,
      department: t.department,
      degree: t.degree,
      weeklyHours: t.weeklyHours,
      status: t.status,
      bio: t.bio,
      avatar: t.avatar || DEFAULT_TEACHER_PHOTOS[0]
    });
    setIsModalOpen(true);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('A fotografia excede o tamanho máximo de 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFormData((prev) => ({
            ...prev,
            avatar: reader.result as string
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteTeacher = (id: string, name: string) => {
    if (confirm(`Tem a certeza de que deseja eliminar o docente "${name}" da base de dados?`)) {
      dbService.deleteTeacher(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitStatus !== 'idle') return;

    setSubmitStatus('loading');
    const photo = formData.avatar || DEFAULT_TEACHER_PHOTOS[0];

    setTimeout(() => {
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
          bio: formData.bio,
          avatar: photo
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
          avatar: photo,
          allocatedClasses: []
        });
      }
      setSubmitStatus('success');

      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitStatus('idle');
      }, 700);
    }, 600);
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

        <div className="flex items-center gap-2 shrink-0">
          {currentUserRole === 'admin' && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0b1f3a] hover:bg-[#7a0c0c] active:scale-[0.98] transition-all duration-200 text-white font-bold text-xs shadow-sm shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              <span>+ Contratar Docente</span>
            </button>
          )}
        </div>
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

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
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

      {/* Content: Table View Only */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#0b1f3a] text-white font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <th className="py-3.5 px-4 text-white">Professor & N.º Agente</th>
                  <th className="py-3.5 px-3 text-white">Departamento & Grau</th>
                  <th className="py-3.5 px-3 text-white">Turmas / Direção</th>
                  <th className="py-3.5 px-3 text-center text-white">Carga Horária</th>
                  <th className="py-3.5 px-3 text-white">Contacto</th>
                  <th className="py-3.5 px-3 text-white">Estado</th>
                  <th className="py-3.5 px-4 text-right text-white">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTeachers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                      Nenhum docente cadastrado ou encontrado. Clique em "+ Contratar Docente" para adicionar professores reais.
                    </td>
                  </tr>
                ) : (
                  filteredTeachers.map((teacher) => {
                    const teacherClasses = classList.filter((c) => c.headTeacherId === teacher.id);
                    return (
                      <tr key={teacher.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-[#0b1f3a] font-extrabold text-xs shrink-0 overflow-hidden">
                              {teacher.avatar ? (
                                <img
                                  src={teacher.avatar}
                                  alt={teacher.name}
                                  className="w-full h-full object-cover object-center"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                teacher.name.substring(0, 2).toUpperCase()
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-[#0b1f3a]">{teacher.name}</div>
                              <span className="text-[11px] text-slate-500 font-mono">
                                Agente: {teacher.agentNumber}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="font-semibold text-slate-800">{teacher.department}</div>
                          <span className="text-[11px] text-slate-500">{teacher.degree}</span>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="flex flex-wrap gap-1">
                            {teacherClasses.length > 0 ? (
                              teacherClasses.map((c) => (
                                <span
                                  key={c.id}
                                  className="px-2 py-0.5 rounded bg-blue-50 text-[#0b1f3a] font-bold text-[10px]"
                                >
                                  DT: {c.name}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">Docente Regente</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md text-xs">
                            {teacher.weeklyHours}h / sem
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <a
                            href={`tel:${teacher.phone}`}
                            className="text-slate-700 hover:text-[#0b1f3a] font-mono text-[11px] flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[14px]">call</span>
                            <span>{teacher.phone}</span>
                          </a>
                          <span className="text-[10px] text-slate-400 block truncate max-w-[140px]">{teacher.email}</span>
                        </td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              teacher.status === 'ativo'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {teacher.status === 'ativo' ? 'Ativo' : 'Licença'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* Consultar Perfil */}
                            <button
                              onClick={() => setViewingTeacher(teacher)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-[#0b1f3a] hover:bg-slate-100 active:scale-[0.98] transition-all duration-200 cursor-pointer"
                              title="Consultar perfil do docente"
                            >
                              <span className="material-symbols-outlined text-[18px]">account_box</span>
                            </button>

                            {currentUserRole === 'admin' && (
                              <>
                                <button
                                  onClick={() => handleOpenEdit(teacher)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-slate-100 active:scale-[0.98] transition-all duration-200 cursor-pointer"
                                  title="Editar docente"
                                >
                                  <span className="material-symbols-outlined text-[18px]">edit</span>
                                </button>
                                <button
                                  onClick={() => setDeletingTeacher(teacher)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-700 hover:bg-red-50 active:scale-[0.98] transition-all duration-200 cursor-pointer"
                                  title="Eliminar docente da base de dados"
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

      {/* Add / Edit Teacher Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-none max-w-xl w-full shadow-2xl overflow-hidden flex flex-col border border-slate-300 max-h-[92vh]">
            <div className="px-6 py-4 bg-[#0b1f3a] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-none bg-white/10 flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-[22px]">
                    {editingTeacher ? 'edit' : 'person_add'}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-base">
                    {editingTeacher ? 'Editar Docente' : 'Contratar Docente • Registo Oficial'}
                  </h3>
                  <p className="text-xs text-blue-200">
                    Módulo do Corpo Docente e Regência Escolar
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-300 hover:text-white p-1 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto">
              {/* Fotografia Oficial do Professor */}
              <div className="p-4 bg-slate-50 border border-slate-300 rounded-none">
                <label className="block uppercase font-bold text-slate-800 mb-2">
                  Fotografia do Professor (Foto de Perfil Oficial) *
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="w-24 h-28 bg-white border-2 border-[#0b1f3a] rounded-none flex flex-col items-center justify-center overflow-hidden shrink-0 shadow-xs">
                    {formData.avatar ? (
                      <img
                        src={formData.avatar}
                        alt="Foto do Professor"
                        className="w-full h-full object-cover object-center"
                      />
                    ) : (
                      <span className="text-[10px] text-slate-400 text-center px-1">Sem Foto</span>
                    )}
                  </div>

                  <div className="space-y-2 flex-1">
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Carregue a fotografia oficial para a ficha de contratação, cartões de identificação e distribuição das turmas.
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <input
                        type="file"
                        ref={photoInputRef}
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0b1f3a] text-white hover:bg-[#7a0c0c] font-bold text-xs cursor-pointer border border-[#0b1f3a] rounded-none transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">upload</span>
                        Carregar Foto do Computador
                      </button>

                      <span className="text-slate-400 text-xs">ou amostra:</span>

                      <div className="flex items-center gap-1">
                        {DEFAULT_TEACHER_PHOTOS.map((pUrl, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setFormData({ ...formData, avatar: pUrl })}
                            className={`w-7 h-7 border rounded-none overflow-hidden cursor-pointer ${
                              formData.avatar === pUrl ? 'border-2 border-[#7a0c0c]' : 'border-slate-300'
                            }`}
                            title={`Foto ${idx + 1}`}
                          >
                            <img src={pUrl} alt={`Foto ${idx}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block uppercase font-bold text-slate-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Prof. Doutor..."
                  className="w-full h-9 px-3 rounded-none bg-white border border-slate-300 text-slate-800 focus:border-[#0b1f3a] focus:ring-1 focus:ring-[#0b1f3a] focus:outline-none font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase font-bold text-slate-700 mb-1">N.º de Agente *</label>
                  <input
                    type="text"
                    required
                    value={formData.agentNumber}
                    onChange={(e) => setFormData({ ...formData, agentNumber: e.target.value })}
                    className="w-full h-9 px-3 rounded-none bg-white border border-slate-300 font-mono text-slate-800 focus:border-[#0b1f3a] focus:ring-1 focus:ring-[#0b1f3a] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block uppercase font-bold text-slate-700 mb-1">Telefone de Contacto *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full h-9 px-3 rounded-none bg-white border border-slate-300 font-mono text-slate-800 focus:border-[#0b1f3a] focus:ring-1 focus:ring-[#0b1f3a] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase font-bold text-slate-700 mb-1">Departamento *</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full h-9 px-3 rounded-none bg-white border border-slate-300 text-slate-800 focus:border-[#0b1f3a] focus:ring-1 focus:ring-[#0b1f3a] focus:outline-none font-semibold"
                  >
                    <option value="Ciências Exatas">Ciências Exatas</option>
                    <option value="Saúde / Biológicas">Saúde / Biológicas</option>
                    <option value="Letras & Humanidades">Letras & Humanidades</option>
                    <option value="Tecnologia & Informática">Tecnologia & Informática</option>
                    <option value="Ciências Económicas & Jurídicas">Ciências Económicas & Jurídicas</option>
                  </select>
                </div>
                <div>
                  <label className="block uppercase font-bold text-slate-700 mb-1">Horas Semanais *</label>
                  <input
                    type="number"
                    value={formData.weeklyHours}
                    onChange={(e) => setFormData({ ...formData, weeklyHours: Number(e.target.value) })}
                    className="w-full h-9 px-3 rounded-none bg-white border border-slate-300 font-mono text-slate-800 focus:border-[#0b1f3a] focus:ring-1 focus:ring-[#0b1f3a] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase font-bold text-slate-700 mb-1">Habilitações Literárias</label>
                  <input
                    type="text"
                    value={formData.degree}
                    onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                    placeholder="Licenciatura / Mestrado / Doutoramento"
                    className="w-full h-9 px-3 rounded-none bg-white border border-slate-300 text-slate-800 focus:border-[#0b1f3a] focus:ring-1 focus:ring-[#0b1f3a] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block uppercase font-bold text-slate-700 mb-1">Estado de Vínculo</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full h-9 px-3 rounded-none bg-white border border-slate-300 text-slate-800 focus:border-[#0b1f3a] focus:ring-1 focus:ring-[#0b1f3a] focus:outline-none font-semibold"
                  >
                    <option value="ativo">Ativo no Quadro</option>
                    <option value="licenca">Em Licença</option>
                    <option value="contrato_vencer">Contrato a Vencer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block uppercase font-bold text-slate-700 mb-1">Nota Biográfica / Especialização</label>
                <textarea
                  rows={2}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Área de investigação, pós-graduações e experiência académica..."
                  className="w-full px-3 py-2 rounded-none bg-white border border-slate-300 text-slate-800 focus:border-[#0b1f3a] focus:ring-1 focus:ring-[#0b1f3a] focus:outline-none text-xs"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-300">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-none bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer border border-slate-300"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  disabled={submitStatus !== 'idle'}
                  className={`px-5 py-2.5 rounded-none font-bold text-xs transition-all duration-200 text-white shadow-none cursor-pointer border flex items-center gap-2 ${
                    submitStatus === 'success'
                      ? 'bg-emerald-700 border-emerald-700 text-white'
                      : 'bg-[#0b1f3a] hover:bg-[#7a0c0c] border-[#0b1f3a] text-white'
                  }`}
                >
                  {submitStatus === 'loading' && (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>A processar registo...</span>
                    </>
                  )}
                  {submitStatus === 'success' && (
                    <>
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      <span>Docente Guardado com Sucesso!</span>
                    </>
                  )}
                  {submitStatus === 'idle' && (
                    <>
                      <span className="material-symbols-outlined text-[16px]">save</span>
                      <span>{editingTeacher ? 'SALVAR ALTERAÇÕES' : 'CONTRATAR DOCENTE'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Consulta de Perfil do Docente */}
      {viewingTeacher && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="px-6 py-4 bg-[#0b1f3a] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-[22px]">account_box</span>
                </div>
                <div>
                  <h3 className="font-bold text-base">Perfil Individual do Docente</h3>
                  <p className="text-xs text-blue-200">
                    Registo Oficial de Docência • Ministério da Educação de Angola
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingTeacher(null)}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-slate-800">
              {/* Profile Card */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#0b1f3a] text-white flex items-center justify-center font-bold text-2xl shadow-xs shrink-0 overflow-hidden border-2 border-slate-200">
                    {viewingTeacher.avatar ? (
                      <img
                        src={viewingTeacher.avatar}
                        alt={viewingTeacher.name}
                        className="w-full h-full object-cover object-center"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      viewingTeacher.name
                        .split(' ')
                        .slice(0, 2)
                        .map((n) => n[0])
                        .join('')
                    )}
                  </div>
                  <div>
                    <h4 className="font-headline text-lg font-bold text-[#0b1f3a]">
                      {viewingTeacher.name}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                      <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                        Nº Agente: {viewingTeacher.agentNumber}
                      </span>
                      <span>•</span>
                      <span>{viewingTeacher.department}</span>
                      <span>•</span>
                      <span>{viewingTeacher.degree}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
                      viewingTeacher.status === 'ativo'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        viewingTeacher.status === 'ativo' ? 'bg-emerald-600' : 'bg-amber-600'
                      }`}
                    />
                    {viewingTeacher.status === 'ativo' ? 'Ativo no Quadro' : 'Em Licença'}
                  </span>
                </div>
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
                  <h5 className="font-bold text-[11px] uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px] text-[#0b1f3a]">contact_mail</span>
                    Contactos & Carga Horária
                  </h5>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Telefone:</span>
                    <a href={`tel:${viewingTeacher.phone}`} className="font-mono font-bold text-[#0b1f3a] hover:underline">
                      {viewingTeacher.phone}
                    </a>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">E-mail:</span>
                    <span className="font-mono text-slate-700">{viewingTeacher.email}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Carga Horária:</span>
                    <span className="font-mono font-bold text-slate-900">{viewingTeacher.weeklyHours} horas / semana</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Habilitação Principal:</span>
                    <span className="font-medium text-slate-800">{viewingTeacher.degree}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
                  <h5 className="font-bold text-[11px] uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px] text-[#0b1f3a]">meeting_room</span>
                    Turmas sob Direção de Turma (DT)
                  </h5>
                  {(() => {
                    const directed = classList.filter((c) => c.headTeacherId === viewingTeacher.id);
                    if (directed.length === 0) {
                      return (
                        <p className="text-slate-400 text-xs italic py-2">
                          Nenhuma direção de turma atribuída no momento. O docente atua como professor de disciplinas curriculares.
                        </p>
                      );
                    }
                    return (
                      <div className="space-y-1.5">
                        {directed.map((c) => (
                          <div
                            key={c.id}
                            className="p-2 rounded-lg bg-blue-50/70 border border-blue-100 flex items-center justify-between"
                          >
                            <span className="font-bold text-[#0b1f3a]">{c.name}</span>
                            <span className="text-[11px] text-slate-600 font-mono">
                              {c.shift} • {c.room || 'Sala'}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Bio */}
              {viewingTeacher.bio && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <h5 className="font-bold text-[11px] uppercase tracking-wider text-slate-400 mb-1">
                    Nota Biográfica / Especialização
                  </h5>
                  <p className="text-xs text-slate-700 leading-relaxed">{viewingTeacher.bio}</p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">print</span>
                <span>Imprimir Ficha</span>
              </button>

              <div className="flex items-center gap-2">
                {currentUserRole === 'admin' && (
                  <button
                    type="button"
                    onClick={() => {
                      const t = viewingTeacher;
                      setViewingTeacher(null);
                      handleOpenEdit(t);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0b1f3a] text-white hover:bg-[#7a0c0c] font-bold text-xs shadow-xs transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                    <span>Editar Perfil</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setViewingTeacher(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Eliminação de Docente */}
      {deletingTeacher && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-none max-w-md w-full shadow-2xl overflow-hidden border border-slate-300">
            <div className="px-6 py-4 bg-[#0b1f3a] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-red-400">warning</span>
                <h3 className="font-bold text-base">Eliminar Docente</h3>
              </div>
              <button
                onClick={() => setDeletingTeacher(null)}
                className="text-slate-300 hover:text-white p-1 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6">
              <div className="w-12 h-12 rounded-none bg-red-100 text-[#ac332b] flex items-center justify-center mx-auto mb-4 border border-red-200">
                <span className="material-symbols-outlined text-[28px]">delete_forever</span>
              </div>
              <h3 className="font-headline text-lg font-bold text-slate-900 text-center">
                Eliminar Docente da Base de Dados?
              </h3>
              <p className="text-xs text-slate-600 text-center mt-2 leading-relaxed">
                Pretende eliminar o docente <strong className="text-slate-900">{deletingTeacher.name}</strong> (Agente nº{' '}
                <span className="font-mono font-bold">{deletingTeacher.agentNumber}</span>)? Esta operação removerá o professor da base de dados institucional.
              </p>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-300 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingTeacher(null)}
                className="px-4 py-2.5 rounded-none bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer border border-slate-300"
              >
                Cancelar
              </button>
              <AsyncButton
                variant="danger"
                loadingText="A eliminar docente..."
                successText="Docente Eliminado com Sucesso!"
                onAsyncClick={async () => {
                  await new Promise((r) => setTimeout(r, 600));
                  dbService.deleteTeacher(deletingTeacher.id);
                }}
                onSuccessComplete={() => {
                  setDeletingTeacher(null);
                }}
              >
                Confirmar Eliminação
              </AsyncButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
