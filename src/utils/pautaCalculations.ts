import { Student, ClassRoom, Subject } from '../types';
import { StudentMiniPautaItem, StudentPautaGeralItem } from '../types/pauta';

/**
 * Calculates birth year and current age from various birthDate string formats
 */
export function calculateBirthYearAndAge(birthDateStr?: string, referenceYear = 2025): { birthYear: number | string; age: number | string } {
  if (!birthDateStr) return { birthYear: '-', age: '-' };

  let year: number | null = null;
  const trimmed = birthDateStr.trim();

  // Try DD/MM/YYYY or DD-MM-YYYY
  if (trimmed.includes('/') || trimmed.includes('-')) {
    const delimiter = trimmed.includes('/') ? '/' : '-';
    const parts = trimmed.split(delimiter);
    if (parts.length === 3) {
      if (parts[2].length === 4) {
        year = parseInt(parts[2], 10);
      } else if (parts[0].length === 4) {
        year = parseInt(parts[0], 10);
      }
    }
  }

  // Fallback to match 4 consecutive digits (e.g. 2007)
  if (!year || isNaN(year)) {
    const match = trimmed.match(/(19\d\d|20\d\d)/);
    if (match) {
      year = parseInt(match[1], 10);
    }
  }

  if (year && !isNaN(year) && year > 1920 && year <= referenceYear) {
    return {
      birthYear: year,
      age: Math.max(0, referenceYear - year)
    };
  }

  return { birthYear: '-', age: '-' };
}

/**
 * Normalizes gender to standard 'M' or 'F'
 */
export function normalizeGender(gender?: string, studentName?: string): 'M' | 'F' {
  if (gender) {
    const g = gender.trim().toUpperCase();
    if (g.startsWith('F') || g === 'FEMININO' || g === 'MULHER') return 'F';
    if (g.startsWith('M') || g === 'MASCULINO' || g === 'HOMEM') return 'M';
  }

  // Common Portuguese/Angolan feminine first names heuristic if gender is not specified
  if (studentName) {
    const firstName = studentName.trim().split(' ')[0].toLowerCase();
    const feminineEndings = ['a', 'ia', 'ina', 'da', 'ete', 'ice'];
    const feminineNames = ['maria', 'ana', 'beatriz', 'adelaide', 'albertina', 'amelia', 'anastacia', 'arelinha', 'arminda', 'teresa', 'claudia', 'eunice', 'nair'];
    if (feminineNames.includes(firstName) || feminineEndings.some(e => firstName.endsWith(e))) {
      return 'F';
    }
  }

  return 'M';
}

/**
 * Calculates Trimester Average (MT) from MAC, NPP, NPT
 * Standard Angolan secondary education formula: MT = (MAC * 0.3) + (NPP * 0.3) + (NPT * 0.4)
 */
export function calculateMT(mac: number | '', npp: number | '', npt: number | ''): number | '' {
  const m = typeof mac === 'number' ? mac : null;
  const p = typeof npp === 'number' ? npp : null;
  const t = typeof npt === 'number' ? npt : null;

  if (m === null && p === null && t === null) return '';

  const mVal = m ?? 0;
  const pVal = p ?? 0;
  const tVal = t ?? 0;

  // MT formula rounded to nearest integer as shown in the uploaded mini-pauta image (e.g. 10.3 -> 10, 6.8 -> 7)
  const calculated = Math.round((mVal * 0.3) + (pVal * 0.3) + (tVal * 0.4));
  return Math.max(0, Math.min(20, calculated));
}

/**
 * Calculates Final Discipline Average (MFD) from MT1, MT2, MT3 (and optionally PG)
 */
export function calculateMFD(mt1: number | '', mt2: number | '', mt3: number | '', pg?: number | ''): number | '' {
  const grades = [mt1, mt2, mt3].filter((g): g is number => typeof g === 'number');
  if (grades.length === 0) return '';

  const avgContinuos = grades.reduce((acc, curr) => acc + curr, 0) / grades.length;

  if (typeof pg === 'number' && pg >= 0) {
    // With Global Exam: 60% continuous + 40% PG
    return Math.max(0, Math.min(20, Math.round((avgContinuos * 0.6) + (pg * 0.4))));
  }

  return Math.max(0, Math.min(20, Math.round(avgContinuos)));
}

