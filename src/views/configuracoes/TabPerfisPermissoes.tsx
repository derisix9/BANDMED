import React, { useState } from 'react';
import { InstitutionSettings } from '../../types';

interface TabPerfisPermissoesProps {
  settings: InstitutionSettings;
  onSaveAll: () => void;
}

type RoleKey = 'admin' | 'diretor' | 'secretaria' | 'professor' | 'aluno';

interface RoleDefinition {
  id: RoleKey;
  code: string;
  name: string;
  subtitle: string;
  usersCount: number;
  level: string;
  desc: string;
  permissions: {
    module: string;
    action: string;
    allowed: boolean;
    rule: string;
  }[];
}

const defaultRoles: Record<RoleKey, RoleDefinition> = {
  admin: {
    id: 'admin',
    code: 'BAND-ADM-01',
    name: 'Administrador Geral',
    subtitle: 'Acesso Total',
    usersCount: 3,
    level: 'Nível Executivo 1',
    desc: 'Supervisão técnica, acesso a todas as configurações de sistema, auditoria global, bases de dados e homologação financeira.',
    permissions: [
      { module: 'Módulo Alunos', action: 'Visualizar Processo Completo', allowed: true, rule: 'Acesso Irrestrito' },
      { module: 'Módulo Alunos', action: 'Criar Cadastro & Matrícula', allowed: true, rule: 'Acesso Irrestrito' },
      { module: 'Módulo Alunos', action: 'Editar Dados Sensíveis & BI', allowed: true, rule: 'Acesso Irrestrito' },
      { module: 'Módulo Alunos', action: 'Desativar / Transferir Aluno', allowed: true, rule: 'Acesso Irrestrito' },
      { module: 'Módulo Pautas & Notas', action: 'Lançar Notas Provisórias', allowed: true, rule: 'Acesso Irrestrito' },
      { module: 'Módulo Pautas & Notas', action: 'Homologar Pauta Trimestral Oficial', allowed: true, rule: 'Assinatura Digital Exigida' },
      { module: 'Módulo Pautas & Notas', action: 'Desbloquear Pauta Trancada', allowed: true, rule: 'Autorização com 2FA' },
      { module: 'Módulo Assiduidade', action: 'Registrar Faltas do Dia', allowed: true, rule: 'Acesso Irrestrito' },
      { module: 'Módulo Assiduidade', action: 'Justificar Faltas com Atestado', allowed: true, rule: 'Acesso Irrestrito' },
      { module: 'Módulo Propinas & Finanças', action: 'Registrar Pagamento Manual em Kz', allowed: true, rule: 'Acesso Irrestrito' },
      { module: 'Módulo Propinas & Finanças', action: 'Emitir Recibo Oficial AGT', allowed: true, rule: 'Acesso Irrestrito' },
      { module: 'Módulo Propinas & Finanças', action: 'Aplicar Desconto Social', allowed: true, rule: 'Acesso Irrestrito' },
      { module: 'Módulo Propinas & Finanças', action: 'Exportar SAF-T AO Mensal', allowed: true, rule: 'Acesso Irrestrito' },
      { module: 'Módulo Configurações', action: 'Modificar Parâmetros de Moeda & Escola', allowed: true, rule: 'Acesso Irrestrito' }
    ]
  },
  diretor: {
    id: 'diretor',
    code: 'BAND-DP-02',
    name: 'Diretor Pedagógico',
    subtitle: 'Curricular & Docentes',
    usersCount: 2,
    level: 'Nível Executivo 2',
    desc: 'Coordenação de turmas, aprovação de matrizes curriculares, homologação de pautas trimestrais e supervisão do corpo docente.',
    permissions: [
      { module: 'Módulo Alunos', action: 'Visualizar Processo Completo', allowed: true, rule: 'Acesso Geral' },
      { module: 'Módulo Alunos', action: 'Criar Cadastro & Matrícula', allowed: false, rule: 'Exclusivo da Secretaria' },
      { module: 'Módulo Alunos', action: 'Editar Dados Sensíveis & BI', allowed: true, rule: 'Com Justificativa' },
      { module: 'Módulo Alunos', action: 'Desativar / Transferir Aluno', allowed: true, rule: 'Requer Parecer do Conselho' },
      { module: 'Módulo Pautas & Notas', action: 'Lançar Notas Provisórias', allowed: true, rule: 'Supervisão' },
      { module: 'Módulo Pautas & Notas', action: 'Homologar Pauta Trimestral Oficial', allowed: true, rule: 'Assinatura Digital Exigida' },
      { module: 'Módulo Pautas & Notas', action: 'Desbloquear Pauta Trancada', allowed: true, rule: 'Autorização com 2FA' },
      { module: 'Módulo Assiduidade', action: 'Registrar Faltas do Dia', allowed: true, rule: 'Supervisão de Diários' },
      { module: 'Módulo Assiduidade', action: 'Justificar Faltas com Atestado', allowed: true, rule: 'Parecer Pedagógico' },
      { module: 'Módulo Propinas & Finanças', action: 'Registrar Pagamento Manual em Kz', allowed: false, rule: 'Exclusivo da Tesouraria' },
      { module: 'Módulo Propinas & Finanças', action: 'Emitir Recibo Oficial AGT', allowed: false, rule: 'Exclusivo da Tesouraria' },
      { module: 'Módulo Propinas & Finanças', action: 'Aplicar Desconto Social', allowed: true, rule: 'Parecer para Direção Geral' },
      { module: 'Módulo Propinas & Finanças', action: 'Exportar SAF-T AO Mensal', allowed: false, rule: 'Restrito à Contabilidade' },
      { module: 'Módulo Configurações', action: 'Modificar Parâmetros de Moeda & Escola', allowed: false, rule: 'Restrito ao Administrador' }
    ]
  },
  secretaria: {
    id: 'secretaria',
    code: 'BAND-SEC-03',
    name: 'Secretária / Tesouraria',
    subtitle: 'Matrículas & Propinas',
    usersCount: 5,
    level: 'Nível Executivo 3',
    desc: 'Atendimento ao público, emissão de declarações, cobrança de propinas, emissão de faturas AGT e matrículas de estudantes.',
    permissions: [
      { module: 'Módulo Alunos', action: 'Visualizar Processo Completo', allowed: true, rule: 'Acesso Geral' },
      { module: 'Módulo Alunos', action: 'Criar Cadastro & Matrícula', allowed: true, rule: 'Competência Primária' },
      { module: 'Módulo Alunos', action: 'Editar Dados Sensíveis & BI', allowed: true, rule: 'Requer Documento Comprovativo' },
      { module: 'Módulo Alunos', action: 'Desativar / Transferir Aluno', allowed: false, rule: 'Requer Despacho da Direção' },
      { module: 'Módulo Pautas & Notas', action: 'Lançar Notas Provisórias', allowed: false, rule: 'Restrito aos Professores' },
      { module: 'Módulo Pautas & Notas', action: 'Homologar Pauta Trimestral Oficial', allowed: false, rule: 'Restrito à Direção Pedagógica' },
      { module: 'Módulo Pautas & Notas', action: 'Desbloquear Pauta Trancada', allowed: false, rule: 'Restrito à Direção Pedagógica' },
      { module: 'Módulo Assiduidade', action: 'Registrar Faltas do Dia', allowed: false, rule: 'Restrito aos Professores' },
      { module: 'Módulo Assiduidade', action: 'Justificar Faltas com Atestado', allowed: true, rule: 'Receção e Anexo de Atestados' },
      { module: 'Módulo Propinas & Finanças', action: 'Registrar Pagamento Manual em Kz', allowed: true, rule: 'Competência Primária' },
      { module: 'Módulo Propinas & Finanças', action: 'Emitir Recibo Oficial AGT', allowed: true, rule: 'Competência Primária' },
      { module: 'Módulo Propinas & Finanças', action: 'Aplicar Desconto Social', allowed: false, rule: 'Requer Autorização da Direção' },
      { module: 'Módulo Propinas & Finanças', action: 'Exportar SAF-T AO Mensal', allowed: true, rule: 'Submissão Tributária' },
      { module: 'Módulo Configurações', action: 'Modificar Parâmetros de Moeda & Escola', allowed: false, rule: 'Restrito ao Administrador' }
    ]
  },
  professor: {
    id: 'professor',
    code: 'BAND-DOC-04',
    name: 'Professores / Corpo Docente',
    subtitle: 'Docentes & Turmas',
    usersCount: 28,
    level: 'Nível 4',
    desc: 'Lançamento de sumários diários, assiduidade de estudantes, inserção de mini-avaliações e provas trimestrais nas suas turmas.',
    permissions: [
      { module: 'Módulo Alunos', action: 'Visualizar Processo Completo', allowed: false, rule: 'Apenas Alunos das suas Turmas' },
      { module: 'Módulo Alunos', action: 'Criar Cadastro & Matrícula', allowed: false, rule: 'Restrito à Secretaria' },
      { module: 'Módulo Alunos', action: 'Editar Dados Sensíveis & BI', allowed: false, rule: 'Restrito à Secretaria' },
      { module: 'Módulo Alunos', action: 'Desativar / Transferir Aluno', allowed: false, rule: 'Restrito à Direção' },
      { module: 'Módulo Pautas & Notas', action: 'Lançar Notas Provisórias', allowed: true, rule: 'Apenas Disciplinas Atribuídas' },
      { module: 'Módulo Pautas & Notas', action: 'Homologar Pauta Trimestral Oficial', allowed: false, rule: 'Restrito à Direção Pedagógica' },
      { module: 'Módulo Pautas & Notas', action: 'Desbloquear Pauta Trancada', allowed: false, rule: 'Restrito à Direção Pedagógica' },
      { module: 'Módulo Assiduidade', action: 'Registrar Faltas do Dia', allowed: true, rule: 'No decorrer do tempo letivo' },
      { module: 'Módulo Assiduidade', action: 'Justificar Faltas com Atestado', allowed: false, rule: 'Restrito à Secretaria' },
      { module: 'Módulo Propinas & Finanças', action: 'Registrar Pagamento Manual em Kz', allowed: false, rule: 'Sem Acesso' },
      { module: 'Módulo Propinas & Finanças', action: 'Emitir Recibo Oficial AGT', allowed: false, rule: 'Sem Acesso' },
      { module: 'Módulo Propinas & Finanças', action: 'Aplicar Desconto Social', allowed: false, rule: 'Sem Acesso' },
      { module: 'Módulo Propinas & Finanças', action: 'Exportar SAF-T AO Mensal', allowed: false, rule: 'Sem Acesso' },
      { module: 'Módulo Configurações', action: 'Modificar Parâmetros de Moeda & Escola', allowed: false, rule: 'Sem Acesso' }
    ]
  },
  aluno: {
    id: 'aluno',
    code: 'BAND-ENC-05',
    name: 'Encarregado / Aluno',
    subtitle: 'Boletins & Faturas',
    usersCount: 1428,
    level: 'Nível Consulta',
    desc: 'Consulta de assiduidade do educando, visualização de notas trimestrais lançadas, histórico financeiro e guias de pagamento.',
    permissions: [
      { module: 'Módulo Alunos', action: 'Visualizar Processo Completo', allowed: false, rule: 'Apenas Perfil do Próprio Educando' },
      { module: 'Módulo Alunos', action: 'Criar Cadastro & Matrícula', allowed: false, rule: 'Sem Permissão' },
      { module: 'Módulo Alunos', action: 'Editar Dados Sensíveis & BI', allowed: false, rule: 'Sem Permissão' },
      { module: 'Módulo Alunos', action: 'Desativar / Transferir Aluno', allowed: false, rule: 'Sem Permissão' },
      { module: 'Módulo Pautas & Notas', action: 'Lançar Notas Provisórias', allowed: false, rule: 'Sem Permissão' },
      { module: 'Módulo Pautas & Notas', action: 'Homologar Pauta Trimestral Oficial', allowed: false, rule: 'Sem Permissão' },
      { module: 'Módulo Pautas & Notas', action: 'Desbloquear Pauta Trancada', allowed: false, rule: 'Sem Permissão' },
      { module: 'Módulo Assiduidade', action: 'Registrar Faltas do Dia', allowed: false, rule: 'Sem Permissão' },
      { module: 'Módulo Assiduidade', action: 'Justificar Faltas com Atestado', allowed: false, rule: 'Pode Solicitar Envio' },
      { module: 'Módulo Propinas & Finanças', action: 'Registrar Pagamento Manual em Kz', allowed: false, rule: 'Consulta de Faturas Apenas' },
      { module: 'Módulo Propinas & Finanças', action: 'Emitir Recibo Oficial AGT', allowed: false, rule: 'Apenas Download de Recibos' },
      { module: 'Módulo Propinas & Finanças', action: 'Aplicar Desconto Social', allowed: false, rule: 'Sem Permissão' },
      { module: 'Módulo Propinas & Finanças', action: 'Exportar SAF-T AO Mensal', allowed: false, rule: 'Sem Permissão' },
      { module: 'Módulo Configurações', action: 'Modificar Parâmetros de Moeda & Escola', allowed: false, rule: 'Sem Permissão' }
    ]
  }
};

