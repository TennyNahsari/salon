import React, { useState } from 'react';
import { X, CheckCircle2, Clock, CreditCard, Upload, MessageCircle, Copy, Check, FileImage } from 'lucide-react';
import { uploadPaymentProof } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function AfterBookingModal({ isOpen, onClose, booking, configs }) {
  const { t } = useLanguage();
  const [files, setFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const [copiedBank, setCopiedBank] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [uploadedProofsList, setUploadedProofsList] = useState(booking?.proofs || (booking?.payment_proof ? [booking.payment_proof] : []));

  if (!isOpen || !booking) return null;

  const copyBookingCode = () => {
    if (booking?.booking_code) {
      navigator.clipboard.writeText(booking.booking_code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // Format datetime strings safely
  const formatDateTime = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return format(d, "dd MMMM yyyy, HH:mm 'WIB'", { locale: id });
    } catch {
      return dateStr;
    }
  };

  const formatDeadline = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return format(d, "HH:mm 'WIB' (dd MMM yyyy)", { locale: id });
    } catch {
      return dateStr;
    }
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length > 0) {
      setFiles(selected);
      setFilePreviews(selected.map(f => URL.createObjectURL(f)));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      setMessage('');
      const formData = new FormData();
      files.forEach(f => formData.append('payment_proof', f));
      formData.append('booking_code', booking.booking_code);

      const res = await uploadPaymentProof(formData);
      if (res.success) {
        setUploadSuccess(true);
        setMessage('Bukti pembayaran berhasil diunggah! Menunggu konfirmasi admin.');
        if (res.payment_proofs) {
          setUploadedProofsList(res.payment_proofs);
        }
      } else {
        setMessage(res.message || 'Gagal mengunggah bukti.');
      }
    } catch (err) {
      setMessage('Gagal mengunggah bukti pembayaran.');
    } finally {
      setUploading(false);
    }
  };

  const copyBankNo = () => {
    const no = configs?.payment_account_number || '8830192847';
    navigator.clipboard.writeText(no);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  const waNumber = configs?.whatsapp_number || '6281234567890';
  const waText = encodeURIComponent(`Halo Admin Luxe Salon, saya ingin konfirmasi booking kode: ${booking.booking_code} a/n ${booking.customer_name}`);
  const waLink = `https://wa.me/${waNumber}?text=${waText}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-dark/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-modal overflow-hidden border border-cream-200 animate-in fade-in zoom-in duration-200 my-8">
        
        {/* Header Gold Line */}
        <div className="h-2 bg-gradient-to-r from-rosegold via-status-gold to-emeraldsoft" />
        
        <div className="p-6 pb-3 border-b border-cream-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-status-green" />
            <h3 className="font-serif text-2xl font-bold text-slate-dark">{t('modal_after_title')}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-grey-soft hover:text-slate-dark hover:bg-cream-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Greeting & Booking Code */}
          <div className="text-center bg-cream-100 p-4 rounded-xl border border-cream-200 space-y-1">
            <p className="text-slate-dark text-sm">
              {t('greeting')} <strong className="text-emeraldsoft">{booking.customer_name}</strong>!
            </p>
            <div className="inline-flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-lg border border-rosegold/40 shadow-sm mt-1">
              <span className="text-xs text-grey-soft uppercase font-medium">{t('booking_code')}</span>
              <span className="font-mono text-base font-bold text-rosegold-dark">{booking.booking_code}</span>
              <button
                onClick={copyBookingCode}
                className="ml-1 px-2 py-1 rounded-md bg-cream-100 border border-grey-border hover:bg-emeraldsoft hover:text-white transition-all text-xs font-semibold flex items-center gap-1 text-emeraldsoft shadow-sm"
                title="Salin Kode Booking"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-status-green" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-[11px]">{copiedCode ? t('btn_copied') : t('btn_copy')}</span>
              </button>
            </div>
          </div>

          {/* 📋 Detail Booking Box */}
          <div className="bg-white p-4 rounded-xl border border-grey-border space-y-3 text-sm shadow-sm">
            <div className="flex items-center justify-between border-b pb-2 border-cream-200">
              <h4 className="font-bold text-slate-dark text-xs uppercase tracking-wider text-emeraldsoft flex items-center gap-1.5">
                {t('detail_ordered_services')} ({booking.items?.length || 1})
              </h4>
              {booking.items?.length > 1 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emeraldsoft/10 text-emeraldsoft border border-emeraldsoft/30">
                  {t('multi_booking_merged')}
                </span>
              )}
            </div>

            {/* Itemized Services Breakdown */}
            <div className="space-y-2">
              {(booking.items && booking.items.length > 0 ? booking.items : [booking]).map((it, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-cream-50 border border-cream-200 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-dark text-sm">
                    <span>{idx + 1}. {it.service_name}</span>
                    <span className="text-emeraldsoft font-mono">Rp {Number(it.service_price || 0).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between text-[11px] text-grey-soft pt-0.5">
                    <span>📅 Jadwal: {formatDateTime(it.booking_datetime || booking.booking_datetime)}</span>
                    <span>👤 Staff: <strong className="text-slate-dark">{it.staff_name || booking.staff_name}</strong></span>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Pembayaran & Deadline */}
            <div className="pt-2 border-t border-cream-200 flex items-center justify-between">
              <span className="font-bold text-slate-dark text-sm">{t('total_merged_payment')}</span>
              <span className="font-bold text-emeraldsoft text-lg font-mono">
                Rp {Number(booking.total_price || booking.service_price || 0).toLocaleString('id-ID')}
              </span>
            </div>

            {/* Deadline Highlight */}
            <div className="mt-2 p-3 rounded-lg bg-status-gold/10 border border-status-gold/30 flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-dark">
              <div className="flex items-center gap-2 text-status-gold">
                <Clock className="w-4 h-4 animate-pulse" />
                <span>{t('payment_deadline_label')}</span>
              </div>
              <span className="text-status-gold font-bold">{formatDeadline(booking.payment_deadline)}</span>
            </div>
          </div>

          {/* 💳 Pembayaran Box */}
          <div className="bg-white p-4 rounded-xl border border-grey-border space-y-3 text-sm shadow-sm">
            <h4 className="font-bold text-slate-dark text-xs uppercase tracking-wider text-emeraldsoft flex items-center gap-1.5 border-b pb-2 border-cream-200">
              💳 Rekening &amp; QRIS Pembayaran
            </h4>

            {/* Bank Detail */}
            <div className="flex items-center justify-between bg-cream-50 p-3 rounded-lg border border-cream-200">
              <div>
                <span className="text-xs text-grey-soft block">Bank Transfer:</span>
                <span className="font-bold text-slate-dark block text-sm">
                  {configs?.payment_bank_name || 'Bank BCA a/n Luxe Salon'}
                </span>
                <span className="font-mono font-bold text-emeraldsoft text-base">
                  {configs?.payment_account_number || '8830192847'}
                </span>
              </div>
              <button
                onClick={copyBankNo}
                className="px-3 py-1.5 rounded-lg bg-white border border-grey-border text-xs font-semibold text-emeraldsoft hover:bg-emeraldsoft hover:text-white transition-colors flex items-center gap-1 shadow-sm"
              >
                {copiedBank ? <Check className="w-3.5 h-3.5 text-status-green" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedBank ? 'Tersalin' : 'Salin'}</span>
              </button>
            </div>

            {/* QRIS Image & WA Admin */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div className="text-center p-3 rounded-lg border border-cream-200 bg-cream-50">
                <span className="text-xs text-grey-soft block mb-2 font-medium">Scan QRIS:</span>
                <img
                  src={configs?.payment_qris_image || '/uploads/qris-default.png'}
                  alt="QRIS Pembayaran"
                  className="w-36 h-44 object-contain mx-auto rounded-lg shadow-sm border border-grey-border bg-white"
                  onError={(e) => { e.target.src = '/uploads/qris-default.png'; }}
                />
              </div>

              <div className="space-y-3">
                <p className="text-xs text-grey-soft leading-relaxed">
                  Setelah melakukan pembayaran sesuai nominal, Anda dapat mengunggah bukti transfer di bawah ini atau menghubungi WA Admin.
                </p>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-status-green text-white font-semibold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat WhatsApp Admin</span>
                </a>
              </div>
            </div>
          </div>

          {/* 📤 Upload Bukti Bayar Box */}
          <div className="bg-white p-4 rounded-xl border border-grey-border space-y-3 text-sm shadow-sm">
            <h4 className="font-bold text-slate-dark text-xs uppercase tracking-wider text-emeraldsoft flex items-center gap-1.5 border-b pb-2 border-cream-200">
              📤 Upload Bukti Pembayaran (Bisa Lebih Dari 1)
            </h4>

            {uploadSuccess && (
              <div className="p-3 rounded-lg bg-status-green/10 border border-status-green/30 text-status-green text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{message}</span>
              </div>
            )}

            <form onSubmit={handleUpload} className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="block w-full text-xs text-slate-dark file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emeraldsoft file:text-white hover:file:bg-emeraldsoft-dark cursor-pointer"
                />
              </div>

              {/* Previews before upload */}
              {filePreviews && filePreviews.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {filePreviews.map((prevUrl, pIdx) => (
                    <div key={pIdx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-grey-border">
                      <img src={prevUrl} alt={`Preview ${pIdx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}

              {message && !uploadSuccess && <p className="text-xs text-status-coral font-medium">{message}</p>}

              <button
                type="submit"
                disabled={!files || files.length === 0 || uploading}
                className="w-full py-2.5 rounded-xl bg-rosegold text-slate-dark font-bold text-xs hover:bg-rosegold-dark hover:text-white transition-all disabled:opacity-40 flex items-center justify-center gap-2 shadow-sm"
              >
                <Upload className="w-4 h-4" />
                <span>
                  {uploading 
                    ? 'Mengunggah...' 
                    : `Upload ${files.length > 1 ? `${files.length} Bukti Pembayaran` : 'Bukti Pembayaran'}`}
                </span>
              </button>
            </form>

            {/* Gallery of Uploaded Proofs */}
            {uploadedProofsList && uploadedProofsList.length > 0 && (
              <div className="pt-3 border-t border-cream-200 space-y-2">
                <span className="text-xs font-bold text-emeraldsoft block">📎 Bukti Bayar Terunggah ({uploadedProofsList.length}):</span>
                <div className="grid grid-cols-3 gap-2">
                  {uploadedProofsList.map((pPath, pIdx) => (
                    <a
                      key={pIdx}
                      href={pPath}
                      target="_blank"
                      rel="noreferrer"
                      className="group relative rounded-lg overflow-hidden border border-grey-border block h-16 bg-cream-50"
                    >
                      <img src={pPath} alt={`Bukti ${pIdx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer Button */}
        <div className="p-4 bg-cream-100 border-t border-cream-200 text-right">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-emeraldsoft text-white font-semibold text-sm hover:bg-emeraldsoft-dark transition-colors shadow-sm"
          >
            Tutup Window
          </button>
        </div>

      </div>
    </div>
  );
}
