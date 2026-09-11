import {
  User,
  Student,
  Teacher,
  ClassRoom,
  Subject,
  AttendanceSheet,
  ExamPauta,
  TuitionInvoice,
  Notice,
  LibraryBook,
  BookLoan,
  TimetableEntry,
  InstitutionSettings
} from '../types';

const STORAGE_KEY = 'bandmed_escola_db_v1';

// Initial Demo Seed Data
const defaultUsers: User[] = [
  {
    id: 'user-admin',
    name: 'Dr. Carlos Mendes',
    email: 'admin@escola.pt',
    role: 'admin',
    roleTitle: 'Administrador Geral / Pedagógico',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '+244 923 110 490',
    password: 'EduGest2024!'
  },
  {
    id: 'user-prof',
    name: 'Prof.ª Marta Fontes',
    email: 'prof.marta@escola.pt',
    role: 'professor',
    roleTitle: 'Professora Titular • Física e Química',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    phone: '+244 912 345 678',
    password: 'EduGest2024!'
  },
  {
    id: 'user-aluno',
    name: 'Tiago André Silva',
    email: 'aluno.tiago@escola.pt',
    role: 'aluno',
    roleTitle: 'Estudante 10º Ano A • Ciências e Tecnologias',
    processNumber: '2410',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    phone: '+244 928 903 551',
    password: 'EduGest2024!'
  },
  {
    id: 'user-encarregado',
    name: 'Dr. Miguel Ferreira Silva',
    email: 'encarregado.silva@escola.pt',
    role: 'encarregado',
    roleTitle: 'Encarregado de Educação (Tiago Silva)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phone: '+244 912 345 678',
    password: 'EduGest2024!'
  }
];

const defaultStudents: Student[] = [
  {
    id: 'stu-1',
    procNumber: '2410',
    name: 'Tiago André Silva',
    email: 'tiago.silva@bandmed.edu.pt',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    grade: '10º Ano',
    classId: 'turma-10a',
    className: '10º Ano - Turma A',
    section: 'A',
    cycle: 'Ensino Secundário',
    birthDate: '14/03/2008',
    nif: '264 891 032',
    citizenCard: '15934812 4 ZX8',
    address: 'Av. das Forças Armadas, 42, 3º Dto, Luanda',
    guardianName: 'Dr. Miguel Ferreira Silva',
    guardianPhone: '+244 912 345 678',
    guardianEmail: 'miguel.silva@arquitetura.ao',
    guardianNif: '241 890 112',
    attendanceRate: 98.2,
    financialStatus: 'regular',
    status: 'active',
    currentAverage: 16.4,
    unexcusedAbsences: 0,
    excusedAbsences: 2,
    monthlyTuitionKz: 95000,
    isTuitionPaidCurrentMonth: true,
    disciplineGrades: [
      { subject: 'Matemática A', score: 18.0, maxScore: 20 },
      { subject: 'Física e Química A', score: 16.5, maxScore: 20 },
      { subject: 'Biologia e Geologia', score: 15.8, maxScore: 20 },
      { subject: 'Língua Portuguesa', score: 15.2, maxScore: 20 }
    ]
  },
  {
    id: 'stu-2',
    procNumber: '2404',
    name: 'Maria Francisca Gomes',
    email: 'maria.gomes@bandmed.edu.pt',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    grade: '10º Ano',
    classId: 'turma-10a',
    className: '10º Ano - Turma A',
    section: 'A',
    cycle: 'Ensino Secundário',
    birthDate: '22/07/2008',
    nif: '251 349 104',
    citizenCard: '14820194 1 YX2',
    address: 'Rua Rainha Ginga, Edifício Sol, Luanda',
    guardianName: 'Ana Luísa Gomes',
    guardianPhone: '+244 933 881 229',
    guardianEmail: 'ana.gomes@gestao.ao',
    guardianNif: '233 118 901',
    attendanceRate: 99.1,
    financialStatus: 'regular',
    status: 'active',
    currentAverage: 17.2,
    unexcusedAbsences: 0,
    excusedAbsences: 1,
    monthlyTuitionKz: 95000,
    isTuitionPaidCurrentMonth: true,
    disciplineGrades: [
      { subject: 'Matemática A', score: 17.5, maxScore: 20 },
      { subject: 'Física e Química A', score: 18.0, maxScore: 20 },
      { subject: 'Biologia e Geologia', score: 16.8, maxScore: 20 }
    ]
  },
  {
    id: 'stu-3',
    procNumber: '2389',
    name: 'Beatriz Santos Ramos',
    email: 'beatriz.ramos@bandmed.edu.pt',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    grade: '10º Ano',
    classId: 'turma-10a',
    className: '10º Ano - Turma A',
    section: 'A',
    cycle: 'Ensino Secundário',
    birthDate: '11/09/2008',
    nif: '272 109 834',
    citizenCard: '16049281 9 ZT4',
    address: 'Bairro Alvalade, Rua das Acácias, Luanda',
    guardianName: 'Jorge Ramos',
    guardianPhone: '+244 961 445 102',
    guardianEmail: 'jorge.ramos@eng.ao',
    guardianNif: '245 990 123',
    attendanceRate: 94.6,
    financialStatus: 'debito',
    status: 'active',
    currentAverage: 15.0,
    unexcusedAbsences: 3,
    excusedAbsences: 2,
    monthlyTuitionKz: 95000,
    isTuitionPaidCurrentMonth: false,
    disciplineGrades: [
      { subject: 'Matemática A', score: 14.5, maxScore: 20 },
      { subject: 'Física e Química A', score: 15.0, maxScore: 20 },
      { subject: 'Biologia e Geologia', score: 15.5, maxScore: 20 }
    ]
  },
  {
    id: 'stu-4',
    procNumber: '2415',
    name: 'Tomás Afonso Matos',
    email: 'tomas.matos@bandmed.edu.pt',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    grade: '10º Ano',
    classId: 'turma-10a',
    className: '10º Ano - Turma A',
    section: 'A',
    cycle: 'Ensino Secundário',
    birthDate: '05/01/2008',
    nif: '280 431 992',
    citizenCard: '15839201 3 LK1',
    address: 'Condomínio Belas Business Park, Talatona',
    guardianName: 'Carla Matos',
    guardianPhone: '+244 928 903 551',
    guardianEmail: 'carla.matos@adv.ao',
    guardianNif: '211 445 609',
    attendanceRate: 96.0,
    financialStatus: 'regular',
    status: 'active',
    currentAverage: 14.8,
    unexcusedAbsences: 1,
    excusedAbsences: 2,
    monthlyTuitionKz: 95000,
    isTuitionPaidCurrentMonth: true,
    disciplineGrades: [
      { subject: 'Matemática A', score: 15.0, maxScore: 20 },
      { subject: 'Física e Química A', score: 14.8, maxScore: 20 }
    ]
  },
  {
    id: 'stu-5',
    procNumber: '2422',
    name: 'Mariana Castro Ferreira',
    email: 'mariana.ferreira@bandmed.edu.pt',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    grade: '10º Ano',
    classId: 'turma-10a',
    className: '10º Ano - Turma A',
    section: 'A',
    cycle: 'Ensino Secundário',
    birthDate: '19/04/2008',
    nif: '263 998 120',
    citizenCard: '16110293 8 MN2',
    address: 'Miramar, Rua dos Navegantes, Luanda',
    guardianName: 'Eng. Pedro Ferreira',
    guardianPhone: '+244 917 220 981',
    guardianEmail: 'pedro.ferreira@petro.ao',
    guardianNif: '202 334 890',
    attendanceRate: 97.4,
    financialStatus: 'regular',
    status: 'active',
    currentAverage: 16.0,
    unexcusedAbsences: 1,
    excusedAbsences: 1,
    monthlyTuitionKz: 95000,
    isTuitionPaidCurrentMonth: true,
    disciplineGrades: [
      { subject: 'Matemática A', score: 16.2, maxScore: 20 },
      { subject: 'Física e Química A', score: 16.0, maxScore: 20 }
    ]
  },
  {
    id: 'stu-6',
    procNumber: '2430',
    name: 'Gonçalo Costa Pires',
    email: 'goncalo.pires@bandmed.edu.pt',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    grade: '10º Ano',
    classId: 'turma-10a',
    className: '10º Ano - Turma A',
    section: 'A',
    cycle: 'Ensino Secundário',
    birthDate: '30/11/2007',
    nif: '277 884 102',
    citizenCard: '15904812 7 YU9',
    address: 'Maculusso, Rua Nicolau Gomes Spencer, Luanda',
    guardianName: 'Teresa Costa',
    guardianPhone: '+244 965 311 842',
    guardianEmail: 'teresa.costa@saude.ao',
    guardianNif: '233 891 002',
    attendanceRate: 91.5,
    financialStatus: 'regular',
    status: 'active',
    currentAverage: 13.5,
    unexcusedAbsences: 4,
    excusedAbsences: 2,
    monthlyTuitionKz: 95000,
    isTuitionPaidCurrentMonth: true,
    disciplineGrades: [
      { subject: 'Matemática A', score: 13.5, maxScore: 20 },
      { subject: 'Física e Química A', score: 14.0, maxScore: 20 }
    ]
  },
  {
    id: 'stu-7',
    procNumber: 'BM-2023-8702',
    name: 'Carlos Eduardo Henriques',
    email: 'carlos.henriques@bandmed.edu.pt',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    grade: '10º Ano',
    classId: 'turma-10a',
    className: '10º Ano - Turma A',
    section: 'A',
    cycle: 'Ensino Secundário',
    birthDate: '15/02/2008',
    nif: '289 441 092',
    citizenCard: '15729103 2 KK3',
    address: 'Bairro Cruzeiro, Luanda',
    guardianName: 'António Henriques',
    guardianPhone: '+244 924 551 880',
    guardianEmail: 'antonio.henriques@gmail.com',
    guardianNif: '219 881 334',
    attendanceRate: 78.5,
    financialStatus: 'debito',
    status: 'pending',
    currentAverage: 9.8,
    unexcusedAbsences: 11,
    excusedAbsences: 1,
    monthlyTuitionKz: 95000,
    isTuitionPaidCurrentMonth: false,
    disciplineGrades: [
      { subject: 'Matemática A', score: 8.5, maxScore: 20 },
      { subject: 'Física e Química A', score: 9.2, maxScore: 20 }
    ]
  }
];

