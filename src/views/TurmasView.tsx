import React, { useState, useMemo, useEffect } from 'react';
import { SchoolDatabase, SchoolClass, UserRole, Subject, ClassRoom } from '../types';
import { dbService } from '../services/db';
import {
  getActiveSubsystems,
  getAvailableGrades,
  getAvailableAreas,
  getCycleForGrade,
  generateSuggestedClassName,
  getSubsystemForGrade
} from '../utils/educationSubsystems';

interface TurmasViewProps {
  db: SchoolDatabase;
  currentUserRole: UserRole;
  onNavigateToAttendance: (classId: string) => void;
  onNavigateToStudents: (classId?: string) => void;
  onNavigateToPautas?: () => void;
}

export const TurmasView: React.FC<TurmasViewProps> = ({
  db,
  currentUserRole,
  onNavigateToAttendance,
  onNavigateToStudents,
  onNavigateToPautas
}) => {
  // Education subsystems and grades configured by institution settings
  const activeSubsystems = useMemo(
    () => getActiveSubsystems(db.settings?.selectedSubsystems),
    [db.settings?.selectedSubsystems]
  );

  const availableGrades = useMemo(
    () => getAvailableGrades(db.settings?.selectedSubsystems),
    [db.settings?.selectedSubsystems]
  );

  const cycleFilterOptions = useMemo(() => {
    return ['Todos', ...activeSubsystems.map((s) => s.shortName)];
  }, [activeSubsystems]);

  // Navigation & Filter state
  const [activeTab, setActiveTab] = useState<'turmas' | 'matriz'>('turmas');
  const [selectedCycleFilter, setSelectedCycleFilter] = useState<string>('Todos');
  const [disciplineSearch, setDisciplineSearch] = useState('');
  const [disciplinePage, setDisciplinePage] = useState(1);
  const itemsPerPage = 6;

  // Modals state
  const [showSalasModal, setShowSalasModal] = useState(false);
  const [showNovaTurmaModal, setShowNovaTurmaModal] = useState(false);
  const [showNovaDisciplinaModal, setShowNovaDisciplinaModal] = useState(false);
  const [selectedScheduleClass, setSelectedScheduleClass] = useState<ClassRoom | null>(null);
  const [selectedStudentsClass, setSelectedStudentsClass] = useState<ClassRoom | null>(null);
  const [selectedPautaClass, setSelectedPautaClass] = useState<ClassRoom | null>(null);

  // New Class Form State
  const initialGrade = availableGrades[0] || '10ª Classe';
  const [newClassGrade, setNewClassGrade] = useState<string>(initialGrade);
  const [newClassSection, setNewClassSection] = useState('A');

  // Dynamic available areas based on selected grade and subsystems
  const availableAreasForGrade = useMemo(
    () => getAvailableAreas(db.settings?.selectedSubsystems, newClassGrade),
    [db.settings?.selectedSubsystems, newClassGrade]
  );

  const [newClassArea, setNewClassArea] = useState<string>(() => availableAreasForGrade[0] || 'Tronco Comum');
  const [newClassName, setNewClassName] = useState<string>(() =>
    generateSuggestedClassName(initialGrade, 'A', availableAreasForGrade[0])
  );
  const [newClassShift, setNewClassShift] = useState<'Manhã' | 'Tarde' | 'Integral'>('Manhã');
  const [newClassRoom, setNewClassRoom] = useState('Sala B-106');
  const [newClassCapacity, setNewClassCapacity] = useState(30);
  const [newClassHeadTeacherId, setNewClassHeadTeacherId] = useState(db.teachers[0]?.id || '');
  const [newClassDelegate, setNewClassDelegate] = useState('');

  // Keep newClassGrade in sync if availableGrades changes
  useEffect(() => {
    if (availableGrades.length > 0 && !availableGrades.includes(newClassGrade)) {
      const firstGrade = availableGrades[0];
      setNewClassGrade(firstGrade);
      const newAreas = getAvailableAreas(db.settings?.selectedSubsystems, firstGrade);
      const firstArea = newAreas[0] || 'Geral';
      setNewClassArea(firstArea);
      setNewClassName(generateSuggestedClassName(firstGrade, newClassSection, firstArea));
    }
  }, [availableGrades]);

  // Current detected subsystem for the selected grade
  const currentSubsystem = useMemo(
    () => getSubsystemForGrade(newClassGrade),
    [newClassGrade]
  );

  // New Discipline Form State
  const [newSubCode, setNewSubCode] = useState('');
  const [newSubName, setNewSubName] = useState('');
  const [newSubDescription, setNewSubDescription] = useState('');
  const [newSubCycle, setNewSubCycle] = useState(
    activeSubsystems[0]?.fullName || 'Ensino Secundário Geral'
  );
  const [newSubArea, setNewSubArea] = useState(
    activeSubsystems[0]?.coursesOrAreas[0] || 'Ciências Físicas/Biológicas'
  );
  const [newSubHours, setNewSubHours] = useState(4);
  const [newSubCoordinator, setNewSubCoordinator] = useState(db.teachers[0]?.name || 'Prof. Alberto Gusmão');
  const [newSubStatus, setNewSubStatus] = useState<'Aprovada' | 'Em Revisão' | 'Pendente'>('Aprovada');

  // Rooms Data for the Resumo de Salas modal
  const roomsList = [
    { name: 'Sala B-104', capacity: 30, current: 28, shift: 'Manhã: 10ª Turma A', status: 'ocupada', statusText: 'Ocupada (28/30)' },
    { name: 'Sala B-105', capacity: 30, current: 30, shift: 'Manhã: 10ª Turma B', status: 'cheia', statusText: 'Ocupada (30/30)' },
    { name: 'Sala C-201', capacity: 32, current: 26, shift: 'Tarde: 11ª Turma A', status: 'livre-manha', statusText: 'Livre Matutino' },
    { name: 'Sala C-202', capacity: 30, current: 27, shift: 'Tarde: 11ª Turma B', status: 'livre-manha', statusText: 'Livre Matutino' },
    { name: 'Lab. A-101', capacity: 30, current: 29, shift: '12ª Finalista A', status: 'integral', statusText: 'Ocupada Integral' },
    { name: 'Auditório 01', capacity: 80, current: 0, shift: 'Disponível p/ Palestras', status: 'misto', statusText: 'Uso Misto' },
    { name: 'Lab. B-202', capacity: 28, current: 24, shift: 'Físico-Química Exp.', status: 'ocupada', statusText: 'Em Atividade' },
    { name: 'Sala D-301', capacity: 32, current: 28, shift: 'Manhã: 11ª Turma C', status: 'livre-tarde', statusText: 'Livre Vespertino' },
    { name: 'Sala D-302', capacity: 30, current: 25, shift: 'Tarde: 12ª Turma B', status: 'livre-manha', statusText: 'Livre Matutino' }
  ];

  // Filtering classes based on configured subsystems
  const filteredClasses = useMemo(() => {
    return (db.classes || []).filter((cls) => {
      if (selectedCycleFilter === 'Todos') return true;
      const targetSub = activeSubsystems.find((s) => s.shortName === selectedCycleFilter);
      if (targetSub) {
        return (
          targetSub.grades.some((g) => cls.grade === g || cls.grade?.toLowerCase().includes(g.toLowerCase())) ||
          (cls.cycle && cls.cycle.toLowerCase().includes(targetSub.shortName.toLowerCase())) ||
          (cls.cycle && cls.cycle.toLowerCase().includes(targetSub.name.toLowerCase())) ||
          (cls.area && targetSub.coursesOrAreas.some((a) => cls.area.toLowerCase().includes(a.toLowerCase())))
        );
      }
      return true;
    });
  }, [db.classes, selectedCycleFilter, activeSubsystems]);

  // Filtering subjects
  const filteredSubjects = useMemo(() => {
    return (db.subjects || []).filter((sub) => {
      const matchSearch =
        sub.name.toLowerCase().includes(disciplineSearch.toLowerCase()) ||
        sub.code.toLowerCase().includes(disciplineSearch.toLowerCase()) ||
        (sub.description && sub.description.toLowerCase().includes(disciplineSearch.toLowerCase())) ||
        sub.cycle.toLowerCase().includes(disciplineSearch.toLowerCase()) ||
        (sub.coordinatorName && sub.coordinatorName.toLowerCase().includes(disciplineSearch.toLowerCase()));
      return matchSearch;
    });
  }, [db.subjects, disciplineSearch]);

  const totalSubjectPages = Math.ceil(filteredSubjects.length / itemsPerPage) || 1;
  const paginatedSubjects = useMemo(() => {
    const start = (disciplinePage - 1) * itemsPerPage;
    return filteredSubjects.slice(start, start + itemsPerPage);
  }, [filteredSubjects, disciplinePage, itemsPerPage]);

  // Create Class Submit with auto-detected cycle
  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    const headTeacherObj = db.teachers.find((t) => t.id === newClassHeadTeacherId) || db.teachers[0];
    const resolvedCycle = getCycleForGrade(newClassGrade);

    dbService.addClass({
      name: newClassName,
      grade: newClassGrade,
      section: newClassSection,
      cycle: resolvedCycle,
      area: newClassArea,
      shift: newClassShift,
      room: newClassRoom,
      studentCount: 0,
      maxCapacity: Number(newClassCapacity) || 30,
      headTeacherId: headTeacherObj ? headTeacherObj.id : '',
      headTeacherName: headTeacherObj ? headTeacherObj.name : 'A designar',
      delegateName: newClassDelegate.trim() || 'A eleger pela turma',
      academicYear: db.settings?.currentAcademicYear || '2024/2025'
    });

    // Reset with dynamic suggestion
    const defaultGrade = availableGrades[0] || '10ª Classe';
    const defaultAreas = getAvailableAreas(db.settings?.selectedSubsystems, defaultGrade);
    setNewClassGrade(defaultGrade);
    setNewClassSection('A');
    setNewClassArea(defaultAreas[0] || 'Tronco Comum');
    setNewClassName(generateSuggestedClassName(defaultGrade, 'A', defaultAreas[0]));
    setNewClassDelegate('');
    setShowNovaTurmaModal(false);
  };

  // Create Subject Submit
  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim() || !newSubCode.trim()) return;

    const initials = newSubCoordinator
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join('');

    dbService.addSubject({
      code: newSubCode.toUpperCase(),
      name: newSubName,
      cycle: newSubCycle,
      area: newSubArea,
      weeklyHours: Number(newSubHours) || 4,
      description: newSubDescription || 'Unidade Curricular da Base Nacional',
      coordinatorName: newSubCoordinator,
      coordinatorAvatar: initials || 'DC',
      status: newSubStatus
    });

    setNewSubCode('');
    setNewSubName('');
    setNewSubDescription('');
    setShowNovaDisciplinaModal(false);
  };

  // Weekly timetable mock schedule generator for a class
  const getWeeklyTimetable = (cls: ClassRoom) => {
    const isBio = cls.area?.includes('Físicas') || cls.name.includes('A');
    if (isBio) {
      return [
        { time: '07:30 - 08:15', seg: 'Matemática Geral', ter: 'Física Experimental', qua: 'Biologia Celular', qui: 'Língua Portuguesa', sex: 'Química Geral' },
        { time: '08:15 - 09:00', seg: 'Matemática Geral', ter: 'Física Experimental', qua: 'Biologia Celular', qui: 'Língua Portuguesa', sex: 'Química Geral' },
        { time: '09:00 - 09:30', seg: 'INTERVALO', ter: 'INTERVALO', qua: 'INTERVALO', qui: 'INTERVALO', sex: 'INTERVALO' },
        { time: '09:30 - 10:15', seg: 'Química Lab. (A-101)', ter: 'Matemática Geral', qua: 'Inglês Técnico', qui: 'Educação Física', sex: 'Geometria Descritiva' },
        { time: '10:15 - 11:00', seg: 'Química Lab. (A-101)', ter: 'Matemática Geral', qua: 'Inglês Técnico', qui: 'Educação Física', sex: 'Formação Cívica' },
        { time: '11:15 - 12:00', seg: 'Informática / TIC', ter: 'Biologia Celular', qua: 'História de Angola', qui: 'Matemática Geral', sex: 'Apoio ao Estudo' }
      ];
    }
    return [
      { time: '13:00 - 13:45', seg: 'Introd. à Economia', ter: 'Direito & Cidadania', qua: 'Matemática Aplicada', qui: 'Língua Portuguesa', sex: 'Contabilidade Geral' },
      { time: '13:45 - 14:30', seg: 'Introd. à Economia', ter: 'Direito & Cidadania', qua: 'Matemática Aplicada', qui: 'Língua Portuguesa', sex: 'Contabilidade Geral' },
      { time: '14:30 - 15:00', seg: 'INTERVALO', ter: 'INTERVALO', qua: 'INTERVALO', qui: 'INTERVALO', sex: 'INTERVALO' },
      { time: '15:00 - 15:45', seg: 'Geografia Económica', ter: 'Introd. à Economia', qua: 'Inglês Comercial', qui: 'Educação Física', sex: 'Estatística Aplicada' },
      { time: '15:45 - 16:30', seg: 'Geografia Económica', ter: 'Introd. à Economia', qua: 'Inglês Comercial', qui: 'Educação Física', sex: 'Sociologia Geral' },
      { time: '16:45 - 17:30', seg: 'Tecnologias TIC', ter: 'História Económica', qua: 'Filosofia Moral', qui: 'Direito & Cidadania', sex: 'Seminário de Gestão' }
    ];
  };

  return (
    <div className="flex flex-col w-full gap-6 pb-12">
      {/* Top Banner / Page Header matching template */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 lg:p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-slate-100 pointer-events-none blur-2xl" />
        <div className="flex flex-col z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-[#ac332b] uppercase tracking-widest">
              Ano Letivo Vigente: {db.settings?.currentAcademicYear || '2024 / 2025'}
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="text-[11px] font-mono text-slate-500 font-semibold">MAPA-CURR-AO</span>
          </div>
          <h1 className="font-headline text-2xl lg:text-3xl font-extrabold text-[#0b1f3a] tracking-tight">
            Gestão de Turmas & Matriz Curricular
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
            Organização de salas, ciclos de ensino, alocação de diretores de turma e grelhas curriculares oficiais para a formação acadêmica em Angola.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5 z-10 shrink-0">
          <button
            onClick={() => setShowNovaDisciplinaModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors shadow-xs"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px] text-[#0b1f3a]">library_add</span>
            <span>+ Adicionar Disciplina</span>
          </button>
          <button
            onClick={() => setShowNovaTurmaModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0b1f3a] text-white hover:bg-[#7a0c0c] transition-all shadow-md font-bold text-xs"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">group_add</span>
            <span>+ Criar Nova Turma</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid (4 Cards matching template) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total de Turmas */}
        <div className="relative bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#0b1f3a]" />
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total de Turmas
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[#0b1f3a]">
              <span className="material-symbols-outlined text-[20px]">meeting_room</span>
            </div>
          </div>
          <div className="mt-2 flex flex-col">
            <span className="font-headline text-3xl font-extrabold text-[#0b1f3a] leading-tight">
              54
            </span>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
              <span className="font-semibold text-[#0b1f3a]">54 Turmas Ativas</span>
              <span>•</span>
              <span>12 Salas Específicas</span>
            </div>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Matutino: 28</span>
            <span>Vespertino: 26</span>
          </div>
        </div>

        {/* KPI 2: Total de Disciplinas */}
        <div className="relative bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#4d5f7d]" />
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total de Disciplinas
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[#0b1f3a]">
              <span className="material-symbols-outlined text-[20px]">auto_stories</span>
            </div>
          </div>
          <div className="mt-2 flex flex-col">
            <span className="font-headline text-3xl font-extrabold text-[#0b1f3a] leading-tight">
              38
            </span>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
              <span className="font-semibold text-[#0b1f3a]">Unidades Curriculares</span>
              <span>•</span>
              <span>Base Nacional</span>
            </div>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Carga Média: 4.8h/sem</span>
            <span className="text-[#ac332b] font-semibold">100% Homologado</span>
          </div>
        </div>

        {/* KPI 3: Ocupação Média de Salas */}
        <div className="relative bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#ac332b]" />
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Ocupação Média de Salas
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-[#ac332b]">
              <span className="material-symbols-outlined text-[20px]">groups</span>
            </div>
          </div>
          <div className="mt-2 flex flex-col">
            <span className="font-headline text-3xl font-extrabold text-[#0b1f3a] leading-tight">
              89.4%
            </span>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Média: 27 / 30 alunos</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-4 overflow-hidden">
            <div className="bg-[#ac332b] h-full rounded-full" style={{ width: '89.4%' }} />
          </div>
        </div>

        {/* KPI 4: Diretores de Turma */}
        <div className="relative bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#001a52]" />
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Diretores de Turma
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#0b1f3a]">
              <span className="material-symbols-outlined text-[20px]">assignment_ind</span>
            </div>
          </div>
          <div className="mt-2 flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="font-headline text-3xl font-extrabold text-[#0b1f3a] leading-tight">
                54 / 54
              </span>
              <span className="text-xs font-mono text-slate-500 font-bold">(100%)</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
              <span className="font-semibold text-[#0b1f3a]">Alocação Plena</span>
              <span>•</span>
              <span>0 Pendências</span>
            </div>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-semibold text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              Convocatória Ativa
            </span>
            <span className="font-mono text-[11px]">Sede Central</span>
          </div>
        </div>
      </div>

      {/* Primary Tab Bar & Interactive Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        {/* Main Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('turmas')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all shrink-0 flex items-center gap-2 ${
              activeTab === 'turmas'
                ? 'bg-[#0b1f3a] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">grid_view</span>
            <span>Turmas por Ciclo</span>
          </button>

          <button
            onClick={() => setActiveTab('matriz')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all shrink-0 flex items-center gap-2 ${
              activeTab === 'matriz'
                ? 'bg-[#0b1f3a] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">table_rows</span>
            <span>Matriz de Disciplinas & Carga Horária</span>
          </button>

          <button
            onClick={() => setShowSalasModal(true)}
            className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-bold text-xs transition-colors shrink-0 flex items-center gap-2"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">apartment</span>
            <span>Resumo de Salas (24)</span>
          </button>
        </div>

        {/* Sub-Filters for Cycle based on active subsystems */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end overflow-x-auto">
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1 shrink-0">
            {cycleFilterOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => setSelectedCycleFilter(opt)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCycleFilter === opt
                    ? 'bg-white shadow-xs text-[#0b1f3a]'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                type="button"
              >
                {opt}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              const currIdx = cycleFilterOptions.indexOf(selectedCycleFilter);
              const nextIdx = (currIdx + 1) % cycleFilterOptions.length;
              setSelectedCycleFilter(cycleFilterOptions[nextIdx]);
            }}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 shrink-0"
            title="Alternar Filtro Rápido"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
          </button>
        </div>
      </div>

      {/* VIEW CONTENT BASED ON ACTIVE TAB OR SCROLL */}
      {activeTab === 'turmas' ? (
        /* SECTION 1: TURMAS POR CICLO (Cards Mosaic & Categorization) */
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0b1f3a]" />
              <h2 className="font-headline text-lg font-bold text-slate-900 tracking-tight">
                Ensino Médio / Secundário Geral • 10ª, 11ª e 12ª Classes
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-500 font-semibold">
              {filteredClasses.length} Turmas em Exibição
            </span>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredClasses.map((cls) => {
              const dir = db.teachers.find((t) => t.id === cls.headTeacherId);
              const dirName = cls.headTeacherName || (dir ? dir.name : 'Prof. Alberto Gusmão');
              const delegate = cls.delegateName || 'Delegado a designar';
              const capacity = cls.maxCapacity || 30;
              const students = cls.studentCount || 28;
              const occupancyPct = Math.round((students / capacity) * 100);
              const isMorning = cls.shift === 'Manhã';

              return (
                <div
                  key={cls.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-[#0b1f3a]" />

                  <div>
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-[#0b1f3a] text-[10px] font-bold tracking-wider uppercase">
                            {cls.area || 'C. Físicas e Biológicas'}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-[10px] text-slate-600 font-semibold">
                            {cls.room || 'Sala B-104'}
                          </span>
                        </div>
                        <h3 className="font-headline text-base font-bold text-slate-900 group-hover:text-[#0b1f3a] transition-colors">
                          {cls.name}
                        </h3>
                      </div>

                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold shrink-0">
                        <span className={`material-symbols-outlined text-[15px] ${isMorning ? 'text-amber-500' : 'text-indigo-500'}`}>
                          {isMorning ? 'wb_sunny' : 'bedtime'}
                        </span>
                        <span>{cls.shift}</span>
                      </span>
                    </div>

                    {/* Room Occupancy Bar */}
                    <div className="mt-4 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Lotação da Sala:</span>
                        <span className="font-bold text-slate-900 font-mono">
                          {students} / {capacity} Alunos ({occupancyPct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            occupancyPct >= 100 ? 'bg-[#ac332b]' : 'bg-[#0b1f3a]'
                          }`}
                          style={{ width: `${Math.min(occupancyPct, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Staff & Delegate Info Box */}
                    <div className="mt-4 pt-3 bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col gap-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 flex items-center gap-1.5 text-[11px] font-medium">
                          <span className="material-symbols-outlined text-[15px] text-[#0b1f3a]">school</span>
                          Dir. de Turma:
                        </span>
                        <span className="font-bold text-slate-900 text-[12px] truncate max-w-[170px]">
                          {dirName}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 flex items-center gap-1.5 text-[11px] font-medium">
                          <span className="material-symbols-outlined text-[15px] text-slate-500">badge</span>
                          Delegado:
                        </span>
                        <span className="text-slate-800 text-[12px] font-mono">
                          {delegate}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3 Action Buttons matching template */}
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        if (onNavigateToPautas) onNavigateToPautas();
                        else setSelectedPautaClass(cls);
                      }}
                      className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs text-center transition-colors shadow-xs"
                      type="button"
                    >
                      Ver Pauta
                    </button>
                    <button
                      onClick={() => setSelectedScheduleClass(cls)}
                      className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs text-center transition-colors shadow-xs"
                      type="button"
                    >
                      Horário
                    </button>
                    <button
                      onClick={() => {
                        setSelectedStudentsClass(cls);
                      }}
                      className="flex-1 py-2 rounded-xl bg-[#0b1f3a] text-white font-bold text-xs text-center shadow-xs hover:bg-[#7a0c0c] transition-colors"
                      type="button"
                    >
                      Alunos ({students})
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* SECTION 2: MATRIZ DE DISCIPLINAS & CARGA HORÁRIA (Shows directly or via Tab) */}
      <div className="flex flex-col gap-4 mt-2" id="matriz-curricular">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ac332b]" />
            <div>
              <h2 className="font-headline text-lg font-bold text-slate-900 tracking-tight">
                Matriz de Disciplinas & Carga Horária Oficial
              </h2>
              <span className="text-xs text-slate-500 block">
                Distribuição letiva semanal conforme as diretrizes curriculares do MED Angola
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">
                search
              </span>
              <input
                value={disciplineSearch}
                onChange={(e) => {
                  setDisciplineSearch(e.target.value);
                  setDisciplinePage(1);
                }}
                className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 text-slate-800 rounded-xl text-xs shadow-xs outline-none focus:ring-1 focus:ring-[#0b1f3a] w-56"
                placeholder="Filtrar disciplina..."
                type="text"
              />
            </div>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl shadow-xs border border-slate-200 flex items-center gap-1.5 transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px] text-[#ac332b]">file_download</span>
              <span>Exportar Matriz (PDF)</span>
            </button>
          </div>
        </div>

        {/* Data Table Container */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold text-[11px] uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Código</th>
                  <th className="py-3 px-4">Nome da Disciplina</th>
                  <th className="py-3 px-4">Ciclo / Área</th>
                  <th className="py-3 px-4 text-center">Carga Semanal</th>
                  <th className="py-3 px-4">Docente Coordenador</th>
                  <th className="py-3 px-4 text-center">Planificação Pedagógica</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
                {paginatedSubjects.map((sub) => {
                  const isApproved = sub.status === 'Aprovada' || !sub.status;
                  const avatarInitials = sub.coordinatorAvatar || (sub.coordinatorName ? sub.coordinatorName.split(' ').slice(0, 2).map((w) => w[0]).join('') : 'DC');

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-[13px] font-bold text-[#0b1f3a]">
                        {sub.code}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {sub.name}
                        <span className="block text-slate-500 font-normal text-[11px] mt-0.5">
                          {sub.description || 'Unidade Curricular da Matriz Oficial'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {sub.cycle}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-700">
                        {sub.weeklyHours} Tempos ({sub.weeklyHours * 45} min)
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#0b1f3a] text-white flex items-center justify-center font-bold text-[9px] shrink-0">
                            {avatarInitials}
                          </div>
                          <span className="font-medium text-slate-800">
                            {sub.coordinatorName || 'Prof. Coordenador'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            isApproved
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isApproved ? 'bg-emerald-600' : 'bg-amber-600'}`} />
                          {sub.status || 'Aprovada'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            alert(`Disciplina: ${sub.name} (${sub.code})\nCarga: ${sub.weeklyHours} tempos semanais\nCoordenador: ${sub.coordinatorName || 'Docente Coordenador'}\nEstado: ${sub.status || 'Aprovada'}`);
                          }}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition-colors"
                          title="Detalhes da Unidade Curricular"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit_note</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer / Pagination */}
          <div className="py-3 px-4 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <span>
              Mostrando {Math.min(filteredSubjects.length, itemsPerPage)} de {filteredSubjects.length} disciplinas curriculares registadas
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setDisciplinePage((p) => Math.max(1, p - 1))}
                disabled={disciplinePage <= 1}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 disabled:opacity-30 transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              {Array.from({ length: totalSubjectPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setDisciplinePage(pageNum)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                    disciplinePage === pageNum
                      ? 'bg-[#0b1f3a] text-white shadow-xs'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                  type="button"
                >
                  {pageNum}
                </button>
              ))}
              <button
                onClick={() => setDisciplinePage((p) => Math.min(totalSubjectPages, p + 1))}
                disabled={disciplinePage >= totalSubjectPages}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 disabled:opacity-30 transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: RESUMO DE SALAS (matching template) */}
      {showSalasModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-6 flex flex-col gap-4 max-h-[85vh] overflow-y-auto border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0b1f3a] text-[24px]">meeting_room</span>
                <h3 className="font-headline text-lg font-bold text-slate-900">Mapa de Ocupação & Salas de Aula</h3>
              </div>
              <button
                onClick={() => setShowSalasModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Visão global da distribuição física de blocos letivos para o turno matutino e vespertino.
            </p>

            {/* Rooms Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {roomsList.map((room, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">{room.name}</span>
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        room.status === 'cheia'
                          ? 'bg-[#ac332b]'
                          : room.status === 'ocupada'
                          ? 'bg-amber-500'
                          : room.status === 'integral'
                          ? 'bg-indigo-600'
                          : 'bg-emerald-500'
                      }`}
                      title={room.statusText}
                    />
                  </div>
                  <span className="text-[11px] text-slate-500">Capacidade: {room.capacity} Lugares</span>
                  <span className="text-[11px] font-semibold text-[#0b1f3a] truncate">{room.shift}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowSalasModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
                type="button"
              >
                Fechar Resumo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CRIAR NOVA TURMA */}
      {showNovaTurmaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0b1f3a] text-[22px]">group_add</span>
                <h3 className="font-headline text-lg font-bold text-slate-900">Criar Nova Turma</h3>
              </div>
              <button
                onClick={() => setShowNovaTurmaModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Sub-sistema Detetado automaticamente */}
            {currentSubsystem && (
              <div className="mt-3 p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#0b1f3a] text-white flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px]">{currentSubsystem.icon}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">
                      {currentSubsystem.fullName}
                    </span>
                    <span className="text-[11px] text-slate-600 block">
                      Regime: <strong>{currentSubsystem.regime}</strong> • Ciclo: <strong>{getCycleForGrade(newClassGrade)}</strong>
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-[#0b1f3a] shrink-0">
                  Auto-detetado
                </span>
              </div>
            )}

            <form onSubmit={handleCreateClass} className="mt-4 space-y-4 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider">
                    Nome Oficial da Turma
                  </label>
                  <button
                    type="button"
                    onClick={() => setNewClassName(generateSuggestedClassName(newClassGrade, newClassSection, newClassArea))}
                    className="text-[11px] text-[#0b1f3a] hover:underline font-bold flex items-center gap-1"
                    title="Preencher automaticamente segundo a nomenclatura oficial"
                  >
                    <span className="material-symbols-outlined text-[14px]">auto_fix_high</span>
                    <span>Sugerir Nome Oficial</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="ex: 10ª Classe • Turma C"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0b1f3a] outline-none text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Classe / Ano (Sub-sistemas da Escola)
                  </label>
                  <select
                    value={newClassGrade}
                    onChange={(e) => {
                      const selectedG = e.target.value;
                      setNewClassGrade(selectedG);
                      const areas = getAvailableAreas(db.settings?.selectedSubsystems, selectedG);
                      const firstArea = areas[0] || 'Tronco Comum';
                      setNewClassArea(firstArea);
                      setNewClassName(generateSuggestedClassName(selectedG, newClassSection, firstArea));
                    }}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0b1f3a] outline-none text-xs font-semibold"
                  >
                    {activeSubsystems.map((sub) => (
                      <optgroup key={sub.id} label={`${sub.fullName} (${sub.regime})`}>
                        {sub.grades.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Secção / Turma
                  </label>
                  <input
                    type="text"
                    required
                    value={newClassSection}
                    onChange={(e) => {
                      const sec = e.target.value;
                      setNewClassSection(sec);
                      setNewClassName(generateSuggestedClassName(newClassGrade, sec, newClassArea));
                    }}
                    placeholder="ex: A, B, C ou Manhã"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0b1f3a] outline-none text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Área Curricular / Curso
                  </label>
                  <select
                    value={newClassArea}
                    onChange={(e) => {
                      const ar = e.target.value;
                      setNewClassArea(ar);
                      setNewClassName(generateSuggestedClassName(newClassGrade, newClassSection, ar));
                    }}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0b1f3a] outline-none text-xs font-medium"
                  >
                    {availableAreasForGrade.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Turno
                  </label>
                  <select
                    value={newClassShift}
                    onChange={(e) => setNewClassShift(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0b1f3a] outline-none text-xs"
                  >
                    <option value="Manhã">Manhã (07:30 - 12:30)</option>
                    <option value="Tarde">Tarde (13:00 - 18:00)</option>
                    <option value="Integral">Integral</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Sala de Aulas
                  </label>
                  <input
                    type="text"
                    required
                    value={newClassRoom}
                    onChange={(e) => setNewClassRoom(e.target.value)}
                    placeholder="ex: Sala B-106"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0b1f3a] outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Lotação Máxima
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="50"
                    required
                    value={newClassCapacity}
                    onChange={(e) => setNewClassCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0b1f3a] outline-none text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Diretor(a) de Turma
                </label>
                <select
                  value={newClassHeadTeacherId}
                  onChange={(e) => setNewClassHeadTeacherId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0b1f3a] outline-none text-xs"
                >
                  {db.teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} — {t.department}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Delegado(a) de Turma
                </label>
                <input
                  type="text"
                  value={newClassDelegate}
                  onChange={(e) => setNewClassDelegate(e.target.value)}
                  placeholder="ex: Mauro Kissange (Nº 14)"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0b1f3a] outline-none text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNovaTurmaModal(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#0b1f3a] hover:bg-[#7a0c0c] text-white font-bold shadow-md transition-colors"
                >
                  Gravar Turma
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADICIONAR DISCIPLINA */}
      {showNovaDisciplinaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0b1f3a] text-[22px]">library_add</span>
                <h3 className="font-headline text-lg font-bold text-slate-900">Adicionar Unidade Curricular</h3>
              </div>
              <button
                onClick={() => setShowNovaDisciplinaModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateSubject} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Código
                  </label>
                  <input
                    type="text"
                    required
                    value={newSubCode}
                    onChange={(e) => setNewSubCode(e.target.value)}
                    placeholder="ex: QUI-11"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0b1f3a] outline-none text-xs font-mono font-bold"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nome da Disciplina
                  </label>
                  <input
                    type="text"
                    required
                    value={newSubName}
                    onChange={(e) => setNewSubName(e.target.value)}
                    placeholder="ex: Química Orgânica"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0b1f3a] outline-none text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Ementa / Descrição Resumida
                </label>
                <input
                  type="text"
                  value={newSubDescription}
                  onChange={(e) => setNewSubDescription(e.target.value)}
                  placeholder="ex: Compostos de Carbono, Funções Orgânicas e Bioquímica"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0b1f3a] outline-none text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Ciclo / Sub-sistema de Ensino
                  </label>
                  <select
                    value={newSubCycle}
                    onChange={(e) => setNewSubCycle(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0b1f3a] outline-none text-xs font-medium"
                  >
                    {activeSubsystems.map((sub) => (
                      <option key={sub.id} value={sub.fullName}>
                        {sub.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Carga Semanal (Tempos)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={newSubHours}
                    onChange={(e) => setNewSubHours(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0b1f3a] outline-none text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Docente Coordenador
                  </label>
                  <input
                    type="text"
                    value={newSubCoordinator}
                    onChange={(e) => setNewSubCoordinator(e.target.value)}
                    placeholder="ex: Prof. Alberto Gusmão"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0b1f3a] outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Planificação Pedagógica
                  </label>
                  <select
                    value={newSubStatus}
                    onChange={(e) => setNewSubStatus(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0b1f3a] outline-none text-xs"
                  >
                    <option value="Aprovada">Aprovada</option>
                    <option value="Em Revisão">Em Revisão</option>
                    <option value="Pendente">Pendente</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNovaDisciplinaModal(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#0b1f3a] hover:bg-[#7a0c0c] text-white font-bold shadow-md transition-colors"
                >
                  Gravar Disciplina
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: HORÁRIO DA TURMA */}
      {selectedScheduleClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl p-6 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Grelha Horária Semanal
                </span>
                <h3 className="font-headline text-lg font-bold text-[#0b1f3a]">
                  {selectedScheduleClass.name} — {selectedScheduleClass.room} ({selectedScheduleClass.shift})
                </h3>
                <span className="text-xs text-slate-500">
                  Diretor de Turma: <strong>{selectedScheduleClass.headTeacherName || 'Coordenação'}</strong>
                </span>
              </div>
              <button
                onClick={() => setSelectedScheduleClass(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#0b1f3a] text-white uppercase text-[10px]">
                    <th className="py-2.5 px-3 w-28">Horário</th>
                    <th className="py-2.5 px-3">Segunda-feira</th>
                    <th className="py-2.5 px-3">Terça-feira</th>
                    <th className="py-2.5 px-3">Quarta-feira</th>
                    <th className="py-2.5 px-3">Quinta-feira</th>
                    <th className="py-2.5 px-3">Sexta-feira</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 border-b border-slate-200">
                  {getWeeklyTimetable(selectedScheduleClass).map((row, idx) => {
                    const isBreak = row.seg === 'INTERVALO';
                    return (
                      <tr key={idx} className={isBreak ? 'bg-amber-50/70 font-bold text-amber-900' : 'hover:bg-slate-50'}>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-700 bg-slate-50 border-r border-slate-200">
                          {row.time}
                        </td>
                        <td className={`py-2.5 px-3 ${isBreak ? 'text-center font-bold' : 'font-semibold text-[#0b1f3a]'}`}>
                          {row.seg}
                        </td>
                        <td className={`py-2.5 px-3 ${isBreak ? 'text-center font-bold' : 'font-semibold text-[#0b1f3a]'}`}>
                          {row.ter}
                        </td>
                        <td className={`py-2.5 px-3 ${isBreak ? 'text-center font-bold' : 'font-semibold text-[#0b1f3a]'}`}>
                          {row.qua}
                        </td>
                        <td className={`py-2.5 px-3 ${isBreak ? 'text-center font-bold' : 'font-semibold text-[#0b1f3a]'}`}>
                          {row.qui}
                        </td>
                        <td className={`py-2.5 px-3 ${isBreak ? 'text-center font-bold' : 'font-semibold text-[#0b1f3a]'}`}>
                          {row.sex}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
              <span>Matriz curricular aprovada pelo MED Angola</span>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center gap-1.5"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">print</span>
                  <span>Imprimir Horário</span>
                </button>
                <button
                  onClick={() => setSelectedScheduleClass(null)}
                  className="px-4 py-2 rounded-xl bg-[#0b1f3a] text-white font-bold"
                  type="button"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ALUNOS DA TURMA */}
      {selectedStudentsClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-6 border border-slate-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Registo da Turma
                </span>
                <h3 className="font-headline text-lg font-bold text-[#0b1f3a]">
                  Alunos Matriculados — {selectedStudentsClass.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedStudentsClass(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="py-3">
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="text-slate-600 font-medium">
                  Total de {selectedStudentsClass.studentCount || 28} alunos alocados nesta turma
                </span>
                <button
                  onClick={() => {
                    setSelectedStudentsClass(null);
                    onNavigateToStudents(selectedStudentsClass.id);
                  }}
                  className="text-[#0b1f3a] font-bold hover:underline flex items-center gap-1"
                >
                  <span>Abrir no Módulo Alunos</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {(db.students || []).slice(0, 10).map((stu, i) => (
                  <div
                    key={stu.id}
                    className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-100 flex items-center justify-between text-xs transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#0b1f3a] text-white flex items-center justify-center font-bold text-xs">
                        {String(i + 1).padStart(2, '0')}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">{stu.name}</span>
                        <span className="text-slate-500 text-[11px] font-mono">Processo nº {stu.procNumber}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-semibold text-[11px]">
                        {stu.attendanceRate}% Assiduidade
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <button
                onClick={() => {
                  const id = selectedStudentsClass.id;
                  setSelectedStudentsClass(null);
                  onNavigateToAttendance(id);
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center gap-1.5"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">event_available</span>
                <span>Fazer Chamada / Assiduidade</span>
              </button>
              <button
                onClick={() => setSelectedStudentsClass(null)}
                className="px-4 py-2 rounded-xl bg-[#0b1f3a] text-white font-bold"
                type="button"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
