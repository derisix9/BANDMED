import { SchoolDatabase, Subject, User } from '../types';

function normalizeText(text: string): string {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Returns the list of curricular disciplines available for a user.
 * For administrators and coordinators, all registered disciplines in the school database are shown.
 * For teachers (role === 'professor'), only the disciplines that they actually teach are shown.
 */
export function getAvailableSubjectsForUser(db: SchoolDatabase, currentUser?: User | null): Subject[] {
  const allSubjects = db.subjects || [];
  if (!currentUser || currentUser.role !== 'professor') {
    return allSubjects;
  }

  // Locate teacher profile in database
  const userEmail = normalizeText(currentUser.email);
  const userName = normalizeText(currentUser.name);
  const userProc = normalizeText(currentUser.processNumber || '');

  const teacher = (db.teachers || []).find(
    (t) =>
      t.id === currentUser.id ||
      (t.email && normalizeText(t.email) === userEmail) ||
      (t.name && normalizeText(t.name) === userName) ||
      (userProc && t.agentNumber && normalizeText(t.agentNumber) === userProc)
  );

  const taughtSubjectsList: { name: string; code?: string; classId?: string }[] = [];

  if (teacher) {
    // 1. From allocated classes
    (teacher.allocatedClasses || []).forEach((alloc) => {
      if (alloc.subject) {
        taughtSubjectsList.push({ name: alloc.subject, classId: alloc.classId });
      }
    });

    // 2. From timetable
    (db.timetable || []).forEach((item) => {
      if (item.teacherName && normalizeText(item.teacherName) === normalizeText(teacher.name)) {
        if (item.subject) {
          taughtSubjectsList.push({ name: item.subject, classId: item.classId });
        }
      }
    });
  } else {
    // Match against timetable by current user name
    (db.timetable || []).forEach((item) => {
      if (item.teacherName && normalizeText(item.teacherName) === userName) {
        if (item.subject) {
          taughtSubjectsList.push({ name: item.subject, classId: item.classId });
        }
      }
    });
  }

  const taughtNamesNormalized = new Set(taughtSubjectsList.map((t) => normalizeText(t.name)));

  // Filter existing registered subjects that match what this teacher teaches
  const matchedSubjects: Subject[] = allSubjects.filter((s) => {
    const sNameNorm = normalizeText(s.name);
    const sCodeNorm = normalizeText(s.code);

    if (taughtNamesNormalized.has(sNameNorm) || taughtNamesNormalized.has(sCodeNorm)) {
      return true;
    }

    for (const taught of taughtNamesNormalized) {
      if (!taught) continue;
      if (sNameNorm.includes(taught) || taught.includes(sNameNorm)) {
        return true;
      }
      // Common subject keywords
      const keywords = taught.split(/\s+/).filter((w) => w.length >= 4);
      if (keywords.some((k) => sNameNorm.includes(k))) {
        return true;
      }
    }

    // Also include if the teacher is the designated subject coordinator
    if (
      teacher &&
      s.coordinatorName &&
      (normalizeText(s.coordinatorName) === normalizeText(teacher.name) ||
        normalizeText(teacher.name).includes(normalizeText(s.coordinatorName)))
    ) {
      return true;
    }

    return false;
  });

  // If teacher has allocated subjects not yet formally in db.subjects, synthesize valid entries so they can be selected
  const seenNames = new Set(matchedSubjects.map((s) => normalizeText(s.name)));
  taughtSubjectsList.forEach((taught, idx) => {
    const tNorm = normalizeText(taught.name);
    if (!seenNames.has(tNorm) && !matchedSubjects.some((s) => normalizeText(s.name).includes(tNorm) || tNorm.includes(normalizeText(s.name)))) {
      seenNames.add(tNorm);
      matchedSubjects.push({
        id: `taught-sub-${idx + 1}-${tNorm.slice(0, 4)}`,
        name: taught.name,
        code: taught.name.slice(0, 3).toUpperCase(),
        cycle: 'Ensino Regular',
        weeklyHours: 4,
        status: 'Aprovada'
      });
    }
  });

  // Strictly return only what the teacher teaches. If none allocated, return empty array.
  return matchedSubjects;
}

/**
 * Returns the set of class IDs (as strings) a teacher is allocated to,
 * used to scope "Visualizar Processo Completo" (Módulo Alunos) to only the
 * teacher's own classes per a Matriz de Perfis & Permissões.
 * Returns null for non-teacher roles, meaning "no restriction to apply here".
 */
export function getAllocatedClassIdsForUser(db: SchoolDatabase, currentUser?: User | null): Set<string> | null {
  if (!currentUser || currentUser.role !== 'professor') {
    return null;
  }

  const userEmail = normalizeText(currentUser.email);
  const userName = normalizeText(currentUser.name);
  const userProc = normalizeText(currentUser.processNumber || '');

  const teacher = (db.teachers || []).find(
    (t) =>
      t.id === currentUser.id ||
      (t.email && normalizeText(t.email) === userEmail) ||
      (t.name && normalizeText(t.name) === userName) ||
      (userProc && t.agentNumber && normalizeText(t.agentNumber) === userProc)
  );

  const classIds = new Set<string>();

  if (teacher) {
    (teacher.allocatedClasses || []).forEach((alloc) => {
      if (alloc.classId) classIds.add(String(alloc.classId));
    });
    (db.timetable || []).forEach((item) => {
      if (item.teacherName && normalizeText(item.teacherName) === normalizeText(teacher.name) && item.classId) {
        classIds.add(String(item.classId));
      }
    });
  } else {
    (db.timetable || []).forEach((item) => {
      if (item.teacherName && normalizeText(item.teacherName) === userName && item.classId) {
        classIds.add(String(item.classId));
      }
    });
  }

  return classIds;
}

