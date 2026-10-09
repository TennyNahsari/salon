import React, { useState, useEffect } from 'react';
import { Building2, Plus, Edit, Trash2, Check, X, MapPin, Phone, Sparkles, Image, Link as LinkIcon, Upload } from 'lucide-react';
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

  // Photo state (File vs URL & Remove Flag)
  const [photoMode, setPhotoMode] = useState('file'); // 'file' | 'url'
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [removePhotoFlag, setRemovePhotoFlag] = useState(false);

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
    setPhotoMode('file');
    setImageFile(null);
    setImagePreview('');
    setRemovePhotoFlag(false);
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

    const isUploadedFile = outlet.image_url && outlet.image_url.startsWith('/uploads');
    setPhotoMode(isUploadedFile ? 'file' : 'url');
    setImageFile(null);
    setImagePreview(outlet.image_url || '');
    setRemovePhotoFlag(false);
    setMsg({ type: '', text: '' });
    setIsModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setRemovePhotoFlag(false);
    }
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setFormData(prev => ({ ...prev, image_url: url }));
    setImagePreview(url);
    setRemovePhotoFlag(false);
  };

  const handleRemovePhoto = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, image_url: '' }));
    setRemovePhotoFlag(true);
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

      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('address', formData.address);
      submitData.append('phone', formData.phone);
      submitData.append('is_active', formData.is_active);
      submitData.append('service_ids', JSON.stringify(formData.service_ids));
      submitData.append('remove_photo', removePhotoFlag ? 'true' : 'false');

      if (photoMode === 'file' && imageFile) {
        submitData.append('outlet_image', imageFile);
      } else {
        submitData.append('image_url', removePhotoFlag ? '' : (formData.image_url || ''));
      }

      let res;
      if (editingOutlet) {
        res = await updateOutlet(editingOutlet.id, submitData);
      } else {
        res = await createOutlet(submitData);
      }

      if (res.success) {
        setMsg({ type: 'success', text: res.message });
        setTimeout(() => {
          setIsModalOpen(false);
          fetchOutletsAndServices();
        }, 800);
      } else {
        setMsg({ type: 'error', text: res.message || t('err_save_outlet') });
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || t('err_save_outlet') });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`${t('confirm_delete_outlet')} "${name}"?`)) return;
    try {
      const res = await deleteOutlet(id);
      if (res.success) {
        fetchOutletsAndServices();
      }
    } catch (err) {
      alert(err.response?.data?.message || t('err_delete_outlet'));
    }
  };

  const defaultFallbackImg = 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=600&q=80';

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
          <p className="text-grey-soft text-sm">{t('loading_outlets')}</p>
        </div>
      ) : outlets.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-grey-border p-8">
          <p className="text-grey-soft">{t('empty_outlets')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {outlets.map((outlet) => (
            <div
              key={outlet.id}
              className="bg-white rounded-2xl border border-grey-border shadow-soft flex flex-col justify-between overflow-hidden hover:shadow-luxury transition-all group"
            >
              {/* Outlet Thumbnail Cover Image */}
              <div className="relative h-44 w-full bg-cream-100 overflow-hidden border-b border-grey-border">
                <img
                  src={outlet.image_url || defaultFallbackImg}
                  alt={outlet.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src = defaultFallbackImg;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-dark/70 via-transparent to-transparent" />
                
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-sm ${outlet.is_active ? 'bg-status-green/90 text-white' : 'bg-status-coral/90 text-white'}`}>
                    {outlet.is_active ? t('status_active_outlet') : t('status_inactive_outlet')}
                  </span>
                  <span className="text-[11px] font-mono text-white/90 bg-slate-dark/60 backdrop-blur-md px-2 py-0.5 rounded-md">ID: #{outlet.id}</span>
                </div>

                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="font-serif text-lg font-bold text-white drop-shadow-sm">{outlet.name}</h3>
                </div>
              </div>

              {/* Outlet Card Details */}
              <div className="p-5 space-y-4 flex-grow flex flex-col justify-between">
                <div className="space-y-3">
                  <div>
                    <div className="flex items-start gap-1.5 text-xs text-grey-soft">
                      <MapPin className="w-4 h-4 text-rosegold shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{outlet.address}</span>
                    </div>
                    {outlet.phone && (
                      <div className="flex items-center gap-1.5 text-xs text-grey-soft mt-1.5">
                        <Phone className="w-3.5 h-3.5 text-rosegold shrink-0" />
                        <span className="font-mono font-medium">{outlet.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-cream-200">
                    <span className="text-[11px] font-bold text-emeraldsoft block mb-1">
                      📋 {t('outlet_connected_services')}: ({outlet.service_ids?.length || 0} / {services.length})
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {services.filter(s => outlet.service_ids?.includes(s.id)).slice(0, 4).map(s => (
                        <span key={s.id} className="px-2 py-0.5 bg-cream-100 text-slate-dark text-[10px] font-medium rounded-md border border-cream-200">
                          {s.name}
                        </span>
                      ))}
                      {outlet.service_ids?.length > 4 && (
                        <span className="px-2 py-0.5 bg-cream-200 text-slate-dark text-[10px] font-bold rounded-md">
                          +{outlet.service_ids.length - 4} {t('outlet_others')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-cream-200 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEditModal(outlet)}
                    className="px-3 py-1.5 rounded-lg bg-cream-100 border border-grey-border text-slate-dark font-semibold text-xs hover:bg-emeraldsoft hover:text-white transition-all flex items-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>{t('btn_edit')}</span>
                  </button>
                  <button
                    onClick={() => handleDelete(outlet.id, outlet.name)}
                    className="px-3 py-1.5 rounded-lg bg-status-coral/10 border border-status-coral/30 text-status-coral font-semibold text-xs hover:bg-status-coral hover:text-white transition-all flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t('btn_delete')}</span>
                  </button>
                </div>
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
                <span>{editingOutlet ? t('modal_edit_outlet_title') : t('modal_add_outlet_title')}</span>
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
              
              {/* Name Field */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-dark mb-1">
                  {t('field_outlet_name')}
                </label>
                <input
                  type="text"
                  placeholder={t('placeholder_outlet_name')}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-grey-border focus:border-rosegold outline-none text-sm text-slate-dark"
                  required
                />
              </div>

              {/* Photo Field (Upload File OR URL Toggle) */}
              <div className="bg-cream-50 p-4 rounded-xl border border-grey-border space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-dark flex items-center gap-1.5">
                  <Image className="w-4 h-4 text-emeraldsoft" />
                  <span>{t('field_outlet_photo')}</span>
                </label>

                {/* Mode Selector Buttons */}
                <div className="grid grid-cols-2 gap-2 bg-white p-1 rounded-xl border border-grey-border">
                  <button
                    type="button"
                    onClick={() => setPhotoMode('file')}
                    className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      photoMode === 'file'
                        ? 'bg-emeraldsoft text-white shadow-xs'
                        : 'text-grey-soft hover:text-slate-dark'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{t('option_upload_file')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPhotoMode('url')}
                    className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      photoMode === 'url'
                        ? 'bg-emeraldsoft text-white shadow-xs'
                        : 'text-grey-soft hover:text-slate-dark'
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>{t('option_photo_url')}</span>
                  </button>
                </div>

                {/* Inputs based on Mode */}
                {photoMode === 'file' ? (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="block w-full text-xs text-slate-dark file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emeraldsoft file:text-white hover:file:bg-emeraldsoft-dark cursor-pointer"
                    />
                    {imageFile && (
                      <p className="text-[11px] text-emeraldsoft font-semibold mt-1">
                        ✓ File terpilih: {imageFile.name}
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      placeholder={t('placeholder_photo_url')}
                      value={formData.image_url}
                      onChange={handleUrlChange}
                      className="w-full px-4 py-2 rounded-xl border border-grey-border focus:border-rosegold outline-none text-xs text-slate-dark bg-white"
                    />
                  </div>
                )}

                {/* Live Image Preview Box with Remove Photo Button */}
                {imagePreview ? (
                  <div className="pt-2 border-t border-cream-200">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] text-grey-soft font-semibold">
                        {t('outlet_photo_preview')}
                      </span>
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="px-2.5 py-1 rounded-lg bg-status-coral/10 hover:bg-status-coral text-status-coral hover:text-white border border-status-coral/30 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                        title="Hapus foto dari outlet ini"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>{t('btn_remove_photo')}</span>
                      </button>
                    </div>

                    <div className="relative h-36 w-full rounded-xl overflow-hidden border border-grey-border bg-white shadow-xs">
                      <img
                        src={imagePreview}
                        alt="Preview Outlet"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = defaultFallbackImg;
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-cream-200 text-center py-3 bg-white/60 rounded-xl border border-dashed border-grey-border">
                    <p className="text-xs text-grey-soft italic">Belum ada foto outlet terpasang.</p>
                  </div>
                )}

              </div>

              {/* Address Field */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-dark mb-1">
                  {t('field_outlet_address')}
                </label>
                <textarea
                  rows={2}
                  placeholder={t('placeholder_outlet_address')}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-grey-border focus:border-rosegold outline-none text-sm text-slate-dark resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-dark mb-1">
                    {t('field_outlet_phone')}
                  </label>
                  <input
                    type="text"
                    placeholder={t('placeholder_outlet_phone')}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-grey-border focus:border-rosegold outline-none text-sm text-slate-dark"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-dark mb-1">
                    {t('field_outlet_status')}
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
                      {t('outlet_active_label')}
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
                  {t('btn_cancel')}
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-emeraldsoft text-white font-bold text-sm hover:bg-emeraldsoft-dark disabled:opacity-50"
                >
                  {saving ? t('btn_saving') : t('btn_save_outlet')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
