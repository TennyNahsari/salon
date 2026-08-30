import React from 'react';
import { Printer, X, CheckCircle2, Scissors } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function ThermalReceiptModal({ isOpen, onClose, transaction, configs }) {
  const { t } = useLanguage();

  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatDateTime = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return format(d, "dd/MM/yyyy HH:mm", { locale: id });
    } catch {
      return dateStr || '-';
    }
  };

  const items = transaction.items && transaction.items.length > 0
    ? transaction.items
    : [{
        service_name: transaction.service_name,
        service_price: transaction.service_price,
        staff_name: transaction.staff_name,
        booking_datetime: transaction.booking_datetime
      }];

  const totalPrice = Number(transaction.total_price || transaction.service_price || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-dark/80 backdrop-blur-sm">
      
      {/* CSS for Thermal EPOS Printing */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #receipt-print-area, #receipt-print-area * {
            visibility: visible !important;
          }
          #receipt-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 80mm !important;
            margin: 0 !important;
            padding: 10px !important;
            background: white !important;
            color: black !important;
            font-family: 'Courier New', Courier, monospace !important;
            font-size: 12px !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      <div className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-grey-border bg-cream-100">
          <h3 className="font-bold text-slate-dark text-base flex items-center gap-2">
            <Printer className="w-5 h-5 text-emeraldsoft" />
            <span>{t('receipt_modal_title')}</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-grey-soft hover:text-slate-dark hover:bg-cream-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Scrollable Preview */}
        <div className="p-6 overflow-y-auto flex-1 bg-cream-50/50 flex justify-center">
          
          {/* RECEIPT CONTENT (EPOS 80mm/58mm Thermal Receipt Box) */}
          <div
            id="receipt-print-area"
            className="w-[320px] bg-white p-5 border border-grey-border shadow-md rounded-xl font-mono text-xs text-slate-dark space-y-3 leading-tight"
          >
            {/* Salon Header */}
            <div className="text-center space-y-1 pb-2 border-b border-dashed border-slate-300">
              <div className="flex items-center justify-center gap-1 font-serif text-lg font-bold text-slate-dark">
                <Scissors className="w-4 h-4 text-emeraldsoft" />
                <span>LUXE SALON &amp; SPA</span>
              </div>
              <p className="text-[10px] text-grey-soft">Beauty, Care &amp; Harmony</p>
              <p className="text-[10px] text-grey-soft">Jl. Premium Beauty No. 88, Jakarta</p>
              <p className="text-[10px] text-grey-soft">WA: {configs?.whatsapp_number || '0812-3456-7890'}</p>
            </div>

            {/* Invoice Info */}
            <div className="space-y-1 text-[11px] pb-2 border-b border-dashed border-slate-300">
              <div className="flex justify-between">
                <span>{t('receipt_invoice_no')}</span>
                <span className="font-bold">{transaction.booking_code}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('receipt_trans_date')}</span>
                <span>{formatDateTime(transaction.created_at || new Date())}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('receipt_customer')}</span>
                <span className="font-semibold">{transaction.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('receipt_phone')}</span>
                <span>{transaction.customer_phone}</span>
              </div>
            </div>

            {/* Itemized Services Table */}
            <div className="space-y-2 pb-2 border-b border-dashed border-slate-300">
              <div className="flex justify-between font-bold text-[11px] pb-1 border-b border-slate-200">
                <span>{t('receipt_treatment_header')}</span>
                <span>{t('receipt_price_header')}</span>
              </div>

              {items.map((it, idx) => (
                <div key={idx} className="space-y-0.5 text-[11px]">
                  <div className="flex justify-between font-semibold">
                    <span>{idx + 1}. {it.service_name}</span>
                    <span>Rp {Number(it.service_price || 0).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="text-[10px] text-grey-soft flex justify-between pl-3">
                    <span>Staff: {it.staff_name || 'Staff'}</span>
                    <span>{formatDateTime(it.booking_datetime)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Payment */}
            <div className="space-y-1 pt-1 text-[11px] border-b border-dashed border-slate-300 pb-3">
              <div className="flex justify-between font-bold text-sm">
                <span>{t('receipt_total_paid')}</span>
                <span className="text-emeraldsoft font-mono">
                  Rp {totalPrice.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between text-[10px] text-grey-soft pt-1">
                <span>{t('receipt_payment_status')}</span>
                <span className="font-bold text-status-green uppercase flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> {t('status_paid')}
                </span>
              </div>
              <div className="flex justify-between text-[10px] text-grey-soft">
                <span>{t('receipt_payment_method')}</span>
                <span>Transfer / QRIS / Cash</span>
              </div>
            </div>

            {/* Receipt Footer */}
            <div className="text-center space-y-1 pt-2 text-[10px] text-grey-soft">
              <p className="font-semibold text-slate-dark">{t('receipt_thank_you')}</p>
              <p>Terima kasih atas kunjungan Anda di</p>
              <p className="font-medium text-slate-dark">Luxe Salon &amp; Spa</p>
              <p className="text-[9px] pt-1">Simpan nota ini sebagai bukti transaksi resmi.</p>
            </div>

          </div>

        </div>

        {/* Modal Actions */}
        <div className="p-4 border-t border-grey-border bg-white flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-grey-border text-slate-dark font-semibold text-xs hover:bg-cream-100 transition-colors"
          >
            {t('btn_close')}
          </button>
          
          <button
            type="button"
            onClick={handlePrint}
            className="px-6 py-2.5 rounded-xl bg-emeraldsoft text-white font-bold text-xs hover:bg-emeraldsoft-dark transition-all shadow-md flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>{t('btn_print_epos')}</span>
          </button>
        </div>

      </div>

    </div>
  );
}
