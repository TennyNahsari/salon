import React, { useState } from 'react';
import { RefreshCw, Filter, Plus, Calendar, Clock, CheckCircle2, Eye, XCircle, ChevronRight, FileText, Image as ImageIcon, Trash2, Users, Scissors, Download } from 'lucide-react';
import { updateBookingStatus, deleteBooking } from '../../services/api';
import { exportToCSV } from '../../utils/exportExcel';
import { useLanguage } from '../../context/LanguageContext';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function BookingManager({
  bookings,
  loading,
  statusFilter,
  setStatusFilter,
  dateFilter,
  setDateFilter,
  onRefresh,
  onOpenManualModal,
  services
}) {
  const { t } = useLanguage();
  const [selectedProofs, setSelectedProofs] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [serviceFilter, setServiceFilter] = useState('All');
  const [staffFilter, setStaffFilter] = useState('All');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  const handleExportExcel = () => {
    const bookingsToExport = filteredBookings.filter(b => {
      if (!b.booking_datetime) return true;
      const bDate = b.booking_datetime.split('T')[0];
      if (startDateFilter && bDate < startDateFilter) return false;
      if (endDateFilter && bDate > endDateFilter) return false;
      return true;
    });

    const headers = [
      'Kode Booking',
      'Nama Customer',
      'No. WhatsApp',
      'Email',
      'Rincian Layanan',
      'Staff',
      'Jadwal Treatment',
      'Batas Bayar',
      'Total Biaya (Rp)',
      'Status',
      'Dibuat Oleh'
    ];

    const rows = bookingsToExport.map(b => [
      b.booking_code,
      b.customer_name,
      b.customer_phone,
      b.customer_email || '-',
      b.items && b.items.length > 0 ? b.items.map(i => `${i.service_name} (Rp ${i.service_price})`).join(' | ') : b.service_name,
      b.items && b.items.length > 0 ? b.items.map(i => i.staff_name).join(' | ') : b.staff_name,
      formatDateTime(b.booking_datetime),
      formatDateTime(b.payment_deadline),
      Number(b.total_price || b.service_price || 0),
      b.status,
      b.created_by || 'public'
    ]);

    const dateSuffix = startDateFilter || endDateFilter ? `_${startDateFilter || 'awal'}_sd_${endDateFilter || 'akhir'}` : '';
    exportToCSV(`Laporan_Booking_LuxeSalon${dateSuffix}`, headers, rows);
  };

  // Extract unique staff list from bookings
  const availableStaffList = Array.from(
    new Set(
      bookings.flatMap(b => (b.items && b.items.length > 0 ? b.items.map(i => i.staff_name) : [b.staff_name])).filter(Boolean)
    )
  ).sort();

  // Filter bookings by Service and Staff
  const filteredBookings = bookings.filter(b => {
    let matchesService = true;
    if (serviceFilter !== 'All') {
      const targetId = Number(serviceFilter);
      if (b.items && b.items.length > 0) {
        matchesService = b.items.some(it => Number(it.service_id) === targetId);
      } else {
        matchesService = Number(b.service_id) === targetId;
      }
    }

    let matchesStaff = true;
    if (staffFilter !== 'All') {
      if (b.items && b.items.length > 0) {
        matchesStaff = b.items.some(it => it.staff_name === staffFilter);
      } else {
        matchesStaff = b.staff_name === staffFilter;
      }
    }

    return matchesService && matchesStaff;
  });

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      setUpdatingId(bookingId);
      await updateBookingStatus(bookingId, newStatus);
      onRefresh();
    } catch (err) {
      alert('Gagal memperbarui status booking.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteBooking = async (bookingId, bookingCode) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus permanen booking #${bookingCode}?`)) return;
    try {
      setUpdatingId(bookingId);
      await deleteBooking(bookingId);
      onRefresh();
    } catch (err) {
      alert('Gagal menghapus booking.');
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDateTime = (dateStr) => {
    try {
      return format(new Date(dateStr), "dd MMM yyyy, HH:mm 'WIB'", { locale: id });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-status-gold/20 text-status-gold border border-status-gold/40">🟡 Pending</span>;
      case 'Confirmed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-status-green/20 text-status-green border border-status-green/40">🟢 Confirmed</span>;
      case 'Processed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-status-blue/20 text-status-blue border border-status-blue/40">🔵 Processed</span>;
      case 'Completed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emeraldsoft/20 text-emeraldsoft border border-emeraldsoft/40">🟢 Completed</span>;
      case 'Cancelled':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-status-coral/20 text-status-coral border border-status-coral/40">🔴 Cancelled</span>;
      default:
        return <span className="px-2 py-1 rounded bg-grey-border text-xs">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl font-bold text-slate-dark">{t('admin_booking_title')}</h2>
          <p className="text-grey-soft text-sm">{t('admin_booking_subtitle')}</p>
        </div>

        <button
          onClick={onOpenManualModal}
          className="px-5 py-3 rounded-xl bg-emeraldsoft text-white font-bold text-sm hover:bg-emeraldsoft-dark transition-all flex items-center justify-center gap-2 shadow-md"
        >
          <Plus className="w-5 h-5 text-rosegold" />
          <span>{t('btn_add_manual')}</span>
        </button>
      </div>

      {/* Filter & Refresh Bar */}
      <div className="p-4 rounded-2xl bg-white border border-grey-border shadow-soft flex flex-wrap items-center justify-between gap-4">
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-grey-soft" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-grey-border text-xs font-semibold text-slate-dark bg-cream-50 focus:border-emeraldsoft outline-none"
            >
              <option value="All">{t('filter_all_status')}</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Processed">Processed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Service Filter */}
          <div className="flex items-center gap-2">
            <Scissors className="w-4 h-4 text-grey-soft" />
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-grey-border text-xs font-semibold text-slate-dark bg-cream-50 focus:border-emeraldsoft outline-none"
            >
              <option value="All">{t('filter_all_services')}</option>
              {services && services.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Staff Filter */}
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-grey-soft" />
            <select
              value={staffFilter}
              onChange={(e) => setStaffFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-grey-border text-xs font-semibold text-slate-dark bg-cream-50 focus:border-emeraldsoft outline-none"
            >
              <option value="All">{t('filter_all_staff')}</option>
              {availableStaffList.map((st, idx) => (
                <option key={idx} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* Rentang Tanggal (Start Date & End Date) */}
          <div className="flex items-center gap-2 border-l border-grey-border pl-3">
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
        </div>

        {/* Action Buttons: Export Excel & Refresh */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-4 py-2 rounded-xl bg-status-green text-white font-bold text-xs hover:bg-status-green/90 transition-all flex items-center gap-1.5 shadow-sm"
            title="Download Laporan Booking ke Excel (CSV)"
          >
            <Download className="w-4 h-4" />
            <span>📥 Export Excel</span>
          </button>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-rosegold text-slate-dark font-bold text-xs hover:bg-rosegold-dark hover:text-white transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
            title="Jalankan pemeriksaan auto-cancel & muat ulang bukti bayar"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>🔄 Refresh Data</span>
          </button>
        </div>

      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl border border-grey-border shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-cream-100 border-b border-grey-border text-xs uppercase font-bold text-slate-dark tracking-wider">
                <th className="py-4 px-4">{t('th_code')}</th>
                <th className="py-4 px-4">{t('th_customer')}</th>
                <th className="py-4 px-4">{t('th_service')}</th>
                <th className="py-4 px-4">{t('th_schedule')}</th>
                <th className="py-4 px-4">{t('th_status')}</th>
                <th className="py-4 px-4">{t('th_proof')}</th>
                <th className="py-4 px-4 text-right">{t('th_actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200 text-xs sm:text-sm text-slate-dark">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-grey-soft font-medium">
                    {t('loading_bookings')}
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-grey-soft font-medium">
                    {t('empty_bookings')}
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-cream-50/60 transition-colors">
                    
                    {/* Kode */}
                    <td className="py-4 px-4 font-mono font-bold text-emeraldsoft">
                      {b.booking_code}
                      <span className="block text-[10px] text-grey-soft font-sans font-normal">
                        {b.created_by === 'admin' ? 'Manual (Staff)' : 'Public'}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="py-4 px-4 space-y-0.5">
                      <span className="font-bold text-slate-dark block">{b.customer_name}</span>
                      <span className="text-xs text-grey-soft block">{b.customer_phone}</span>
                      <span className="text-[11px] text-grey-soft block">{b.customer_email}</span>
                    </td>

                    {/* Service & Schedule Breakdown */}
                    <td className="py-4 px-4 space-y-1 max-w-xs">
                      {b.items && b.items.length > 1 ? (
                        <div>
                          <span className="px-2 py-0.5 rounded-md bg-emeraldsoft/10 text-emeraldsoft font-bold text-[11px] border border-emeraldsoft/30 inline-block mb-1">
                            ✨ {b.items.length} Layanan Digabung
                          </span>
                          <ul className="text-xs space-y-1 font-medium text-slate-dark border-l-2 border-emeraldsoft/30 pl-2">
                            {b.items.map((it, i) => (
                              <li key={i} className="leading-tight">
                                <span className="font-semibold">{i + 1}. {it.service_name}</span>
                                <span className="text-[10px] text-grey-soft block">👤 {it.staff_name || 'Staff'}</span>
                                <span className="text-[11px] text-emeraldsoft font-mono font-bold block">
                                  🕒 {formatDateTime(it.booking_datetime)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <div>
                          <span className="font-semibold text-slate-dark block">{b.service_name}</span>
                          <span className="text-xs text-grey-soft">👤 {b.staff_name}</span>
                        </div>
                      )}
                      <span className="text-xs text-rosegold font-bold block font-mono pt-1">
                        Total: Rp {Number(b.total_price || b.service_price || 0).toLocaleString('id-ID')}
                      </span>
                    </td>

                    {/* Datetime & Deadline */}
                    <td className="py-4 px-4 space-y-1">
                      <div className="flex items-center gap-1 font-medium text-slate-dark text-xs sm:text-sm">
                        <Calendar className="w-3.5 h-3.5 text-emeraldsoft shrink-0" />
                        <span>{formatDateTime(b.booking_datetime)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-status-gold font-semibold">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>Max Bayar: {formatDateTime(b.payment_deadline)}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      {getStatusBadge(b.status)}
                    </td>

                    {/* Bukti Bayar Thumbnail */}
                    <td className="py-4 px-4">
                      {(b.proofs && b.proofs.length > 0) || b.payment_proof ? (
                        <div
                          onClick={() => setSelectedProofs(b.proofs && b.proofs.length > 0 ? b.proofs : [b.payment_proof])}
                          className="cursor-pointer group flex items-center gap-2 bg-cream-100 p-1.5 rounded-lg border border-grey-border hover:border-emeraldsoft transition-all w-fit"
                          title="Klik untuk melihat seluruh bukti transfer"
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
                        <span className="text-xs text-grey-soft italic">Belum Upload</span>
                      )}
                    </td>

                    {/* Status Action Buttons */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {b.status === 'Pending' && (
                          <button
                            onClick={() => handleStatusChange(b.id, 'Confirmed')}
                            disabled={updatingId === b.id}
                            className="px-3 py-1.5 rounded-lg bg-status-green text-white font-bold text-xs hover:bg-status-green/80 transition-colors shadow-sm"
                          >
                            [Confirm]
                          </button>
                        )}

                        {b.status === 'Confirmed' && (
                          <button
                            onClick={() => handleStatusChange(b.id, 'Processed')}
                            disabled={updatingId === b.id}
                            className="px-3 py-1.5 rounded-lg bg-status-blue text-white font-bold text-xs hover:bg-status-blue/80 transition-colors shadow-sm"
                          >
                            [Process]
                          </button>
                        )}

                        {b.status === 'Processed' && (
                          <button
                            onClick={() => handleStatusChange(b.id, 'Completed')}
                            disabled={updatingId === b.id}
                            className="px-3 py-1.5 rounded-lg bg-emeraldsoft text-white font-bold text-xs hover:bg-emeraldsoft-dark transition-colors shadow-sm"
                          >
                            [Complete]
                          </button>
                        )}

                        {b.status !== 'Cancelled' && b.status !== 'Completed' && (
                          <button
                            onClick={() => handleStatusChange(b.id, 'Cancelled')}
                            disabled={updatingId === b.id}
                            className="px-2.5 py-1.5 rounded-lg bg-status-coral/10 text-status-coral font-bold text-xs hover:bg-status-coral hover:text-white transition-colors"
                          >
                            Cancel
                          </button>
                        )}

                        {/* Tombol Hapus Bookingan */}
                        <button
                          onClick={() => handleDeleteBooking(b.id, b.booking_code)}
                          disabled={updatingId === b.id}
                          className="p-1.5 rounded-lg bg-status-coral/10 text-status-coral hover:bg-status-coral hover:text-white transition-colors"
                          title="Hapus Permanen Booking"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Proof Image Preview Modal (Gallery Multi-Bukti) */}
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

            {/* Gallery Grid */}
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
