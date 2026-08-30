import React, { useState, useEffect } from 'react';
import { CreditCard, QrCode, Phone, Clock, Save, CheckCircle2, Upload } from 'lucide-react';
import { getConfigs, updateConfigs } from '../../services/api';

export default function PaymentConfig() {
  const [formData, setFormData] = useState({
    payment_bank_name: 'Bank Central Asia (BCA) a/n Luxe Salon',
    payment_account_number: '8830192847',
    whatsapp_number: '6281234567890',
    payment_deadline_offset_minutes: 60,
    social_instagram: 'https://instagram.com',
    social_twitter: 'https://twitter.com',
    social_youtube: 'https://youtube.com',
    social_facebook: 'https://facebook.com',
    social_linkedin: 'https://linkedin.com',
    social_threads: 'https://threads.net'
  });

  const [qrisFile, setQrisFile] = useState(null);
  const [qrisPreview, setQrisPreview] = useState('/uploads/qris-default.png');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchConfigData();
  }, []);

  const fetchConfigData = async () => {
    try {
      setLoading(true);
      const res = await getConfigs();
      if (res.success && res.configs) {
        setFormData({
          payment_bank_name: res.configs.payment_bank_name || 'Bank BCA a/n Luxe Salon',
          payment_account_number: res.configs.payment_account_number || '8830192847',
          whatsapp_number: res.configs.whatsapp_number || '6281234567890',
          payment_deadline_offset_minutes: res.configs.payment_deadline_offset_minutes || 60,
          social_instagram: res.configs.social_instagram || 'https://instagram.com',
          social_twitter: res.configs.social_twitter || 'https://twitter.com',
          social_youtube: res.configs.social_youtube || 'https://youtube.com',
          social_facebook: res.configs.social_facebook || 'https://facebook.com',
          social_linkedin: res.configs.social_linkedin || 'https://linkedin.com',
          social_threads: res.configs.social_threads || 'https://threads.net'
        });
        if (res.configs.payment_qris_image) {
          setQrisPreview(res.configs.payment_qris_image);
        }
      }
    } catch (err) {
      console.error('Error fetching configs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQrisChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setQrisFile(file);
      setQrisPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      setSaving(true);
      const submitData = new FormData();
      submitData.append('payment_bank_name', formData.payment_bank_name);
      submitData.append('payment_account_number', formData.payment_account_number);
      submitData.append('whatsapp_number', formData.whatsapp_number);
      submitData.append('payment_deadline_offset_minutes', formData.payment_deadline_offset_minutes);
      submitData.append('social_instagram', formData.social_instagram);
      submitData.append('social_twitter', formData.social_twitter);
      submitData.append('social_youtube', formData.social_youtube);
      submitData.append('social_facebook', formData.social_facebook);
      submitData.append('social_linkedin', formData.social_linkedin);
      submitData.append('social_threads', formData.social_threads);

      if (qrisFile) {
        submitData.append('qris_image', qrisFile);
      }

      const res = await updateConfigs(submitData);
      if (res.success) {
        setMessage('Semua konfigurasi berhasil diperbarui!');
        fetchConfigData();
      } else {
        setError(res.message || 'Gagal menyimpan konfigurasi.');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat memperbarui konfigurasi.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-grey-soft">Memuat konfigurasi...</div>;
  }

  return (
    <div className="space-y-8 max-w-4xl">
      
      {/* Header */}
      <div>
        <h2 className="font-serif text-3xl font-bold text-slate-dark">Konfigurasi Pembayaran &amp; Media Sosial</h2>
        <p className="text-grey-soft text-sm">Atur rekening bank, barcode QRIS, kontak WA admin, batas bayar, dan link media sosial footer.</p>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-status-green/10 border border-status-green/30 text-status-green text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-status-coral/10 border border-status-coral/30 text-status-coral text-sm font-semibold">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Card 1: Rekening Bank */}
        <div className="bg-white p-6 rounded-2xl border border-grey-border shadow-soft space-y-4">
          <div className="flex items-center gap-2 border-b border-cream-200 pb-3">
            <CreditCard className="w-5 h-5 text-emeraldsoft" />
            <h3 className="font-serif text-xl font-bold text-slate-dark">1. Rekening Bank Transfer</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-dark mb-1">
                Nama Bank &amp; Atas Nama *
              </label>
              <input
                type="text"
                value={formData.payment_bank_name}
                onChange={(e) => setFormData({ ...formData, payment_bank_name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-grey-border focus:border-emeraldsoft outline-none text-sm text-slate-dark"
                placeholder="Contoh: Bank BCA a/n Luxe Salon"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-dark mb-1">
                Nomor Rekening *
              </label>
              <input
                type="text"
                value={formData.payment_account_number}
                onChange={(e) => setFormData({ ...formData, payment_account_number: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-grey-border focus:border-emeraldsoft outline-none text-sm text-slate-dark font-mono font-bold"
                placeholder="Contoh: 8830192847"
                required
              />
            </div>
          </div>
        </div>

        {/* Card 2: QRIS Upload */}
        <div className="bg-white p-6 rounded-2xl border border-grey-border shadow-soft space-y-4">
          <div className="flex items-center gap-2 border-b border-cream-200 pb-3">
            <QrCode className="w-5 h-5 text-emeraldsoft" />
            <h3 className="font-serif text-xl font-bold text-slate-dark">2. Barcode QRIS Pembayaran</h3>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="p-3 bg-cream-50 border border-grey-border rounded-xl text-center">
              <span className="text-xs text-grey-soft block mb-2 font-medium">Preview QRIS:</span>
              <img
                src={qrisPreview}
                alt="QRIS Preview"
                className="w-36 h-44 object-contain rounded-lg border border-cream-200 bg-white"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase text-slate-dark">
                Upload Gambar QRIS Baru (PNG/JPG):
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleQrisChange}
                className="block w-full text-xs text-slate-dark file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emeraldsoft file:text-white hover:file:bg-emeraldsoft-dark cursor-pointer"
              />
              <p className="text-xs text-grey-soft">
                Gambar QRIS ini akan otomatis ditampilkan pada modal konfirmasi booking pelanggan.
              </p>
            </div>
          </div>
        </div>

        {/* Card 3: WhatsApp Admin & Deadline Offset */}
        <div className="bg-white p-6 rounded-2xl border border-grey-border shadow-soft space-y-4">
          <div className="flex items-center gap-2 border-b border-cream-200 pb-3">
            <Phone className="w-5 h-5 text-emeraldsoft" />
            <h3 className="font-serif text-xl font-bold text-slate-dark">3. WhatsApp &amp; Batas Pembayaran</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-dark mb-1">
                Nomor WhatsApp Admin (Format 62...) *
              </label>
              <input
                type="text"
                value={formData.whatsapp_number}
                onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-grey-border focus:border-emeraldsoft outline-none text-sm text-slate-dark"
                placeholder="Contoh: 6281234567890"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-dark mb-1">
                Offset Batas Bayar (Dalam Menit) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="15"
                  max="1440"
                  value={formData.payment_deadline_offset_minutes}
                  onChange={(e) => setFormData({ ...formData, payment_deadline_offset_minutes: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-grey-border focus:border-emeraldsoft outline-none text-sm font-bold text-slate-dark"
                  required
                />
                <span className="absolute right-4 top-2.5 text-xs text-grey-soft font-semibold">Menit</span>
              </div>
              <p className="text-[11px] text-grey-soft mt-1">
                Contoh: Booking jam 12:00 + offset 60 menit &rarr; Batas bayar jam 13:00.
              </p>
            </div>
          </div>
        </div>

        {/* Card 4: Media Sosial (Ikuti Kami) */}
        <div className="bg-white p-6 rounded-2xl border border-grey-border shadow-soft space-y-4">
          <div className="flex items-center gap-2 border-b border-cream-200 pb-3">
            <span className="text-xl">🌐</span>
            <h3 className="font-serif text-xl font-bold text-slate-dark">4. Tautan Media Sosial Footer (Ikuti Kami)</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-dark mb-1">
                URL Instagram
              </label>
              <input
                type="url"
                value={formData.social_instagram}
                onChange={(e) => setFormData({ ...formData, social_instagram: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-grey-border focus:border-emeraldsoft outline-none text-sm text-slate-dark"
                placeholder="https://instagram.com/luxesalon"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-dark mb-1">
                URL Twitter / X
              </label>
              <input
                type="url"
                value={formData.social_twitter}
                onChange={(e) => setFormData({ ...formData, social_twitter: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-grey-border focus:border-emeraldsoft outline-none text-sm text-slate-dark"
                placeholder="https://twitter.com/luxesalon"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-dark mb-1">
                URL YouTube
              </label>
              <input
                type="url"
                value={formData.social_youtube}
                onChange={(e) => setFormData({ ...formData, social_youtube: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-grey-border focus:border-emeraldsoft outline-none text-sm text-slate-dark"
                placeholder="https://youtube.com/@luxesalon"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-dark mb-1">
                URL Facebook
              </label>
              <input
                type="url"
                value={formData.social_facebook}
                onChange={(e) => setFormData({ ...formData, social_facebook: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-grey-border focus:border-emeraldsoft outline-none text-sm text-slate-dark"
                placeholder="https://facebook.com/luxesalon"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-dark mb-1">
                URL LinkedIn
              </label>
              <input
                type="url"
                value={formData.social_linkedin}
                onChange={(e) => setFormData({ ...formData, social_linkedin: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-grey-border focus:border-emeraldsoft outline-none text-sm text-slate-dark"
                placeholder="https://linkedin.com/company/luxesalon"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-dark mb-1">
                URL Threads
              </label>
              <input
                type="url"
                value={formData.social_threads}
                onChange={(e) => setFormData({ ...formData, social_threads: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-grey-border focus:border-emeraldsoft outline-none text-sm text-slate-dark"
                placeholder="https://threads.net/@luxesalon"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emeraldsoft text-white font-bold text-sm shadow-luxury hover:bg-emeraldsoft-dark transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save className="w-5 h-5 text-rosegold" />
            <span>{saving ? 'Menyimpan...' : 'Simpan Semua Konfigurasi'}</span>
          </button>
        </div>

      </form>

    </div>
  );
}
