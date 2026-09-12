import React, { useState } from 'react';
import { SchoolDatabase, UserRole } from '../types';

interface ImportarPautaExcelViewProps {
  db: SchoolDatabase;
  currentUserRole: UserRole;
  onBackToPautas: () => void;
  onNavigateToHomologacao?: () => void;
}

interface PreviewStudent {
  row: number;
  proc: string;
  name: string;
  mac: number;
  npp: number;
  npt: number;
  mt: number;
  qualitative: string;
  situation: string;
  validationStatus: 'valid' | 'warning' | 'error';
  validationNote: string;
}

export const ImportarPautaExcelView: React.FC<ImportarPautaExcelViewProps> = ({
  db,
  currentUserRole,
  onBackToPautas,
  onNavigateToHomologacao
}) => {
  const [currentStep, setCurrentStep] = useState<number>(2);
  const [activeFilter, setActiveFilter] = useState<'all' | 'aptos' | 'recurso' | 'reprovados' | 'avisos'>('all');
  const [isLegalConfirmed, setIsLegalConfirmed] = useState<boolean>(true);
  const [fileName, setFileName] = useState<string>('Pauta_10A_Fisica_Quimica_2Trimestre_2026.xlsx');
  const [fileSize, setFileSize] = useState<string>('142 KB');
  const [importSuccess, setImportSuccess] = useState<boolean>(false);

  const previewRecords: PreviewStudent[] = [
    {
      row: 2,
      proc: '2024-041',
      name: 'Afonso Miguel Santos Ramos',
      mac: 19.4,
      npp: 19.0,
      npt: 18.5,
      mt: 19.1,
      qualitative: 'Excelente',
      situation: 'Transita (Dispensa)',
      validationStatus: 'valid',
      validationNote: 'Validado'
    },
    {
      row: 3,
      proc: '2024-052',
      name: 'Beatriz Lourenço Valente',
      mac: 14.8,
      npp: 15.2,
      npt: 16.0,
      mt: 15.4,
      qualitative: 'Bom',
      situation: 'Transita (Dispensa)',
      validationStatus: 'valid',
      validationNote: 'Validado'
    },
    {
      row: 4,
      proc: '2024-068',
      name: 'Duarte Nuno Figueiredo',
      mac: 7.2,
      npp: 8.5,
      npt: 8.0,
      mt: 7.9,
      qualitative: 'Insuficiente',
      situation: 'Exame de Recurso',
      validationStatus: 'valid',
      validationNote: 'Validado'
    },
    {
      row: 5,
      proc: '2024-073',
      name: 'Inês Carmo Silveira',
      mac: 10.2,
      npp: 11.5,
      npt: 13.0,
      mt: 11.7,
      qualitative: 'Suficiente',
      situation: 'Transita',
      validationStatus: 'valid',
      validationNote: 'Validado'
    },
    {
      row: 6,
      proc: '2024-089',
      name: 'Rodrigo Manuel Paiva',
      mac: 16.5,
      npp: 17.0,
      npt: 17.5,
      mt: 17.1,
      qualitative: 'Muito Bom',
      situation: 'Transita (Dispensa)',
      validationStatus: 'valid',
      validationNote: 'Validado'
    },
    {
      row: 7,
      proc: '2024-095',
      name: 'Sara Cristina Moreira',
      mac: 8.9,
      npp: 9.4,
      npt: 10.0,
      mt: 9.5,
      qualitative: 'Insuficiente',
      situation: 'Exame de Recurso',
      validationStatus: 'warning',
      validationNote: 'Aviso (Normalizado)'
    },
    {
      row: 8,
      proc: '2024-102',
      name: 'Paulo Kiala Sebastião',
      mac: 12.0,
      npp: 11.0,
      npt: 13.5,
      mt: 12.3,
      qualitative: 'Suficiente',
      situation: 'Transita',
      validationStatus: 'valid',
      validationNote: 'Validado'
    },
    {
      row: 9,
      proc: '2024-118',
      name: 'Tatiana Nzola Gaspar',
      mac: 15.0,
      npp: 14.5,
      npt: 16.0,
      mt: 15.3,
      qualitative: 'Bom',
      situation: 'Transita (Dispensa)',
      validationStatus: 'valid',
      validationNote: 'Validado'
    }
  ];

  const filteredList = previewRecords.filter((r) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'aptos') return r.situation.includes('Transita');
    if (activeFilter === 'recurso') return r.situation.includes('Recurso');
    if (activeFilter === 'reprovados') return r.mt < 7.0;
    if (activeFilter === 'avisos') return r.validationStatus === 'warning';
    return true;
  });

  const handleConfirmImport = () => {
    if (!isLegalConfirmed) {
      alert('Por favor confirme a Declaração de Conformidade Pedagógica antes de prosseguir.');
      return;
    }
    setImportSuccess(true);
    setTimeout(() => {
      setImportSuccess(false);
      if (onNavigateToHomologacao) {
        onNavigateToHomologacao();
      } else {
        onBackToPautas();
      }
    }, 2000);
  };

  const handleDownloadTemplate = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'N_ORDEM;PROC_ID;NOME_ALUNO;SEXO_IDADE;NOTA_MAC;NOTA_NPP;NOTA_NPT\n' +
      '1;2024-041;Afonso Miguel Santos Ramos;M 15;19.4;19.0;18.5\n' +
      '2;2024-052;Beatriz Lourenco Valente;F 16;14.8;15.2;16.0\n' +
      '3;2024-068;Duarte Nuno Figueiredo;M 16;7.2;8.5;8.0\n' +
      '4;2024-073;Ines Carmo Silveira;F 15;10.2;11.5;13.0\n' +
      '5;2024-089;Rodrigo Manuel Paiva;M 15;16.5;17.0;17.5\n';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Modelo_Pauta_MED_Angola_v2.4.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCsv = () => {
    const csvRows = [
      'Linha;Processo;Nome;MAC_30;NPP_30;NPT_40;MT_Calculada;Classificacao;Situacao;Validacao',
      ...previewRecords.map(
        (r) =>
          `${r.row};${r.proc};${r.name};${r.mac};${r.npp};${r.npt};${r.mt};${r.qualitative};${r.situation};${r.validationNote}`
      )
    ];
    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csvRows.join('\n'));
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Auditoria_Importacao_Pauta_10A.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col w-full gap-6 pb-12">
      {/* 1. Breadcrumbs & Compliance Badges */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-xs font-semibold text-slate-400 uppercase tracking-wider flex-wrap">
          <button onClick={onBackToPautas} className="hover:underline text-slate-500">
            GOVERNAÇÃO PEDAGÓGICA
          </button>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <button onClick={onBackToPautas} className="hover:underline text-slate-500">
            AVALIAÇÃO & EXAMES
          </button>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-[#0b1f3a] font-bold">IMPORTAR PAUTA EXCEL</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-50 text-[#0b1f3a] font-label text-xs font-bold border border-blue-200">
            <span className="material-symbols-outlined text-[14px] text-[#0b1f3a]">verified</span>
            Norma MED 2025/2026
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 text-slate-600 font-label text-xs">
            <span className="material-symbols-outlined text-[14px]">description</span>
            Suporta .XLSX, .XLS, .CSV
          </span>
        </div>
      </div>

      {/* 2. Page Header Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
        <div className="space-y-1 max-w-4xl">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#0b1f3a] text-white flex items-center justify-center shadow-xs shrink-0">
              <span className="material-symbols-outlined text-[24px]">upload_file</span>
            </div>
            <div>
              <h1 className="font-headline text-2xl font-bold text-slate-900 tracking-tight">
                Importação de Pauta & Mini-Pauta Oficial (Excel)
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Carregue o ficheiro de notas da turma para validação automática de pesos ministeriais (MAC 30%, NPP 30%, NPT 40%), consistência de processos e verificação de integridade SIGE.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={() => alert('Orientações MED:\n1. Colunas obrigatórias: N_ORDEM, PROC_ID, NOME_ALUNO, NOTA_MAC, NOTA_NPP, NOTA_NPT.\n2. Valores permitidos de 0 a 20 com até 1 casa decimal.\n3. O sistema calcula a Média Trimestral automaticamente com os coeficientes 0.3, 0.3 e 0.4.')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">help_outline</span>
            Instruções
          </button>
          <button
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0b1f3a] hover:bg-[#7a0c0c] text-white font-bold text-xs transition-colors shadow-sm"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">table_view</span>
            Descarregar Modelo Oficial MED (.xlsx)
            <span className="px-1.5 py-0.5 rounded bg-white/20 text-white font-mono text-[10px]">v2.4</span>
          </button>
        </div>
      </div>

      {importSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600 text-[20px]">check_circle</span>
            <span>Importação efetuada com sucesso! Redirecionando para a Homologação Oficial de Pauta...</span>
          </div>
        </div>
      )}

      {/* 3. Stepper (4 Steps) */}
      <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div
            onClick={() => setCurrentStep(1)}
            className={`flex items-center gap-2.5 p-2.5 rounded-lg cursor-pointer transition-colors ${
              currentStep === 1 ? 'bg-[#0b1f3a] text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
            }`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
              currentStep === 1 ? 'bg-white text-[#0b1f3a]' : 'bg-emerald-600 text-white'
            }`}>
              <span className="material-symbols-outlined text-[16px]">check</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold truncate">1. Ficheiro & Turma</span>
              <span className="text-[11px] text-slate-400 truncate">Ficheiro processado ({fileSize})</span>
            </div>
          </div>

          <div
            onClick={() => setCurrentStep(2)}
            className={`flex items-center gap-2.5 p-2.5 rounded-lg cursor-pointer transition-colors ${
              currentStep === 2 ? 'bg-[#0b1f3a] text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
            }`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
              currentStep === 2 ? 'bg-amber-400 text-[#0b1f3a]' : 'bg-slate-200 text-slate-700'
            }`}>
              2
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold truncate">2. Mapeamento de Colunas</span>
              <span className={`text-[11px] truncate ${currentStep === 2 ? 'text-slate-300' : 'text-slate-500'}`}>
                8/8 Campos vinculados
              </span>
            </div>
          </div>

          <div
            onClick={() => setCurrentStep(3)}
            className={`flex items-center gap-2.5 p-2.5 rounded-lg cursor-pointer transition-colors ${
              currentStep === 3 ? 'bg-[#0b1f3a] text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
            }`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
              currentStep === 3 ? 'bg-amber-400 text-[#0b1f3a]' : 'bg-slate-200 text-slate-700'
            }`}>
              3
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold truncate">3. Validação & Erros</span>
              <span className="text-[11px] text-slate-400 truncate">26 válidos, 2 avisos</span>
            </div>
          </div>

          <div
            onClick={() => setCurrentStep(4)}
            className={`flex items-center gap-2.5 p-2.5 rounded-lg cursor-pointer transition-colors ${
              currentStep === 4 ? 'bg-[#0b1f3a] text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
            }`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
              currentStep === 4 ? 'bg-amber-400 text-[#0b1f3a]' : 'bg-slate-200 text-slate-700'
            }`}>
              4
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold truncate">4. Homologação & Gravação</span>
              <span className="text-[11px] text-slate-400 truncate">Submissão pedagógica</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Section A: File Details & Metadata Summary */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-[#0b1f3a] flex items-center justify-center shrink-0 border border-slate-200">
              <span className="material-symbols-outlined text-[28px]">receipt_long</span>
            </div>
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-slate-900 text-base font-headline truncate">
                  {fileName}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  Ficheiro Válido • Formato Oficial Reconhecido
                </span>
              </div>
              <div className="flex items-center gap-4 text-slate-500 text-xs flex-wrap">
                <span>Tamanho: <strong className="text-slate-800">{fileSize}</strong></span>
                <span>Folha: <strong className="text-slate-800">Pauta_Regular</strong></span>
                <span>Total Detetado: <strong className="text-slate-800">28 Estudantes</strong></span>
                <span>Motor: <strong className="text-slate-800 font-mono">SIGE-MED Parser v4.2</strong></span>
              </div>
            </div>
          </div>

          <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer shrink-0">
            <span className="material-symbols-outlined text-[16px]">cached</span>
            <span>Substituir Ficheiro</span>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setFileName(e.target.files[0].name);
                  setFileSize(`${Math.round(e.target.files[0].size / 1024)} KB`);
                }
              }}
            />
          </label>
        </div>

        {/* Metadata Pills Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-400">Ano Letivo</span>
            <span className="font-bold text-slate-800 text-sm mt-0.5">{db.settings.currentAcademicYear || '2025 / 2026'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-400">Período Letivo</span>
            <span className="font-bold text-slate-800 text-sm mt-0.5">2.º Trimestre</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-400">Classe / Turma</span>
            <span className="font-bold text-slate-800 text-sm mt-0.5">10.ª Classe - Turma A (Manhã)</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-400">Disciplina</span>
            <span className="font-bold text-slate-800 text-sm mt-0.5">Física e Química</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-400">Docente Responsável</span>
            <span className="font-bold text-slate-800 text-sm mt-0.5 truncate">Prof.ª Margarida Fontes</span>
          </div>
        </div>
      </div>

      {/* 5. Section B: Smart Column Mapping Table */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-headline text-lg font-bold text-slate-900">
              Mapeamento Inteligente de Campos MED (Decreto 04/2026)
            </h2>
            <p className="text-xs text-slate-500">
              Conformidade obrigatória com os ponderadores de avaliação do Ministério da Educação de Angola.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-blue-50 text-[#0b1f3a] text-xs font-bold border border-blue-200">
            8 de 8 Campos Reconhecidos (100%)
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-4">Parâmetro Oficial MED</th>
                <th className="py-2.5 px-4">Coluna do Ficheiro Excel</th>
                <th className="py-2.5 px-4">Tipo & Regra de Validação</th>
                <th className="py-2.5 px-4 text-center">Correspondência</th>
                <th className="py-2.5 px-4 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-2.5 px-4 font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">tag</span>
                  N.º / Ordem
                </td>
                <td className="py-2.5 px-4">
                  <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-slate-800 font-bold">Coluna A: N_ORDEM</span>
                </td>
                <td className="py-2.5 px-4 text-slate-500">Numérico sequencial (1..N)</td>
                <td className="py-2.5 px-4 text-center">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[11px]">100% Match</span>
                </td>
                <td className="py-2.5 px-4 text-right">
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                    <span className="material-symbols-outlined text-[15px]">check_circle</span> Válido
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-2.5 px-4 font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">badge</span>
                  N.º de Processo (SIGE)
                </td>
                <td className="py-2.5 px-4">
                  <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-slate-800 font-bold">Coluna B: PROC_ID</span>
                </td>
                <td className="py-2.5 px-4 text-slate-500">Formato Alfanumérico SIGE (Proc. 2024-XXX)</td>
                <td className="py-2.5 px-4 text-center">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[11px]">100% Match</span>
                </td>
                <td className="py-2.5 px-4 text-right">
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                    <span className="material-symbols-outlined text-[15px]">check_circle</span> Válido
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-2.5 px-4 font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">person</span>
                  Nome Completo do Estudante
                </td>
                <td className="py-2.5 px-4">
                  <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-slate-800 font-bold">Coluna C: NOME_ALUNO</span>
                </td>
                <td className="py-2.5 px-4 text-slate-500">Cadeia de texto padronizada (Maiúsculas / Minúsculas)</td>
                <td className="py-2.5 px-4 text-center">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[11px]">100% Match</span>
                </td>
                <td className="py-2.5 px-4 text-right">
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                    <span className="material-symbols-outlined text-[15px]">check_circle</span> Válido
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-2.5 px-4 font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">wc</span>
                  Género / Idade
                </td>
                <td className="py-2.5 px-4">
                  <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-slate-800 font-bold">Coluna D: SEXO_IDADE</span>
                </td>
                <td className="py-2.5 px-4 text-slate-500">Padrão M / F + Idade do aluno</td>
                <td className="py-2.5 px-4 text-center">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[11px]">100% Match</span>
                </td>
                <td className="py-2.5 px-4 text-right">
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                    <span className="material-symbols-outlined text-[15px]">check_circle</span> Válido
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-2.5 px-4 font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">calculate</span>
                  MAC (Avaliação Contínua - 30%)
                </td>
                <td className="py-2.5 px-4">
                  <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-slate-800 font-bold">Coluna E: NOTA_MAC</span>
                </td>
                <td className="py-2.5 px-4 text-slate-500">Numérico escala 0 a 20 valores (Ponderação 0.30)</td>
                <td className="py-2.5 px-4 text-center">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[11px]">100% Match</span>
                </td>
                <td className="py-2.5 px-4 text-right">
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                    <span className="material-symbols-outlined text-[15px]">check_circle</span> Válido
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-2.5 px-4 font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">edit_document</span>
                  NPP / PP (Prova Parcelar - 30%)
                </td>
                <td className="py-2.5 px-4">
                  <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-slate-800 font-bold">Coluna F: NOTA_NPP</span>
                </td>
                <td className="py-2.5 px-4 text-slate-500">Numérico escala 0 a 20 valores (Ponderação 0.30)</td>
                <td className="py-2.5 px-4 text-center">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[11px]">100% Match</span>
                </td>
                <td className="py-2.5 px-4 text-right">
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                    <span className="material-symbols-outlined text-[15px]">check_circle</span> Válido
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-2.5 px-4 font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">history_edu</span>
                  NPT / PT (Prova Trimestral - 40%)
                </td>
                <td className="py-2.5 px-4">
                  <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-slate-800 font-bold">Coluna G: NOTA_NPT</span>
                </td>
                <td className="py-2.5 px-4 text-slate-500">Numérico escala 0 a 20 valores (Ponderação 0.40)</td>
                <td className="py-2.5 px-4 text-center">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[11px]">100% Match</span>
                </td>
                <td className="py-2.5 px-4 text-right">
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                    <span className="material-symbols-outlined text-[15px]">check_circle</span> Válido
                  </span>
                </td>
              </tr>

              <tr className="bg-slate-50 font-bold">
                <td className="py-2.5 px-4 text-[#0b1f3a] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">functions</span>
                  Fórmula MT (Média Trimestral)
                </td>
                <td colSpan={3} className="py-2.5 px-4 font-mono text-slate-800">
                  MT = (MAC × 0.3) + (NPP × 0.3) + (NPT × 0.4)
                </td>
                <td className="py-2.5 px-4 text-right">
                  <span className="inline-flex items-center gap-1 text-[#0b1f3a] text-[11px]">
                    <span className="material-symbols-outlined text-[15px]">verified</span> Auditoria Ativa
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Section C: Preliminary Validation Audit KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] uppercase font-bold tracking-wider">Total Registos</span>
            <span className="material-symbols-outlined text-[20px]">groups</span>
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="font-headline text-3xl font-extrabold text-slate-900">28</span>
            <span className="text-xs text-slate-500 font-semibold">Estudantes</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">100% da turma física registada no SIGE</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-[11px] uppercase font-bold tracking-wider">Conformidade Total</span>
            <span className="material-symbols-outlined text-[20px]">task_alt</span>
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="font-headline text-3xl font-extrabold text-emerald-700">26</span>
            <span className="text-xs text-emerald-700 font-semibold">Prontos</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Sem inconsistências nem ajustes</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-[11px] uppercase font-bold tracking-wider">Avisos / Normalizados</span>
            <span className="material-symbols-outlined text-[20px]">info</span>
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="font-headline text-3xl font-extrabold text-amber-700">2</span>
            <span className="text-xs text-amber-700 font-semibold">Casos</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Arredondamento decimal ajustado ao MED</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] uppercase font-bold tracking-wider">Erros Críticos</span>
            <span className="material-symbols-outlined text-[20px]">check_circle_outline</span>
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="font-headline text-3xl font-extrabold text-slate-900">0</span>
            <span className="text-xs text-slate-500 font-semibold">Bloqueios</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Escalas 0-20 e processos verificados</p>
        </div>
      </div>

      {/* 7. Section D: Audit & Preview Data Table */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="font-headline text-lg font-bold text-slate-900">
              Pré-visualização e Auditoria dos Registos
            </h2>
            <p className="text-xs text-slate-500">
              Verifique a simulação de cálculos antes do commit definitivo na base ministerial.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl flex-wrap">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos os Alunos (28)
            </button>
            <button
              onClick={() => setActiveFilter('aptos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeFilter === 'aptos' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Aptos / Transita (24)
            </button>
            <button
              onClick={() => setActiveFilter('recurso')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeFilter === 'recurso' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Recurso (3)
            </button>
            <button
              onClick={() => setActiveFilter('reprovados')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeFilter === 'reprovados' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Reprovados (1)
            </button>
            <button
              onClick={() => setActiveFilter('avisos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeFilter === 'avisos' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Avisos (2)
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3 text-center">Linha</th>
                <th className="py-2.5 px-3">N.º Proc.</th>
                <th className="py-2.5 px-4">Nome do Estudante</th>
                <th className="py-2.5 px-3 text-right">MAC (30%)</th>
                <th className="py-2.5 px-3 text-right">NPP (30%)</th>
                <th className="py-2.5 px-3 text-right">NPT (40%)</th>
                <th className="py-2.5 px-3 text-right font-bold text-slate-900">MT Calculada</th>
                <th className="py-2.5 px-4">Classificação</th>
                <th className="py-2.5 px-4">Situação Prevista</th>
                <th className="py-2.5 px-3 text-center">Validação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredList.map((r) => (
                <tr
                  key={r.row}
                  className={`transition-colors ${
                    r.validationStatus === 'warning'
                      ? 'bg-amber-50/50 hover:bg-amber-50'
                      : r.situation.includes('Recurso')
                      ? 'bg-rose-50/30 hover:bg-rose-50/60'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="py-2.5 px-3 text-center font-mono text-slate-400">{r.row}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-[#0b1f3a]">{r.proc}</td>
                  <td className="py-2.5 px-4 font-bold text-slate-900">{r.name}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-700">{r.mac.toFixed(1)}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-700">{r.npp.toFixed(1)}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-700">{r.npt.toFixed(1)}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900 bg-slate-50">
                    {r.mt.toFixed(1)}
                  </td>
                  <td className="py-2.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      r.qualitative === 'Excelente'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : r.qualitative === 'Muito Bom' || r.qualitative === 'Bom'
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : r.qualitative === 'Suficiente'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}>
                      {r.qualitative}
                    </span>
                  </td>
                  <td className="py-2.5 px-4">
                    <span className={`font-semibold ${
                      r.situation.includes('Recurso') ? 'text-rose-700 font-bold' : 'text-slate-800'
                    }`}>
                      {r.situation}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {r.validationStatus === 'valid' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        Validado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px]">
                        <span className="material-symbols-outlined text-[13px]">tune</span>
                        Aviso
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 8. Section E: Confirmation & Compliance Action Bar */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 space-y-4">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <input
            type="checkbox"
            id="legal-declaration"
            checked={isLegalConfirmed}
            onChange={(e) => setIsLegalConfirmed(e.target.checked)}
            className="mt-0.5 h-4.5 w-4.5 rounded text-[#0b1f3a] focus:ring-[#0b1f3a] cursor-pointer"
          />
          <label htmlFor="legal-declaration" className="text-xs text-slate-700 cursor-pointer select-none leading-relaxed">
            <strong>Declaração de Conformidade Pedagógica:</strong> Confirmo que as notas e ponderações importadas conferem integralmente com as cadernetas físicas originais da turma e foram processadas sob a égide do <strong>Decreto Executivo N.º 04/2026</strong> e <strong>n.º 424/25</strong> do Ministério da Educação da República de Angola.
          </label>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onBackToPautas}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Cancelar & Voltar
            </button>
            <button
              onClick={handleExportCsv}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              Exportar Relatório (.csv)
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleConfirmImport}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#7a0c0c] hover:bg-[#5e0909] text-white font-bold text-xs shadow-md transition-all"
              type="button"
            >
              <span>Confirmar Importação & Enviar para Homologação</span>
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
