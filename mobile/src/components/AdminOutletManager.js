import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  Platform,
  Switch,
} from 'react-native';
import { Building2, Plus, Edit2, Trash2, MapPin, Phone, X, Check, Sparkles } from 'lucide-react-native';
import { COLORS, SHADOWS } from '../constants/theme';
import { getOutlets, createOutlet, updateOutlet, deleteOutlet, getServices } from '../services/api';

export default function AdminOutletManager() {
  const [outlets, setOutlets] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOutlet, setEditingOutlet] = useState(null);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [outletsRes, servicesRes] = await Promise.all([
        getOutlets(false),
        getServices(),
      ]);

      if (outletsRes.success) setOutlets(outletsRes.outlets || []);
      if (servicesRes.success) setServices(servicesRes.services || []);
    } catch (err) {
      console.error('Error fetching outlets manager:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingOutlet(null);
    setName('');
    setAddress('');
    setPhone('');
    setIsActive(true);
    setSelectedServiceIds(services.map((s) => s.id));
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (outlet) => {
    setEditingOutlet(outlet);
    setName(outlet.name || '');
    setAddress(outlet.address || '');
    setPhone(outlet.phone || '');
    setIsActive(outlet.is_active ?? true);
    setSelectedServiceIds(outlet.service_ids || []);
    setError('');
    setIsModalOpen(true);
  };

  const toggleService = (serviceId) => {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSubmit = async () => {
    if (!name.trim() || !address.trim()) {
      setError('Nama & Alamat outlet wajib diisi.');
      return;
    }

    setError('');
    setSaving(true);

    try {
      const payload = {
        name,
        address,
        phone,
        is_active: isActive,
        service_ids: selectedServiceIds,
      };

      let res;
      if (editingOutlet) {
        res = await updateOutlet(editingOutlet.id, payload);
      } else {
        res = await createOutlet(payload);
      }

      if (res.success) {
        setIsModalOpen(false);
        fetchData();
      } else {
        setError(res.message || 'Gagal menyimpan outlet.');
      }
    } catch (err) {
      console.error('Save outlet error:', err);
      setError(err.response?.data?.message || 'Gagal menyimpan outlet.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (outlet) => {
    const doDelete = async () => {
      try {
        const res = await deleteOutlet(outlet.id);
        if (res.success) fetchData();
      } catch (err) {
        Alert.alert('Error', err.response?.data?.message || 'Gagal menghapus outlet.');
      }
    };

    const confirmMsg = `Hapus outlet "${outlet.name}" secara permanen?`;
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

  return (
    <View style={styles.container}>
      {/* Header bar */}
      <View style={styles.headerBar}>
        <View>
          <Text style={styles.headerTitle}>KELOLA CABANG OUTLET</Text>
          <Text style={styles.headerSub}>Tambah, ubah data, dan atur pemetaan layanan per outlet</Text>
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={handleOpenAddModal} activeOpacity={0.8}>
          <Plus size={16} color={COLORS.white} />
          <Text style={styles.addBtnText}>Tambah Outlet</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color={COLORS.emerald} />
          <Text style={styles.loadingText}>Memuat outlet...</Text>
        </View>
      ) : outlets.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Belum ada outlet cabang terdaftar.</Text>
        </View>
      ) : (
        outlets.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.badge, item.is_active ? styles.badgeActive : styles.badgeInactive]}>
                <Text style={[styles.badgeText, item.is_active ? styles.badgeTextActive : styles.badgeTextInactive]}>
                  {item.is_active ? 'AKTIF' : 'NONAKTIF'}
                </Text>
              </View>
              <Text style={styles.idText}>ID: #{item.id}</Text>
            </View>

            <Text style={styles.outletName}>{item.name}</Text>

            <View style={styles.infoRow}>
              <MapPin size={14} color={COLORS.rosegold} />
              <Text style={styles.infoText}>{item.address}</Text>
            </View>

            {item.phone ? (
              <View style={styles.infoRow}>
                <Phone size={14} color={COLORS.emerald} />
                <Text style={styles.infoText}>{item.phone}</Text>
              </View>
            ) : null}

            <View style={styles.servicesBox}>
              <Text style={styles.servicesTitle}>
                📋 Layanan Terhubung: ({item.service_ids?.length || 0} / {services.length})
              </Text>
              <View style={styles.servicesChips}>
                {services
                  .filter((s) => item.service_ids?.includes(s.id))
                  .slice(0, 3)
                  .map((s) => (
                    <View key={s.id} style={styles.chip}>
                      <Text style={styles.chipText}>{s.name}</Text>
                    </View>
                  ))}
                {(item.service_ids?.length || 0) > 3 ? (
                  <View style={styles.chipMore}>
                    <Text style={styles.chipMoreText}>+{(item.service_ids?.length || 0) - 3} lainnya</Text>
                  </View>
                ) : null}
              </View>
            </View>

            {/* Action buttons */}
            <View style={styles.cardFooter}>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => handleOpenEditModal(item)}
                activeOpacity={0.7}
              >
                <Edit2 size={14} color={COLORS.slateDark} />
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(item)}
                activeOpacity={0.7}
              >
                <Trash2 size={14} color="#B91C1C" />
                <Text style={styles.deleteBtnText}>Hapus</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      {/* Add / Edit Modal */}
      <Modal visible={isModalOpen} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Building2 size={18} color={COLORS.rosegold} />
                <Text style={styles.modalTitle}>
                  {editingOutlet ? 'Edit Data Outlet' : 'Tambah Outlet Baru'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <X size={20} color={COLORS.white} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {error ? (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>⚠️ {error}</Text>
                </View>
              ) : null}

              <Text style={styles.inputLabel}>NAMA OUTLET</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Contoh: Luxe Salon Cabang Jaksel"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <Text style={styles.inputLabel}>ALAMAT OUTLET</Text>
              <View style={[styles.inputBox, { height: 70 }]}>
                <TextInput
                  style={[styles.textInput, { textAlignVertical: 'top' }]}
                  placeholder="Jl. Senopati No. 45, Jakarta Selatan"
                  multiline
                  value={address}
                  onChangeText={setAddress}
                />
              </View>

              <Text style={styles.inputLabel}>NOMOR TELEPON / WHATSAPP</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.textInput}
                  placeholder="08123456789"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>

              {/* Status active switch */}
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Status Cabang Aktif</Text>
                <Switch
                  value={isActive}
                  onValueChange={setIsActive}
                  trackColor={{ false: '#CBD5E1', true: COLORS.emerald }}
                  thumbColor={COLORS.white}
                />
              </View>

              {/* Service checklist */}
              <Text style={styles.inputLabel}>PEMETAAN LAYANAN SALON</Text>
              <View style={styles.servicesChecklist}>
                {services.map((s) => {
                  const isChecked = selectedServiceIds.includes(s.id);
                  return (
                    <TouchableOpacity
                      key={s.id}
                      style={[styles.checkRow, isChecked && styles.checkRowActive]}
                      onPress={() => toggleService(s.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.checkName, isChecked && styles.checkNameActive]}>
                        {s.name}
                      </Text>
                      <Text style={styles.checkPrice}>
                        Rp {Number(s.price).toLocaleString('id-ID')}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.submitBtn, saving && styles.disabledBtn]}
                onPress={handleSubmit}
                disabled={saving}
                activeOpacity={0.8}
              >
                {saving ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.submitBtnText}>
                    {editingOutlet ? 'Simpan Perubahan' : 'Tambah Outlet'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.greyBorder,
    ...SHADOWS.small,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.emerald,
    letterSpacing: 1,
  },
  headerSub: {
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
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeActive: {
    backgroundColor: '#D1FAE5',
  },
  badgeInactive: {
    backgroundColor: '#FEE2E2',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  badgeTextActive: {
    color: '#047857',
  },
  badgeTextInactive: {
    color: '#B91C1C',
  },
  idText: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: COLORS.greyText,
  },
  outletName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.slateDark,
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 11,
    color: COLORS.greyText,
  },
  servicesBox: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.greyBorder,
  },
  servicesTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.emerald,
    marginBottom: 6,
  },
  servicesChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    backgroundColor: COLORS.creamDark,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.greyBorder,
  },
  chipText: {
    fontSize: 10,
    color: COLORS.slateDark,
    fontWeight: '600',
  },
  chipMore: {
    backgroundColor: COLORS.emeraldLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  chipMoreText: {
    fontSize: 10,
    color: COLORS.emerald,
    fontWeight: '700',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.greyBorder,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.creamDark,
    borderWidth: 1,
    borderColor: COLORS.greyBorder,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  editBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.slateDark,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#F87171',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  deleteBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B91C1C',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.cream,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    backgroundColor: COLORS.emerald,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.white,
  },
  modalBody: {
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
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.greyText,
    letterSpacing: 1,
    marginBottom: 6,
    marginTop: 10,
  },
  inputBox: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.greyBorder,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  textInput: {
    fontSize: 13,
    color: COLORS.slateDark,
    paddingVertical: 6,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.greyBorder,
  },
  switchLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.slateDark,
  },
  servicesChecklist: {
    gap: 6,
    marginTop: 4,
    marginBottom: 20,
  },
  checkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.greyBorder,
    padding: 10,
    borderRadius: 10,
  },
  checkRowActive: {
    backgroundColor: COLORS.emeraldLight,
    borderColor: COLORS.emerald,
  },
  checkName: {
    fontSize: 12,
    color: COLORS.slateDark,
    fontWeight: '600',
  },
  checkNameActive: {
    color: COLORS.emerald,
    fontWeight: '700',
  },
  checkPrice: {
    fontSize: 11,
    color: COLORS.greyText,
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.greyBorder,
  },
  submitBtn: {
    backgroundColor: COLORS.emerald,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },
});
