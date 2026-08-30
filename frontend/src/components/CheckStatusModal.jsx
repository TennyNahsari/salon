import React, { useState } from 'react';
import { X, Search, Clock, CreditCard, Upload, CheckCircle2, AlertCircle, FileText, Image as ImageIcon, MessageCircle } from 'lucide-react';
import { checkBookingStatus, uploadPaymentProof } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function CheckStatusModal({ isOpen, onClose }) {
  const { t } = useLanguage();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [configs, setConfigs] = useState(null);
  const [error, setError] = useState('');

  // Upload proof state per booking
  const [cardFiles, setCardFiles] = useState({});
  const [cardPreviews, setCardPreviews] = useState({});
  const [uploadingBookingId, setUploadingBookingId] = useState(null);
  const [uploadMsg, setUploadMsg] = useState({});

  if (!isOpen) return null;

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!phone && !code) {
      setError('Masukkan No. HP atau Kode Booking!');
      return;
    }
    setError('');
    setLoading(true);
    setSearched(true);

    try {
      const res = await checkBookingStatus(phone, code);
      if (res.success) {
        setBookings(res.bookings);
        setConfigs(res.payment_configs);
      } else {
        setError(res.message || 'Gagal mengecek status.');
      }
    } catch (err) {
      setError('Gagal mengecek status booking.');
    } finally {
      setLoading(false);
    }
  };

  const handleCardFileChange = (bookingId, filesList) => {
    if (filesList && filesList.length > 0) {
      const filesArray = Array.from(filesList);
      setCardFiles(prev => ({ ...prev, [bookingId]: filesArray }));
      setCardPreviews(prev => ({
        ...prev,
        [bookingId]: filesArray.map(f => URL.createObjectURL(f))
      }));
    }
  };

  const handleUploadProof = async (bookingCode, bookingId) => {
    const targetFiles = cardFiles[bookingId];
    if (!targetFiles || targetFiles.length === 0) return;

    try {
      setUploadingBookingId(bookingId);
      setUploadMsg(prev => ({ ...prev, [bookingId]: '' }));
      const formData = new FormData();
      targetFiles.forEach(file => {
        formData.append('payment_proof', file);
      });
      formData.append('booking_code', bookingCode);

      const res = await uploadPaymentProof(formData);
      if (res.success) {
        setUploadMsg(prev => ({ ...prev, [bookingId]: '✅ Bukti transfer berhasil diunggah! Menunggu konfirmasi admin.' }));
        handleSearch({ preventDefault: () => {} });
      } else {
        setUploadMsg(prev => ({ ...prev, [bookingId]: res.message || 'Gagal mengunggah bukti.' }));
      }
    } catch (err) {
      setUploadMsg(prev => ({ ...prev, [bookingId]: 'Gagal mengunggah bukti pembayaran.' }));
    } finally {
      setUploadingBookingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-status-gold/20 text-status-gold border border-status-gold/40 flex items-center gap-1">
            🟡 Pending (Menunggu Bayar)
          </span>
        );
      case 'Confirmed':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-status-green/20 text-status-green border border-status-green/40 flex items-center gap-1">
            🟢 Confirmed (Dikonfirmasi)
          </span>
        );
      case 'Processed':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-status-blue/20 text-status-blue border border-status-blue/40 flex items-center gap-1">
            🔵 Processed (Sedang Berlangsung)
          </span>
        );
      case 'Completed':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-status-green/20 text-status-green border border-status-green/40 flex items-center gap-1">
            🟢 Completed (Selesai)
          </span>
        );
      case 'Cancelled':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-status-coral/20 text-status-coral border border-status-coral/40 flex items-center gap-1">
            🔴 Cancelled (Dibatalkan)
          </span>
        );
      default:
        return <span className="px-2 py-1 rounded bg-grey-border text-xs">{status}</span>;
    }
  };

  const formatDateTime = (dateStr) => {
    try {
      return format(new Date(dateStr), "dd MMMM yyyy, HH:mm 'WIB'", { locale: id });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-dark/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-modal overflow-hidden border border-cream-200 animate-in fade-in zoom-in duration-200 my-8">
        
        {/* Header Accent */}
        <div className="h-2 bg-emeraldsoft" />

        <div className="p-6 pb-4 border-b border-cream-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-emeraldsoft" />
            <h3 className="font-serif text-2xl font-bold text-slate-dark">{t('modal_check_title')}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-grey-soft hover:text-slate-dark hover:bg-cream-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="p-6 pb-4 bg-cream-50 border-b border-cream-200 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-dark mb-1">
                {t('field_check_phone')} *
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="081234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-2.5 rounded-xl border border-grey-border focus:border-rosegold outline-none text-sm text-slate-dark bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-dark mb-1">
                {t('field_check_code')}
              </label>
              <input
                type="text"
                placeholder="SLN-ABC12"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-grey-border focus:border-rosegold outline-none text-sm text-slate-dark bg-white font-mono uppercase"
              />
            </div>
          </div>

          {error && <p className="text-xs text-status-coral font-medium">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emeraldsoft text-white font-semibold text-sm hover:bg-emeraldsoft-dark transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
            <span>{loading ? t('btn_searching') : t('btn_check_status')}</span>
          </button>
        </form>

        {/* Results List */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {searched && bookings.length === 0 && !loading && (
            <div className="text-center py-8 text-grey-soft space-y-2">
              <AlertCircle className="w-10 h-10 text-rosegold mx-auto opacity-60" />
              <p className="text-sm font-medium">Tidak ada booking yang ditemukan dengan data tersebut.</p>
              <p className="text-xs">Pastikan nomor HP atau Kode Booking telah sesuai.</p>
            </div>
          )}

          {bookings.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-grey-border p-5 shadow-soft space-y-4 relative"
            >
              {/* Top Row: Code & Status */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cream-200 pb-3">
                <div>
                  <span className="text-xs text-grey-soft block uppercase font-medium">Kode Booking</span>
                  <span className="font-mono text-base font-bold text-emeraldsoft">{item.booking_code}</span>
                </div>
                <div>{getStatusBadge(item.status)}</div>
              </div>

              {/* Detail Info */}
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-grey-soft">Nama Customer:</span>
                  <span className="font-semibold text-slate-dark">{item.customer_name}</span>
                </div>

                {/* Sub-items list */}
                <div className="p-3 rounded-lg bg-cream-50 border border-cream-200 space-y-1.5">
                  <span className="text-[11px] font-bold text-emeraldsoft uppercase tracking-wider block">
                    📋 Rincian Layanan ({item.items?.length || 1}):
                  </span>
                  {(item.items && item.items.length > 0 ? item.items : [item]).map((sub, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs border-b border-cream-200/60 pb-1 last:border-0 last:pb-0">
                      <div>
                        <span className="font-semibold text-slate-dark block">{idx + 1}. {sub.service_name}</span>
                        <span className="text-[10px] text-grey-soft">📅 {formatDateTime(sub.booking_datetime || item.booking_datetime)} ({sub.staff_name || item.staff_name})</span>
                      </div>
                      <span className="font-mono font-bold text-slate-dark">
                        Rp {Number(sub.service_price || 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-1">
                  <span className="text-grey-soft font-medium">Total Pembayaran:</span>
                  <span className="font-bold text-emeraldsoft text-base font-mono">
                    Rp {Number(item.total_price || item.service_price || 0).toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-grey-soft">Batas Bayar:</span>
                  <span className="font-bold text-status-gold">{formatDateTime(item.payment_deadline)}</span>
                </div>
              </div>

              {/* Extra Payment Info if Status is Pending */}
              {item.status === 'Pending' && (
                <div className="p-4 rounded-xl bg-cream-100 border border-cream-200 space-y-3">
                  <div className="text-xs space-y-1">
                    <span className="font-bold text-emeraldsoft block">💳 Info Pembayaran Transfer / QRIS</span>
                    <p className="text-slate-dark">
                      Bank: <strong>{configs?.payment_bank_name || 'BCA'}</strong> ({configs?.payment_account_number || '8830192847'})
                    </p>
                  </div>

                  {/* Upload Form */}
                  <div className="pt-2 border-t border-cream-200 space-y-2">
                    <label className="block text-xs font-semibold text-slate-dark">Upload / Tambah Bukti Pembayaran (Bisa Lebih Dari 1):</label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleCardFileChange(item.id, e.target.files)}
                      className="block w-full text-xs text-slate-dark file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-emeraldsoft file:text-white hover:file:bg-emeraldsoft-dark cursor-pointer"
                    />

                    {/* Previews before upload */}
                    {cardPreviews[item.id] && cardPreviews[item.id].length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {cardPreviews[item.id].map((prevUrl, pIdx) => (
                          <div key={pIdx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-grey-border">
                            <img src={prevUrl} alt={`Preview ${pIdx + 1}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}

                    {uploadMsg[item.id] && <p className="text-xs text-status-green font-medium">{uploadMsg[item.id]}</p>}

                    <button
                      type="button"
                      disabled={!cardFiles[item.id] || cardFiles[item.id].length === 0 || uploadingBookingId === item.id}
                      onClick={() => handleUploadProof(item.booking_code, item.id)}
                      className="w-full py-2 rounded-lg bg-rosegold text-slate-dark font-bold text-xs hover:bg-rosegold-dark hover:text-white transition-all disabled:opacity-40 shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>
                        {uploadingBookingId === item.id 
                          ? 'Mengunggah...' 
                          : `Upload ${cardFiles[item.id]?.length > 1 ? `${cardFiles[item.id].length} Bukti Transfer` : 'Bukti Transfer'}`}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Uploaded Proof Gallery if exists */}
              {((item.proofs && item.proofs.length > 0) || item.payment_proof) && (
                <div className="p-3 rounded-xl bg-cream-50 border border-cream-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-dark font-semibold border-b pb-1.5 border-cream-200">
                    <span className="flex items-center gap-1.5 text-emeraldsoft font-bold">
                      <ImageIcon className="w-4 h-4" />
                      <span>📎 Bukti Bayar Terupload ({(item.proofs && item.proofs.length > 0 ? item.proofs : [item.payment_proof]).length})</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                    {(item.proofs && item.proofs.length > 0 ? item.proofs : [item.payment_proof]).map((proofPath, pIdx) => (
                      <a
                        key={pIdx}
                        href={proofPath}
                        target="_blank"
                        rel="noreferrer"
                        className="group relative rounded-lg overflow-hidden border border-grey-border block h-20 bg-white shadow-xs"
                      >
                        <img
                          src={proofPath}
                          alt={`Bukti ${pIdx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <span className="absolute bottom-0 inset-x-0 bg-slate-dark/70 text-white text-[9px] text-center py-0.5 font-semibold">
                          Bukti #{pIdx + 1}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* WA Admin Contact Link */}
              <div className="pt-2 border-t border-cream-200 flex items-center justify-between gap-2">
                <span className="text-[11px] text-grey-soft">Butuh bantuan tentang booking ini?</span>
                <a
                  href={`https://wa.me/${configs?.whatsapp_number || '6281234567890'}?text=${encodeURIComponent(`Halo Admin Luxe Salon, saya ingin konfirmasi/tanya mengenai booking kode: ${item.booking_code} a/n ${item.customer_name}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-status-green text-white font-semibold text-xs hover:bg-status-green/90 transition-colors shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat WA Admin</span>
                </a>
              </div>

            </div>
          ))}

        </div>

      </div>
    </div>
  );
}
