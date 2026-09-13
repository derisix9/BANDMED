import React, { useEffect, useRef, useState } from 'react';
import { InstitutionSettings, User, UserRole } from '../../types';
import { dbService } from '../../services/db';
import { runGlobalOperation } from '../../context/OperationContext';
import { compressImageFile } from '../../utils/imageCompressor';
import { defaultRoles, RoleKey } from '../../utils/permissions';

interface TabUsuariosProps {
  settings: InstitutionSettings;
  currentUserRole?: UserRole;
  onUpdateSettings?: (newSettings: Partial<InstitutionSettings>) => void;
  onSaveAll: (options?: { loadingMessage?: string; successMessage?: string; requiredRule?: string }) => void;
}

const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80'
];

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador Geral',
  director: 'Direção Pedagógica',
  secretaria: 'Secretaria Escolar',
  professor: 'Corpo Docente',
  financeiro: 'Tesouraria & Finanças',
  aluno: 'Estudante',
  encarregado: 'Encarregado de Educação'
};

const ROLE_ORDER: UserRole[] = ['admin', 'director', 'secretaria', 'professor', 'financeiro', 'aluno', 'encarregado'];

interface UserFormState {
  id: string | null;
  name: string;
  email: string;
  username: string;
  password: string;
  phone: string;
  role: UserRole;
  avatar: string;
}

const emptyForm = (): UserFormState => ({
  id: null,
  name: '',
  email: '',
  username: '',
  password: '',
  phone: '',
  role: 'secretaria',
  avatar: DEFAULT_AVATARS[0]
});

