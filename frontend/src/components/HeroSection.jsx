import React from 'react';
import { Calendar, Sparkles, Clock, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function HeroSection({ onBookingClick }) {
  const { t } = useLanguage();

  return (
    <section id="home" className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-16 px-4 overflow-hidden">
      {/* Soft Gradient Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-cream via-cream-100 to-cream pointer-events-none" />
      
      {/* Decorative Luxury Circle Ambient Backgrounds */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-lavender/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-rosegold/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto text-center z-10 space-y-8">
        
        {/* Top Tagline */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-rosegold/40 text-emeraldsoft text-xs sm:text-sm font-medium shadow-sm backdrop-blur-sm">
          <Sparkles className="w-4 h-4 text-rosegold" />
          <span>{t('hero_badge')}</span>
        </div>

        {/* Main Title */}
        <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold text-slate-dark tracking-tight leading-[1.15]">
          {t('hero_title_1')} <br />
          <span className="gold-gradient-text italic font-serif">{t('hero_title_2')}</span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-dark/80 font-normal leading-relaxed">
          {t('hero_subtitle')}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => onBookingClick()}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emeraldsoft text-white font-semibold text-base shadow-luxury hover:bg-emeraldsoft-dark hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
          >
            <Calendar className="w-5 h-5 text-rosegold group-hover:rotate-12 transition-transform" />
            <span>{t('hero_btn_book')}</span>
          </button>
          
          <a
            href="#services"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white border border-grey-border text-emeraldsoft font-semibold text-base shadow-soft hover:border-rosegold hover:text-rosegold-dark transition-all text-center"
          >
            {t('hero_btn_explore')}
          </a>
        </div>

        {/* Feature Highlights */}
        <div className="pt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-white/60 border border-cream-200 backdrop-blur-sm">
            <Clock className="w-5 h-5 text-rosegold" />
            <span className="text-xs sm:text-sm font-medium text-slate-dark">{t('hero_feat_instant')}</span>
          </div>
          <div className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-white/60 border border-cream-200 backdrop-blur-sm">
            <ShieldCheck className="w-5 h-5 text-emeraldsoft" />
            <span className="text-xs sm:text-sm font-medium text-slate-dark">{t('hero_feat_qris')}</span>
          </div>
          <div className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-white/60 border border-cream-200 backdrop-blur-sm">
            <Sparkles className="w-5 h-5 text-lavender-dark" />
            <span className="text-xs sm:text-sm font-medium text-slate-dark">{t('hero_feat_therapist')}</span>
          </div>
        </div>

      </div>
    </section>
  );
}
