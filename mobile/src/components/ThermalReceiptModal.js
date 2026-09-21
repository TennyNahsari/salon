import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { Printer, X, Scissors, CheckCircle2 } from 'lucide-react-native';
import { COLORS, SHADOWS } from '../constants/theme';

export default function ThermalReceiptModal({ visible, onClose, transaction, configs }) {
  if (!transaction) return null;

  const handlePrint = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.print();
    } else {
      alert('Fungsi cetak nota struk siap dicetak. Hubungkan printer Bluetooth/Thermal.');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  const items =
    transaction.items && transaction.items.length > 0
      ? transaction.items
      : [
          {
            service_name: transaction.service_name,
            service_price: transaction.service_price,
            staff_name: transaction.staff_name,
            booking_datetime: transaction.booking_datetime,
          },
        ];

  const totalPrice = Number(transaction.total_price || transaction.service_price || 0);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>

        <View style={styles.card}>
          {/* Header Modal */}
          <View style={styles.modalHeader}>
            <View style={styles.headerTitleRow}>
              <Printer size={18} color={COLORS.emerald} />
              <Text style={styles.modalTitle}>Cetak Struk Nota (Thermal 80mm)</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={COLORS.greyText} />
            </TouchableOpacity>
          </View>

          {/* Receipt Scrollable Body */}
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* THERMAL RECEIPT BOX */}
            <View style={styles.receiptBox} id="receipt-print-area">

              {/* Salon Header */}
              <View style={styles.receiptHeader}>
                <View style={styles.brandRow}>
                  <Scissors size={18} color={COLORS.emerald} />
                  <Text style={styles.brandTitle}>LUXE SALON & SPA</Text>
                </View>
                {transaction.outlet_name ? (
                  <Text style={styles.outletNameText}>📍 {transaction.outlet_name}</Text>
                ) : null}
                <Text style={styles.taglineText}>Beauty, Care & Harmony</Text>
                <Text style={styles.addressText}>
                  {transaction.outlet_address || 'Jl. Dharmawangsa Raya No. 12, Jakarta Selatan'}
                </Text>
                <Text style={styles.contactText}>
                  WA Admin: {transaction.outlet_phone || configs?.whatsapp_number || '0812-3456-7890'}
                </Text>
              </View>

              <Text style={styles.dashLine}>- - - - - - - - - - - - - - - - - - - - - - - - - - - - -</Text>

              {/* Invoice Info */}
              <View style={styles.invoiceSection}>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>No. Nota / Invoice:</Text>
                  <Text style={styles.invoiceCode}>{transaction.booking_code}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Tanggal & Jam:</Text>
                  <Text style={styles.receiptVal}>
                    {transaction.booking_date || ''} @ {transaction.booking_time || ''}
                  </Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Pelanggan:</Text>
                  <Text style={styles.receiptValBold}>{transaction.customer_name}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>No. WhatsApp:</Text>
                  <Text style={styles.receiptVal}>{transaction.customer_phone}</Text>
                </View>
              </View>

              <Text style={styles.dashLine}>- - - - - - - - - - - - - - - - - - - - - - - - - - - - -</Text>

              {/* Treatment Table */}
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeadLabel}>RINCIAN LAYANAN SALON</Text>
                <Text style={styles.tableHeadLabel}>SUBTOTAL</Text>
              </View>

              {items.map((it, idx) => (
                <View key={idx} style={styles.itemRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>
                      {idx + 1}. {it.service_name}
                    </Text>
                    {it.staff_name ? (
                      <Text style={styles.itemSubText}>Stylist: {it.staff_name}</Text>
                    ) : null}
                  </View>
                  <Text style={styles.itemPrice}>
                    {formatPrice(it.service_price || transaction.service_price)}
                  </Text>
                </View>
              ))}

              <Text style={styles.dashLine}>- - - - - - - - - - - - - - - - - - - - - - - - - - - - -</Text>

              {/* Total Summary */}
              <View style={styles.totalSection}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>TOTAL BAYAR (LUNAS):</Text>
                  <Text style={styles.totalVal}>{formatPrice(totalPrice)}</Text>
                </View>

                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>Status Transaksi:</Text>
                  <View style={styles.lunasBadge}>
                    <CheckCircle2 size={12} color="#047857" />
                    <Text style={styles.lunasBadgeText}>LUNAS / LUNAS SPK</Text>
                  </View>
                </View>

                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>Metode Bayar:</Text>
                  <Text style={styles.methodVal}>Transfer Bank / QRIS / Cash</Text>
                </View>
              </View>

              <Text style={styles.dashLine}>- - - - - - - - - - - - - - - - - - - - - - - - - - - - -</Text>

              {/* Footer */}
              <View style={styles.receiptFooter}>
                <Text style={styles.footerThanks}>--- TERIMA KASIH ---</Text>
                <Text style={styles.footerText}>Terima kasih atas kunjungan Anda di Luxe Salon & Spa.</Text>
                <Text style={styles.footerNote}>Simpan struk nota ini sebagai bukti transaksi resmi.</Text>
              </View>

            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.closeModalBtn} onPress={onClose}>
              <Text style={styles.closeModalBtnText}>Tutup</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.printActionBtn} onPress={handlePrint} activeOpacity={0.8}>
              <Printer size={16} color={COLORS.white} />
              <Text style={styles.printActionBtnText}>Cetak Struk Nota (EPOS)</Text>
            </TouchableOpacity>
          </View>
        </View>

      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: COLORS.cream,
    borderRadius: 24,
    maxHeight: '90%',
    paddingBottom: 16,
    ...SHADOWS.medium,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.greyBorder,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.emerald,
  },
  closeBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  receiptBox: {
    backgroundColor: COLORS.white,
    width: '100%',
    maxWidth: 340,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.greyBorder,
    padding: 16,
    ...SHADOWS.small,
  },
  receiptHeader: {
    alignItems: 'center',
    marginBottom: 6,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.slateDark,
    letterSpacing: 1,
  },
  outletNameText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.emerald,
    marginVertical: 2,
  },
  taglineText: {
    fontSize: 10,
    color: COLORS.greyText,
    fontStyle: 'italic',
  },
  addressText: {
    fontSize: 10,
    color: COLORS.greyText,
    textAlign: 'center',
    marginTop: 2,
  },
  contactText: {
    fontSize: 10,
    color: COLORS.greyText,
    textAlign: 'center',
  },
  dashLine: {
    color: COLORS.greyBorder,
    fontSize: 10,
    textAlign: 'center',
    marginVertical: 6,
  },
  invoiceSection: {
    gap: 4,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptLabel: {
    fontSize: 11,
    color: COLORS.greyText,
  },
  invoiceCode: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.emerald,
  },
  receiptVal: {
    fontSize: 11,
    color: COLORS.slateDark,
  },
  receiptValBold: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.slateDark,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  tableHeadLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.emerald,
    letterSpacing: 0.5,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginVertical: 3,
  },
  itemName: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.slateDark,
  },
  itemSubText: {
    fontSize: 9,
    color: COLORS.greyText,
    paddingLeft: 12,
  },
  itemPrice: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.slateDark,
  },
  totalSection: {
    gap: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.slateDark,
  },
  totalVal: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.emerald,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 10,
    color: COLORS.greyText,
  },
  lunasBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  lunasBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#047857',
  },
  methodVal: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.slateDark,
  },
  receiptFooter: {
    alignItems: 'center',
    gap: 2,
    marginTop: 4,
  },
  footerThanks: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.slateDark,
  },
  footerText: {
    fontSize: 10,
    color: COLORS.greyText,
    textAlign: 'center',
  },
  footerNote: {
    fontSize: 9,
    color: COLORS.greyText,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 2,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 10,
  },
  closeModalBtn: {
    borderWidth: 1,
    borderColor: COLORS.greyBorder,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  closeModalBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.slateDark,
  },
  printActionBtn: {
    flex: 1,
    backgroundColor: COLORS.emerald,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 12,
  },
  printActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
});
