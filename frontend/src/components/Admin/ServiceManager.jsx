import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Scissors, Clock, Tag, X, Image as ImageIcon, Download } from 'lucide-react';
import { createService, updateService, deleteService } from '../../services/api';
import { exportToCSV } from '../../utils/exportExcel';
import { useLanguage } from '../../context/LanguageContext';

export default function ServiceManager({ services, loading, onRefresh }) {
  const { t } = useLanguage();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const handleExportExcel = () => {
    const headers = ['ID Layanan', 'Nama Layanan', 'Durasi (Menit)', 'Harga (Rp)', 'Deskripsi'];
    const rows = (services || []).map(s => [
      s.id,
      s.name,
      s.duration_minutes,
      Number(s.price),
      s.description || '-'
    ]);
    exportToCSV('Data_Layanan_LuxeSalon', headers, rows);
  };
  const [formData, setFormData] = useState({
    name: '',
    duration_minutes: 60,
    price: 100000,
    description: '',
    image_url: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleOpenAdd = () => {
    setEditingService(null);
    setFormData({
      name: '',
      duration_minutes: 60,
      price: 150000,
      description: '',
      image_url: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=600&q=80'
    });
    setError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      duration_minutes: service.duration_minutes,
      price: service.price,
      description: service.description || '',
      image_url: service.image_url || ''
    });
    setError('');
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus layanan ini?')) return;
    try {
      await deleteService(id);
      onRefresh();
    } catch (err) {
      alert('Gagal menghapus layanan.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.name || !formData.duration_minutes || !formData.price) {
      setError('Nama, Durasi, dan Harga wajib diisi!');
      return;
    }

    try {
      setSubmitting(true);
      if (editingService) {
        await updateService(editingService.id, formData);
      } else {
        await createService(formData);
      }
      setModalOpen(false);
      onRefresh();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan layanan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl font-bold text-slate-dark">{t('admin_service_title')}</h2>
          <p className="text-grey-soft text-sm">{t('admin_service_subtitle')}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportExcel}
            className="px-4 py-3 rounded-xl bg-status-green text-white font-bold text-xs hover:bg-status-green/90 transition-all flex items-center justify-center gap-1.5 shadow-sm"
            title="Download Master Data Layanan ke Excel (CSV)"
          >
            <Download className="w-4 h-4" />
            <span>{t('btn_export_service')}</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-5 py-3 rounded-xl bg-emeraldsoft text-white font-bold text-sm hover:bg-emeraldsoft-dark transition-all flex items-center justify-center gap-2 shadow-md"
          >
            <Plus className="w-5 h-5 text-rosegold" />
            <span>{t('btn_add_service')}</span>
          </button>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-2xl border border-grey-border shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-cream-100 border-b border-grey-border text-xs uppercase font-bold text-slate-dark tracking-wider">
                <th className="py-4 px-4">{t('th_image')}</th>
                <th className="py-4 px-4">{t('th_service')}</th>
                <th className="py-4 px-4">{t('th_duration')}</th>
                <th className="py-4 px-4">{t('th_price')}</th>
                <th className="py-4 px-4">{t('th_description')}</th>
                <th className="py-4 px-4 text-right">{t('th_action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200 text-xs sm:text-sm text-slate-dark">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-grey-soft">Memuat layanan...</td>
                </tr>
              ) : services.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-grey-soft">Belum ada data layanan.</td>
                </tr>
              ) : (
                services.map((s) => (
                  <tr key={s.id} className="hover:bg-cream-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <img
                        src={s.image_url || 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=600&q=80'}
                        alt={s.name}
                        className="w-12 h-12 object-cover rounded-xl border border-grey-border"
                      />
                    </td>
                    <td className="py-3 px-4 font-bold text-emeraldsoft">{s.name}</td>
                    <td className="py-3 px-4 font-medium">{s.duration_minutes} Menit</td>
                    <td className="py-3 px-4 font-bold text-slate-dark">
                      Rp {Number(s.price).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-grey-soft max-w-xs truncate">
                      {s.description || '-'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(s)}
                          className="p-2 rounded-lg bg-cream-200 text-slate-dark hover:bg-rosegold hover:text-white transition-colors"
                          title="Edit Layanan"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="p-2 rounded-lg bg-status-coral/10 text-status-coral hover:bg-status-coral hover:text-white transition-colors"
                          title="Hapus Layanan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-dark/70 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-modal overflow-hidden border border-cream-200 animate-in fade-in zoom-in duration-200 my-8">
            <div className="h-2 bg-emeraldsoft" />
            <div className="p-6 pb-4 border-b border-cream-200 flex items-center justify-between">
              <h3 className="font-serif text-2xl font-bold text-slate-dark">
                {editingService ? 'Edit Layanan' : 'Tambah Layanan Baru'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-full text-grey-soft hover:text-slate-dark">
                <X className="w-6 h-6" />
              </button>
            </div>

            {error && <div className="mx-6 mt-4 p-3 rounded-xl bg-status-coral/10 text-status-coral text-xs font-semibold">⚠️ {error}</div>}

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-dark mb-1">Nama Layanan *</label>
                <input
                  type="text"
                  placeholder="Contoh: Hair Spa Aromatherapy"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-grey-border focus:border-emeraldsoft outline-none text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-dark mb-1">Durasi (Menit) *</label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-grey-border focus:border-emeraldsoft outline-none text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-dark mb-1">Harga (Rp) *</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-grey-border focus:border-emeraldsoft outline-none text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-dark mb-1">URL Gambar (Opsional)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-grey-border focus:border-emeraldsoft outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-dark mb-1">Deskripsi Layanan</label>
                <textarea
                  rows="3"
                  placeholder="Penjelasan singkat perawatan..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-grey-border focus:border-emeraldsoft outline-none text-sm"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-emeraldsoft text-white font-bold text-sm hover:bg-emeraldsoft-dark transition-all disabled:opacity-50"
                >
                  {submitting ? 'Memproses...' : (editingService ? 'Perbarui Layanan' : 'Simpan Layanan')}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
