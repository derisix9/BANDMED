export type UserRole = 'admin' | 'director' | 'secretaria' | 'professor' | 'financeiro' | 'aluno' | 'encarregado';

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
  institutionId?: string;
  username?: string;
}

export interface InstitutionSummary {
  id: string;
  name: string;
  adminEmail: string;
  adminName: string;
  createdAt: string;
}

export interface AttachedDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl: string;
  uploadedAt?: string;
  uploadDate?: string;
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
  placeOfBirth?: string;
  bloodType?: string;
  courseName?: string;
  shift?: string;
  classroomRoom?: string;
  previousGradeCompleted?: string;
  averageDisciplineGrade?: number;
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
  trimesterGrades?: StudentTrimesterRecord[];
}

export interface StudentTrimesterRecord {
  subjectId: string;
  subjectName: string;
  mac1: number;
  npp1: number;
  npt1: number;
  mt1: number;
  mac2: number;
  npp2: number;
  npt2: number;
  mt2: number;
  mac3: number;
  npp3: number;
  npt3: number;
  mt3: number;
  mfd: number;
  pg?: number;
  ca: number;
  situation: 'Aprovado' | 'Exame de Recurso' | 'Não Aprovado' | 'Desistente';
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
  gender?: string;
  birthDate?: string;
  maritalStatus?: string;
  nationality?: string;
  birthPlace?: string;
  address?: string;
  university?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  category?: string;
  inssNumber?: string;
  baseSalaryKz?: number;
  allowancesKz?: number;
  allowanceDescription?: string;
  retentionTaxKz?: number;
  bankName?: string;
  iban?: string;
  attendanceRatePercent?: number;
  timelyGradesPercent?: number;
  studentsTutoredCount?: number;
  averageApprovalRatePercent?: number;
  averageDisciplineGrade?: number;
  seniorityYears?: number;
  admissionYear?: number;
  roleBadge?: string;
}

export interface ClassRoom {
  id: string;
  name: string;
  grade: string;
  section: string;
  cycle: string;
  area?: string;
  shift: 'Manhã' | 'Tarde' | 'Integral' | 'Pós-Laboral' | 'Noite';
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

export interface InvoiceItem {
  code: string;
  description: string;
  subDescription?: string;
  periodOrRef?: string;
  quantity: number;
  unitPriceKz: number;
  discountKz?: number;
  taxRegime?: string;
  ivaRate?: string;
  totalKz?: number;
  liquidTotalKz?: number;
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
  items?: InvoiceItem[];
  guardianPhone?: string;
  guardianAddress?: string;
  studentBiNumber?: string;
  operatorName?: string;
  operatorCode?: string;
  saftHash?: string;
  transactionNumber?: string;
  bankName?: string;
  discountName?: string;
  discountAmountKz?: number;
  subtotalKz?: number;
  stampDutyKz?: number;
  totalPaidKz?: number;
  selectedMonths?: string[];
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

export interface SchoolNotification {
  id: string;
  title: string;
  message: string;
  type: 'notice' | 'finance' | 'attendance' | 'academic' | 'system';
  priority?: 'urgente' | 'alta' | 'normal' | 'info';
  timestamp: string;
  read: boolean;
  targetRoles?: UserRole[];
  linkView?: string;
  linkId?: string;
  createdAt: number;
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

export interface TrimesterSchedule {
  startDate: string;
  endDate: string;
  examPeriod: string;
  gradesCouncilDate: string;
  weeksCount: string;
}

export interface InstitutionSettings {
  institutionId?: string;
  schoolName: string;
  subTitle?: string;
  nif: string;
  decreeAuthorization: string;
  province: string;
  municipality: string;
  address: string;
  email: string;
  phone: string;
  logoUrl: string;
  currentAcademicYear: string;
  availableAcademicYears?: string[];
  currencyCode: 'Kz' | 'AOA';
  currentTrimester: '1' | '2' | '3';
  selectedSubsystems?: EducationLevelId[];
  directorGeral?: string;
  directorPedagogico?: string;
  chefeSecretaria?: string;
  website?: string;
  bairro?: string;
  academicPeriod?: string;
  academicWeeks?: string;
  trimesterSchedules?: {
    t1: TrimesterSchedule;
    t2: TrimesterSchedule;
    t3: TrimesterSchedule;
  };
  academicPauses?: Array<{ id: number | string; desc: string; periodo: string; dias: string }>;
  academicLockingRules?: { bloqueioSumarios: boolean; toleranciaNotas: boolean; chaveFecho: boolean };
  subsystemTuitions?: any;
  tuitionRows?: any[];
  emolumentos?: any[];
  financialRules?: { paymentDueDay: number; lateFeePercent: number; discountPercent: number; siblingDiscountPercent?: number; [key: string]: any };
  gradeRules?: { macWeight: number; ppWeight: number; ptWeight: number; minPassingGrade?: number; passingGrade?: number; recursoMinGrade?: number; examWaiverGrade?: number; strictDecimals?: boolean; strictDecimal?: boolean; roundRuleHalfUp?: boolean; roundHalfUp?: boolean; [key: string]: any };
  rolePermissions?: Record<string, any>;
  securityPolicies?: { twoFactorActive?: boolean; sessionTimeout?: string; maxFailedAttempts?: string; passwordExpirationDays?: string; [key: string]: any };
  backupHistory?: Array<{ id: string | number; arquivo: string; tamanho: string; data: string; status: string }>;
}

export type SchoolClass = ClassRoom;
export type SystemSettings = InstitutionSettings;
export type AttendanceRecord = AttendanceStudentItem;
export type GradeRecord = GradeItem;
export type TuitionFee = TuitionInvoice;

export interface SchoolServiceItem {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: 'propinas' | 'matricula' | 'declaracao' | 'uniforme' | 'cartao' | 'geral';
  defaultPriceKz: number;
  taxRegime?: string;
  active: boolean;
  createdAt?: string;
}

export interface SchoolAuditLog {
  id: string;
  userName: string;
  userRole?: string;
  avatar?: string;
  action: string;
  details: string;
  module: 'pautas' | 'propinas' | 'assiduidade' | 'alunos' | 'sistema' | 'turmas' | string;
  timestamp: string;
  createdAt: number;
  badgeColor?: string;
}

export interface SchoolCalendarEvent {
  id: string;
  title: string;
  description: string;
  monthShort: string;
  dayNumber: string | number;
  date: string;
  time?: string;
  category: 'feriado' | 'exame' | 'reuniao' | 'evento' | string;
  color: string;
}

export interface SchoolDatabase {
  users: User[];
  currentUser: User;
  students: Student[];
  teachers: Teacher[];
  classes: ClassRoom[];
  subjects: Subject[];
  courses?: Course[];
  attendance: AttendanceSheet;
  attendanceSheets?: AttendanceSheet[];
  pauta: ExamPauta;
  invoices: TuitionInvoice[];
  services?: SchoolServiceItem[];
  notices: Notice[];
  notifications?: SchoolNotification[];
  books: LibraryBook[];
  loans: BookLoan[];
  timetable: TimetableEntry[];
  settings: InstitutionSettings;
  tuitionFees?: TuitionInvoice[];
  auditLogs?: SchoolAuditLog[];
  events?: SchoolCalendarEvent[];
  miniPautasStore?: Record<string, Record<string, any[]>>;
  lastCloudSync?: string;
}
