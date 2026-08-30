import React from 'react';
import { Calendar, Clock, CheckCircle2, RefreshCw, CheckCheck, XCircle, TrendingUp } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function DashboardOverview({ stats, onNavigateBookings }) {
  const { t } = useLanguage();

  const cards = [
    {
      title: t('card_total'),
      value: stats?.total || 0,
      icon: Calendar,
      color: 'bg-emeraldsoft text-white',
      border: 'border-emeraldsoft',
    },
    {
      title: t('card_pending'),
      value: stats?.pending || 0,
      icon: Clock,
      color: 'bg-status-gold/10 text-status-gold',
      border: 'border-status-gold/40',
    },
    {
      title: t('card_confirmed'),
      value: stats?.confirmed || 0,
      icon: CheckCircle2,
      color: 'bg-status-green/10 text-status-green',
      border: 'border-status-green/40',
    },
    {
      title: t('card_processed'),
      value: stats?.processed || 0,
      icon: RefreshCw,
      color: 'bg-status-blue/10 text-status-blue',
      border: 'border-status-blue/40',
    },
    {
      title: t('card_completed'),
      value: stats?.completed || 0,
      icon: CheckCheck,
      color: 'bg-emeraldsoft/10 text-emeraldsoft',
      border: 'border-emeraldsoft/30',
    },
    {
      title: t('card_cancelled'),
      value: stats?.cancelled || 0,
      icon: XCircle,
      color: 'bg-status-coral/10 text-status-coral',
      border: 'border-status-coral/40',
    },
  ];

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <h2 className="font-serif text-3xl font-bold text-slate-dark">{t('overview_title')}</h2>
        <p className="text-grey-soft text-sm">{t('overview_subtitle')}</p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`p-6 rounded-2xl bg-white border ${card.border} shadow-soft hover:shadow-luxury transition-all flex items-center justify-between`}
            >
              <div className="space-y-1">
                <span className="text-xs font-semibold text-grey-soft uppercase tracking-wider block">
                  {card.title}
                </span>
                <span className="font-serif text-3xl font-bold text-slate-dark block">
                  {card.value}
                </span>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Action Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emeraldsoft to-emeraldsoft-dark text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-luxury">
        <div className="space-y-1">
          <h3 className="font-serif text-xl font-bold text-cream flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-rosegold" />
            <span>{t('banner_title')}</span>
          </h3>
          <p className="text-cream-200/80 text-xs sm:text-sm">
            {t('banner_subtitle')}
          </p>
        </div>
        <button
          onClick={onNavigateBookings}
          className="px-6 py-3 rounded-xl bg-rosegold text-slate-dark font-bold text-sm hover:bg-rosegold-dark hover:text-white transition-all whitespace-nowrap shadow-md"
        >
          {t('btn_go_bookings')}
        </button>
      </div>

    </div>
  );
}