export const TabPerfisPermissoes: React.FC<TabPerfisPermissoesProps> = ({ settings, onSaveAll }) => {
  const [selectedRoleKey, setSelectedRoleKey] = useState<RoleKey>('admin');
  const [rolesState, setRolesState] = useState<Record<RoleKey, RoleDefinition>>(defaultRoles);

  const currentRole = rolesState[selectedRoleKey];

  const togglePermission = (index: number) => {
    const updatedRole = { ...currentRole };
    updatedRole.permissions[index].allowed = !updatedRole.permissions[index].allowed;
    setRolesState({
      ...rolesState,
      [selectedRoleKey]: updatedRole
    });
  };

  const handleResetRole = () => {
    setRolesState({
      ...rolesState,
      [selectedRoleKey]: JSON.parse(JSON.stringify(defaultRoles[selectedRoleKey]))
    });
    alert(`Permissões do perfil ${currentRole.name} restauradas para o padrão institucional.`);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-[#0b1f3a] shrink-0">
              <span className="material-symbols-outlined text-[26px]">admin_panel_settings</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase tracking-wider text-[#ac332b] font-bold">Módulo 05</span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="text-[11px] text-slate-500 font-medium">Segurança & RBAC</span>
              </div>
              <h2 className="font-headline text-lg lg:text-xl font-bold text-slate-900">
                Matriz de Perfis & Permissões Granulares (ACL / RBAC)
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => alert('Duplicação de modelo de permissões: Novo perfil criado como cópia.')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">content_copy</span>
              <span>Duplicar Perfil</span>
            </button>
          </div>
        </div>

        {/* 5 Horizontal Sub-tabs / Role Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-slate-100">
          {(Object.keys(rolesState) as RoleKey[]).map((rKey) => {
            const role = rolesState[rKey];
            const isSelected = selectedRoleKey === rKey;
            return (
              <button
                key={rKey}
                type="button"
                onClick={() => setSelectedRoleKey(rKey)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 shrink-0 ${
                  isSelected
                    ? 'bg-[#0b1f3a] text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{role.name}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-white text-slate-600'
                  }`}
                >
                  {role.usersCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Perfil Active Detail Banner */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-blue-50 text-[#0b1f3a] font-mono text-[11px] font-bold">
              {currentRole.code}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-semibold">
              {currentRole.level}
            </span>
          </div>
          <h3 className="font-headline text-lg font-bold text-slate-900">{currentRole.name}</h3>
          <p className="text-xs text-slate-500 max-w-2xl mt-0.5">{currentRole.desc}</p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-center">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-slate-900">{currentRole.usersCount} Utilizadores</div>
            <div className="text-[11px] text-slate-500">Com esta credencial</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <span className="material-symbols-outlined text-[20px]">badge</span>
          </div>
        </div>
      </div>

      {/* Matriz Granular de Permissões */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-headline text-base lg:text-lg font-bold text-slate-900">
              Permissões Granulares por Módulo
            </h3>
            <p className="text-xs text-slate-500">
              Alterne os privilégios operacionais deste perfil no ecossistema escolar.
            </p>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            {currentRole.permissions.filter((p) => p.allowed).length} de {currentRole.permissions.length} Ativas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100">
                <th className="py-3 px-4 rounded-l-lg">Módulo do Sistema</th>
                <th className="py-3 px-4">Ação / Operação</th>
                <th className="py-3 px-4">Regra de Segurança</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-right rounded-r-lg">Interruptor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {currentRole.permissions.map((perm, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">{perm.module}</td>
                  <td className="py-3 px-4 text-slate-700 font-medium">{perm.action}</td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{perm.rule}</td>
                  <td className="py-3 px-4 text-center">
                    {perm.allowed ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        Autorizado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-bold text-[10px]">
                        Bloqueado
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => togglePermission(idx)}
                      className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer inline-block ${
                        perm.allowed ? 'bg-[#0b1f3a]' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-0.5 ${
                          perm.allowed ? 'right-0.5' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bento Box de Políticas Institucionais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] uppercase tracking-wider font-bold">2FA Obrigatório</span>
            <span className="material-symbols-outlined text-[20px] text-[#0b1f3a]">phonelink_lock</span>
          </div>
          <div className="mt-3">
            <div className="font-bold text-slate-900 text-sm">Exigido para Administradores e Diretores</div>
            <p className="text-xs text-slate-500 mt-1">
              Impede início de sessão sem validação OTP de 6 dígitos via app autenticadora.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] font-bold text-emerald-800">
            Status: Ativo
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] uppercase tracking-wider font-bold">IP Whitelist Local</span>
            <span className="material-symbols-outlined text-[20px] text-[#0b1f3a]">lan</span>
          </div>
          <div className="mt-3">
            <div className="font-bold text-slate-900 text-sm">Restrição da Rede da Secretaria</div>
            <p className="text-xs text-slate-500 mt-1">
              Acesso a lançamento de faturas e pagamentos condicionado à sub-rede 192.168.10.0/24.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] font-mono font-bold text-slate-700">
            192.168.10.0/24
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] uppercase tracking-wider font-bold">Trilha de Auditoria</span>
            <span className="material-symbols-outlined text-[20px] text-[#ac332b]">history_edu</span>
          </div>
          <div className="mt-3">
            <div className="font-bold text-slate-900 text-sm">100% Registo Imutável</div>
            <p className="text-xs text-slate-500 mt-1">
              Todas as notas alteradas e faturas emitidas guardam identificador, hora e IP do operador.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] font-bold text-emerald-800">
            Conforme AGT & MED
          </div>
        </div>
      </div>

      {/* Live Audit Stream Preview */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#0b1f3a] text-[22px]">history</span>
            <h3 className="font-headline text-base font-bold text-slate-900">
              Trilha de Auditoria Recente (RBAC Live Stream)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            STREAM ATIVO
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-blue-700 text-[18px]">edit_note</span>
              <div>
                <span className="font-bold text-slate-900">Alteração de Nota MAC (Matemática - 10ª A)</span>
                <span className="text-slate-500 ml-2">por Prof. João Figueiredo (BAND-DOC-04)</span>
              </div>
            </div>
            <div className="text-right font-mono text-[11px] text-slate-500">
              Hoje, 14:12 • IP: 192.168.10.45
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-emerald-700 text-[18px]">receipt_long</span>
              <div>
                <span className="font-bold text-slate-900">Emissão de Recibo AGT #0942 (Propina 75.000 Kz)</span>
                <span className="text-slate-500 ml-2">por Tesouraria (BAND-SEC-03)</span>
              </div>
            </div>
            <div className="text-right font-mono text-[11px] text-slate-500">
              Hoje, 11:30 • IP: 192.168.10.12
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#ac332b] text-[18px]">lock_reset</span>
              <div>
                <span className="font-bold text-slate-900">Ativação de Credencial 2FA</span>
                <span className="text-slate-500 ml-2">por Direção Pedagógica (BAND-DP-02)</span>
              </div>
            </div>
            <div className="text-right font-mono text-[11px] text-slate-500">
              Ontem, 16:50 • IP: 197.234.12.18
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 text-slate-500 text-xs">
          <span className="material-symbols-outlined text-slate-400">shield</span>
          <span>Alterações de permissões são aplicadas a todas as sessões ativas na próxima renovação de token.</span>
        </div>
        <div className="flex items-center gap-2 justify-end">
          <button
            type="button"
            onClick={handleResetRole}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
          >
            Restaurar Padrão do Perfil
          </button>
          <button
            type="button"
            onClick={onSaveAll}
            className="px-5 py-2 rounded-xl bg-[#0b1f3a] text-white font-bold text-xs hover:bg-[#7a0c0c] transition-colors shadow-md flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[17px]">save</span>
            <span>Guardar Permissões</span>
          </button>
        </div>
      </div>
    </div>
  );
};
