import React, { useState, useRef } from 'react';
import { MapPin, Phone, CheckCircle, Sparkles, Building2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-6 transition-all duration-500 ease-in-out">
          {visibleOutlets.map((outlet) => {
            const isSelected = selectedOutlet?.id === outlet.id;
            return (
              <div
                key={outlet.id}
                onClick={() => onSelectOutlet(outlet)}
                className={`
                  relative cursor-pointer rounded-2xl p-4 sm:p-6 transition-all duration-300 flex flex-col justify-between border-2 min-h-[160px] sm:min-h-[190px] active:scale-[0.98] select-none
                  ${isSelected 
                    ? 'bg-gradient-to-br from-emeraldsoft via-[#164e3c] to-emeraldsoft-dark text-white border-rosegold shadow-luxury ring-2 ring-rosegold/40' 
                    : 'bg-white text-slate-dark border-grey-border hover:border-rosegold/60 hover:shadow-luxury hover:-translate-y-0.5'
                  }
                `}
              >
                {/* Selected Badge Indicator */}
                {isSelected && (
                  <div className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 bg-rosegold text-slate-dark text-[9px] sm:text-[10px] font-extrabold px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full flex items-center gap-1 shadow-md uppercase tracking-wider animate-in fade-in zoom-in duration-200">
                    <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current text-slate-dark" />
                    <span>{t('outlet_selected')}</span>
                  </div>
                )}

                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-serif font-bold text-lg sm:text-xl shrink-0 shadow-sm ${isSelected ? 'bg-white/20 text-rosegold' : 'bg-cream-100 text-emeraldsoft border border-rosegold/30'}`}>
                      <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="pr-16 sm:pr-0">
                      <h4 className={`font-serif text-base sm:text-lg font-bold leading-tight ${isSelected ? 'text-cream' : 'text-slate-dark'}`}>
                        {outlet.name}
                      </h4>
                    </div>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2 text-xs">
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
                </div>

                <div className="mt-3.5 sm:mt-5 pt-2.5 sm:pt-3.5 border-t border-current/15 flex items-center justify-between text-[11px] sm:text-xs font-semibold">
                  <span className={isSelected ? 'text-rosegold font-bold' : 'text-emeraldsoft font-medium'}>
                    {isSelected ? t('outlet_showing_services') : t('outlet_click_to_select')}
                  </span>
                  <Sparkles className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isSelected ? 'text-rosegold animate-spin-slow' : 'text-grey-soft opacity-60'}`} />
                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* Pagination Dot / Number Bar (If more than 3 outlets) */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between sm:justify-center gap-3 mt-6 sm:mt-8 px-2">
          
          {/* Previous Button */}
          <button
            onClick={handlePrev}
            disabled={validPage === 1}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white border border-grey-border text-emeraldsoft disabled:opacity-30 active:scale-95 text-xs font-semibold shadow-xs"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="sm:hidden">Prev</span>
          </button>

          {/* Dots & Page Indicator */}
          <div className="flex items-center gap-2 bg-white px-3 sm:px-4 py-2 rounded-full border border-grey-border shadow-xs">
            {[...Array(totalPages)].map((_, idx) => {
              const pageNum = idx + 1;
              const isActive = pageNum === validPage;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`transition-all duration-300 rounded-full ${
                    isActive 
                      ? 'w-6 sm:w-8 h-2 sm:h-2.5 bg-emeraldsoft rounded-full shadow-sm' 
                      : 'w-2 sm:w-2.5 h-2 sm:h-2.5 bg-grey-soft/40 hover:bg-rosegold'
                  }`}
                  title={`Halaman Cabang ${pageNum}`}
                />
              );
            })}
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            disabled={validPage === totalPages}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white border border-grey-border text-emeraldsoft disabled:opacity-30 active:scale-95 text-xs font-semibold shadow-xs"
          >
            <span className="sm:hidden">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>

        </div>
      )}

    </div>
  );
}
