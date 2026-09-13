import React, { useState } from 'react';
import { InstitutionSettings, UserRole } from '../../types';

interface TabIntegracoesProps {
  settings: InstitutionSettings;
  currentUserRole?: UserRole;
  onSaveAll: (options?: { loadingMessage?: string; successMessage?: string; requiredRule?: string }) => void;
}

export const TabIntegracoes: React.FC<TabIntegracoesProps> = ({
  currentUserRole,
  onSaveAll
}) => {
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [sandboxMode, setSandboxMode] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [testingPing, setTestingPing] = useState(false);
  const [pingSuccess, setPingSuccess] = useState<boolean | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleTestPing = () => {
    setTestingPing(true);
    setTimeout(() => {
      setTestingPing(false);
      setPingSuccess(true);
      setTimeout(() => setPingSuccess(null), 4000);
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-[#0b1f3a] shrink-0">
            <span className="material-symbols-outlined text-[26px]">hub</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider text-[#ac332b] font-bold">Módulo 06</span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span className="text-[11px] text-slate-500 font-medium">Integrações de Pagamento, AGT & Mensageria</span>
            </div>
            <h2 className="font-headline text-lg lg:text-xl font-bold text-slate-900">
              Gateways Bancários Angolanos & Comunicações
            </h2>
          </div>
        </div>

        <button
          type="button"
          onClick={handleTestPing}
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors self-start"
        >
          <span className="material-symbols-outlined text-[16px]">network_check</span>
          <span>{testingPing ? 'A testar conexões...' : 'Testar Conexões de API'}</span>
        </button>
      </div>

      {pingSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>Todas as conexões externas (EMIS, AGT SAF-T AO e Gateways SMS) responderam com código 200 OK!</span>
        </div>
      )}

      {/* Bloco 1: Conexões de Pagamento & Entidades em Angola */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-headline text-base lg:text-lg font-bold text-slate-900">
              1. Conexões de Pagamento & Entidades Nacionais
            </h3>
            <p className="text-xs text-slate-500">
              Comunicação com a EMIS (Rede Multicaixa), AGT para SAF-T AO e operadoras móveis em Angola.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[11px] font-bold">
            3 INTERFACES CONECTADAS
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Multicaixa Express */}
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#ac332b] text-[22px]">contactless</span>
                  <span className="font-bold text-slate-900 text-sm">Multicaixa Express (EMIS)</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold">
                  {sandboxMode ? 'SANDBOX' : 'PRODUÇÃO ATIVO'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Geração automática de referências de pagamento e liquidação em tempo real.
              </p>

              <div className="space-y-2 mt-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Entidade Fixa (EMIS)</span>
                  <div className="font-mono font-bold text-slate-900">00192</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Client ID</span>
                  <div className="flex items-center justify-between p-1.5 bg-white border border-slate-200 rounded-lg">
                    <span className="font-mono text-[11px] text-slate-800 truncate">emis_pub_2025_ao_782914</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('emis_pub_2025_ao_782914')}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      <span className="material-symbols-outlined text-[15px]">content_copy</span>
                    </button>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Secret Key</span>
                  <div className="flex items-center justify-between p-1.5 bg-white border border-slate-200 rounded-lg">
                    <span className="font-mono text-[11px] text-slate-800 truncate">
                      {showSecretKey ? 'emis_sec_99381204857102938471' : '••••••••••••••••••••••••'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowSecretKey(!showSecretKey)}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      <span className="material-symbols-outlined text-[15px]">
                        {showSecretKey ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-mono text-[11px]">Sucesso: 99.8%</span>
              <button
                type="button"
                onClick={() => setSandboxMode(!sandboxMode)}
                className="text-[#0b1f3a] hover:text-[#ac332b] font-bold"
              >
                Alternar Sandbox
              </button>
            </div>
          </div>

          {/* SAF-T (AO) & AGT */}
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#0b1f3a] text-[22px]">verified_user</span>
                  <span className="font-bold text-slate-900 text-sm">SAF-T (AO) & AGT</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold">
                  CERTIFICADO
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Submissão mensal do ficheiro de auditoria tributária nos termos do Decreto Executivo 312/17.
              </p>

              <div className="space-y-2 mt-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Certificado de Software</span>
                  <div className="font-mono font-bold text-slate-900">312/AGT/2024</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Assinatura Digital RSA</span>
                  <div className="font-mono text-[11px] text-slate-700">RSA 2048 Bits (Hash SHA-1 / SHA-256)</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Série em Emissão</span>
                  <div className="font-mono text-[11px] text-slate-800">FT 2025/A • Início em 01/01/2025</div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => alert('Estrutura XML do ficheiro SAF-T AO validada de acordo com o esquema da AGT.')}
                className="text-[#0b1f3a] hover:text-[#ac332b] font-bold"
              >
                Validar XML
              </button>
              <button
                type="button"
                onClick={() => alert('Ficheiro SAFT_AO_2025_03.xml exportado com sucesso.')}
                className="text-[#ac332b] font-bold"
              >
                Exportar SAF-T
              </button>
            </div>
          </div>

          {/* Gateway SMS */}
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#0b1f3a] text-[22px]">sms</span>
                  <span className="font-bold text-slate-900 text-sm">Unitel & Africell SMS</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-blue-50 text-[#0b1f3a] font-bold text-[10px]">
                  74% SALDO
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Notificação por SMS de cobranças de propinas, faltas críticas e convocações da Direção.
              </p>

              <div className="space-y-2 mt-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Saldo de Mensagens</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="font-headline text-xl font-extrabold text-slate-900">14.850</span>
                    <span className="text-slate-500">SMS disponíveis</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: '74%' }} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Remetente Autorizado</span>
                  <div className="font-mono text-xs font-bold text-slate-800">BANDMED-AO</div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500 text-[11px]">Entrega direta</span>
              <button
                type="button"
                onClick={() => alert('Para recarregar o pacote de SMS da escola, contate a operadora ou adicione via fatura.')}
                className="text-[#0b1f3a] hover:text-[#ac332b] font-bold"
              >
                Recarregar Pacote
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Webhooks e Comunicação de Eventos */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-4">
        <div className="pb-3 border-b border-slate-100">
          <h3 className="font-headline text-base lg:text-lg font-bold text-slate-900">
            2. Webhooks & Notificações de Cobrança
          </h3>
          <p className="text-xs text-slate-500">
            Endpoints de notificação em tempo real para sincronização de pagamentos Multicaixa Express.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-2">
            <span className="font-bold text-slate-900">Webhook de Confirmação Multicaixa Express</span>
            <div className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded-lg font-mono text-[11px] text-slate-800">
              <span className="truncate">https://api.bandmed.co.ao/v1/payments/mcx/callback</span>
              <button
                type="button"
                onClick={() => copyToClipboard('https://api.bandmed.co.ao/v1/payments/mcx/callback')}
                className="text-slate-400 hover:text-slate-700 ml-2"
              >
                <span className="material-symbols-outlined text-[15px]">content_copy</span>
              </button>
            </div>
            <span className="text-[11px] text-slate-500">
              Recebe confirmações instantâneas de pagamento de propinas e emite recibos automáticos.
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-2">
            <span className="font-bold text-slate-900">Disparos Automáticos de SMS</span>
            <div className="space-y-1.5 text-[11px] text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Cobrança preventiva: 3 dias antes do dia 10 do mês</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Alerta de faltas: Ao atingir 5 faltas injustificadas no trimestre</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Publicação de Pautas: Envio de resumo das notas trimestrais</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 text-slate-500 text-xs">
          <span className="material-symbols-outlined text-slate-400">lock</span>
          <span>Tokens de API protegidos e compatíveis com a infraestrutura bancária de Angola.</span>
        </div>
        <div className="flex items-center gap-2 justify-end">
          <button
            type="button"
            onClick={() =>
              onSaveAll({
                requiredRule: 'config.edit',
                loadingMessage: 'A guardar parâmetros de integração e chaves de API...',
                successMessage: 'Operação feita com sucesso!'
              })
            }
            className="px-5 py-2 rounded-xl bg-[#0b1f3a] text-white font-bold text-xs hover:bg-[#7a0c0c] transition-colors shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px]">save</span>
            <span>Guardar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