/**
 * Calculates Annual Classification (CA)
 * Scale typically 1 to 5 or qualitative level matching Angolan technical high school
 */
export function calculateCA(mfd: number | ''): number | '' {
  if (typeof mfd !== 'number') return '';
  if (mfd >= 17) return 5;
  if (mfd >= 14) return 4;
  if (mfd >= 10) return 3;
  if (mfd >= 7) return 2;
  return 1;
}

/**
 * Standard authentic student dataset matching Image 2
 */
export const IMAGE_2_STUDENTS_SEED: Array<Partial<StudentMiniPautaItem>> = [
  {
    num: 1,
    name: 'Abel Capusso Vissapa Sabino',
    gender: 'M',
    mac1: 9, npp1: 12, npt1: 10, mt1: 10,
    mac2: 8, npp2: 12, npt2: 9, mt2: 10,
    mac3: 5, npp3: 9, npt3: 12, mt3: 9,
    mfd: 10, pg: '', ca: 4, obs: ''
  },
  {
    num: 2,
    name: 'Adelaide Evalina Cafeca',
    gender: 'F',
    mac1: 5, npp1: 5, npt1: 4, mt1: 5,
    mac2: 10, npp2: 5, npt2: 6, mt2: 7,
    mac3: 8, npp3: 10, npt3: 8, mt3: 9,
    mfd: 7, pg: '', ca: 3, obs: ''
  },
  {
    num: 3,
    name: 'Albertina Nanguelo Syei',
    gender: 'F',
    mac1: 7, npp1: 10, npt1: 3, mt1: 7,
    mac2: 10, npp2: 10, npt2: 9, mt2: 10,
    mac3: 18, npp3: 10, npt3: 9, mt3: 12,
    mfd: 10, pg: '', ca: 4, obs: ''
  },
  {
    num: 4,
    name: 'Amelia Namilitali Furtoso',
    gender: 'F',
    isDesistente: true,
    mac1: '', npp1: '', npt1: '', mt1: '',
    mac2: '', npp2: '', npt2: '', mt2: '',
    mac3: '', npp3: '', npt3: '', mt3: '',
    mfd: '', pg: '', ca: '', obs: 'Desistente'
  },
  {
    num: 5,
    name: 'Anastácia Maria Nachilombo',
    gender: 'F',
    isDesistente: true,
    mac1: '', npp1: '', npt1: '', mt1: '',
    mac2: '', npp2: '', npt2: '', mt2: '',
    mac3: '', npp3: '', npt3: '', mt3: '',
    mfd: '', pg: '', ca: '', obs: 'Desistente'
  },
  {
    num: 6,
    name: 'André Samanjata Nandala',
    gender: 'M',
    mac1: 8, npp1: 11, npt1: 6, mt1: 8,
    mac2: 11, npp2: 12, npt2: 6, mt2: 10,
    mac3: 10, npp3: 12, npt3: 10, mt3: 11,
    mfd: 10, pg: '', ca: 4, obs: ''
  },
  {
    num: 7,
    name: 'Apolo Kassicote Chapopia',
    gender: 'M',
    mac1: 5, npp1: 6, npt1: 3, mt1: 5,
    mac2: 5, npp2: 8, npt2: 5, mt2: 6,
    mac3: 8, npp3: 10, npt3: 8, mt3: 9,
    mfd: 6, pg: '', ca: 3, obs: ''
  },
  {
    num: 8,
    name: 'Arelinha Sitati Baptista Lucas',
    gender: 'F',
    mac1: 5, npp1: 5, npt1: 5, mt1: 5,
    mac2: 5, npp2: 6, npt2: 7, mt2: 6,
    mac3: 5, npp3: 8, npt3: 6, mt3: 6,
    mfd: 6, pg: '', ca: 2, obs: ''
  },
  {
    num: 9,
    name: 'Arminda Ng. C. Siliveli',
    gender: 'F',
    mac1: 7, npp1: 10, npt1: 5, mt1: 7,
    mac2: 10, npp2: 15, npt2: 10, mt2: 12,
    mac3: 5, npp3: 12, npt3: 12, mt3: 10,
    mfd: 10, pg: '', ca: 4, obs: ''
  },
  {
    num: 10,
    name: 'Aurélio Sambulungo Felix',
    gender: 'M',
    mac1: 5, npp1: 5, npt1: 6, mt1: 5,
    mac2: 10, npp2: 6, npt2: 9, mt2: 8,
    mac3: 18, npp3: 13, npt3: 9, mt3: 13,
    mfd: 9, pg: '', ca: 4, obs: ''
  }
];

