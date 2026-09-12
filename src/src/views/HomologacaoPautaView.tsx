import React, { useState } from 'react';
import { SchoolDatabase, UserRole } from '../types';

interface HomologacaoPautaViewProps {
  db: SchoolDatabase;
  currentUserRole: UserRole;
  onBackToPautas: () => void;
  onNavigateToImport?: () => void;
}

interface HomologationStudent {
  num: string;
  proc: string;
  name: string;
  gender: 'M' | 'F';
  age: number;
  avatar: string;
  mac: number;
  npp: number;
  npt: number;
  finalScore: number;
  statusText: 'APROVADO' | 'NÃO APROVADO';
  qualitative: 'Excelente' | 'Muito Bom' | 'Bom' | 'Suficiente' | 'Insuficiente';
  situation: 'Transita (Dispensa)' | 'Transita' | 'Exame de Recurso';
  notes: string;
}

export const HomologacaoPautaView: React.FC<HomologacaoPautaViewProps> = ({
  db,
  currentUserRole,
  onBackToPautas,
  onNavigateToImport
}) => {
  const [isDirectorSigned, setIsDirectorSigned] = useState<boolean>(false);
  const [pinCode, setPinCode] = useState<string>('••••••');
  const [isHonorDeclared, setIsHonorDeclared] = useState<boolean>(true);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [signatureSuccess, setSignatureSuccess] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const studentsList: HomologationStudent[] = [
    {
      num: '01',
      proc: 'Proc. 2024-041',
      name: 'Afonso Miguel Santos Ramos',
      gender: 'M',
      age: 15,
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120',
      mac: 19.4,
      npp: 19.0,
      npt: 18.5,
      finalScore: 19.1,
      statusText: 'APROVADO',
      qualitative: 'Excelente',
      situation: 'Transita (Dispensa)',
      notes: 'Proposta ao Quadro de Honra'
    },
    {
      num: '02',
      proc: 'Proc. 2024-052',
      name: 'Beatriz Lourenço Valente',
      gender: 'F',
      age: 16,
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120',
      mac: 14.8,
      npp: 15.2,
      npt: 16.0,
      finalScore: 15.4,
      statusText: 'APROVADO',
      qualitative: 'Bom',
      situation: 'Transita (Dispensa)',
      notes: 'Excelente postura laboratorial'
    },
    {
      num: '03',
      proc: 'Proc. 2024-068',
      name: 'Duarte Nuno Figueiredo',
      gender: 'M',
      age: 16,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120',
      mac: 7.2,
      npp: 8.5,
      npt: 8.0,
      finalScore: 7.9,
      statusText: 'NÃO APROVADO',
      qualitative: 'Insuficiente',
      situation: 'Exame de Recurso',
      notes: 'Apoio Pedagógico Obrigatório'
    },
    {
      num: '04',
      proc: 'Proc. 2024-073',
      name: 'Inês Carmo Silveira',
      gender: 'F',
      age: 15,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
      mac: 10.2,
      npp: 11.5,
      npt: 13.0,
      finalScore: 11.7,
      statusText: 'APROVADO',
      qualitative: 'Suficiente',
      situation: 'Transita',
      notes: 'Evolução contínua positiva'
    },
    {
      num: '05',
      proc: 'Proc. 2024-089',
      name: 'Rodrigo Manuel Paiva',
      gender: 'M',
      age: 15,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120',
      mac: 16.5,
      npp: 17.0,
      npt: 17.5,
      finalScore: 17.1,
      statusText: 'APROVADO',
      qualitative: 'Muito Bom',
      situation: 'Transita (Dispensa)',
      notes: 'Candidato a Monitoria de Química'
    },
    {
      num: '06',
      proc: 'Proc. 2024-095',
      name: 'Sara Cristina Moreira',
      gender: 'F',
      age: 15,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120',
      mac: 8.9,
      npp: 9.4,
      npt: 10.0,
      finalScore: 9.5,
      statusText: 'NÃO APROVADO',
      qualitative: 'Insuficiente',
      situation: 'Exame de Recurso',
      notes: 'Convocatória aos Encarregados'
    },
    {
      num: '07',
      proc: 'Proc. 2024-102',
      name: 'Paulo Kiala Sebastião',
      gender: 'M',
      age: 17,
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120',
      mac: 12.0,
      npp: 11.0,
      npt: 13.5,
      finalScore: 12.3,
      statusText: 'APROVADO',
      qualitative: 'Suficiente',
      situation: 'Transita',
      notes: 'Faltas devidamente justificadas'
    },
    {
      num: '08',
      proc: 'Proc. 2024-118',
      name: 'Tatiana Nzola Gaspar',
      gender: 'F',
      age: 15,
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=120',
      mac: 15.0,
      npp: 14.5,
      npt: 16.0,
      finalScore: 15.3,
      statusText: 'APROVADO',
      qualitative: 'Bom',
      situation: 'Transita (Dispensa)',
      notes: 'Excelente empenho prático'
    }
  ];

  const filteredStudents = studentsList.filter(
    (s) =>
      s.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.proc.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleHomologate = () => {
    if (!isHonorDeclared) {
      alert('Por favor assinale a Declaração de Compromisso de Honra Ministerial antes de homologar.');
      return;
    }
    setIsDirectorSigned(true);
    setSignatureSuccess(true);
    setTimeout(() => setSignatureSuccess(false), 4000);
  };

  return (
    <div className="flex flex-col w-full gap-6 pb-12">
      {/* Screen Breadcrumb & Header */}
      <section className="space-y-3">
        <nav className="flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-400 uppercase">
          <span>Governação Pedagógica</span>
          <span>›</span>
          <button onClick={onBackToPautas} className="hover:underline text-slate-500">
            Avaliação & Exames
          </button>
          <span>›</span>
          <span className="text-[#0b1f3a] font-bold">Homologação Oficial MED</span>
        </nav>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-headline">
                Homologação de Pauta Oficial Trimestral & Final
              </h1>
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
                Norma MED 2025/2026
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl">
              Em estrita observância ao <strong className="text-slate-800">Decreto Executivo N.º 04/2026</strong> e ao{' '}
              <strong className="text-slate-800">Decreto Executivo n.º 424/25</strong> do Ministério da Educação (MED - República de Angola). Documento digital com valor probatório.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={onBackToPautas}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs transition"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Voltar à Edição
            </button>

            {onNavigateToImport && (
              <button
                onClick={onNavigateToImport}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs transition"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px] text-emerald-600">upload_file</span>
                Importar Excel (.xlsx)
              </button>
            )}

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs transition"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px] text-[#7a0c0c]">picture_as_pdf</span>
              Descarregar PDF Oficial Timbrado
            </button>

            <button
              onClick={handleHomologate}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white rounded-lg shadow-sm transition ${
                isDirectorSigned ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-[#7a0c0c] hover:bg-[#5e0909]'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[16px] text-amber-300">
                {isDirectorSigned ? 'verified' : 'lock_open'}
              </span>
              <span>{isDirectorSigned ? 'Pauta Homologada com Sucesso' : 'Homologar & Assinar com Chave Digital (MED)'}</span>
            </button>
          </div>
        </div>

        {/* Metadata Status */}
        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium ${
            isDirectorSigned
              ? 'text-emerald-800 bg-emerald-50 border border-emerald-200'
              : 'text-amber-800 bg-amber-50 border border-amber-200'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isDirectorSigned ? 'bg-emerald-600' : 'bg-amber-500 animate-pulse'}`}></span>
            {isDirectorSigned ? 'Pauta Oficial Homologada & Trancada no SIGE-MED' : 'Em Tramitação de Assinatura Institucional'}
          </div>
          <div className="text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md font-mono text-[11px]">
            Chave Identificadora: <strong>HOM-MED-2026-LA-0492</strong>
          </div>
          <div className="text-slate-500 text-[11px]">
            Última validação da pauta: 22 de Fevereiro de 2026 às 11:22 (GMT+1)
          </div>
        </div>
      </section>

      {signatureSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2 font-bold">
            <span className="material-symbols-outlined text-emerald-600 text-[20px]">verified</span>
            <span>Pauta homologada oficialmente com assinatura PKI-Angola e carimbo de tempo ICP! As notas foram consolidadas com valor ministerial irrevogável.</span>
          </div>
          <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-emerald-300">HASH: SHA256-8F02B...</span>
        </div>
      )}

      {/* Class Parameters Card */}
      <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 text-xs">
          <div>
            <span className="text-slate-500 block text-[11px] uppercase tracking-wider font-semibold">Ano Letivo</span>
            <span className="text-slate-900 font-bold text-sm mt-0.5 block">{db.settings.currentAcademicYear || '2024 / 2025'}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px] uppercase tracking-wider font-semibold">Período / Trimestre</span>
            <span className="text-slate-900 font-bold text-sm mt-0.5 block">{db.settings.currentTrimester}º Trimestre Regular</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px] uppercase tracking-wider font-semibold">Classe & Turma</span>
            <span className="text-slate-900 font-bold text-sm mt-0.5 block">10.ª Classe — Turma A</span>
            <span className="text-[10px] text-slate-500">Turno Manhã (Sala 14)</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px] uppercase tracking-wider font-semibold">Curso / Especialidade</span>
            <span className="text-slate-900 font-bold text-sm mt-0.5 block">Ciências Físicas e Biol.</span>
            <span className="text-[10px] text-slate-500">Opção Geral (CFB)</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px] uppercase tracking-wider font-semibold">Disciplina Curricular</span>
            <span className="text-slate-900 font-bold text-sm mt-0.5 block">Física e Química</span>
            <span className="text-[10px] text-slate-500">Carga Horária: 4h/sem</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px] uppercase tracking-wider font-semibold">Professor(a) Titular</span>
            <span className="text-slate-900 font-bold text-sm mt-0.5 block truncate">Prof.ª Margarida Fontes</span>
            <span className="text-[10px] text-[#0b1f3a] font-mono font-medium">DOC-AO-8841</span>
          </div>
          <div className="col-span-2 md:col-span-1">
            <span className="text-slate-500 block text-[11px] uppercase tracking-wider font-semibold">Estado do Documento</span>
            <span className={`inline-block mt-1 px-2 py-1 rounded font-bold text-[10px] uppercase tracking-tight ${
              isDirectorSigned
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                : 'bg-amber-100 text-amber-900 border border-amber-300'
            }`}>
              {isDirectorSigned ? 'Homologado / Válido' : 'Pendente Parecer Pedagógico'}
            </span>
          </div>
        </div>
      </section>

      {/* KPIs Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-xs text-slate-500 font-medium">Efetivo da Turma</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-800">28</span>
            <span className="text-xs text-slate-400 font-normal">Matriculados</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1">100% com dados avaliativos</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-xs text-slate-500 font-medium">Média Global (MT)</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-[#0b1f3a]">13.8</span>
            <span className="text-[11px] text-blue-600 font-semibold">Escala 0-20</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1">+0.6 vs 1.º Trimestre</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-xs text-slate-500 font-medium">Aproveitamento Global</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-emerald-700">85.7%</span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">24 Aptos</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1">Meta Institucional MED: 80%</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-xs text-slate-500 font-medium">Dispensa Exame (≥ 14.0)</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-emerald-600">11</span>
            <span className="text-xs text-emerald-600 font-medium">39.3%</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1">Notas de Mérito / Dispensa</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-xs text-slate-500 font-medium">Risco / Recurso (7.0–9.4)</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-amber-600">3</span>
            <span className="text-xs text-amber-600 font-medium">10.7%</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1">Plano de Recuperação Obrigatório</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-xs text-slate-500 font-medium">Reprovação (&lt; 7.0)</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-[#7a0c0c]">1</span>
            <span className="text-xs text-[#7a0c0c] font-medium">3.5%</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1">Acima do limite de exclusão</span>
        </div>
      </section>

      {/* Main Table Section */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span>Registo Individual de Provas e Ponderações Oficiais</span>
              <span className="text-[11px] text-slate-400 font-mono font-normal">| Ref. Dec. 04/2026 Art. 18.º</span>
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Fórmula de Cálculo: <strong>MT = (MAC × 0.30) + (NPP × 0.30) + (NPT × 0.40)</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Filtrar aluno..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="text-xs bg-white border border-slate-300 rounded-lg pl-3 pr-8 py-1.5 focus:ring-1 focus:ring-[#0b1f3a] w-48 shadow-xs"
              />
              <span className="material-symbols-outlined text-slate-400 absolute right-2.5 top-2 text-[16px]">
                search
              </span>
            </div>
            <button
              onClick={() => setSearchFilter('')}
              className="p-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 transition shadow-xs"
              title="Limpar filtro"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-200">
            <thead className="bg-slate-100/90 text-slate-700 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-3 text-center w-12">N.º</th>
                <th className="py-3 px-4 min-w-[240px]">Identificação do Aluno</th>
                <th className="py-3 px-3 text-center min-w-[90px] bg-slate-200/50">
                  MAC<br /><span className="text-[9px] font-semibold text-slate-500 lowercase">peso 30%</span>
                </th>
                <th className="py-3 px-3 text-center min-w-[90px]">
                  NPP / PP<br /><span className="text-[9px] font-semibold text-slate-500 lowercase">peso 30%</span>
                </th>
                <th className="py-3 px-3 text-center min-w-[90px] bg-slate-200/50">
                  NPT / PT<br /><span className="text-[9px] font-semibold text-slate-500 lowercase">peso 40%</span>
                </th>
                <th className="py-3 px-4 text-center min-w-[110px] bg-blue-50/80 text-blue-950 font-extrabold border-x border-blue-200/60">
                  NOTA FINAL (MT)<br /><span className="text-[9px] font-bold text-blue-800 uppercase">Escala 0-20</span>
                </th>
                <th className="py-3 px-3 text-center min-w-[110px]">Menção Qualitativa</th>
                <th className="py-3 px-3 text-center min-w-[120px]">Situação</th>
                <th className="py-3 px-4 min-w-[190px]">Observações / Despacho</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white text-slate-700 font-medium">
              {filteredStudents.map((st) => (
                <tr
                  key={st.num}
                  className={`transition-colors ${
                    st.statusText === 'NÃO APROVADO' ? 'hover:bg-rose-50/50 bg-rose-50/20' : 'hover:bg-slate-50/80'
                  }`}
                >
                  <td className="py-3 px-3 text-center font-mono font-bold text-slate-500">{st.num}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={st.avatar}
                        alt={st.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-300"
                      />
                      <div>
                        <div className={`font-bold text-xs ${st.statusText === 'NÃO APROVADO' ? 'text-rose-950' : 'text-slate-900'}`}>
                          {st.name}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {st.proc} • {st.gender} • {st.age} anos
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className={`py-3 px-3 text-center font-semibold font-mono ${
                    st.mac < 10 ? 'bg-rose-100/60 text-rose-800' : 'bg-slate-50/50 text-slate-800'
                  }`}>
                    {st.mac.toFixed(1).replace('.', ',')}
                  </td>
                  <td className={`py-3 px-3 text-center font-semibold font-mono ${
                    st.npp < 10 ? 'bg-rose-100/40 text-rose-800' : 'text-slate-800'
                  }`}>
                    {st.npp.toFixed(1).replace('.', ',')}
                  </td>
                  <td className={`py-3 px-3 text-center font-semibold font-mono ${
                    st.npt < 10 ? 'bg-rose-100/60 text-rose-800' : 'bg-slate-50/50 text-slate-800'
                  }`}>
                    {st.npt.toFixed(1).replace('.', ',')}
                  </td>
                  <td className={`py-3 px-4 text-center border-x ${
                    st.statusText === 'NÃO APROVADO'
                      ? 'bg-rose-100/70 border-rose-300'
                      : 'bg-blue-50/40 border-blue-200/50'
                  }`}>
                    <div className={`text-sm font-black font-mono ${
                      st.statusText === 'NÃO APROVADO' ? 'text-rose-900' : 'text-slate-900'
                    }`}>
                      {st.finalScore.toFixed(1)}
                    </div>
                    <span className={`inline-block mt-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded ${
                      st.statusText === 'NÃO APROVADO' ? 'bg-rose-700 text-white' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {st.statusText}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      st.qualitative === 'Excelente'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : st.qualitative === 'Muito Bom' || st.qualitative === 'Bom'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : st.qualitative === 'Suficiente'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-rose-100 text-rose-800 border-rose-300'
                    }`}>
                      {st.qualitative}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      st.situation === 'Exame de Recurso'
                        ? 'bg-rose-200 text-rose-900 font-bold'
                        : 'bg-emerald-100/70 text-emerald-800'
                    }`}>
                      {st.situation}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[11px] text-slate-600">
                    {st.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Bottom Pagination and Status */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            A apresentar <strong className="text-slate-800 font-semibold">{filteredStudents.length}</strong> de{' '}
            <strong className="text-slate-800 font-semibold">28</strong> registos de alunos da pauta (Modo de Prévia e Homologação MED).
          </div>
          <div className="flex items-center gap-1 font-mono">
            {[1, 2, 3, 4].map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded border text-xs font-bold flex items-center justify-center transition-colors ${
                  currentPage === page
                    ? 'border-[#0b1f3a] bg-[#0b1f3a] text-white'
                    : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Homologation & Signatures Block */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="border-b border-slate-200 pb-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 font-headline">
            <span className="material-symbols-outlined text-[#0b1f3a] text-[22px]">verified</span>
            Termo de Encerramento de Pauta e Ata do Conselho Pedagógico
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            Em cumprimento do Artigo 42.º do Regulamento Escolar Geral e em conformidade com o Decreto Executivo N.º 04/2026, a presente pauta foi conferida pelo corpo docente e diretor de turma, estando apta à chancela e validação definitiva pela Direção Pedagógica.
          </p>
        </div>

        {/* 3 Signature Panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          {/* Assinatura 1: Professor Titular */}
          <div className="border border-emerald-200 bg-emerald-50/40 rounded-lg p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-800 uppercase tracking-wider text-[10px]">1. Professor(a) Titular</span>
                <span className="inline-flex items-center text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">Assinado</span>
              </div>
              <p className="mt-2 font-bold text-slate-800 text-sm">Prof.ª Margarida Fontes</p>
              <p className="text-slate-500 text-[11px]">ID MED: DOC-AO-8841</p>
              <p className="text-[11px] text-emerald-700 mt-2 font-mono">
                Submetido via Chave RSA-2048 às 10:40 (22/02/2026)
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-emerald-200/60 flex items-center gap-2 text-[11px] text-emerald-800 font-semibold">
              <span className="material-symbols-outlined text-emerald-600 text-[16px]">check_circle</span>
              Notas Lançadas & Validadas
            </div>
          </div>

          {/* Assinatura 2: Diretor de Turma */}
          <div className="border border-emerald-200 bg-emerald-50/40 rounded-lg p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-800 uppercase tracking-wider text-[10px]">2. Diretor de Turma</span>
                <span className="inline-flex items-center text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">Parecer Favorável</span>
              </div>
              <p className="mt-2 font-bold text-slate-800 text-sm">Prof. Alberto Gusmão</p>
              <p className="text-slate-500 text-[11px]">Coordenação 10.ª Classe</p>
              <p className="text-[11px] text-emerald-700 mt-2 font-mono">
                Rubricado eletronicamente às 11:15 (22/02/2026)
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-emerald-200/60 flex items-center gap-2 text-[11px] text-emerald-800 font-semibold">
              <span className="material-symbols-outlined text-emerald-600 text-[16px]">check_circle</span>
              Conformidade de Assiduidade
            </div>
          </div>

          {/* Assinatura 3: Diretor Pedagógico */}
          <div className={`border-2 rounded-lg p-4 flex flex-col justify-between shadow-xs transition-colors ${
            isDirectorSigned
              ? 'border-emerald-300 bg-emerald-50/50'
              : 'border-amber-300 bg-amber-50/50'
          }`}>
            <div>
              <div className="flex items-center justify-between">
                <span className={`font-bold uppercase tracking-wider text-[10px] ${
                  isDirectorSigned ? 'text-emerald-900' : 'text-amber-900'
                }`}>
                  3. Direção Pedagógica
                </span>
                <span className={`inline-flex items-center text-[10px] px-1.5 py-0.5 rounded font-bold ${
                  isDirectorSigned
                    ? 'bg-emerald-200 text-emerald-900'
                    : 'bg-amber-200 text-amber-900 animate-pulse'
                }`}>
                  {isDirectorSigned ? 'Homologado Definitivo' : 'Aguardando Despacho'}
                </span>
              </div>
              <p className="mt-2 font-bold text-slate-900 text-sm">Dr. Carlos Mendes</p>
              <p className="text-slate-500 text-[11px]">Diretor Geral / Pedagógico BandMed</p>
              <p className={`text-[11px] mt-2 font-mono ${isDirectorSigned ? 'text-emerald-700' : 'text-amber-800'}`}>
                {isDirectorSigned
                  ? 'Chave Homologada: PKI-AO-2026-MED-SEC-09'
                  : 'Ação requerida: Inserir Chave PIN & Assinar Documento.'}
              </p>
            </div>
            <div className={`mt-4 pt-3 border-t flex items-center gap-2 text-[11px] font-semibold ${
              isDirectorSigned ? 'border-emerald-200 text-emerald-900' : 'border-amber-200 text-amber-900'
            }`}>
              <span className="material-symbols-outlined text-[16px]">
                {isDirectorSigned ? 'verified' : 'warning'}
              </span>
              <span>{isDirectorSigned ? 'Trancamento Concluído' : 'Trancamento Definitivo MED'}</span>
            </div>
          </div>
        </div>

        {/* Digital Certificate & PIN Confirmation Section */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3 text-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="honorDeclaration"
                checked={isHonorDeclared}
                onChange={(e) => setIsHonorDeclared(e.target.checked)}
                className="mt-1 rounded border-slate-300 text-[#0b1f3a] focus:ring-[#0b1f3a] cursor-pointer"
              />
              <label htmlFor="honorDeclaration" className="text-slate-700 leading-snug cursor-pointer font-medium">
                Declaro sob compromisso de honra que a presente pauta oficial reflete com fidedignidade absoluta as classificações apuradas nas provas, minitestes e folhas de ponto arquivadas no arquivo institucional desta instituição de ensino, cumprindo na íntegra o Decreto Executivo N.º 04/2026.
              </label>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-slate-500 font-mono text-[11px]">Chave PIN (MED-PKI):</span>
              <input
                type="password"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                className="w-24 text-center py-1.5 px-2 bg-white border border-slate-300 rounded font-mono text-sm tracking-widest focus:ring-1 focus:ring-[#0b1f3a]"
              />
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="text-[11px] text-slate-500 flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600 text-[16px]">verified_user</span>
            <span>Timestamping ICP-Angola ativo: Carimbo oficial com validade jurídica nacional.</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => alert('Pauta devolvida ao Diretor de Turma com notas de revisão.')}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-100 transition shadow-xs"
              type="button"
            >
              Devolver com Apontamentos de Correção
            </button>
            <button
              onClick={handleHomologate}
              className="px-5 py-2 bg-[#7a0c0c] hover:bg-[#5e0909] text-white rounded-lg text-xs font-bold shadow-md hover:shadow-lg transition flex items-center gap-2"
              type="button"
            >
              <span className="material-symbols-outlined text-amber-400 text-[16px]">lock</span>
              <span>Homologar & Trancar Pauta Definitivamente</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
