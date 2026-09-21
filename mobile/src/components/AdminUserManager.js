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
import { ShieldCheck, UserPlus, Edit2, Trash2, Key, MapPin, X, Building2 } from 'lucide-react-native';
import { COLORS, SHADOWS } from '../constants/theme';
import { getUsers, createUser, updateUser, deleteUser, getOutlets } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AdminUserManager() {
  const { admin: currentAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('outlet_admin');
  const [outletId, setOutletId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, outletsRes] = await Promise.all([
        getUsers(),
        getOutlets(false),
      ]);

      if (usersRes.success) setUsers(usersRes.users || []);
      if (outletsRes.success) setOutlets(outletsRes.outlets || []);
    } catch (err) {
      console.error('Error fetching user manager data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setUsername('');
    setName('');
    setPassword('');
    setRole('outlet_admin');
    setOutletId(outlets && outlets.length > 0 ? String(outlets[0].id) : '');
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (u) => {
    setEditingUser(u);
    setUsername(u.username || '');
    setName(u.name || '');
    setPassword('');
    setRole(u.role || 'outlet_admin');
    setOutletId(u.outlet_id ? String(u.outlet_id) : '');
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!username.trim() || !name.trim()) {
      setError('Username & Nama Pengguna wajib diisi.');
      return;
    }

    if (!editingUser && !password.trim()) {
      setError('Password wajib diisi untuk akun baru.');
      return;
    }

    if (role === 'outlet_admin' && !outletId) {
      setError('Pilih cabang outlet untuk peran Outlet Admin.');
      return;
    }

    setError('');
    setSaving(true);

    try {
      const payload = {
        username,
        name,
        password,
        role,
        outlet_id: outletId,
      };

      let res;
      if (editingUser) {
        res = await updateUser(editingUser.id, payload);
      } else {
        res = await createUser(payload);
      }

      if (res.success) {
        setIsModalOpen(false);
        fetchData();
      } else {
        setError(res.message || 'Gagal menyimpan data user.');
      }
    } catch (err) {
      console.error('Save user error:', err);
      setError(err.response?.data?.message || 'Gagal menyimpan data user.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (u) => {
    if (currentAdmin && currentAdmin.id === u.id) {
      Alert.alert('Peringatan', 'Anda tidak dapat menghapus akun sendiri!');
      return;
    }

    const doDelete = async () => {
      try {
        const res = await deleteUser(u.id);
        if (res.success) fetchData();
      } catch (err) {
        Alert.alert('Error', err.response?.data?.message || 'Gagal menghapus user.');
      }
    };

    const confirmMsg = `Hapus akun user "${u.username}" secara permanen?`;
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
          <Text style={styles.topTitle}>KELOLA AKUN USER (USERS & ROLES)</Text>
          <Text style={styles.topSub}>Atur kredensial Super Admin & Outlet Admin cabang</Text>
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={handleOpenAddModal} activeOpacity={0.8}>
          <UserPlus size={16} color={COLORS.white} />
          <Text style={styles.addBtnText}>Tambah User</Text>
        </TouchableOpacity>
      </View>

      {/* User list */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color={COLORS.emerald} />
          <Text style={styles.loadingText}>Memuat data akun user...</Text>
        </View>
      ) : users.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Belum ada user terdaftar.</Text>
        </View>
      ) : (
        users.map((item) => {
          const isSuper = item.role === 'admin';
          const isCurrent = currentAdmin && currentAdmin.id === item.id;
          return (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.avatarBadge}>
                  <Text style={{ fontSize: 16 }}>{isSuper ? '👑' : '👤'}</Text>
                </View>

                <View style={{ flex: 1, marginLeft: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.usernameText}>{item.username}</Text>
                    {isCurrent ? <Text style={styles.myAccountTag}>(Akun Anda)</Text> : null}
                  </View>
                  <Text style={styles.fullName}>{item.name}</Text>
                  <Text style={styles.outletName}>
                    {isSuper ? '🌐 Semua Cabang' : `📍 ${item.outlet_name || 'Belum ditentukan'}`}
                  </Text>
                </View>

                <View style={[styles.roleBadge, isSuper ? styles.superBadge : styles.outletAdminBadge]}>
                  <Text style={[styles.roleBadgeText, isSuper ? styles.superText : styles.outletAdminText]}>
                    {isSuper ? 'SUPER ADMIN' : 'OUTLET ADMIN'}
                  </Text>
                </View>
              </View>

              {/* Card Footer Actions */}
              <View style={styles.cardFooter}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => handleOpenEditModal(item)}
                  activeOpacity={0.7}
                >
                  <Edit2 size={14} color={COLORS.slateDark} />
                  <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>

                {item.username !== 'admin' && !isCurrent ? (
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(item)}
                    activeOpacity={0.7}
                  >
                    <Trash2 size={14} color="#B91C1C" />
                    <Text style={styles.deleteBtnText}>Hapus</Text>
                  </TouchableOpacity>
                ) : null}
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
                <ShieldCheck size={18} color={COLORS.rosegold} />
                <Text style={styles.modalTitle}>
                  {editingUser ? 'Edit Kredensial User' : 'Tambah Akun User Baru'}
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

              <Text style={styles.inputLabel}>USERNAME LOGIN</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.textInput}
                  placeholder="admin_senopati"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </View>

              <Text style={styles.inputLabel}>NAMA LENGKAP PENGGUNA</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Siti Rahmawati"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <Text style={styles.inputLabel}>
                {editingUser ? 'PASSWORD BARU (KOSONGKAN JIKA TIDAK DIGANTI)' : 'PASSWORD AKUN'}
              </Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.textInput}
                  placeholder="••••••••"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              <Text style={styles.inputLabel}>PERAN / ROLE AKUN</Text>
              <View style={styles.roleGrid}>
                <TouchableOpacity
                  style={[styles.roleCard, role === 'outlet_admin' && styles.roleCardActive]}
                  onPress={() => setRole('outlet_admin')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.roleTitle, role === 'outlet_admin' && styles.roleTitleActive]}>
                    📍 Outlet Admin
                  </Text>
                  <Text style={styles.roleDesc}>Akses dibatasi hanya untuk 1 cabang tertentu.</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.roleCard, role === 'admin' && styles.roleCardActiveSuper]}
                  onPress={() => setRole('admin')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.roleTitle, role === 'admin' && styles.roleTitleActiveSuper]}>
                    👑 Super Admin
                  </Text>
                  <Text style={styles.roleDesc}>Akses penuh ke semua cabang & fitur sistem.</Text>
                </TouchableOpacity>
              </View>

              {role === 'outlet_admin' && (
                <View>
                  <Text style={styles.inputLabel}>PILIH CABANG OUTLET TUGAS</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
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
                </View>
              )}
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
                    {editingUser ? 'Simpan Akun' : 'Tambah Akun User'}
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
  avatarBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.creamDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  usernameText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.slateDark,
  },
  myAccountTag: {
    fontSize: 10,
    color: COLORS.emerald,
    fontWeight: '700',
  },
  fullName: {
    fontSize: 12,
    color: COLORS.greyText,
  },
  outletName: {
    fontSize: 10,
    color: COLORS.emerald,
    fontWeight: '600',
    marginTop: 2,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  superBadge: {
    backgroundColor: COLORS.rosegoldLight,
    borderColor: COLORS.rosegold,
  },
  outletAdminBadge: {
    backgroundColor: COLORS.emeraldLight,
    borderColor: COLORS.emerald,
  },
  roleBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  superText: {
    color: '#854D0E',
  },
  outletAdminText: {
    color: COLORS.emerald,
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
  roleGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  roleCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.greyBorder,
    padding: 10,
    borderRadius: 12,
  },
  roleCardActive: {
    backgroundColor: COLORS.emeraldLight,
    borderColor: COLORS.emerald,
  },
  roleCardActiveSuper: {
    backgroundColor: COLORS.rosegoldLight,
    borderColor: COLORS.rosegold,
  },
  roleTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.slateDark,
    marginBottom: 2,
  },
  roleTitleActive: {
    color: COLORS.emerald,
  },
  roleTitleActiveSuper: {
    color: '#854D0E',
  },
  roleDesc: {
    fontSize: 9,
    color: COLORS.greyText,
    lineHeight: 12,
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
