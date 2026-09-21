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
  Platform,
  Linking,
  Modal,
  Image,
} from 'react-native';
import {
  CreditCard,
  DollarSign,
  Calendar,
  Search,
  Trash2,
  CheckCircle,
  Eye,
  MessageCircle,
  MapPin,
  FileText,
  X,
  TrendingUp,
  Printer,
} from 'lucide-react-native';
import { COLORS, SHADOWS } from '../constants/theme';
import { getAllBookings, deleteBooking, getConfigs, API_BASE_URL } from '../services/api';
import ThermalReceiptModal from './ThermalReceiptModal';

const SERVER_ROOT = API_BASE_URL.replace(/\/api\/?$/, '');

export default function AdminPaymentManager() {
  const [completedBookings, setCompletedBookings] = useState([]);
  const [configs, setConfigs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Proof gallery modal & Receipt modal
  const [selectedProofs, setSelectedProofs] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchCompletedPayments();
  }, []);

  const fetchCompletedPayments = async () => {
    try {
      setLoading(true);
      const [bookingsRes, configsRes] = await Promise.all([
        getAllBookings('Completed', '', null),
        getConfigs(),
      ]);

      if (bookingsRes.success) setCompletedBookings(bookingsRes.bookings || []);
      if (configsRes.success) setConfigs(configsRes.configs || null);
    } catch (err) {
      console.error('Error fetching completed payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const getImgUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${SERVER_ROOT}${cleanPath}`;
  };

  const handleDelete = (payment) => {
    const doDelete = async () => {
      try {
        setDeletingId(payment.id);
        const res = await deleteBooking(payment.id);
        if (res.success) fetchCompletedPayments();
      } catch (err) {
        Alert.alert('Error', err.response?.data?.message || 'Gagal menghapus pembayaran.');
      } finally {
        setDeletingId(null);
      }
    };

    const confirmMsg = `Hapus catatan pembayaran #${payment.booking_code}?`;
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(confirmMsg)) {
        doDelete();
      }
    } else {
      Alert.alert('Konfirmasi Hapus', confirmMsg, [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  const openWhatsApp = (phone, bookingCode) => {
    if (!phone) return;
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) cleaned = '62' + cleaned.slice(1);

    const msg = encodeURIComponent(`Halo, mengenai bukti pembayaran nota Kode Booking ${bookingCode}...`);
    Linking.openURL(`https://wa.me/${cleaned}?text=${msg}`).catch((err) =>
      console.error('Error WA:', err)
    );
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  // Calculations
  const totalRevenue = completedBookings.reduce(
    (sum, b) => sum + Number(b.total_price || b.service_price || 0),
    0
  );
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRevenue = completedBookings
    .filter((b) => b.booking_date === todayStr)
    .reduce((sum, b) => sum + Number(b.total_price || b.service_price || 0), 0);

  const filteredPayments = completedBookings.filter((b) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      b.booking_code?.toLowerCase().includes(q) ||
      b.customer_name?.toLowerCase().includes(q) ||
      b.customer_phone?.toLowerCase().includes(q) ||
      b.outlet_name?.toLowerCase().includes(q)
    );
  });

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.topTitle}>KELOLA PEMBAYARAN & OMSET (PAYMENTS)</Text>
          <Text style={styles.topSub}>Pantau riwayat transaksi lunas, total omset, & cetak nota</Text>
        </View>

        <TouchableOpacity style={styles.refreshBtn} onPress={fetchCompletedPayments} activeOpacity={0.8}>
          <Text style={styles.refreshBtnText}>🔄 Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* Revenue Stat Cards */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { borderLeftColor: COLORS.emerald }]}>
          <View style={styles.statIconBadge}>
            <DollarSign size={16} color={COLORS.emerald} />
          </View>
          <Text style={styles.statNumber}>{formatPrice(totalRevenue)}</Text>
          <Text style={styles.statLabel}>Total Omset ({completedBookings.length} Lunas)</Text>
        </View>

        <View style={[styles.statCard, { borderLeftColor: COLORS.rosegold }]}>
          <View style={styles.statIconBadge}>
            <TrendingUp size={16} color={COLORS.rosegold} />
          </View>
          <Text style={styles.statNumber}>{formatPrice(todayRevenue)}</Text>
          <Text style={styles.statLabel}>Omset Hari Ini ({todayStr})</Text>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchBox}>
        <Search size={14} color={COLORS.greyText} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari Nota, Customer, Phone, atau Outlet..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      {/* Payments List */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color={COLORS.emerald} />
          <Text style={styles.loadingText}>Memuat transaksi lunas...</Text>
        </View>
      ) : filteredPayments.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Belum ada riwayat transaksi lunas.</Text>
        </View>
      ) : (
        filteredPayments.map((item) => {
          let proofs = [];
          if (Array.isArray(item.proofs) && item.proofs.length > 0) {
            proofs = item.proofs;
          } else if (item.payment_proof) {
            try {
              if (typeof item.payment_proof === 'string' && item.payment_proof.startsWith('[')) {
                proofs = JSON.parse(item.payment_proof);
              } else if (Array.isArray(item.payment_proof)) {
                proofs = item.payment_proof;
              } else {
                proofs = [item.payment_proof];
              }
            } catch (e) {
              proofs = [item.payment_proof];
            }
          }

          return (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.codeText}>{item.booking_code}</Text>
                  <Text style={styles.dateText}>
                    {item.booking_date} @ {item.booking_time}
                  </Text>
                </View>
                <View style={styles.lunasBadge}>
                  <CheckCircle size={12} color="#047857" />
                  <Text style={styles.lunasText}>LUNAS</Text>
                </View>
              </View>

              <Text style={styles.customerName}>👤 {item.customer_name}</Text>
              <Text style={styles.serviceTitle}>💇‍♀️ {item.service_name}</Text>

              <View style={styles.metaRow}>
                <MapPin size={12} color={COLORS.greyText} />
                <Text style={styles.metaText}>{item.outlet_name || 'Semua Outlet'}</Text>
              </View>

              <View style={styles.priceRow}>
                <Text style={styles.priceText}>{formatPrice(item.total_price)}</Text>

                <TouchableOpacity
                  style={styles.waBtn}
                  onPress={() => openWhatsApp(item.customer_phone, item.booking_code)}
                  activeOpacity={0.8}
                >
                  <MessageCircle size={14} color={COLORS.white} />
                  <Text style={styles.waBtnText}>Chat WA</Text>
                </TouchableOpacity>
              </View>

              {/* Proof thumbnail badge & preview gallery */}
              {proofs.length > 0 ? (
                <View style={styles.proofBoxContainer}>
                  <TouchableOpacity
                    style={styles.proofBadge}
                    onPress={() => setSelectedProofs(proofs)}
                    activeOpacity={0.8}
                  >
                    <Eye size={14} color={COLORS.emerald} />
                    <Text style={styles.proofText}>Lihat Bukti Bayar ({proofs.length})</Text>
                  </TouchableOpacity>

                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.proofThumbScroll}>
                    {proofs.map((p, pIdx) => {
                      const imgUri = getImgUrl(p);
                      return (
                        <TouchableOpacity key={pIdx} onPress={() => setSelectedProofs(proofs)}>
                          <Image source={{ uri: imgUri }} style={styles.cardProofThumb} resizeMode="cover" />
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              ) : null}

              {/* Card Footer: Print Receipt & Delete Actions */}
              <View style={styles.cardFooter}>
                <TouchableOpacity
                  style={styles.printBtn}
                  onPress={() => setSelectedReceipt(item)}
                  activeOpacity={0.8}
                >
                  <Printer size={14} color={COLORS.white} />
                  <Text style={styles.printBtnText}>Cetak Struk Nota (EPOS)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.trashBtn}
                  onPress={() => handleDelete(item)}
                  disabled={deletingId === item.id}
                  activeOpacity={0.7}
                >
                  <Trash2 size={14} color="#B91C1C" />
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      )}

      {/* Thermal Receipt Print Modal */}
      <ThermalReceiptModal
        visible={Boolean(selectedReceipt)}
        onClose={() => setSelectedReceipt(null)}
        transaction={selectedReceipt}
        configs={configs}
      />

      {/* Proof Gallery Modal */}
      {selectedProofs && selectedProofs.length > 0 && (
        <Modal visible animationType="fade" transparent>
          <View style={styles.galleryOverlay}>
            <View style={styles.galleryCard}>
              <View style={styles.galleryHeader}>
                <Text style={styles.galleryTitle}>
                  Bukti Pembayaran Terupload ({selectedProofs.length})
                </Text>
                <TouchableOpacity onPress={() => setSelectedProofs(null)}>
                  <X size={20} color={COLORS.slateDark} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.galleryBody}>
                {selectedProofs.map((path, idx) => {
                  const fullUri = getImgUrl(path);
                  return (
                    <View key={idx} style={styles.galleryImgContainer}>
                      <Text style={styles.galleryImgLabel}>Bukti #{idx + 1}</Text>
                      <Image source={{ uri: fullUri }} style={styles.galleryImg} resizeMode="contain" />
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  refreshBtn: {
    backgroundColor: COLORS.emeraldLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  refreshBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.emerald,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: COLORS.greyBorder,
    ...SHADOWS.small,
  },
  statIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.emeraldLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  statNumber: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.slateDark,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.greyText,
    marginTop: 2,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.greyBorder,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: COLORS.slateDark,
    paddingVertical: 6,
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
  emptyBox: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.greyBorder,
  },
  emptyText: {
    fontSize: 12,
    color: COLORS.greyText,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.greyBorder,
    ...SHADOWS.small,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  codeText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.slateDark,
  },
  dateText: {
    fontSize: 10,
    color: COLORS.greyText,
  },
  lunasBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  lunasText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#047857',
  },
  customerName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.emerald,
    marginBottom: 2,
  },
  serviceTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.slateDark,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  metaText: {
    fontSize: 10,
    color: COLORS.greyText,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.greyBorder,
    paddingTop: 8,
    marginBottom: 8,
  },
  priceText: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.emerald,
  },
  waBtn: {
    backgroundColor: '#25D366',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  waBtnText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },
  proofBoxContainer: {
    backgroundColor: COLORS.cream,
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.greyBorder,
  },
  proofBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  proofText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.emerald,
  },
  proofThumbScroll: {
    flexDirection: 'row',
  },
  cardProofThumb: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.greyBorder,
    backgroundColor: COLORS.white,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.greyBorder,
  },
  printBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.emerald,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  printBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },
  trashBtn: {
    backgroundColor: '#FEE2E2',
    padding: 6,
    borderRadius: 8,
  },
  galleryOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  galleryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    maxHeight: '80%',
    padding: 16,
  },
  galleryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  galleryTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.slateDark,
  },
  galleryBody: {
    maxHeight: 400,
  },
  galleryImgContainer: {
    marginBottom: 12,
  },
  galleryImgLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.emerald,
    marginBottom: 4,
  },
  galleryImg: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
});
