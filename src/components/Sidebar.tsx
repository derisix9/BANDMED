import React from 'react';
import { UserRole } from '../types';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  currentUserRole: UserRole;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  isDesktopOpen?: boolean;
  onToggleDesktop?: (open?: boolean) => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  currentUserRole,
  isMobileOpen,
  onCloseMobile,
  isDesktopOpen = true,
  onToggleDesktop,
  onLogout
}) => {
  const isAllowed = (roles: UserRole[]) => roles.includes(currentUserRole);

  const navItemClass = (viewId: string) => {
    const active = currentView === viewId;
    return active
      ? 'flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white text-[#0b1f3a] font-bold shadow-md transition-all'
      : 'flex items-center gap-3 px-3.5 py-2 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition-all text-sm font-medium';
  };

  const navItemIconClass = (viewId: string) => {
    return currentView === viewId ? 'text-[#0b1f3a]' : 'text-slate-400 group-hover:text-white';
  };

  const roleBadgeLabel: Record<UserRole, string> = {
    admin: 'Admin',
    director: 'Direção',
    secretaria: 'Secretaria',
    professor: 'Docente',
    financeiro: 'Tesouraria',
    aluno: 'Aluno',
    encarregado: 'Encarregado'
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      {/* Main Aside - Supports desktop & fullscreen toggle with smooth transition */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-[#0b1f3a] text-white z-50 flex flex-col justify-between shadow-2xl transition-transform duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          isDesktopOpen ? 'lg:translate-x-0' : 'lg:-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Brand Header */}
          <div className="h-16 px-4 flex items-center justify-between bg-black/20 border-b border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center p-1 shadow-sm shrink-0 overflow-hidden">
                <img
                  src="/school_emblem.png"
                  alt="BandMed Emblema"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-white font-headline">BANDMED</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider bg-[#7a0c0c] text-white">
                    {roleBadgeLabel[currentUserRole] || 'Utilizador'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 tracking-wider uppercase font-medium">Plataforma Académica</span>
              </div>
            </div>
            <button
              onClick={() => {
                if (onToggleDesktop) onToggleDesktop(false);
                onCloseMobile();
              }}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/15 bg-white/5 cursor-pointer flex items-center justify-center transition-colors"
              title="Fechar menu lateral"
              aria-label="Fechar menu lateral"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-4 flex-1">
            {/* GERAL: Dashboard ONLY for Admin, Direção Pedagógica and Secretaria. (Docentes, Alunos e Encarregados NÃO TÊM ACESSO AO DASHBOARD) */}
            {isAllowed(['admin', 'director', 'secretaria']) && (
              <div>
                <span className="px-3 text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1">
                  GERAL
                </span>
                <button
                  onClick={() => { onNavigate('dashboard'); onCloseMobile(); }}
                  className={`w-full text-left cursor-pointer ${navItemClass('dashboard')}`}
                >
                  <span className={`material-symbols-outlined text-[20px] ${navItemIconClass('dashboard')}`}>
                    dashboard
                  </span>
                  <span>Dashboard</span>
                </button>
              </div>
            )}

            {/* SEÇÃO DO ESTUDANTE: APENAS PARA O PERFIL ALUNO */}
            {currentUserRole === 'aluno' && (
              <div>
                <span className="px-3 text-[10px] uppercase font-bold tracking-widest text-amber-400 block mb-1">
                  ÁREA DO ESTUDANTE
                </span>
                <div className="space-y-1">
                  <button
                    onClick={() => { onNavigate('aluno_notas'); onCloseMobile(); }}
                    className={`w-full text-left cursor-pointer ${navItemClass('aluno_notas')}`}
                  >
                    <span className={`material-symbols-outlined text-[20px] ${navItemIconClass('aluno_notas')}`}>
                      assignment
                    </span>
                    <span>Suas Notas (Boletim)</span>
                  </button>

                  <button
                    onClick={() => { onNavigate('aluno_financeiro'); onCloseMobile(); }}
                    className={`w-full text-left cursor-pointer ${navItemClass('aluno_financeiro')}`}
                  >
                    <span className={`material-symbols-outlined text-[20px] ${navItemIconClass('aluno_financeiro')}`}>
                      account_balance_wallet
                    </span>
                    <span>Situação Financeira</span>
                  </button>
                </div>
              </div>
            )}

            {/* SEÇÃO DO ENCARREGADO: APENAS SITUAÇÃO FINANCEIRA DO ESTUDANTE */}
            {currentUserRole === 'encarregado' && (
              <div>
                <span className="px-3 text-[10px] uppercase font-bold tracking-widest text-amber-400 block mb-1">
                  PORTAL DO ENCARREGADO
                </span>
                <div className="space-y-1">
                  <button
                    onClick={() => { onNavigate('encarregado_financeiro'); onCloseMobile(); }}
                    className={`w-full text-left cursor-pointer ${navItemClass('encarregado_financeiro')}`}
                  >
                    <span className={`material-symbols-outlined text-[20px] ${navItemIconClass('encarregado_financeiro')}`}>
                      payments
                    </span>
                    <span>Situação Financeira do Estudante</span>
                  </button>
                </div>
              </div>
            )}

            {/* ACADÉMICO: Admin, Direção, Secretaria, Professor (Alunos e Encarregados NÃO TÊM ACESSO) */}
            {isAllowed(['admin', 'director', 'secretaria', 'professor']) && (
              <div>
                <span className="px-3 text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1">
                  ACADÉMICO
                </span>
                <div className="space-y-1">
                  <button
                    onClick={() => { onNavigate('alunos'); onCloseMobile(); }}
                    className={`w-full text-left cursor-pointer ${navItemClass('alunos')}`}
                  >
                    <span className={`material-symbols-outlined text-[20px] ${navItemIconClass('alunos')}`}>
                      school
                    </span>
                    <span>Alunos</span>
                  </button>

                  {isAllowed(['admin', 'director']) && (
                    <button
                      onClick={() => { onNavigate('professores'); onCloseMobile(); }}
                      className={`w-full text-left cursor-pointer ${navItemClass('professores')}`}
                    >
                      <span className={`material-symbols-outlined text-[20px] ${navItemIconClass('professores')}`}>
                        badge
                      </span>
                      <span>Professores</span>
                    </button>
                  )}

                  {isAllowed(['admin', 'director', 'secretaria']) && (
                    <button
                      onClick={() => { onNavigate('turmas'); onCloseMobile(); }}
                      className={`w-full text-left cursor-pointer ${navItemClass('turmas')}`}
                    >
                      <span className={`material-symbols-outlined text-[20px] ${navItemIconClass('turmas')}`}>
                        menu_book
                      </span>
                      <span>Turmas/Disciplinas</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* OPERACIONAL: Assiduidade & Lançamento/Notas (Alunos e Encarregados NÃO TÊM ACESSO) */}
            {isAllowed(['admin', 'director', 'secretaria', 'professor']) && (
              <div>
                <span className="px-3 text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1">
                  OPERACIONAL
                </span>
                <div className="space-y-1">
                  <button
                    onClick={() => { onNavigate('assiduidade'); onCloseMobile(); }}
                    className={`w-full text-left cursor-pointer ${navItemClass('assiduidade')}`}
                  >
                    <span className={`material-symbols-outlined text-[20px] ${navItemIconClass('assiduidade')}`}>
                      event_available
                    </span>
                    <span>Assiduidade Diária</span>
                  </button>

                  <button
                    onClick={() => { onNavigate('pautas'); onCloseMobile(); }}
                    className={`w-full text-left cursor-pointer ${navItemClass('pautas')}`}
                  >
                    <span className={`material-symbols-outlined text-[20px] ${navItemIconClass('pautas')}`}>
                      assignment
                    </span>
                    <span>Lançamento/Notas</span>
                  </button>
                </div>
              </div>
            )}

            {/* FINANCEIRO GLOBAL: Apenas Admin, Secretaria e Financeiro (Alunos e Professores NÃO TÊM ACESSO A ESTA ABA GLOBAL) */}
            {isAllowed(['admin', 'secretaria', 'financeiro']) && (
              <div>
                <span className="px-3 text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1">
                  FINANCEIRO
                </span>
                <div className="space-y-1">
                  <button
                    onClick={() => { onNavigate('propinas'); onCloseMobile(); }}
                    className={`w-full text-left cursor-pointer ${navItemClass('propinas')}`}
                  >
                    <span className={`material-symbols-outlined text-[20px] ${navItemIconClass('propinas')}`}>
                      payments
                    </span>
                    <span>Propinas/Pagamentos</span>
                  </button>
                </div>
              </div>
            )}

            {/* MURAL & BIBLIOTECA: Todos os perfis (incluindo Estudante e Encarregado) têm acesso */}
            <div>
              <span className="px-3 text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1">
                MURAL & BIBLIOTECA
              </span>
              <div className="space-y-1">
                <button
                  onClick={() => { onNavigate('mural_biblioteca'); onCloseMobile(); }}
                  className={`w-full text-left cursor-pointer ${navItemClass('mural_biblioteca')}`}
                >
                  <span className={`material-symbols-outlined text-[20px] ${navItemIconClass('mural_biblioteca')}`}>
                    campaign
                  </span>
                  <span>Avisos/Biblioteca</span>
                </button>
              </div>
            </div>

            {/* ESTATÍSTICA & SISTEMA: Relatórios e Configurações */}
            {isAllowed(['admin', 'director', 'secretaria', 'professor']) && (
              <div>
                <span className="px-3 text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1">
                  ESTATÍSTICA & SISTEMA
                </span>
                <div className="space-y-1">
                  <button
                    onClick={() => { onNavigate('relatorios'); onCloseMobile(); }}
                    className={`w-full text-left cursor-pointer ${navItemClass('relatorios')}`}
                  >
                    <span className={`material-symbols-outlined text-[20px] ${navItemIconClass('relatorios')}`}>
                      bar_chart
                    </span>
                    <span>Relatórios</span>
                  </button>

                  {isAllowed(['admin', 'director']) && (
                    <button
                      onClick={() => { onNavigate('configuracoes'); onCloseMobile(); }}
                      className={`w-full text-left cursor-pointer ${navItemClass('configuracoes')}`}
                    >
                      <span className={`material-symbols-outlined text-[20px] ${navItemIconClass('configuracoes')}`}>
                        settings
                      </span>
                      <span>Configurações</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </nav>
        </div>

        {/* Footer Brand Info */}
        <div className="p-3 bg-black/30 border-t border-slate-700/40">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#7a0c0c] text-[16px]">verified_user</span>
              <span className="font-semibold text-slate-200">BandMed</span>
            </div>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white">v3.4.2 Enterprise</span>
          </div>
        </div>
      </aside>
    </>
  );
};
