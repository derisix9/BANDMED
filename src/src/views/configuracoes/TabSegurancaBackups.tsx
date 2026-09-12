import React, { useState } from 'react';
import { InstitutionSettings } from '../../types';

interface TabSegurancaBackupsProps {
  settings: InstitutionSettings;
  onSaveAll: () => void;
  onOpenSqlExport?: () => void;
  onResetData?: () => void;
}

export const TabSegurancaBackups: React.FC<TabSegurancaBackupsProps> = ({
  onSaveAll,
  onOpenSqlExport,
  onResetData
}) => {
  const [twoFactorActive, setTwoFactorActive] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('20');
  const [maxFailedAttempts, setMaxFailedAttempts] = useState('5');
  const [passwordExpirationDays, setPasswordExpirationDays] = useState('90');

  const [backups, setBackups] = useState([
    {
      id: 1,
      arquivo: 'bandmed_backup_full_20250401_2300.enc',
      tamanho: '412 MB',
      data: '01 Abr 2025, 23:00 WAT',
      status: 'Concluído (AES-256)'
    },
    {
      id: 2,
      arquivo: 'bandmed_backup_full_20250331_2300.enc',
      tamanho: '408 MB',
      data: '31 Mar 2025, 23:00 WAT',
      status: 'Concluído (AES-256)'
    },
    {
      id: 3,
      arquivo: 'bandmed_backup_full_20250330_2300.enc',
      tamanho: '405 MB',
      data: '30 Mar 2025, 23:00 WAT',
      status: 'Concluído (AES-256)'
    }
  ]);

  const auditLogs = [
    {
      id: 1,
      horario: 'Hoje, 14:15 WAT',
      usuario: 'Dr. Mateus João (Diretor)',
      acao: 'Homologação de Pautas do 2.º Trimestre',
      ip: '197.234.12.44',
      status: 'Sucesso'
    },
    {
      id: 2,
      horario: 'Hoje, 11:30 WAT',
      usuario: 'Helena Afonso (Tesouraria)',
      acao: 'Emissão de Guia de Liquidação de Propinas #1042',
      ip: '197.234.12.18',
      status: 'Sucesso'
    },
    {
      id: 3,
      horario: 'Ontem, 16:48 WAT',
      usuario: 'Prof. Alberto Gusmão',
      acao: 'Lançamento de Notas MAC - 10ª Classe Turma A',
      ip: '192.168.10.82',
      status: 'Sucesso'
    },
    {
      id: 4,
      horario: 'Ontem, 09:20 WAT',
      usuario: 'IP Desconhecido',
      acao: 'Tentativa de Login Falhada (Senha Incorreta)',
      ip: '41.223.119.5',
      status: 'Bloqueado'
    }
  ];

  const handleManualBackup = () => {
    const novoBackup = {
      id: Date.now(),
      arquivo: `bandmed_backup_${new Date().toISOString().slice(0, 10)}.enc`,
      tamanho: '414 MB',
      data: 'Agora mesmo (WAT)',
      status: 'Concluído (AES-256)'
    };
    setBackups([novoBackup, ...backups]);
    alert('Cópia de segurança encriptada gerada com sucesso no cofre de dados!');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-[#0b1f3a] shrink-0">
            <span className="material-symbols-outlined text-[26px]">security</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider text-[#ac332b] font-bold">Módulo 07</span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span className="text-[11px] text-slate-500 font-medium">Segurança, Backups & Auditoria</span>
            </div>
            <h2 className="font-headline text-lg lg:text-xl font-bold text-slate-900">
              Políticas de Acesso, Cópia de Segurança & Registos
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleManualBackup}
            className="px-3.5 py-2 rounded-xl bg-[#0b1f3a] text-white hover:bg-[#7a0c0c] font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs self-start"
          >
            <span className="material-symbols-outlined text-[16px]">cloud_sync</span>
            <span>Gerar Backup Agora</span>
          </button>
        </div>
      </div>

      {/* Bloco 1: Políticas de Acesso & Cibersegurança */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-4">
        <div className="pb-3 border-b border-slate-100">
          <h3 className="font-headline text-base lg:text-lg font-bold text-slate-900">
            1. Políticas de Cibersegurança & Controlo de Sessão
          </h3>
          <p className="text-xs text-slate-500">
            Requisitos de acesso aos módulos críticos (pautas, faturas e lançamentos oficiais de notas).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* 2FA */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">Autenticação 2FA</span>
              <button
                type="button"
                onClick={() => setTwoFactorActive(!twoFactorActive)}
                className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                  twoFactorActive ? 'bg-[#0b1f3a]' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-0.5 ${
                    twoFactorActive ? 'right-0.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
            <p className="text-slate-500 text-[11px]">
              Obrigatório para Admin Geral e Direção Pedagógica.
            </p>
            <span className="text-[10px] font-mono text-emerald-800 font-bold">
              {twoFactorActive ? 'ATIVADO (Código OTP)' : 'DESATIVADO'}
            </span>
          </div>

          {/* Expiração de Senhas */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between gap-2">
            <span className="font-bold text-slate-900">Ciclo de Senhas (Dias)</span>
            <select
              value={passwordExpirationDays}
              onChange={(e) => setPasswordExpirationDays(e.target.value)}
              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
            >
              <option value="60">60 Dias (Muito Estrito)</option>
              <option value="90">90 Dias (Recomendado)</option>
              <option value="180">180 Dias</option>
              <option value="0">Nunca Expirar</option>
            </select>
            <p className="text-[10px] text-slate-500">Histórico de 5 senhas anteriores bloqueado.</p>
          </div>

          {/* Bloqueio de Tentativas */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between gap-2">
            <span className="font-bold text-slate-900">Tentativas Falhadas</span>
            <select
              value={maxFailedAttempts}
              onChange={(e) => setMaxFailedAttempts(e.target.value)}
              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
            >
              <option value="3">3 Tentativas (Bloqueio 30 min)</option>
              <option value="5">5 Tentativas (Recomendado)</option>
              <option value="10">10 Tentativas</option>
            </select>
            <p className="text-[10px] text-slate-500">Protege contra ataques de força bruta.</p>
          </div>

          {/* Timeout de Sessão */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between gap-2">
            <span className="font-bold text-slate-900">Inatividade de Sessão</span>
            <select
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(e.target.value)}
              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
            >
              <option value="15">15 Minutos</option>
              <option value="20">20 Minutos (Padrão)</option>
              <option value="30">30 Minutos</option>
              <option value="60">60 Minutos</option>
            </select>
            <p className="text-[10px] text-slate-500">Bloqueia ecrã automaticamente.</p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-bold text-slate-900 block">Sub-redes Autorizadas da Secretaria (IP Whitelist)</span>
            <span className="text-slate-500 text-[11px]">
              Acesso à emissão de pautas e recibos restrito aos computadores da rede interna da instituição.
            </span>
          </div>
          <span className="font-mono text-xs bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-slate-800 font-bold shrink-0">
            197.234.12.0/24 • 192.168.10.0/24
          </span>
        </div>
      </section>

      {/* Bloco 2: Cópias de Segurança & Resiliência de Dados */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-headline text-base lg:text-lg font-bold text-slate-900">
              2. Cópias de Segurança Automáticas & Cofre Imutável
            </h3>
            <p className="text-xs text-slate-500">
              Instantâneos encriptados com AES-256 e retenção histórica para conformidade com a legislação angolana.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[11px] font-bold">
              ESTADO: 100% OPERACIONAL
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-500 text-[11px] uppercase font-bold">Frequência Automática</span>
            <div className="font-headline text-base font-bold text-slate-900 mt-1">Diário às 23:00 WAT</div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Próximo: Hoje às 23:00</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-500 text-[11px] uppercase font-bold">Imutabilidade Histórica</span>
            <div className="font-headline text-base font-bold text-slate-900 mt-1">10 Anos de Retenção</div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Legislação Escolar MED</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-500 text-[11px] uppercase font-bold">Cofre Criptográfico</span>
            <div className="font-headline text-base font-bold text-slate-900 mt-1">AES-256 (34.2 GB / 200 GB)</div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Armazenamento Local & Nuvem</span>
          </div>
        </div>

        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100">
                <th className="py-2.5 px-3 rounded-l-lg">Arquivo de Backup</th>
                <th className="py-2.5 px-3">Tamanho</th>
                <th className="py-2.5 px-3">Data e Hora (WAT)</th>
                <th className="py-2.5 px-3">Estado</th>
                <th className="py-2.5 px-3 text-right rounded-r-lg">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {backups.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 font-mono font-semibold text-slate-900">{b.arquivo}</td>
                  <td className="py-3 px-3 font-mono text-slate-600">{b.tamanho}</td>
                  <td className="py-3 px-3 text-slate-600">{b.data}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold">
                      {b.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => alert(`Download iniciado para o arquivo seguro ${b.arquivo}.`)}
                      className="text-[#0b1f3a] hover:text-[#ac332b] font-bold flex items-center gap-1 ml-auto"
                    >
                      <span className="material-symbols-outlined text-[15px]">download</span>
                      <span>Descarregar</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Bloco 3: Registo de Auditoria de Acessos Recentes */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-4">
        <div className="pb-3 border-b border-slate-100">
          <h3 className="font-headline text-base lg:text-lg font-bold text-slate-900">
            3. Registo de Auditoria & Trilha de Conformidade
          </h3>
          <p className="text-xs text-slate-500">
            Ações sensíveis realizadas recentemente no sistema escolar com identificação de utilizador e IP.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100">
                <th className="py-2.5 px-3 rounded-l-lg">Data / Hora</th>
                <th className="py-2.5 px-3">Utilizador</th>
                <th className="py-2.5 px-3">Operação Registada</th>
                <th className="py-2.5 px-3">Endereço IP</th>
                <th className="py-2.5 px-3 text-right rounded-r-lg">Resultado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">{log.horario}</td>
                  <td className="py-3 px-3 font-semibold text-slate-900">{log.usuario}</td>
                  <td className="py-3 px-3 text-slate-700">{log.acao}</td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-500">{log.ip}</td>
                  <td className="py-3 px-3 text-right">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.status === 'Sucesso'
                          ? 'bg-emerald-50 text-emerald-800'
                          : 'bg-red-50 text-red-800'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Footer com Ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          {onResetData && (
            <button
              type="button"
              onClick={onResetData}
              className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
              <span>Restaurar Base de Dados Inicial</span>
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 justify-end">
          <button
            type="button"
            onClick={() => alert('Parâmetros de segurança revertidos para o estado atual.')}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
          >
            Descartar
          </button>
          <button
            type="button"
            onClick={onSaveAll}
            className="px-5 py-2 rounded-xl bg-[#0b1f3a] text-white font-bold text-xs hover:bg-[#7a0c0c] transition-colors shadow-md flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[17px]">save</span>
            <span>Guardar Configurações de Segurança</span>
          </button>
        </div>
      </div>
    </div>
  );
};
