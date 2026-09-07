import React, { useState, useEffect } from 'react';
import { 
  Users, UserCheck, ShieldCheck, Plus, Edit, Trash2, X, Building2, Key, RefreshCw, CheckCircle2, UserPlus
} from 'lucide-react';
import { getUsers, createUser, updateUser, deleteUser } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function UserManager({ outlets }) {
  const { t } = useLanguage();
  const { admin: currentAdmin } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    password: '',
    role: 'outlet_admin',
    outlet_id: ''
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getUsers();
      if (res.success) {
        setUsers(res.users);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      name: '',
      password: '',
      role: 'outlet_admin',
      outlet_id: outlets && outlets.length > 0 ? String(outlets[0].id) : ''
    });
    setMsg({ type: '', text: '' });
    setModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      name: user.name,
      password: '', // Blank by default, leave empty to keep unchanged
      role: user.role || 'outlet_admin',
      outlet_id: user.outlet_id ? String(user.outlet_id) : (outlets && outlets.length > 0 ? String(outlets[0].id) : '')
    });
    setMsg({ type: '', text: '' });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    if (!formData.username || !formData.name) {
      setMsg({ type: 'error', text: 'Username dan Nama wajib diisi!' });
      return;
    }

    if (!editingUser && !formData.password) {
      setMsg({ type: 'error', text: 'Password wajib diisi untuk akun baru!' });
      return;
    }

    if (formData.role === 'outlet_admin' && !formData.outlet_id) {
      setMsg({ type: 'error', text: 'Silakan pilih cabang outlet untuk peran Outlet Admin!' });
      return;
    }

    try {
      setSaving(true);
      let res;
      if (editingUser) {
        res = await updateUser(editingUser.id, formData);
      } else {
        res = await createUser(formData);
      }

      if (res.success) {
        setMsg({ type: 'success', text: res.message });
        setTimeout(() => {
          setModalOpen(false);
          fetchUsers();
        }, 700);
      } else {
        setMsg({ type: 'error', text: res.message || t('err_save_user') });
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || t('err_save_user') });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, username) => {
    if (currentAdmin && currentAdmin.id === id) {
      alert(t('err_delete_own_user'));
      return;
    }

    if (!window.confirm(`${t('confirm_delete_user')} "${username}"?`)) return;

    try {
      const res = await deleteUser(id);
      if (res.success) {
        fetchUsers();
      }
    } catch (err) {
      alert(err.response?.data?.message || t('err_delete_user'));
    }
  };

  const formatDate = (dateStr) => {
    try {
      if (!dateStr) return '-';
      return format(new Date(dateStr), "dd MMM yyyy, HH:mm", { locale: id });
    } catch {
      return dateStr || '-';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-grey-border shadow-soft">
        <div>
          <h2 className="font-serif text-2xl font-bold text-slate-dark flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emeraldsoft" />
            <span>{t('admin_user_title')}</span>
          </h2>
          <p className="text-grey-soft text-xs sm:text-sm mt-1">
            {t('admin_user_subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="p-2.5 rounded-xl bg-cream-100 border border-grey-border text-slate-dark hover:bg-emeraldsoft hover:text-white transition-all disabled:opacity-50"
            title="Refresh Data User"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-5 py-3 rounded-xl bg-emeraldsoft text-white font-bold text-sm hover:bg-emeraldsoft-dark transition-all flex items-center justify-center gap-2 shadow-sm shrink-0"
          >
            <UserPlus className="w-4 h-4 text-rosegold" />
            <span>{t('btn_add_user')}</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-grey-border shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-cream-100 text-slate-dark uppercase font-semibold text-[11px] tracking-wider border-b border-grey-border">
              <tr>
                <th className="py-3.5 px-4">{t('th_username')}</th>
                <th className="py-3.5 px-4">{t('th_user_fullname')}</th>
                <th className="py-3.5 px-4">{t('th_user_role')}</th>
                <th className="py-3.5 px-4">{t('th_user_outlet')}</th>
                <th className="py-3.5 px-4">{t('th_created_at')}</th>
                <th className="py-3.5 px-4 text-right">{t('th_action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-grey-border">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-grey-soft">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emeraldsoft" />
                    <span>{t('loading_users')}</span>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-grey-soft">
                    <span>{t('empty_users')}</span>
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isSuper = u.role === 'admin';
                  const isCurrent = currentAdmin && currentAdmin.id === u.id;
                  return (
                    <tr key={u.id} className="hover:bg-cream-50/60 transition-colors">
                      
                      {/* Username */}
                      <td className="py-4 px-4 font-mono font-bold text-slate-dark">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${isSuper ? 'bg-rosegold/20 text-rosegold-dark' : 'bg-emeraldsoft/10 text-emeraldsoft'}`}>
                            {isSuper ? '👑' : '👤'}
                          </div>
                          <div>
                            <span>{u.username}</span>
                            {isCurrent && (
                              <span className="block text-[10px] text-emeraldsoft font-sans font-semibold">
                                (Akun Anda)
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Full Name */}
                      <td className="py-4 px-4 font-semibold text-slate-dark">
                        {u.name}
                      </td>

                      {/* Role Badge */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                          isSuper 
                            ? 'bg-rosegold/20 text-rosegold-dark border border-rosegold/40' 
                            : 'bg-emeraldsoft/10 text-emeraldsoft border border-emeraldsoft/30'
                        }`}>
                          {isSuper ? t('role_super_admin') : t('role_outlet_admin')}
                        </span>
                      </td>

                      {/* Assigned Outlet */}
                      <td className="py-4 px-4">
                        {isSuper ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-grey-soft">
                            🌐 {t('badge_all_outlets')}
                          </span>
                        ) : u.outlet_name ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cream-100 text-emeraldsoft font-bold text-xs border border-cream-200">
                            <Building2 className="w-3.5 h-3.5 text-rosegold" />
                            <span>{u.outlet_name}</span>
                          </span>
                        ) : (
                          <span className="text-xs text-status-coral italic">Belum ditentukan</span>
                        )}
                      </td>

                      {/* Created At */}
                      <td className="py-4 px-4 text-grey-soft text-xs">
                        {formatDate(u.created_at)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="px-3 py-1.5 rounded-lg bg-cream-100 border border-grey-border text-slate-dark font-semibold text-xs hover:bg-emeraldsoft hover:text-white transition-all inline-flex items-center gap-1"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>{t('btn_edit')}</span>
                        </button>
                        
                        {u.username !== 'admin' && !isCurrent && (
                          <button
                            onClick={() => handleDelete(u.id, u.username)}
                            className="px-3 py-1.5 rounded-lg bg-status-coral/10 border border-status-coral/30 text-status-coral font-semibold text-xs hover:bg-status-coral hover:text-white transition-all inline-flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{t('btn_delete')}</span>
                          </button>
                        )}
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-dark/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-luxury overflow-hidden border border-grey-border animate-in fade-in zoom-in-95 duration-200 my-auto">
            
            <div className="bg-emeraldsoft p-6 text-white flex items-center justify-between">
              <h3 className="font-serif text-xl font-bold text-cream flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-rosegold" />
                <span>{editingUser ? t('modal_edit_user_title') : t('modal_add_user_title')}</span>
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-full text-cream-200 hover:text-white hover:bg-white/10"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {msg.text && (
              <div className={`mx-6 mt-4 p-3 rounded-xl text-xs font-semibold ${msg.type === 'error' ? 'bg-status-coral/10 text-status-coral border border-status-coral/30' : 'bg-status-green/10 text-status-green border border-status-green/30'}`}>
                {msg.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              
              {/* Username */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-dark mb-1">
                  {t('field_user_username')}
                </label>
                <input
                  type="text"
                  placeholder="Contoh: admin_senopati"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-grey-border focus:border-rosegold outline-none text-sm text-slate-dark"
                  required
                />
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-dark mb-1">
                  {t('field_user_name')}
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Siti Rahmawati"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-grey-border focus:border-rosegold outline-none text-sm text-slate-dark"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-dark mb-1">
                  {editingUser ? t('field_user_password_edit') : t('field_user_password')}
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-grey-soft absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    placeholder={editingUser ? '•••••••• (Biarkan kosong jika tidak diganti)' : 'Minimal 6 karakter'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-grey-border focus:border-rosegold outline-none text-sm text-slate-dark"
                    required={!editingUser}
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-dark mb-1">
                  {t('field_user_role')}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  
                  {/* Outlet Admin Option */}
                  <label className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                    formData.role === 'outlet_admin'
                      ? 'border-emeraldsoft bg-emeraldsoft/5 shadow-xs'
                      : 'border-grey-border hover:bg-cream-50'
                  }`}>
                    <input
                      type="radio"
                      name="role"
                      value="outlet_admin"
                      checked={formData.role === 'outlet_admin'}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="mt-0.5 accent-emeraldsoft"
                    />
                    <div>
                      <span className="font-bold text-xs text-slate-dark block">
                        📍 Outlet Admin
                      </span>
                      <span className="text-[11px] text-grey-soft leading-tight block mt-0.5">
                        Akses dibatasi hanya untuk 1 cabang tertentu
                      </span>
                    </div>
                  </label>

                  {/* Super Admin Option */}
                  <label className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                    formData.role === 'admin'
                      ? 'border-rosegold bg-rosegold/10 shadow-xs'
                      : 'border-grey-border hover:bg-cream-50'
                  }`}>
                    <input
                      type="radio"
                      name="role"
                      value="admin"
                      checked={formData.role === 'admin'}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="mt-0.5 accent-rosegold"
                    />
                    <div>
                      <span className="font-bold text-xs text-slate-dark block">
                        👑 Super Admin
                      </span>
                      <span className="text-[11px] text-grey-soft leading-tight block mt-0.5">
                        Akses penuh ke semua cabang & kelola user/outlet
                      </span>
                    </div>
                  </label>

                </div>
              </div>

              {/* Outlet Dropdown (Only when role is outlet_admin) */}
              {formData.role === 'outlet_admin' && (
                <div className="animate-in fade-in duration-150">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-dark mb-1 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-emeraldsoft" />
                    <span>{t('field_user_assigned_outlet')}</span>
                  </label>
                  <select
                    value={formData.outlet_id}
                    onChange={(e) => setFormData({ ...formData, outlet_id: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-grey-border focus:border-rosegold outline-none text-sm text-slate-dark bg-white"
                    required={formData.role === 'outlet_admin'}
                  >
                    <option value="">{t('select_assigned_outlet')}</option>
                    {(outlets || []).map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name} - ({o.address})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Form Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-grey-border text-slate-dark font-bold text-sm hover:bg-cream-100"
                >
                  {t('btn_cancel')}
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-emeraldsoft text-white font-bold text-sm hover:bg-emeraldsoft-dark disabled:opacity-50"
                >
                  {saving ? t('btn_saving') : t('btn_save_user')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
