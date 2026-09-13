export type GradeTypeKey = 'MAC' | 'NPP' | 'NPT' | 'MT1' | 'MT2' | 'MT3' | 'MFD' | 'PG' | 'CA' | 'MF';

export interface GradeTypeConfig {
  key: GradeTypeKey;
  label: string;
  shortLabel: string;
  description: string;
  category: 'evaluation' | 'trimester_average' | 'final';
}

export const ALL_GRADE_TYPES: GradeTypeConfig[] = [
  { key: 'MAC', label: 'MAC', shortLabel: 'MAC', description: 'Média de Avaliação Contínua', category: 'evaluation' },
  { key: 'NPP', label: 'NPP', shortLabel: 'NPP', description: 'Nota de Prova Parcial', category: 'evaluation' },
  { key: 'NPT', label: 'NPT', shortLabel: 'NPT', description: 'Nota de Prova Trimestral', category: 'evaluation' },
  { key: 'MT1', label: 'MT1', shortLabel: 'MT1', description: 'Média do 1º Trimestre', category: 'trimester_average' },
  { key: 'MT2', label: 'MT2', shortLabel: 'MT2', description: 'Média do 2º Trimestre', category: 'trimester_average' },
  { key: 'MT3', label: 'MT3', shortLabel: 'MT3', description: 'Média do 3º Trimestre', category: 'trimester_average' },
  { key: 'MFD', label: 'MFD', shortLabel: 'MFD', description: 'Média Final da Disciplina', category: 'final' },
  { key: 'PG', label: 'PG', shortLabel: 'PG', description: 'Prova Global / Exame', category: 'evaluation' },
  { key: 'CA', label: 'CA', shortLabel: 'CA', description: 'Classificação Anual', category: 'final' },
  { key: 'MF', label: 'MF', shortLabel: 'MF', description: 'Média Final Geral', category: 'final' },
];

export interface StudentMiniPautaItem {
  id: string;
  studentId: string;
  num: number;
  name: string;
  gender: 'M' | 'F';
  birthYear: number | string;
  age: number | string;
  isDebtor: boolean;
  isDesistente: boolean;
  // I Trimestre
  mac1: number | '';
  npp1: number | '';
  npt1: number | '';
  mt1: number | '';
  // II Trimestre
  mac2: number | '';
  npp2: number | '';
  npt2: number | '';
  mt2: number | '';
  // III Trimestre
  mac3: number | '';
  npp3: number | '';
  npt3: number | '';
  mt3: number | '';
  // Classificação Final
  mfd: number | '';
  pg: number | '';
  ca: number | '';
  obs: string;
}

export interface StudentSubjectDisciplineGrades {
  mt1: number | '';
  mt2: number | '';
  mt3: number | '';
  mfd: number | '';
}

export interface StudentPautaGeralItem {
  id: string;
  studentId: string;
  num: number;
  name: string;
  gender: 'M' | 'F';
  birthYear: number | string;
  age: number | string;
  isDebtor: boolean;
  isDesistente: boolean;
  subjectGrades: Record<string, StudentSubjectDisciplineGrades>;
  mf: number | '';
  situation: 'APTO' | 'N/APTO' | 'DESISTIDO';
}
