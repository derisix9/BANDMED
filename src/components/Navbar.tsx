import React, { useState, useRef, useEffect, useMemo } from 'react';
import { User, SchoolDatabase, SchoolNotification } from '../types';
import { dbService } from '../services/db';

function formatRelativeTime(createdAt?: number, fallback?: string): string {
  if (!createdAt) return fallback || 'recente';
  const diff = Math.max(0, Date.now() - createdAt);
  const minutes = Math.floor(diff / (1000 * 60));
  if (minutes < 1) return 'Agora';
  if (minutes < 60) return `há ${minutes}m`;
  const hours = Math.floor(minutes / (1000 * 60 * 60));
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  return `há ${days}d`;
}

interface NavbarProps {
  currentUser: User;
  currentAcademicYear: string;
  availableAcademicYears: string[];
  onAcademicYearChange: (year: string) => void;
  onOpenMobileMenu: () => void;
  onOpenSqlExport?: () => void;
  onResetData: () => void;
  onLogout: () => void;
  onNavigate: (view: string, targetId?: string) => void;
  db: SchoolDatabase;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentAcademicYear,
  availableAcademicYears,
  onAcademicYearChange,
  onOpenMobileMenu,
  onResetData,
  onLogout,
  onNavigate,
  db
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [hasRecentAlert, setHasRecentAlert] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const notificationsContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (notificationsContainerRef.current && !notificationsContainerRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Listen to real-time school notifications
  useEffect(() => {
    const handleNewNotif = () => {
      setHasRecentAlert(true);
      const timer = setTimeout(() => setHasRecentAlert(false), 5000);
      return () => clearTimeout(timer);
    };

    window.addEventListener('bandmed:school_notification', handleNewNotif);
    return () => window.removeEventListener('bandmed:school_notification', handleNewNotif);
  }, []);

  const notifications = useMemo(() => {
    const list: SchoolNotification[] = (db.notifications && db.notifications.length > 0)
      ? db.notifications
      : dbService.getNotifications(currentUser.role);
    return list.filter((n) => !n.targetRoles || n.targetRoles.includes(currentUser.role));
  }, [db.notifications, currentUser.role]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  // Compute live search results across multiple entities
  const searchResults = React.useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return null;

    const matchedStudents = (db.students || [])
      .filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.procNumber.toLowerCase().includes(query) ||
          (s.className && s.className.toLowerCase().includes(query))
      )
      .slice(0, 4);

    const matchedClasses = (db.classes || [])
      .filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          (c.room && c.room.toLowerCase().includes(query)) ||
          (c.academicYear && c.academicYear.toLowerCase().includes(query))
      )
      .slice(0, 3);

