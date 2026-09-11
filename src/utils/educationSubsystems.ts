import { EducationLevelId, EducationSubsystem } from '../types';

export type { EducationLevelId, EducationSubsystem };

export const ALL_EDUCATION_SUBSYSTEMS: EducationSubsystem[] = [
  {
    id: 'pre_escolar',
    name: 'Educação Pré-Escolar',
    shortName: 'Pré-Escolar',
    fullName: 'Educação Pré-Escolar (Creche, Jardim de Infância e Iniciação)',
    description: 'Atendimento integral à primeira infância, desde a creche e jardim até à classe de iniciação preparatória.',
    grades: [
      'Creche (Berçário / Maternal)',
      'Jardim de Infância (3 a 4 anos)',
      'Iniciação (5 anos)'
    ],
    defaultAreas: [
      'Desenvolvimento Infantil & Psicomotricidade'
    ],
    regime: 'Monodocência / Educador de Infância',
    icon: 'child_care'
  },
  {
    id: 'primario',
    name: 'Ensino Primário',
    shortName: 'Primário',
    fullName: 'Ensino Primário (1.ª à 6.ª classe, monodocência até à 4.ª)',
    description: 'Ensino primário universal com regime de monodocência obrigatória da 1.ª à 4.ª classe e pluridocência na 5.ª e 6.ª classe.',
    grades: [
      '1.ª Classe',
      '2.ª Classe',
      '3.ª Classe',
      '4.ª Classe',
      '5.ª Classe',
      '6.ª Classe'
    ],
    defaultAreas: [
      'Ensino Primário Geral'
    ],
    regime: 'Monodocência até à 4.ª classe / Pluridocência na 5.ª e 6.ª',
    icon: 'school'
  },
  {
    id: 'secundario_1',
    name: 'I Ciclo do Ensino Secundário',
    shortName: 'I Ciclo',
    fullName: 'I Ciclo do Ensino Secundário (7.ª à 9.ª classe, I e II Ano do EJA)',
    description: 'Ensino secundário básico por disciplinas e Educação de Jovens e Adultos (EJA), com regime de pluridocência.',
    grades: [
      '7.ª Classe',
      '8.ª Classe',
      '9.ª Classe',
      'I Ano EJA (Módulos 1-2)',
      'II Ano EJA (Módulos 3-4)'
    ],
    defaultAreas: [
      'Ensino Geral Unificado',
      'Educação de Jovens e Adultos (EJA)'
    ],
    regime: 'Pluridocência por Disciplinas Curriculares',
    icon: 'menu_book'
  },
  {
    id: 'secundario_2',
    name: 'II Ciclo / Ensino Médio',
    shortName: 'II Ciclo / Médio',
    fullName: 'II Ciclo / Ensino Médio — 10.ª à 13.ª Classe (Geral & Técnico)',
    description: 'Ensino secundário pré-universitário e institutos médios técnicos/politécnicos com estágio curricular e projeto PAP.',
    grades: [
      '10.ª Classe',
      '11.ª Classe',
      '12.ª Classe',
      '13.ª Classe (Técnico-Profissional)'
    ],
    defaultAreas: [
      'Ciências Físicas e Biológicas',
      'Ciências Económicas e Jurídicas',
      'Ciências Humanas e Sociais',
      'Artes Visuais & Multimédia',
      'Técnico de Enfermagem Geral',
      'Técnico de Análises Clínicas',
      'Informática de Gestão & Redes',
      'Contabilidade e Gestão',
      'Eletrotecnia e Instalações Elétricas',
      'Construção Civil'
    ],
    regime: 'Pluridocência Especializada & Estágio Profissional',
    icon: 'biotech'
  },
  {
    id: 'superior',
    name: 'Ensino Superior',
    shortName: 'Superior',
    fullName: 'Ensino Superior (Bacharelato, Licenciatura, Mestrado)',
    description: 'Graus académicos superiores com regime semestral por créditos ECTS, cadeiras curriculares e exame de recurso.',
    grades: [
      '1.º Ano (Licenciatura)',
      '2.º Ano (Licenciatura)',
      '3.º Ano (Licenciatura)',
      '4.º Ano (Licenciatura)',
      '5.º Ano (Licenciatura/Especialidade)',
      '1.º Ano (Bacharelato)',
      '2.º Ano (Bacharelato)',
      '3.º Ano (Bacharelato)',
      '1.º Ano (Mestrado)',
      '2.º Ano (Mestrado)'
    ],
    defaultAreas: [
      'Medicina Geral',
      'Direito & Ciências Jurídicas',
      'Engenharia Informática & Telecomunicações',
      'Gestão de Empresas & Finanças',
      'Economia',
      'Psicologia Clínica',
      'Ciências Farmacêuticas',
      'Arquitetura e Urbanismo',
      'Engenharia Civil'
    ],
    regime: 'Semestral / Créditos ECTS / Cadeiras Curriculares',
    icon: 'history_edu'
  }
];

