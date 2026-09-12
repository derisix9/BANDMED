export type UserRole = 'admin' | 'professor' | 'aluno' | 'encarregado';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  avatar: string;
  phone?: string;
  processNumber?: string;
  password?: string;
}

export interface AttachedDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl: string;
  uploadedAt: string;
}

export interface Student {
  id: string;
  procNumber: string;
  name: string;
  email: string;
  avatar: string;
  grade: string;
  classId: string;
  className: string;
  section: string;
  cycle: string;
  birthDate: string;
  nif: string;
  citizenCard: string;
  biNumber?: string;
  gender?: 'Masculino' | 'Feminino' | 'M' | 'F' | string;
  nationality?: string;
  birthPlace?: string;
  address: string;
  studentPhone?: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  guardianNif: string;
  guardianRelation?: string;
  // 4. Histórico Escolar
  previousSchool?: string;
  lastCompletedGrade?: string;
  academicSituation?: 'Transitado' | 'Reprovado' | 'Primeira Matrícula' | 'Transferido' | string;
  // 5. Documentos
  docBiCopy?: 'Entregue' | 'Pendente' | 'Dispensado' | string;
  docBiFile?: AttachedDocument;
  docCertificate?: 'Entregue' | 'Declaração Provisória' | 'Pendente' | string;
  docCertificateFile?: AttachedDocument;
  additionalDocs?: AttachedDocument[];
  docPassPhoto?: string;
  attendanceRate: number;
  financialStatus: 'regular' | 'debito' | 'isento';
  status: 'active' | 'pending' | 'transferred' | 'suspended';
  currentAverage: number;
  unexcusedAbsences: number;
  excusedAbsences: number;
  monthlyTuitionKz: number;
  isTuitionPaidCurrentMonth: boolean;
  grades?: Record<string, number>;
  disciplineGrades: {
    subject: string;
    score: number;
    maxScore: number;
  }[];
}

export interface TeacherAllocation {
  classId: string;
  className: string;
  subject: string;
  hoursWeekly: number;
  room?: string;
}

export interface Teacher {
  id: string;
  agentNumber: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  biNumber: string;
  nif: string;
  department: string;
  degree: string;
  bio: string;
  admissionDate: string;
  weeklyHours: number;
  allocatedClasses: TeacherAllocation[];
  status: 'ativo' | 'licenca' | 'contrato_vencer';
  rating: number;
  evaluationsCount: number;
}

export interface ClassRoom {
  id: string;
  name: string;
  grade: string;
  section: string;
  cycle: string;
  area?: string;
  shift: 'Manhã' | 'Tarde' | 'Integral';
  room: string;
  studentCount: number;
  maxCapacity: number;
  headTeacherId: string;
  headTeacherName: string;
  delegateName?: string;
  academicYear: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  level: EducationLevelId;
  cycle: string;
  grades?: string[];
  description?: string;
  coordinatorId?: string;
  coordinatorName?: string;
  durationYears?: number;
  status: 'ativo' | 'inativo';
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  cycle: string;
  area?: string;
  weeklyHours: number;
  description?: string;
  coordinatorName?: string;
  coordinatorAvatar?: string;
  status?: 'Aprovada' | 'Em Revisão' | 'Pendente';
}

export type AttendanceStatus = 'P' | 'FJ' | 'FI' | 'A';

export interface AttendanceStudentItem {
  studentId: string;
  studentName: string;
  procNumber: string;
  avatar: string;
  status: AttendanceStatus;
  entryTime?: string;
  note?: string;
  cumulativeAbsencesCount: number;
  absencePercentage: number;
}

export interface AttendanceSheet {
  id: string;
  date: string;
  formattedDate: string;
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  timeSlot: string;
  room: string;
  status: 'aberto' | 'sincronizado' | 'homologado';
  lessonSummary: string;
  isDigitallySigned: boolean;
  signedBy?: string;
  signedAt?: string;
  students: AttendanceStudentItem[];
}

