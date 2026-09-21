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
  Calendar,
  Clock,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  MessageCircle,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
  Building2,
  X,
} from 'lucide-react-native';
import { COLORS, SHADOWS } from '../constants/theme';
import {
  getAllBookings,
  updateBookingStatus,
  deleteBooking,
  getOutlets,
  getServices,
  API_BASE_URL,
} from '../services/api';
import ManualBookingModal from './ManualBookingModal';

const SERVER_ROOT = API_BASE_URL.replace(/\/api\/?$/, '');

const STATUSES = ['All', 'Pending', 'Confirmed', 'Processed', 'Completed', 'Cancelled'];

export default function AdminBookingManager() {
  const [bookings, setBookings] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOutletId, setSelectedOutletId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [selectedProofs, setSelectedProofs] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, [statusFilter, selectedOutletId]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, outletsRes, servicesRes] = await Promise.all([
        getAllBookings(statusFilter, '', selectedOutletId || null),
        getOutlets(false),
        getServices(),
      ]);

      if (bookingsRes.success) setBookings(bookingsRes.bookings || []);
      if (outletsRes.success) setOutlets(outletsRes.outlets || []);
      if (servicesRes.success) setServices(servicesRes.services || []);
    } catch (err) {
      console.error('Error fetching booking manager:', err);
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

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      setUpdatingId(bookingId);
      const res = await updateBookingStatus(bookingId, newStatus);
      if (res.success) {
        fetchInitialData();
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Gagal mengubah status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteBooking = (booking) => {
    const doDelete = async () => {
      try {
        setUpdatingId(booking.id);
        const res = await deleteBooking(booking.id);
        if (res.success) fetchInitialData();
      } catch (err) {
        Alert.alert('Error', err.response?.data?.message || 'Gagal menghapus booking.');
      } finally {
        setUpdatingId(null);
      }
    };

    const confirmMsg = `Hapus permanen booking #${booking.booking_code}?`;
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

    const msg = encodeURIComponent(`Halo, mengenai reservasi Kode Booking ${bookingCode} di Salon...`);
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

  const getStatusBadge = (status) => {
    const cfg = COLORS.status[status] || { bg: '#E2E8F0', text: '#475569', label: status };
    return (
      <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
        <Text style={[styles.badgeText, { color: cfg.text }]}>{cfg.label}</Text>
      </View>
    );
  };

  const filteredBookings = bookings.filter((b) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.booking_code?.toLowerCase().includes(q) ||
      b.customer_name?.toLowerCase().includes(q) ||
      b.customer_phone?.toLowerCase().includes(q)
    );
  });

  return (
    <View style={styles.container}>
      {/* Top action header */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.topTitle}>KELOLA RESERVASI (BOOKINGS)</Text>
          <Text style={styles.topSub}>Pantau, konfirmasi, dan kelola order salon</Text>
        </View>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setIsManualModalOpen(true)}
          activeOpacity={0.8}
        >
          <Plus size={16} color={COLORS.white} />
          <Text style={styles.addBtnText}>Booking Manual</Text>
        </TouchableOpacity>
      </View>

      {/* Filter bar */}
      <View style={styles.filterBar}>
        <View style={styles.searchBox}>
          <Search size={14} color={COLORS.greyText} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari Nama / Kode Booking / Phone..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusScroll}>
          {STATUSES.map((st) => (
            <TouchableOpacity
              key={st}
              style={[styles.statusChip, statusFilter === st && styles.statusChipActive]}
              onPress={() => setStatusFilter(st)}
            >
              <Text style={[styles.statusChipText, statusFilter === st && styles.statusChipTextActive]}>
                {st}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Bookings list */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color={COLORS.emerald} />
          <Text style={styles.loadingText}>Memuat reservasi...</Text>
        </View>
      ) : filteredBookings.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Tidak ada data reservasi ditemukan.</Text>
        </View>
      ) : (
        filteredBookings.map((item) => {
          const proofs = item.proofs && item.proofs.length > 0 ? item.proofs : item.payment_proof ? [item.payment_proof] : [];
          return (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.codeText}>{item.booking_code}</Text>
                  <Text style={styles.creatorText}>
                    {item.created_by === 'admin' ? 'Manual (Staff)' : 'Public'}
                  </Text>
                </View>
                {getStatusBadge(item.status)}
              </View>

              <Text style={styles.customerName}>👤 {item.customer_name}</Text>
              <Text style={styles.serviceName}>💇‍♀️ {item.service_name}</Text>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <MapPin size={12} color={COLORS.greyText} />
                  <Text style={styles.metaText}>{item.outlet_name || 'Semua Outlet'}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Clock size={12} color={COLORS.greyText} />
                  <Text style={styles.metaText}>
                    {item.booking_date} @ {item.booking_time}
                  </Text>
                </View>
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

              {/* Proof thumbnail badge & image preview */}
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

              {/* Status Actions */}
              <View style={styles.actionRow}>
                {item.status === 'Pending' && (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.confirmBtn]}
                    onPress={() => handleStatusChange(item.id, 'Confirmed')}
                    disabled={updatingId === item.id}
                  >
                    <Text style={styles.actionBtnText}>Confirm</Text>
                  </TouchableOpacity>
                )}

                {item.status === 'Confirmed' && (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.processBtn]}
                    onPress={() => handleStatusChange(item.id, 'Processed')}
                    disabled={updatingId === item.id}
                  >
                    <Text style={styles.actionBtnText}>Process</Text>
                  </TouchableOpacity>
                )}

                {item.status === 'Processed' && (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.completeBtn]}
                    onPress={() => handleStatusChange(item.id, 'Completed')}
                    disabled={updatingId === item.id}
                  >
                    <Text style={styles.actionBtnText}>Complete</Text>
                  </TouchableOpacity>
                )}

                {item.status !== 'Cancelled' && item.status !== 'Completed' && (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.cancelBtn]}
                    onPress={() => handleStatusChange(item.id, 'Cancelled')}
                    disabled={updatingId === item.id}
                  >
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.trashBtn}
                  onPress={() => handleDeleteBooking(item)}
                  disabled={updatingId === item.id}
                >
                  <Trash2 size={16} color="#B91C1C" />
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      )}

      {/* Manual Booking Modal */}
      <ManualBookingModal
        visible={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        outlets={outlets}
        services={services}
        onSaved={fetchInitialData}
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
  addBtn: {
    backgroundColor: COLORS.emerald,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  addBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  filterBar: {
    marginBottom: 12,
    gap: 10,
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
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: COLORS.slateDark,
    paddingVertical: 6,
  },
  statusScroll: {
    flexDirection: 'row',
  },
  statusChip: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.greyBorder,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 6,
  },
  statusChipActive: {
    backgroundColor: COLORS.emerald,
    borderColor: COLORS.emerald,
  },
  statusChipText: {
    fontSize: 11,
    color: COLORS.slateDark,
    fontWeight: '600',
  },
  statusChipTextActive: {
    color: COLORS.white,
    fontWeight: '700',
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
  creatorText: {
    fontSize: 10,
    color: COLORS.greyText,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  customerName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.emerald,
    marginBottom: 2,
  },
  serviceName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.slateDark,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
    fontSize: 14,
    fontWeight: '800',
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
    marginBottom: 10,
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
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.greyBorder,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  confirmBtn: {
    backgroundColor: '#047857',
  },
  processBtn: {
    backgroundColor: '#1D4ED8',
  },
  completeBtn: {
    backgroundColor: COLORS.emerald,
  },
  actionBtnText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },
  cancelBtn: {
    backgroundColor: '#FEE2E2',
  },
  cancelBtnText: {
    color: '#B91C1C',
    fontSize: 11,
    fontWeight: '700',
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