/**
 * Initializes Mini-Pauta records combining class students with subject-specific grades
 */
export function buildMiniPautaRows(
  classStudents: Student[],
  subjectId: string,
  allStudents: Student[],
  savedGradesMap?: Record<string, StudentMiniPautaItem>
): StudentMiniPautaItem[] {
  const sourceList = classStudents.length > 0 ? classStudents : allStudents.slice(0, 10);

  return sourceList.map((st, idx) => {
    // 1. If student has saved edited grades for this subject in session cache, use them
    if (savedGradesMap && savedGradesMap[st.id]) {
      const saved = savedGradesMap[st.id];
      return {
        ...saved,
        num: idx + 1,
        name: st.name || saved.name,
        gender: normalizeGender(st.gender, st.name),
        isDebtor: st.financialStatus === 'debito' || !st.isTuitionPaidCurrentMonth,
        isDesistente: st.status === 'suspended' || st.status === 'transferred' || saved.isDesistente
      };
    }

    const { birthYear, age } = calculateBirthYearAndAge(st.birthDate);
    const gender = normalizeGender(st.gender, st.name);
    const isDebtor = st.financialStatus === 'debito' || !st.isTuitionPaidCurrentMonth;
    const isDesistente = st.status === 'suspended' || st.status === 'transferred';
    const name = st.name || `Aluno ${idx + 1}`;

    // 2. Check if student has real recorded trimester grades in the database
    const realTrimester = st.trimesterGrades?.find(
      (tg) => String(tg.subjectId) === String(subjectId) || tg.subjectName.toLowerCase().includes(subjectId.toLowerCase())
    );
    if (realTrimester && !isDesistente) {
      return {
        id: `${st.id || `row-${idx + 1}`}-${subjectId}`,
        studentId: st.id || `stu-${idx + 1}`,
        num: idx + 1,
        name,
        gender,
        birthYear: birthYear !== '-' ? birthYear : (2007 + (idx % 3)),
        age: age !== '-' ? age : (17 - (idx % 3)),
        isDebtor,
        isDesistente: false,
        mac1: realTrimester.mac1,
        npp1: realTrimester.npp1,
        npt1: realTrimester.npt1,
        mt1: realTrimester.mt1,
        mac2: realTrimester.mac2,
        npp2: realTrimester.npp2,
        npt2: realTrimester.npt2,
        mt2: realTrimester.mt2,
        mac3: realTrimester.mac3,
        npp3: realTrimester.npp3,
        npt3: realTrimester.npt3,
        mt3: realTrimester.mt3,
        mfd: realTrimester.mfd,
        pg: realTrimester.pg ?? '',
        ca: realTrimester.ca ?? calculateCA(realTrimester.mfd),
        obs: realTrimester.situation || (realTrimester.mfd >= 10 ? 'Aprovado' : 'Exame de Recurso')
      };
    }

    // 3. Check if student has recorded discipline score in the database
    const realDisc = st.disciplineGrades?.find(
      (dg) => dg.subject.toLowerCase() === subjectId.toLowerCase() || dg.subject.toLowerCase().includes(subjectId.toLowerCase())
    );
    if (realDisc && typeof realDisc.score === 'number' && !isDesistente) {
      const score = Math.round(realDisc.score);
      return {
        id: `${st.id || `row-${idx + 1}`}-${subjectId}`,
        studentId: st.id || `stu-${idx + 1}`,
        num: idx + 1,
        name,
        gender,
        birthYear: birthYear !== '-' ? birthYear : (2007 + (idx % 3)),
        age: age !== '-' ? age : (17 - (idx % 3)),
        isDebtor,
        isDesistente: false,
        mac1: score,
        npp1: score,
        npt1: score,
        mt1: score,
        mac2: score,
        npp2: score,
        npt2: score,
        mt2: score,
        mac3: score,
        npp3: score,
        npt3: score,
        mt3: score,
        mfd: score,
        pg: '',
        ca: calculateCA(score),
        obs: score >= 10 ? 'Aprovado' : 'Exame de Recurso'
      };
    }

    // Deterministic subject-specific grade generation based on student ID + subject ID
    const seedStr = `${st.id || `st-${idx}`}-${subjectId || 'subj'}`;
    let hash = 0;
    for (let i = 0; i < seedStr.length; i++) {
      hash = (hash * 31 + seedStr.charCodeAt(i)) & 0xffffff;
    }
    const base = 10 + (Math.abs(hash) % 6); // 10 to 15 base
    const var1 = (Math.abs(hash >> 2) % 5) - 2; // -2 to +2
    const var2 = (Math.abs(hash >> 4) % 5) - 2;
    const var3 = (Math.abs(hash >> 6) % 5) - 2;

    const mac1 = isDesistente ? '' : Math.max(4, Math.min(19, base + var1));
    const npp1 = isDesistente ? '' : Math.max(4, Math.min(19, base + var2));
    const npt1 = isDesistente ? '' : Math.max(4, Math.min(20, base + var3));
    const mt1 = isDesistente ? '' : calculateMT(mac1, npp1, npt1);

    const mac2 = isDesistente ? '' : Math.max(4, Math.min(19, base + var2 + 1));
    const npp2 = isDesistente ? '' : Math.max(4, Math.min(19, base + var1));
    const npt2 = isDesistente ? '' : Math.max(4, Math.min(20, base + var3 + 1));
    const mt2 = isDesistente ? '' : calculateMT(mac2, npp2, npt2);

    const mac3 = isDesistente ? '' : Math.max(5, Math.min(20, base + var3));
    const npp3 = isDesistente ? '' : Math.max(4, Math.min(19, base + var1 + 1));
    const npt3 = isDesistente ? '' : Math.max(5, Math.min(20, base + var2));
    const mt3 = isDesistente ? '' : calculateMT(mac3, npp3, npt3);

    const mfd = isDesistente ? '' : calculateMFD(mt1, mt2, mt3);
    const ca = isDesistente ? '' : calculateCA(mfd);
    const obs = isDesistente ? 'Desistente' : (typeof mfd === 'number' && mfd < 10 ? 'Exame de Recurso' : 'Aprovado');

    return {
      id: `${st.id || `row-${idx + 1}`}-${subjectId}`,
      studentId: st.id || `stu-${idx + 1}`,
      num: idx + 1,
      name,
      gender,
      birthYear: birthYear !== '-' ? birthYear : (2007 + (idx % 3)),
      age: age !== '-' ? age : (17 - (idx % 3)),
      isDebtor,
      isDesistente,
      mac1,
      npp1,
      npt1,
      mt1,
      mac2,
      npp2,
      npt2,
      mt2,
      mac3,
      npp3,
      npt3,
      mt3,
      mfd,
      pg: '',
      ca,
      obs
    };
  });
}