export const DEFAULT_SELECTED_SUBSYSTEMS: EducationLevelId[] = [
  'primario',
  'secundario_1',
  'secundario_2'
];

/**
 * Retorna os subsistemas ativos na configuração da instituição.
 * Se nenhum estiver selecionado, retorna os subsistemas padrão.
 */
export function getActiveSubsystems(selectedIds?: EducationLevelId[]): EducationSubsystem[] {
  if (!selectedIds || selectedIds.length === 0) {
    return ALL_EDUCATION_SUBSYSTEMS.filter((s) => DEFAULT_SELECTED_SUBSYSTEMS.includes(s.id));
  }
  return ALL_EDUCATION_SUBSYSTEMS.filter((s) => selectedIds.includes(s.id));
}

/**
 * Retorna todas as classes/anos disponíveis com base nos subsistemas ativos.
 */
export function getAvailableGrades(selectedIds?: EducationLevelId[]): string[] {
  const active = getActiveSubsystems(selectedIds);
  const grades: string[] = [];
  active.forEach((sub) => {
    grades.push(...sub.grades);
  });
  return grades;
}

/**
 * Retorna todas as áreas/cursos disponíveis com base nos subsistemas ativos.
 * Opcionalmente filtra de acordo com a classe selecionada.
 */
export function getAvailableAreas(selectedIds?: EducationLevelId[], targetGrade?: string): string[] {
  if (targetGrade) {
    const sub = getSubsystemForGrade(targetGrade);
    if (sub) {
      return sub.defaultAreas;
    }
  }

  const active = getActiveSubsystems(selectedIds);
  const areas: string[] = [];
  active.forEach((sub) => {
    sub.defaultAreas.forEach((area) => {
      if (!areas.includes(area)) {
        areas.push(area);
      }
    });
  });
  return areas.length > 0 ? areas : ['Geral'];
}

/**
 * Encontra a qual subsistema uma classe pertence.
 */
export function getSubsystemForGrade(grade: string): EducationSubsystem | undefined {
  if (!grade) return undefined;
  return ALL_EDUCATION_SUBSYSTEMS.find((sub) =>
    sub.grades.some((g) => g.toLowerCase() === grade.toLowerCase() || grade.toLowerCase().includes(g.toLowerCase()))
  );
}

/**
 * Retorna o nome formal do ciclo/nível para uma dada classe.
 */
export function getCycleForGrade(grade: string): string {
  const sub = getSubsystemForGrade(grade);
  if (!sub) {
    if (grade.includes('Classe')) {
      const num = parseInt(grade.replace(/\D/g, ''), 10);
      if (num >= 1 && num <= 6) return 'Ensino Primário';
      if (num >= 7 && num <= 9) return 'I Ciclo do Ensino Secundário';
      if (num >= 10 && num <= 13) return 'II Ciclo / Ensino Médio';
    }
    if (grade.includes('Licenciatura') || grade.includes('Mestrado') || grade.includes('Bacharelato')) {
      return 'Ensino Superior';
    }
    return 'Ensino Geral';
  }
  return sub.fullName;
}

/**
 * Gera automaticamente uma sugestão de nome para a turma com base na classe, secção e área.
 */
export function generateSuggestedClassName(grade: string, section: string, area?: string): string {
  if (!grade) return '';
  const cleanSection = section ? section.trim().toUpperCase() : 'A';

  if (grade.includes('Creche') || grade.includes('Jardim') || grade.includes('Iniciação')) {
    return `${grade} • Turma ${cleanSection}`;
  }

  if (grade.includes('Licenciatura') || grade.includes('Bacharelato') || grade.includes('Mestrado')) {
    const areaShort = area ? ` - ${area.split('&')[0].trim()}` : '';
    return `${grade}${areaShort} • Turma ${cleanSection}`;
  }

  if (grade.includes('10ª') || grade.includes('11ª') || grade.includes('12ª') || grade.includes('13ª')) {
    const areaTag = area && !area.includes('Geral') ? ` (${area.split(' ')[0]})` : '';
    return `${grade}${areaTag} • Turma ${cleanSection}`;
  }

  return `${grade} • Turma ${cleanSection}`;
}
