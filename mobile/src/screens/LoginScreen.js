import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Sparkles, User, Lock, ArrowLeft, ShieldCheck } from 'lucide-react-native';
import { COLORS, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Username & Password wajib diisi.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await login(username, password);
      if (res.success) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Dashboard' }],
        });
      } else {
        setError(res.message || 'Login gagal.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Gagal login. Periksa koneksi dan kredensial Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Back Button */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.7}
        >
          <ArrowLeft size={16} color={COLORS.emerald} />
          <Text style={styles.backBtnText}>Kembali ke Landing Page</Text>
        </TouchableOpacity>

        {/* Card */}
        <View style={styles.card}>
          <View style={styles.brandBadge}>
            <Sparkles size={24} color={COLORS.rosegold} />
          </View>

          <Text style={styles.title}>Portal Admin Salon</Text>
          <Text style={styles.subtitle}>Masukkan kredensial admin untuk mengakses dashboard mobile.</Text>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>USERNAME ADMIN</Text>
          <View style={styles.inputBox}>
            <User size={16} color={COLORS.greyText} />
            <TextInput
              style={styles.textInput}
              placeholder="admin"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <Text style={styles.label}>PASSWORD ADMIN</Text>
          <View style={styles.inputBox}>
            <Lock size={16} color={COLORS.greyText} />
            <TextInput
              style={styles.textInput}
              placeholder="••••••••"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {/* Hint info box */}
          <View style={styles.hintBox}>
            <Text style={styles.hintTitle}>💡 Info Login Default:</Text>
            <Text style={styles.hintText}>Username: <Text style={styles.hintBold}>admin</Text></Text>
            <Text style={styles.hintText}>Password: <Text style={styles.hintBold}>admin123</Text></Text>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.disabledBtn]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <ShieldCheck size={18} color={COLORS.rosegold} />
                <Text style={styles.submitBtnText}>Masuk Dashboard</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 30,
    justifyContent: 'center',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  backBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.emerald,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.greyBorder,
    ...SHADOWS.medium,
  },
  brandBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.emerald,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.slateDark,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.greyText,
    textAlign: 'center',
    marginBottom: 18,
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#F87171',
    padding: 10,
    borderRadius: 12,
    marginBottom: 14,
  },
  errorText: {
    color: '#991B1B',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.greyText,
    letterSpacing: 1,
    marginBottom: 6,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.creamDark,
    borderWidth: 1,
    borderColor: COLORS.greyBorder,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 14,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.slateDark,
    paddingVertical: 8,
  },
  hintBox: {
    backgroundColor: COLORS.emeraldLight,
    padding: 12,
    borderRadius: 12,
    marginBottom: 18,
    gap: 2,
  },
  hintTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.emerald,
    marginBottom: 2,
  },
  hintText: {
    fontSize: 11,
    color: COLORS.emeraldDark,
  },
  hintBold: {
    fontWeight: '700',
  },
  submitBtn: {
    backgroundColor: COLORS.emerald,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    ...SHADOWS.small,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
