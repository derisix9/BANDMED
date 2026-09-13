import React, { useRef, useState } from 'react';
import { User } from '../types';
import { dbService } from '../services/db';
import { OperationStatusModal } from '../components/OperationStatusModal';
import { runGlobalOperation } from '../context/OperationContext';
import { compressImageFile } from '../utils/imageCompressor';

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
}

const DEFAULT_NEW_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

type ViewMode = 'login' | 'register-admin' | 'register-institution';

interface AdminFormState {
  name: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  avatar: string;
}

interface InstitutionFormState {
  schoolName: string;
  nif: string;
  province: string;
  municipality: string;
  address: string;
  phone: string;
  email: string;
  currentAcademicYear: string;
}

const emptyAdminForm = (): AdminFormState => ({
  name: '',
  email: '',
  username: '',
  password: '',
  confirmPassword: '',
  avatar: DEFAULT_NEW_AVATAR
});

const emptyInstitutionForm = (): InstitutionFormState => ({
  schoolName: '',
  nif: '',
  province: '',
  municipality: '',
  address: '',
  phone: '',
  email: '',
  currentAcademicYear: new Date().getFullYear() + '/' + (new Date().getFullYear() + 1)
});

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<ViewMode>('login');

  // Login state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loginStatus, setLoginStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Registration state
  const [adminForm, setAdminForm] = useState<AdminFormState>(emptyAdminForm());
  const [institutionForm, setInstitutionForm] = useState<InstitutionFormState>(emptyInstitutionForm());
  const [registerError, setRegisterError] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);
    setLoginStatus('loading');

    setTimeout(() => {
      const result = dbService.authenticate(identifier, password);
      setLoading(false);

      if (result.success && result.user) {
        setLoginStatus('success');
        if (rememberMe) {
          try {
            localStorage.setItem('bandmed_session_user', JSON.stringify(result.user));
          } catch (err) {
            console.warn('Erro ao salvar sessão:', err);
          }
        }
        setTimeout(() => {
          setLoginStatus('idle');
          onLoginSuccess(result.user);
        }, 1200);
      } else {
        setLoginStatus('idle');
        setErrorMessage(result.error || 'Credenciais inválidas. Verifique o seu e-mail institucional ou n.º de processo e a palavra-passe.');
      }
    }, 600);
  };

  const resetRegistrationFlow = () => {
    setAdminForm(emptyAdminForm());
    setInstitutionForm(emptyInstitutionForm());
    setRegisterError(null);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setRegisterError('A fotografia excede o limite de 10MB.');
      return;
    }
    try {
      const compressed = await compressImageFile(file, 300, 300, 0.82);
      setAdminForm((prev) => ({ ...prev, avatar: compressed }));
    } catch {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAdminForm((prev) => ({ ...prev, avatar: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContinueToInstitutionStep = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);

    if (!adminForm.name.trim() || !adminForm.email.trim()) {
      setRegisterError('Por favor, preencha o nome e o e-mail do administrador.');
      return;
    }
    if (!adminForm.password || adminForm.password.trim().length < 4) {
      setRegisterError('A palavra-passe deve conter pelo menos 4 caracteres.');
      return;
    }
    if (adminForm.password !== adminForm.confirmPassword) {
      setRegisterError('As palavras-passe introduzidas não coincidem.');
      return;
    }

    setMode('register-institution');
  };

  const finalizeRegistration = async (skipInstitutionData: boolean) => {
    setRegisterError(null);

    try {
      const result = await runGlobalOperation(
        async () => {
          const res = await dbService.registerInstitutionAndAdmin(
            {
              name: adminForm.name.trim(),
              email: adminForm.email.trim(),
              password: adminForm.password.trim(),
              username: adminForm.username.trim() || undefined,
              avatar: adminForm.avatar
            },
            skipInstitutionData
              ? {
                  schoolName: 'Nova Instituição',
                  currentAcademicYear: institutionForm.currentAcademicYear.trim() || `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`
                }
              : {
                  schoolName: institutionForm.schoolName.trim(),
                  nif: institutionForm.nif.trim(),
                  province: institutionForm.province.trim(),
                  municipality: institutionForm.municipality.trim(),
                  address: institutionForm.address.trim(),
                  phone: institutionForm.phone.trim(),
                  email: institutionForm.email.trim(),
                  currentAcademicYear: institutionForm.currentAcademicYear.trim() || `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`
                }
          );
          if (!res.success) {
            throw new Error(res.error || 'Não foi possível concluir o registo da instituição.');
          }
          return res;
        },
        {
          loadingMessage: skipInstitutionData
            ? 'A criar a conta de administrador e a instituição...'
            : 'A criar a conta de administrador e a configurar a instituição...',
          successMessage: 'Operação feita com sucesso!'
        }
      );

      try {
        localStorage.setItem('bandmed_session_user', JSON.stringify(result.user));
      } catch (err) {
        console.warn('Erro ao salvar sessão:', err);
      }
      resetRegistrationFlow();
      setMode('login');
      onLoginSuccess(result.user);
    } catch (err: any) {
      setRegisterError(err?.message || 'Não foi possível concluir o registo. Tente novamente.');
    }
  };

  const handleSubmitInstitutionStep = (e: React.FormEvent) => {
    e.preventDefault();
    finalizeRegistration(false);
  };

  const handleSkipInstitutionStep = () => {
    finalizeRegistration(true);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 lg:p-8 bg-[#eff4ff]">
      <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-slate-200">
        {/* Left Institutional Panel: Navy Blue `#0B1F3A` */}
        <div className="lg:w-5/12 bg-[#0b1f3a] text-white p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#7a0c0c]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -top-16 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Top: Brand & Crest */}
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-white rounded-xl p-1.5 shadow-md flex items-center justify-center shrink-0 overflow-hidden">
                <img
                  src="/school_emblem.png"
                  alt="BandMed Emblema"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-headline font-extrabold text-xl tracking-wider text-white">BANDMED</span>
                <span className="text-[11px] text-blue-200 uppercase tracking-wide font-medium">
                  Plataforma Académica de Gestão
                </span>
              </div>
            </div>

            <div className="mt-8 lg:mt-12">
              <h1 className="font-headline text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-tight">
                {mode === 'login'
                  ? 'Gestão Escolar, Rigor e Transparência.'
                  : 'Registe a Sua Instituição de Ensino.'}
              </h1>
            </div>
          </div>

          {/* Middle: Capabilities & Security */}
          <div className="relative z-10 my-8 py-6 border-y border-white/10 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 text-amber-400">
                <span className="material-symbols-outlined text-[20px]">sync</span>
              </div>
              <div className="flex flex-col text-xs">
                <span className="font-bold text-white">Sincronização em Tempo Real</span>
                <span className="text-slate-300">Atualização contínua e instantânea entre secretaria, coordenação e salas de aula.</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 text-blue-300">
                <span className="material-symbols-outlined text-[20px]">shield</span>
              </div>
              <div className="flex flex-col text-xs">
                <span className="font-bold text-white">Autenticação Cifrada & Conformidade MED</span>
                <span className="text-slate-300">Acesso seguro com encriptação e trilha de auditoria para cada perfil.</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 text-emerald-300">
                <span className="material-symbols-outlined text-[20px]">apartment</span>
              </div>
              <div className="flex flex-col text-xs">
                <span className="font-bold text-white">Multi-Instituição & Isolamento de Dados</span>
                <span className="text-slate-300">Cada instituição possui a sua própria base de dados isolada e segura na plataforma.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Authentication Panel */}
        <div className="lg:w-7/12 p-6 lg:p-12 flex flex-col justify-between bg-white">
          {mode === 'login' && (
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-headline text-2xl font-bold text-slate-900">Iniciar Sessão</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Introduza os seus dados de acesso institucionais para entrar na plataforma.
                  </p>
                </div>
              </div>

              {/* Error Message Box */}
              {errorMessage && (
                <div className="mt-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5 animate-in fade-in">
                  <span className="material-symbols-outlined text-red-600 text-[18px] shrink-0 mt-0.5">
                    error
                  </span>
                  <div className="flex-1">
                    <span className="font-semibold block">Erro de Autenticação</span>
                    <span>{errorMessage}</span>
                  </div>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-[11px] uppercase font-bold tracking-wider text-slate-600 mb-1" htmlFor="identifier">
                    E-mail Institucional ou N.º de Processo / Agente
                  </label>
                  <div className="relative flex items-center bg-slate-100 rounded-lg focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0b1f3a] transition-all">
                    <span className="material-symbols-outlined text-slate-400 pl-3 pr-2 text-[20px] select-none">
                      badge
                    </span>
                    <input
                      id="identifier"
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => {
                        setIdentifier(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      placeholder="ex: admin@escola.pt, prof.marta@escola.pt ou 2410"
                      className="w-full py-3 pr-3 bg-transparent text-slate-800 text-sm focus:outline-none"
                      autoComplete="username"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Pode utilizar o seu e-mail institucional, n.º de processo de estudante ou n.º de agente.
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] uppercase font-bold tracking-wider text-slate-600" htmlFor="password">
                      Palavra-passe
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowHelpModal(true)}
                      className="text-xs text-[#7a0c0c] hover:underline font-semibold"
                    >
                      Esqueceu a palavra-passe?
                    </button>
                  </div>
                  <div className="relative flex items-center bg-slate-100 rounded-lg focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0b1f3a] transition-all">
                    <span className="material-symbols-outlined text-slate-400 pl-3 pr-2 text-[20px] select-none">
                      lock
                    </span>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      placeholder="Palavra-passe"
                      className="w-full py-3 pr-10 bg-transparent text-slate-800 text-sm focus:outline-none"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-slate-400 hover:text-slate-700"
                      aria-label={showPassword ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between py-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-[#0b1f3a] focus:ring-0 accent-[#0b1f3a] cursor-pointer"
                    />
                    <span>Lembrar-me neste posto de trabalho</span>
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">lock</span> SSL TLS 1.3
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-white bg-[#0b1f3a] hover:bg-[#7a0c0c] transition-colors duration-200 shadow-md text-sm cursor-pointer disabled:opacity-75 mt-2"
                >
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                      <span>A validar credenciais...</span>
                    </>
                  ) : (
                    <>
                      <span>Entrar no Sistema</span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                <span className="text-xs text-slate-500">Ainda não tem uma conta institucional? </span>
                <button
                  type="button"
                  onClick={() => {
                    resetRegistrationFlow();
                    setMode('register-admin');
                  }}
                  className="text-xs font-bold text-[#0b1f3a] hover:text-[#7a0c0c] hover:underline"
                >
                  Registar Nova Instituição
                </button>
              </div>
            </div>
          )}

          {mode === 'register-admin' && (
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-6 h-6 rounded-full bg-[#0b1f3a] text-white text-[11px] font-bold flex items-center justify-center">1</span>
                    <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">de 2 · Conta de Administrador</span>
                  </div>
                  <h2 className="font-headline text-2xl font-bold text-slate-900">Criar Conta de Administrador</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Estes dados criam o utilizador com acesso total (Administrador Geral) à nova instituição.
                  </p>
                </div>
              </div>

              {registerError && (
                <div className="mt-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5 animate-in fade-in">
                  <span className="material-symbols-outlined text-red-600 text-[18px] shrink-0 mt-0.5">error</span>
                  <span>{registerError}</span>
                </div>
              )}

              <form onSubmit={handleContinueToInstitutionStep} className="mt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-200 shrink-0 bg-slate-100">
                    <img src={adminForm.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[11px] uppercase font-bold tracking-wider text-slate-600 mb-1">
                      Fotografia de Perfil (Opcional)
                    </label>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">upload</span>
                      <span>Carregar Foto</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-bold tracking-wider text-slate-600 mb-1">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    required
                    value={adminForm.name}
                    onChange={(e) => setAdminForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="ex: Dr. Carlos Mendes"
                    className="w-full py-2.5 px-3 bg-slate-100 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#0b1f3a] outline-none text-sm transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] uppercase font-bold tracking-wider text-slate-600 mb-1">
                      E-mail Institucional
                    </label>
                    <input
                      type="email"
                      required
                      value={adminForm.email}
                      onChange={(e) => setAdminForm((p) => ({ ...p, email: e.target.value }))}
                      placeholder="admin@suaescola.pt"
                      className="w-full py-2.5 px-3 bg-slate-100 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#0b1f3a] outline-none text-sm transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase font-bold tracking-wider text-slate-600 mb-1">
                      Nome de Utilizador
                    </label>
                    <input
                      type="text"
                      value={adminForm.username}
                      onChange={(e) => setAdminForm((p) => ({ ...p, username: e.target.value }))}
                      placeholder="ex: carlos.mendes"
                      className="w-full py-2.5 px-3 bg-slate-100 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#0b1f3a] outline-none text-sm transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] uppercase font-bold tracking-wider text-slate-600 mb-1">
                      Palavra-passe
                    </label>
                    <input
                      type="password"
                      required
                      value={adminForm.password}
                      onChange={(e) => setAdminForm((p) => ({ ...p, password: e.target.value }))}
                      placeholder="Mínimo 4 caracteres"
                      className="w-full py-2.5 px-3 bg-slate-100 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#0b1f3a] outline-none text-sm transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase font-bold tracking-wider text-slate-600 mb-1">
                      Confirmar Palavra-passe
                    </label>
                    <input
                      type="password"
                      required
                      value={adminForm.confirmPassword}
                      onChange={(e) => setAdminForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                      placeholder="Repita a palavra-passe"
                      className="w-full py-2.5 px-3 bg-slate-100 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#0b1f3a] outline-none text-sm transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-white bg-[#0b1f3a] hover:bg-[#7a0c0c] transition-colors duration-200 shadow-md text-sm cursor-pointer mt-2"
                >
                  <span>Continuar para Dados da Instituição</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </form>

              <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={() => {
                    resetRegistrationFlow();
                    setMode('login');
                  }}
                  className="text-xs font-bold text-slate-500 hover:text-[#0b1f3a] hover:underline flex items-center gap-1 justify-center w-full"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  <span>Voltar ao Início de Sessão</span>
                </button>
              </div>
            </div>
          )}

          {mode === 'register-institution' && (
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-6 h-6 rounded-full bg-[#0b1f3a] text-white text-[11px] font-bold flex items-center justify-center">2</span>
                    <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">de 2 · Dados da Instituição</span>
                  </div>
                  <h2 className="font-headline text-2xl font-bold text-slate-900">Configurar a Instituição</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Pode preencher agora ou saltar este passo e configurar mais tarde em Configurações → Dados da Instituição.
                  </p>
                </div>
              </div>

              {registerError && (
                <div className="mt-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5 animate-in fade-in">
                  <span className="material-symbols-outlined text-red-600 text-[18px] shrink-0 mt-0.5">error</span>
                  <span>{registerError}</span>
                </div>
              )}

              <form onSubmit={handleSubmitInstitutionStep} className="mt-6 space-y-4">
                <div>
                  <label className="block text-[11px] uppercase font-bold tracking-wider text-slate-600 mb-1">
                    Nome da Instituição de Ensino
                  </label>
                  <input
                    type="text"
                    value={institutionForm.schoolName}
                    onChange={(e) => setInstitutionForm((p) => ({ ...p, schoolName: e.target.value }))}
                    placeholder="ex: Complexo Escolar Privado ABC"
                    className="w-full py-2.5 px-3 bg-slate-100 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#0b1f3a] outline-none text-sm transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] uppercase font-bold tracking-wider text-slate-600 mb-1">
                      NIF
                    </label>
                    <input
                      type="text"
                      value={institutionForm.nif}
                      onChange={(e) => setInstitutionForm((p) => ({ ...p, nif: e.target.value }))}
                      className="w-full py-2.5 px-3 bg-slate-100 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#0b1f3a] outline-none text-sm transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase font-bold tracking-wider text-slate-600 mb-1">
                      Ano Letivo Atual
                    </label>
                    <input
                      type="text"
                      value={institutionForm.currentAcademicYear}
                      onChange={(e) => setInstitutionForm((p) => ({ ...p, currentAcademicYear: e.target.value }))}
                      placeholder="2025/2026"
                      className="w-full py-2.5 px-3 bg-slate-100 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#0b1f3a] outline-none text-sm transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] uppercase font-bold tracking-wider text-slate-600 mb-1">
                      Província
                    </label>
                    <input
                      type="text"
                      value={institutionForm.province}
                      onChange={(e) => setInstitutionForm((p) => ({ ...p, province: e.target.value }))}
                      className="w-full py-2.5 px-3 bg-slate-100 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#0b1f3a] outline-none text-sm transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase font-bold tracking-wider text-slate-600 mb-1">
                      Município
                    </label>
                    <input
                      type="text"
                      value={institutionForm.municipality}
                      onChange={(e) => setInstitutionForm((p) => ({ ...p, municipality: e.target.value }))}
                      className="w-full py-2.5 px-3 bg-slate-100 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#0b1f3a] outline-none text-sm transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-bold tracking-wider text-slate-600 mb-1">
                    Endereço da Sede
                  </label>
                  <input
                    type="text"
                    value={institutionForm.address}
                    onChange={(e) => setInstitutionForm((p) => ({ ...p, address: e.target.value }))}
                    className="w-full py-2.5 px-3 bg-slate-100 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#0b1f3a] outline-none text-sm transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] uppercase font-bold tracking-wider text-slate-600 mb-1">
                      Telefone
                    </label>
                    <input
                      type="text"
                      value={institutionForm.phone}
                      onChange={(e) => setInstitutionForm((p) => ({ ...p, phone: e.target.value }))}
                      className="w-full py-2.5 px-3 bg-slate-100 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#0b1f3a] outline-none text-sm transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase font-bold tracking-wider text-slate-600 mb-1">
                      E-mail da Secretaria
                    </label>
                    <input
                      type="email"
                      value={institutionForm.email}
                      onChange={(e) => setInstitutionForm((p) => ({ ...p, email: e.target.value }))}
                      className="w-full py-2.5 px-3 bg-slate-100 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#0b1f3a] outline-none text-sm transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={handleSkipInstitutionStep}
                    className="w-full sm:w-auto flex items-center justify-center gap-1.5 py-3 px-5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors duration-200 text-sm cursor-pointer"
                  >
                    <span>Pular por Agora</span>
                  </button>
                  <button
                    type="submit"
                    className="w-full flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-white bg-[#0b1f3a] hover:bg-[#7a0c0c] transition-colors duration-200 shadow-md text-sm cursor-pointer"
                  >
                    <span>Concluir e Criar Instituição</span>
                    <span className="material-symbols-outlined text-[18px]">check</span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 text-center">
                  Se saltar este passo, os dados da instituição, ano letivo, calendário e tabela financeira ficarão vazios até serem configurados em Configurações.
                </p>
              </form>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setMode('register-admin')}
                  className="text-xs font-bold text-slate-500 hover:text-[#0b1f3a] hover:underline flex items-center gap-1 justify-center w-full"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  <span>Voltar aos Dados do Administrador</span>
                </button>
              </div>
            </div>
          )}

          <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
            <div className="flex items-center gap-3">
              <span>© 2025 BandMed</span>
              <span>•</span>
              <span>Ambiente Seguro SSL</span>
            </div>
            <span className="font-mono text-[11px]">Sistema Académico MED</span>
          </div>
        </div>
      </div>

      {/* Institutional Password Reset Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0b1f3a] text-[22px]">contact_support</span>
                <h3 className="font-bold text-slate-900 text-sm">Recuperação de Palavra-passe</h3>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="py-4 space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                Por motivos de conformidade e segurança do Ministério da Educação (MED), as redefinições de credenciais são geridas centralmente.
              </p>
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl space-y-1.5 text-blue-950">
                <div className="font-semibold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#0b1f3a]">domain</span>
                  Secretaria Geral & Suporte de TI
                </div>
                <p className="text-[11px]">
                  Dirija-se ao Gabinete de Tecnologias Educativas ou contacte a Secretaria com o seu documento de identificação (Bilhete de Identidade ou Cartão de Estudante).
                </p>
                <div className="text-[11px] pt-1 border-t border-blue-200/50">
                  E-mail: <code>suporte@bandmed.edu.pt</code> | Ramal: 201
                </div>
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 bg-[#0b1f3a] hover:bg-[#7a0c0c] text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      <OperationStatusModal
        isOpen={loginStatus !== 'idle'}
        status={loginStatus === 'loading' ? 'loading' : 'success'}
        loadingMessage="A validar credenciais..."
        successMessage="Operação feita com sucesso!"
      />
    </div>
  );
};
