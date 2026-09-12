import React, { useState } from 'react';

interface SqlExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SqlExportModal: React.FC<SqlExportModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    fetch('/database/gestao_escolar.sql')
      .then((res) => res.text())
      .then((text) => {
        const blob = new Blob([text], { type: 'application/sql' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'gestao_escolar.sql';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      })
      .catch((err) => console.error('Erro ao descarregar SQL', err));
  };

  const handleCopy = () => {
    fetch('/database/gestao_escolar.sql')
      .then((res) => res.text())
      .then((text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      })
      .catch((err) => console.error('Erro ao copiar', err));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0b1f3a] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-amber-400 text-[24px]">save_alt</span>
            <div>
              <h3 className="font-bold text-base text-white">Cópia de Segurança do Sistema (.sql)</h3>
              <p className="text-xs text-slate-300">Estrutura e dados normalizados para arquivo institucional</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Info Banner */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs text-slate-700 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-[18px]">info</span>
            <span>
              Inclui 14 tabelas normalizadas com chaves estrangeiras, índices e dados demonstrativos completos (alunos, professores, turmas, notas, propinas e avisos).
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px] text-slate-600">
                {copied ? 'check' : 'content_copy'}
              </span>
              <span>{copied ? 'Copiado!' : 'Copiar SQL'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-3.5 py-1.5 rounded-lg bg-[#7a0c0c] hover:bg-[#5e0909] text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>Descarregar .sql</span>
            </button>
          </div>
        </div>

        {/* Code Preview */}
        <div className="p-4 overflow-y-auto font-mono text-[11px] bg-slate-900 text-emerald-300 leading-relaxed max-h-[500px]">
          <pre className="whitespace-pre-wrap select-all">
{`-- ==========================================================
-- SISTEMA DE GESTÃO ESCOLAR (BandMed / EduGest)
-- Base de Dados MySQL Completa (Esquema + Dados de Demonstração)
-- Ficheiro: database/gestao_escolar.sql
-- ==========================================================

-- TABELAS INCLUÍDAS:
-- 1. roles               -> Perfis de utilizadores (admin, professor, aluno, encarregado)
-- 2. users               -> Contas com hash bcrypt (senha: EduGest2024!)
-- 3. teachers            -> Professores, N.º de agente, departamentos e horas
-- 4. classes             -> Turmas, ciclos, salas e diretores de turma
-- 5. students            -> Alunos, dados biométricos, encarregados e propinas
-- 6. subjects            -> Disciplinas curriculares e carga horária
-- 7. attendance_sheets   -> Cadernetas diárias com sumários e rubricas digitais
-- 8. attendance_records  -> Registo de faltas individuais (P, FJ, FI, A)
-- 9. exams               -> Pautas trimestrais e fórmulas de avaliação
-- 10. grade_records      -> Classificações (MAC 30%, NPP 30%, NPT 40% -> MT)
-- 11. tuition_fees       -> Propinas, multas em Kwanzas Kz e referências Multicaixa
-- 12. notices            -> Mural de comunicados e avisos urgentes
-- 13. library_books      -> Catálogo da biblioteca escolar
-- 14. system_settings    -> Parâmetros institucionais e alvará do MED Angola

Para importar diretamente no phpMyAdmin:
1. Abra o phpMyAdmin ou MySQL Workbench
2. Crie uma base de dados: CREATE DATABASE gestao_escolar CHARACTER SET utf8mb4;
3. Vá à aba "Importar" e selecione o ficheiro 'gestao_escolar.sql'
4. Clique em "Executar". Todas as tabelas e dados de exemplo serão criados instantaneamente!`}
          </pre>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-mono">Ficheiro no projeto: /database/gestao_escolar.sql</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-300 hover:bg-slate-400 text-slate-800 font-semibold"
          >
            Fechar Janela
          </button>
        </div>
      </div>
    </div>
  );
};
