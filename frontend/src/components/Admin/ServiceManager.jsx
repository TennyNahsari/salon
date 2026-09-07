import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Scissors, Clock, Tag, X, Image as ImageIcon, Download, Building2, Lock } from 'lucide-react';
import { createService, updateService, deleteService } from '../../services/api';
import { exportToCSV } from '../../utils/exportExcel';
import { useLanguage } from '../../context/LanguageContext';

export default function ServiceManager({ services, loading, onRefresh, outlets, userRole, userOutletId, userOutletName }) {
  const { t } = useLanguage();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const isBranchAdmin = userRole !== 'admin' && userOutletId;

  const handleExportExcel = () => {
    const headers = ['ID Layanan', 'Nama Layanan', 'Cabang Outlet', 'Durasi (Menit)', 'Harga (Rp)', 'Deskripsi'];
    const rows = (services || []).map(s => {
      const mappedOutlets = (outlets || [])
        .filter(o => (s.outlet_ids || []).includes(o.id))
        .map(o => o.name);
      return [
        s.id,
        s.name,
        mappedOutlets.length > 0 ? mappedOutlets.join(', ') : 'Semua Outlet',
        s.duration_minutes,
        Number(s.price),
        s.description || '-'
      ];
    });
    exportToCSV('Data_Layanan_LuxeSalon', headers, rows);
  };

  const [formData, setFormData] = useState({
    name: '',
    duration_minutes: 60,
    price: 100000,
    description: '',
    image_url: '',
    outlet_ids: []
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
      image_url: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=600&q=80',
      outlet_ids: isBranchAdmin ? [Number(userOutletId)] : (outlets ? outlets.map(o => o.id) : [])
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
      image_url: service.image_url || '',
      outlet_ids: isBranchAdmin ? [Number(userOutletId)] : (Array.isArray(service.outlet_ids) ? service.outlet_ids : [])
    });
    setError('');
    setModalOpen(true);
  };

  const handleToggleOutlet = (outletId) => {
    if (isBranchAdmin) return;
    setFormData(prev => {
      const current = prev.outlet_ids || [];
      if (current.includes(outletId)) {
        return { ...prev, outlet_ids: current.filter(id => id !== outletId) };
      } else {
        return { ...prev, outlet_ids: [...current, outletId] };
      }
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('confirm_delete_service'))) return;
    try {
      await deleteService(id);
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || t('err_delete_service'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.name || !formData.duration_minutes || !formData.price) {
      setError(t('err_service_required'));
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        outlet_ids: isBranchAdmin ? [Number(userOutletId)] : formData.outlet_ids
      };

      if (editingService) {
        await updateService(editingService.id, payload);
      } else {
        await createService(payload);
      }
      setModalOpen(false);
      onRefresh();
    } catch (err) {
      setError(err.response?.data?.message || t('err_save_service'));
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
                <th className="py-4 px-4">{t('th_outlet')}</th>
                <th className="py-4 px-4">{t('th_duration')}</th>
                <th className="py-4 px-4">{t('th_price')}</th>
                <th className="py-4 px-4">{t('th_description')}</th>
                <th className="py-4 px-4 text-right">{t('th_action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200 text-xs sm:text-sm text-slate-dark">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-grey-soft">{t('loading_services')}</td>
                </tr>
              ) : services.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-grey-soft">{t('empty_services')}</td>
                </tr>
              ) : (
                services.map((s) => {
                  const mappedOutlets = (outlets || []).filter(o => (s.outlet_ids || []).includes(o.id));
                  const canManage = !isBranchAdmin || (s.created_by_outlet_id && Number(s.created_by_outlet_id) === Number(userOutletId));

                  return (
                    <tr key={s.id} className="hover:bg-cream-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <img
                          src={s.image_url || 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=600&q=80'}
                          alt={s.name}
                          className="w-12 h-12 object-cover rounded-xl border border-grey-border"
                        />
                      </td>
                      <td className="py-3 px-4 font-bold text-emeraldsoft">
                        <div className="flex items-center gap-2">
                          <span>{s.name}</span>
                          {!canManage && (
                            <span 
                              className="px-2 py-0.5 rounded-full bg-cream-200 border border-cream-300 text-grey-soft text-[10px] font-bold flex items-center gap-1"
                              title={t('tooltip_master_service_locked')}
                            >
                              <Lock className="w-2.5 h-2.5 text-rosegold" />
                              <span>{t('badge_master_service')}</span>
                            </span>
                          )}
                        </div>
                      </td>
                      
                      {/* Outlets Badges */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {mappedOutlets.length > 0 ? (
                            mappedOutlets.map(o => (
                              <span key={o.id} className="px-2 py-0.5 rounded bg-cream-100 border border-cream-200 text-[11px] font-semibold text-slate-dark">
                                📍 {o.name.replace('Luxe Salon - ', '')}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-status-coral italic">{t('unassigned_outlet')}</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-medium">{s.duration_minutes} {t('minutes_suffix')}</td>
                      <td className="py-3 px-4 font-bold text-slate-dark">
                        Rp {Number(s.price).toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-4 text-grey-soft max-w-xs truncate">
                        {s.description || '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {canManage ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEdit(s)}
                              className="p-2 rounded-lg bg-cream-200 text-slate-dark hover:bg-rosegold hover:text-white transition-colors"
                              title={t('btn_edit_service')}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(s.id)}
                              className="p-2 rounded-lg bg-status-coral/10 text-status-coral hover:bg-status-coral hover:text-white transition-colors"
                              title={t('btn_delete_service')}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end" title={t('tooltip_master_service_locked')}>
                            <span className="px-2.5 py-1 rounded-lg bg-cream-100 text-grey-soft/80 border border-cream-200 text-xs font-semibold flex items-center gap-1.5 cursor-not-allowed">
                              <Lock className="w-3.5 h-3.5 text-grey-soft" />
                              <span>{t('badge_master_service')}</span>
                            </span>
                          </div>
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

      {/* Modal Add / Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-dark/70 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-modal overflow-hidden border border-cream-200 animate-in fade-in zoom-in duration-200 my-8">
            <div className="h-2 bg-emeraldsoft" />
            <div className="p-6 pb-4 border-b border-cream-200 flex items-center justify-between">
              <h3 className="font-serif text-2xl font-bold text-slate-dark">
                {editingService ? t('modal_edit_service_title') : t('modal_add_service_title')}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-full text-grey-soft hover:text-slate-dark">
                <X className="w-6 h-6" />
              </button>
            </div>

            {error && <div className="mx-6 mt-4 p-3 rounded-xl bg-status-coral/10 text-status-coral text-xs font-semibold">⚠️ {error}</div>}

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-dark mb-1">{t('field_service_name')}</label>
                <input
                  type="text"
                  placeholder={t('placeholder_service_name')}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-grey-border focus:border-emeraldsoft outline-none text-sm"
                  required
                />
              </div>

              {/* Outlet Assignment */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-dark mb-2 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emeraldsoft" />
                  <span>{t('field_service_outlets')}</span>
                </label>
                {isBranchAdmin ? (
                  <div className="p-3 rounded-xl border border-grey-border bg-cream-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-dark">📍 {userOutletName || (outlets.find(o => o.id === userOutletId)?.name) || 'Cabang Saya'}</span>
                      <span className="px-2 py-0.5 rounded-md bg-emeraldsoft/10 text-emeraldsoft text-[10px] font-bold">
                        {t('badge_locked_outlet') || 'Terkunci'}
                      </span>
                    </div>
                    <Lock className="w-4 h-4 text-grey-soft" />
                  </div>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto p-3 rounded-xl border border-grey-border bg-cream-50">
                    {(outlets || []).map((o) => {
                      const isChecked = (formData.outlet_ids || []).includes(o.id);
                      return (
                        <label
                          key={o.id}
                          className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors border ${
                            isChecked ? 'bg-white border-emeraldsoft shadow-xs font-semibold' : 'hover:bg-white/50 border-transparent text-grey-soft'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleOutlet(o.id)}
                            className="w-4 h-4 text-emeraldsoft rounded focus:ring-emeraldsoft accent-emeraldsoft"
                          />
                          <span className="text-xs text-slate-dark">📍 {o.name}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-dark mb-1">{t('field_service_duration')}</label>
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
                  <label className="block text-xs font-semibold uppercase text-slate-dark mb-1">{t('field_service_price')}</label>
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
                <label className="block text-xs font-semibold uppercase text-slate-dark mb-1">{t('field_service_image')}</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-grey-border focus:border-emeraldsoft outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-dark mb-1">{t('field_service_description')}</label>
                <textarea
                  rows="3"
                  placeholder={t('placeholder_service_description')}
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
                  {submitting ? t('btn_saving') : (editingService ? t('btn_update_service') : t('btn_save_service'))}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}

