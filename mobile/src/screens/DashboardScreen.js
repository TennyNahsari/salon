import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import {
  LogOut,
  Calendar,
  Clock,
  CheckCircle,
  TrendingUp,
  User,
  MapPin,
  RefreshCw,
  Home,
  Building2,
  BookOpen,
  LayoutDashboard,
  Scissors,
  CreditCard,
  Users,
  ShieldCheck,
  Settings,
} from 'lucide-react-native';
import { COLORS, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { getAllBookings } from '../services/api';
import AdminOutletManager from '../components/AdminOutletManager';
import AdminBookingManager from '../components/AdminBookingManager';
import AdminServiceManager from '../components/AdminServiceManager';
import AdminPaymentManager from '../components/AdminPaymentManager';
import AdminStaffManager from '../components/AdminStaffManager';
import AdminUserManager from '../components/AdminUserManager';
import AdminPaymentConfig from '../components/AdminPaymentConfig';

export default function DashboardScreen({ navigation }) {
  const { admin, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'bookings' | 'services' | 'payments' | 'staff' | 'users' | 'config' | 'outlets'

  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await getAllBookings('All', '', null);
      if (res.success) {
        setBookings(res.bookings || []);
        setStats(res.stats || null);
      }
    } catch (err) {
      console.error('Error fetching dashboard bookings:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleLogout = async () => {
    const executeLogout = async () => {
      try {
        await logout();
      } catch (err) {
        console.error('Logout error:', err);
      }
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    };

    if (Platform.OS === 'web') {
      const confirmed = typeof window !== 'undefined' ? window.confirm('Apakah Anda yakin ingin keluar dari Portal Admin?') : true;
      if (confirmed) {
        await executeLogout();
      }
    } else {
      Alert.alert(
        'Konfirmasi Logout',
        'Apakah Anda yakin ingin keluar dari Portal Admin?',
        [
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Ya, Logout',
            style: 'destructive',
            onPress: executeLogout,
          },
        ]
      );
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  const getStatusStyle = (status) => {
    return COLORS.status[status] || { bg: '#E2E8F0', text: '#475569', label: status };
  };

  return (
    <View style={styles.screen}>
      {/* Top Bar Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.homeIconBtn}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.7}
          >
            <Home size={18} color={COLORS.emerald} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>DASHBOARD ADMIN</Text>
            <Text style={styles.adminName}>
              👤 {admin?.username || 'Admin'} ({admin?.role === 'admin' ? 'Super Admin' : 'Admin Cabang'})
            </Text>
          </View>
        </View>

        {/* LOGOUT Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <LogOut size={16} color={COLORS.white} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Admin Tab Navigation Bar */}
      <View style={styles.tabNavContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabNavContent}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'overview' && styles.tabBtnActive]}
            onPress={() => setActiveTab('overview')}
            activeOpacity={0.8}
          >
            <LayoutDashboard size={14} color={activeTab === 'overview' ? COLORS.white : COLORS.emerald} />
            <Text style={[styles.tabBtnText, activeTab === 'overview' && styles.tabBtnTextActive]}>
              Overview
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'bookings' && styles.tabBtnActive]}
            onPress={() => setActiveTab('bookings')}
            activeOpacity={0.8}
          >
            <BookOpen size={14} color={activeTab === 'bookings' ? COLORS.white : COLORS.emerald} />
            <Text style={[styles.tabBtnText, activeTab === 'bookings' && styles.tabBtnTextActive]}>
              Bookings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'services' && styles.tabBtnActive]}
            onPress={() => setActiveTab('services')}
            activeOpacity={0.8}
          >
            <Scissors size={14} color={activeTab === 'services' ? COLORS.white : COLORS.emerald} />
            <Text style={[styles.tabBtnText, activeTab === 'services' && styles.tabBtnTextActive]}>
              Services
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'payments' && styles.tabBtnActive]}
            onPress={() => setActiveTab('payments')}
            activeOpacity={0.8}
          >
            <CreditCard size={14} color={activeTab === 'payments' ? COLORS.white : COLORS.emerald} />
            <Text style={[styles.tabBtnText, activeTab === 'payments' && styles.tabBtnTextActive]}>
              Payments
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'staff' && styles.tabBtnActive]}
            onPress={() => setActiveTab('staff')}
            activeOpacity={0.8}
          >
            <Users size={14} color={activeTab === 'staff' ? COLORS.white : COLORS.emerald} />
            <Text style={[styles.tabBtnText, activeTab === 'staff' && styles.tabBtnTextActive]}>
              Staff
            </Text>
          </TouchableOpacity>

          {admin?.role === 'admin' && (
            <>
              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'users' && styles.tabBtnActive]}
                onPress={() => setActiveTab('users')}
                activeOpacity={0.8}
              >
                <ShieldCheck size={14} color={activeTab === 'users' ? COLORS.white : COLORS.emerald} />
                <Text style={[styles.tabBtnText, activeTab === 'users' && styles.tabBtnTextActive]}>
                  Users
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'outlets' && styles.tabBtnActive]}
                onPress={() => setActiveTab('outlets')}
                activeOpacity={0.8}
              >
                <Building2 size={14} color={activeTab === 'outlets' ? COLORS.white : COLORS.emerald} />
                <Text style={[styles.tabBtnText, activeTab === 'outlets' && styles.tabBtnTextActive]}>
                  Outlets
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'config' && styles.tabBtnActive]}
                onPress={() => setActiveTab('config')}
                activeOpacity={0.8}
              >
                <Settings size={14} color={activeTab === 'config' ? COLORS.white : COLORS.emerald} />
                <Text style={[styles.tabBtnText, activeTab === 'config' && styles.tabBtnTextActive]}>
                  Config
                </Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.emerald]} />}
      >
        {/* Tab 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <View>
            <View style={styles.welcomeCard}>
              <Text style={styles.welcomeTitle}>Selamat Datang di Luxe Salon Mobile</Text>
              <Text style={styles.welcomeSubtitle}>
                Pantau reservasi pelanggan, status pembayaran, dan ringkasan aktivitas salon secara real-time.
              </Text>
            </View>

            <Text style={styles.sectionTitle}>RINGKASAN UMUM / STATISTIK</Text>

            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { borderLeftColor: COLORS.emerald }]}>
                <Calendar size={20} color={COLORS.emerald} />
                <Text style={styles.statNumber}>{stats?.total_bookings || bookings.length || 0}</Text>
                <Text style={styles.statLabel}>Total Booking</Text>
              </View>

              <View style={[styles.statCard, { borderLeftColor: '#B45309' }]}>
                <Clock size={20} color="#B45309" />
                <Text style={styles.statNumber}>
                  {stats?.pending_count || bookings.filter((b) => b.status === 'Pending').length || 0}
                </Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>

              <View style={[styles.statCard, { borderLeftColor: '#047857' }]}>
                <CheckCircle size={20} color="#047857" />
                <Text style={styles.statNumber}>
                  {stats?.completed_count || bookings.filter((b) => b.status === 'Completed').length || 0}
                </Text>
                <Text style={styles.statLabel}>Selesai</Text>
              </View>

              <View style={[styles.statCard, { borderLeftColor: COLORS.rosegold }]}>
                <TrendingUp size={20} color={COLORS.rosegold} />
                <Text style={styles.statNumberSmall}>
                  {formatPrice(stats?.total_revenue || 0)}
                </Text>
                <Text style={styles.statLabel}>Pendapatan</Text>
              </View>
            </View>

            <View style={styles.bookingsHeaderRow}>
              <Text style={styles.sectionTitle}>RESERVASI TERBARU</Text>
              <TouchableOpacity style={styles.refreshBtn} onPress={fetchDashboardData}>
                <RefreshCw size={14} color={COLORS.emerald} />
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="small" color={COLORS.emerald} />
                <Text style={styles.loadingText}>Memuat data reservasi...</Text>
              </View>
            ) : bookings.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>Belum ada data reservasi masuk.</Text>
              </View>
            ) : (
              bookings.slice(0, 5).map((item) => {
                const statusConfig = getStatusStyle(item.status);
                return (
                  <View key={item.id} style={styles.bookingCard}>
                    <View style={styles.cardHeaderRow}>
                      <Text style={styles.codeText}>{item.booking_code}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                        <Text style={[styles.statusText, { color: statusConfig.text }]}>
                          {statusConfig.label}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.customerName}>👤 {item.customer_name}</Text>
                    <Text style={styles.serviceTitle}>💇‍♀️ {item.service_name}</Text>

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

                    <View style={styles.cardFooter}>
                      <Text style={styles.phoneText}>📞 {item.customer_phone}</Text>
                      <Text style={styles.priceText}>{formatPrice(item.total_price)}</Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* Tab 2: BOOKINGS MANAGER */}
        {activeTab === 'bookings' && <AdminBookingManager />}

        {/* Tab 3: SERVICES MANAGER */}
        {activeTab === 'services' && <AdminServiceManager />}

        {/* Tab 4: PAYMENTS MANAGER */}
        {activeTab === 'payments' && <AdminPaymentManager />}

        {/* Tab 5: STAFF MANAGER */}
        {activeTab === 'staff' && <AdminStaffManager />}

        {/* Tab 6: USERS MANAGER */}
        {activeTab === 'users' && <AdminUserManager />}

        {/* Tab 7: OUTLETS MANAGER */}
        {activeTab === 'outlets' && <AdminOutletManager />}

        {/* Tab 8: PAYMENT CONFIG */}
        {activeTab === 'config' && <AdminPaymentConfig />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingTop: 45,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.greyBorder,
    ...SHADOWS.small,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  homeIconBtn: {
    padding: 6,
    backgroundColor: COLORS.emeraldLight,
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.emerald,
    letterSpacing: 1,
  },
  adminName: {
    fontSize: 10,
    color: COLORS.greyText,
    fontWeight: '600',
  },
  logoutBtn: {
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  logoutText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  tabNavContainer: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.greyBorder,
    paddingVertical: 8,
  },
  tabNavContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.emeraldLight,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tabBtnActive: {
    backgroundColor: COLORS.emerald,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.emerald,
  },
  tabBtnTextActive: {
    color: COLORS.white,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  welcomeCard: {
    backgroundColor: COLORS.emerald,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.small,
  },
  welcomeTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 11,
    color: '#D1E7DD',
    lineHeight: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.greyText,
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: COLORS.greyBorder,
    ...SHADOWS.small,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.slateDark,
    marginTop: 4,
  },
  statNumberSmall: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.slateDark,
    marginTop: 6,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.greyText,
    fontWeight: '600',
    marginTop: 2,
  },
  bookingsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  refreshBtn: {
    padding: 6,
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
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.greyBorder,
  },
  emptyText: {
    fontSize: 12,
    color: COLORS.greyText,
  },
  bookingCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.greyBorder,
    ...SHADOWS.small,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  codeText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.slateDark,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
  },
  customerName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.emerald,
    marginBottom: 2,
  },
  serviceTitle: {
    fontSize: 12,
    color: COLORS.slateDark,
    fontWeight: '600',
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
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.greyBorder,
    paddingTop: 8,
  },
  phoneText: {
    fontSize: 11,
    color: COLORS.greyText,
  },
  priceText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.emerald,
  },
});
