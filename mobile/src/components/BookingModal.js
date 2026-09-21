import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { X, Calendar, Clock, User, Phone, Mail, MapPin, Sparkles, FileText } from 'lucide-react-native';
import { COLORS, SHADOWS } from '../constants/theme';
import { createBooking, getConfigs } from '../services/api';

const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
];

const getUpcomingDates = () => {
  const dates = [];
  const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const label = i === 0 ? 'Hari Ini' : i === 1 ? 'Besok' : `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;
    dates.push({ dateStr, label, dayNum: d.getDate(), dayName: days[d.getDay()] });
  }
  return dates;
};

export default function BookingModal({
  visible,
  onClose,
  selectedService,
  services,
  outlets,
  selectedOutlet,
  onSuccessBooking,
}) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingTime, setBookingTime] = useState('10:00');
  const [notes, setNotes] = useState('');

  const [activeOutlet, setActiveOutlet] = useState(selectedOutlet || (outlets && outlets[0]));
  const [activeService, setActiveService] = useState(selectedService || (services && services[0]));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const upcomingDates = getUpcomingDates();

  useEffect(() => {
    if (selectedOutlet) setActiveOutlet(selectedOutlet);
  }, [selectedOutlet]);

  useEffect(() => {
    if (selectedService) setActiveService(selectedService);
  }, [selectedService]);

  const handleSubmit = async () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      setError('Nama & Nomor WhatsApp wajib diisi.');
      return;
    }

    if (!activeOutlet || !activeService) {
      setError('Silakan pilih outlet dan layanan.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const combinedDatetime = `${bookingDate}T${bookingTime}:00`;
      const fallbackEmail = `${customerName.trim().toLowerCase().replace(/[^a-z0-9]/g, '') || 'pelanggan'}@gmail.com`;

      const payload = {
        outlet_id: Number(activeOutlet.id),
        service_id: Number(activeService.id),
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        customer_email: customerEmail.trim() || fallbackEmail,
        staff_name: 'Bebas / Any Staff',
        booking_datetime: combinedDatetime,
        notes: notes,
      };

      const res = await createBooking(payload);
      if (res.success) {
        let configs = null;
        try {
          const cfgRes = await getConfigs();
          if (cfgRes.success) configs = cfgRes.configs;
        } catch (e) {
          console.log('Configs fetch error:', e);
        }

        onClose();
        onSuccessBooking(res.booking, configs);

        // Reset form
        setCustomerName('');
        setCustomerPhone('');
        setCustomerEmail('');
        setNotes('');
      } else {
        setError(res.message || 'Gagal melakukan pemesanan.');
      }
    } catch (err) {
      console.error('Booking error:', err);
      setError(err.response?.data?.message || 'Gagal terhubung ke server.');
    } finally {
      setLoading(false);
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
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerTitleRow}>
              <Sparkles size={18} color={COLORS.rosegold} />
              <Text style={styles.modalTitle}>Form Reservasi Salon</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={COLORS.greyText} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
            {error ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            ) : null}

            {/* Outlet Cabang (Otomatis Terpilih dari Pilihan Sebelumnya) */}
            <Text style={styles.label}>CABANG OUTLET</Text>
            <View style={styles.selectedOutletBanner}>
              <MapPin size={16} color={COLORS.emerald} />
              <View style={{ flex: 1 }}>
                <Text style={styles.selectedOutletBannerName}>{activeOutlet?.name || 'Cabang Salon'}</Text>
                {activeOutlet?.address ? (
                  <Text style={styles.selectedOutletBannerAddress} numberOfLines={1}>
                    {activeOutlet.address}
                  </Text>
                ) : null}
              </View>
              <View style={styles.autoTag}>
                <Text style={styles.autoTagText}>Terpilih</Text>
              </View>
            </View>

            {/* Select Service */}
            <Text style={styles.label}>PILIH LAYANAN SALON</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {services.map((sv) => (
                <TouchableOpacity
                  key={sv.id}
                  style={[styles.chip, activeService?.id === sv.id && styles.chipActive]}
                  onPress={() => setActiveService(sv)}
                >
                  <Text style={[styles.chipText, activeService?.id === sv.id && styles.chipTextActive]}>
                    {sv.name} ({formatPrice(sv.price)})
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Customer Name */}
            <Text style={styles.label}>NAMA PEMESAN</Text>
            <View style={styles.inputBox}>
              <User size={16} color={COLORS.greyText} />
              <TextInput
                style={styles.textInput}
                placeholder="Masukkan Nama Lengkap"
                value={customerName}
                onChangeText={setCustomerName}
              />
            </View>

            {/* Customer Phone */}
            <Text style={styles.label}>NOMOR WHATSAPP</Text>
            <View style={styles.inputBox}>
              <Phone size={16} color={COLORS.greyText} />
              <TextInput
                style={styles.textInput}
                placeholder="08123456789"
                keyboardType="phone-pad"
                value={customerPhone}
                onChangeText={(val) => setCustomerPhone(val.replace(/\D/g, ''))}
              />
            </View>

            {/* Customer Email */}
            <Text style={styles.label}>EMAIL PEMESAN</Text>
            <View style={styles.inputBox}>
              <Mail size={16} color={COLORS.greyText} />
              <TextInput
                style={styles.textInput}
                placeholder="nama@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={customerEmail}
                onChangeText={setCustomerEmail}
              />
            </View>

            {/* Date Picker Section */}
            <Text style={styles.label}>PILIH TANGGAL RESERVASI</Text>
            
            {/* Quick Date Chips (Hari Ini, Besok, +14 Hari) */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.datePillScroll}>
              {upcomingDates.map((item) => {
                const isSelected = bookingDate === item.dateStr;
                return (
                  <TouchableOpacity
                    key={item.dateStr}
                    style={[styles.datePill, isSelected && styles.datePillActive]}
                    onPress={() => setBookingDate(item.dateStr)}
                  >
                    <Calendar size={12} color={isSelected ? COLORS.white : COLORS.emerald} />
                    <Text style={[styles.datePillText, isSelected && styles.datePillTextActive]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Manual Date Input / Web DatePicker */}
            <View style={styles.inputBox}>
              <Calendar size={16} color={COLORS.greyText} />
              {Platform.OS === 'web' ? (
                <input
                  type="date"
                  value={bookingDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setBookingDate(e.target.value)}
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    backgroundColor: 'transparent',
                    fontSize: '13px',
                    color: COLORS.slateDark,
                    fontFamily: 'inherit',
                    padding: '8px 0',
                  }}
                />
              ) : (
                <TextInput
                  style={styles.textInput}
                  placeholder="YYYY-MM-DD"
                  value={bookingDate}
                  onChangeText={setBookingDate}
                />
              )}
            </View>

            {/* Time Slot Picker */}
            <Text style={styles.label}>JAM RESERVASI</Text>
            <View style={styles.timeGrid}>
              {TIME_SLOTS.map((slot) => (
                <TouchableOpacity
                  key={slot}
                  style={[styles.timeSlot, bookingTime === slot && styles.timeSlotActive]}
                  onPress={() => setBookingTime(slot)}
                >
                  <Clock size={12} color={bookingTime === slot ? COLORS.white : COLORS.slateDark} />
                  <Text style={[styles.timeText, bookingTime === slot && styles.timeTextActive]}>
                    {slot}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Notes */}
            <Text style={styles.label}>CATATAN TAMBAHAN (OPSIONAL)</Text>
            <View style={[styles.inputBox, { alignItems: 'flex-start' }]}>
              <FileText size={16} color={COLORS.greyText} style={{ marginTop: 8 }} />
              <TextInput
                style={[styles.textInput, { height: 60, textAlignVertical: 'top' }]}
                placeholder="Permintaan khusus / tipe perawatan..."
                multiline
                value={notes}
                onChangeText={setNotes}
              />
            </View>

            {/* Rincian Harga Summary */}
            {activeService ? (
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Rincian Pemesanan:</Text>
                <Text style={styles.summaryText}>• Layanan: {activeService.name}</Text>
                <Text style={styles.summaryText}>• Cabang: {activeOutlet?.name}</Text>
                <Text style={styles.summaryText}>• Tanggal & Jam: {bookingDate} jam {bookingTime}</Text>
                <Text style={styles.summaryText}>• Total Biaya: {formatPrice(activeService.price)}</Text>
              </View>
            ) : null}
          </ScrollView>

          {/* Footer Submit Button */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.disabledBtn]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Sparkles size={16} color={COLORS.rosegold} />
                  <Text style={styles.submitBtnText}>Konfirmasi & Buat Order</Text>
                </>
              )}
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.cream,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    paddingBottom: 20,
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
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.emerald,
  },
  closeBtn: {
    padding: 4,
  },
  formScroll: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    borderColor: '#F87171',
    borderWidth: 1,
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  errorText: {
    color: '#991B1B',
    fontSize: 12,
    fontWeight: '600',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.greyText,
    letterSpacing: 1,
    marginBottom: 6,
    marginTop: 10,
  },
  selectedOutletBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.emeraldLight,
    borderWidth: 1,
    borderColor: COLORS.emerald,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    marginBottom: 8,
  },
  selectedOutletBannerName: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.emerald,
  },
  selectedOutletBannerAddress: {
    fontSize: 10,
    color: COLORS.greyText,
  },
  autoTag: {
    backgroundColor: COLORS.emerald,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  autoTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.white,
  },
  horizontalScroll: {
    marginBottom: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.greyBorder,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: COLORS.emerald,
    borderColor: COLORS.emerald,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.slateDark,
  },
  chipTextActive: {
    color: COLORS.white,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.greyBorder,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 6,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.slateDark,
    paddingVertical: 8,
  },
  datePillScroll: {
    marginBottom: 8,
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.greyBorder,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    marginRight: 8,
  },
  datePillActive: {
    backgroundColor: COLORS.emerald,
    borderColor: COLORS.emerald,
  },
  datePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.emerald,
  },
  datePillTextActive: {
    color: COLORS.white,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  timeSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.greyBorder,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  timeSlotActive: {
    backgroundColor: COLORS.emerald,
    borderColor: COLORS.emerald,
  },
  timeText: {
    fontSize: 12,
    color: COLORS.slateDark,
    fontWeight: '600',
  },
  timeTextActive: {
    color: COLORS.white,
  },
  summaryCard: {
    backgroundColor: COLORS.emeraldLight,
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.emerald,
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 11,
    color: COLORS.emeraldDark,
    marginVertical: 1,
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  submitBtn: {
    backgroundColor: COLORS.emerald,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    ...SHADOWS.medium,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