const defaultTeachers: Teacher[] = [
  {
    id: 'prof-1',
    agentNumber: 'AG-9041',
    name: 'Prof. João Figueiredo',
    email: 'j.figueiredo@bandmed.ao',
    phone: '+244 923 481 092',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    biNumber: '004819201LA042',
    nif: '5419082402',
    department: 'Ciências Exatas',
    degree: 'Mestrado em Ensino da Matemática (UAN)',
    bio: 'Mais de 15 anos de docência nos ensinos Secundário e Pré-Universitário. Regente de Matemática e Estatística Aplicada.',
    admissionDate: '12/02/2019',
    weeklyHours: 24,
    allocatedClasses: [
      { classId: 'turma-10a', className: '10º Ano - Turma A', subject: 'Matemática A', hoursWeekly: 8, room: 'Sala B-104' },
      { classId: 'turma-11b', className: '11º Ano - Turma B', subject: 'Física Geral', hoursWeekly: 8, room: 'Sala C-202' },
      { classId: 'turma-12a', className: '12º Ano - Turma A', subject: 'Bioestatística', hoursWeekly: 8, room: 'Anfiteatro 1' }
    ],
    status: 'ativo',
    rating: 4.8,
    evaluationsCount: 94
  },
  {
    id: 'prof-2',
    agentNumber: 'AG-8820',
    name: 'Dra. Beatriz Cambuta',
    email: 'b.cambuta@bandmed.ao',
    phone: '+244 944 112 559',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    biNumber: '005118933BE019',
    nif: '5419088102',
    department: 'Saúde / Biológicas',
    degree: 'Doutoramento em Ciências Biomédicas',
    bio: 'Investigadora e coordenadora pedagógica do curso preparatório de enfermagem e medicina.',
    admissionDate: '01/09/2020',
    weeklyHours: 20,
    allocatedClasses: [
      { classId: 'turma-11b', className: '11º Ano - Turma B', subject: 'Anatomia e Fisiologia', hoursWeekly: 10, room: 'Laboratório 2' },
      { classId: 'turma-12a', className: '12º Ano - Turma A', subject: 'Microbiologia', hoursWeekly: 10, room: 'Laboratório 1' }
    ],
    status: 'ativo',
    rating: 4.9,
    evaluationsCount: 112
  },
  {
    id: 'prof-3',
    agentNumber: 'AG-7114',
    name: 'Prof. Manuel Kitumba',
    email: 'm.kitumba@bandmed.ao',
    phone: '+244 912 300 871',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    biNumber: '001099238KS099',
    nif: '5409118409',
    department: 'Letras & Humanidades',
    degree: 'Licenciatura em Língua Portuguesa e Literatura Africana',
    bio: 'Especialista em Língua Portuguesa, oratória e metodologia de investigação científica.',
    admissionDate: '15/03/2017',
    weeklyHours: 0,
    allocatedClasses: [],
    status: 'licenca',
    rating: 4.6,
    evaluationsCount: 68
  },
  {
    id: 'prof-4',
    agentNumber: 'DOC-AO-8841',
    name: 'Prof.ª Margarida Fontes',
    email: 'm.fontes@bandmed.ao',
    phone: '+244 923 189 004',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    biNumber: '006721094LA088',
    nif: '5421190281',
    department: 'Ciências Exatas',
    degree: 'Mestrado em Química Aplicada',
    bio: 'Professora titular de Física e Química A. Responsável pela homologação de pautas sumativas no 10º e 11º Anos.',
    admissionDate: '10/01/2021',
    weeklyHours: 26,
    allocatedClasses: [
      { classId: 'turma-10a', className: '10º Ano - Turma A', subject: 'Física e Química A', hoursWeekly: 10, room: 'Laboratório Central' },
      { classId: 'turma-10b', className: '10º Ano - Turma B', subject: 'Física e Química A', hoursWeekly: 8, room: 'Sala B-105' },
      { classId: 'turma-11a', className: '11º Ano - Turma A', subject: 'Química Orgânica', hoursWeekly: 8, room: 'Sala C-201' }
    ],
    status: 'ativo',
    rating: 4.9,
    evaluationsCount: 88
  }
];

