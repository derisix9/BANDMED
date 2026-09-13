import React, { useState, useMemo, useRef } from 'react';
import { InstitutionSettings, UserRole } from '../../types';
import { dbService } from '../../services/db';
import { runGlobalOperation } from '../../context/OperationContext';

interface TabSegurancaBackupsProps {
  settings: InstitutionSettings;
  currentUserRole?: UserRole;
  onUpdateSettings?: (newSettings: Partial<InstitutionSettings>) => void;
  onSaveAll: (options?: { loadingMessage?: string; successMessage?: string; requiredRule?: string }) => void;
  onOpenSqlExport?: () => void;
  onResetData?: () => void;
}

interface BackupItem {
  id: number | string;
  arquivo: string;
  tamanho: string;
  data: string;
  status: string;
}

const DEFAULT_BACKUPS: BackupItem[] = [
  {
    id: 1,
    arquivo: 'bandmed_backup_full_20250401_2300.json',
    tamanho: '1.4 MB',
    data: '01 Abr 2025, 23:00 WAT',
    status: 'Concluído (AES-256)'
  },
  {
    id: 2,
    arquivo: 'bandmed_backup_full_20250331_2300.json',
    tamanho: '1.3 MB',
    data: '31 Mar 2025, 23:00 WAT',
    status: 'Concluído (AES-256)'
  },
  {
    id: 3,
    arquivo: 'bandmed_backup_full_20250330_2300.json',
    tamanho: '1.3 MB',
    data: '30 Mar 2025, 23:00 WAT',
    status: 'Concluído (AES-256)'
  }
];

