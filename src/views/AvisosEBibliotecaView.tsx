import React, { useState } from 'react';
import { SchoolDatabase, Notice, LibraryBook, UserRole } from '../types';
import { dbService } from '../services/db';
import { runGlobalOperation } from '../context/OperationContext';
import { ComunicadosEmMassaTab } from '../components/ComunicadosEmMassaTab';

interface AvisosEBibliotecaViewProps {
  db: SchoolDatabase;
  currentUserRole: UserRole;
  isNoticeModalOpen: boolean;
  setIsNoticeModalOpen: (open: boolean) => void;
}

export const AvisosEBibliotecaView: React.FC<AvisosEBibliotecaViewProps> = ({
  db,
  currentUserRole,
  isNoticeModalOpen,
  setIsNoticeModalOpen
}) => {
  const [activeTab, setActiveTab] = useState<'avisos' | 'biblioteca' | 'comunicados'>('avisos');
  const [searchTerm, setSearchTerm] = useState('');
  const [requestedBookMessage, setRequestedBookMessage] = useState<string | null>(null);

  // Form State for new notice
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeExcerpt, setNewNoticeExcerpt] = useState('');
  const [newNoticeContent, setNewNoticeContent] = useState('');
  const [newNoticePriority, setNewNoticePriority] = useState<'urgente' | 'alta' | 'normal' | 'informativa'>('normal');

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeTitle.trim() || !newNoticeContent.trim()) return;

    await runGlobalOperation(
      async () => {
        dbService.addNotice({
          title: newNoticeTitle.trim(),
          excerpt: newNoticeExcerpt.trim() || newNoticeContent.trim().substring(0, 80),
          content: newNoticeContent.trim(),
          author: currentUserRole === 'admin' ? 'Direção Geral' : 'Gabinete Pedagógico',
          authorRole: currentUserRole === 'admin' ? 'Diretor Geral' : 'Docente',
          targetRoles: ['admin', 'professor', 'aluno', 'encarregado'],
          priority: newNoticePriority
        });
      },
      {
        loadingMessage: 'A publicar aviso escolar...',
        successMessage: 'Aviso escolar publicado e comunicado em tempo real!',
        onSuccess: () => {
          setNewNoticeTitle('');
          setNewNoticeExcerpt('');
          setNewNoticeContent('');
          setIsNoticeModalOpen(false);
        }
      }
    );
  };

  const handleRequestBook = (bookTitle: string) => {
    setRequestedBookMessage(`Livro "${bookTitle}" requisitado com sucesso! Retire o exemplar na secretaria da biblioteca.`);
    setTimeout(() => {
      setRequestedBookMessage(null);
    }, 4000);
  };

  const bookList = db.books || [];
  const filteredBooks = bookList.filter(
    (b) =>
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.isbn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col w-full gap-6 pb-12">
      {requestedBookMessage && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-500 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600 text-[20px]">check_circle</span>
            <span>{requestedBookMessage}</span>
          </div>
          <button
            onClick={() => setRequestedBookMessage(null)}
            className="text-emerald-700 hover:text-emerald-900"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
              Comunicação & Recursos Pedagógicos
            </span>
            <span className="w-1.5 h-1.5 rounded-none bg-[#0b1f3a]" />
            <span className="text-xs font-semibold text-[#0b1f3a]">Acervo & Informação</span>
          </div>
          <h1 className="font-headline text-2xl lg:text-3xl font-extrabold text-[#0b1f3a] tracking-tight">
            Mural de Avisos & Biblioteca Escolar
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Circulares oficiais, comunicados de urgência e catálogo bibliográfico da instituição.
          </p>
        </div>

        {/* Tab Switcher & Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-200 p-1 rounded-none text-xs font-bold">
            <button
              onClick={() => setActiveTab('avisos')}
              className={`px-3 py-1.5 rounded-none transition-colors ${
                activeTab === 'avisos' ? 'bg-[#0b1f3a] text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Mural de Avisos
            </button>
            <button
              onClick={() => setActiveTab('biblioteca')}
              className={`px-3 py-1.5 rounded-none transition-colors ${
                activeTab === 'biblioteca' ? 'bg-[#0b1f3a] text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Biblioteca Escolar
            </button>
            {currentUserRole === 'admin' && (
              <button
                onClick={() => setActiveTab('comunicados')}
                className={`px-3 py-1.5 rounded-none transition-colors ${
                  activeTab === 'comunicados' ? 'bg-[#0b1f3a] text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                Comunicados em Massa
              </button>
            )}
          </div>

          {activeTab === 'avisos' && currentUserRole === 'admin' && (
            <button
              onClick={() => setIsNoticeModalOpen(true)}
              className="px-3.5 py-2 rounded-none bg-[#0b1f3a] hover:bg-[#7a0c0c] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[17px]">add_circle</span>
              <span>+ Novo Aviso</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'avisos' && (
        /* Notices Tab */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {db.notices.map((notice) => (
            <div
              key={notice.id}
              className="bg-white rounded-none border border-slate-300 shadow-xs p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
            >
              <div
                className={`absolute top-0 left-0 right-0 h-1.5 ${
                  notice.priority === 'urgente'
                    ? 'bg-[#7a0c0c]'
                    : notice.priority === 'alta'
                    ? 'bg-amber-500'
                    : 'bg-[#0b1f3a]'
                }`}
              />

              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-none text-[10px] font-bold border ${
                      notice.priority === 'urgente'
                        ? 'bg-red-100 text-red-800 border-red-300'
                        : notice.priority === 'alta'
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-slate-100 text-slate-700 border-slate-300'
                    }`}
                  >
                    {notice.priority.toUpperCase()}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">{notice.date}</span>
                </div>

                <h3 className="font-headline font-bold text-base text-[#0b1f3a] mb-2 leading-snug">
                  {notice.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed font-body mb-4">
                  {notice.content}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">person</span>
                  <span className="font-semibold text-slate-700">{notice.author}</span>
                  <span className="text-slate-400">({notice.authorRole})</span>
                </div>
                <div className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
                  <span className="material-symbols-outlined text-[15px]">visibility</span>
                  <span>{notice.readsCount} leituras</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'biblioteca' && (
        /* Library Tab */
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-none border border-slate-300 shadow-xs flex items-center justify-between gap-3">
            <div className="relative flex items-center w-full max-w-md border border-slate-400/30 bg-slate-50/60 rounded-none focus-within:border-slate-400/70 focus-within:bg-white transition-colors">
              <span className="material-symbols-outlined ml-3 text-slate-400 text-[18px] shrink-0">
                search
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar livros por título, autor, categoria ou ISBN..."
                className="w-full h-9 pl-2 pr-3 bg-transparent border-0 border-none outline-none focus:ring-0 text-xs text-slate-800 placeholder:text-slate-400"
              />
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {filteredBooks.length} obras cadastradas
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                className="bg-white rounded-none border border-slate-300 shadow-xs p-5 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#0b1f3a]" />

                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-none text-[10px] font-bold bg-blue-50 text-[#0b1f3a] border border-blue-200">
                      {book.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">ISBN: {book.isbn}</span>
                  </div>

                  <h3 className="font-headline font-bold text-sm text-[#0b1f3a] mb-1 leading-snug">
                    {book.title}
                  </h3>

                  <p className="text-xs text-slate-600 font-medium mb-3">
                    Autor(es): <strong className="text-slate-800">{book.author}</strong>
                  </p>

                  <div className="p-2.5 rounded-none bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Localização Física:</span>
                      <strong className="text-slate-800">{book.shelfLocation}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Exemplares Disponíveis:</span>
                      <span className="font-bold text-emerald-800 font-mono">
                        {book.availableCopies} de {book.totalCopies}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Empréstimo: 15 dias</span>
                  <button
                    onClick={() => handleRequestBook(book.title)}
                    className="px-3 py-1.5 rounded-none bg-[#0b1f3a] hover:bg-[#7a0c0c] text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    Requisitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'comunicados' && (
        <ComunicadosEmMassaTab db={db} />
      )}

      {/* Notice Modal */}
      {isNoticeModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-none max-w-lg w-full shadow-2xl overflow-hidden flex flex-col border border-slate-300">
            {/* Blue header like sidebar */}
            <div className="px-6 py-4 bg-[#0b1f3a] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-white text-[22px]">campaign</span>
                <h3 className="font-headline font-bold text-base">Publicar Novo Aviso Escolar</h3>
              </div>
              <button
                onClick={() => setIsNoticeModalOpen(false)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateNotice} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block uppercase font-bold text-slate-700 mb-1">
                  Título do Comunicado <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newNoticeTitle}
                  onChange={(e) => setNewNoticeTitle(e.target.value)}
                  placeholder="Ex: Interrupção Letiva para Conselho Geral"
                  className="w-full h-9 px-3 rounded-none bg-white text-slate-800 border border-slate-300 focus:outline-none focus:border-[#0b1f3a]"
                />
              </div>

              <div>
                <label className="block uppercase font-bold text-slate-700 mb-1">Nível de Prioridade</label>
                <select
                  value={newNoticePriority}
                  onChange={(e) => setNewNoticePriority(e.target.value as any)}
                  className="w-full h-9 px-3 rounded-none bg-white text-slate-800 border border-slate-300 focus:outline-none focus:border-[#0b1f3a]"
                >
                  <option value="urgente">Urgente (Vermelho)</option>
                  <option value="alta">Alta (Laranja)</option>
                  <option value="normal">Normal (Azul)</option>
                  <option value="informativa">Informativa</option>
                </select>
              </div>

              <div>
                <label className="block uppercase font-bold text-slate-700 mb-1">Resumo Curto (Subtítulo)</label>
                <input
                  type="text"
                  value={newNoticeExcerpt}
                  onChange={(e) => setNewNoticeExcerpt(e.target.value)}
                  placeholder="Breve resumo de 1 linha..."
                  className="w-full h-9 px-3 rounded-none bg-white text-slate-800 border border-slate-300 focus:outline-none focus:border-[#0b1f3a]"
                />
              </div>

              <div>
                <label className="block uppercase font-bold text-slate-700 mb-1">
                  Conteúdo Completo <span className="text-red-600">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={newNoticeContent}
                  onChange={(e) => setNewNoticeContent(e.target.value)}
                  placeholder="Escreva a circular informativa para professores, alunos e encarregados..."
                  className="w-full p-3 rounded-none bg-white text-slate-800 border border-slate-300 focus:outline-none focus:border-[#0b1f3a]"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsNoticeModalOpen(false)}
                  className="px-4 py-2 rounded-none bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-none font-bold text-white transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm bg-[#0b1f3a] hover:bg-[#7a0c0c]"
                >
                  <span className="material-symbols-outlined text-[18px]">campaign</span>
                  <span>Publicar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
