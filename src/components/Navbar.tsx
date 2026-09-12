import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface NavbarProps {
  currentUser: User;
  onOpenMobileMenu: () => void;
  onOpenSqlExport?: () => void;
  onResetData: () => void;
  onLogout: () => void;
  onSearch: (term: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenMobileMenu,
  onResetData,
  onLogout,
  onSearch
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-[#0b1f3a] text-white border-b border-slate-800 z-30 flex items-center justify-between px-4 lg:px-8 shadow-md">
      {/* Left: Mobile hamburger & Search bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 lg:hidden"
          aria-label="Abrir menu"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>

        <div className="relative w-full max-w-md hidden sm:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-blue-200 text-[19px]">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Pesquisar alunos, turmas, faturas ou pautas..."
            className="w-full h-9 pl-9 pr-4 rounded-lg bg-white/10 border border-white/10 font-body text-xs text-white placeholder:text-blue-200 focus:outline-none focus:bg-white/15 focus:ring-1 focus:ring-white/30 transition-all"
          />
        </div>
      </div>

      {/* Right: Actions, Academic Year & User Profile */}
      <div className="flex items-center gap-2 lg:gap-3">
        {/* Academic Year Chip */}
        <div className="hidden lg:flex items-center gap-1.5 bg-white/10 border border-white/10 px-3 py-1 rounded-lg text-xs font-medium text-blue-100">
          <span className="material-symbols-outlined text-blue-300 text-[16px]">calendar_today</span>
          <span>Ano Letivo <strong>2024/2025</strong></span>
        </div>

        {/* Role Badge (Fixed institutional role) */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs font-semibold border border-white/20">
          <span className="material-symbols-outlined text-[16px] text-amber-400">verified_user</span>
          <span>
            {currentUser.role === 'admin'
              ? 'Administrador'
              : currentUser.role === 'professor'
              ? 'Docente'
              : currentUser.role === 'aluno'
              ? 'Estudante'
              : 'Encarregado'}
          </span>
        </div>

        {/* Notifications Icon with Badge */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors relative"
            aria-label="Notificações"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ac332b]" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 p-3 z-50 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-800">Notificações Escolares</span>
                <span className="text-[10px] text-slate-400 font-mono">3 não lidas</span>
              </div>
              <div className="divide-y divide-slate-100 py-1 space-y-1">
                <div className="py-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-red-800">
                    <span>Aviso de Cobrança em Mora</span>
                    <span className="font-normal text-slate-400">há 15m</span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    47 mensalidades do mês corrente encontram-se vencidas para notificação.
                  </p>
                </div>
                <div className="py-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
                    <span>Pauta 10º A Submetida</span>
                    <span className="font-normal text-slate-400">há 1h</span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Prof.ª Margarida Fontes enviou a pauta sumativa para homologação.
                  </p>
                </div>
                <div className="py-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800">
                    <span>Backup Concluído</span>
                    <span className="font-normal text-slate-400">ontem</span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Arquivo fiscal SAF-T AO sincronizado com o repositório seguro.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Identity Chip */}
        <div className="flex items-center gap-2 pl-2 border-l border-white/20">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-white/30 shadow-xs"
          />
          <div className="hidden xl:flex flex-col text-left">
            <span className="text-xs font-bold text-white leading-tight truncate max-w-[140px]">
              {currentUser.name}
            </span>
            <span className="text-[10px] text-blue-200 truncate max-w-[140px]">
              {currentUser.roleTitle}
            </span>
          </div>
          <button
            onClick={onLogout}
            className="p-1 text-blue-200 hover:text-red-300 rounded transition-colors"
            title="Terminar Sessão"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