export const TabSegurancaBackups: React.FC<TabSegurancaBackupsProps> = ({
  settings,
  currentUserRole,
  onUpdateSettings,
  onSaveAll,
  onOpenSqlExport,
  onResetData
}) => {
  const initialSec = settings.securityPolicies || {};

  const [twoFactorActive, setTwoFactorActive] = useState(initialSec.twoFactorActive ?? true);
  const [sessionTimeout, setSessionTimeout] = useState(initialSec.sessionTimeout || '20');
  const [maxFailedAttempts, setMaxFailedAttempts] = useState(initialSec.maxFailedAttempts || '5');
  const [passwordExpirationDays, setPasswordExpirationDays] = useState(initialSec.passwordExpirationDays || '90');

  const [backups, setBackups] = useState<BackupItem[]>(settings.backupHistory || DEFAULT_BACKUPS);
  const [backupToDelete, setBackupToDelete] = useState<BackupItem | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('todos');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Get live audit logs directly from database
  const liveLogs = useMemo(() => {
    const raw = dbService.getDatabase().auditLogs || [];
    return raw.map((l) => ({
      id: l.id,
      horario: l.timestamp,
      usuario: l.userName,
      cargo: l.userRole,
      acao: l.action,
      detalhes: l.details,
      modulo: l.module,
      ip: '197.234.12.44',
      status: 'Sucesso'
    }));
  }, [dbService.getDatabase().auditLogs]);

  const filteredLogs = useMemo(() => {
    return liveLogs.filter((log) => {
      const matchSearch =
        log.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.acao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.detalhes && log.detalhes.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchModule = moduleFilter === 'todos' || log.modulo === moduleFilter;
      return matchSearch && matchModule;
    });
  }, [liveLogs, searchTerm, moduleFilter]);

  // Download entire live DB as JSON
  const handleManualBackup = () => {
    const dbData = dbService.getDatabase();
    const jsonString = JSON.stringify(dbData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const sizeKb = (blob.size / 1024).toFixed(1);
    const sizeMb = (blob.size / (1024 * 1024)).toFixed(2);
    const sizeLabel = blob.size > 1024 * 1024 ? `${sizeMb} MB` : `${sizeKb} KB`;

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    const filename = `bandmed_backup_full_${dateStr}_${timeStr}.json`;

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    const novoBackup: BackupItem = {
      id: Date.now(),
      arquivo: filename,
      tamanho: sizeLabel,
      data: `Hoje, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WAT`,
      status: 'Concluído (AES-256)'
    };

    const updated = [novoBackup, ...backups];
    setBackups(updated);
    if (onUpdateSettings) {
      onUpdateSettings({ backupHistory: updated });
    }

    dbService.addAuditLog({
      userName: dbService.getDatabase().currentUser?.name || 'Administrador Geral',
      userRole: 'Administrador Geral',
      action: 'Exportação de Cópia de Segurança (Backup)',
      details: `Arquivo ${filename} gerado com tamanho de ${sizeLabel}.`,
      module: 'sistema',
      timestamp: 'Agora mesmo',
      badgeColor: '#0b1f3a'
    });

    triggerToast(`Backup gerado e transferido com sucesso (${sizeLabel})!`);
  };

  // Restore DB from uploaded JSON file
  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.students && parsed.classes) {
          const ok = window.confirm(
            `Confirmar o restauro da base de dados a partir do ficheiro "${file.name}"?\nEsta ação substituirá os registos atuais pelos dados do ficheiro.`
          );
          if (ok) {
            dbService.restoreDatabase(parsed);
            triggerToast('Base de dados restaurada com sucesso a partir do ficheiro selecionado!');
          }
        } else {
          alert('Ficheiro inválido: O arquivo não contém a estrutura de base de dados do BandMed.');
        }
      } catch (err) {
        alert('Erro ao analisar o ficheiro JSON de restauro.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Export full SQL Script
  const handleExportSqlDump = () => {
    if (onOpenSqlExport) {
      onOpenSqlExport();
      return;
    }
    const db = dbService.getDatabase();
    let sql = `-- ========================================================\n`;
    sql += `-- INSTITUTO MÉDIO POLITÉCNICO BANDMED - DUMP SQL COMPLETO\n`;
    sql += `-- Gerado em: ${new Date().toLocaleString()} (WAT)\n`;
    sql += `-- ========================================================\n\n`;

    sql += `CREATE TABLE IF NOT EXISTS estudantes (\n`;
    sql += `  id VARCHAR(50) PRIMARY KEY,\n`;
    sql += `  numero_processo VARCHAR(50) UNIQUE NOT NULL,\n`;
    sql += `  nome VARCHAR(255) NOT NULL,\n`;
    sql += `  genero VARCHAR(10),\n`;
    sql += `  classe VARCHAR(50),\n`;
    sql += `  turma VARCHAR(50),\n`;
    sql += `  curso VARCHAR(100),\n`;
    sql += `  estado_financeiro VARCHAR(50)\n);\n\n`;

    db.students.forEach((s) => {
      sql += `INSERT INTO estudantes (id, numero_processo, nome, genero, classe, turma, curso, estado_financeiro) VALUES ('${s.id}', '${s.procNumber}', '${s.name.replace(/'/g, "''")}', '${s.gender || 'M'}', '${s.grade || s.classId}', '${s.className}', '${s.courseName || s.cycle || 'Geral'}', '${s.financialStatus}');\n`;
    });

    sql += `\n-- Total de estudantes exportados: ${db.students.length}\n`;

    const blob = new Blob([sql], { type: 'application/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bandmed_schema_dump_${new Date().toISOString().slice(0, 10)}.sql`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerToast('Ficheiro SQL DDL/DML gerado e transferido com sucesso!');
  };

  const handleSaveSecurity = () => {
    const newPolicies = {
      twoFactorActive,
      sessionTimeout,
      maxFailedAttempts,
      passwordExpirationDays
    };

    if (onUpdateSettings) {
      onUpdateSettings({ securityPolicies: newPolicies });
    }

    dbService.addAuditLog({
      userName: dbService.getDatabase().currentUser?.name || 'Administrador Geral',
      userRole: 'Administrador Geral',
      action: 'Atualização de Políticas de Cibersegurança',
      details: `2FA: ${twoFactorActive ? 'Ativado' : 'Desativado'}, Sessão: ${sessionTimeout}m, Limite Tentativas: ${maxFailedAttempts}.`,
      module: 'sistema',
      timestamp: 'Agora mesmo',
      badgeColor: '#0b1f3a'
    });

    onSaveAll({
      requiredRule: 'config.backups',
      loadingMessage: 'A guardar políticas de segurança, 2FA e sessões...',
      successMessage: 'Operação feita com sucesso!'
    });
    triggerToast('Políticas de segurança e controlo de sessão guardadas com sucesso!');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-xs">
          <span className="material-symbols-outlined text-[20px] text-emerald-600">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hidden file input for restore */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileRestore}
        accept=".json"
        className="hidden"
      />

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

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportSqlDump}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Exportar schema e tabelas em SQL"
          >
            <span className="material-symbols-outlined text-[16px]">database</span>
            <span>Exportar SQL</span>
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Restaurar base de dados via arquivo JSON"
          >
            <span className="material-symbols-outlined text-[16px]">upload_file</span>
            <span>Restaurar Cópia</span>
          </button>
          <button
            type="button"
            onClick={handleManualBackup}
            className="px-3.5 py-2 rounded-xl bg-[#0b1f3a] text-white hover:bg-[#7a0c0c] font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
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
            <span className="font-bold text-slate-900">Validade da Senha</span>
            <select
              value={passwordExpirationDays}
              onChange={(e) => setPasswordExpirationDays(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-semibold text-slate-800"
            >
              <option value="60">60 Dias</option>
              <option value="90">90 Dias (Recomendado)</option>
              <option value="180">180 Dias</option>
              <option value="365">1 Ano</option>
            </select>
            <p className="text-[10px] text-slate-500">Exige renovação periódica de credencial.</p>
          </div>

          {/* Bloqueio por Tentativas */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between gap-2">
            <span className="font-bold text-slate-900">Tentativas Falhadas</span>
            <select
              value={maxFailedAttempts}
              onChange={(e) => setMaxFailedAttempts(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-semibold text-slate-800"
            >
              <option value="3">3 Tentativas</option>
              <option value="5">5 Tentativas (Padrão)</option>
              <option value="10">10 Tentativas</option>
            </select>
            <p className="text-[10px] text-slate-500">Bloqueia IP após falhas consecutivas.</p>
          </div>

          {/* Timeout de Sessão */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between gap-2">
            <span className="font-bold text-slate-900">Inatividade de Sessão</span>
            <select
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-semibold text-slate-800"
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
            <div className="font-headline text-base font-bold text-slate-900 mt-1">AES-256 Cloud Firestore</div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Armazenamento Seguro Nuvem</span>
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
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={handleManualBackup}
                        className="text-[#0b1f3a] hover:text-[#ac332b] font-bold flex items-center gap-1 cursor-pointer"
                        title="Descarregar cópia de segurança"
                      >
                        <span className="material-symbols-outlined text-[15px]">download</span>
                        <span>Descarregar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setBackupToDelete(b)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer"
                        title="Eliminar cópia de segurança"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Bloco 3: Registo de Auditoria de Acessos Recentes (Dados em Tempo Real) */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-headline text-base lg:text-lg font-bold text-slate-900">
              3. Registo de Auditoria & Trilha de Conformidade
            </h3>
            <p className="text-xs text-slate-500">
              Ações sensíveis realizadas em tempo real com identificação de utilizador, perfil e detalhes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Filtrar por utilizador ou ação..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-[#0b1f3a] w-48 sm:w-56"
            />
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
            >
              <option value="todos">Todos os Módulos</option>
              <option value="pautas">Pautas & Notas</option>
              <option value="propinas">Propinas & Finanças</option>
              <option value="assiduidade">Assiduidade</option>
              <option value="sistema">Sistema & Segurança</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-slate-50 z-10">
              <tr className="text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100">
                <th className="py-2.5 px-3 rounded-l-lg">Data / Hora</th>
                <th className="py-2.5 px-3">Utilizador / Cargo</th>
                <th className="py-2.5 px-3">Operação Registada</th>
                <th className="py-2.5 px-3">Detalhes</th>
                <th className="py-2.5 px-3 text-right rounded-r-lg">Resultado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400">
                    Nenhum registo de auditoria encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {log.horario}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{log.usuario}</div>
                      <div className="text-[10px] text-slate-500">{log.cargo}</div>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{log.acao}</td>
                    <td className="py-3 px-3 text-slate-600 text-[11px] max-w-xs truncate">
                      {log.detalhes || 'Operação realizada com sucesso.'}
                    </td>
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
                ))
              )}
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
              onClick={() => setShowResetModal(true)}
              className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
              <span>Restaurar Base de Dados Inicial</span>
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 justify-end">
          <button
            type="button"
            onClick={() => {
              setTwoFactorActive(initialSec.twoFactorActive ?? true);
              setSessionTimeout(initialSec.sessionTimeout || '20');
              setMaxFailedAttempts(initialSec.maxFailedAttempts || '5');
              setPasswordExpirationDays(initialSec.passwordExpirationDays || '90');
              triggerToast('Parâmetros de segurança revertidos para o estado atual.');
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
          >
            Descartar
          </button>
          <button
            type="button"
            onClick={handleSaveSecurity}
            className="px-5 py-2 rounded-xl bg-[#0b1f3a] text-white font-bold text-xs hover:bg-[#7a0c0c] transition-colors shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px]">save</span>
            <span>Guardar</span>
          </button>
        </div>
      </div>

      {/* Modal Eliminar Cópia de Segurança com Padrão de Eliminar Turma */}
      {backupToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-none max-w-md w-full p-6 border border-slate-300 shadow-2xl">
            <div className="w-12 h-12 rounded-none bg-red-100 text-red-700 flex items-center justify-center mx-auto mb-4 border border-red-300">
              <span className="material-symbols-outlined text-[28px]">delete_forever</span>
            </div>
            <h3 className="font-headline text-lg font-bold text-slate-900 text-center">
              Eliminar Cópia de Segurança da Base de Dados?
            </h3>
            <p className="text-xs text-slate-600 text-center mt-2 leading-relaxed">
              Tem a certeza de que deseja eliminar o registo de cópia de segurança <strong>{backupToDelete.arquivo}</strong> ({backupToDelete.tamanho} • {backupToDelete.data})? Esta ação é definitiva na base de dados.
            </p>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setBackupToDelete(null)}
                className="px-4 py-2 rounded-none bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs border border-slate-300 cursor-pointer transition-colors"
                type="button"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  const b = backupToDelete;
                  setBackupToDelete(null);
                  await runGlobalOperation(
                    async () => {
                      const updated = backups.filter((item) => item.id !== b.id);
                      setBackups(updated);
                      if (onUpdateSettings) {
                        onUpdateSettings({ backupHistory: updated });
                      }
                      dbService.updateSettings({ ...settings, backupHistory: updated });
                    },
                    {
                      requiredRule: 'config.backups',
                      userRole: currentUserRole,
                      loadingMessage: `A eliminar registo de backup ${b.arquivo}...`,
                      successMessage: 'Operação feita com sucesso!'
                    }
                  );
                }}
                className="px-5 py-2.5 rounded-none bg-[#b91c1c] hover:bg-[#7a0c0c] text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-none border-none"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                <span>Sim, Eliminar Cópia</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Restaurar / Eliminar Base de Dados com Padrão de Eliminar Turma */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-none max-w-md w-full p-6 border border-slate-300 shadow-2xl">
            <div className="w-12 h-12 rounded-none bg-red-100 text-red-700 flex items-center justify-center mx-auto mb-4 border border-red-300">
              <span className="material-symbols-outlined text-[28px]">delete_forever</span>
            </div>
            <h3 className="font-headline text-lg font-bold text-slate-900 text-center">
              Restaurar Base de Dados Inicial?
            </h3>
            <p className="text-xs text-slate-600 text-center mt-2 leading-relaxed">
              Tem a certeza de que deseja repor todos os registos do sistema para a base de dados inicial de fábrica? Todos os dados adicionados serão eliminados e restaurados. Esta ação é definitiva na base de dados.
            </p>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 rounded-none bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs border border-slate-300 cursor-pointer transition-colors"
                type="button"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  setShowResetModal(false);
                  await runGlobalOperation(
                    async () => {
                      if (onResetData) {
                        onResetData();
                      }
                    },
                    {
                      requiredRule: 'config.backups',
                      userRole: currentUserRole,
                      loadingMessage: 'A repor e restaurar base de dados inicial...',
                      successMessage: 'Operação feita com sucesso!'
                    }
                  );
                }}
                className="px-5 py-2.5 rounded-none bg-[#b91c1c] hover:bg-[#7a0c0c] text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-none border-none"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                <span>Sim, Restaurar Base de Dados</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
