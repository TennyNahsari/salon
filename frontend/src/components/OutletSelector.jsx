import React, { useState, useRef } from 'react';
import { MapPin, Phone, CheckCircle, Sparkles, Building2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getPaginationRange } from '../utils/pagination';

export default function OutletSelector({ outlets, selectedOutlet, onSelectOutlet, loading }) {
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8 sm:mb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-white rounded-2xl p-4 border border-grey-border shadow-soft h-36" />
          ))}
        </div>
      </div>
    );
  }

  if (!outlets || outlets.length === 0) return null;

  // Pagination Math
  const totalPages = Math.ceil(outlets.length / itemsPerPage) || 1;
  const validPage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (validPage - 1) * itemsPerPage;
  const visibleOutlets = outlets.slice(startIndex, startIndex + itemsPerPage);

  const handlePrev = () => {
    if (validPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (validPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    // Swipe left (next)
    if (diff > 50 && validPage < totalPages) {
      handleNext();
    }
    // Swipe right (prev)
    if (diff < -50 && validPage > 1) {
      handlePrev();
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-10 sm:mb-14">
      
      {/* Header Banner */}
      <div className="text-center space-y-2 mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emeraldsoft/10 text-emeraldsoft text-[11px] sm:text-xs font-bold uppercase tracking-wider border border-emeraldsoft/20 shadow-xs">
          <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rosegold" />
          <span>{t('select_outlet_label')}</span>
        </div>
        <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-slate-dark px-2">
          {t('select_outlet_heading')}
        </h3>
        <p className="text-grey-soft text-xs sm:text-sm max-w-lg mx-auto px-2">
          {t('select_outlet_subheading')}
        </p>
      </div>

      {/* Outer Wrapper with Side Arrow Controls */}
      <div 
        className="relative group"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >

        {/* Left Arrow Button (Desktop) */}
        {totalPages > 1 && (
          <button
            onClick={handlePrev}
            disabled={validPage === 1}
            className="hidden lg:flex absolute -left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white border border-rosegold/40 text-emeraldsoft shadow-luxury items-center justify-center hover:bg-emeraldsoft hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-all duration-300 active:scale-95"
            title="Cabang Sebelumnya"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Right Arrow Button (Desktop) */}
        {totalPages > 1 && (
          <button
            onClick={handleNext}
            disabled={validPage === totalPages}
            className="hidden lg:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white border border-rosegold/40 text-emeraldsoft shadow-luxury items-center justify-center hover:bg-emeraldsoft hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-all duration-300 active:scale-95"
            title="Cabang Berikutnya"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Outlet Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 transition-all duration-500 ease-in-out">
          {visibleOutlets.map((outlet) => {
            const isSelected = selectedOutlet?.id === outlet.id;
            const defaultImg = 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=600&q=80';

            return (
              <div
                key={outlet.id}
                onClick={() => onSelectOutlet(outlet)}
                className={`
                  relative cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between border-2 active:scale-[0.98] select-none group
                  ${isSelected 
                    ? 'bg-gradient-to-br from-emeraldsoft via-[#164e3c] to-emeraldsoft-dark text-white border-rosegold shadow-luxury ring-2 ring-rosegold/40' 
                    : 'bg-white text-slate-dark border-grey-border hover:border-rosegold/60 hover:shadow-luxury hover:-translate-y-0.5'
                  }
                `}
              >
                {/* Outlet Thumbnail Cover Image */}
                <div className="relative h-40 sm:h-44 w-full bg-cream-100 overflow-hidden">
                  <img
                    src={outlet.image_url || defaultImg}
                    alt={outlet.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = defaultImg;
                    }}
                  />
                  <div className={`absolute inset-0 ${isSelected ? 'bg-gradient-to-t from-emeraldsoft-dark/90 via-emeraldsoft-dark/30 to-transparent' : 'bg-gradient-to-t from-slate-dark/60 via-transparent to-transparent'}`} />

                  {/* Selected Badge Indicator */}
                  {isSelected ? (
                    <div className="absolute top-3 right-3 bg-rosegold text-slate-dark text-[9px] sm:text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md uppercase tracking-wider animate-in fade-in zoom-in duration-200 backdrop-blur-md">
                      <CheckCircle className="w-3.5 h-3.5 fill-current text-slate-dark" />
                      <span>{t('outlet_selected')}</span>
                    </div>
                  ) : (
                    <div className="absolute top-3 right-3 bg-slate-dark/50 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-white/20">
                      📍 Salon Branch
                    </div>
                  )}

                  {/* Outlet Name Overlay on Photo */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <h4 className="font-serif text-base sm:text-lg font-bold text-cream drop-shadow-md leading-tight">
                      {outlet.name}
                    </h4>
                  </div>
                </div>

                {/* Card Body Info */}
                <div className="p-4 sm:p-5 flex-grow flex flex-col justify-between space-y-3">
                  <div className="space-y-2 text-xs">
                    <div className={`flex items-start gap-2 ${isSelected ? 'text-cream-200' : 'text-grey-soft'}`}>
                      <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rosegold shrink-0 mt-0.5" />
                      <span className="line-clamp-2 leading-relaxed text-[11px] sm:text-xs">{outlet.address}</span>
                    </div>

                    {outlet.phone && (
                      <div className={`flex items-center gap-2 ${isSelected ? 'text-cream-200' : 'text-grey-soft'}`}>
                        <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rosegold shrink-0" />
                        <span className="font-mono font-medium text-[11px] sm:text-xs">{outlet.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2.5 sm:pt-3 border-t border-current/15 flex items-center justify-between text-[11px] sm:text-xs font-semibold">
                    <span className={isSelected ? 'text-rosegold font-bold' : 'text-emeraldsoft font-medium'}>
                      {isSelected ? t('outlet_showing_services') : t('outlet_click_to_select')}
                    </span>
                    <Sparkles className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isSelected ? 'text-rosegold animate-spin-slow' : 'text-grey-soft opacity-60'}`} />
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* Pagination Dot / Number Bar (If more than 3 outlets) */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between sm:justify-center gap-2 sm:gap-3 mt-6 sm:mt-8 px-2">
          
          {/* Previous Button */}
          <button
            onClick={handlePrev}
            disabled={validPage === 1}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white border border-grey-border text-emeraldsoft hover:bg-emeraldsoft hover:text-white disabled:opacity-30 active:scale-95 text-xs font-semibold shadow-xs transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev</span>
          </button>

          {/* Dots & Page Indicator */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-white px-3 sm:px-4 py-1.5 rounded-2xl border border-grey-border shadow-xs">
            {getPaginationRange(validPage, totalPages).map((item, idx) => {
              if (item === '...') {
                return (
                  <span key={`dots-${idx}`} className="px-1.5 py-0.5 text-grey-soft text-xs font-bold select-none">
                    ...
                  </span>
                );
              }
              const pageNum = item;
              const isActive = pageNum === validPage;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg font-bold text-xs transition-all ${
                    isActive 
                      ? 'bg-emeraldsoft text-rosegold shadow-sm scale-105 ring-1 ring-rosegold/50' 
                      : 'bg-cream-100 text-slate-dark border border-grey-border hover:border-rosegold hover:text-emeraldsoft'
                  }`}
                  title={`Halaman Cabang ${pageNum}`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            disabled={validPage === totalPages}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white border border-grey-border text-emeraldsoft hover:bg-emeraldsoft hover:text-white disabled:opacity-30 active:scale-95 text-xs font-semibold shadow-xs transition-all"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>

        </div>
      )}

    </div>
  );
}
