import React, { useState } from 'react';
import { Clock, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function ServiceList({ services, loading, onSelectService }) {
  const { lang, t } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // Format price
  const formatPrice = (val) => {
    return new Intl.NumberFormat(lang === 'en' ? 'en-US' : 'id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Calculate pagination
  const totalPages = Math.ceil(services.length / itemsPerPage) || 1;
  const validCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const currentServices = services.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevPage = () => {
    if (validCurrentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (validCurrentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  return (
    <section id="services" className="py-20 px-4 max-w-7xl mx-auto">
      
      {/* Section Header */}
      <div className="text-center space-y-3 mb-12">
        <span className="text-rosegold text-xs sm:text-sm font-semibold tracking-widest uppercase block">
          {t('services_badge')}
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-emeraldsoft">
          {t('services_title')}
        </h2>
        <div className="w-16 h-1 bg-rosegold mx-auto rounded-full mt-2" />
        <p className="max-w-xl mx-auto text-grey-soft text-sm sm:text-base">
          {t('services_subtitle')}
        </p>
      </div>

      {/* Services Grid & Pagination */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-white rounded-2xl p-4 space-y-4 border border-grey-border shadow-soft">
              <div className="w-full h-48 bg-cream-200 rounded-xl" />
              <div className="h-6 bg-cream-200 rounded w-3/4" />
              <div className="h-4 bg-cream-200 rounded w-1/2" />
              <div className="h-10 bg-cream-200 rounded-xl" />
            </div>
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-grey-border p-8">
          <p className="text-grey-soft">{t('no_services')}</p>
        </div>
      ) : (
        <div className="space-y-10">
          
          {/* 3 Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-all duration-300">
            {currentServices.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-2xl overflow-hidden border border-grey-border shadow-soft hover:shadow-luxury hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Service Image Header */}
                  <div className="relative h-52 overflow-hidden bg-cream-200">
                    <img
                      src={service.image_url || 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=600&q=80'}
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-dark/60 via-transparent to-transparent opacity-60" />
                    
                    {/* Duration Badge */}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 text-xs font-semibold text-emeraldsoft shadow-sm">
                      <Clock className="w-3.5 h-3.5 text-rosegold" />
                      <span>{service.duration_minutes} {t('mins')}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-3">
                    <h3 className="font-serif text-xl font-bold text-slate-dark group-hover:text-emeraldsoft transition-colors">
                      {service.name}
                    </h3>
                    
                    <p className="text-grey-soft text-sm line-clamp-2 leading-relaxed">
                      {service.description || 'Layanan perawatan eksklusif dengan kenyamanan maksimal.'}
                    </p>
                  </div>
                </div>

                {/* Card Footer Price & Action */}
                <div className="px-6 pb-6 pt-2 border-t border-cream-200 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-medium text-grey-soft block uppercase tracking-wider">{t('price_label')}</span>
                    <span className="text-lg font-bold text-emeraldsoft">
                      {formatPrice(service.price)}
                    </span>
                  </div>

                  <button
                    onClick={() => onSelectService(service)}
                    className="px-5 py-2.5 rounded-xl bg-emeraldsoft text-white font-semibold text-xs sm:text-sm hover:bg-rosegold hover:text-slate-dark transition-all flex items-center gap-2 shadow-sm group-hover:shadow-md"
                  >
                    <span>{t('btn_select_service')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            ))}
          </div>

          {/* Horizontal Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-4">
              
              {/* Previous Page Button */}
              <button
                onClick={handlePrevPage}
                disabled={validCurrentPage === 1}
                className="w-11 h-11 rounded-full border border-emeraldsoft/30 bg-white text-emeraldsoft flex items-center justify-center shadow-sm hover:bg-emeraldsoft hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-emeraldsoft transition-all"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Page Number Badges */}
              <div className="flex items-center gap-2">
                {[...Array(totalPages)].map((_, idx) => {
                  const pageNum = idx + 1;
                  const isActive = pageNum === validCurrentPage;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-xl font-bold text-xs transition-all shadow-sm ${
                        isActive
                          ? 'bg-emeraldsoft text-rosegold shadow-md scale-105'
                          : 'bg-white text-slate-dark border border-grey-border hover:border-rosegold hover:text-emeraldsoft'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Next Page Button */}
              <button
                onClick={handleNextPage}
                disabled={validCurrentPage === totalPages}
                className="w-11 h-11 rounded-full border border-emeraldsoft/30 bg-white text-emeraldsoft flex items-center justify-center shadow-sm hover:bg-emeraldsoft hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-emeraldsoft transition-all"
                title="Halaman Berikutnya"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

            </div>
          )}

        </div>
      )}

    </section>
  );
}
