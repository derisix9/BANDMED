import React, { useRef, useState } from 'react';
import { EducationLevelId, InstitutionSettings, UserRole } from '../../types';
import { ALL_EDUCATION_SUBSYSTEMS, DEFAULT_SELECTED_SUBSYSTEMS } from '../../utils/educationSubsystems';
import { compressImageFile } from '../../utils/imageCompressor';

interface TabDadosInstituicaoProps {
  settings: InstitutionSettings;
  currentUserRole?: UserRole;
  onUpdateSettings: (newSettings: Partial<InstitutionSettings>) => void;
  onSaveAll: (options?: { loadingMessage?: string; successMessage?: string; requiredRule?: string }) => void;
}

export const TabDadosInstituicao: React.FC<TabDadosInstituicaoProps> = ({
  settings,
  currentUserRole,
  onUpdateSettings,
  onSaveAll
}) => {
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);

  const processImageFile = async (file: File) => {
    setUploadError(null);
    if (!file.type.startsWith('image/')) {
      setUploadError('Por favor, selecione um ficheiro de imagem válido (PNG, JPG, SVG ou WEBP).');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setUploadError('A imagem selecionada excede o limite máximo de 8MB.');
      return;
    }

    try {
      if (file.type === 'image/svg+xml') {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (result) {
            onUpdateSettings({ logoUrl: result });
            setUploadSuccess(true);
            setTimeout(() => setUploadSuccess(false), 3500);
          }
        };
        reader.readAsDataURL(file);
      } else {
        const compressed = await compressImageFile(file, 512, 512, 0.92);
        onUpdateSettings({ logoUrl: compressed });
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3500);
      }
    } catch {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          onUpdateSettings({ logoUrl: result });
          setUploadSuccess(true);
          setTimeout(() => setUploadSuccess(false), 3500);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };
  const currentSubsystems: EducationLevelId[] =
    settings.selectedSubsystems && settings.selectedSubsystems.length > 0
      ? settings.selectedSubsystems
      : DEFAULT_SELECTED_SUBSYSTEMS;

  const toggleSubsystem = (id: EducationLevelId) => {
    let updated: EducationLevelId[];
    if (currentSubsystems.includes(id)) {
      if (currentSubsystems.length === 1) {
        alert('Atenção: A instituição deve manter pelo menos um sub-sistema de ensino ativo no sistema.');
        return;
      }
      updated = currentSubsystems.filter((item) => item !== id);
    } else {
      updated = [...currentSubsystems, id];
    }
    onUpdateSettings({ selectedSubsystems: updated });
  };

  const applyPreset = (presetIds: EducationLevelId[]) => {
    onUpdateSettings({ selectedSubsystems: presetIds });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-[#0b1f3a] shrink-0">
            <span className="material-symbols-outlined text-[26px]">apartment</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider text-[#ac332b] font-bold">Módulo 01</span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span className="text-[11px] text-slate-500 font-medium">Identidade Institucional & Sub-sistemas</span>
            </div>
            <h2 className="font-headline text-lg lg:text-xl font-bold text-slate-900">
              Dados Oficiais da Instituição & Sub-sistemas de Ensino
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-blue-50 text-[#0b1f3a] font-mono text-xs font-bold rounded-xl border border-blue-100 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">school</span>
            <span>{currentSubsystems.length} de 5 Sub-sistemas Ativos</span>
          </span>
        </div>
      </div>

      {/* BLOCO 1: Identidade Oficial, NIF e Acreditação MED / MESCTI */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-headline text-base lg:text-lg font-bold text-slate-900">
              1. Identidade Jurídica, Acreditação & Sede
            </h3>
            <p className="text-xs text-slate-500">
              Dados oficiais registados na Conservatória e Ministérios da Educação (MED) e Ensino Superior (MESCTI).
            </p>
          </div>
          <span className="px-3 py-1 bg-slate-100 text-slate-700 font-mono text-[11px] font-bold rounded-lg uppercase tracking-wider">
            AO-REG-2025
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="lg:col-span-2 flex flex-col gap-1">
            <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
              Nome da Instituição de Ensino
            </label>
            <input
              type="text"
              value={settings.schoolName}
              onChange={(e) => onUpdateSettings({ schoolName: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 text-slate-900 rounded-xl border border-slate-200 outline-none focus:bg-white focus:ring-2 focus:ring-[#0b1f3a] text-xs font-semibold"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
              Subtítulo / Ciclos Oficiais
            </label>
            <input
              type="text"
              value={settings.subTitle || ''}
              onChange={(e) => onUpdateSettings({ subTitle: e.target.value })}
              placeholder="Ex.: Ensino Primário, Iº e IIº Ciclos do Ensino Secundário"
              className="w-full px-3.5 py-2.5 bg-slate-50 text-slate-900 rounded-xl border border-slate-200 outline-none focus:bg-white focus:ring-2 focus:ring-[#0b1f3a] text-xs font-semibold"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
              NIF Angolano (AGT)
            </label>
            <input
              type="text"
              value={settings.nif || ''}
              onChange={(e) => onUpdateSettings({ nif: e.target.value })}
              placeholder="NIF da Instituição"
              className="w-full px-3.5 py-2.5 bg-slate-50 text-slate-900 rounded-xl border border-slate-200 font-mono outline-none focus:bg-white focus:ring-2 focus:ring-[#0b1f3a] text-xs font-bold"
            />
          </div>

          <div className="lg:col-span-2 flex flex-col gap-1">
            <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
              Decreto de Homologação / Alvará de Funcionamento
            </label>
            <input
              type="text"
              value={settings.decreeAuthorization}
              onChange={(e) => onUpdateSettings({ decreeAuthorization: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 text-slate-900 rounded-xl border border-slate-200 outline-none focus:bg-white focus:ring-2 focus:ring-[#0b1f3a] text-xs"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
              Província & Município
            </label>
            <input
              type="text"
              value={`${settings.province}, ${settings.municipality}`}
              onChange={(e) => {
                const parts = e.target.value.split(',');
                onUpdateSettings({
                  province: parts[0]?.trim() || settings.province,
                  municipality: parts[1]?.trim() || settings.municipality
                });
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 text-slate-900 rounded-xl border border-slate-200 outline-none focus:bg-white focus:ring-2 focus:ring-[#0b1f3a] text-xs"
            />
          </div>

          <div className="lg:col-span-3 flex flex-col gap-1">
            <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
              Endereço Completo da Sede Institucional
            </label>
            <input
              type="text"
              value={settings.address}
              onChange={(e) => onUpdateSettings({ address: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 text-slate-900 rounded-xl border border-slate-200 outline-none focus:bg-white focus:ring-2 focus:ring-[#0b1f3a] text-xs"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
              E-mail Institucional
            </label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => onUpdateSettings({ email: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 text-slate-900 rounded-xl border border-slate-200 outline-none focus:bg-white focus:ring-2 focus:ring-[#0b1f3a] text-xs"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
              Contacto Telefónico / WhatsApp
            </label>
            <input
              type="text"
              value={settings.phone}
              onChange={(e) => onUpdateSettings({ phone: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 text-slate-900 rounded-xl border border-slate-200 font-mono outline-none focus:bg-white focus:ring-2 focus:ring-[#0b1f3a] text-xs"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
              Diretor Geral / Presidente
            </label>
            <input
              type="text"
              value={settings.directorGeral || ''}
              onChange={(e) => onUpdateSettings({ directorGeral: e.target.value })}
              placeholder="Nome do Diretor Geral / Presidente"
              className="w-full px-3.5 py-2.5 bg-slate-50 text-slate-900 rounded-xl border border-slate-200 outline-none focus:bg-white focus:ring-2 focus:ring-[#0b1f3a] text-xs font-semibold"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
              Diretor Pedagógico
            </label>
            <input
              type="text"
              value={settings.directorPedagogico || ''}
              onChange={(e) => onUpdateSettings({ directorPedagogico: e.target.value })}
              placeholder="Nome do Diretor Pedagógico"
              className="w-full px-3.5 py-2.5 bg-slate-50 text-slate-900 rounded-xl border border-slate-200 outline-none focus:bg-white focus:ring-2 focus:ring-[#0b1f3a] text-xs font-semibold"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
              Chefe de Secretaria Geral
            </label>
            <input
              type="text"
              value={settings.chefeSecretaria || ''}
              onChange={(e) => onUpdateSettings({ chefeSecretaria: e.target.value })}
              placeholder="Nome do Chefe de Secretaria Geral"
              className="w-full px-3.5 py-2.5 bg-slate-50 text-slate-900 rounded-xl border border-slate-200 outline-none focus:bg-white focus:ring-2 focus:ring-[#0b1f3a] text-xs font-semibold"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
              Portal Web / Domínio Institucional
            </label>
            <input
              type="text"
              value={settings.website || ''}
              onChange={(e) => onUpdateSettings({ website: e.target.value })}
              placeholder="Ex.: https://escola.ao"
              className="w-full px-3.5 py-2.5 bg-slate-50 text-slate-900 rounded-xl border border-slate-200 outline-none focus:bg-white focus:ring-2 focus:ring-[#0b1f3a] text-xs"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
              Bairro / Distrito Urbano
            </label>
            <input
              type="text"
              value={settings.bairro || ''}
              onChange={(e) => onUpdateSettings({ bairro: e.target.value })}
              placeholder="Ex.: Bairro ou Distrito Urbano"
              className="w-full px-3.5 py-2.5 bg-slate-50 text-slate-900 rounded-xl border border-slate-200 outline-none focus:bg-white focus:ring-2 focus:ring-[#0b1f3a] text-xs"
            />
          </div>
        </div>

        {/* LOGÓTIPO & IDENTIDADE VISUAL OFICIAL (UPLOAD COMPUTADOR / MOBILE) */}
        <div className="pt-4 border-t border-slate-100 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="font-headline font-bold text-slate-900 text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ac332b] text-[20px]">photo_camera</span>
                <span>Logótipo & Brasão Oficial da Instituição</span>
              </h4>
              <p className="text-[11px] text-slate-500">
                Carregue o logótipo oficial em formato PNG, JPG ou SVG a partir do computador ou dispositivo móvel.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="text-[11px] font-semibold text-slate-500 hover:text-[#0b1f3a] underline cursor-pointer"
              >
                {showUrlInput ? 'Ocultar URL direto' : 'Usar link de URL direto'}
              </button>
            </div>
          </div>

          {/* Feedback de sucesso ou erro */}
          {uploadSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-fade-in">
              <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
              <span className="font-semibold">Logótipo carregado e atualizado com sucesso! Será impresso nos documentos oficiais.</span>
            </div>
          )}

          {uploadError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center gap-2 animate-fade-in">
              <span className="material-symbols-outlined text-[18px] text-red-600">error</span>
              <span className="font-semibold">{uploadError}</span>
            </div>
          )}

          {/* Área interativa de upload e visualização */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Visualizador da Logo Atual */}
            <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <div className="relative w-28 h-28 bg-white rounded-xl border-2 border-slate-200 p-2 flex items-center justify-center shadow-xs overflow-hidden">
                {settings.logoUrl ? (
                  <img
                    src={settings.logoUrl}
                    alt={settings.schoolName || 'Logótipo da Escola'}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <span className="material-symbols-outlined text-[36px]">image_not_supported</span>
                    <span className="text-[10px] font-bold uppercase mt-1">Sem Logótipo</span>
                  </div>
                )}
              </div>
              <span className="text-[11px] font-bold text-slate-700 mt-2">
                {settings.schoolName || 'Instituição'}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {settings.logoUrl ? 'Logótipo Configurado' : 'Padrão do Sistema'}
              </span>
            </div>

            {/* Zona de Drop & Botões de Ação */}
            <div className="md:col-span-8 flex flex-col gap-3">
              {/* Input de ficheiro nativo (oculto) */}
              <input
                type="file"
                ref={logoFileInputRef}
                accept="image/png, image/jpeg, image/webp, image/svg+xml"
                onChange={handleLogoFileChange}
                className="hidden"
                id="institution-logo-file-input"
              />

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => logoFileInputRef.current?.click()}
                className={`p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-[#ac332b] bg-red-50/50 scale-[0.99]'
                    : 'border-slate-300 hover:border-[#0b1f3a] bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-[#0b1f3a] mb-2 shadow-xs">
                  <span className="material-symbols-outlined text-[24px]">upload_file</span>
                </div>
                <div className="font-bold text-xs text-slate-800">
                  Clique para carregar do computador ou telemóvel
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  ou arraste e solte o ficheiro de imagem aqui
                </div>
                <div className="text-[10px] text-slate-400 font-medium mt-1">
                  Formatos aceites: PNG com transparência, JPG, SVG ou WEBP (máx. 8MB)
                </div>
              </div>
              
              {/* Campo opcional de URL manual */}
              {showUrlInput && (
                <div className="mt-1 p-3 bg-slate-100 rounded-xl border border-slate-200 flex flex-col gap-1.5 animate-fade-in">
                  <label className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                    Link de URL Direto da Imagem
                  </label>
                  <input
                    type="text"
                    value={settings.logoUrl}
                    onChange={(e) => onUpdateSettings({ logoUrl: e.target.value })}
                    placeholder="https://exemplo.ao/imagens/logo.png"
                    className="w-full px-3 py-2 bg-white text-slate-900 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-[#0b1f3a] text-xs font-mono"
                  />
                </div>
              )}

              <div className="text-[11px] text-slate-500 italic bg-amber-50/70 p-2.5 rounded-lg border border-amber-200/60 flex items-start gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-amber-700 shrink-0 mt-0.5">info</span>
                <span>
                  <strong>Aplicação Automática:</strong> O logótipo carregado aqui é aplicado automaticamente em todas as Fichas de Matrícula, Fichas de Professor, Faturas/Recibos, Pautas Trimestrais e Boletins de Notas da escola.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BLOCO 2: SUB-SISTEMAS DE ENSINO MINISTRADOS NA INSTITUIÇÃO */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                Parametrização do Sistema de Ensino
              </span>
            </div>
            <h3 className="font-headline text-base lg:text-lg font-bold text-slate-900 mt-1">
              2. Sub-sistemas de Ensino Ministrados na Instituição
            </h3>
            <p className="text-xs text-slate-500">
              Selecione os níveis de ensino oferecidos pela sua instituição. Os formulários de turmas, alunos, notas e propinas serão adaptados automaticamente.
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-500 mr-1 hidden lg:inline">Predefinições rápidas:</span>
            <button
              type="button"
              onClick={() =>
                applyPreset(['pre_escolar', 'primario', 'secundario_1', 'secundario_2', 'superior'])
              }
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors"
              title="Ativa todos os 5 sub-sistemas de ensino"
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() =>
                applyPreset(['pre_escolar', 'primario', 'secundario_1', 'secundario_2'])
              }
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors"
              title="Pré-Escolar até ao Ensino Médio"
            >
              Excepto Superior
            </button>
            <button
              type="button"
              onClick={() => applyPreset(['secundario_2'])}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors"
              title="Apenas 10.ª à 13.ª classe"
            >
              Ensino Médio
            </button>
            <button
              type="button"
              onClick={() => applyPreset(['superior'])}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors"
              title="Bacharelato, Licenciatura e Mestrado"
            >
              Ensino Superior
            </button>
          </div>
        </div>

        {/* 5 CARDS INTERATIVOS DOS SUB-SISTEMAS */}
        <div className="grid grid-cols-1 gap-4">
          {ALL_EDUCATION_SUBSYSTEMS.map((subsystem, idx) => {
            const isSelected = currentSubsystems.includes(subsystem.id);
            return (
              <div
                key={subsystem.id}
                onClick={() => toggleSubsystem(subsystem.id)}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                  isSelected
                    ? 'border-[#0b1f3a] bg-blue-50/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 opacity-70 hover:opacity-100'
                }`}
              >
                {/* Lado Esquerdo: Identificação do Sub-sistema */}
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? 'bg-[#0b1f3a] text-white shadow-xs' : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[26px]">{subsystem.icon}</span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-mono uppercase font-bold text-[#ac332b]">
                        Nível 0{idx + 1}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <h4 className="font-headline font-bold text-sm lg:text-base text-slate-900">
                        {subsystem.fullName}
                      </h4>
                      {isSelected ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                          Ativo no Sistema
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                          Desativado
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 max-w-2xl">{subsystem.description}</p>

                    {/* Classes e Regime do Sub-sistema */}
                    <div className="flex items-center gap-3 mt-1 flex-wrap text-xs">
                      <div className="flex items-center gap-1 text-slate-500">
                        <span className="font-semibold text-slate-700">Regime:</span>
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] text-slate-700 font-medium">
                          {subsystem.regime}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-slate-500">
                        <span className="font-semibold text-slate-700">Classes/Anos:</span>
                        <div className="flex items-center gap-1 flex-wrap">
                          {subsystem.grades.map((g) => (
                            <span
                              key={g}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                                isSelected
                                  ? 'bg-blue-100 text-[#0b1f3a]'
                                  : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {g}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lado Direito: Toggle Switch e Status */}
                <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  <div className="text-right hidden sm:block">
                    <span className="text-[11px] font-bold text-slate-900 block">
                      {isSelected ? 'Sub-sistema Selecionado' : 'Clique para Ativar'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {isSelected ? 'Disponível em todos os formulários' : 'Oculto nos formulários'}
                    </span>
                  </div>

                  {/* Toggle Switch */}
                  <div
                    className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                      isSelected ? 'bg-[#0b1f3a]' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform shadow-xs ${
                        isSelected ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Nota informativa de integração automática */}
        <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-950 flex items-start gap-3">
          <span className="material-symbols-outlined text-[22px] text-[#0b1f3a] shrink-0 mt-0.5">
            auto_awesome
          </span>
          <div>
            <span className="font-bold block text-sm text-[#0b1f3a] mb-0.5">
              Integração Automática & Auto-preenchimento nos Formulários
            </span>
            <p className="text-blue-900/90 text-xs leading-relaxed">
              Ao salvar estas configurações, o sistema alimenta dinamicamente todos os menus suspensos e formulários de cadastro:
              criação de turmas, matrículas de novos alunos, pautas de avaliação e tabela de propinas exibirão exclusivamente
              as classes e cursos dos sub-sistemas aqui selecionados.
            </p>
          </div>
        </div>
      </section>

      {/* Footer com Ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">
            Sub-sistemas ativos: <strong>{currentSubsystems.length}</strong> selecionados
          </span>
        </div>
        <div className="flex items-center gap-2 justify-end">
          <button
            type="button"
            onClick={() =>
              onSaveAll({
                loadingMessage: 'A guardar dados oficiais da instituição e sub-sistemas...',
                successMessage: 'Operação feita com sucesso!'
              })
            }
            className="px-6 py-2.5 rounded-xl bg-[#0b1f3a] text-white font-bold text-xs hover:bg-[#7a0c0c] transition-colors shadow-md flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            <span>Guardar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
