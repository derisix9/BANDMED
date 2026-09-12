import React, { useState, useEffect } from 'react';
import { dbService } from './services/db';
import { SchoolDatabase, User, Student } from './types';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { SqlExportModal } from './components/SqlExportModal';
import { ReportCardModal } from './components/ReportCardModal';
import { ErrorBoundary } from './components/ErrorBoundary';
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
    }
    return true;
  });
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

  // Modals state
  const [isSqlModalOpen, setIsSqlModalOpen] = useState<boolean>(false);
  const [reportCardStudent, setReportCardStudent] = useState<Student | null>(null);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState<boolean>(false);
  const [attendanceClassId, setAttendanceClassId] = useState<any>(undefined);

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

  const handleLogout = () => {
    dbService.logout();
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('bandmed_explicit_logout', 'true');
    }
    setIsAuthenticated(false);
  };

  const handleResetData = () => {
    if (confirm('Tem a certeza que deseja repor os registos padrão da instituição?')) {
      dbService.resetToDefaults();
      alert('Registos institucionais repostos com sucesso!');
    }
  };

  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-body antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        currentUserRole={currentUser.role}
        isMobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
      />

      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onOpenMobileMenu={() => setIsMobileNavOpen(true)}
        onOpenSqlExport={() => setIsSqlModalOpen(true)}
        onResetData={handleResetData}
        onLogout={handleLogout}
        onSearch={(term) => {
          if (term.trim().length > 0 && currentView !== 'alunos') {
            setCurrentView('alunos');
          }
        }}
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
                initialClassId={attendanceClassId}
              />
            )}

            {currentView === 'pautas' && (
              <PautasView db={db} currentUserRole={currentUser.role} />
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
      <ReportCardModal
        student={reportCardStudent}
        db={db}
        onClose={() => setReportCardStudent(null)}
      />
    </div>
  );
}