    const matchedTeachers = (db.teachers || [])
      .filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          (t.department && t.department.toLowerCase().includes(query)) ||
          (t.agentNumber && t.agentNumber.toLowerCase().includes(query))
      )
      .slice(0, 3);

    const matchedSubjects = (db.subjects || [])
      .filter(
        (sub) =>
          sub.name.toLowerCase().includes(query) ||
          sub.code.toLowerCase().includes(query)
      )
      .slice(0, 3);

    const matchedInvoices = (db.invoices || [])
      .filter(
        (inv) =>
          inv.invoiceNumber.toLowerCase().includes(query) ||
          inv.studentName.toLowerCase().includes(query) ||
          inv.period.toLowerCase().includes(query)
      )
      .slice(0, 3);

    const totalCount =
      matchedStudents.length +
      matchedClasses.length +
      matchedTeachers.length +
      matchedSubjects.length +
      matchedInvoices.length;

    return {
      students: matchedStudents,
      classes: matchedClasses,
      teachers: matchedTeachers,
      subjects: matchedSubjects,
      invoices: matchedInvoices,
      totalCount
    };
  }, [searchTerm, db]);

  const handleSelectResult = (view: string, id?: string) => {
    setIsSearchOpen(false);
    setSearchTerm('');
    onNavigate(view, id);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchResults && searchResults.totalCount > 0) {
      if (searchResults.students.length > 0) {
        handleSelectResult('alunos', searchResults.students[0].id);
      } else if (searchResults.classes.length > 0) {
        handleSelectResult('turmas');
      } else if (searchResults.teachers.length > 0) {
        handleSelectResult('professores');
      } else if (searchResults.subjects.length > 0) {
        handleSelectResult('turmas');
      } else if (searchResults.invoices.length > 0) {
        handleSelectResult('propinas');
      }
    } else if (e.key === 'Escape') {
      setIsSearchOpen(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-[#0b1f3a] text-white border-b border-slate-800 z-30 flex items-center justify-between px-4 lg:px-8 shadow-md">
      {/* Left: Mobile hamburger & Search bar (No border, no background fill) */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 lg:hidden cursor-pointer"
          aria-label="Abrir menu"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>

        {/* Search Box: Smooth border appears when clicking to type */}
        <div ref={searchContainerRef} className="relative w-full max-w-md hidden sm:block">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-transparent focus-within:border-white/40 transition-all duration-200">
            <span className="material-symbols-outlined text-blue-300 text-[20px] shrink-0">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder="Pesquisar alunos, turmas, professores, disciplinas..."
              className="w-full bg-transparent border-0 text-xs text-white placeholder:text-blue-200/70 focus:outline-none focus:ring-0 font-body"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setIsSearchOpen(false);
                }}
                className="text-blue-300 hover:text-white text-xs p-1 cursor-pointer"
                title="Limpar pesquisa"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          {/* Live Search Results Floating Panel */}
          {isSearchOpen && searchResults && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white text-slate-800 rounded-none shadow-2xl border border-slate-300 z-50 max-h-[75vh] overflow-y-auto divide-y divide-slate-100 text-xs animate-fade-in">
              {searchResults.totalCount === 0 ? (
                <div className="p-4 text-center text-slate-500 italic">
                  Nenhum resultado encontrado para "{searchTerm}".
                </div>
              ) : (
                <>
                  {/* Students */}
                  {searchResults.students.length > 0 && (
                    <div className="p-2">
                      <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-[#0b1f3a]">school</span>
                        <span>Alunos ({searchResults.students.length})</span>
                      </div>
                      {searchResults.students.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => handleSelectResult('alunos', s.id)}
                          className="w-full text-left px-2.5 py-2 hover:bg-slate-50 flex items-center justify-between group cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <img
                              src={s.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'}
                              alt=""
                              className="w-6 h-6 rounded-full object-cover border border-slate-200"
                            />
                            <div>
                              <span className="font-bold text-slate-900 group-hover:text-[#0b1f3a] block leading-tight">
                                {s.name}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                Proc: #{s.procNumber} • {s.className}
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] font-semibold text-blue-700 uppercase">Ver Aluno →</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Classes */}
                  {searchResults.classes.length > 0 && (
                    <div className="p-2">
                      <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-[#0b1f3a]">groups</span>
                        <span>Turmas ({searchResults.classes.length})</span>
                      </div>
                      {searchResults.classes.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => handleSelectResult('turmas', c.id)}
                          className="w-full text-left px-2.5 py-2 hover:bg-slate-50 flex items-center justify-between group cursor-pointer"
                        >
                          <div>
                            <span className="font-bold text-slate-900 group-hover:text-[#0b1f3a] block">
                              {c.name}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {c.room} • {c.shift} • Ano {c.academicYear}
                            </span>
                          </div>
                          <span className="text-[10px] font-semibold text-blue-700 uppercase">Abrir Turma →</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Teachers */}
                  {searchResults.teachers.length > 0 && (
                    <div className="p-2">
                      <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-[#0b1f3a]">badge</span>
                        <span>Professores ({searchResults.teachers.length})</span>
                      </div>
                      {searchResults.teachers.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => handleSelectResult('professores', t.id)}
                          className="w-full text-left px-2.5 py-2 hover:bg-slate-50 flex items-center justify-between group cursor-pointer"
                        >
                          <div>
                            <span className="font-bold text-slate-900 group-hover:text-[#0b1f3a] block">
                              {t.name}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {t.department} • Agente: {t.agentNumber}
                            </span>
                          </div>
                          <span className="text-[10px] font-semibold text-blue-700 uppercase">Perfil →</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Subjects */}
                  {searchResults.subjects.length > 0 && (
                    <div className="p-2">
                      <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-[#0b1f3a]">menu_book</span>
                        <span>Disciplinas ({searchResults.subjects.length})</span>
                      </div>
                      {searchResults.subjects.map((sub) => (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => handleSelectResult('turmas')}
                          className="w-full text-left px-2.5 py-2 hover:bg-slate-50 flex items-center justify-between group cursor-pointer"
                        >
                          <div>
                            <span className="font-bold text-slate-900 group-hover:text-[#0b1f3a] block">
                              {sub.name}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              Código: {sub.code} • Carga: {sub.weeklyHours || 4}h/semana
                            </span>
                          </div>
                          <span className="text-[10px] font-semibold text-blue-700 uppercase">Matriz →</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Invoices */}
                  {searchResults.invoices.length > 0 && (
                    <div className="p-2">
                      <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-[#0b1f3a]">receipt_long</span>
                        <span>Faturas & Propinas ({searchResults.invoices.length})</span>
                      </div>
                      {searchResults.invoices.map((inv) => (
                        <button
                          key={inv.id}
                          type="button"
                          onClick={() => handleSelectResult('propinas', inv.id)}
                          className="w-full text-left px-2.5 py-2 hover:bg-slate-50 flex items-center justify-between group cursor-pointer"
                        >
                          <div>
                            <span className="font-bold text-slate-900 group-hover:text-[#0b1f3a] block">
                              {inv.invoiceNumber} — {inv.studentName}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {inv.period} • {Number(inv.totalAmountKz).toLocaleString()} Kz ({inv.status})
                            </span>
                          </div>
                          <span className="text-[10px] font-semibold text-blue-700 uppercase">Tesouraria →</span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: Actions, Academic Year Combobox & User Profile (No borders, no fill) */}
      <div className="flex items-center gap-3 lg:gap-4">
        {/* Academic Year Combobox: No borders, no background fill, full year switching */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-blue-100">
          <span className="material-symbols-outlined text-amber-400 text-[18px]">calendar_today</span>
          <span className="text-blue-200 font-medium">Ano Letivo:</span>
          <select
            value={currentAcademicYear}
            onChange={(e) => onAcademicYearChange(e.target.value)}
            className="bg-transparent text-white font-bold text-xs border-0 focus:outline-none cursor-pointer pr-1 py-0.5"
            title="Alternar Ano Letivo Institucional"
          >
            {availableAcademicYears.map((yr) => (
              <option key={yr} value={yr} className="bg-[#0b1f3a] text-white font-semibold">
                {yr}
              </option>
            ))}
          </select>
        </div>

        {/* Role Label: No borders, no fill */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-blue-100">
          <span className="material-symbols-outlined text-[17px] text-amber-400">verified_user</span>
          <span className="font-semibold text-white tracking-wide">
            {currentUser.role === 'admin'
              ? 'Administrador'
              : currentUser.role === 'professor'
              ? 'Docente'
              : currentUser.role === 'aluno'
              ? 'Estudante'
              : 'Encarregado'}
          </span>
        </div>

        {/* Notifications Icon with Real-Time Badge */}
        <div className="relative" ref={notificationsContainerRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2 rounded-lg transition-all relative cursor-pointer ${
              hasRecentAlert
                ? 'bg-red-600 text-white ring-2 ring-red-400 scale-105'
                : 'text-blue-200 hover:text-white hover:bg-white/10'
            }`}
            aria-label="Notificações Escolares"
            title="Notificações Escolares em Tempo Real"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-black bg-red-600 text-white shadow-xs animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white text-slate-800 rounded-none shadow-2xl border border-slate-300 z-50 text-xs overflow-hidden">
              <div className="bg-slate-50 px-3.5 py-2.5 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 text-sm">Notificações Escolares</span>
                  <span className="flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 font-medium border border-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping inline-block" />
                    Tempo Real
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <button
                      onClick={() => dbService.markAllNotificationsAsRead()}
                      className="text-[11px] text-blue-700 hover:text-blue-900 font-medium px-2 py-0.5 hover:bg-blue-50 cursor-pointer"
                      title="Marcar todas como lidas"
                    >
                      Marcar lidas
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={() => dbService.clearAllNotifications()}
                      className="text-[11px] text-slate-400 hover:text-red-600 font-medium px-1 py-0.5 cursor-pointer"
                      title="Limpar histórico"
                    >
                      Limpar
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center px-4">
                    <span className="material-symbols-outlined text-slate-300 text-[36px]">notifications_off</span>
                    <p className="text-slate-500 text-xs mt-1">Não existem notificações pendentes.</p>
                    <p className="text-[10px] text-slate-400">Novos avisos e eventos escolares surgirão aqui em tempo real.</p>
                  </div>
                ) : (
                  notifications.map((n) => {
                    const iconColor =
                      n.type === 'finance'
                        ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                        : n.type === 'notice'
                        ? n.priority === 'urgente'
                          ? 'text-red-700 bg-red-50 border-red-200'
                          : 'text-blue-700 bg-blue-50 border-blue-200'
                        : n.type === 'attendance'
                        ? 'text-amber-700 bg-amber-50 border-amber-200'
                        : n.type === 'academic'
                        ? 'text-purple-700 bg-purple-50 border-purple-200'
                        : 'text-slate-700 bg-slate-100 border-slate-200';

                    const iconSymbol =
                      n.type === 'finance'
                        ? 'payments'
                        : n.type === 'notice'
                        ? 'campaign'
                        : n.type === 'attendance'
                        ? 'event_available'
                        : n.type === 'academic'
                        ? 'assignment'
                        : 'notifications';

                    return (
                      <div
                        key={n.id}
                        onClick={() => {
                          dbService.markNotificationAsRead(n.id);
                          if (n.linkView) {
                            onNavigate(n.linkView, n.linkId);
                            setShowNotifications(false);
                          }
                        }}
                        className={`p-3 transition-colors cursor-pointer flex gap-3 items-start group ${
                          !n.read ? 'bg-blue-50/50 hover:bg-blue-50' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-none flex items-center justify-center shrink-0 border mt-0.5 ${iconColor}`}
                        >
                          <span className="material-symbols-outlined text-[16px]">{iconSymbol}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1.5 truncate">
                              {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />}
                              <span
                                className={`text-[11px] truncate ${
                                  !n.read ? 'font-bold text-slate-900' : 'font-medium text-slate-700'
                                }`}
                              >
                                {n.title}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                              {formatRelativeTime(n.createdAt, n.timestamp)}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                            {n.message}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            dbService.deleteNotification(n.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-opacity p-0.5 shrink-0"
                          title="Remover"
                        >
                          <span className="material-symbols-outlined text-[14px]">close</span>
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="p-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px]">
                <button
                  onClick={() => {
                    onNavigate('mural_biblioteca');
                    setShowNotifications(false);
                  }}
                  className="text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">campaign</span>
                  <span>Mural de Avisos & Circulares</span>
                </button>
                <span className="text-[10px] text-slate-400">BandMed Live</span>
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
            className="p-1 text-blue-200 hover:text-red-300 rounded transition-colors cursor-pointer"
            title="Terminar Sessão"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
