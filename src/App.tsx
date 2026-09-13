import React, { useState, useEffect } from 'react';
import { dbService } from './services/db';
import { SchoolDatabase, User, Student } from './types';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { SqlExportModal } from './components/SqlExportModal';
import { ReportCardModal } from './components/ReportCardModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { OperationProvider, runGlobalOperation } from './context/OperationContext';
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { AlunosView } from './views/AlunosView';
import { ProfessoresView } from './views/ProfessoresView';
import { TurmasView } from './views/TurmasView';
import { AssiduidadeView } from './views/AssiduidadeView';
import { PautasView } from './views/PautasView';
import { PropinasView } from './views/PropinasView';
import { RelatoriosView } from './views/RelatoriosView';
import { AvisosEBibliotecaView } from './views/AvisosEBibliotecaView';
import { ConfiguracoesView } from './views/ConfiguracoesView';

export default function App() {
  const [db, setDb] = useState<SchoolDatabase>(dbService.getDatabase());
  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem('bandmed_session_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Erro ao restaurar sessão:', e);
    }
    return dbService.getCurrentUser();
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const explicitLogout = sessionStorage.getItem('bandmed_explicit_logout');
      if (explicitLogout === 'true') return false;
      try {
        // Só considera autenticado se existir uma sessão de utilizador realmente guardada
        // (login efetuado ou conta criada). Um browser novo/instituição nova deve começar
        // sempre no ecrã de Início de Sessão / Criação de Conta.
        const savedSession = localStorage.getItem('bandmed_session_user');
        return !!savedSession;
      } catch {
        return false;
      }
    }
    return false;
  });
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

  // Modals state
  const [isSqlModalOpen, setIsSqlModalOpen] = useState<boolean>(false);
  const [reportCardStudent, setReportCardStudent] = useState<Student | null>(null);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState<boolean>(false);
  const [attendanceClassId, setAttendanceClassId] = useState<any>(undefined);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState<boolean>(false);

  // Subscribe to reactive database changes
  useEffect(() => {
    const unsubscribe = dbService.subscribe((updated) => {
      setDb(updated);
    });
    return () => unsubscribe();
  }, []);

  const handleLoginSuccess = (user: User) => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('bandmed_explicit_logout');
    }
    setCurrentUser(user);
    setIsAuthenticated(true);
    setCurrentView('dashboard');
  };

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const handleConfirmLogout = async () => {
    setIsLogoutModalOpen(false);
    await runGlobalOperation(
      async () => {
        dbService.logout();
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('bandmed_explicit_logout', 'true');
        }
      },
      {
        loadingMessage: 'A terminar sessão no sistema com segurança...',
        successMessage: 'Sessão terminada com sucesso!'
      }
    );
    setIsAuthenticated(false);
  };

  const handleResetData = () => {
    if (confirm('Tem a certeza que deseja repor os registos padrão da instituição?')) {
      dbService.resetToDefaults();
      alert('Registos institucionais repostos com sucesso!');
    }
  };

  if (!isAuthenticated) {
    return (
      <OperationProvider>
        <LoginView onLoginSuccess={handleLoginSuccess} />
      </OperationProvider>
    );
  }

  return (
    <OperationProvider>
      <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-body antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        currentUserRole={currentUser.role}
        isMobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
        onLogout={handleLogoutClick}
      />

      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        currentAcademicYear={db.settings?.currentAcademicYear || '2024/2025'}
        availableAcademicYears={
          db.settings?.availableAcademicYears || ['2024/2025', '2023/2024', '2022/2023', '2025/2026']
        }
        onAcademicYearChange={(year) => {
          dbService.setAcademicYear(year);
        }}
        onOpenMobileMenu={() => setIsMobileNavOpen(true)}
        onOpenSqlExport={() => setIsSqlModalOpen(true)}
        onResetData={handleResetData}
        onLogout={handleLogoutClick}
        onNavigate={(view, targetId) => {
          if (view === 'assiduidade' && targetId) {
            setAttendanceClassId(targetId);
          }
          setCurrentView(view);
        }}
        db={db}
      />

      {/* Main Content Area */}
      <main className="lg:pl-64 pt-20 px-4 lg:px-8 flex-1 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          <ErrorBoundary onReset={() => setCurrentView('dashboard')}>
            {currentView === 'dashboard' && (
              <DashboardView
                db={db}
                onNavigate={setCurrentView}
                currentUserRole={currentUser.role}
                onOpenNewStudentModal={() => setCurrentView('alunos')}
                onOpenNoticeModal={() => {
                  setCurrentView('mural_biblioteca');
                  setIsNoticeModalOpen(true);
                }}
                onOpenReportCard={(student) => setReportCardStudent(student)}
              />
            )}

            {currentView === 'alunos' && (
              <AlunosView
                db={db}
                currentUserRole={currentUser.role}
                onOpenReportCard={(student) => setReportCardStudent(student)}
              />
            )}

            {currentView === 'professores' && (
              <ProfessoresView db={db} currentUserRole={currentUser.role} />
            )}

            {currentView === 'turmas' && (
              <TurmasView
                db={db}
                currentUserRole={currentUser.role}
                currentUser={currentUser}
                onNavigateToAttendance={(classId) => {
                  setAttendanceClassId(classId);
                  setCurrentView('assiduidade');
                }}
                onNavigateToStudents={() => setCurrentView('alunos')}
                onNavigateToPautas={() => setCurrentView('pautas')}
              />
            )}

            {currentView === 'assiduidade' && (
              <AssiduidadeView
                db={db}
                currentUserRole={currentUser.role}
                currentUser={currentUser}
                initialClassId={attendanceClassId}
              />
            )}

            {currentView === 'pautas' && (
              <PautasView
                db={db}
                currentUserRole={currentUser.role}
                currentUser={currentUser}
              />
            )}

            {currentView === 'propinas' && (
              <PropinasView db={db} currentUserRole={currentUser.role} />
            )}

            {currentView === 'mural_biblioteca' && (
              <AvisosEBibliotecaView
                db={db}
                currentUserRole={currentUser.role}
                isNoticeModalOpen={isNoticeModalOpen}
                setIsNoticeModalOpen={setIsNoticeModalOpen}
              />
            )}

            {currentView === 'relatorios' && (
              <RelatoriosView db={db} currentUserRole={currentUser.role} />
            )}

            {currentView === 'configuracoes' && (
              <ConfiguracoesView
                db={db}
                currentUserRole={currentUser.role}
                onOpenSqlExport={() => setIsSqlModalOpen(true)}
                onResetData={handleResetData}
              />
            )}
          </ErrorBoundary>
        </div>
      </main>

      {/* SQL Export Modal */}
      <SqlExportModal
        isOpen={isSqlModalOpen}
        onClose={() => setIsSqlModalOpen(false)}
      />

      {/* Official Report Card Modal */}
      {reportCardStudent && (
        <ErrorBoundary onReset={() => setReportCardStudent(null)}>
          <ReportCardModal
            student={reportCardStudent}
            db={db}
            onClose={() => setReportCardStudent(null)}
          />
        </ErrorBoundary>
      )}

      {/* Modal: Confirmação ao Terminar Sessão */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-none max-w-md w-full shadow-2xl overflow-hidden border border-slate-300">
            <div className="px-6 py-4 bg-[#0b1f3a] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-red-400">warning</span>
                <h3 className="font-bold text-base">Terminar Sessão</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(false)}
                className="text-slate-300 hover:text-white p-1 hover:bg-white/10 transition-colors cursor-pointer"
                title="Fechar"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6">
              <div className="w-12 h-12 rounded-none bg-red-100 text-[#ac332b] flex items-center justify-center mx-auto mb-4 border border-red-200">
                <span className="material-symbols-outlined text-[28px]">logout</span>
              </div>
              <h3 className="font-headline text-lg font-bold text-slate-900 text-center">
                Terminar Sessão no Sistema?
              </h3>
              <p className="text-xs text-slate-600 text-center mt-2 leading-relaxed">
                Pretende encerrar a sessão de trabalho do utilizador <strong className="text-slate-900">{currentUser.name}</strong> ({currentUser.roleTitle})? Para aceder novamente à plataforma do Complexo Escolar Privado BandMed será necessário introduzir as suas credenciais de autenticação.
              </p>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-300 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(false)}
                className="px-4 py-2.5 rounded-none bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer border border-slate-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="px-5 py-2.5 rounded-none bg-[#b91c1c] hover:bg-[#7a0c0c] text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-none border-none"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                <span>Confirmar e Terminar Sessão</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </OperationProvider>
  );
}