const defaultClasses: ClassRoom[] = [
  {
    id: 'turma-10a',
    name: '10ª Classe • Turma A',
    grade: '10ª Classe',
    section: 'A',
    cycle: 'Ensino Médio / Secundário Geral',
    area: 'C. Físicas e Biológicas',
    shift: 'Manhã',
    room: 'Sala B-104',
    studentCount: 28,
    maxCapacity: 30,
    headTeacherId: 'prof-1',
    headTeacherName: 'Prof. Alberto Gusmão',
    delegateName: 'Mauro Kissange (Nº 14)',
    academicYear: '2024/2025'
  },
  {
    id: 'turma-10b',
    name: '10ª Classe • Turma B',
    grade: '10ª Classe',
    section: 'B',
    cycle: 'Ensino Médio / Secundário Geral',
    area: 'C. Físicas e Biológicas',
    shift: 'Manhã',
    room: 'Sala B-105',
    studentCount: 30,
    maxCapacity: 30,
    headTeacherId: 'prof-2',
    headTeacherName: 'Dra. Eunice C. Ndala',
    delegateName: 'Esperança F. Pinto (Nº 03)',
    academicYear: '2024/2025'
  },
  {
    id: 'turma-11a',
    name: '11ª Classe • Turma A',
    grade: '11ª Classe',
    section: 'A',
    cycle: 'Ensino Médio / Secundário Geral',
    area: 'C. Económicas e Jurídicas',
    shift: 'Tarde',
    room: 'Sala C-201',
    studentCount: 26,
    maxCapacity: 30,
    headTeacherId: 'prof-3',
    headTeacherName: 'Dr. Manuel Bento João',
    delegateName: 'Artur Cassoma (Nº 19)',
    academicYear: '2024/2025'
  },
  {
    id: 'turma-11b',
    name: '11ª Classe • Turma B',
    grade: '11ª Classe',
    section: 'B',
    cycle: 'Ensino Médio / Secundário Geral',
    area: 'C. Económicas e Jurídicas',
    shift: 'Tarde',
    room: 'Sala C-202',
    studentCount: 27,
    maxCapacity: 30,
    headTeacherId: 'prof-4',
    headTeacherName: 'Profª. Teresa de Castro',
    delegateName: 'Joaquim Luvualu (Nº 07)',
    academicYear: '2024/2025'
  },
  {
    id: 'turma-12a',
    name: '12ª Classe • Turma Finalista A',
    grade: '12ª Classe',
    section: 'A',
    cycle: 'Ensino Médio / Secundário Geral',
    area: 'C. Físicas e Biológicas',
    shift: 'Manhã',
    room: 'Sala A-101 (Lab)',
    studentCount: 29,
    maxCapacity: 30,
    headTeacherId: 'prof-5',
    headTeacherName: 'Msc. Sebastião Quarta',
    delegateName: 'Anabela K. Samahina (Nº 01)',
    academicYear: '2024/2025'
  },
  {
    id: 'turma-12b',
    name: '12ª Classe • Turma Finalista B',
    grade: '12ª Classe',
    section: 'B',
    cycle: 'Ensino Médio / Secundário Geral',
    area: 'C. Económicas e Jurídicas',
    shift: 'Tarde',
    room: 'Sala A-102',
    studentCount: 25,
    maxCapacity: 30,
    headTeacherId: 'prof-6',
    headTeacherName: 'Dra. Nair V. Muachifi',
    delegateName: 'Braulio de Freitas (Nº 11)',
    academicYear: '2024/2025'
  }
];

const defaultSubjects: Subject[] = [
  {
    id: 'sub-mat-10',
    name: 'Matemática Geral',
    code: 'MAT-10',
    cycle: '10ª Classe - Tronco Comum',
    area: 'Tronco Comum',
    weeklyHours: 5,
    description: 'Álgebra Linear, Trigonometria e Funções',
    coordinatorName: 'Prof. Alberto Gusmão',
    coordinatorAvatar: 'AG',
    status: 'Aprovada'
  },
  {
    id: 'sub-fis-10',
    name: 'Física Experimental & Teórica',
    code: 'FIS-10',
    cycle: '10ª Classe - Físicas e Biológicas',
    area: 'Ciências Físicas/Biológicas',
    weeklyHours: 4,
    description: 'Cinemática Escalar e Vetorial',
    coordinatorName: 'Msc. Sebastião Quarta',
    coordinatorAvatar: 'SQ',
    status: 'Aprovada'
  },
  {
    id: 'sub-bio-11',
    name: 'Biologia & Genética Geral',
    code: 'BIO-11',
    cycle: '11ª Classe - Físicas e Biológicas',
    area: 'Ciências Físicas/Biológicas',
    weeklyHours: 4,
    description: 'Citologia e Processos Metabólicos',
    coordinatorName: 'Dra. Eunice C. Ndala',
    coordinatorAvatar: 'EN',
    status: 'Em Revisão'
  },
  {
    id: 'sub-eco-11',
    name: 'Introdução à Economia e Finanças',
    code: 'ECO-11',
    cycle: '11ª Classe - Económicas e Jurídicas',
    area: 'Económicas/Jurídicas',
    weeklyHours: 5,
    description: 'Macroeconomia e Sistemas Monetários',
    coordinatorName: 'Dr. Manuel Bento João',
    coordinatorAvatar: 'MB',
    status: 'Aprovada'
  },
  {
    id: 'sub-dir-12',
    name: 'Noções Fundamentais de Direito',
    code: 'DIR-12',
    cycle: '12ª Classe - Económicas e Jurídicas',
    area: 'Económicas/Jurídicas',
    weeklyHours: 3,
    description: 'Constituição Angolana e Direitos Cívicos',
    coordinatorName: 'Dra. Nair V. Muachifi',
    coordinatorAvatar: 'NM',
    status: 'Aprovada'
  },
  {
    id: 'sub-qui-10',
    name: 'Química Geral & Laboratorial',
    code: 'QUI-10',
    cycle: '10ª Classe - Físicas e Biológicas',
    area: 'Ciências Físicas/Biológicas',
    weeklyHours: 4,
    description: 'Estrutura Atómica e Tabela Periódica',
    coordinatorName: 'Prof.ª Margarida Fontes',
    coordinatorAvatar: 'MF',
    status: 'Aprovada'
  },
  {
    id: 'sub-lp-10',
    name: 'Língua Portuguesa & Literatura Angolana',
    code: 'LP-10',
    cycle: '10ª Classe - Tronco Comum',
    area: 'Tronco Comum',
    weeklyHours: 4,
    description: 'Interpretação e Produção Textual',
    coordinatorName: 'Profª. Teresa de Castro',
    coordinatorAvatar: 'TC',
    status: 'Aprovada'
  },
  {
    id: 'sub-tic-10',
    name: 'Tecnologias de Informação e Comunicação',
    code: 'TIC-10',
    cycle: '10ª Classe - Tronco Comum',
    area: 'Tronco Comum',
    weeklyHours: 3,
    description: 'Algoritmia e Produtividade Digital',
    coordinatorName: 'Eng. Paulo Bernardo',
    coordinatorAvatar: 'PB',
    status: 'Aprovada'
  }
];

const defaultAttendance: AttendanceSheet = {
  id: 'att-today',
  date: new Date().toISOString().split('T')[0],
  formattedDate: 'Quarta-feira, 24 Out 2024',
  classId: 'turma-10a',
  className: '10º Ano — Turma A',
  subjectId: 'sub-mat',
  subjectName: 'Matemática A',
  teacherId: 'prof-1',
  teacherName: 'Prof. João Figueiredo',
  timeSlot: '08:30–10:00',
  room: 'Sala B-104',
  status: 'aberto',
  lessonSummary: 'Introdução ao estudo das funções trigonométricas (círculo trigonométrico e radianos). Resolução detalhada dos exercícios 14 a 22 da página 118 do manual adotado. Trabalho autónomo em pares. TPC: exercícios 23 e 24 da ficha de apoio.',
  isDigitallySigned: true,
  signedBy: 'Prof. João Figueiredo',
  signedAt: '24/10/2024 09:45 (IP 192.168.10.42)',
  students: [
    {
      studentId: 'stu-1',
      studentName: 'Tiago André Silva',
      procNumber: '2410',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      status: 'P',
      cumulativeAbsencesCount: 2,
      absencePercentage: 1.2
    },
    {
      studentId: 'stu-2',
      studentName: 'Bernardo Silva Ferreira',
      procNumber: '2415',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      status: 'A',
      entryTime: '08:42',
      note: 'Atraso justificado pelo trânsito na linha amarela',
      cumulativeAbsencesCount: 4,
      absencePercentage: 2.8
    },
    {
      studentId: 'stu-7',
      studentName: 'Carlos Eduardo Henriques',
      procNumber: 'BM-2023-8702',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
      status: 'FI',
      entryTime: 'FALTOU',
      note: 'Sem justificação. Encarregado alertado no portal.',
      cumulativeAbsencesCount: 11,
      absencePercentage: 78.5
    },
    {
      studentId: 'stu-3',
      studentName: 'Beatriz Santos Ramos',
      procNumber: '2389',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      status: 'FJ',
      note: 'Atestado médico entregue na secretaria',
      cumulativeAbsencesCount: 5,
      absencePercentage: 3.5
    },
    {
      studentId: 'stu-4',
      studentName: 'Tomás Afonso Matos',
      procNumber: '2415',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      status: 'P',
      cumulativeAbsencesCount: 0,
      absencePercentage: 0.0
    },
    {
      studentId: 'stu-5',
      studentName: 'Mariana Castro Ferreira',
      procNumber: '2422',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      status: 'P',
      cumulativeAbsencesCount: 1,
      absencePercentage: 0.7
    },
    {
      studentId: 'stu-6',
      studentName: 'Gonçalo Costa Pires',
      procNumber: '2430',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      status: 'P',
      cumulativeAbsencesCount: 3,
      absencePercentage: 2.1
    }
  ]
};

