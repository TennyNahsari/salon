import React from 'react';
import { Sparkles, MapPin, Clock, Phone, Instagram, Facebook, Twitter, Youtube, Linkedin, AtSign } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Footer({ onAdminClick, configs }) {
  const { t } = useLanguage();

  const socials = [
    { name: 'Instagram', icon: Instagram, url: configs?.social_instagram || 'https://instagram.com' },
    { name: 'Twitter / X', icon: Twitter, url: configs?.social_twitter || 'https://twitter.com' },
    { name: 'YouTube', icon: Youtube, url: configs?.social_youtube || 'https://youtube.com' },
    { name: 'Facebook', icon: Facebook, url: configs?.social_facebook || 'https://facebook.com' },
    { name: 'LinkedIn', icon: Linkedin, url: configs?.social_linkedin || 'https://linkedin.com' },
    { name: 'Threads', icon: AtSign, url: configs?.social_threads || 'https://threads.net' },
  ];

  return (
    <footer className="bg-emeraldsoft text-white pt-16 pb-8 border-t border-emeraldsoft-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
        
        {/* Col 1: Brand Info */}
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-rosegold flex items-center justify-center text-emeraldsoft font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-serif text-2xl font-bold tracking-wide text-cream">LUXE SALON</span>
          </div>
          <p className="text-cream-200/80 text-xs leading-relaxed">
            {t('footer_desc')}
          </p>
        </div>

        {/* Col 2: Operational Hours */}
        <div className="space-y-3">
          <h4 className="font-serif text-lg font-bold text-rosegold flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{t('footer_hours_title')}</span>
          </h4>
          <ul className="text-xs text-cream-200/90 space-y-1.5">
            <li className="flex justify-between border-b border-white/10 pb-1">
              <span>{t('footer_weekdays')}</span>
              <span className="font-semibold text-cream">09:00 - 20:00 WIB</span>
            </li>
            <li className="flex justify-between border-b border-white/10 pb-1">
              <span>{t('footer_weekends')}</span>
              <span className="font-semibold text-cream">08:00 - 21:00 WIB</span>
            </li>
          </ul>
        </div>

        {/* Col 3: Address & Contact */}
        <div className="space-y-3">
          <h4 className="font-serif text-lg font-bold text-rosegold flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{t('footer_location_title')}</span>
          </h4>
          <p className="text-xs text-cream-200/90 leading-relaxed">
            Jl. Senopati No. 45, Kebayoran Baru, Jakarta Selatan
          </p>
          <div className="flex items-center gap-2 text-xs text-cream-200">
            <Phone className="w-4 h-4 text-rosegold" />
            <span>+{configs?.whatsapp_number || '6281234567890'}</span>
          </div>
        </div>

        {/* Col 4: Social Media & Admin Access */}
        <div className="space-y-4">
          <h4 className="font-serif text-lg font-bold text-rosegold">{t('footer_follow_title')}</h4>
          <div className="flex flex-wrap items-center gap-2">
            {socials.map((item, idx) => {
              const Icon = item.icon;
              return (
                <a
                  key={idx}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  title={item.name}
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-rosegold hover:text-emeraldsoft transition-all hover:scale-110 shadow-sm"
                >
                  <Icon className="w-4 h-4" />
                </a>
              );
            })}
          </div>
          <div className="pt-2">
            <button
              onClick={onAdminClick}
              className="text-xs text-rosegold hover:underline font-medium"
            >
              {t('footer_admin_link')}
            </button>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 pt-6 border-t border-white/10 text-center text-xs text-cream-200/60">
        &copy; {new Date().getFullYear()} Luxe Salon &amp; Spa. All rights reserved.
      </div>
    </footer>
  );
}
