import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock, Tag, CalendarCheck } from 'lucide-react-native';
import { COLORS, SHADOWS } from '../constants/theme';

export default function ServiceCard({ service, onBook }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.categoryBadge}>
          <Tag size={12} color={COLORS.rosegold} />
          <Text style={styles.categoryText}>{service.category || 'General'}</Text>
        </View>
        {service.duration_minutes ? (
          <View style={styles.durationRow}>
            <Clock size={12} color={COLORS.greyText} />
            <Text style={styles.durationText}>{service.duration_minutes} Menit</Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.serviceName}>{service.name}</Text>
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
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.greyBorder,
    ...SHADOWS.small,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.creamDark,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 10,
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
    fontSize: 11,
    color: COLORS.greyText,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.slateDark,
    marginBottom: 4,
  },
  serviceDesc: {
    fontSize: 12,
    color: COLORS.greyText,
    lineHeight: 16,
    marginBottom: 12,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.greyBorder,
  },
  price: {
    fontSize: 16,
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
