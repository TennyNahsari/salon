import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Clock, Tag, CalendarCheck } from 'lucide-react-native';
import { COLORS, SHADOWS } from '../constants/theme';
import { getFullImageUrl } from '../services/api';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=600&q=80';

export default function ServiceCard({ service, onBook }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  const imgUri = getFullImageUrl(service.image_url, DEFAULT_IMAGE);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Image source={{ uri: imgUri }} style={styles.serviceImg} />
        
        <View style={styles.headerInfo}>
          <View style={styles.topRow}>
            <View style={styles.categoryBadge}>
              <Tag size={10} color={COLORS.rosegold} />
              <Text style={styles.categoryText}>{service.category || 'Treatment'}</Text>
            </View>
            {service.duration_minutes ? (
              <View style={styles.durationRow}>
                <Clock size={12} color={COLORS.greyText} />
                <Text style={styles.durationText}>{service.duration_minutes} Menit</Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.serviceName}>{service.name}</Text>
        </View>
      </View>

      {service.description ? (
        <Text style={styles.serviceDesc} numberOfLines={2}>
          {service.description}
        </Text>
      ) : null}

      <View style={styles.footerRow}>
        <Text style={styles.price}>{formatPrice(service.price)}</Text>

        <TouchableOpacity
          style={styles.bookBtn}
          onPress={() => onBook(service)}
          activeOpacity={0.8}
        >
          <CalendarCheck size={14} color={COLORS.white} />
          <Text style={styles.bookBtnText}>Pesan</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.greyBorder,
    ...SHADOWS.small,
  },
  headerRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  serviceImg: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: COLORS.creamDark,
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.creamDark,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.emerald,
    textTransform: 'uppercase',
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 10,
    color: COLORS.greyText,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.slateDark,
  },
  serviceDesc: {
    fontSize: 11,
    color: COLORS.greyText,
    lineHeight: 15,
    marginBottom: 10,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.greyBorder,
  },
  price: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.emerald,
  },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.emerald,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  bookBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
});
