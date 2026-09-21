import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Platform,
  Clipboard,
} from 'react-native';
import { CheckCircle2, MessageCircle, X, Copy, Check } from 'lucide-react-native';
import { COLORS, SHADOWS } from '../constants/theme';

export default function OrderSuccessModal({ visible, onClose, booking, configs }) {
  const [copied, setCopied] = useState(false);

  if (!booking) return null;

  const waNumber = configs?.whatsapp_number || '6281234567890';
  const waText = encodeURIComponent(
    `Halo Admin Salon, saya telah melakukan pemesanan dengan Kode Booking: ${booking.booking_code}. Mohon konfirmasi reservasi saya.`
  );
  const waUrl = `https://wa.me/${waNumber}?text=${waText}`;

  const openWhatsApp = () => {
    Linking.openURL(waUrl).catch((err) => console.error('Error opening WA:', err));
  };

  const handleCopyCode = async () => {
    if (!booking?.booking_code) return;
    const code = booking.booking_code;

    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(code);
      } else if (Clipboard && typeof Clipboard.setString === 'function') {
        Clipboard.setString(code);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.log('Copy error:', err);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <X size={20} color={COLORS.greyText} />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            <View style={styles.iconCircle}>
              <CheckCircle2 size={48} color={COLORS.emerald} />
            </View>

            <Text style={styles.title}>Reservasi Berhasil!</Text>
            <Text style={styles.subtitle}>
              Terima kasih, reservasi Anda telah berhasil dibuat. Silakan simpan Kode Booking di bawah.
            </Text>

            {/* Code Box with Copy Button */}
            <View style={styles.codeContainer}>
              <Text style={styles.codeLabel}>KODE BOOKING ANDA</Text>
              <Text style={styles.codeValue}>{booking.booking_code}</Text>

              <TouchableOpacity
                style={[styles.copyBtn, copied && styles.copyBtnSuccess]}
                onPress={handleCopyCode}
                activeOpacity={0.8}
              >
                {copied ? (
                  <>
                    <Check size={14} color={COLORS.emerald} />
                    <Text style={styles.copyBtnTextSuccess}>Kode Tersalin!</Text>
                  </>
                ) : (
                  <>
                    <Copy size={14} color={COLORS.emerald} />
                    <Text style={styles.copyBtnText}>Salin Kode</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Detail Box */}
            <View style={styles.detailsBox}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Layanan:</Text>
                <Text style={styles.detailVal}>{booking.service_name}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Cabang Outlet:</Text>
                <Text style={styles.detailVal}>{booking.outlet_name}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Nama Pemesan:</Text>
                <Text style={styles.detailVal}>{booking.customer_name}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>No. WhatsApp:</Text>
                <Text style={styles.detailVal}>{booking.customer_phone}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Jadwal:</Text>
                <Text style={styles.detailVal}>
                  {booking.booking_date} @ {booking.booking_time}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Total Biaya:</Text>
                <Text style={[styles.detailVal, { color: COLORS.emerald, fontWeight: '800' }]}>
                  {formatPrice(booking.total_price)}
                </Text>
              </View>
            </View>

            {/* WA Button */}
            <TouchableOpacity style={styles.waBtn} onPress={openWhatsApp} activeOpacity={0.8}>
              <MessageCircle size={18} color={COLORS.white} />
              <Text style={styles.waBtnText}>Konfirmasi Via WhatsApp Admin</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.doneBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.doneBtnText}>Selesai</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: COLORS.cream,
    borderRadius: 24,
    maxHeight: '85%',
    padding: 20,
    ...SHADOWS.medium,
  },
  closeBtn: {
    alignSelf: 'flex-end',
    padding: 4,
  },
  content: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.emeraldLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.emerald,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.greyText,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  codeContainer: {
    backgroundColor: COLORS.emerald,
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  codeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.rosegold,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  codeValue: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 2,
    marginBottom: 10,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.cream,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  copyBtnSuccess: {
    backgroundColor: '#D1FAE5',
  },
  copyBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.emerald,
  },
  copyBtnTextSuccess: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.emerald,
  },
  detailsBox: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.greyBorder,
    borderRadius: 16,
    width: '100%',
    padding: 14,
    marginBottom: 16,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 11,
    color: COLORS.greyText,
  },
  detailVal: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.slateDark,
  },
  waBtn: {
    backgroundColor: '#25D366',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    paddingVertical: 12,
    borderRadius: 14,
    marginBottom: 10,
  },
  waBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },
  doneBtn: {
    backgroundColor: COLORS.greyBorder,
    width: '100%',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  doneBtnText: {
    color: COLORS.slateDark,
    fontSize: 13,
    fontWeight: '600',
  },
});
