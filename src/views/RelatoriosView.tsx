import React, { useState } from 'react';
import { SchoolDatabase, UserRole } from '../types';

interface RelatoriosViewProps {
  db: SchoolDatabase;
  currentUserRole: UserRole;
}

export const RelatoriosView: React.FC<RelatoriosViewProps> = ({ db }) => {
  const [selectedReport, setSelectedReport] = useState<string>('aproveitamento');

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCsv = (reportName: string) => {
    const csvContent = "data:text/csv;charset=utf-8," +
      "Codigo,Descricao,Estatuto,Total\n" +
      "10A,Matematica A,98.2%,16.4\n" +
      "10B,Fisica e Quimica A,94.0%,15.0\n" +
      "11A,Biologia e Geologia,96.5%,15.8\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${reportName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col w-full gap-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
              Estatística & Auditoria
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#0b1f3a]" />
            <span className="text-xs font-semibold text-[#0b1f3a]">Mapas Oficiais MED</span>
          </div>
          <h1 className="font-headline text-2xl lg:text-3xl font-extrabold text-[#0b1f3a] tracking-tight">
            Relatórios & Auditoria Escolar
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Documentos consolidados para Inspeção Geral da Educação, Conselho Pedagógico e Direção Financeira.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-[#0b1f3a] hover:bg-[#7a0c0c] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            <span>Imprimir Relatório Selecionado</span>
          </button>
        </div>
      </div>

      {/* Reports Library Selection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setSelectedReport('aproveitamento')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            selectedReport === 'aproveitamento'
              ? 'bg-white border-[#0b1f3a] shadow-md ring-2 ring-[#0b1f3a]/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0b1f3a] flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-[22px]">trending_up</span>
          </div>
          <h3 className="font-bold text-sm text-[#0b1f3a]">Mapa de Aproveitamento</h3>
          <p className="text-[11px] text-slate-500 mt-1">Taxas de aprovação, médias por turma e disciplinas críticas.</p>
        </div>

        <div
          onClick={() => setSelectedReport('financeiro')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            selectedReport === 'financeiro'
              ? 'bg-white border-[#0b1f3a] shadow-md ring-2 ring-[#0b1f3a]/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-[22px]">account_balance</span>
          </div>
          <h3 className="font-bold text-sm text-[#0b1f3a]">Balancete de Propinas</h3>
          <p className="text-[11px] text-slate-500 mt-1">Receitas em Kwanzas Kz, dívidas em mora e índice de cobrança.</p>
        </div>

        <div
          onClick={() => setSelectedReport('assiduidade')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            selectedReport === 'assiduidade'
              ? 'bg-white border-[#0b1f3a] shadow-md ring-2 ring-[#0b1f3a]/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-red-50 text-[#7a0c0c] flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-[22px]">fact_check</span>
          </div>
          <h3 className="font-bold text-sm text-[#0b1f3a]">Mapa de Assiduidade</h3>
          <p className="text-[11px] text-slate-500 mt-1">Faltas justificadas e injustificadas por nível de ensino.</p>
        </div>

        <div
          onClick={() => setSelectedReport('docentes')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            selectedReport === 'docentes'
              ? 'bg-white border-[#0b1f3a] shadow-md ring-2 ring-[#0b1f3a]/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-800 flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-[22px]">badge</span>
          </div>
          <h3 className="font-bold text-sm text-[#0b1f3a]">Efetivo Docente</h3>
          <p className="text-[11px] text-slate-500 mt-1">Distribuição de carga horária e alocações de departamentos.</p>
        </div>
      </div>

      {/* Selected Report Preview Sheet */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-6 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Documento Oficial Consolidado
            </span>
            <h2 className="font-headline text-lg font-bold text-[#0b1f3a]">
              {selectedReport === 'aproveitamento' && 'Mapa Trimestral de Aproveitamento Escolar'}
              {selectedReport === 'financeiro' && 'Balancete Financeiro de Execução de Mensalidades (Kz)'}
              {selectedReport === 'assiduidade' && 'Quadro Estatístico de Faltas & Assiduidade Docente e Discente'}
              {selectedReport === 'docentes' && 'Relação Geral do Corpo Docente & Carga Horária'}
            </h2>
            <span className="text-xs text-slate-500">
              Ano Letivo {db.settings.currentAcademicYear} • Emitido em {new Date().toLocaleDateString('pt-PT')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDownloadCsv(selectedReport)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">file_download</span>
              <span>Exportar CSV / Excel</span>
            </button>
          </div>
        </div>

        {/* Dynamic Report Table Content */}
        {selectedReport === 'aproveitamento' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                  <th className="py-3 px-3">Turma & Nível</th>
                  <th className="py-3 px-3 text-center">N.º Alunos</th>
                  <th className="py-3 px-3 text-center">Transição (%)</th>
                  <th className="py-3 px-3 text-center">Média Geral</th>
                  <th className="py-3 px-3">Disciplina com Maior Rigor</th>
                  <th className="py-3 px-3">Diretor de Turma</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-bold text-[#0b1f3a]">10º Ano - Turma A</td>
                  <td className="py-3 px-3 text-center">28</td>
                  <td className="py-3 px-3 text-center font-bold text-emerald-700">96.4%</td>
                  <td className="py-3 px-3 text-center font-mono font-bold">15.8</td>
                  <td className="py-3 px-3 text-slate-600">Matemática A (13.9)</td>
                  <td className="py-3 px-3 text-slate-700">Prof. João Figueiredo</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-bold text-[#0b1f3a]">10º Ano - Turma B</td>
                  <td className="py-3 px-3 text-center">26</td>
                  <td className="py-3 px-3 text-center font-bold text-emerald-700">92.3%</td>
                  <td className="py-3 px-3 text-center font-mono font-bold">14.9</td>
                  <td className="py-3 px-3 text-slate-600">Física e Química A (13.1)</td>
                  <td className="py-3 px-3 text-slate-700">Prof.ª Margarida Fontes</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-bold text-[#0b1f3a]">11º Ano - Turma B (Saúde)</td>
                  <td className="py-3 px-3 text-center">24</td>
                  <td className="py-3 px-3 text-center font-bold text-emerald-700">95.8%</td>
                  <td className="py-3 px-3 text-center font-mono font-bold">16.2</td>
                  <td className="py-3 px-3 text-slate-600">Anatomia Humana (14.5)</td>
                  <td className="py-3 px-3 text-slate-700">Dra. Beatriz Cambuta</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {selectedReport === 'financeiro' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                  <th className="py-3 px-3">Ciclo Curricular</th>
                  <th className="py-3 px-3">Valor / Aluno</th>
                  <th className="py-3 px-3">Previsto Total (Kz)</th>
                  <th className="py-3 px-3">Cobrado (Kz)</th>
                  <th className="py-3 px-3">Em Mora (Kz)</th>
                  <th className="py-3 px-3 text-center">Taxa de Execução</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-bold text-[#0b1f3a]">1.º Ciclo do Ensino Básico</td>
                  <td className="py-3 px-3 font-mono">65.000 Kz</td>
                  <td className="py-3 px-3 font-mono">23.000.000 Kz</td>
                  <td className="py-3 px-3 font-mono text-emerald-700 font-bold">22.400.000 Kz</td>
                  <td className="py-3 px-3 font-mono text-[#7a0c0c]">600.000 Kz</td>
                  <td className="py-3 px-3 text-center font-bold text-emerald-700">97.4%</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-bold text-[#0b1f3a]">2.º Ciclo do Ensino Básico</td>
                  <td className="py-3 px-3 font-mono">75.000 Kz</td>
                  <td className="py-3 px-3 font-mono">21.100.000 Kz</td>
                  <td className="py-3 px-3 font-mono text-emerald-700 font-bold">19.800.000 Kz</td>
                  <td className="py-3 px-3 font-mono text-[#7a0c0c]">1.300.000 Kz</td>
                  <td className="py-3 px-3 text-center font-bold text-emerald-700">93.8%</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-bold text-[#0b1f3a]">Ensino Secundário Geral</td>
                  <td className="py-3 px-3 font-mono">90.000 Kz</td>
                  <td className="py-3 px-3 font-mono">23.200.000 Kz</td>
                  <td className="py-3 px-3 font-mono text-emerald-700 font-bold">20.950.000 Kz</td>
                  <td className="py-3 px-3 font-mono text-[#7a0c0c]">2.250.000 Kz</td>
                  <td className="py-3 px-3 text-center font-bold text-emerald-700">90.3%</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {(selectedReport === 'assiduidade' || selectedReport === 'docentes') && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                  <th className="py-3 px-3">Departamento Docente</th>
                  <th className="py-3 px-3 text-center">N.º Professores</th>
                  <th className="py-3 px-3 text-center">Horas Semanais</th>
                  <th className="py-3 px-3 text-center">Assiduidade Docente</th>
                  <th className="py-3 px-3">Regente de Coordenação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-bold text-[#0b1f3a]">Ciências Exatas (Matemática & Física)</td>
                  <td className="py-3 px-3 text-center">18</td>
                  <td className="py-3 px-3 text-center font-mono">380h</td>
                  <td className="py-3 px-3 text-center font-bold text-emerald-700">99.2%</td>
                  <td className="py-3 px-3">Prof. João Figueiredo</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-bold text-[#0b1f3a]">Saúde & Ciências Biomédicas</td>
                  <td className="py-3 px-3 text-center">14</td>
                  <td className="py-3 px-3 text-center font-mono">290h</td>
                  <td className="py-3 px-3 text-center font-bold text-emerald-700">98.5%</td>
                  <td className="py-3 px-3">Dra. Beatriz Cambuta</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
