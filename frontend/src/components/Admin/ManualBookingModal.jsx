import React, { useState } from 'react';
import { X, Plus, Calendar, User, Phone, Mail, Sparkles } from 'lucide-react';
import { createManualBooking } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

export default function ManualBookingModal({ isOpen, onClose, services, outlets, userOutletId, onSaved }) {
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    outlet_id: userOutletId ? String(userOutletId) : (outlets && outlets.length > 0 ? String(outlets[0].id) : ''),
    service_id: services && services.length > 0 ? services[0].id : '',
    staff_name: 'Bebas / Any Staff',
    booking_datetime: new Date().toISOString().slice(0, 16),
    status: 'Confirmed',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.customer_name || !formData.customer_phone || !formData.service_id) {
      setError(t('err_manual_required'));
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        notes: formData.notes || t('default_manual_notes'),
        outlet_id: formData.outlet_id ? parseInt(formData.outlet_id) : null,
        service_id: parseInt(formData.service_id)
      };

      const res = await createManualBooking(payload);
      if (res.success) {
        onSaved();
        onClose();
      } else {
        setError(res.message || t('err_save_manual'));
      }
    } catch (err) {
      setError(t('err_save_manual'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-dark/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-modal overflow-hidden border border-cream-200 animate-in fade-in zoom-in duration-200 my-8">
        
        <div className="h-2 bg-emeraldsoft" />
        <div className="p-6 pb-4 border-b border-cream-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-emeraldsoft" />
            <h3 className="font-serif text-2xl font-bold text-slate-dark">{t('modal_add_manual_title')}</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-grey-soft hover:text-slate-dark">
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && <div className="mx-6 mt-4 p-3 rounded-xl bg-status-coral/10 text-status-coral text-xs font-semibold">⚠️ {error}</div>}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {outlets && outlets.length > 0 && (
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-dark mb-1">{t('field_outlet')} *</label>
              <select
                value={formData.outlet_id}
                disabled={Boolean(userOutletId)}
                onChange={(e) => setFormData({ ...formData, outlet_id: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-xl border border-grey-border focus:border-emeraldsoft outline-none text-sm bg-cream-50 font-medium ${userOutletId ? 'opacity-80 cursor-not-allowed bg-cream-100' : ''}`}
                required
              >
                {outlets.map((o) => (
                  <option key={o.id} value={o.id}>
                    📍 {o.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-dark mb-1">{t('field_customer_name')}</label>
            <input
              type="text"
              placeholder={t('placeholder_customer_name')}
              value={formData.customer_name}
              onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-grey-border focus:border-emeraldsoft outline-none text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-dark mb-1">{t('field_customer_phone')}</label>
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder={t('placeholder_customer_phone')}
                value={formData.customer_phone}
                onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value.replace(/\D/g, '') })}
                className="w-full px-4 py-2 rounded-xl border border-grey-border focus:border-emeraldsoft outline-none text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-dark mb-1">{t('field_customer_email')}</label>
              <input
                type="email"
                placeholder={t('placeholder_customer_email')}
                value={formData.customer_email}
                onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-grey-border focus:border-emeraldsoft outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-dark mb-1">{t('field_select_service')}</label>
            <select
              value={formData.service_id}
              onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-grey-border focus:border-emeraldsoft outline-none text-sm bg-cream-50"
              required
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} - Rp {Number(s.price).toLocaleString('id-ID')}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-dark mb-1">{t('field_datetime')}</label>
              <input
                type="datetime-local"
                value={formData.booking_datetime}
                onChange={(e) => setFormData({ ...formData, booking_datetime: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-grey-border focus:border-emeraldsoft outline-none text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-dark mb-1">{t('field_initial_status')}</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-grey-border focus:border-emeraldsoft outline-none text-sm bg-cream-50 font-medium"
              >
                <option value="Pending">{t('status_pending')}</option>
                <option value="Confirmed">{t('status_confirmed')} ({t('status_paid')})</option>
                <option value="Processed">{t('status_processed')}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-dark mb-1">{t('field_additional_notes')}</label>
            <input
              type="text"
              placeholder={t('placeholder_additional_notes')}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-grey-border focus:border-emeraldsoft outline-none text-sm"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emeraldsoft text-white font-bold text-sm hover:bg-emeraldsoft-dark transition-all disabled:opacity-50"
            >
              {loading ? t('btn_saving') : t('btn_save_manual_booking')}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
