import React, { useState } from 'react';
import { SchoolDatabase, SystemSettings, UserRole } from '../types';
import { dbService } from '../services/db';
import { runGlobalOperation } from '../context/OperationContext';
import { TabDadosInstituicao } from './configuracoes/TabDadosInstituicao';
import { TabAnoLetivo } from './configuracoes/TabAnoLetivo';
import { TabFinanceiro } from './configuracoes/TabFinanceiro';
import { TabRegrasNotas } from './configuracoes/TabRegrasNotas';
import { TabPerfisPermissoes } from './configuracoes/TabPerfisPermissoes';
import { TabIntegracoes } from './configuracoes/TabIntegracoes';
import { TabSegurancaBackups } from './configuracoes/TabSegurancaBackups';
import { TabUsuarios } from './configuracoes/TabUsuarios';

interface ConfiguracoesViewProps {
  db: SchoolDatabase;
  currentUserRole: UserRole;
  onOpenSqlExport?: () => void;
  onResetData: () => void;
}

export type SettingsTabId =
  | 'instituicao'
  | 'ano-letivo'
  | 'financeiro'
  | 'notas'
  | 'perfis'
  | 'integracoes'
  | 'seguranca-backups'
  | 'utilizadores';

interface NavModule {
  id: SettingsTabId;
  index: number;
  label: string;
  shortLabel: string;
  icon: string;
  badge?: string;
  subtitle: string;
}

const navModules: NavModule[] = [
  {
    id: 'instituicao',
    index: 1,
    label: '1. Dados da Instituição',
    shortLabel: 'Instituição',
    icon: 'apartment',
    badge: 'Ativo',
    subtitle: 'Sede, NIF, Alvará MED'
  },
  {
    id: 'ano-letivo',
    index: 2,
    label: '2. Ano Letivo & Calendário',
    shortLabel: 'Ano Letivo',
    icon: 'date_range',
    badge: '3 Trim.',
    subtitle: 'Trimestres, Pausas & Feriados'
  },
  {
    id: 'financeiro',
    index: 3,
    label: '3. Tabela Financeira & Emolumentos',
    shortLabel: 'Financeiro',
    icon: 'payments',
    badge: 'Kz AOA',
    subtitle: 'Propinas, Prazos & Multas'
  },
  {
    id: 'notas',
    index: 4,
    label: '4. Regras & Escala de Notas',
    shortLabel: 'Regras de Notas',
    icon: 'rule',
    badge: '0-20',
    subtitle: 'Ponderações & Escala Oficial'
  },
  {
    id: 'perfis',
    index: 5,
    label: '5. Perfis & Permissões (ACL / RBAC)',
    shortLabel: 'Perfis & ACL',
    icon: 'admin_panel_settings',
    badge: '5 Perfis',
    subtitle: 'Matriz de Acessos & Auditoria'
  },
  {
    id: 'integracoes',
    index: 6,
    label: '6. Integrações & AGT',
    shortLabel: 'Integrações',
    icon: 'hub',
    badge: 'EMIS / AGT',
    subtitle: 'Multicaixa Express, SAF-T & SMS'
  },
  {
    id: 'seguranca-backups',
    index: 7,
    label: '7. Segurança & Backups',
    shortLabel: 'Segurança & BD',
    icon: 'security',
    badge: 'AES-256',
    subtitle: '2FA, Auditoria & Cópias Seguras'
  },
  {
    id: 'utilizadores',
    index: 8,
    label: '8. Criação de Utilizadores',
    shortLabel: 'Utilizadores',
    icon: 'group_add',
    badge: 'RBAC',
    subtitle: 'Contas de Acesso & Atribuição de Perfis'
  }
];