export interface GradeItem {
  id: string | number;
  examId?: string | number;
  studentId: string | number;
  studentName?: string;
  procNumber?: string;
  avatar?: string;
  mac: number;
  npp: number;
  npt: number;
  finalScore: number;
  qualitative: string;
  situation: 'Transita (Dispensa)' | 'Transita' | 'Exame de Recurso' | 'Não Aprovado' | string;
  teacherNote?: string;
}

export interface ExamPauta {
  id: string;
  referenceCode: string;
  academicYear: string;
  trimester: '1' | '2' | '3';
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  evaluationTitle: string;
  teacherName: string;
  teacherAgentNumber: string;
  status: 'em_lancamento' | 'aguardando_assinatura' | 'homologada';
  classAverage: number;
  highestGrade: number;
  lowestGrade: number;
  approvalRatePercent: number;
  approvedCount: number;
  failedCount: number;
  lastUpdated: string;
  isDirectorSigned?: boolean;
  directorSignedAt?: string;
  directorName?: string;
  directorPin?: string;
  grades: GradeItem[];
}

export interface TuitionInvoice {
  id: string;
  invoiceNumber: string;
  receiptNumber?: string;
  studentId: string;
  studentName: string;
  procNumber: string;
  avatar: string;
  className: string;
  guardianName: string;
  guardianNif: string;
  period: string;
  description: string;
  baseAmountKz: number;
  lateFeeKz: number;
  totalAmountKz: number;
  dueDate: string;
  daysLate: number;
  paymentDate?: string;
  status: 'pago' | 'atraso' | 'pendente' | 'isento';
  method?: 'mcx' | 'multicaixa' | 'debito' | 'numerario' | 'tpa';
  methodLabel?: string;
  multicaixaEntity?: string;
  multicaixaRef?: string;
  receiptGeneratedAt?: string;
}

export interface Notice {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorRole: string;
  targetRoles: UserRole[];
  priority: 'urgente' | 'alta' | 'normal' | 'informativa';
  date: string;
  readsCount: number;
}

export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
  shelfLocation: string;
}

export interface BookLoan {
  id: string;
  bookId: string;
  bookTitle: string;
  borrowerName: string;
  borrowerRole: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'ativo' | 'devolvido' | 'atrasado';
}

export interface TimetableEntry {
  id: string;
  classId: string;
  dayOfWeek: 'Segunda-feira' | 'Terça-feira' | 'Quarta-feira' | 'Quinta-feira' | 'Sexta-feira';
  timeStart: string;
  timeEnd: string;
  subject: string;
  teacherName: string;
  room: string;
}

export type EducationLevelId =
  | 'pre_escolar'
  | 'primario'
  | 'secundario_1'
  | 'secundario_2'
  | 'superior';

export interface EducationSubsystem {
  id: EducationLevelId;
  name: string;
  shortName: string;
  fullName: string;
  description: string;
  grades: string[];
  defaultAreas: string[];
  coursesOrAreas?: string[];
  regime: string;
  icon: string;
}

export interface InstitutionSettings {
  schoolName: string;
  nif: string;
  decreeAuthorization: string;
  province: string;
  municipality: string;
  address: string;
  email: string;
  phone: string;
  logoUrl: string;
  currentAcademicYear: string;
  currencyCode: 'Kz' | 'AOA';
  currentTrimester: '1' | '2' | '3';
  selectedSubsystems?: EducationLevelId[];
}

export type SchoolClass = ClassRoom;
export type SystemSettings = InstitutionSettings;
export type AttendanceRecord = AttendanceStudentItem;
export type GradeRecord = GradeItem;
export type TuitionFee = TuitionInvoice;

export interface SchoolDatabase {
  users: User[];
  currentUser: User;
  students: Student[];
  teachers: Teacher[];
  classes: ClassRoom[];
  subjects: Subject[];
  courses?: Course[];
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