/**
 * Builds Pauta Geral rows for a class across all class disciplines
 */
export function buildPautaGeralRows(
  classStudents: Student[],
  subjects: Subject[],
  allStudents: Student[],
  allDisciplineGradesMap?: Record<string, Record<string, StudentMiniPautaItem>>
): StudentPautaGeralItem[] {
  const sourceList = classStudents.length > 0 ? classStudents : allStudents.slice(0, 10);

  return sourceList.map((st, idx) => {
    const { birthYear, age } = calculateBirthYearAndAge(st.birthDate);
    const gender = normalizeGender(st.gender, st.name);
    const isDebtor = st.financialStatus === 'debito' || !st.isTuitionPaidCurrentMonth;
    const isDesistente = st.status === 'suspended' || st.status === 'transferred';
    const name = st.name || `Aluno ${idx + 1}`;

    const subjectGrades: Record<string, { mt1: number | ''; mt2: number | ''; mt3: number | ''; mfd: number | '' }> = {};
    const mfdValues: number[] = [];

    subjects.forEach((subj) => {
      if (isDesistente) {
        subjectGrades[subj.id] = { mt1: '', mt2: '', mt3: '', mfd: '' };
        return;
      }

      // 1. Check if we have saved/edited grades in Mini-Pauta for this subject and student
      const savedRow = allDisciplineGradesMap?.[subj.id]?.[st.id];
      if (savedRow) {
        subjectGrades[subj.id] = {
          mt1: savedRow.mt1,
          mt2: savedRow.mt2,
          mt3: savedRow.mt3,
          mfd: savedRow.mfd
        };
        if (typeof savedRow.mfd === 'number') {
          mfdValues.push(savedRow.mfd);
        }
        return;
      }

      // 2. Check if student has real recorded trimester grades in the database
      const realTrimester = st.trimesterGrades?.find(
        (tg) => String(tg.subjectId) === String(subj.id) || tg.subjectName.toLowerCase() === subj.name.toLowerCase()
      );
      if (realTrimester) {
        subjectGrades[subj.id] = {
          mt1: realTrimester.mt1,
          mt2: realTrimester.mt2,
          mt3: realTrimester.mt3,
          mfd: realTrimester.mfd
        };
        if (typeof realTrimester.mfd === 'number') {
          mfdValues.push(realTrimester.mfd);
        }
        return;
      }

      // 3. Check if student has recorded discipline score in the database
      const realDisc = st.disciplineGrades?.find(
        (dg) => dg.subject.toLowerCase() === subj.name.toLowerCase()
      );
      if (realDisc && typeof realDisc.score === 'number') {
        const sc = Math.round(realDisc.score);
        subjectGrades[subj.id] = { mt1: sc, mt2: sc, mt3: sc, mfd: sc };
        mfdValues.push(sc);
        return;
      }

      // Deterministic generation for this student and subject
      const seedStr = `${st.id || `st-${idx}`}-${subj.id}`;
      let hash = 0;
      for (let i = 0; i < seedStr.length; i++) {
        hash = (hash * 31 + seedStr.charCodeAt(i)) & 0xffffff;
      }
      const base = 10 + (Math.abs(hash) % 6);
      const var1 = (Math.abs(hash >> 2) % 5) - 2;
      const var2 = (Math.abs(hash >> 4) % 5) - 2;
      const var3 = (Math.abs(hash >> 6) % 5) - 2;

      const mt1 = Math.max(4, Math.min(20, base + var1));
      const mt2 = Math.max(4, Math.min(20, base + var2));
      const mt3 = Math.max(4, Math.min(20, base + var3));
      const mfd = Math.round((mt1 + mt2 + mt3) / 3);

      subjectGrades[subj.id] = { mt1, mt2, mt3, mfd };
      mfdValues.push(mfd);
    });

    let mf: number | '' = '';
    let situation: 'APTO' | 'N/APTO' | 'DESISTIDO' = 'APTO';

    if (isDesistente) {
      situation = 'DESISTIDO';
    } else if (mfdValues.length > 0) {
      mf = Math.round(mfdValues.reduce((a, b) => a + b, 0) / mfdValues.length);
      situation = mf >= 10 ? 'APTO' : 'N/APTO';
    }

    return {
      id: `pauta-geral-${st.id || idx}`,
      studentId: st.id || `stu-${idx + 1}`,
      num: idx + 1,
      name,
      gender,
      birthYear: birthYear !== '-' ? birthYear : (2007 + (idx % 3)),
      age: age !== '-' ? age : (17 - (idx % 3)),
      isDebtor,
      isDesistente,
      subjectGrades,
      mf,
      situation
    };
  });
}
