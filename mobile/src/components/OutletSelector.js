import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { COLORS, SHADOWS } from '../constants/theme';

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
          return (
            <TouchableOpacity
              key={outlet.id}
              style={[styles.card, isSelected && styles.selectedCard]}
              onPress={() => onSelectOutlet(outlet)}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <MapPin size={16} color={isSelected ? COLORS.rosegold : COLORS.emerald} />
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
    width: 200,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.greyBorder,
    ...SHADOWS.small,
  },
  selectedCard: {
    backgroundColor: COLORS.emerald,
    borderColor: COLORS.emerald,
    ...SHADOWS.medium,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  outletName: {
    fontSize: 14,
    fontWeight: '700',
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
    marginTop: 6,
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
