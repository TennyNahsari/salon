import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Sparkles, Search, ShieldCheck, UserCheck } from 'lucide-react-native';
import { COLORS, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

export default function Header({ onOpenCheckStatus, onAdminClick }) {
  const { admin } = useAuth();

  return (
    <View style={styles.headerContainer}>
      <View style={styles.brandRow}>
        <View style={styles.logoBadge}>
          <Sparkles size={20} color={COLORS.rosegold} />
        </View>
        <View>
          <Text style={styles.brandTitle}>LUXE SALON</Text>
          <Text style={styles.brandSubtitle}>BEAUTY & SPA</Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={onOpenCheckStatus}
          activeOpacity={0.7}
        >
          <Search size={16} color={COLORS.emerald} />
          <Text style={styles.iconBtnText}>Cek Status</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.iconBtn, styles.adminBtn]}
          onPress={onAdminClick}
          activeOpacity={0.7}
        >
          {admin ? (
            <UserCheck size={16} color={COLORS.white} />
          ) : (
            <ShieldCheck size={16} color={COLORS.white} />
          )}
          <Text style={styles.adminBtnText}>{admin ? 'Dashboard' : 'Admin'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: COLORS.cream,
    paddingHorizontal: 18,
    paddingTop: 45,
    paddingBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.greyBorder,
    ...SHADOWS.small,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.emerald,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.emerald,
    letterSpacing: 1.5,
  },
  brandSubtitle: {
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.rosegold,
    letterSpacing: 2,
    marginTop: -2,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.emeraldLight,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
  },
  iconBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.emerald,
  },
  adminBtn: {
    backgroundColor: COLORS.emerald,
  },
  adminBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.white,
  },
});