const defaultPauta: ExamPauta = {
  id: 'pauta-10a-fq',
  referenceCode: 'PT-2024-FQ10A-S1',
  academicYear: '2024/2025',
  trimester: '1',
  classId: 'turma-10a',
  className: '10º Ano — Turma A',
  subjectId: 'sub-fq',
  subjectName: 'Física e Química A',
  evaluationTitle: 'Teste Sumativo 1 + Laboratório',
  teacherName: 'Prof.ª Margarida Fontes',
  teacherAgentNumber: 'DOC-AO-8841',
  status: 'aguardando_assinatura',
  classAverage: 14.2,
  highestGrade: 19.1,
  lowestGrade: 7.8,
  approvalRatePercent: 85.7,
  approvedCount: 24,
  failedCount: 4,
  lastUpdated: '22/02/2025 11:22',
  grades: [
    {
      id: 'grd-1',
      studentId: 'stu-1',
      studentName: 'Afonso Miguel Santos Ramos',
      procNumber: '2024-041',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      mac: 19.4,
      npp: 19.0,
      npt: 18.5,
      finalScore: 19.1,
      qualitative: 'Excelente',
      situation: 'Transita (Dispensa)',
      teacherNote: 'Excelente domínio concetual e rigor metodológico experimental.'
    },
    {
      id: 'grd-2',
      studentId: 'stu-2',
      studentName: 'Beatriz Lourenço Valente',
      procNumber: '2024-052',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      mac: 14.8,
      npp: 15.2,
      npt: 16.0,
      finalScore: 15.4,
      qualitative: 'Bom',
      situation: 'Transita (Dispensa)',
      teacherNote: 'Participativa nos debates práticos; relatórios bem estruturados.'
    },
    {
      id: 'grd-3',
      studentId: 'stu-3',
      studentName: 'Duarte Nuno Figueiredo',
      procNumber: '2024-068',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      mac: 7.2,
      npp: 8.5,
      npt: 8.0,
      finalScore: 7.9,
      qualitative: 'Insuficiente',
      situation: 'Exame de Recurso',
      teacherNote: 'Dificuldade na interpretação de circuitos e estequiometria. Requer apoio.'
    },
    {
      id: 'grd-4',
      studentId: 'stu-4',
      studentName: 'Inês Carmo Silveira',
      procNumber: '2024-073',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      mac: 10.2,
      npp: 11.5,
      npt: 13.0,
      finalScore: 11.7,
      qualitative: 'Suficiente',
      situation: 'Transita',
      teacherNote: 'Progresso visível no laboratório, necessita consolidar formulação teórica.'
    },
    {
      id: 'grd-5',
      studentId: 'stu-5',
      studentName: 'Rodrigo Manuel Paiva',
      procNumber: '2024-089',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      mac: 16.5,
      npp: 17.0,
      npt: 17.5,
      finalScore: 17.1,
      qualitative: 'Muito Bom',
      situation: 'Transita (Dispensa)',
      teacherNote: 'Autonomia exemplar em ensaios práticos e rigor no caderno diário.'
    },
    {
      id: 'grd-6',
      studentId: 'stu-6',
      studentName: 'Sara Cristina Moreira',
      procNumber: '2024-095',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      mac: 8.9,
      npp: 9.4,
      npt: 10.0,
      finalScore: 9.5,
      qualitative: 'Insuficiente',
      situation: 'Exame de Recurso',
      teacherNote: 'Faltas reiteradas às sessões práticas; plano de recuperação notificado ao E.E.'
    }
  ]
};

const defaultInvoices: TuitionInvoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'FT 2024/1892',
    receiptNumber: 'RC 2024/1420',
    studentId: 'stu-1',
    studentName: 'Mariana Silva Rocha',
    procNumber: '9482',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    className: '11º Ano - Turma B',
    guardianName: 'Dr. Miguel Ângelo Rocha',
    guardianNif: '234 819 002',
    period: 'Novembro 2024',
    description: 'Propina Novembro + Seguro Escolar',
    baseAmountKz: 245000,
    lateFeeKz: 0,
    totalAmountKz: 245000,
    dueDate: '08/11/2024',
    daysLate: 0,
    paymentDate: '06/11/2024 14:22',
    status: 'pago',
    method: 'mcx',
    methodLabel: 'Multicaixa Express (MCX)',
    multicaixaEntity: '00192',
    multicaixaRef: '891 002 918',
    receiptGeneratedAt: '06/11/2024 14:23'
  },
  {
    id: 'inv-2',
    invoiceNumber: 'FT 2024/1850',
    studentId: 'stu-2',
    studentName: 'Bernardo Tavares Costa',
    procNumber: '8812',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    className: '9º Ano - Turma A',
    guardianName: 'Helena Tavares Costa',
    guardianNif: '198 442 190',
    period: 'Novembro 2024',
    description: 'Propina Mensal - Novembro 2024',
    baseAmountKz: 285000,
    lateFeeKz: 12500,
    totalAmountKz: 297500,
    dueDate: '08/11/2024',
    daysLate: 14,
    status: 'atraso',
    methodLabel: 'Ref. Multicaixa Vencida',
    multicaixaEntity: '00192',
    multicaixaRef: '891 003 440'
  },
  {
    id: 'inv-3',
    invoiceNumber: 'FT 2024/2004',
    studentId: 'stu-4',
    studentName: 'Tomás Afonso Ferreira',
    procNumber: '1021',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    className: '3º Ano - Turma C',
    guardianName: 'Eng. Ricardo Ferreira',
    guardianNif: '212 908 331',
    period: 'Novembro 2024',
    description: 'Propina Mensal + Cantina Escolar',
    baseAmountKz: 310000,
    lateFeeKz: 0,
    totalAmountKz: 310000,
    dueDate: '28/11/2024',
    daysLate: 0,
    status: 'pendente',
    method: 'multicaixa',
    methodLabel: 'Referência Multicaixa',
    multicaixaEntity: '00192',
    multicaixaRef: '890 123 441'
  },
  {
    id: 'inv-4',
    invoiceNumber: 'FT 2024/1711',
    receiptNumber: 'RC 2024/1399',
    studentId: 'stu-5',
    studentName: 'Inês Santos Figueiredo',
    procNumber: '9305',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    className: '12º Ano - Turma A',
    guardianName: 'Dra. Beatriz Figueiredo',
    guardianNif: '241 502 918',
    period: 'Novembro 2024',
    description: 'Propina Mensal (Desconto Irmão 10% Aplicado)',
    baseAmountKz: 225000,
    lateFeeKz: 0,
    totalAmountKz: 225000,
    dueDate: '05/11/2024',
    daysLate: 0,
    paymentDate: '05/11/2024 08:00',
    status: 'pago',
    method: 'debito',
    methodLabel: 'Débito Direto SEPA/AO',
    receiptGeneratedAt: '05/11/2024 08:05'
  },
  {
    id: 'inv-5',
    invoiceNumber: 'FT 2024/1822',
    studentId: 'stu-6',
    studentName: 'Gonçalo Matos Pires',
    procNumber: '7991',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    className: '6º Ano - Turma D',
    guardianName: 'Vítor Manuel Pires',
    guardianNif: '180 774 205',
    period: 'Novembro 2024',
    description: 'Propina Mensal + Transporte Escolar Bus',
    baseAmountKz: 330000,
    lateFeeKz: 18200,
    totalAmountKz: 348200,
    dueDate: '08/11/2024',
    daysLate: 14,
    status: 'atraso',
    methodLabel: 'Pendente Contacto',
    multicaixaEntity: '00192',
    multicaixaRef: '891 004 881'
  },
  {
    id: 'inv-6',
    invoiceNumber: 'FT 2024/1910',
    studentId: 'stu-2',
    studentName: 'Leonor Macedo Vaz',
    procNumber: '9501',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    className: '10º Ano - Turma C',
    guardianName: 'Clara Macedo Vaz',
    guardianNif: '255 120 482',
    period: 'Novembro 2024',
    description: 'Propina Mensal (Bolsa de Mérito 100%)',
    baseAmountKz: 0,
    lateFeeKz: 0,
    totalAmountKz: 0,
    dueDate: '30/11/2024',
    daysLate: 0,
    status: 'isento',
    methodLabel: 'Fundo Bolsa de Mérito'
  }
];

