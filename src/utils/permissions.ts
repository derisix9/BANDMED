import { UserRole } from '../types';
import { dbService } from '../services/db';

export type RoleKey = 'admin' | 'director' | 'secretaria' | 'professor' | 'financeiro';

export interface RolePermissionItem {
  module: string;
  action: string;
  rule: string;
  allowed: boolean;
}

export interface RoleDefinition {
  name: string;
  code: string;
  level: string;
  desc: string;
  usersCount: number;
  permissions: RolePermissionItem[];
}

export const defaultPermissionsList: Omit<RolePermissionItem, 'allowed'>[] = [
  // Alunos & Matrículas
  { module: 'Alunos & Matrículas', action: 'Criar e Matricular Novos Estudantes', rule: 'alunos.create' },
  { module: 'Alunos & Matrículas', action: 'Editar Processo Biográfico e Filiação', rule: 'alunos.edit' },
  { module: 'Alunos & Matrículas', action: 'Emitir Ficha Biográfica e Cartão Estudante', rule: 'alunos.print_docs' },
  { module: 'Alunos & Matrículas', action: 'Eliminar ou Transferir Aluno', rule: 'alunos.delete' },

  // Pautas & Avaliações
  { module: 'Pautas & Avaliações', action: 'Lançar e Editar Avaliações Contínuas (MAC/NPP/NPT)', rule: 'pautas.edit_notas' },
  { module: 'Pautas & Avaliações', action: 'Importar Mini-Pautas via Ficheiro Excel', rule: 'pautas.import_excel' },
  { module: 'Pautas & Avaliações', action: 'Homologar Pautas Finais e Trancar Trimestre', rule: 'pautas.homologar' },
  { module: 'Pautas & Avaliações', action: 'Reabertura e Desbloqueio de Pautas', rule: 'pautas.unlock' },

  // Tesouraria & Propinas
  { module: 'Tesouraria & Propinas', action: 'Liquidar Mensalidades e Emitir Recibos Oficiais', rule: 'propinas.liquidate' },
  { module: 'Tesouraria & Propinas', action: 'Aplicar Isenções, Bolsas e Descontos', rule: 'propinas.discounts' },
  { module: 'Tesouraria & Propinas', action: 'Anular e Cancelar Faturas/Recibos Emitidos', rule: 'propinas.cancel' },
  { module: 'Tesouraria & Propinas', action: 'Consultar Relatórios Financeiros e Fecho de Caixa', rule: 'propinas.reports' },

  // Assiduidade & Aulas
  { module: 'Assiduidade & Aulas', action: 'Efetuar Chamada e Marcar Faltas Diárias', rule: 'assiduidade.mark' },
  { module: 'Assiduidade & Aulas', action: 'Justificar Faltas com Atestado Médico/Documento', rule: 'assiduidade.justify' },

  // Corpo Docente & Turmas
  { module: 'Docência & Turmas', action: 'Atribuir Disciplinas e Cargas Horárias a Professores', rule: 'professores.assign' },
  { module: 'Docência & Turmas', action: 'Criar Novas Turmas e Definir Capacidade', rule: 'turmas.manage' },

  // Configurações & Segurança
  { module: 'Configurações Globais', action: 'Parametrizar Dados da Instituição e Assinaturas', rule: 'config.institution' },
  { module: 'Configurações Globais', action: 'Gerir Perfis de Utilizadores e Matriz ACL', rule: 'config.permissions' },
  { module: 'Configurações Globais', action: 'Executar e Restaurar Cópias de Segurança (Backup)', rule: 'config.backups' },
];

export const defaultRoles: Record<RoleKey, RoleDefinition> = {
  admin: {
    name: 'Administrador Geral',
    code: 'ADM-01',
    level: 'Nível 1 - Acesso Total',
    desc: 'Acesso irrestrito a configurações de sistema, parametrização institucional, auditoria forense e gestão global de acessos.',
    usersCount: 2,
    permissions: defaultPermissionsList.map((p) => ({ ...p, allowed: true }))
  },
  director: {
    name: 'Direção Pedagógica',
    code: 'DIR-02',
    level: 'Nível 2 - Pedagógico & Pautas',
    desc: 'Supervisão pedagógica, homologação e trancamento de pautas, aprovação de quadros de honra e gestão do corpo docente.',
    usersCount: 4,
    permissions: defaultPermissionsList.map((p) => ({
      ...p,
      allowed: !['propinas.cancel', 'config.backups'].includes(p.rule)
    }))
  },
  secretaria: {
    name: 'Secretaria Escolar',
    code: 'SEC-03',
    level: 'Nível 3 - Gestão Administrativa',
    desc: 'Inscrições, matrículas, processos biográficos, emissão de declarações, cartões de estudante e atendimento geral.',
    usersCount: 6,
    permissions: defaultPermissionsList.map((p) => ({
      ...p,
      allowed: [
        'alunos.create',
        'alunos.edit',
        'alunos.print_docs',
        'assiduidade.justify',
        'propinas.liquidate',
        'propinas.reports'
      ].includes(p.rule)
    }))
  },
  professor: {
    name: 'Corpo Docente',
    code: 'DOC-04',
    level: 'Nível 4 - Lançamento & Faltas',
    desc: 'Lançamento de notas em mini-pautas, importação Excel das suas disciplinas atribuídas e registo de presenças diárias.',
    usersCount: 28,
    permissions: defaultPermissionsList.map((p) => ({
      ...p,
      allowed: [
        'pautas.edit_notas',
        'pautas.import_excel',
        'assiduidade.mark'
      ].includes(p.rule)
    }))
  },
  financeiro: {
    name: 'Tesouraria & Finanças',
    code: 'FIN-05',
    level: 'Nível 3 - Controlo Financeiro',
    desc: 'Cobrança de propinas, emolumentos, emissão de faturas-recibo, aplicação de políticas de mora e fechos de caixa.',
    usersCount: 3,
    permissions: defaultPermissionsList.map((p) => ({
      ...p,
      allowed: [
        'propinas.liquidate',
        'propinas.discounts',
        'propinas.cancel',
        'propinas.reports',
        'alunos.print_docs'
      ].includes(p.rule)
    }))
  }
};

/**
 * Checks if a given role has permission to execute an action.
 * If permission is explicitly disabled (allowed: false), returns false.
 */
export function hasPermission(
  role: string | UserRole | undefined,
  rule: string,
  customRoles?: Record<string, RoleDefinition>
): boolean {
  if (!role) return false;

  // Retrieve stored permissions from settings if not passed
  let rolesStore = customRoles;
  if (!rolesStore && typeof window !== 'undefined') {
    try {
      const activeRoles = dbService?.getDatabase()?.settings?.rolePermissions;
      if (activeRoles && Object.keys(activeRoles).length > 0) {
        rolesStore = { ...defaultRoles, ...activeRoles };
      }
    } catch {
      // fallback to defaultRoles
    }
  }
  if (!rolesStore) {
    rolesStore = defaultRoles;
  }

  const roleKey = role as RoleKey;
  const roleDef = rolesStore[roleKey] || defaultRoles[roleKey];

  if (!roleDef) {
    // Read-only access for other roles
    if (rule.endsWith('.view') || rule.endsWith('.read')) return true;
    return false;
  }

  const permission = roleDef.permissions?.find((p) => p.rule === rule);
  if (permission !== undefined) {
    return permission.allowed === true;
  }

  // If the rule is not explicitly present in permissions:
  if (role === 'admin') return true;
  return false;
}
