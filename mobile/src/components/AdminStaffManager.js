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
} from 'react-native';
import { Users, Plus, Edit2, Trash2, Scissors, MapPin, X, Check } from 'lucide-react-native';
import { COLORS, SHADOWS } from '../constants/theme';
import { getAllStaff, createStaff, updateStaff, deleteStaff, getServices, getOutlets } from '../services/api';

export default function AdminStaffManager() {
  const [staffList, setStaffList] = useState([]);
  const [services, setServices] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('Stylist / Therapist');
  const [outletId, setOutletId] = useState('');
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
      const [staffRes, servicesRes, outletsRes] = await Promise.all([
        getAllStaff(),
        getServices(),
        getOutlets(false),
      ]);

      if (staffRes.success) setStaffList(staffRes.staff || []);
      if (servicesRes.success) setServices(servicesRes.services || []);
      if (outletsRes.success) setOutlets(outletsRes.outlets || []);
    } catch (err) {
      console.error('Error fetching staff manager data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingStaff(null);
    setName('');
    setRole('Stylist / Therapist');
    setOutletId(outlets && outlets.length > 0 ? String(outlets[0].id) : '');
    setIsActive(true);
    setSelectedServiceIds(services.map((s) => s.id));
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (st) => {
    setEditingStaff(st);
    setName(st.name || '');
    setRole(st.role || 'Stylist / Therapist');
    setOutletId(st.outlet_id ? String(st.outlet_id) : '');
    setIsActive(st.is_active ?? true);
    setSelectedServiceIds(Array.isArray(st.service_ids) ? st.service_ids : []);
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

  const handleToggleActive = async (st) => {
    try {
      const payload = {
        name: st.name,
        role: st.role,
        outlet_id: st.outlet_id,
        is_active: !st.is_active,
        service_ids: st.service_ids || [],
      };
      const res = await updateStaff(st.id, payload);
      if (res.success) fetchData();
    } catch (err) {
      Alert.alert('Error', 'Gagal merubah status cuti/aktif staff.');
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Nama staff wajib diisi.');
      return;
    }

    setError('');
    setSaving(true);

    try {
      const payload = {
        name,
        role,
        outlet_id: outletId,
        is_active: isActive,
        service_ids: selectedServiceIds,
      };

      let res;
      if (editingStaff) {
        res = await updateStaff(editingStaff.id, payload);
      } else {
        res = await createStaff(payload);
      }

      if (res.success) {
        setIsModalOpen(false);
        fetchData();
      } else {
        setError(res.message || 'Gagal menyimpan data staff.');
      }
    } catch (err) {
      console.error('Save staff error:', err);
      setError(err.response?.data?.message || 'Gagal menyimpan data staff.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (st) => {
    const doDelete = async () => {
      try {
        const res = await deleteStaff(st.id);
        if (res.success) fetchData();
      } catch (err) {
        Alert.alert('Error', err.response?.data?.message || 'Gagal menghapus staff.');
      }
    };

    const confirmMsg = `Hapus data staff "${st.name}" secara permanen?`;
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
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.topTitle}>KELOLA STAFF & BEAUTICIAN (STAFF)</Text>
          <Text style={styles.topSub}>Atur jadwal aktif/cuti, peran, dan keahlian layanan staff</Text>
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={handleOpenAddModal} activeOpacity={0.8}>
          <Plus size={16} color={COLORS.white} />
          <Text style={styles.addBtnText}>Tambah Staff</Text>
        </TouchableOpacity>
      </View>

      {/* Staff List */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color={COLORS.emerald} />
          <Text style={styles.loadingText}>Memuat data staff...</Text>
        </View>
      ) : staffList.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Belum ada staff terdaftar.</Text>
        </View>
      ) : (
        staffList.map((item) => {
          const mappedServiceNames = services
            .filter((s) => (item.service_ids || []).includes(s.id))
            .map((s) => s.name);

          return (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarLetter}>
                    {item.name ? item.name.charAt(0).toUpperCase() : 'S'}
                  </Text>
                </View>

                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.staffName}>{item.name}</Text>
                  <Text style={styles.staffRole}>{item.role || 'Stylist / Therapist'}</Text>
                  <Text style={styles.staffOutlet}>
                    📍 {item.outlet_name || 'Semua Outlet'}
                  </Text>
                </View>

                {/* Toggle Active Badge */}
                <TouchableOpacity
                  style={[styles.statusBadge, item.is_active ? styles.activeBadge : styles.offBadge]}
                  onPress={() => handleToggleActive(item)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.statusText, item.is_active ? styles.activeText : styles.offText]}>
                    {item.is_active ? '🟢 Bertugas' : '🏖️ Cuti'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Skills breakdown */}
              <View style={styles.skillsSection}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                  <Scissors size={12} color={COLORS.emerald} />
                  <Text style={styles.skillsTitle}>
                    Keahlian Layanan ({mappedServiceNames.length}):
                  </Text>
                </View>

                <View style={styles.skillsChips}>
                  {mappedServiceNames.length > 0 ? (
                    mappedServiceNames.map((srv, idx) => (
                      <View key={idx} style={styles.chip}>
                        <Text style={styles.chipText}>{srv}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noSkillsText}>Belum memilih keahlian</Text>
                  )}
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
          );
        })
      )}

      {/* Add / Edit Modal */}
      <Modal visible={isModalOpen} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Users size={18} color={COLORS.rosegold} />
                <Text style={styles.modalTitle}>
                  {editingStaff ? 'Edit Data Staff' : 'Tambah Staff Baru'}
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

              <Text style={styles.inputLabel}>NAMA STAFF</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Contoh: Rina Beautician"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <Text style={styles.inputLabel}>PERAN / ROLE</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Stylist / Therapist / Hair Specialist"
                  value={role}
                  onChangeText={setRole}
                />
              </View>

              <Text style={styles.inputLabel}>CABANG OUTLET TUGAS</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                {outlets.map((o) => (
                  <TouchableOpacity
                    key={o.id}
                    style={[styles.outletChip, outletId === String(o.id) && styles.outletChipActive]}
                    onPress={() => setOutletId(String(o.id))}
                  >
                    <MapPin size={12} color={outletId === String(o.id) ? COLORS.white : COLORS.emerald} />
                    <Text style={[styles.outletChipText, outletId === String(o.id) && styles.outletChipTextActive]}>
                      {o.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.inputLabel}>KEAHLIAN LAYANAN SALON</Text>
              <View style={styles.skillsChecklist}>
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
                      <Text style={styles.checkDuration}>{s.duration_minutes} Menit</Text>
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
                    {editingStaff ? 'Simpan Perubahan' : 'Tambah Staff'}
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
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.greyBorder,
    ...SHADOWS.small,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.emeraldLight,
    borderWidth: 1,
    borderColor: COLORS.rosegold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.emerald,
  },
  staffName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.slateDark,
  },
  staffRole: {
    fontSize: 11,
    color: COLORS.rosegold,
    fontWeight: '700',
  },
  staffOutlet: {
    fontSize: 10,
    color: COLORS.emerald,
    fontWeight: '600',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  activeBadge: {
    backgroundColor: '#D1FAE5',
    borderColor: '#34D399',
  },
  offBadge: {
    backgroundColor: '#FEE2E2',
    borderColor: '#F87171',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  activeText: {
    color: '#047857',
  },
  offText: {
    color: '#B91C1C',
  },
  skillsSection: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.greyBorder,
  },
  skillsTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.greyText,
  },
  skillsChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  chip: {
    backgroundColor: COLORS.creamDark,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.greyBorder,
  },
  chipText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.slateDark,
  },
  noSkillsText: {
    fontSize: 10,
    color: '#B91C1C',
    fontStyle: 'italic',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 10,
    paddingTop: 8,
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
    fontSize: 15,
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
  outletChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.greyBorder,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 6,
  },
  outletChipActive: {
    backgroundColor: COLORS.emerald,
    borderColor: COLORS.emerald,
  },
  outletChipText: {
    fontSize: 11,
    color: COLORS.slateDark,
    fontWeight: '600',
  },
  outletChipTextActive: {
    color: COLORS.white,
  },
  skillsChecklist: {
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
  checkDuration: {
    fontSize: 10,
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
