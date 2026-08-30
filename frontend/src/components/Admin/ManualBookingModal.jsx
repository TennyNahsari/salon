import React, { useState } from 'react';
import { X, Plus, Calendar, User, Phone, Mail, Sparkles } from 'lucide-react';
import { createManualBooking } from '../../services/api';

export default function ManualBookingModal({ isOpen, onClose, services, onSaved }) {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    service_id: services && services.length > 0 ? services[0].id : '',
    staff_name: 'Bebas / Any Staff',
    booking_datetime: new Date().toISOString().slice(0, 16),
    status: 'Confirmed',
    notes: 'Booking Manual (Resepsionis)'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.customer_name || !formData.customer_phone || !formData.service_id) {
      setError('Nama Customer, Phone, dan Service wajib diisi!');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        service_id: parseInt(formData.service_id)
      };

      const res = await createManualBooking(payload);
      if (res.success) {
        onSaved();
        onClose();
      } else {
        setError(res.message || 'Gagal menyimpan.');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat menyimpan booking manual.');
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
            <h3 className="font-serif text-2xl font-bold text-slate-dark">+ Tambah Booking Manual</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-grey-soft hover:text-slate-dark">
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && <div className="mx-6 mt-4 p-3 rounded-xl bg-status-coral/10 text-status-coral text-xs font-semibold">⚠️ {error}</div>}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-dark mb-1">Nama Customer *</label>
            <input
              type="text"
              placeholder="Contoh: Budi Santoso"
              value={formData.customer_name}
              onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-grey-border focus:border-emeraldsoft outline-none text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-dark mb-1">No. HP / WA *</label>
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="08123456789"
                value={formData.customer_phone}
                onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value.replace(/\D/g, '') })}
                className="w-full px-4 py-2 rounded-xl border border-grey-border focus:border-emeraldsoft outline-none text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-dark mb-1">Email</label>
              <input
                type="email"
                placeholder="email@domain.com"
                value={formData.customer_email}
                onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-grey-border focus:border-emeraldsoft outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-dark mb-1">Pilih Layanan *</label>
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
              <label className="block text-xs font-semibold uppercase text-slate-dark mb-1">Tanggal &amp; Waktu *</label>
              <input
                type="datetime-local"
                value={formData.booking_datetime}
                onChange={(e) => setFormData({ ...formData, booking_datetime: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-grey-border focus:border-emeraldsoft outline-none text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-dark mb-1">Status Awal *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-grey-border focus:border-emeraldsoft outline-none text-sm bg-cream-50 font-medium"
              >
                <option value="Pending">🟡 Pending</option>
                <option value="Confirmed">🟢 Confirmed (Lunas)</option>
                <option value="Processed">🔵 Processed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-dark mb-1">Catatan Tambahan</label>
            <input
              type="text"
              placeholder="Contoh: Pembayaran Cash di Kasir"
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
              {loading ? 'Menyimpan...' : 'Simpan Booking Manual'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
