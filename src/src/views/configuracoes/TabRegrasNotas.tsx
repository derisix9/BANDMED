import React, { useState } from 'react';
import { InstitutionSettings } from '../../types';

interface TabRegrasNotasProps {
  settings: InstitutionSettings;
  onSaveAll: () => void;
}

export const TabRegrasNotas: React.FC<TabRegrasNotasProps> = ({ settings, onSaveAll }) => {
  const [bloqueioFracionario, setBloqueioFracionario] = useState(true);
  const [dispensaExameVal, setDispensaExameVal] = useState('14.0');
  const [macPeso, setMacPeso] = useState(30);
  const [ppPeso, setPpPeso] = useState(30);
  const [ptPeso, setPtPeso] = useState(40);

  const totalPeso = macPeso + ppPeso + ptPeso;

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-[#0b1f3a] shrink-0">
            <span className="material-symbols-outlined text-[26px]">rule</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider text-[#ac332b] font-bold">Módulo 04</span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span className="text-[11px] text-slate-500 font-medium">Decreto Executivo Regulamentar MED</span>
            </div>
            <h2 className="font-headline text-lg lg:text-xl font-bold text-slate-900">
              Regulamento de Avaliação das Aprendizagens & Escala de Notas
            </h2>
          </div>
        </div>

        <span className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-800 font-mono text-xs font-bold self-start">
          ESCALA OFICIAL 0 — 20
        </span>
      </div>

      {/* Bloco 1: Escala Numérica Oficial */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-headline text-base lg:text-lg font-bold text-slate-900">
              1. Escala Numérica Oficial da República de Angola (MED)
            </h3>
            <p className="text-xs text-slate-500">
              Intervalos de transição, condições de recurso e regras matemáticas de arredondamento de pauta.
            </p>
          </div>
          <span className="material-symbols-outlined text-[#ac332b] text-[22px]">verified</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                Transição Direta
              </span>
              <div className="font-headline text-2xl font-extrabold text-slate-900 mt-1">10.0 a 20.0</div>
              <p className="text-xs text-slate-500 mt-1">
                Aprovado por aproveitamento curricular sem necessidade de prova de recurso.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] font-bold text-emerald-800">
              Condição: Aprovado
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                Intervalo de Recurso
              </span>
              <div className="font-headline text-2xl font-extrabold text-slate-900 mt-1">7.0 a 9.4</div>
              <p className="text-xs text-slate-500 mt-1">
                Elegível para inscrição no Exame de Recurso (conforme limite de cadeiras em atraso).
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] font-bold text-amber-800">
              Condição: Exame de Recurso
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#ac332b] uppercase tracking-wider">
                Reprovação Direta
              </span>
              <div className="font-headline text-2xl font-extrabold text-slate-900 mt-1">&lt; 7.0 Valores</div>
              <p className="text-xs text-slate-500 mt-1">
                Retenção automática no ano letivo. Sem direito a realização de prova de exame.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] font-bold text-[#ac332b]">
              Condição: Retido / Não Aprovado
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Arredondamento Oficial
              </span>
              <div className="font-headline text-2xl font-extrabold text-[#0b1f3a] mt-1">&gt;= 0.50</div>
              <p className="text-xs text-slate-500 mt-1">
                Médias com centésimas superiores ou iguais a 0.50 arredondam para o valor inteiro acima (ex: 9.5 &rarr; 10).
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] font-mono font-bold text-slate-700">
              Regra Oficial Angolana
            </div>
          </div>
        </div>

        {/* Toggle Fracionário */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-bold text-slate-800 text-xs">Bloqueio Rigoroso de Inserção Fracionária</span>
            <span className="text-[11px] text-slate-500 mt-0.5">
              Impede que professores lancem notas com mais de uma casa decimal (aceita apenas formato ex: 14.5 ou 15.0).
            </span>
          </div>
          <button
            type="button"
            onClick={() => setBloqueioFracionario(!bloqueioFracionario)}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
              bloqueioFracionario ? 'bg-[#0b1f3a]' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                bloqueioFracionario ? 'right-1' : 'left-1'
              }`}
            />
          </button>
        </div>
      </section>

      {/* Bloco 2: Fórmula e Composição da Média Trimestral (MT) */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-headline text-base lg:text-lg font-bold text-slate-900">
              2. Fórmula e Composição da Média Trimestral (MT)
            </h3>
            <p className="text-xs text-slate-500">
              Ponderação percentual regulamentada para cálculo automático das notas em todas as cadernetas.
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 font-mono text-xs font-bold text-slate-800 self-start">
            MT = (MAC × 0.30) + (PP × 0.30) + (PT × 0.40)
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-xs">Mini-Avaliações Contínuas (MAC)</span>
              <span className="font-mono text-xs font-bold bg-[#0b1f3a] text-white px-2 py-0.5 rounded">
                {macPeso}%
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Mínimo de 3 notas por trimestre: trabalhos de casa, perguntas orais, fichas de sala e participação.
            </p>
            <div className="mt-2 text-[11px] text-slate-600 font-medium">
              Média Aritmética das notas lançadas
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-xs">Prova do Professor (PP)</span>
              <span className="font-mono text-xs font-bold bg-[#0b1f3a] text-white px-2 py-0.5 rounded">
                {ppPeso}%
              </span>
            </div>
            <p className="text-xs text-slate-500">
              1 Prova formal individual realizada a meio do trimestre pelo professor da turma.
            </p>
            <div className="mt-2 text-[11px] text-slate-600 font-medium">
              Escala de 0 a 20 valores
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-xs">Prova Trimestral de Escola (PT)</span>
              <span className="font-mono text-xs font-bold bg-[#ac332b] text-white px-2 py-0.5 rounded">
                {ptPeso}%
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Prova geral unificada elaborada e supervisionada pela Direção Pedagógica no final do trimestre.
            </p>
            <div className="mt-2 text-[11px] text-slate-600 font-medium">
              Escala de 0 a 20 valores
            </div>
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-emerald-700">check_circle</span>
            <span className="font-bold text-slate-800">
              Validação de Balanço Ponderal: {macPeso}% + {ppPeso}% + {ptPeso}% = {totalPeso}%
            </span>
          </div>
          <span className="font-mono text-[11px] text-emerald-800 font-bold bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
            Equilíbrio Válido (100%)
          </span>
        </div>
      </section>

      {/* Bloco 3: Classificação Final (CFA / CFD) */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-4">
        <div className="pb-3 border-b border-slate-100">
          <h3 className="font-headline text-base lg:text-lg font-bold text-slate-900">
            3. Classificação Anual & Fim de Ciclo (CAP / CFD)
          </h3>
          <p className="text-xs text-slate-500">
            Normas de transição entre trimestres e dispensa de exame final de ciclo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between gap-2">
            <div>
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Classificação Anual Pedagógica (CAP)
              </span>
              <div className="font-headline text-xl font-bold text-slate-900 mt-1 font-mono">
                (MT1 + MT2 + MT3) ÷ 3
              </div>
              <p className="text-slate-500 text-[11px] mt-1">
                Média aritmética direta dos três trimestres letivos do ano corrente.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between gap-2">
            <div>
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Dispensa de Exame Final
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-headline text-2xl font-extrabold text-emerald-800">
                  &gt;= {dispensaExameVal}
                </span>
                <span className="text-xs text-slate-500">Valores</span>
              </div>
              <p className="text-slate-500 text-[11px] mt-1">
                Alunos com CAP igual ou superior a {dispensaExameVal} dispensam automaticamente do exame final.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between gap-2">
            <div>
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Alunos em Exame de Fim de Ano
              </span>
              <div className="font-headline text-xl font-bold text-slate-900 mt-1 font-mono">
                (CAP × 0.40) + (Exame × 0.60)
              </div>
              <p className="text-slate-500 text-[11px] mt-1">
                Fórmula de Classificação Final (CF) para quem realiza prova de exame nos anos de exame nacional.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bloco 4: Menções Qualitativas */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-4">
        <div className="pb-3 border-b border-slate-100">
          <h3 className="font-headline text-base lg:text-lg font-bold text-slate-900">
            4. Menções Qualitativas Oficiais do Boletim
          </h3>
          <p className="text-xs text-slate-500">
            Correspondência entre escala numérica e menção verbal impressa nos certificados e pautas afixadas.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100">
                <th className="py-3 px-4 rounded-l-lg">Intervalo Numérico</th>
                <th className="py-3 px-4">Menção Qualitativa</th>
                <th className="py-3 px-4">Efeito Curricular</th>
                <th className="py-3 px-4 text-right rounded-r-lg">Estatuto de Pauta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 font-mono font-bold text-slate-900">19 — 20</td>
                <td className="py-3 px-4 font-bold text-[#0b1f3a]">Excelente</td>
                <td className="py-3 px-4 text-slate-600">Menção de Louvor & Quadro de Honra Institucional</td>
                <td className="py-3 px-4 text-right">
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-[#0b1f3a] font-bold text-[11px]">
                    Louvor
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 font-mono font-bold text-slate-900">16 — 18</td>
                <td className="py-3 px-4 font-bold text-emerald-800">Muito Bom</td>
                <td className="py-3 px-4 text-slate-600">Aprovado com Mérito Académico</td>
                <td className="py-3 px-4 text-right">
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold text-[11px]">
                    Aprovado
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 font-mono font-bold text-slate-900">14 — 15</td>
                <td className="py-3 px-4 font-bold text-slate-800">Bom</td>
                <td className="py-3 px-4 text-slate-600">Aprovado Satisfatoriamente</td>
                <td className="py-3 px-4 text-right">
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[11px]">
                    Aprovado
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 font-mono font-bold text-slate-900">10 — 13</td>
                <td className="py-3 px-4 font-bold text-slate-800">Suficiente</td>
                <td className="py-3 px-4 text-slate-600">Transita de Ano no Limiar Mínimo</td>
                <td className="py-3 px-4 text-right">
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[11px]">
                    Transita
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 font-mono font-bold text-[#ac332b]">0 — 9</td>
                <td className="py-3 px-4 font-bold text-[#ac332b]">Insuficiente</td>
                <td className="py-3 px-4 text-slate-600">Encaminhado para Recurso ou Retenção</td>
                <td className="py-3 px-4 text-right">
                  <span className="px-2 py-0.5 rounded bg-red-50 text-[#ac332b] font-bold text-[11px]">
                    Recurso / Reprova
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Bloco 5: Políticas de Trancamento e Retificação */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-slate-900 text-sm">
            Políticas de Trancamento & Retificação de Pautas
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Retificações administrativas só são permitidas durante 7 dias úteis após afixação e exigem parecer da Direção Pedagógica.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setMacPeso(30);
              setPpPeso(30);
              setPtPeso(40);
              setDispensaExameVal('14.0');
              alert('Parâmetros restaurados para o padrão oficial do Ministério da Educação de Angola.');
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
          >
            Repor Padrão MED
          </button>
          <button
            type="button"
            onClick={onSaveAll}
            className="px-4 py-2 rounded-xl bg-[#0b1f3a] hover:bg-[#7a0c0c] text-white font-bold text-xs transition-colors shadow-xs flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">save</span>
            <span>Guardar Regras de Avaliação</span>
          </button>
        </div>
      </div>
    </div>
  );
};
