import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { CreditCard, Phone, Clock, Save, CheckCircle, Settings, Share2 } from 'lucide-react-native';
import { COLORS, SHADOWS } from '../constants/theme';
import { getConfigs, updateConfigs } from '../services/api';

export default function AdminPaymentConfig() {
  const [bankName, setBankName] = useState('Bank BCA a/n Luxe Salon');
  const [accountNumber, setAccountNumber] = useState('8830192847');
  const [whatsappNumber, setWhatsappNumber] = useState('6281234567890');
  const [deadlineMinutes, setDeadlineMinutes] = useState('60');

  // Socials
  const [instagram, setInstagram] = useState('https://instagram.com');
  const [twitter, setTwitter] = useState('https://twitter.com');
  const [youtube, setYoutube] = useState('https://youtube.com');
  const [facebook, setFacebook] = useState('https://facebook.com');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const res = await getConfigs();
      if (res.success && res.configs) {
        const c = res.configs;
        setBankName(c.payment_bank_name || 'Bank BCA a/n Luxe Salon');
        setAccountNumber(c.payment_account_number || '8830192847');
        setWhatsappNumber(c.whatsapp_number || '6281234567890');
        setDeadlineMinutes(String(c.payment_deadline_offset_minutes || 60));
        setInstagram(c.social_instagram || '');
        setTwitter(c.social_twitter || '');
        setYoutube(c.social_youtube || '');
        setFacebook(c.social_facebook || '');
      }
    } catch (err) {
      console.error('Error fetching payment config:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setMessage('');
    setError('');
    setSaving(true);

    try {
      const payload = {
        payment_bank_name: bankName,
        payment_account_number: accountNumber,
        whatsapp_number: whatsappNumber,
        payment_deadline_offset_minutes: Number(deadlineMinutes),
        social_instagram: instagram,
        social_twitter: twitter,
        social_youtube: youtube,
        social_facebook: facebook,
      };

      const res = await updateConfigs(payload);
      if (res.success) {
        setMessage('Semua konfigurasi pembayaran berhasil diperbarui!');
        fetchConfigs();
      } else {
        setError(res.message || 'Gagal menyimpan konfigurasi.');
      }
    } catch (err) {
      console.error('Save config error:', err);
      setError(err.response?.data?.message || 'Gagal memperbarui konfigurasi.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator size="small" color={COLORS.emerald} />
        <Text style={styles.loadingText}>Memuat konfigurasi...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.topTitle}>KONFIGURASI PEMBAYARAN & SISTEM</Text>
          <Text style={styles.topSub}>Atur no rekening bank, WA admin, & batas waktu bayar</Text>
        </View>
      </View>

      {message ? (
        <View style={styles.successBanner}>
          <CheckCircle size={16} color="#047857" />
          <Text style={styles.successText}>{message}</Text>
        </View>
      ) : null}

      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      ) : null}

      {/* Section 1: Bank Transfer */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <CreditCard size={18} color={COLORS.emerald} />
          <Text style={styles.sectionTitle}>1. Rekening Bank Transfer</Text>
        </View>

        <Text style={styles.inputLabel}>NAMA BANK & ATAS NAMA</Text>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.textInput}
            placeholder="Bank BCA a/n Luxe Salon"
            value={bankName}
            onChangeText={setBankName}
          />
        </View>

        <Text style={styles.inputLabel}>NOMOR REKENING</Text>
        <View style={styles.inputBox}>
          <TextInput
            style={[styles.textInput, { fontWeight: '800' }]}
            placeholder="8830192847"
            value={accountNumber}
            onChangeText={setAccountNumber}
          />
        </View>
      </View>

      {/* Section 2: WhatsApp & Deadline */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Phone size={18} color={COLORS.emerald} />
          <Text style={styles.sectionTitle}>2. WhatsApp & Batas Waktu Bayar</Text>
        </View>

        <Text style={styles.inputLabel}>NOMOR WHATSAPP ADMIN (FORMAT 62...)</Text>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.textInput}
            placeholder="6281234567890"
            keyboardType="phone-pad"
            value={whatsappNumber}
            onChangeText={setWhatsappNumber}
          />
        </View>

        <Text style={styles.inputLabel}>OFFSET BATAS BAYAR (MENIT)</Text>
        <View style={styles.inputBox}>
          <TextInput
            style={[styles.textInput, { fontWeight: '800' }]}
            placeholder="60"
            keyboardType="numeric"
            value={deadlineMinutes}
            onChangeText={setDeadlineMinutes}
          />
        </View>
        <Text style={styles.hintText}>
          Contoh: Booking jam 12:00 + offset 60 menit ➔ Batas bayar jam 13:00.
        </Text>
      </View>

      {/* Section 3: Social Links */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Share2 size={18} color={COLORS.emerald} />
          <Text style={styles.sectionTitle}>3. Tautan Media Sosial Footer</Text>
        </View>

        <Text style={styles.inputLabel}>URL INSTAGRAM</Text>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.textInput}
            placeholder="https://instagram.com/luxesalon"
            value={instagram}
            onChangeText={setInstagram}
          />
        </View>

        <Text style={styles.inputLabel}>URL TWITTER / X</Text>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.textInput}
            placeholder="https://twitter.com/luxesalon"
            value={twitter}
            onChangeText={setTwitter}
          />
        </View>

        <Text style={styles.inputLabel}>URL YOUTUBE</Text>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.textInput}
            placeholder="https://youtube.com/@luxesalon"
            value={youtube}
            onChangeText={setYoutube}
          />
        </View>

        <Text style={styles.inputLabel}>URL FACEBOOK</Text>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.textInput}
            placeholder="https://facebook.com/luxesalon"
            value={facebook}
            onChangeText={setFacebook}
          />
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveBtn, saving && styles.disabledBtn]}
        onPress={handleSave}
        disabled={saving}
        activeOpacity={0.8}
      >
        {saving ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <>
            <Save size={18} color={COLORS.rosegold} />
            <Text style={styles.saveBtnText}>Simpan Semua Konfigurasi</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 30,
  },
  loadingBox: {
    padding: 30,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: COLORS.greyText,
  },
  topHeader: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.greyBorder,
    ...SHADOWS.small,
  },
  topTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.emerald,
    letterSpacing: 1,
  },
  topSub: {
    fontSize: 10,
    color: COLORS.greyText,
    marginTop: 2,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#D1FAE5',
    borderColor: '#34D399',
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  successText: {
    color: '#047857',
    fontSize: 12,
    fontWeight: '700',
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    borderColor: '#F87171',
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  errorText: {
    color: '#991B1B',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.greyBorder,
    ...SHADOWS.small,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.greyBorder,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.slateDark,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.greyText,
    letterSpacing: 1,
    marginBottom: 4,
    marginTop: 8,
  },
  inputBox: {
    backgroundColor: COLORS.creamDark,
    borderWidth: 1,
    borderColor: COLORS.greyBorder,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  textInput: {
    fontSize: 13,
    color: COLORS.slateDark,
    paddingVertical: 6,
  },
  hintText: {
    fontSize: 10,
    color: COLORS.greyText,
    marginTop: 4,
  },
  saveBtn: {
    backgroundColor: COLORS.emerald,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    marginBottom: 40,
    ...SHADOWS.medium,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
  },
});
