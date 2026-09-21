import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Sparkles, Calendar, HeartHandshake, Shield, Star, MessageCircle } from 'lucide-react-native';
import Header from '../components/Header';
import OutletSelector from '../components/OutletSelector';
import ServiceCard from '../components/ServiceCard';
import BookingModal from '../components/BookingModal';
import OrderSuccessModal from '../components/OrderSuccessModal';
import CheckStatusModal from '../components/CheckStatusModal';
import { getOutlets, getServices, getConfigs } from '../services/api';
import { COLORS, SHADOWS } from '../constants/theme';

export default function HomeScreen({ navigation }) {
  const [outlets, setOutlets] = useState([]);
  const [selectedOutlet, setSelectedOutlet] = useState(null);
  const [loadingOutlets, setLoadingOutlets] = useState(true);

  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);

  const [configs, setConfigs] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Modals state
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [lastBooking, setLastBooking] = useState(null);

  const [isCheckStatusOpen, setIsCheckStatusOpen] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    fetchServicesData(selectedOutlet?.id || null);
  }, [selectedOutlet]);

  const loadInitialData = async () => {
    try {
      setLoadingOutlets(true);
      const res = await getOutlets(true);
      if (res.success && res.outlets.length > 0) {
        setOutlets(res.outlets);
        setSelectedOutlet(res.outlets[0]);
      }
    } catch (err) {
      console.error('Error fetching outlets:', err);
    } finally {
      setLoadingOutlets(false);
    }

    try {
      const cfgRes = await getConfigs();
      if (cfgRes.success) setConfigs(cfgRes.configs);
    } catch (err) {
      console.error('Error fetching configs:', err);
    }
  };

  const fetchServicesData = async (outletId) => {
    try {
      setLoadingServices(true);
      const res = await getServices(outletId);
      if (res.success) {
        setServices(res.services);
      }
    } catch (err) {
      console.error('Error fetching services:', err);
    } finally {
      setLoadingServices(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    await fetchServicesData(selectedOutlet?.id || null);
    setRefreshing(false);
  };

  const handleOpenBooking = (service = null) => {
    setSelectedService(service);
    setIsBookingOpen(true);
  };

  const handleSuccessBooking = (bookingData, paymentConfigs) => {
    setLastBooking(bookingData);
    if (paymentConfigs) setConfigs(paymentConfigs);
    setIsSuccessOpen(true);
  };

  return (
    <View style={styles.screen}>
      <Header
        onOpenCheckStatus={() => setIsCheckStatusOpen(true)}
        onAdminClick={() => navigation.navigate('Login')}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.emerald]} />}
      >
        {/* Hero Section Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.heroBadge}>
            <Sparkles size={12} color={COLORS.rosegold} />
            <Text style={styles.heroBadgeText}>PREMIUM SALON & BEAUTY SPA</Text>
          </View>
          <Text style={styles.heroTitle}>Sensasi Perawatan Mewah & Elegan</Text>
          <Text style={styles.heroSubtitle}>
            Nikmati pengalaman salon kecantikan profesional dengan staf terampil dan produk premium terbaik.
          </Text>

          <TouchableOpacity
            style={styles.heroCtaBtn}
            onPress={() => handleOpenBooking(null)}
            activeOpacity={0.8}
          >
            <Calendar size={16} color={COLORS.white} />
            <Text style={styles.heroCtaBtnText}>Reservasi Sekarang</Text>
          </TouchableOpacity>
        </View>

        {/* Outlet Selector Component */}
        <OutletSelector
          outlets={outlets}
          selectedOutlet={selectedOutlet}
          onSelectOutlet={(outlet) => setSelectedOutlet(outlet)}
          loading={loadingOutlets}
        />

        {/* Services List Catalog */}
        <View style={styles.servicesSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>KATALOG LAYANAN</Text>
            {selectedOutlet ? (
              <Text style={styles.sectionSubTitle}>Cabang {selectedOutlet.name}</Text>
            ) : null}
          </View>

          {loadingServices ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={COLORS.emerald} />
              <Text style={styles.loadingText}>Memuat layanan salon...</Text>
            </View>
          ) : services.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Belum ada layanan tersedia pada cabang ini.</Text>
            </View>
          ) : (
            services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onBook={(srv) => handleOpenBooking(srv)}
              />
            ))
          )}
        </View>

        {/* Luxury Features / Why Choose Us */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>MENGAPA MEMILIH KAMI</Text>

          <View style={styles.featureGrid}>
            <View style={styles.featureCard}>
              <HeartHandshake size={22} color={COLORS.emerald} />
              <Text style={styles.featureCardTitle}>Staf Profesional</Text>
              <Text style={styles.featureCardDesc}>Beautician berpengalaman & tersertifikasi.</Text>
            </View>

            <View style={styles.featureCard}>
              <Shield size={22} color={COLORS.emerald} />
              <Text style={styles.featureCardTitle}>Higienis & Steril</Text>
              <Text style={styles.featureCardDesc}>Peralatan selalu disterilkan secara profesional.</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Booking Modal (Order Form) */}
      <BookingModal
        visible={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        selectedService={selectedService}
        services={services}
        outlets={outlets}
        selectedOutlet={selectedOutlet}
        onSuccessBooking={handleSuccessBooking}
      />

      {/* Order Success Modal */}
      <OrderSuccessModal
        visible={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        booking={lastBooking}
        configs={configs}
      />

      {/* Check Status Modal */}
      <CheckStatusModal
        visible={isCheckStatusOpen}
        onClose={() => setIsCheckStatusOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroBanner: {
    backgroundColor: COLORS.emerald,
    margin: 16,
    borderRadius: 22,
    padding: 20,
    ...SHADOWS.medium,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  heroBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.rosegold,
    letterSpacing: 1.5,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.white,
    lineHeight: 26,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 12,
    color: '#D1E7DD',
    lineHeight: 18,
    marginBottom: 16,
  },
  heroCtaBtn: {
    backgroundColor: COLORS.rosegold,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
  },
  heroCtaBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.slateDark,
  },
  servicesSection: {
    paddingHorizontal: 18,
    marginTop: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.greyText,
    letterSpacing: 1.2,
  },
  sectionSubTitle: {
    fontSize: 11,
    color: COLORS.emerald,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 30,
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 12,
    color: COLORS.greyText,
  },
  emptyContainer: {
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
  featuresSection: {
    paddingHorizontal: 18,
    marginTop: 20,
  },
  featureGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  featureCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.greyBorder,
    ...SHADOWS.small,
  },
  featureCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.slateDark,
    marginTop: 8,
    marginBottom: 2,
  },
  featureCardDesc: {
    fontSize: 10,
    color: COLORS.greyText,
    lineHeight: 14,
  },
});
