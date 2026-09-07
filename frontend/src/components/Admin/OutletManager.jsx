import React, { useState, useEffect } from 'react';
import { Building2, Plus, Edit, Trash2, Check, X, MapPin, Phone, Sparkles } from 'lucide-react';
import { getOutlets, createOutlet, updateOutlet, deleteOutlet, getServices } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

export default function OutletManager() {
  const { t } = useLanguage();
  const [outlets, setOutlets] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOutlet, setEditingOutlet] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    image_url: '',
    is_active: true,
    service_ids: []
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchOutletsAndServices();
  }, []);

  const fetchOutletsAndServices = async () => {
    try {
      setLoading(true);
      const [outletsRes, servicesRes] = await Promise.all([
        getOutlets(false), // All outlets including inactive
        getServices()
      ]);

      if (outletsRes.success) setOutlets(outletsRes.outlets);
      if (servicesRes.success) setServices(servicesRes.services);
    } catch (err) {
      console.error('Error fetching outlets manager data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingOutlet(null);
    setFormData({
      name: '',
      address: '',
      phone: '',
      image_url: '',
      is_active: true,
      service_ids: services.map(s => s.id) // Default all services checked
    });
    setMsg({ type: '', text: '' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (outlet) => {
    setEditingOutlet(outlet);
    setFormData({
      name: outlet.name,
      address: outlet.address,
      phone: outlet.phone || '',
      image_url: outlet.image_url || '',
      is_active: outlet.is_active,
      service_ids: outlet.service_ids || []
    });
    setMsg({ type: '', text: '' });
    setIsModalOpen(true);
  };

  const handleToggleService = (serviceId) => {
    setFormData(prev => {
      const exists = prev.service_ids.includes(serviceId);
      if (exists) {
        return { ...prev, service_ids: prev.service_ids.filter(id => id !== serviceId) };
      } else {
        return { ...prev, service_ids: [...prev.service_ids, serviceId] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMsg({ type: '', text: '' });

      let res;
      if (editingOutlet) {
        res = await updateOutlet(editingOutlet.id, formData);
      } else {
        res = await createOutlet(formData);
      }

      if (res.success) {
        setMsg({ type: 'success', text: res.message });
        setTimeout(() => {
          setIsModalOpen(false);
          fetchOutletsAndServices();
        }, 800);
      } else {
        setMsg({ type: 'error', text: res.message || 'Gagal menyimpan data outlet.' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Terjadi kesalahan.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus outlet "${name}"?`)) return;
    try {
      const res = await deleteOutlet(id);
      if (res.success) {
        fetchOutletsAndServices();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus outlet.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-grey-border shadow-soft">
        <div>
          <h2 className="font-serif text-2xl font-bold text-slate-dark flex items-center gap-2">
            <Building2 className="w-6 h-6 text-emeraldsoft" />
            <span>{t('admin_outlet_title')}</span>
          </h2>
          <p className="text-grey-soft text-xs sm:text-sm mt-1">
            {t('admin_outlet_subtitle')}
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-5 py-3 rounded-xl bg-emeraldsoft text-white font-bold text-sm hover:bg-emeraldsoft-dark transition-all flex items-center justify-center gap-2 shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4 text-rosegold" />
          <span>{t('btn_add_outlet')}</span>
        </button>
      </div>

      {/* Outlets List Table / Cards */}
      {loading ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-grey-border">
          <p className="text-grey-soft text-sm">Memuat data outlet cabang...</p>
        </div>
      ) : outlets.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-grey-border p-8">
          <p className="text-grey-soft">Belum ada outlet cabang yang terdaftar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {outlets.map((outlet) => (
            <div
              key={outlet.id}
              className="bg-white rounded-2xl border border-grey-border shadow-soft p-5 flex flex-col justify-between space-y-4 hover:shadow-luxury transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${outlet.is_active ? 'bg-status-green/20 text-status-green border border-status-green/30' : 'bg-status-coral/20 text-status-coral border border-status-coral/30'}`}>
                    {outlet.is_active ? '🟢 Aktif' : '🔴 Non-Aktif'}
                  </span>
                  <span className="text-xs font-mono text-grey-soft">ID: #{outlet.id}</span>
                </div>

                <div>
                  <h3 className="font-serif text-lg font-bold text-slate-dark">{outlet.name}</h3>
                  <div className="flex items-start gap-1.5 text-xs text-grey-soft mt-1">
                    <MapPin className="w-4 h-4 text-rosegold shrink-0 mt-0.5" />
                    <span>{outlet.address}</span>
                  </div>
                  {outlet.phone && (
                    <div className="flex items-center gap-1.5 text-xs text-grey-soft mt-1">
                      <Phone className="w-3.5 h-3.5 text-rosegold shrink-0" />
                      <span>{outlet.phone}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-cream-200">
                  <span className="text-[11px] font-bold text-emeraldsoft block mb-1">
                    📋 Layanan Terhubung: ({outlet.service_ids?.length || 0} / {services.length})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {services.filter(s => outlet.service_ids?.includes(s.id)).slice(0, 4).map(s => (
                      <span key={s.id} className="px-2 py-0.5 bg-cream-100 text-slate-dark text-[10px] font-medium rounded-md border border-cream-200">
                        {s.name}
                      </span>
                    ))}
                    {outlet.service_ids?.length > 4 && (
                      <span className="px-2 py-0.5 bg-cream-200 text-slate-dark text-[10px] font-bold rounded-md">
                        +{outlet.service_ids.length - 4} lainnya
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-cream-200 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEditModal(outlet)}
                  className="px-3 py-1.5 rounded-lg bg-cream-100 border border-grey-border text-slate-dark font-semibold text-xs hover:bg-emeraldsoft hover:text-white transition-all flex items-center gap-1"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(outlet.id, outlet.name)}
                  className="px-3 py-1.5 rounded-lg bg-status-coral/10 border border-status-coral/30 text-status-coral font-semibold text-xs hover:bg-status-coral hover:text-white transition-all flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-dark/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-luxury overflow-hidden border border-grey-border animate-in fade-in zoom-in-95 duration-200 my-auto">
            
            <div className="bg-emeraldsoft p-6 text-white flex items-center justify-between">
              <h3 className="font-serif text-xl font-bold text-cream flex items-center gap-2">
                <Building2 className="w-5 h-5 text-rosegold" />
                <span>{editingOutlet ? 'Edit Outlet Cabang' : 'Tambah Outlet Cabang Baru'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
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
              
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-dark mb-1">
                  Nama Outlet *
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Luxe Salon - Dharmawangsa"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-grey-border focus:border-rosegold outline-none text-sm text-slate-dark"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-dark mb-1">
                  Alamat Lengkap *
                </label>
                <textarea
                  rows={2}
                  placeholder="Jl. Dharmawangsa Raya No. 12, Jakarta Selatan"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-grey-border focus:border-rosegold outline-none text-sm text-slate-dark resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-dark mb-1">
                    No. Telepon / HP
                  </label>
                  <input
                    type="text"
                    placeholder="081234567890"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-grey-border focus:border-rosegold outline-none text-sm text-slate-dark"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-dark mb-1">
                    Status Operasional
                  </label>
                  <div className="flex items-center gap-3 pt-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-5 h-5 accent-emeraldsoft rounded cursor-pointer"
                    />
                    <label htmlFor="is_active" className="text-sm font-semibold text-slate-dark cursor-pointer">
                      Outlet Aktif & Beroperasi
                    </label>
                  </div>
                </div>
              </div>

              {/* Service Mapping Checklist */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-dark mb-2">
                  {t('outlet_services_mapping')}
                </label>
                <div className="space-y-2 bg-cream-50 p-4 rounded-xl border border-grey-border max-h-48 overflow-y-auto">
                  {services.map((s) => {
                    const isChecked = formData.service_ids.includes(s.id);
                    return (
                      <label
                        key={s.id}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-white cursor-pointer transition-colors text-xs font-medium"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleService(s.id)}
                            className="w-4 h-4 accent-emeraldsoft rounded"
                          />
                          <span className="text-slate-dark font-semibold">{s.name}</span>
                        </div>
                        <span className="text-grey-soft font-mono">Rp {Number(s.price).toLocaleString('id-ID')}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-grey-border text-slate-dark font-bold text-sm hover:bg-cream-100"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-emeraldsoft text-white font-bold text-sm hover:bg-emeraldsoft-dark disabled:opacity-50"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Outlet'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