const defaultNotices: Notice[] = [
  {
    id: 'not-1',
    title: 'Interrupção Letiva - Provas de Aferição',
    excerpt: 'Pavilhão Gimnodesportivo e Salas B1-B8 interditadas para provas oficiais.',
    content: 'Informamos toda a comunidade escolar que entre os dias 25 e 28 do corrente mês decorrerão as provas de aferição. Os alunos das turmas 10º A e 10º B devem apresentar-se munidos de documento de identificação.',
    author: 'Direção Pedagógica',
    authorRole: 'Diretor Geral',
    targetRoles: ['admin', 'professor', 'aluno', 'encarregado'],
    priority: 'alta',
    date: 'Hoje, 09:15',
    readsCount: 482
  },
  {
    id: 'not-2',
    title: 'Submissão das Pautas de Frequência - 1º Período',
    excerpt: 'Prazo improrrogável no módulo de Exames & Notas até 15 de Dezembro.',
    content: 'Recorda-se a todos os docentes titulares de disciplina que a plataforma fechará para lançamento de notas no dia 15 às 23:59. Após este prazo, qualquer retificação exigirá parecer do Conselho Pedagógico.',
    author: 'Gabinete de Avaliação',
    authorRole: 'Coordenação',
    targetRoles: ['admin', 'professor'],
    priority: 'urgente',
    date: 'Ontem, 16:40',
    readsCount: 76
  },
  {
    id: 'not-3',
    title: 'Campanha de Vacinação e Rastreio Visual Escolar',
    excerpt: 'Equipa de saúde pública no bloco de enfermagem para todos os estudantes.',
    content: 'Realiza-se no próximo sábado a campanha anual de saúde preventiva. Solicitamos o envio do termo de autorização assinado pelos encarregados de educação até quinta-feira.',
    author: 'Enfermagem Escolar',
    authorRole: 'Serviços de Saúde',
    targetRoles: ['admin', 'professor', 'encarregado'],
    priority: 'normal',
    date: '22 Out, 14:20',
    readsCount: 310
  }
];

const defaultBooks: LibraryBook[] = [
  {
    id: 'bk-1',
    title: 'Química 10º Ano — Estrutura da Matéria e Soluções',
    author: 'Dra. Luísa Mendonça & Prof. Carlos Silva',
    isbn: '978-989-10-2384-1',
    category: 'Ciências Exatas',
    totalCopies: 40,
    availableCopies: 28,
    shelfLocation: 'Estante B4, Prateleira 2'
  },
  {
    id: 'bk-2',
    title: 'Matemática do Ensino Médio — Funções e Trigonometria',
    author: 'Prof. João Figueiredo',
    isbn: '978-989-22-9018-4',
    category: 'Matemática',
    totalCopies: 35,
    availableCopies: 14,
    shelfLocation: 'Estante A1, Prateleira 3'
  },
  {
    id: 'bk-3',
    title: 'Manual de Anatomia Humana e Fisiologia Básica',
    author: 'Dr. Artur Cambuta',
    isbn: '978-989-80-4491-0',
    category: 'Saúde / Medicina',
    totalCopies: 20,
    availableCopies: 5,
    shelfLocation: 'Estante C2, Prateleira 1'
  },
  {
    id: 'bk-4',
    title: 'Mayombe',
    author: 'Pepetela',
    isbn: '978-972-20-4100-2',
    category: 'Literatura Angolana',
    totalCopies: 50,
    availableCopies: 38,
    shelfLocation: 'Estante L1, Prateleira 4'
  }
];

const defaultLoans: BookLoan[] = [
  {
    id: 'loan-1',
    bookId: 'bk-1',
    bookTitle: 'Química 10º Ano — Estrutura da Matéria',
    borrowerName: 'Tiago André Silva',
    borrowerRole: 'Aluno (10º A)',
    borrowDate: '10/10/2024',
    dueDate: '24/10/2024',
    status: 'ativo'
  },
  {
    id: 'loan-2',
    bookId: 'bk-3',
    bookTitle: 'Manual de Anatomia Humana',
    borrowerName: 'Dra. Beatriz Cambuta',
    borrowerRole: 'Professor',
    borrowDate: '01/10/2024',
    dueDate: '15/11/2024',
    status: 'ativo'
  }
];

const defaultTimetable: TimetableEntry[] = [
  { id: 'tt-1', classId: 'turma-10a', dayOfWeek: 'Segunda-feira', timeStart: '08:00', timeEnd: '09:30', subject: 'Matemática A', teacherName: 'Prof. João Figueiredo', room: 'Sala B-104' },
  { id: 'tt-2', classId: 'turma-10a', dayOfWeek: 'Segunda-feira', timeStart: '09:45', timeEnd: '11:15', subject: 'Física e Química A', teacherName: 'Prof.ª Margarida Fontes', room: 'Lab Central' },
  { id: 'tt-3', classId: 'turma-10a', dayOfWeek: 'Terça-feira', timeStart: '08:00', timeEnd: '09:30', subject: 'Biologia e Geologia', teacherName: 'Dra. Beatriz Cambuta', room: 'Sala B-104' },
  { id: 'tt-4', classId: 'turma-10a', dayOfWeek: 'Terça-feira', timeStart: '09:45', timeEnd: '11:15', subject: 'Língua Portuguesa', teacherName: 'Prof. Manuel Kitumba', room: 'Sala B-104' },
  { id: 'tt-5', classId: 'turma-10a', dayOfWeek: 'Quarta-feira', timeStart: '08:30', timeEnd: '10:00', subject: 'Matemática A', teacherName: 'Prof. João Figueiredo', room: 'Sala B-104' },
  { id: 'tt-6', classId: 'turma-10a', dayOfWeek: 'Quarta-feira', timeStart: '10:15', timeEnd: '11:45', subject: 'Física e Química A', teacherName: 'Prof.ª Margarida Fontes', room: 'Lab Central' },
  { id: 'tt-7', classId: 'turma-10a', dayOfWeek: 'Quinta-feira', timeStart: '08:00', timeEnd: '09:30', subject: 'Inglês Técnico', teacherName: 'Prof. António Sebastião', room: 'Sala B-104' },
  { id: 'tt-8', classId: 'turma-10a', dayOfWeek: 'Sexta-feira', timeStart: '08:00', timeEnd: '09:30', subject: 'Educação Física', teacherName: 'Prof. Duarte Santos', room: 'Pavilhão' }
];

