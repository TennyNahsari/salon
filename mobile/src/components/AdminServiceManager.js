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
  Image,
} from 'react-native';
import { Scissors, Plus, Edit2, Trash2, Clock, Tag, X, MapPin } from 'lucide-react-native';
import { COLORS, SHADOWS } from '../constants/theme';
import { getServices, createService, updateService, deleteService, getOutlets } from '../services/api';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=600&q=80';

export default function AdminServiceManager() {
  const [services, setServices] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('60');
  const [price, setPrice] = useState('150000');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(DEFAULT_IMAGE);
  const [selectedOutletIds, setSelectedOutletIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [servicesRes, outletsRes] = await Promise.all([
        getServices(),
        getOutlets(false),
      ]);

      if (servicesRes.success) setServices(servicesRes.services || []);
      if (outletsRes.success) setOutlets(outletsRes.outlets || []);
    } catch (err) {
      console.error('Error fetching services manager:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingService(null);
    setName('');
    setDuration('60');
    setPrice('150000');
    setDescription('');
    setImageUrl(DEFAULT_IMAGE);
    setSelectedOutletIds(outlets.map((o) => o.id));
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (service) => {
    setEditingService(service);
    setName(service.name || '');
    setDuration(String(service.duration_minutes || 60));
    setPrice(String(service.price || 0));
    setDescription(service.description || '');
    setImageUrl(service.image_url || DEFAULT_IMAGE);
    setSelectedOutletIds(Array.isArray(service.outlet_ids) ? service.outlet_ids : []);
    setError('');
    setIsModalOpen(true);
  };

  const toggleOutlet = (outletId) => {
    setSelectedOutletIds((prev) =>
      prev.includes(outletId)
        ? prev.filter((id) => id !== outletId)
        : [...prev, outletId]
    );
  };

  const handleSubmit = async () => {
    if (!name.trim() || !duration || !price) {
      setError('Nama, durasi, dan harga layanan wajib diisi.');
      return;
    }

    setError('');
    setSaving(true);

    try {
      const payload = {
        name,
        duration_minutes: Number(duration),
        price: Number(price),
        description,
        image_url: imageUrl,
        outlet_ids: selectedOutletIds,
      };

      let res;
      if (editingService) {
        res = await updateService(editingService.id, payload);
      } else {
        res = await createService(payload);
      }

      if (res.success) {
        setIsModalOpen(false);
        fetchData();
      } else {
        setError(res.message || 'Gagal menyimpan layanan.');
      }
    } catch (err) {
      console.error('Save service error:', err);
      setError(err.response?.data?.message || 'Gagal menyimpan layanan.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (service) => {
    const doDelete = async () => {
      try {
        const res = await deleteService(service.id);
        if (res.success) fetchData();
      } catch (err) {
        Alert.alert('Error', err.response?.data?.message || 'Gagal menghapus layanan.');
      }
    };

    const confirmMsg = `Hapus layanan "${service.name}" secara permanen?`;
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

  const formatPrice = (p) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(p || 0);
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.topTitle}>KELOLA LAYANAN SALON (SERVICES)</Text>
          <Text style={styles.topSub}>Atur katalog treatment, harga, durasi, dan cabang outlet</Text>
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={handleOpenAddModal} activeOpacity={0.8}>
          <Plus size={16} color={COLORS.white} />
          <Text style={styles.addBtnText}>Tambah Layanan</Text>
        </TouchableOpacity>
      </View>

      {/* Services List */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color={COLORS.emerald} />
          <Text style={styles.loadingText}>Memuat layanan salon...</Text>
        </View>
      ) : services.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Belum ada layanan salon terdaftar.</Text>
        </View>
      ) : (
        services.map((item) => {
          const mappedOutlets = outlets.filter((o) => (item.outlet_ids || []).includes(o.id));
          return (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardMain}>
                <Image source={{ uri: item.image_url || DEFAULT_IMAGE }} style={styles.serviceImg} />
                
                <View style={styles.cardBody}>
                  <Text style={styles.serviceName}>{item.name}</Text>
                  <Text style={styles.servicePrice}>{formatPrice(item.price)}</Text>
                  
                  <View style={styles.durationRow}>
                    <Clock size={12} color={COLORS.greyText} />
                    <Text style={styles.durationText}>{item.duration_minutes} Menit</Text>
                  </View>

                  {item.description ? (
                    <Text style={styles.serviceDesc} numberOfLines={2}>
                      {item.description}
                    </Text>
                  ) : null}
                </View>
              </View>

              {/* Outlet Badges */}
              <View style={styles.outletSection}>
                <Text style={styles.outletTitle}>📍 Cabang Outlet:</Text>
                <View style={styles.outletChips}>
                  {mappedOutlets.length > 0 ? (
                    mappedOutlets.map((o) => (
                      <View key={o.id} style={styles.chip}>
                        <Text style={styles.chipText}>{o.name}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.unassignedText}>Belum di-assign ke outlet</Text>
                  )}
                </View>
              </View>

              {/* Action Buttons */}
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
                <Scissors size={18} color={COLORS.rosegold} />
                <Text style={styles.modalTitle}>
                  {editingService ? 'Edit Layanan Salon' : 'Tambah Layanan Baru'}
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

              <Text style={styles.inputLabel}>NAMA LAYANAN</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Contoh: Premium Hair Spa & Blow"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.rowGrid}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>DURASI (MENIT)</Text>
                  <View style={styles.inputBox}>
                    <TextInput
                      style={styles.textInput}
                      placeholder="60"
                      keyboardType="numeric"
                      value={duration}
                      onChangeText={setDuration}
                    />
                  </View>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>HARGA (RP)</Text>
                  <View style={styles.inputBox}>
                    <TextInput
                      style={styles.textInput}
                      placeholder="150000"
                      keyboardType="numeric"
                      value={price}
                      onChangeText={setPrice}
                    />
                  </View>
                </View>
              </View>

              <Text style={styles.inputLabel}>URL FOTO LAYANAN</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.textInput}
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChangeText={setImageUrl}
                />
              </View>

              <Text style={styles.inputLabel}>DESKRIPSI LAYANAN</Text>
              <View style={[styles.inputBox, { height: 70 }]}>
                <TextInput
                  style={[styles.textInput, { textAlignVertical: 'top' }]}
                  placeholder="Deskripsi rincian treatment salon..."
                  multiline
                  value={description}
                  onChangeText={setDescription}
                />
              </View>

              {/* Outlet Checklist */}
              <Text style={styles.inputLabel}>BERLAKU DI CABANG OUTLET</Text>
              <View style={styles.outletChecklist}>
                {outlets.map((o) => {
                  const isChecked = selectedOutletIds.includes(o.id);
                  return (
                    <TouchableOpacity
                      key={o.id}
                      style={[styles.checkRow, isChecked && styles.checkRowActive]}
                      onPress={() => toggleOutlet(o.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.checkName, isChecked && styles.checkNameActive]}>
                        📍 {o.name}
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
                    {editingService ? 'Simpan Perubahan' : 'Tambah Layanan'}
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
  cardMain: {
    flexDirection: 'row',
    gap: 12,
  },
  serviceImg: {
    width: 70,
    height: 70,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
  },
  cardBody: {
    flex: 1,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.slateDark,
    marginBottom: 2,
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.emerald,
    marginBottom: 4,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  durationText: {
    fontSize: 10,
    color: COLORS.greyText,
  },
  serviceDesc: {
    fontSize: 11,
    color: COLORS.greyText,
    lineHeight: 15,
  },
  outletSection: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.greyBorder,
  },
  outletTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.greyText,
    marginBottom: 4,
  },
  outletChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  chip: {
    backgroundColor: COLORS.emeraldLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  chipText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.emerald,
  },
  unassignedText: {
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
  rowGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  outletChecklist: {
    gap: 6,
    marginTop: 4,
    marginBottom: 20,
  },
  checkRow: {
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
