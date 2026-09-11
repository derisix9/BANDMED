import React, { useState } from 'react';
import { User } from '../types';
import { dbService } from '../services/db';

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    setTimeout(() => {
      const result = dbService.authenticate(identifier, password);
      setLoading(false);

      if (result.success && result.user) {
        if (rememberMe) {
          try {
            localStorage.setItem('bandmed_session_user', JSON.stringify(result.user));
          } catch (err) {
            console.warn('Erro ao salvar sessão:', err);
          }
        }
        onLoginSuccess(result.user);
      } else {
        setErrorMessage(result.error || 'Credenciais inválidas. Verifique o seu e-mail institucional ou n.º de processo e a palavra-passe.');
      }
    }, 400);
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
              <div className="w-14 h-14 bg-white rounded-xl p-2 shadow-md flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#0b1f3a] text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  school
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline font-extrabold text-xl tracking-wider text-white">BANDMED</span>
                <span className="text-[11px] text-blue-200 uppercase tracking-wide font-medium">
                  Plataforma Académica de Gestão
                </span>
              </div>
            </div>

            <div className="mt-8 lg:mt-12">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-semibold backdrop-blur-xs">
                <span className="material-symbols-outlined text-[16px] mr-1.5 text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified
                </span>
                Ano Letivo 2024 / 2025
              </span>
              <h1 className="mt-4 font-headline text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-tight">
                Gestão Escolar, Rigor e Transparência.
              </h1>
              <p className="mt-3 text-sm text-slate-300 leading-relaxed font-body">
                Portal unificado de governação pedagógica, registo de assiduidade, planeamento letivo e acompanhamento financeiro integrado em Kwanza (Kz).
              </p>
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
          </div>

          {/* Footer Info */}
          <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Direção de Tecnologias Educativas</span>
            <span className="bg-white/10 px-2 py-0.5 rounded text-slate-200">v3.4.2 Enterprise</span>
          </div>
        </div>

        {/* Right Authentication Panel */}
        <div className="lg:w-7/12 p-6 lg:p-12 flex flex-col justify-between bg-white">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-headline text-2xl font-bold text-slate-900">Iniciar Sessão</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Introduza os seus dados de acesso institucionais para entrar na plataforma.
                </p>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span>Portal Ativo</span>
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
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
            <div className="flex items-center gap-3">
              <span>© 2025 BandMed</span>
              <span>•</span>
              <span>Decreto Executivo n.º 412/18</span>
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
    </div>
  );
};
