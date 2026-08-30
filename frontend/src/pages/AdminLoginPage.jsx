import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Lock, User, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function AdminLoginPage({ onGoHome, onSuccessLogin }) {
  const { login } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Username dan Password wajib diisi.');
      return;
    }

    try {
      setLoading(true);
      const res = await login(username, password);
      if (res.success) {
        if (onSuccessLogin) onSuccessLogin();
      } else {
        setError(res.message || 'Login gagal.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal. Periksa kredensial Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Decorative Blobs */}
      <div className="absolute top-10 left-10 w-80 h-80 bg-lavender/30 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-rosegold/20 rounded-full blur-3xl" />

      {/* Back Button */}
      <button
        onClick={onGoHome}
        className="absolute top-6 left-6 flex items-center gap-2 text-slate-dark hover:text-emeraldsoft text-sm font-semibold transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Website</span>
      </button>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-grey-border shadow-modal relative z-10 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-emeraldsoft text-rosegold flex items-center justify-center mx-auto shadow-md">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-slate-dark">Portal Admin Salon</h2>
          <p className="text-grey-soft text-xs">Masukkan kredensial admin untuk mengakses dashboard.</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-status-coral/10 border border-status-coral/30 text-status-coral text-xs font-semibold text-center">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-dark mb-1">
              Username Admin
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 w-4 h-4 text-grey-soft" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-grey-border focus:border-emeraldsoft outline-none text-sm text-slate-dark"
                placeholder="admin"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-dark mb-1">
              Password Admin
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-grey-soft" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-grey-border focus:border-emeraldsoft outline-none text-sm text-slate-dark"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {/* Hint info */}
          <div className="p-3 rounded-xl bg-cream-100 border border-cream-200 text-xs text-grey-soft space-y-1">
            <span className="font-bold text-emeraldsoft block">💡 Info Login Default:</span>
            <p>Username: <code className="font-bold text-slate-dark">admin</code></p>
            <p>Password: <code className="font-bold text-slate-dark">admin123</code></p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-emeraldsoft text-white font-bold text-sm shadow-luxury hover:bg-emeraldsoft-dark transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-5 h-5 text-rosegold" />
            <span>{loading ? 'Memverifikasi...' : 'Masuk Dashboard'}</span>
          </button>
        </form>

      </div>

    </div>
  );
}