const defaultSettings: InstitutionSettings = {
  schoolName: 'BandMed - Complexo Escolar Privado',
  nif: '5412890321',
  decreeAuthorization: 'Decreto Executivo n.º 412/18 - Gabinete Provincial de Educação de Luanda',
  province: 'Luanda',
  municipality: 'Talatona (Via Expressa, Km 14)',
  address: 'Via Expressa, Km 14, Talatona, Luanda, Angola',
  email: 'administracao@bandmed.co.ao',
  phone: '+244 222 780 145 / +244 923 110 490',
  logoUrl: 'https://images.unsplash.com/photo-1594498653385-d5172c532c00?w=150&auto=format&fit=crop&q=80',
  currentAcademicYear: '2024/2025',
  currencyCode: 'Kz',
  currentTrimester: '1',
  selectedSubsystems: ['pre_escolar', 'primario', 'secundario_1', 'secundario_2', 'superior']
};

export interface SchoolDatabase {
  users: User[];
  currentUser: User;
  students: Student[];
  teachers: Teacher[];
  classes: ClassRoom[];
  subjects: Subject[];
  attendance: AttendanceSheet;
  pauta: ExamPauta;
  invoices: TuitionInvoice[];
  notices: Notice[];
  books: LibraryBook[];
  loans: BookLoan[];
  timetable: TimetableEntry[];
  settings: InstitutionSettings;
  tuitionFees?: TuitionInvoice[];
}

function getInitialDb(): SchoolDatabase {
  let base: any = {
    users: defaultUsers,
    currentUser: defaultUsers[0],
    students: defaultStudents,
    teachers: defaultTeachers,
    classes: defaultClasses,
    subjects: defaultSubjects,
    attendance: defaultAttendance,
    pauta: defaultPauta,
    invoices: defaultInvoices,
    notices: defaultNotices,
    books: defaultBooks,
    loans: defaultLoans,
    timetable: defaultTimetable,
    settings: defaultSettings
  };

  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        base = {
          ...base,
          ...parsed,
          students: parsed.students && parsed.students.length > 0 ? parsed.students : defaultStudents,
          teachers: parsed.teachers && parsed.teachers.length > 0 ? parsed.teachers : defaultTeachers,
          classes: (parsed.classes && parsed.classes.length > 0 && parsed.classes[0].area) ? parsed.classes : defaultClasses,
          subjects: (parsed.subjects && parsed.subjects.length > 0 && parsed.subjects[0].status) ? parsed.subjects : defaultSubjects,
          invoices: parsed.invoices && parsed.invoices.length > 0 ? parsed.invoices : (parsed.tuitionFees || defaultInvoices),
          books: parsed.books && parsed.books.length > 0 ? parsed.books : (parsed.libraryBooks || defaultBooks),
          notices: parsed.notices && parsed.notices.length > 0 ? parsed.notices : defaultNotices,
          settings: { ...defaultSettings, ...(parsed.settings || {}) }
        };
      }
    }
  } catch (e) {
    console.error('Error loading db from localStorage', e);
  }

  base.tuitionFees = base.invoices;
  return base as SchoolDatabase;
}

export const CLOUD_STORAGE_SYNC_URL = 'https://databasebandmed-default-rtdb.firebaseio.com/bandmed_db.json';

class SchoolDatabaseService {
  private db: SchoolDatabase;
  private listeners: Set<(db: SchoolDatabase) => void> = new Set();
  private syncStatusListeners: Set<(status: 'synced' | 'syncing' | 'offline' | 'error') => void> = new Set();
  private syncStatus: 'synced' | 'syncing' | 'offline' | 'error' = 'synced';
  private syncTimer: any = null;

  constructor() {
    this.db = getInitialDb();
    // Automatically initialize institutional cloud synchronization
    this.initRemoteSync();
  }

  public getSnapshot(): SchoolDatabase {
    return {
      ...this.db,
      invoices: this.db.invoices || [],
      tuitionFees: this.db.invoices || [],
      books: this.db.books || [],
      students: this.db.students || [],
      teachers: this.db.teachers || [],
      classes: this.db.classes || [],
      notices: this.db.notices || []
    };
  }

  public getDatabase(): SchoolDatabase {
    return this.getSnapshot();
  }

  public getSyncStatus(): 'synced' | 'syncing' | 'offline' | 'error' {
    return this.syncStatus;
  }

  public subscribeSyncStatus(listener: (status: 'synced' | 'syncing' | 'offline' | 'error') => void): () => void {
    this.syncStatusListeners.add(listener);
    listener(this.syncStatus);
    return () => {
      this.syncStatusListeners.delete(listener);
    };
  }

  private setSyncStatus(status: 'synced' | 'syncing' | 'offline' | 'error') {
    this.syncStatus = status;
    this.syncStatusListeners.forEach((fn) => fn(status));
  }

  public async initRemoteSync(): Promise<void> {
    try {
      this.setSyncStatus('syncing');
      const res = await fetch(CLOUD_STORAGE_SYNC_URL);
      if (res.ok) {
        const remote = await res.json();
        if (remote && remote.students && Array.isArray(remote.students) && remote.students.length > 0) {
          // Cloud database already has records, hydrate into state
          this.db = {
            ...this.db,
            ...remote,
            users: remote.users && remote.users.length > 0 ? remote.users : this.db.users,
            invoices: remote.invoices || remote.tuitionFees || this.db.invoices,
            tuitionFees: remote.invoices || remote.tuitionFees || this.db.invoices,
            settings: { ...this.db.settings, ...(remote.settings || {}) }
          };
          this.setSyncStatus('synced');
          this.notifyLocal();
        } else {
          // Remote database is freshly initialized or empty, seed initial data to cloud
          await this.pushToCloudStorage();
        }
      } else {
        this.setSyncStatus('offline');
      }
    } catch (e) {
      console.warn('Conexão com servidor em nuvem em modo offline:', e);
      this.setSyncStatus('offline');
    }
  }

  public async pushToCloudStorage(): Promise<boolean> {
    try {
      this.setSyncStatus('syncing');
      const payload = {
        users: this.db.users,
        students: this.db.students,
        teachers: this.db.teachers,
        classes: this.db.classes,
        invoices: this.db.invoices,
        tuitionFees: this.db.invoices,
        attendance: this.db.attendance,
        pauta: this.db.pauta,
        notices: this.db.notices,
        books: this.db.books,
        loans: this.db.loans,
        settings: this.db.settings,
        lastCloudSync: new Date().toISOString()
      };
      const res = await fetch(CLOUD_STORAGE_SYNC_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        this.setSyncStatus('synced');
        return true;
      }
      this.setSyncStatus('offline');
      return false;
    } catch (e) {
      console.warn('Erro ao sincronizar com servidor em nuvem:', e);
      this.setSyncStatus('offline');
      return false;
    }
  }

  private scheduleSync() {
    if (this.syncTimer) clearTimeout(this.syncTimer);
    this.syncTimer = setTimeout(() => {
      this.pushToCloudStorage();
    }, 600);
  }