export const TabUsuarios: React.FC<TabUsuariosProps> = ({ settings, currentUserRole }) => {
  const [users, setUsers] = useState<User[]>(dbService.getUsers());
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<UserFormState>(emptyForm());
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const unsubscribe = dbService.subscribe((db) => {
      setUsers(db.users || []);
    });
    return () => unsubscribe();
  }, []);

  const roleDefFor = (role: UserRole) => {
    const rolesStore = { ...defaultRoles, ...(settings.rolePermissions || {}) } as Record<string, any>;
    return rolesStore[role as RoleKey];
  };

  const openAddModal = () => {
    setForm(emptyForm());
    setErrorMessage(null);
    setShowModal(true);
  };

  const openEditModal = (user: User) => {
    setForm({
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username || '',
      password: '',
      phone: user.phone || '',
      role: user.role,
      avatar: user.avatar || DEFAULT_AVATARS[0]
    });
    setErrorMessage(null);
    setShowModal(true);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('A fotografia excede o limite de 10MB.');
      return;
    }
    try {
      const compressed = await compressImageFile(file, 300, 300, 0.82);
      setForm((prev) => ({ ...prev, avatar: compressed }));
    } catch {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setForm((prev) => ({ ...prev, avatar: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!form.name.trim() || !form.email.trim()) {
      setErrorMessage('Por favor, preencha pelo menos o nome e o e-mail do utilizador.');
      return;
    }
    if (!form.id && (!form.password || form.password.trim().length < 4)) {
      setErrorMessage('Defina uma palavra-passe com pelo menos 4 caracteres para o novo utilizador.');
      return;
    }

    const isEditing = !!form.id;

    try {
      await runGlobalOperation(
        async () => {
          if (isEditing && form.id) {
            const updates: Partial<User> = {
              name: form.name.trim(),
              email: form.email.trim().toLowerCase(),
              username: form.username.trim() || undefined,
              phone: form.phone.trim(),
              role: form.role,
              roleTitle: ROLE_LABELS[form.role],
              avatar: form.avatar
            };
            if (form.password.trim()) {
              updates.password = form.password.trim();
            }
            dbService.updateUser(form.id, updates);
          } else {
            dbService.addUser({
              name: form.name.trim(),
              email: form.email.trim().toLowerCase(),
              username: form.username.trim() || undefined,
              role: form.role,
              roleTitle: ROLE_LABELS[form.role],
              avatar: form.avatar,
              phone: form.phone.trim(),
              password: form.password.trim()
            });
          }
        },
        {
          requiredRule: 'config.permissions',
          userRole: currentUserRole,
          loadingMessage: isEditing
            ? 'A atualizar dados do utilizador no sistema...'
            : 'A criar novo utilizador e a atribuir perfil de acesso...',
          successMessage: 'Operação feita com sucesso!'
        }
      );
      setShowModal(false);
      setForm(emptyForm());
    } catch {
      // Erro já apresentado pelo modal global de operação (ex: permissão negada)
    }
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    const target = userToDelete;
    setUserToDelete(null);

    try {
      await runGlobalOperation(
        async () => {
          const result = dbService.deleteUser(target.id);
          if (!result.success) {
            throw new Error(result.error || 'Não foi possível eliminar o utilizador.');
          }
        },
        {
          requiredRule: 'config.permissions',
          userRole: currentUserRole,
          loadingMessage: `A eliminar o utilizador ${target.name}...`,
          successMessage: 'Operação feita com sucesso!'
        }
      );
    } catch {
      // Erro já apresentado pelo modal global de operação
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-[#0b1f3a] shrink-0">
            <span className="material-symbols-outlined text-[26px]">group_add</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider text-[#ac332b] font-bold">Módulo 08</span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span className="text-[11px] text-slate-500 font-medium">Criação de Contas & Atribuição de Perfis</span>
            </div>
            <h2 className="font-headline text-lg lg:text-xl font-bold text-slate-900">
              Criação de Utilizadores & Perfis de Acesso
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-blue-50 text-[#0b1f3a] font-mono text-xs font-bold rounded-xl border border-blue-100 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">groups</span>
            <span>{users.length} Utilizador(es) Registado(s)</span>
          </span>
          <button
            type="button"
            onClick={openAddModal}
            className="px-3.5 py-2 rounded-xl bg-[#0b1f3a] hover:bg-[#7a0c0c] text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Criar Novo Utilizador</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-4">
        <div className="pb-3 border-b border-slate-100">
          <h3 className="font-headline text-base lg:text-lg font-bold text-slate-900">
            Utilizadores desta Instituição
          </h3>
          <p className="text-xs text-slate-500">
            Cada instituição vê apenas os utilizadores criados na sua própria base de dados isolada. Atribua um perfil (Administrador, Direção, Secretaria, Docente ou Tesouraria) para definir as permissões de acesso do utilizador.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100">
                <th className="py-3 px-4 rounded-l-lg">Utilizador</th>
                <th className="py-3 px-4">E-mail / Utilizador</th>
                <th className="py-3 px-4">Perfil Atribuído</th>
                <th className="py-3 px-4">Contacto</th>
                <th className="py-3 px-4 text-right rounded-r-lg">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 px-4 text-center text-slate-400">
                    Nenhum utilizador registado ainda. Clique em "Criar Novo Utilizador" para começar.
                  </td>
                </tr>
              )}
              {users.map((user) => {
                const roleDef = roleDefFor(user.role);
                return (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={user.avatar || DEFAULT_AVATARS[0]}
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 truncate">{user.name}</div>
                          <div className="text-[10px] text-slate-400">{user.roleTitle}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-700">{user.email}</div>
                      {user.username && <div className="text-[10px] text-slate-400 font-mono">@{user.username}</div>}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-700 text-[11px]">
                        {roleDef?.name || ROLE_LABELS[user.role]}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{user.phone || '—'}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(user)}
                          className="text-[#0b1f3a] hover:text-[#ac332b] font-bold p-1 cursor-pointer"
                          title="Editar utilizador"
                        >
                          <span className="material-symbols-outlined text-[17px]">edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setUserToDelete(user)}
                          className="text-slate-400 hover:text-red-600 font-bold p-1 cursor-pointer"
                          title="Eliminar utilizador"
                        >
                          <span className="material-symbols-outlined text-[17px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal Novo / Editar Utilizador */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-headline font-bold text-slate-900 text-sm lg:text-base">
                {form.id ? 'Editar Utilizador' : 'Criar Novo Utilizador'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {errorMessage && (
              <div className="mt-3 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[11px] font-medium">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-200 shrink-0 bg-slate-100">
                  <img src={form.avatar} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <label className="block font-bold text-slate-700 mb-1">Fotografia de Perfil</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    id="user-avatar-upload"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">upload</span>
                    <span>Carregar Foto</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Ana Paula dos Santos"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-[#0b1f3a]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">E-mail Institucional</label>
                  <input
                    type="email"
                    required
                    placeholder="ex: ana.santos@escola.pt"
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-[#0b1f3a]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nome de Utilizador</label>
                  <input
                    type="text"
                    placeholder="ex: ana.santos"
                    value={form.username}
                    onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-[#0b1f3a]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Palavra-passe {form.id && <span className="text-slate-400 font-normal">(deixe em branco para manter)</span>}
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-[#0b1f3a]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Telefone</label>
                  <input
                    type="text"
                    placeholder="+244 900 000 000"
                    value={form.phone}
                    onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-[#0b1f3a]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Perfil de Acesso (Permissões)</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value as UserRole }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-[#0b1f3a]"
                >
                  {ROLE_ORDER.map((role) => (
                    <option key={role} value={role}>
                      {roleDefFor(role)?.name || ROLE_LABELS[role]}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  O perfil selecionado define quais módulos e ações o utilizador poderá aceder (ver aba "Perfis & Permissões").
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#0b1f3a] text-white font-bold hover:bg-[#7a0c0c] transition-colors cursor-pointer"
                >
                  {form.id ? 'Salvar Alterações' : 'Criar Utilizador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Eliminar Utilizador */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-none max-w-md w-full p-6 border border-slate-300 shadow-2xl">
            <div className="w-12 h-12 rounded-none bg-red-100 text-red-700 flex items-center justify-center mx-auto mb-4 border border-red-300">
              <span className="material-symbols-outlined text-[28px]">delete_forever</span>
            </div>
            <h3 className="font-headline text-lg font-bold text-slate-900 text-center">
              Eliminar Utilizador da Base de Dados?
            </h3>
            <p className="text-xs text-slate-600 text-center mt-2 leading-relaxed">
              Tem a certeza de que deseja eliminar o utilizador <strong>{userToDelete.name}</strong> ({ROLE_LABELS[userToDelete.role]})? Esta ação é definitiva na base de dados.
            </p>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 rounded-none bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs border border-slate-300 cursor-pointer transition-colors"
                type="button"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-none bg-[#b91c1c] hover:bg-[#7a0c0c] text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-none border-none"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                <span>Sim, Eliminar Utilizador</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
