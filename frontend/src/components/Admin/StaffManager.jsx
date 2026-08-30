import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, CheckCircle, XCircle, Sparkles, Scissors, Download } from 'lucide-react';
import { getAllStaff, createStaff, updateStaff, deleteStaff } from '../../services/api';
import { exportToCSV } from '../../utils/exportExcel';
import { useLanguage } from '../../context/LanguageContext';

export default function StaffManager({ services }) {
  const { t } = useLanguage();
  const [staffList, setStaffList] = useState([]);

  const handleExportExcel = () => {
    const headers = ['ID Staff', 'Nama Staff', 'Peran / Role', 'Status Cuti / Aktif', 'Keahlian Layanan'];
    const rows = (staffList || []).map(st => [
      st.id,
      st.name,
      st.role || 'Stylist / Therapist',
      st.is_active ? '🟢 Aktif (Bertugas)' : '🏖️ Cuti / Off',
      st.service_names && st.service_names.length > 0 ? st.service_names.join(', ') : 'Semua Layanan'
    ]);
    exportToCSV('Data_Staff_LuxeSalon', headers, rows);
  };
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    role: 'Stylist / Therapist',
    is_active: true,
    service_ids: []
  });

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await getAllStaff();
      if (res.success) {
        setStaffList(res.staff);
      }
    } catch (err) {
      console.error('Error fetching staff list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setFormData({
      name: '',
      role: 'Stylist / Therapist',
      is_active: true,
      service_ids: services ? services.map(s => s.id) : []
    });
    setError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (st) => {
    setEditingStaff(st);
    setFormData({
      name: st.name,
      role: st.role || 'Stylist / Therapist',
      is_active: st.is_active,
      service_ids: Array.isArray(st.service_ids) ? st.service_ids : []
    });
    setError('');
    setModalOpen(true);
  };

  const handleToggleService = (serviceId) => {
    setFormData(prev => {
      const current = prev.service_ids || [];
      if (current.includes(serviceId)) {
        return { ...prev, service_ids: current.filter(id => id !== serviceId) };
      } else {
        return { ...prev, service_ids: [...current, serviceId] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.name) {
      setError('Nama staff wajib diisi.');
      return;
    }

    try {
      setSaving(true);
      if (editingStaff) {
        await updateStaff(editingStaff.id, formData);
      } else {
        await createStaff(formData);
      }
      setModalOpen(false);
      fetchStaff();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan data staff.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus staff ${name}?`)) return;
    try {
      await deleteStaff(id);
      fetchStaff();
    } catch (err) {
      alert('Gagal menghapus staff.');
    }
  };

  const handleToggleActive = async (st) => {
    try {
      await updateStaff(st.id, {
        name: st.name,
        role: st.role,
        is_active: !st.is_active,
        service_ids: st.service_ids || []
      });
      fetchStaff();
    } catch (err) {
      alert('Gagal mengubah status staff.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl font-bold text-slate-dark">{t('admin_staff_title')}</h2>
          <p className="text-grey-soft text-sm">
            {t('admin_staff_subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportExcel}
            className="px-4 py-3 rounded-xl bg-status-green text-white font-bold text-xs hover:bg-status-green/90 transition-all flex items-center justify-center gap-1.5 shadow-sm"
            title="Download Master Data Staff ke Excel (CSV)"
          >
            <Download className="w-4 h-4" />
            <span>{t('btn_export_staff')}</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-5 py-3 rounded-xl bg-emeraldsoft text-white font-bold text-sm hover:bg-emeraldsoft-dark transition-all flex items-center justify-center gap-2 shadow-md"
          >
            <Plus className="w-5 h-5 text-rosegold" />
            <span>{t('btn_add_staff')}</span>
          </button>
        </div>
      </div>

      {/* Staff Grid */}
      {loading ? (
        <div className="text-center py-12 text-grey-soft font-medium">Memuat data staff...</div>
      ) : staffList.length === 0 ? (
        <div className="text-center py-12 text-grey-soft font-medium bg-white rounded-2xl border border-grey-border">
          Belum ada staff terdaftar. Silakan tambahkan staff baru.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staffList.map((st) => {
            const mappedServiceNames = (services || [])
              .filter(s => (st.service_ids || []).includes(s.id))
              .map(s => s.name);

            return (
              <div
                key={st.id}
                className={`bg-white rounded-2xl border ${st.is_active ? 'border-grey-border' : 'border-status-coral/30 opacity-75'} p-5 shadow-soft space-y-4 relative flex flex-col justify-between`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-cream-100 border border-rosegold/40 flex items-center justify-center text-emeraldsoft font-bold font-serif text-lg">
                        {st.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-serif font-bold text-slate-dark text-lg leading-snug">{st.name}</h3>
                        <span className="text-xs text-rosegold font-medium block">{st.role || 'Stylist / Therapist'}</span>
                      </div>
                    </div>

                    {/* Active / Cuti Toggle Badge */}
                    <button
                      onClick={() => handleToggleActive(st)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                        st.is_active
                          ? 'bg-status-green/10 text-status-green border-status-green/30 hover:bg-status-green/20'
                          : 'bg-status-coral/10 text-status-coral border-status-coral/30 hover:bg-status-coral/20'
                      }`}
                      title="Klik untuk mengubah status (Aktif Bertugas / Sedang Cuti)"
                    >
                      {st.is_active ? '🟢 Aktif (Bertugas)' : '🏖️ Cuti / Off'}
                    </button>
                  </div>

                  {/* Skills Badges */}
                  <div className="pt-2 border-t border-cream-200 space-y-1.5">
                    <span className="text-[11px] uppercase font-bold text-grey-soft tracking-wider block flex items-center gap-1">
                      <Scissors className="w-3.5 h-3.5 text-emeraldsoft" />
                      Keahlian Layanan ({mappedServiceNames.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {mappedServiceNames.length > 0 ? (
                        mappedServiceNames.map((srvName, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 rounded-lg bg-cream-100 border border-cream-200 text-[11px] font-semibold text-slate-dark"
                          >
                            {srvName}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-status-coral italic">Belum ada keahlian dipilih</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-4 border-t border-cream-200 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEdit(st)}
                    className="p-2 rounded-xl bg-cream-100 text-slate-dark hover:bg-emeraldsoft hover:text-white transition-colors text-xs font-semibold flex items-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleDelete(st.id, st.name)}
                    className="p-2 rounded-xl bg-status-coral/10 text-status-coral hover:bg-status-coral hover:text-white transition-colors text-xs font-semibold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-dark/70 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-modal overflow-hidden border border-cream-200 my-8">
            <div className="h-2 bg-emeraldsoft" />
            
            <div className="p-6 pb-4 border-b border-cream-200 flex items-center justify-between">
              <h3 className="font-serif text-2xl font-bold text-slate-dark">
                {editingStaff ? 'Edit Data Staff' : '+ Tambah Staff Baru'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-grey-soft hover:text-slate-dark text-xl font-bold">
                ✕
              </button>
            </div>

            {error && <div className="mx-6 mt-4 p-3 rounded-xl bg-status-coral/10 text-status-coral text-xs font-semibold">⚠️ {error}</div>}

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-dark mb-1">
                  Nama Staff *
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Stylist Anita"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-grey-border focus:border-emeraldsoft outline-none text-sm text-slate-dark"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-dark mb-1">
                  Spesialisasi / Jabatan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Senior Hair Stylist"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-grey-border focus:border-emeraldsoft outline-none text-sm text-slate-dark"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-dark mb-2">
                  Pilih Layanan yang Bisa Dikerjakan (Skill Match) *
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto p-3 rounded-xl border border-grey-border bg-cream-50">
                  {(services || []).map((s) => {
                    const isChecked = (formData.service_ids || []).includes(s.id);
                    return (
                      <label
                        key={s.id}
                        className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors border ${
                          isChecked ? 'bg-white border-emeraldsoft shadow-sm' : 'hover:bg-white/50 border-transparent'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleService(s.id)}
                          className="w-4 h-4 text-emeraldsoft rounded focus:ring-emeraldsoft accent-emeraldsoft"
                        />
                        <div className="flex-1 flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-dark">{s.name}</span>
                          <span className="text-grey-soft font-mono">({s.duration_minutes} min)</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-emeraldsoft rounded focus:ring-emeraldsoft accent-emeraldsoft"
                />
                <label htmlFor="is_active" className="text-xs font-semibold text-slate-dark cursor-pointer">
                  Status Staff Aktif / Siap Bertugas (Uncheck jika Sedang Cuti / Off)
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-grey-border text-xs font-semibold text-grey-soft hover:bg-cream-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-emeraldsoft text-white font-bold text-xs hover:bg-emeraldsoft-dark transition-all disabled:opacity-50"
                >
                  {saving ? 'Menyimpan...' : editingStaff ? 'Simpan Perubahan' : 'Tambah Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