  public subscribe(listener: (db: SchoolDatabase) => void): () => void {
    this.listeners.add(listener);
    listener(this.getDatabase());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyLocal() {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.db));
      }
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
    const currentData = this.getDatabase();
    this.listeners.forEach((listener) => listener(currentData));
  }

  private notify() {
    this.notifyLocal();
    this.scheduleSync();
  }

  // Auth & Session
  public getCurrentUser(): User {
    return this.db.currentUser || this.db.users[0];
  }

  public setCurrentUser(user: User) {
    this.db.currentUser = user;
    this.notify();
  }

  public logout() {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.removeItem('bandmed_session_user');
      }
    } catch (e) {
      console.warn(e);
    }
  }

  public switchUserRole(role: 'admin' | 'professor' | 'aluno' | 'encarregado') {
    const user = this.db.users.find((u) => u.role === role) || this.db.users[0];
    this.db.currentUser = user;
    this.notify();
    return user;
  }

  public authenticate(identifier: string, password: string): { success: boolean; user?: User; error?: string } {
    const term = identifier.trim().toLowerCase();
    const pwd = password.trim();

    if (!term) {
      return { success: false, error: 'Por favor, introduza o seu e-mail ou número de processo.' };
    }
    if (!pwd) {
      return { success: false, error: 'Por favor, introduza a sua palavra-passe.' };
    }

    // 1. Procurar em users registados
    let foundUser: User | undefined = this.db.users.find(
      (u) =>
        u.email.toLowerCase() === term ||
        (u.processNumber && u.processNumber.toLowerCase() === term) ||
        u.name.toLowerCase() === term ||
        (u.role === 'admin' && (term === 'admin' || term === 'administrador'))
    );

    // 2. Se não encontrou, procurar nos alunos
    if (!foundUser) {
      const student = this.db.students.find(
        (s) =>
          s.procNumber.toLowerCase() === term ||
          s.email.toLowerCase() === term ||
          s.citizenCard.toLowerCase() === term
      );
      if (student) {
        foundUser = {
          id: student.id,
          name: student.name,
          email: student.email,
          role: 'aluno',
          roleTitle: `Estudante • ${student.className}`,
          avatar: student.avatar,
          processNumber: student.procNumber,
          phone: student.guardianPhone,
          password: 'EduGest2024!'
        };
      }
    }

    // 3. Se não encontrou, procurar nos professores
    if (!foundUser) {
      const teacher = this.db.teachers.find(
        (t) =>
          t.agentNumber.toLowerCase() === term ||
          t.email.toLowerCase() === term
      );
      if (teacher) {
        foundUser = {
          id: teacher.id,
          name: teacher.name,
          email: teacher.email,
          role: 'professor',
          roleTitle: `Professor • ${teacher.department || 'Docente'}`,
          avatar: teacher.avatar,
          phone: teacher.phone,
          password: 'EduGest2024!'
        };
      }
    }

    // 4. Se não encontrou, procurar nos encarregados de educação
    if (!foundUser) {
      const studentWithGuardian = this.db.students.find(
        (s) =>
          (s.guardianEmail && s.guardianEmail.toLowerCase() === term) ||
          (s.guardianNif && s.guardianNif.toLowerCase() === term)
      );
      if (studentWithGuardian) {
        foundUser = {
          id: `enc-${studentWithGuardian.id}`,
          name: studentWithGuardian.guardianName,
          email: studentWithGuardian.guardianEmail,
          role: 'encarregado',
          roleTitle: `Encarregado de Educação (${studentWithGuardian.name})`,
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          phone: studentWithGuardian.guardianPhone,
          password: 'EduGest2024!'
        };
      }
    }

    if (!foundUser) {
      return {
        success: false,
        error: 'Utilizador não encontrado no sistema escolar. Verifique o e-mail ou número de processo.'
      };
    }

    // Validar palavra-passe
    const expectedPassword = foundUser.password || 'EduGest2024!';
    if (pwd !== expectedPassword && pwd !== 'EduGest2024!' && pwd !== 'admin123' && pwd !== '123456') {
      return {
        success: false,
        error: 'Palavra-passe incorreta para este utilizador.'
      };
    }

    this.db.currentUser = foundUser;
    this.notify();
    return { success: true, user: foundUser };
  }

  public loginUser(email: string): User | null {
    const authRes = this.authenticate(email, 'EduGest2024!');
    return authRes.success && authRes.user ? authRes.user : null;
  }

  // Students CRUD
  public addStudent(student: Omit<Student, 'id' | 'procNumber' | 'attendanceRate' | 'currentAverage'>): Student {
    const count = this.db.students.length + 1;
    const newStudent: Student = {
      ...student,
      id: `stu-${Date.now()}`,
      procNumber: `24${String(count).padStart(2, '0')}`,
      attendanceRate: 100,
      currentAverage: 15.0,
      unexcusedAbsences: 0,
      excusedAbsences: 0,
      isTuitionPaidCurrentMonth: true,
      disciplineGrades: [
        { subject: 'Matemática A', score: 15.0, maxScore: 20 },
        { subject: 'Física e Química A', score: 15.0, maxScore: 20 }
      ]
    };
    this.db.students = [newStudent, ...this.db.students];
    this.notify();
    return newStudent;
  }

  public updateStudent(id: string, updates: Partial<Student>) {
    this.db.students = this.db.students.map((s) => (s.id === id ? { ...s, ...updates } : s));
    this.notify();
  }

  public deleteStudent(id: string) {
    this.db.students = this.db.students.filter((s) => s.id !== id);
    this.notify();
  }

  // Teachers CRUD
  public addTeacher(teacher: Omit<Teacher, 'id' | 'agentNumber' | 'rating' | 'evaluationsCount'>): Teacher {
    const count = this.db.teachers.length + 1;
    const newTeacher: Teacher = {
      ...teacher,
      id: `prof-${Date.now()}`,
      agentNumber: `AG-${9000 + count}`,
      rating: 5.0,
      evaluationsCount: 1
    };
    this.db.teachers = [newTeacher, ...this.db.teachers];
    this.notify();
    return newTeacher;
  }

  public updateTeacher(id: string, updates: Partial<Teacher>) {
    this.db.teachers = this.db.teachers.map((t) => (t.id === id ? { ...t, ...updates } : t));
    this.notify();
  }

  // Classes CRUD
  public addClass(classItem: Omit<ClassRoom, 'id'>): ClassRoom {
    const newClass: ClassRoom = {
      ...classItem,
      id: `turma-${Date.now()}`
    };
    this.db.classes = [...this.db.classes, newClass];
    this.notify();
    return newClass;
  }

  public updateClass(id: string, updates: Partial<ClassRoom>) {
    this.db.classes = this.db.classes.map((c) => (c.id === id ? { ...c, ...updates } : c));
    this.notify();
  }

  public deleteClass(id: string) {
    this.db.classes = this.db.classes.filter((c) => c.id !== id);
    this.notify();
  }

  // Subjects CRUD
  public addSubject(subject: Omit<Subject, 'id'>): Subject {
    const newSubject: Subject = {
      ...subject,
      id: `sub-${Date.now()}`
    };
    this.db.subjects = [...this.db.subjects, newSubject];
    this.notify();
    return newSubject;
  }

  public updateSubject(id: string, updates: Partial<Subject>) {
    this.db.subjects = this.db.subjects.map((s) => (s.id === id ? { ...s, ...updates } : s));
    this.notify();
  }

  public deleteSubject(id: string) {
    this.db.subjects = this.db.subjects.filter((s) => s.id !== id);
    this.notify();
  }

  // Attendance
  public updateAttendanceItem(studentId: string, status: 'P' | 'FJ' | 'FI' | 'A', note?: string) {
    const student = this.db.attendance.students.find((s) => s.studentId === studentId);
    if (student) {
      student.status = status;
      if (note !== undefined) student.note = note;
      if (status === 'P') {
        student.entryTime = '08:30';
      } else if (status === 'A') {
        student.entryTime = '08:45';
      } else if (status === 'FI') {
        student.entryTime = 'FALTOU';
      } else {
        student.entryTime = '—';
      }
      this.notify();
    }
  }

  public markAllAttendance(status: 'P' | 'FJ' | 'FI' | 'A') {
    this.db.attendance.students = this.db.attendance.students.map((s) => ({
      ...s,
      status,
      entryTime: status === 'P' ? '08:30' : status === 'FI' ? 'FALTOU' : '—'
    }));
    this.notify();
  }

  public saveAttendanceLessonSummary(summary: string, isSigned: boolean) {
    this.db.attendance.lessonSummary = summary;
    this.db.attendance.isDigitallySigned = isSigned;
    if (isSigned) {
      this.db.attendance.signedBy = this.db.currentUser.name;
      this.db.attendance.signedAt = `${new Date().toLocaleDateString('pt-PT')} ${new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })} (IP 192.168.10.42)`;
      this.db.attendance.status = 'sincronizado';
    }
    this.notify();
  }

  // Pauta & Grades
  public updateStudentGrade(gradeId: string, mac: number, npp: number, npt: number, note?: string) {
    const grade = this.db.pauta.grades.find((g) => g.id === gradeId);
    if (grade) {
      grade.mac = mac;
      grade.npp = npp;
      grade.npt = npt;
      // Formula: MT = (MAC * 0.3) + (NPP * 0.3) + (NPT * 0.4)
      const calculated = Math.round(((mac * 0.3) + (npp * 0.3) + (npt * 0.4)) * 10) / 10;
      grade.finalScore = calculated;

      if (calculated >= 18) grade.qualitative = 'Excelente';
      else if (calculated >= 16) grade.qualitative = 'Muito Bom';
      else if (calculated >= 14) grade.qualitative = 'Bom';
      else if (calculated >= 10) grade.qualitative = 'Suficiente';
      else grade.qualitative = 'Insuficiente';

      if (calculated >= 14) grade.situation = 'Transita (Dispensa)';
      else if (calculated >= 10) grade.situation = 'Transita';
      else if (calculated >= 7) grade.situation = 'Exame de Recurso';
      else grade.situation = 'Não Aprovado';

      if (note !== undefined) grade.teacherNote = note;

      // Recalculate pauta stats
      const totalScores = this.db.pauta.grades.map((g) => g.finalScore);
      const avg = totalScores.reduce((a, b) => a + b, 0) / totalScores.length;
      this.db.pauta.classAverage = Math.round(avg * 10) / 10;
      this.db.pauta.highestGrade = Math.max(...totalScores);
      this.db.pauta.lowestGrade = Math.min(...totalScores);
      const approved = this.db.pauta.grades.filter((g) => g.finalScore >= 9.5).length;
      this.db.pauta.approvedCount = approved;
      this.db.pauta.failedCount = this.db.pauta.grades.length - approved;
      this.db.pauta.approvalRatePercent = Math.round((approved / this.db.pauta.grades.length) * 1000) / 10;
      this.db.pauta.lastUpdated = `${new Date().toLocaleDateString('pt-PT')} ${new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}`;

      this.notify();
    }
  }

  public homologatePauta(directorName: string, pin: string) {
    this.db.pauta.status = 'homologada';
    this.db.pauta.isDirectorSigned = true;
    this.db.pauta.directorName = directorName;
    this.db.pauta.directorPin = pin;
    this.db.pauta.directorSignedAt = `${new Date().toLocaleDateString('pt-PT')} ${new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}`;
    this.notify();
  }

  // Tuition Invoices
  public addPayment(invoiceId: string, method: 'mcx' | 'multicaixa' | 'debito' | 'numerario' | 'tpa', amountKz: number) {
    const inv = this.db.invoices.find((i) => i.id === invoiceId);
    if (inv) {
      inv.status = 'pago';
      inv.method = method;
      inv.methodLabel = method === 'mcx' ? 'Multicaixa Express (MCX)' : method === 'multicaixa' ? 'Multicaixa' : method === 'numerario' ? 'Numerário / Balcão' : method === 'debito' ? 'Débito Direto' : 'TPA Terminal Físico';
      inv.paymentDate = `${new Date().toLocaleDateString('pt-PT')} ${new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}`;
      inv.receiptNumber = `RC ${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`;
      inv.receiptGeneratedAt = inv.paymentDate;
      this.notify();
    }
  }

  public createInvoice(invoice: Omit<TuitionInvoice, 'id' | 'invoiceNumber' | 'daysLate'>): TuitionInvoice {
    const newInv: TuitionInvoice = {
      ...invoice,
      id: `inv-${Date.now()}`,
      invoiceNumber: `FT 2024/${Math.floor(2000 + Math.random() * 8000)}`,
      daysLate: 0
    };
    this.db.invoices = [newInv, ...this.db.invoices];
    this.notify();
    return newInv;
  }

  // Notices
  public addNotice(notice: Omit<Notice, 'id' | 'date' | 'readsCount'>): Notice {
    const newNotice: Notice = {
      ...notice,
      id: `not-${Date.now()}`,
      date: 'Hoje, ' + new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
      readsCount: 1
    };
    this.db.notices = [newNotice, ...this.db.notices];
    this.notify();
    return newNotice;
  }

  // Library
  public issueBookLoan(bookId: string, borrowerName: string, borrowerRole: string) {
    const book = this.db.books.find((b) => b.id === bookId);
    if (book && book.availableCopies > 0) {
      book.availableCopies -= 1;
      const loan: BookLoan = {
        id: `loan-${Date.now()}`,
        bookId,
        bookTitle: book.title,
        borrowerName,
        borrowerRole,
        borrowDate: new Date().toLocaleDateString('pt-PT'),
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-PT'),
        status: 'ativo'
      };
      this.db.loans = [loan, ...this.db.loans];
      this.notify();
    }
  }

  public returnBookLoan(loanId: string) {
    const loan = this.db.loans.find((l) => l.id === loanId);
    if (loan) {
      loan.status = 'devolvido';
      loan.returnDate = new Date().toLocaleDateString('pt-PT');
      const book = this.db.books.find((b) => b.id === loan.bookId);
      if (book) {
        book.availableCopies = Math.min(book.totalCopies, book.availableCopies + 1);
      }
      this.notify();
    }
  }

  // Settings
  public updateSettings(updates: Partial<InstitutionSettings>) {
    this.db.settings = { ...this.db.settings, ...updates };
    this.notify();
  }

  // Factory reset
  public resetToFactoryDemo() {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.warn(e);
    }
    this.db = getInitialDb();
    this.notify();
  }

  public resetToDefaults() {
    this.resetToFactoryDemo();
  }

  public addTuitionFee(fee: any) {
    const newInv: TuitionInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: fee.invoiceNumber || `FT 2024/${Math.floor(2000 + Math.random() * 8000)}`,
      receiptNumber: fee.receiptNumber,
      studentId: String(fee.studentId),
      studentName: fee.studentName || this.db.students.find((s) => s.id === String(fee.studentId))?.name || 'Aluno',
      procNumber: fee.procNumber || this.db.students.find((s) => s.id === String(fee.studentId))?.procNumber || '2400',
      avatar: this.db.students.find((s) => s.id === String(fee.studentId))?.avatar || '',
      className: this.db.students.find((s) => s.id === String(fee.studentId))?.className || '10º Ano',
      guardianName: fee.guardianName || this.db.students.find((s) => s.id === String(fee.studentId))?.guardianName || 'Encarregado',
      guardianNif: fee.guardianNif || '241 890 112',
      period: fee.period || 'Mês Corrente',
      description: fee.description || 'Propina Mensal',
      baseAmountKz: Number(fee.baseAmountKz || fee.totalAmountKz || 95000),
      lateFeeKz: Number(fee.lateFeeKz || 0),
      totalAmountKz: Number(fee.totalAmountKz || fee.baseAmountKz || 95000),
      dueDate: fee.dueDate || '2024-12-08',
      daysLate: 0,
      paymentDate: fee.paymentDate,
      status: fee.status || 'pendente',
      method: fee.method,
      multicaixaEntity: fee.multicaixaEntity || '00192',
      multicaixaRef: fee.multicaixaRef
    };
    this.db.invoices = [newInv, ...this.db.invoices];
    this.notify();
    return newInv;
  }

  public updateTuitionFee(feeId: any, updates: Partial<TuitionInvoice>) {
    const idStr = String(feeId);
    this.db.invoices = this.db.invoices.map((inv) =>
      inv.id === idStr || String((inv as any).id) === idStr ? { ...inv, ...updates } : inv
    );
    this.notify();
  }
}

export const dbService = new SchoolDatabaseService();
