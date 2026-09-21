import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Linking,
  Image,
  Platform,
} from 'react-native';
import {
  X,
  Search,
  Phone,
  Hash,
  AlertCircle,
  MessageCircle,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Plus,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SHADOWS } from '../constants/theme';
import { checkBookingStatus, uploadPaymentProof, API_BASE_URL } from '../services/api';

const SERVER_ROOT = API_BASE_URL.replace(/\/api\/?$/, '');

export default function CheckStatusModal({ visible, onClose }) {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [configs, setConfigs] = useState(null);
  const [error, setError] = useState('');

  // Local selected images per booking ID
  const [cardFiles, setCardFiles] = useState({});
  const [uploadingBookingId, setUploadingBookingId] = useState(null);
  const [uploadMsg, setUploadMsg] = useState({});

  const handleSearch = async () => {
    if (!phone.trim() && !code.trim()) {
      setError('Masukkan Nomor WhatsApp atau Kode Booking untuk mencari.');
      return;
    }

    setError('');
    setBookings([]);
    setLoading(true);
    setSearched(true);

    try {
      const res = await checkBookingStatus(phone.trim(), code.trim());
      if (res.success) {
        setBookings(res.bookings || []);
        setConfigs(res.payment_configs || null);
        if (!res.bookings || res.bookings.length === 0) {
          setError('Data booking tidak ditemukan. Periksa kembali Nomor WA atau Kode Booking.');
        }
      } else {
        setError(res.message || 'Gagal mengecek status.');
      }
    } catch (err) {
      console.error('Check status error:', err);
      setError(err.response?.data?.message || 'Gagal mengecek status booking.');
    } finally {
      setLoading(false);
    }
  };

  const handlePickImages = async (bookingId) => {
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Izin akses galeri dibutuhkan untuk mengunggah bukti pembayaran.');
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setCardFiles((prev) => ({
          ...prev,
          [bookingId]: [...(prev[bookingId] || []), ...result.assets],
        }));
      }
    } catch (err) {
      console.error('Pick image error:', err);
    }
  };

  const removeSelectedAsset = (bookingId, index) => {
    setCardFiles((prev) => {
      const current = prev[bookingId] || [];
      const updated = current.filter((_, i) => i !== index);
      return { ...prev, [bookingId]: updated };
    });
  };

  const handleUploadProof = async (bookingCode, bookingId) => {
    const selectedAssets = cardFiles[bookingId];
    if (!selectedAssets || selectedAssets.length === 0) return;

    try {
      setUploadingBookingId(bookingId);
      setUploadMsg((prev) => ({ ...prev, [bookingId]: '' }));

      const formData = new FormData();
      formData.append('booking_code', bookingCode);

      selectedAssets.forEach((asset, idx) => {
        if (Platform.OS === 'web' && asset.file) {
          formData.append('payment_proof', asset.file);
        } else {
          const fileType = asset.mimeType || asset.type || 'image/jpeg';
          const fileName = asset.fileName || `proof_${bookingId}_${idx}.jpg`;
          formData.append('payment_proof', {
            uri: asset.uri,
            name: fileName,
            type: fileType,
          });
        }
      });

      const res = await uploadPaymentProof(formData);
      if (res.success) {
        setUploadMsg((prev) => ({
          ...prev,
          [bookingId]: '✅ Bukti transfer berhasil diunggah! Menunggu konfirmasi admin.',
        }));
        setCardFiles((prev) => ({ ...prev, [bookingId]: [] }));
        handleSearch();
      } else {
        setUploadMsg((prev) => ({
          ...prev,
          [bookingId]: res.message || 'Gagal mengunggah bukti.',
        }));
      }
    } catch (err) {
      console.error('Upload proof error:', err);
      setUploadMsg((prev) => ({
        ...prev,
        [bookingId]: err.response?.data?.message || 'Gagal mengunggah bukti pembayaran.',
      }));
    } finally {
      setUploadingBookingId(null);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  const getStatusBadge = (status) => {
    const config = COLORS.status[status] || { bg: '#E2E8F0', text: '#475569', label: status };
    return (
      <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
        <Text style={[styles.statusBadgeText, { color: config.text }]}>{config.label}</Text>
      </View>
    );
  };

  const getImgUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${SERVER_ROOT}${cleanPath}`;
  };

  const openWhatsApp = (item) => {
    const waNumber = configs?.whatsapp_number || '6281234567890';
    const msg = encodeURIComponent(
      `Halo Admin Salon, saya ingin konfirmasi/tanya mengenai booking kode #${item.booking_code} a/n ${item.customer_name}`
    );
    Linking.openURL(`https://wa.me/${waNumber}?text=${msg}`).catch((err) =>
      console.error('Error opening WA:', err)
    );
  };

  const qrisUrl = configs?.payment_qris_image ? getImgUrl(configs.payment_qris_image) : null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Search size={18} color={COLORS.emerald} />
              <Text style={styles.title}>Cek Status Reservasi</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={COLORS.greyText} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {error ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            ) : null}

            <Text style={styles.label}>NOMOR WHATSAPP</Text>
            <View style={styles.inputBox}>
              <Phone size={16} color={COLORS.greyText} />
              <TextInput
                style={styles.textInput}
                placeholder="Contoh: 08123456789"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={(val) => setPhone(val.replace(/\D/g, ''))}
              />
            </View>

            <Text style={styles.label}>KODE BOOKING (OPSIONAL JIKA SUDAH ISI WA)</Text>
            <View style={styles.inputBox}>
              <Hash size={16} color={COLORS.greyText} />
              <TextInput
                style={styles.textInput}
                placeholder="Contoh: SLN-9X8Y7"
                value={code}
                onChangeText={setCode}
                autoCapitalize="characters"
              />
            </View>

            <TouchableOpacity
              style={[styles.searchBtn, loading && styles.disabledBtn]}
              onPress={handleSearch}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Search size={16} color={COLORS.white} />
                  <Text style={styles.searchBtnText}>Cari Status Reservasi</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Results section */}
            {searched && bookings.length === 0 && !loading && !error ? (
              <View style={styles.emptyState}>
                <AlertCircle size={36} color={COLORS.rosegold} />
                <Text style={styles.emptyText}>Tidak ada booking yang ditemukan dengan data tersebut.</Text>
                <Text style={styles.emptySubtext}>Pastikan Nomor WhatsApp atau Kode Booking telah sesuai.</Text>
              </View>
            ) : null}

            {bookings.map((item) => {
              const selectedImages = cardFiles[item.id] || [];
              const isUploadingThis = uploadingBookingId === item.id;
              const proofList = item.proofs && item.proofs.length > 0 ? item.proofs : (item.payment_proof ? [item.payment_proof] : []);

              return (
                <View key={item.id} style={styles.resultCard}>
                  <View style={styles.resultHeader}>
                    <View>
                      <Text style={styles.resultCodeLabel}>KODE BOOKING</Text>
                      <Text style={styles.resultCode}>{item.booking_code}</Text>
                    </View>
                    {getStatusBadge(item.status)}
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.row}>
                    <Text style={styles.rowLabel}>Layanan:</Text>
                    <Text style={styles.rowVal}>{item.service_name}</Text>
                  </View>

                  {item.outlet_name ? (
                    <View style={styles.row}>
                      <Text style={styles.rowLabel}>Cabang Outlet:</Text>
                      <Text style={[styles.rowVal, { color: COLORS.emerald, fontWeight: '700' }]}>
                        📍 {item.outlet_name}
                      </Text>
                    </View>
                  ) : null}

                  <View style={styles.row}>
                    <Text style={styles.rowLabel}>Nama Pemesan:</Text>
                    <Text style={styles.rowVal}>{item.customer_name}</Text>
                  </View>

                  <View style={styles.row}>
                    <Text style={styles.rowLabel}>No. WhatsApp:</Text>
                    <Text style={styles.rowVal}>{item.customer_phone}</Text>
                  </View>

                  <View style={styles.row}>
                    <Text style={styles.rowLabel}>Tanggal & Jam:</Text>
                    <Text style={styles.rowVal}>
                      {item.booking_date} @ {item.booking_time}
                    </Text>
                  </View>

                  <View style={styles.row}>
                    <Text style={styles.rowLabel}>Total Biaya:</Text>
                    <Text style={[styles.rowVal, { color: COLORS.emerald, fontWeight: '900', fontSize: 13 }]}>
                      {formatPrice(item.total_price || item.service_price)}
                    </Text>
                  </View>

                  {/* Payment Info & Image Upload Section for Pending Bookings */}
                  {item.status === 'Pending' ? (
                    <View style={styles.paymentInfoBox}>
                      <Text style={styles.paymentInfoTitle}>💳 Info Pembayaran Transfer & QRIS</Text>

                      {/* QRIS Image Preview */}
                      {qrisUrl ? (
                        <View style={styles.qrisCard}>
                          <Image source={{ uri: qrisUrl }} style={styles.qrisImage} resizeMode="contain" />
                          <Text style={styles.qrisLabel}>📱 Scan QRIS Pembayaran (BCA/Gopay/OVO/ShopeePay)</Text>
                        </View>
                      ) : null}

                      <View style={styles.bankDetailContainer}>
                        <Text style={styles.paymentInfoText}>
                          Bank: <Text style={{ fontWeight: '800' }}>{configs?.payment_bank_name || 'Bank Central Asia (BCA)'}</Text>
                        </Text>
                        <Text style={styles.paymentInfoText}>
                          No. Rekening: <Text style={{ fontWeight: '900', color: COLORS.emerald }}>{configs?.payment_account_number || '8830192847'}</Text>
                        </Text>
                      </View>

                      {/* Local File Picker & Upload Section */}
                      <View style={styles.uploadSection}>
                        <Text style={styles.uploadTitle}>📸 Upload / Tambah Bukti Transfer dari HP:</Text>

                        <TouchableOpacity
                          style={styles.pickImageBtn}
                          onPress={() => handlePickImages(item.id)}
                          activeOpacity={0.8}
                        >
                          <Plus size={16} color={COLORS.emerald} />
                          <Text style={styles.pickImageBtnText}>Pilih Foto Bukti dari Galeri</Text>
                        </TouchableOpacity>

                        {/* Selected Images Preview Thumbnails */}
                        {selectedImages.length > 0 ? (
                          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.previewScroll}>
                            {selectedImages.map((asset, idx) => (
                              <View key={idx} style={styles.previewThumbBox}>
                                <Image source={{ uri: asset.uri }} style={styles.previewThumb} />
                                <TouchableOpacity
                                  style={styles.removeThumbBtn}
                                  onPress={() => removeSelectedAsset(item.id, idx)}
                                >
                                  <X size={10} color={COLORS.white} />
                                </TouchableOpacity>
                              </View>
                            ))}
                          </ScrollView>
                        ) : null}

                        {uploadMsg[item.id] ? (
                          <Text style={styles.uploadMsgText}>{uploadMsg[item.id]}</Text>
                        ) : null}

                        <TouchableOpacity
                          style={[
                            styles.uploadSubmitBtn,
                            (selectedImages.length === 0 || isUploadingThis) && styles.disabledBtn,
                          ]}
                          onPress={() => handleUploadProof(item.booking_code, item.id)}
                          disabled={selectedImages.length === 0 || isUploadingThis}
                          activeOpacity={0.8}
                        >
                          {isUploadingThis ? (
                            <ActivityIndicator color={COLORS.white} size="small" />
                          ) : (
                            <>
                              <Upload size={14} color={COLORS.white} />
                              <Text style={styles.uploadSubmitBtnText}>
                                {selectedImages.length > 0
                                  ? `Unggah ${selectedImages.length} Foto Bukti Transfer`
                                  : 'Unggah Bukti Transfer'}
                              </Text>
                            </>
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : null}

                  {/* Uploaded Proof Gallery if exists */}
                  {proofList.length > 0 ? (
                    <View style={styles.proofGalleryBox}>
                      <View style={styles.proofGalleryHeader}>
                        <ImageIcon size={14} color={COLORS.emerald} />
                        <Text style={styles.proofGalleryTitle}>
                          📎 Bukti Transfer Terupload ({proofList.length})
                        </Text>
                      </View>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.proofGalleryScroll}>
                        {proofList.map((path, pIdx) => {
                          const imgUri = getImgUrl(path);
                          return (
                            <TouchableOpacity
                              key={pIdx}
                              style={styles.galleryThumbCard}
                              onPress={() => imgUri && Linking.openURL(imgUri)}
                            >
                              <Image source={{ uri: imgUri }} style={styles.galleryThumbImg} />
                              <Text style={styles.galleryThumbTag}>Bukti #{pIdx + 1}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                    </View>
                  ) : null}

                  {/* WA Contact Admin */}
                  <TouchableOpacity
                    style={styles.waContactBtn}
                    onPress={() => openWhatsApp(item)}
                    activeOpacity={0.8}
                  >
                    <MessageCircle size={14} color={COLORS.white} />
                    <Text style={styles.waContactText}>Chat Admin WA Konfirmasi</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
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
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: COLORS.cream,
    borderRadius: 24,
    maxHeight: '90%',
    paddingBottom: 20,
    ...SHADOWS.medium,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.greyBorder,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.emerald,
  },
  closeBtn: {
    padding: 4,
  },
  content: {
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
    marginTop: 6,
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
    marginBottom: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.slateDark,
    paddingVertical: 8,
  },
  searchBtn: {
    backgroundColor: COLORS.emerald,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 6,
    marginBottom: 16,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  searchBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 6,
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.slateDark,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 11,
    color: COLORS.greyText,
    textAlign: 'center',
  },
  resultCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.greyBorder,
    padding: 14,
    marginBottom: 14,
    ...SHADOWS.small,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultCodeLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.greyText,
    letterSpacing: 1,
  },
  resultCode: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.emerald,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.greyBorder,
    marginVertical: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  rowLabel: {
    fontSize: 11,
    color: COLORS.greyText,
  },
  rowVal: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.slateDark,
  },
  paymentInfoBox: {
    backgroundColor: COLORS.emeraldLight,
    padding: 12,
    borderRadius: 14,
    marginTop: 10,
    marginBottom: 6,
  },
  paymentInfoTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.emerald,
    marginBottom: 8,
  },
  qrisCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.greyBorder,
  },
  qrisImage: {
    width: 140,
    height: 140,
    borderRadius: 8,
  },
  qrisLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.greyText,
    marginTop: 6,
    textAlign: 'center',
  },
  bankDetailContainer: {
    gap: 2,
    marginTop: 4,
    marginBottom: 10,
  },
  paymentInfoText: {
    fontSize: 11,
    color: COLORS.emeraldDark,
  },
  uploadSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(31, 78, 61, 0.15)',
    paddingTop: 10,
    marginTop: 6,
    gap: 8,
  },
  uploadTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.emerald,
  },
  pickImageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.emerald,
    paddingVertical: 8,
    borderRadius: 10,
  },
  pickImageBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.emerald,
  },
  previewScroll: {
    marginVertical: 4,
  },
  previewThumbBox: {
    position: 'relative',
    marginRight: 8,
  },
  previewThumb: {
    width: 54,
    height: 54,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.greyBorder,
  },
  removeThumbBtn: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    padding: 2,
  },
  uploadMsgText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.emerald,
    marginVertical: 2,
  },
  uploadSubmitBtn: {
    backgroundColor: COLORS.rosegold,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  uploadSubmitBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  proofGalleryBox: {
    backgroundColor: COLORS.cream,
    borderRadius: 12,
    padding: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.greyBorder,
  },
  proofGalleryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  proofGalleryTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.emerald,
  },
  proofGalleryScroll: {
    flexDirection: 'row',
  },
  galleryThumbCard: {
    marginRight: 8,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.greyBorder,
    backgroundColor: COLORS.white,
  },
  galleryThumbImg: {
    width: 60,
    height: 60,
  },
  galleryThumbTag: {
    fontSize: 8,
    fontWeight: '700',
    color: COLORS.slateDark,
    textAlign: 'center',
    paddingVertical: 2,
    backgroundColor: COLORS.cream,
  },
  waContactBtn: {
    backgroundColor: '#25D366',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 10,
  },
  waContactText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },
});