export const ConfiguracoesView: React.FC<ConfiguracoesViewProps> = ({
  db,
  currentUserRole,
  onOpenSqlExport,
  onResetData
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTabId>('instituicao');
  const [settings, setSettings] = useState<SystemSettings>(db.settings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const currentIndex = navModules.findIndex((m) => m.id === activeTab);
  const currentModule = navModules[currentIndex] || navModules[0];

  const handleUpdateSettings = (newPartial: Partial<SystemSettings>) => {
    setSettings((prev) => ({ ...prev, ...newPartial }));
  };

  const handleSaveAll = async (options?: { loadingMessage?: string; successMessage?: string; requiredRule?: string }) => {
    return await runGlobalOperation(
      async () => {
        dbService.updateSettings(settings);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 4000);
      },
      {
        requiredRule: options?.requiredRule || 'config.edit',
        userRole: currentUserRole,
        loadingMessage: options?.loadingMessage || 'A gravar alterações nas configurações do sistema...',
        successMessage: options?.successMessage || 'Operação feita com sucesso!'
      }
    );
  };

  const handleSwitchTab = (tabId: SettingsTabId) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col w-full gap-5 pb-16">
      {/* Top Header Card */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1 text-xs">
            <span className="font-bold uppercase tracking-wider text-slate-500">
              Governação Institucional
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#0b1f3a]" />
            <span className="font-bold text-[#0b1f3a]">{settings.currentAcademicYear || '2024 / 2025'}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            <span className="font-bold text-[#ac332b]">Aba {currentModule.index} de 8: {currentModule.shortLabel}</span>
          </div>
          <h1 className="font-headline text-2xl lg:text-3xl font-extrabold text-[#0b1f3a] tracking-tight">
            Configurações do Sistema & Parâmetros
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Navegue pelas 8 abas administrativas para parametrizar a instituição, ano letivo, finanças, notas curriculares, acessos RBAC, integrações fiscais, segurança e criação de utilizadores.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => handleSaveAll()}
            className="px-5 py-2 rounded-xl bg-[#0b1f3a] hover:bg-[#7a0c0c] text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px]">save</span>
            <span>Guardar Alterações</span>
          </button>
        </div>
      </div>

      {/* Save Success Alert */}
      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in shadow-xs">
          <span className="material-symbols-outlined text-[20px] text-emerald-600">check_circle</span>
          <span>Todas as configurações institucionais foram sincronizadas e gravadas com sucesso no banco de dados!</span>
        </div>
      )}

      {/* 7 HORIZONTAL TABS BAR - Always directly above content, zero overlay, zero vertical shift */}
      <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between px-2 pb-2 mb-1 border-b border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
              Navegação das 7 Abas de Configuração
            </span>
            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#0b1f3a] font-mono text-[10px] font-bold">
              8 Módulos Oficiais
            </span>
          </div>
          <div className="text-[11px] text-slate-500 hidden sm:block">
            Clique na aba desejada para carregar imediatamente o seu conteúdo:
          </div>
        </div>

        {/* Scrollable container with visible tab buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar scroll-smooth">
          {navModules.map((m) => {
            const isActive = activeTab === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => handleSwitchTab(m.id)}
                className={`px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all shrink-0 flex items-center gap-2.5 cursor-pointer border ${
                  isActive
                    ? 'bg-[#0b1f3a] text-white border-[#0b1f3a] shadow-md scale-[1.01]'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80 hover:border-slate-300'
                }`}
                title={m.subtitle}
              >
                <span
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-[15px] shrink-0 ${
                    isActive ? 'bg-white/20 text-white' : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">{m.icon}</span>
                </span>

                <span className="whitespace-nowrap font-semibold">
                  {m.label}
                </span>

                {m.badge && (
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold shrink-0 ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {m.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ACTIVE TAB CONTENT CONTAINER - Directly below the tabs, full width, with pristine responsive layout */}
      <div className="w-full">
        {activeTab === 'instituicao' && (
          <TabDadosInstituicao
            settings={settings}
            currentUserRole={currentUserRole}
            onUpdateSettings={handleUpdateSettings}
            onSaveAll={handleSaveAll}
          />
        )}

        {activeTab === 'ano-letivo' && (
          <TabAnoLetivo
            settings={settings}
            currentUserRole={currentUserRole}
            onUpdateSettings={handleUpdateSettings}
            onSaveAll={handleSaveAll}
          />
        )}

        {activeTab === 'financeiro' && (
          <TabFinanceiro
            settings={settings}
            currentUserRole={currentUserRole}
            onUpdateSettings={handleUpdateSettings}
            onSaveAll={handleSaveAll}
          />
        )}

        {activeTab === 'notas' && (
          <TabRegrasNotas
            settings={settings}
            currentUserRole={currentUserRole}
            onUpdateSettings={handleUpdateSettings}
            onSaveAll={handleSaveAll}
          />
        )}

        {activeTab === 'perfis' && (
          <TabPerfisPermissoes
            settings={settings}
            currentUserRole={currentUserRole}
            onUpdateSettings={handleUpdateSettings}
            onSaveAll={handleSaveAll}
          />
        )}

        {activeTab === 'integracoes' && (
          <TabIntegracoes
            settings={settings}
            currentUserRole={currentUserRole}
            onSaveAll={handleSaveAll}
          />
        )}

        {activeTab === 'seguranca-backups' && (
          <TabSegurancaBackups
            settings={settings}
            currentUserRole={currentUserRole}
            onUpdateSettings={handleUpdateSettings}
            onSaveAll={handleSaveAll}
            onOpenSqlExport={onOpenSqlExport}
            onResetData={onResetData}
          />
        )}

        {activeTab === 'utilizadores' && (
          <TabUsuarios
            settings={settings}
            currentUserRole={currentUserRole}
            onUpdateSettings={handleUpdateSettings}
            onSaveAll={handleSaveAll}
          />
        )}
      </div>

      {/* Pagination Footer to jump between tabs easily */}
      <div className="flex items-center justify-center p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-center gap-1">
          {navModules.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => handleSwitchTab(m.id)}
              className={`w-7 h-7 rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                activeTab === m.id
                  ? 'bg-[#0b1f3a] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              title={m.label}
            >
              {m.index}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
