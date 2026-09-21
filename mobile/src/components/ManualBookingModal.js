import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { X, Sparkles, User, Phone, MapPin, Calendar, Clock, FileText } from 'lucide-react-native';
import { COLORS, SHADOWS } from '../constants/theme';
import { createManualBooking } from '../services/api';

const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
];

export default function ManualBookingModal({ visible, onClose, outlets, services, onSaved }) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedOutletId, setSelectedOutletId] = useState(outlets?.[0]?.id || '');
  const [selectedServiceId, setSelectedServiceId] = useState(services?.[0]?.id || '');
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingTime, setBookingTime] = useState('10:00');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      setError('Nama & Nomor WhatsApp pelanggan wajib diisi.');
      return;
    }

    if (!selectedOutletId || !selectedServiceId) {
      setError('Pilih cabang outlet dan layanan salon.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const payload = {
        outlet_id: selectedOutletId,
        service_id: selectedServiceId,
        customer_name: customerName,
        customer_phone: customerPhone,
        booking_date: bookingDate,
        booking_time: bookingTime,
        notes,
      };

      const res = await createManualBooking(payload);
      if (res.success) {
        onClose();
        if (onSaved) onSaved();

        // Reset form
        setCustomerName('');
        setCustomerPhone('');
        setNotes('');
      } else {
        setError(res.message || 'Gagal membuat manual booking.');
      }
    } catch (err) {
      console.error('Manual booking error:', err);
      setError(err.response?.data?.message || 'Gagal membuat booking manual.');
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

  const activeService = services?.find((s) => s.id === selectedServiceId);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Sparkles size={18} color={COLORS.rosegold} />
              <Text style={styles.title}>Tambah Booking Manual (Staff)</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <X size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {error ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            ) : null}

            <Text style={styles.label}>NAMA PELANGGAN</Text>
            <View style={styles.inputBox}>
              <User size={16} color={COLORS.greyText} />
              <TextInput
                style={styles.textInput}
                placeholder="Masukkan Nama Pelanggan"
                value={customerName}
                onChangeText={setCustomerName}
              />
            </View>

            <Text style={styles.label}>NOMOR WHATSAPP</Text>
            <View style={styles.inputBox}>
              <Phone size={16} color={COLORS.greyText} />
              <TextInput
                style={styles.textInput}
                placeholder="08123456789"
                keyboardType="phone-pad"
                value={customerPhone}
                onChangeText={setCustomerPhone}
              />
            </View>

            <Text style={styles.label}>PILIH CABANG OUTLET</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll}>
              {outlets?.map((ot) => (
                <TouchableOpacity
                  key={ot.id}
                  style={[styles.chip, selectedOutletId === ot.id && styles.chipActive]}
                  onPress={() => setSelectedOutletId(ot.id)}
                >
                  <MapPin size={12} color={selectedOutletId === ot.id ? COLORS.white : COLORS.emerald} />
                  <Text style={[styles.chipText, selectedOutletId === ot.id && styles.chipTextActive]}>
                    {ot.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>PILIH LAYANAN SALON</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll}>
              {services?.map((sv) => (
                <TouchableOpacity
                  key={sv.id}
                  style={[styles.chip, selectedServiceId === sv.id && styles.chipActive]}
                  onPress={() => setSelectedServiceId(sv.id)}
                >
                  <Text style={[styles.chipText, selectedServiceId === sv.id && styles.chipTextActive]}>
                    {sv.name} ({formatPrice(sv.price)})
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>TANGGAL RESERVASI (YYYY-MM-DD)</Text>
            <View style={styles.inputBox}>
              <Calendar size={16} color={COLORS.greyText} />
              <TextInput
                style={styles.textInput}
                placeholder="2026-09-25"
                value={bookingDate}
                onChangeText={setBookingDate}
              />
            </View>

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

            <Text style={styles.label}>CATATAN KASIR / STAFF</Text>
            <View style={[styles.inputBox, { height: 60 }]}>
              <TextInput
                style={[styles.textInput, { textAlignVertical: 'top' }]}
                placeholder="Catatan tambahan booking..."
                multiline
                value={notes}
                onChangeText={setNotes}
              />
            </View>

            {activeService ? (
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Total Biaya Layanan:</Text>
                <Text style={styles.summaryValue}>{formatPrice(activeService.price)}</Text>
              </View>
            ) : null}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.disabledBtn]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.submitBtnText}>Simpan Booking Manual</Text>
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
  card: {
    backgroundColor: COLORS.cream,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  header: {
    backgroundColor: COLORS.emerald,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.white,
  },
  body: {
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
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.greyText,
    letterSpacing: 1,
    marginBottom: 6,
    marginTop: 10,
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
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.slateDark,
    paddingVertical: 6,
  },
  hScroll: {
    marginBottom: 4,
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
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
    marginTop: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.emerald,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.emerald,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.greyBorder,
  },
  submitBtn: {
    backgroundColor: COLORS.emerald,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
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
