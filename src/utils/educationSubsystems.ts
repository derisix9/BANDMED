import { EducationLevelId, EducationSubsystem, Subject } from '../types';

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
    coursesOrAreas: [
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
    coursesOrAreas: [
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
    coursesOrAreas: [
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
    coursesOrAreas: [
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
    coursesOrAreas: [
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
/**
 * Normaliza o texto de uma classe para facilitar comparações precisas (remove pontos, ordinais e espaços extras).
 */
export function normalizeGradeKey(grade: string): string {
  if (!grade) return '';
  return grade
    .toLowerCase()
    .replace(/[.\-–—ºª°]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Verifica se a classe pertence ao Ensino Médio / II Ciclo (a partir da 10.ª classe) ou ao Ensino Superior.
 */
export function isUpperLevelGrade(grade: string): boolean {
  if (!grade) return false;
  const norm = normalizeGradeKey(grade);
  const numMatch = grade.match(/(\d+)/);
  if (numMatch) {
    const num = parseInt(numMatch[1], 10);
    if (num >= 10) return true;
  }
  return (
    norm.includes('licenciatura') ||
    norm.includes('bacharelato') ||
    norm.includes('mestrado') ||
    norm.includes('superior') ||
    norm.includes('10') ||
    norm.includes('11') ||
    norm.includes('12') ||
    norm.includes('13')
  );
}

/**
 * Retorna todas as áreas/cursos disponíveis com base nos subsistemas ativos.
 * Opcionalmente filtra de acordo com a classe selecionada.
 */
export function getAvailableAreas(selectedIds?: EducationLevelId[], targetGrade?: string): string[] {
  if (targetGrade) {
    const sub = getSubsystemForGrade(targetGrade);
    if (sub && sub.defaultAreas && sub.defaultAreas.length > 0) {
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
 * Encontra a qual subsistema uma classe pertence de forma rigorosa e confiável.
 */
export function getSubsystemForGrade(grade: string): EducationSubsystem | undefined {
  if (!grade) return undefined;
  const normGrade = normalizeGradeKey(grade);

  // 1. Verificação por comparação direta normalizada
  for (const sub of ALL_EDUCATION_SUBSYSTEMS) {
    if (sub.grades.some((g) => normalizeGradeKey(g) === normGrade)) {
      return sub;
    }
  }

  // 2. Verificação numérica para classes de ensino geral e técnico
  const numMatch = grade.match(/(\d+)/);
  if (numMatch) {
    const num = parseInt(numMatch[1], 10);
    if (num >= 1 && num <= 6) {
      return ALL_EDUCATION_SUBSYSTEMS.find((s) => s.id === 'primario');
    }
    if (num >= 7 && num <= 9) {
      return ALL_EDUCATION_SUBSYSTEMS.find((s) => s.id === 'secundario_1');
    }
    if (num >= 10 && num <= 13) {
      return ALL_EDUCATION_SUBSYSTEMS.find((s) => s.id === 'secundario_2');
    }
  }

  // 3. Verificação para Ensino Superior
  const lower = grade.toLowerCase();
  if (
    lower.includes('licenciatura') ||
    lower.includes('bacharelato') ||
    lower.includes('mestrado') ||
    lower.includes('superior')
  ) {
    return ALL_EDUCATION_SUBSYSTEMS.find((s) => s.id === 'superior');
  }

  // 4. Verificação para Pré-Escolar
  if (
    lower.includes('creche') ||
    lower.includes('jardim') ||
    lower.includes('iniciação') ||
    lower.includes('iniciacao')
  ) {
    return ALL_EDUCATION_SUBSYSTEMS.find((s) => s.id === 'pre_escolar');
  }

  return undefined;
}

/**
 * Retorna o nome formal do ciclo/nível para uma dada classe.
 */
export function getCycleForGrade(grade: string): string {
  const sub = getSubsystemForGrade(grade);
  if (sub) {
    return sub.fullName;
  }
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

  if (
    grade.includes('10') ||
    grade.includes('11') ||
    grade.includes('12') ||
    grade.includes('13')
  ) {
    const areaTag = area && !area.includes('Geral') ? ` (${area.split(' ')[0]})` : '';
    return `${grade}${areaTag} • Turma ${cleanSection}`;
  }

  return `${grade} • Turma ${cleanSection}`;
}

/**
 * Gera automaticamente o código de uma disciplina com base no nome e disciplinas já cadastradas.
 * Exemplo: 'Matemática' -> 'MAT01'. Se já houver outra Matemática em outro ciclo -> 'MAT02'.
 * Avisa se já existir a mesma disciplina cadastrada no mesmo ciclo/subsistema.
 */
export function generateSubjectCode(
  name: string,
  existingSubjects: Subject[],
  targetCycle?: string
): { code: string; isDuplicateInSameCycle: boolean; sequence: number } {
  if (!name || name.trim().length === 0) {
    return { code: '', isDuplicateInSameCycle: false, sequence: 1 };
  }

  // Remove acentos e caracteres especiais para gerar prefixo limpo
  const clean = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim();

  const words = clean.split(/\s+/).filter(Boolean);
  let prefix = '';

  if (words.length === 1) {
    prefix = words[0].slice(0, 3).toUpperCase();
  } else if (words.length === 2) {
    prefix = (words[0].slice(0, 2) + words[1].slice(0, 1)).toUpperCase();
  } else {
    // 3 palavras ou mais
    const meaningfulWords = words.filter(
      (w) => !['de', 'da', 'do', 'e', 'em', 'para', 'com'].includes(w.toLowerCase())
    );
    if (meaningfulWords.length >= 3) {
      prefix = meaningfulWords.slice(0, 3).map((w) => w[0]).join('').toUpperCase();
    } else {
      prefix = (words[0].slice(0, 2) + words[1].slice(0, 1)).toUpperCase();
    }
  }

  if (prefix.length < 3) {
    prefix = (prefix + 'DIS').slice(0, 3).toUpperCase();
  }

  // Verifica disciplinas existentes com o mesmo prefixo
  const matchingPrefix = existingSubjects.filter((s) => {
    const c = (s.code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    return c.startsWith(prefix);
  });

  // Verifica se a mesma disciplina com o mesmo nome já existe no mesmo ciclo/subsistema
  const cleanNormName = clean.toLowerCase();
  const isDuplicateInSameCycle = Boolean(
    targetCycle &&
      existingSubjects.some((s) => {
        const sNormName = (s.name || '')
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .trim();
        const sameName = sNormName === cleanNormName;
        const sameCycle =
          (s.cycle || '').trim().toLowerCase() === targetCycle.trim().toLowerCase();
        return sameName && sameCycle;
      })
  );

  // Calcula o maior número sequencial já usado para este prefixo
  let maxSeq = 0;
  matchingPrefix.forEach((s) => {
    const raw = (s.code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    const numPart = raw.slice(prefix.length);
    const parsed = parseInt(numPart, 10);
    if (!isNaN(parsed) && parsed > maxSeq) {
      maxSeq = parsed;
    }
  });

  const nextSeq = maxSeq + 1;
  const seqStr = String(nextSeq).padStart(2, '0');
  const code = `${prefix}${seqStr}`;

  return { code, isDuplicateInSameCycle, sequence: nextSeq };
}
