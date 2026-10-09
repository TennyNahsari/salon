import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { COLORS, SHADOWS } from '../constants/theme';
import { getFullImageUrl } from '../services/api';

const DEFAULT_OUTLET_IMAGE = 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=600&q=80';

export default function OutletSelector({ outlets, selectedOutlet, onSelectOutlet, loading }) {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={COLORS.emerald} />
        <Text style={styles.loadingText}>Memuat cabang outlet...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>PILIH CABANG SALON</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {outlets.map((outlet) => {
          const isSelected = selectedOutlet?.id === outlet.id;
          const imgUri = getFullImageUrl(outlet.image_url, DEFAULT_OUTLET_IMAGE);

          return (
            <TouchableOpacity
              key={outlet.id}
              style={[styles.card, isSelected && styles.selectedCard]}
              onPress={() => onSelectOutlet(outlet)}
              activeOpacity={0.85}
            >
              {/* Cover Image Header */}
              <View style={styles.coverBox}>
                <Image source={{ uri: imgUri }} style={styles.coverImg} />
                <View style={[styles.coverOverlay, isSelected && styles.selectedCoverOverlay]} />
                
                {isSelected ? (
                  <View style={styles.selectedBadge}>
                    <Text style={styles.selectedBadgeText}>✓ TERPILIH</Text>
                  </View>
                ) : null}
              </View>

              {/* Card Body Info */}
              <View style={styles.cardBody}>
                <View style={styles.cardHeader}>
                  <MapPin size={14} color={isSelected ? COLORS.rosegold : COLORS.emerald} />
                  <Text style={[styles.outletName, isSelected && styles.selectedOutletName]} numberOfLines={1}>
                    {outlet.name}
                  </Text>
                </View>
                <Text style={[styles.outletAddress, isSelected && styles.selectedOutletAddress]} numberOfLines={2}>
                  {outlet.address}
                </Text>
                {outlet.phone ? (
                  <Text style={[styles.outletPhone, isSelected && styles.selectedOutletPhone]}>
                    📞 {outlet.phone}
                  </Text>
                ) : null}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.greyText,
    letterSpacing: 1.2,
    marginHorizontal: 18,
    marginBottom: 10,
  },
  scrollContent: {
    paddingHorizontal: 18,
    gap: 12,
  },
  card: {
    width: 220,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.greyBorder,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  selectedCard: {
    backgroundColor: COLORS.emerald,
    borderColor: COLORS.emerald,
    ...SHADOWS.medium,
  },
  coverBox: {
    height: 95,
    width: '100%',
    position: 'relative',
    backgroundColor: COLORS.creamDark,
  },
  coverImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.25)',
  },
  selectedCoverOverlay: {
    backgroundColor: 'rgba(4, 120, 87, 0.45)',
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.rosegold,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  selectedBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.slateDark,
  },
  cardBody: {
    padding: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  outletName: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.slateDark,
    flex: 1,
  },
  selectedOutletName: {
    color: COLORS.white,
  },
  outletAddress: {
    fontSize: 11,
    color: COLORS.greyText,
    lineHeight: 15,
  },
  selectedOutletAddress: {
    color: '#D1E7DD',
  },
  outletPhone: {
    fontSize: 10,
    color: COLORS.emerald,
    marginTop: 4,
    fontWeight: '600',
  },
  selectedOutletPhone: {
    color: COLORS.rosegold,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 12,
    color: COLORS.greyText,
  },
});
