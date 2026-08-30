import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Phone, Mail, Sparkles, CheckCircle2 } from 'lucide-react';
import { createBooking } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function BookingModal({ isOpen, onClose, selectedService, services, onSuccessBooking }) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    service_id: '',
    staff_name: 'Bebas / Any Staff',
    date: new Date().toISOString().split('T')[0],
    time: '12:00',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (selectedService) {
      setFormData(prev => ({ ...prev, service_id: selectedService.id }));
    } else if (services && services.length > 0 && !formData.service_id) {
      setFormData(prev => ({ ...prev, service_id: services[0].id }));
    }
  }, [selectedService, services]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.service_id) {
      setError('Pilih layanan terlebih dahulu.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const combinedDatetime = `${formData.date}T${formData.time}:00`;
      
      const payload = {
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        customer_email: formData.customer_email,
        service_id: Number(formData.service_id),
        staff_name: formData.staff_name,
        booking_datetime: combinedDatetime,
        notes: formData.notes
      };

      const res = await createBooking(payload);
      if (res.success) {
        onSuccessBooking(res.booking, res.message, res.is_merged);
        onClose();
      } else {
        setError(res.message || 'Gagal membuat booking.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan saat membuat booking.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-dark/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-luxury overflow-hidden border border-grey-border animate-in fade-in zoom-in-95 duration-200 my-auto">
        
        {/* Header */}
        <div className="bg-emeraldsoft p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-rosegold" />
            <h3 className="font-serif text-xl font-bold text-cream">
              {t('modal_booking_title')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-cream-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-status-coral/10 border border-status-coral/30 text-status-coral text-xs font-semibold">
            ⚠️ {error}
          </div>
        )}

        {/* Info Banner for Multi-Service Merging */}
        <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-emeraldsoft/10 border border-emeraldsoft/30 text-emeraldsoft text-xs leading-relaxed font-medium flex items-start gap-2.5">
          <span className="text-base">💡</span>
          <span>{t('modal_booking_info')}</span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Service Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-dark mb-1">
              {t('field_service')}
            </label>
            <select
              value={formData.service_id}
              onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-grey-border focus:border-rosegold focus:ring-1 focus:ring-rosegold outline-none text-slate-dark font-medium bg-cream-50"
              required
            >
              <option value="" disabled>-- {t('field_service')} --</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.duration_minutes} {t('mins')}) - Rp {Number(s.price).toLocaleString('id-ID')}
                </option>
              ))}
            </select>
          </div>

          {/* Customer Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-dark mb-1">
              {t('field_name')}
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 w-4 h-4 text-grey-soft" />
              <input
                type="text"
                placeholder="Anita Permata"
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-grey-border focus:border-rosegold focus:ring-1 focus:ring-rosegold outline-none text-sm text-slate-dark"
                required
              />
            </div>
          </div>

          {/* Phone & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-dark mb-1">
                {t('field_phone')}
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-grey-soft" />
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="081234567890"
                  value={formData.customer_phone}
                  onChange={(e) => {
                    const onlyNums = e.target.value.replace(/\D/g, '');
                    setFormData({ ...formData, customer_phone: onlyNums });
                  }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-grey-border focus:border-rosegold focus:ring-1 focus:ring-rosegold outline-none text-sm text-slate-dark"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-dark mb-1">
                {t('field_email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-grey-soft" />
                <input
                  type="email"
                  placeholder="nama@email.com"
                  value={formData.customer_email}
                  onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-grey-border focus:border-rosegold focus:ring-1 focus:ring-rosegold outline-none text-sm text-slate-dark"
                  required
                />
              </div>
            </div>
          </div>

          {/* Date & Time Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-dark mb-1">
                {t('field_date')}
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-grey-border focus:border-rosegold outline-none text-sm text-slate-dark"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-dark mb-1">
                {t('field_time')}
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-grey-border focus:border-rosegold outline-none text-sm text-slate-dark"
                required
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-emeraldsoft text-white font-bold text-base shadow-luxury hover:bg-emeraldsoft-dark transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>{t('btn_submitting')}</span>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 text-rosegold" />
                  <span>{t('btn_submit_booking')}</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
