import React, { useState, useEffect } from 'react';
import { Search, Sparkles, UserCheck, ShieldCheck, Globe, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar({ onOpenCheckStatus, onSelectServiceClick, onAdminClick }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { admin } = useAuth();
  const { lang, toggleLang, t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? 'glass-nav shadow-soft py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Brand Logo */}
        <a href="#" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-full bg-emeraldsoft flex items-center justify-center text-rosegold shadow-md group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="font-serif text-2xl font-bold tracking-wide text-emeraldsoft block leading-none">
              LUXE
            </span>
            <span className="text-[10px] tracking-[0.25em] font-medium text-rosegold uppercase block">
              Salon &amp; Spa
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 font-medium text-slate-dark text-sm">
          <a href="#home" className="hover:text-emeraldsoft transition-colors">{t('nav_home')}</a>
          <a href="#services" className="hover:text-emeraldsoft transition-colors">{t('nav_services')}</a>
          <a href="#about" className="hover:text-emeraldsoft transition-colors">{t('nav_about')}</a>
        </nav>

        {/* Action Buttons & Language Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* 🇮🇩 ID / 🇬🇧 EN Switcher Button */}
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cream-100 border border-grey-border hover:border-emeraldsoft text-xs font-bold text-slate-dark transition-all shadow-xs"
            title="Switch Language / Ganti Bahasa"
          >
            <Globe className="w-3.5 h-3.5 text-emeraldsoft" />
            <span>{lang === 'id' ? '🇮🇩 ID' : '🇬🇧 EN'}</span>
          </button>

          {/* Cek Status Button */}
          <button
            onClick={onOpenCheckStatus}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full border border-emeraldsoft text-emeraldsoft hover:bg-emeraldsoft hover:text-white transition-all text-xs sm:text-sm font-semibold shadow-sm"
          >
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{t('nav_check_status')}</span>
          </button>

          {/* Admin Dashboard / Login Button */}
          <button
            onClick={onAdminClick}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold transition-all ${
              admin 
                ? 'bg-emeraldsoft text-rosegold hover:bg-emeraldsoft-dark shadow-sm' 
                : 'text-grey-soft hover:text-emeraldsoft hover:bg-cream-200'
            }`}
            title={admin ? t('nav_admin_dashboard') : 'Login Admin / Staff'}
          >
            {admin ? <ShieldCheck className="w-4 h-4 text-rosegold" /> : <UserCheck className="w-4 h-4" />}
            <span>{admin ? `💻 ${t('nav_admin_dashboard')}` : 'Admin'}</span>
          </button>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-dark hover:bg-cream-200 md:hidden transition-colors"
            title="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

        </div>

      </div>

      {/* Mobile Drawer Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-b border-grey-border px-6 py-5 space-y-4 shadow-lg animate-in slide-in-from-top-4">
          <nav className="flex flex-col space-y-3 font-medium text-slate-dark text-sm">
            <a
              href="#home"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 border-b border-cream-200 hover:text-emeraldsoft"
            >
              {t('nav_home')}
            </a>
            <a
              href="#services"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 border-b border-cream-200 hover:text-emeraldsoft"
            >
              {t('nav_services')}
            </a>
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 border-b border-cream-200 hover:text-emeraldsoft"
            >
              {t('nav_about')}
            </a>
          </nav>

          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              onClick={() => { setMobileMenuOpen(false); onAdminClick(); }}
              className="w-full py-2.5 rounded-xl bg-emeraldsoft text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
            >
              {admin ? <ShieldCheck className="w-4 h-4 text-rosegold" /> : <UserCheck className="w-4 h-4" />}
              <span>{admin ? t('nav_admin_dashboard') : 'Login Admin / Staff'}</span>
            </button>
          </div>
        </div>
      )}

    </header>
  );
}
