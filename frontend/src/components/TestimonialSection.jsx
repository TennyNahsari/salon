import React from 'react';
import { Star, Quote } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function TestimonialSection() {
  const { t } = useLanguage();

  const testimonials = [
    {
      id: 1,
      name: "Siti Rahmania",
      role: "Customer Setia",
      treatment: "Hair Spa Aromatherapy",
      comment: t('testi_1_comment'),
      rating: 5,
    },
    {
      id: 2,
      name: "Andi Wijaya",
      role: "Pelanggan Ruang Mandiri",
      treatment: "Premium Haircut & Styling",
      comment: t('testi_2_comment'),
      rating: 5,
    },
    {
      id: 3,
      name: "Clara Dian",
      role: "Model & Influencer",
      treatment: "Organic Facial Treatment",
      comment: t('testi_3_comment'),
      rating: 5,
    }
  ];

  return (
    <section id="testimonials" className="py-20 bg-cream-200/60 border-y border-grey-border">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Section Header */}
        <div className="text-center space-y-3 mb-16">
          <span className="text-rosegold text-xs sm:text-sm font-semibold tracking-widest uppercase block">
            {t('testimonial_badge')}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-emeraldsoft">
            {t('testimonial_title')}
          </h2>
          <div className="w-16 h-1 bg-rosegold mx-auto rounded-full mt-2" />
        </div>

        {/* Grid Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((tItem) => (
            <div
              key={tItem.id}
              className="bg-white rounded-2xl p-8 border border-grey-border shadow-soft relative flex flex-col justify-between"
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-lavender/40" />

              <div className="space-y-4">
                {/* Rating */}
                <div className="flex items-center gap-1 text-rosegold">
                  {[...Array(tItem.rating)].map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-current" />
                  ))}
                </div>

                {/* Comment */}
                <p className="text-slate-dark text-sm sm:text-base italic leading-relaxed">
                  "{tItem.comment}"
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-cream-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-lavender flex items-center justify-center font-bold text-emeraldsoft font-serif">
                  {tItem.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-dark text-sm">{tItem.name}</h4>
                  <span className="text-xs text-rosegold font-medium">{tItem.treatment}</span>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
