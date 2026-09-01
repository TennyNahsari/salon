import React, { useState } from 'react';
import { 
  CreditCard, DollarSign, Calendar, Search, Printer, Trash2, 
  CheckCircle2, Image as ImageIcon, Filter, RefreshCw, FileText, Download, MessageCircle 
} from 'lucide-react';
import { deleteBooking } from '../../services/api';
import { exportToCSV } from '../../utils/exportExcel';
import { useLanguage } from '../../context/LanguageContext';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import ThermalReceiptModal from './ThermalReceiptModal';

export default function PaymentManager({
  bookings,
  loading,
  onRefresh,
  configs
}) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [selectedProofs, setSelectedProofs] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const getWhatsAppUrl = (phone) => {
    if (!phone) return '#';
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.slice(1);
    }
    return `https://wa.me/${cleaned}`;
  };

  // Filter only Completed transactions
  const completedBookings = bookings.filter(b => b.status === 'Completed');

  // Filter by search & date range
  const filteredPayments = completedBookings.filter(b => {
    const matchesSearch = 
      b.booking_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customer_phone.includes(searchTerm);

    let matchesDate = true;
    if (b.booking_datetime) {
      const bDate = b.booking_datetime.split('T')[0];
      if (startDateFilter && bDate < startDateFilter) matchesDate = false;
      if (endDateFilter && bDate > endDateFilter) matchesDate = false;
    }

    return matchesSearch && matchesDate;
  });

  const handleExportExcel = () => {
    const headers = [
      'No. Nota / Kode',
      'Tanggal Transaksi',
      'Nama Customer',
      'No. WhatsApp',
      'Email',
      'Rincian Layanan & Staff',
      'Total Pembayaran (Rp)',
      'Status Pembayaran'
    ];

    const rows = filteredPayments.map(b => [
      b.booking_code,
      formatDateTime(b.booking_datetime),
      b.customer_name,
      b.customer_phone,
      b.customer_email || '-',
      b.items && b.items.length > 0 ? b.items.map(i => `${i.service_name} (${i.staff_name || 'Staff'}) - Rp ${i.service_price}`).join(' | ') : b.service_name,
      Number(b.total_price || b.service_price || 0),
      'LUNAS (Completed)'
    ]);

    const dateSuffix = startDateFilter || endDateFilter ? `_${startDateFilter || 'awal'}_sd_${endDateFilter || 'akhir'}` : '';
    exportToCSV(`Laporan_Pembayaran_LuxeSalon${dateSuffix}`, headers, rows);
  };

  // Calculate statistics
  const totalRevenue = completedBookings.reduce((sum, b) => sum + Number(b.total_price || b.service_price || 0), 0);
  const totalCount = completedBookings.length;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayRevenue = completedBookings
    .filter(b => b.booking_datetime && b.booking_datetime.startsWith(todayStr))
    .reduce((sum, b) => sum + Number(b.total_price || b.service_price || 0), 0);

  const formatDateTime = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return format(d, "dd MMM yyyy, HH:mm 'WIB'", { locale: id });
    } catch {
      return dateStr || '-';
    }
  };

  const handleDelete = async (bookingId, bookingCode) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus catatan pembayaran untuk Kode Booking #${bookingCode}?`)) {
      try {
        setDeletingId(bookingId);
        await deleteBooking(bookingId);
        onRefresh();
      } catch (err) {
        alert('Gagal menghapus catatan pembayaran.');
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-grey-border shadow-sm">
        <div>
          <h2 className="text-xl font-serif font-bold text-slate-dark flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emeraldsoft" />
            <span>{t('admin_payment_title')}</span>
          </h2>
          <p className="text-xs text-grey-soft mt-1">
            {t('admin_payment_subtitle')}
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="px-4 py-2.5 rounded-xl bg-cream-100 border border-grey-border text-slate-dark font-semibold text-xs hover:bg-emeraldsoft hover:text-white transition-all flex items-center gap-2 shadow-xs shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{t('btn_refresh_data')}</span>
        </button>
      </div>

      {/* Revenue Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Total Omset */}
        <div className="bg-white p-5 rounded-2xl border border-grey-border shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-grey-soft">{t('total_revenue_label')}</span>
            <div className="text-2xl font-bold font-mono text-emeraldsoft">
              Rp {totalRevenue.toLocaleString('id-ID')}
            </div>
            <span className="text-[11px] text-grey-soft block">Dari {totalCount} transaksi lunas</span>
          </div>
          <div className="p-3 rounded-2xl bg-emeraldsoft/10 text-emeraldsoft">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Total Nota Selesai */}
        <div className="bg-white p-5 rounded-2xl border border-grey-border shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-grey-soft">{t('total_invoices_label')}</span>
            <div className="text-2xl font-bold font-mono text-slate-dark">
              {totalCount} <span className="text-sm font-sans font-normal text-grey-soft">Nota</span>
            </div>
            <span className="text-[11px] text-status-green font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Lunas Verified
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-rosegold/15 text-rosegold-dark">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Omset Hari Ini */}
        <div className="bg-white p-5 rounded-2xl border border-grey-border shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-grey-soft">{t('today_revenue_label')}</span>
            <div className="text-2xl font-bold font-mono text-rosegold-dark">
              Rp {todayRevenue.toLocaleString('id-ID')}
            </div>
            <span className="text-[11px] text-grey-soft block">Transaksi selesai hari ini</span>
          </div>
          <div className="p-3 rounded-2xl bg-status-gold/15 text-status-gold">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-grey-border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-grey-soft" />
          <input
            type="text"
            placeholder="Cari Kode Nota, Nama, atau HP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-grey-border focus:border-emeraldsoft focus:ring-1 focus:ring-emeraldsoft outline-none text-xs font-medium bg-cream-50"
          />
        </div>

        {/* Date Filter Range & Export Excel */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emeraldsoft" />
            <span className="text-[11px] font-semibold text-grey-soft">Start:</span>
            <input
              type="date"
              value={startDateFilter}
              onChange={(e) => setStartDateFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-grey-border text-xs font-medium text-slate-dark bg-cream-50 focus:border-emeraldsoft outline-none"
            />
            <span className="text-[11px] font-semibold text-grey-soft">End:</span>
            <input
              type="date"
              value={endDateFilter}
              onChange={(e) => setEndDateFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-grey-border text-xs font-medium text-slate-dark bg-cream-50 focus:border-emeraldsoft outline-none"
            />
            {(startDateFilter || endDateFilter) && (
              <button
                onClick={() => { setStartDateFilter(''); setEndDateFilter(''); }}
                className="text-xs text-status-coral font-medium hover:underline ml-1"
              >
                Reset
              </button>
            )}
          </div>

          <button
            onClick={handleExportExcel}
            className="px-4 py-2.5 rounded-xl bg-status-green text-white font-bold text-xs hover:bg-status-green/90 transition-all flex items-center gap-1.5 shadow-sm shrink-0"
            title="Download Laporan Pembayaran ke Excel (CSV)"
          >
            <Download className="w-4 h-4" />
            <span>📥 Export Excel Pembayaran</span>
          </button>
        </div>

      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-grey-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-cream-100 text-slate-dark uppercase font-semibold text-[11px] tracking-wider border-b border-grey-border">
              <tr>
                <th className="py-3.5 px-4">{t('th_code')}</th>
                <th className="py-3.5 px-4">{t('th_customer')}</th>
                <th className="py-3.5 px-4">{t('th_service')}</th>
                <th className="py-3.5 px-4">{t('th_price')}</th>
                <th className="py-3.5 px-4">{t('th_proof')}</th>
                <th className="py-3.5 px-4 text-right">{t('th_action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-grey-border">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-grey-soft">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emeraldsoft" />
                    <span>{t('loading_bookings')}</span>
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-grey-soft">
                    <span>{t('empty_payments')}</span>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((b) => (
                  <tr key={b.id} className="hover:bg-cream-50/50 transition-colors">
                    
                    {/* Kode Nota */}
                    <td className="py-4 px-4 font-mono font-bold text-emeraldsoft">
                      {b.booking_code}
                      <span className="block text-[10px] text-grey-soft font-sans font-normal pt-0.5">
                        {formatDateTime(b.booking_datetime)}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="py-4 px-4 space-y-1">
                      <span className="font-bold text-slate-dark block">{b.customer_name}</span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs text-grey-soft font-mono">{b.customer_phone}</span>
                        {b.customer_phone && (
                          <a
                            href={getWhatsAppUrl(b.customer_phone)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 transition-colors text-[11px] font-semibold shadow-xs"
                            title="Chat via WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>WA</span>
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Services Breakdown */}
                    <td className="py-4 px-4 space-y-1 max-w-xs">
                      {b.items && b.items.length > 0 ? (
                        <ul className="text-xs space-y-1 font-medium text-slate-dark">
                          {b.items.map((it, i) => (
                            <li key={i} className="leading-tight">
                              <span className="font-semibold">{i + 1}. {it.service_name}</span>
                              <span className="text-[10px] text-grey-soft block">👤 Staff: {it.staff_name || 'Staff'}</span>
                              <span className="text-[11px] text-emeraldsoft font-mono font-bold block">
                                Rp {Number(it.service_price || 0).toLocaleString('id-ID')}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div>
                          <span className="font-semibold text-slate-dark block">{b.service_name}</span>
                          <span className="text-xs text-grey-soft">👤 Staff: {b.staff_name}</span>
                        </div>
                      )}
                    </td>

                    {/* Total Biaya */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-emeraldsoft text-base font-mono">
                        Rp {Number(b.total_price || b.service_price || 0).toLocaleString('id-ID')}
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-status-green uppercase pt-0.5">
                        <CheckCircle2 className="w-3 h-3" /> LUNAS
                      </span>
                    </td>

                    {/* Bukti Transfer */}
                    <td className="py-4 px-4">
                      {(b.proofs && b.proofs.length > 0) || b.payment_proof ? (
                        <div
                          onClick={() => setSelectedProofs(b.proofs && b.proofs.length > 0 ? b.proofs : [b.payment_proof])}
                          className="cursor-pointer group flex items-center gap-2 bg-cream-100 p-1.5 rounded-lg border border-grey-border hover:border-emeraldsoft transition-all w-fit"
                          title="Klik untuk melihat bukti transfer"
                        >
                          <div className="flex -space-x-2 overflow-hidden">
                            {(b.proofs && b.proofs.length > 0 ? b.proofs : [b.payment_proof]).slice(0, 3).map((p, idx) => (
                              <img
                                key={idx}
                                src={p}
                                alt={`Proof ${idx + 1}`}
                                className="w-8 h-8 object-cover rounded-md border border-white shadow-xs"
                              />
                            ))}
                          </div>
                          <span className="text-[11px] font-semibold text-emeraldsoft group-hover:underline">
                            {(b.proofs && b.proofs.length > 0 ? b.proofs : [b.payment_proof]).length} Bukti
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-grey-soft italic">N/A (Cash)</span>
                      )}
                    </td>

                    {/* Action Buttons */}
                    <td className="py-4 px-4 text-right space-x-2">
                      {/* Cetak Nota Thermal EPOS */}
                      <button
                        onClick={() => setSelectedReceipt(b)}
                        className="px-3 py-1.5 rounded-lg bg-emeraldsoft text-white font-bold text-xs hover:bg-emeraldsoft-dark transition-colors inline-flex items-center gap-1.5 shadow-sm"
                        title="Cetak Nota Printer Thermal EPOS"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Nota</span>
                      </button>

                      {/* Hapus Pembayaran */}
                      <button
                        onClick={() => handleDelete(b.id, b.booking_code)}
                        disabled={deletingId === b.id}
                        className="p-1.5 rounded-lg bg-status-coral/10 text-status-coral hover:bg-status-coral hover:text-white transition-colors"
                        title="Hapus Catatan Pembayaran"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Cetak Nota EPOS Thermal */}
      {selectedReceipt && (
        <ThermalReceiptModal
          isOpen={Boolean(selectedReceipt)}
          onClose={() => setSelectedReceipt(null)}
          transaction={selectedReceipt}
          configs={configs}
        />
      )}

      {/* Modal Galeri Bukti Pembayaran */}
      {selectedProofs && selectedProofs.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-dark/80 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl p-5 max-w-2xl w-full shadow-modal overflow-hidden space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3 border-grey-border">
              <h3 className="font-bold text-slate-dark text-base flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-emeraldsoft" />
                <span>Bukti Pembayaran Terupload ({selectedProofs.length})</span>
              </h3>
              <button
                onClick={() => setSelectedProofs(null)}
                className="p-1.5 rounded-full text-grey-soft hover:text-slate-dark hover:bg-cream-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 pr-1 flex-1">
              <div className={`grid gap-4 ${selectedProofs.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                {selectedProofs.map((proofPath, idx) => (
                  <div key={idx} className="space-y-1 bg-cream-50 p-2 rounded-xl border border-cream-200">
                    <span className="text-[11px] font-bold text-emeraldsoft block">Bukti #{idx + 1}:</span>
                    <a href={proofPath} target="_blank" rel="noreferrer" className="block group overflow-hidden rounded-lg border border-grey-border">
                      <img
                        src={proofPath}
                        alt={`Bukti Bayar ${idx + 1}`}
                        className="w-full h-56 object-contain bg-slate-dark/5 group-hover:scale-105 transition-transform"
                      />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-right pt-2 border-t border-grey-border">
              <button
                onClick={() => setSelectedProofs(null)}
                className="px-5 py-2.5 rounded-xl bg-emeraldsoft text-white font-bold text-xs hover:bg-emeraldsoft-dark transition-all"
              >
                Tutup Galeri
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
