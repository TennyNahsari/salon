import React, { useState } from 'react';
import { LayoutDashboard, CalendarCheck, Scissors, CreditCard, LogOut, Sparkles, Home, ExternalLink, Users, Globe, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function AdminSidebar({ activeTab, setActiveTab, onGoHome }) {
  const { logout, admin } = useAuth();
  const { lang, toggleLang, t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { id: 'overview', label: t('menu_overview'), icon: LayoutDashboard },
    { id: 'bookings', label: t('menu_bookings'), icon: CalendarCheck },
    { id: 'payments_module', label: t('menu_payments_module'), icon: CreditCard },
    { id: 'services', label: t('menu_services'), icon: Scissors },
    { id: 'staff', label: t('menu_staff'), icon: Users },
    { id: 'payment', label: t('menu_payment_config'), icon: CreditCard },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Top Navbar Bar for Admin on Small Screens */}
      <div className="md:hidden bg-emeraldsoft text-white p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-rosegold flex items-center justify-center text-emeraldsoft font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-serif font-bold text-lg text-cream">LUXE ADMIN</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleLang}
            className="px-2.5 py-1 rounded-full bg-white/10 text-xs font-bold text-cream"
          >
            {lang === 'id' ? '🇮🇩 ID' : '🇬🇧 EN'}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg text-cream hover:bg-white/10"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Main Sidebar Container (Desktop static, Mobile drawer overlay) */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 bg-emeraldsoft text-white flex flex-col justify-between p-6 min-h-screen transition-transform duration-300
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="space-y-6">
          
          {/* Brand Logo Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rosegold flex items-center justify-center text-emeraldsoft font-bold shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold text-cream">{t('admin_title')}</h2>
                <span className="text-[10px] text-cream-200 uppercase tracking-widest block font-sans">{t('admin_subtitle')}</span>
              </div>
            </div>

            {/* Language Switcher Badge in Sidebar */}
            <button
              onClick={toggleLang}
              className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold text-cream transition-colors"
              title="Switch Language / Ganti Bahasa"
            >
              <Globe className="w-3.5 h-3.5 text-rosegold" />
              <span>{lang === 'id' ? '🇮🇩 ID' : '🇬🇧 EN'}</span>
            </button>
          </div>

          {/* User Info Badge */}
          <div className="bg-white/10 p-3 rounded-xl text-xs space-y-0.5">
            <span className="text-cream-200/70 block">{t('admin_logged_as')}</span>
            <span className="font-bold text-rosegold text-sm block">👤 {admin?.username || 'Admin'}</span>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                    isActive
                      ? 'bg-rosegold text-slate-dark font-bold shadow-md'
                      : 'text-cream-200 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="pt-6 border-t border-white/10 space-y-2">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-cream-200 hover:bg-white/10 hover:text-white transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-rosegold" />
            <span>{t('nav_open_website')} (Tab Baru)</span>
          </a>

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-status-coral hover:bg-status-coral/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('btn_logout')}</span>
          </button>
        </div>

      </aside>

      {/* Backdrop overlay for mobile drawer */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-dark/50 z-40 md:hidden backdrop-blur-xs"
        />
      )}
    </>
  );
}
