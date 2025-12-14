import React, { useState, useEffect } from "react";
import { ClipboardDocumentIcon, CheckIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import {
  StarIcon,
  BuildingOfficeIcon,
  XCircleIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { useLanguage } from "../../context/LanguageContext";
import { getHomepagePromotions } from "../../api/promotions";
import { getTranslatedContent } from "../../utils/translation";

export default function Promotions() {
  const [copiedCode, setCopiedCode] = useState(null);
  const [banners, setBanners] = useState([]);
  const [promoCodes, setPromoCodes] = useState([]);
  const [translatedBanners, setTranslatedBanners] = useState([]);
  const [translatedPromoCodes, setTranslatedPromoCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [translating, setTranslating] = useState(false);
  const { translations, language } = useLanguage();

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    try {
      setLoading(true);
      const promotions = await getHomepagePromotions();
      
      // Separate banners and promo codes
      const bannerPromotions = promotions.filter(p => p.promotion_type === 'banner');
      const codePromotions = promotions.filter(p => p.promotion_type === 'promo_code' || !p.promotion_type);
      
      // Map banners
      const mappedBanners = bannerPromotions.map(p => ({
        image: p.image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=675&fit=crop&q=80",
        title: p.title || p.code,
        subtitle: p.subtitle || `${p.discount_type === 'percentage' ? `${p.discount_value}% off` : `${p.discount_value} VND off`}`,
        highlight: p.highlight,
        terms: p.terms || "Terms & Conditions apply.",
      }));
      
      // Map promo codes with icons
      const iconMap = {
        'flight': StarIcon,
        'hotel': BuildingOfficeIcon,
        'activity': XCircleIcon,
        'combo': SparklesIcon,
      };
      
      const mappedPromoCodes = codePromotions.map((p, index) => {
        // Determine icon based on conditions or use default
        let icon = StarIcon;
        const conditions = (p.conditions || '').toLowerCase();
        if (conditions.includes('flight') || conditions.includes('fly')) {
          icon = StarIcon;
        } else if (conditions.includes('hotel') || conditions.includes('accommodation')) {
          icon = BuildingOfficeIcon;
        } else if (conditions.includes('activity') || conditions.includes('attraction')) {
          icon = XCircleIcon;
        } else if (conditions.includes('combo') || conditions.includes('package')) {
          icon = SparklesIcon;
        }
        
        return {
          icon: icon,
          iconBg: p.is_active ? "bg-blue-100" : "bg-gray-100",
          iconColor: p.is_active ? "text-blue-600" : "text-gray-600",
          title: p.title || `Get ${p.discount_type === 'percentage' ? `up to ${p.discount_value}%` : `up to ${p.discount_value} VND`} off.`,
          subtitle: p.subtitle || p.conditions || "Valid for your booking via the app.",
          code: p.code,
          active: p.is_active,
        };
      });
      
      setBanners(mappedBanners);
      setPromoCodes(mappedPromoCodes);
    } catch (error) {
      console.error('Error loading promotions:', error);
      // Fallback to empty arrays on error
      setBanners([]);
      setPromoCodes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (banners.length === 0 && promoCodes.length === 0) return;
    
    const translatePromotions = async () => {
      setTranslating(true);
      try {
        const translatedBannersData = await Promise.all(
          banners.map(async (banner) => {
            const translatedTitle = await getTranslatedContent(banner.title || '', language);
            const translatedSubtitle = await getTranslatedContent(banner.subtitle || '', language);
            const translatedHighlight = banner.highlight ? await getTranslatedContent(banner.highlight, language) : null;
            const translatedTerms = await getTranslatedContent(banner.terms || '', language);
            
            return {
              ...banner,
              translatedTitle,
              translatedSubtitle,
              translatedHighlight,
              translatedTerms
            };
          })
        );

        const translatedPromoCodesData = await Promise.all(
          promoCodes.map(async (promo) => {
            const translatedTitle = await getTranslatedContent(promo.title || '', language);
            const translatedSubtitle = await getTranslatedContent(promo.subtitle || '', language);
            
            return {
              ...promo,
              translatedTitle,
              translatedSubtitle
            };
          })
        );

        setTranslatedBanners(translatedBannersData);
        setTranslatedPromoCodes(translatedPromoCodesData);
      } catch (error) {
        console.error('Error translating promotions:', error);
        setTranslatedBanners(banners.map(banner => ({
          ...banner,
          translatedTitle: banner.title,
          translatedSubtitle: banner.subtitle,
          translatedHighlight: banner.highlight,
          translatedTerms: banner.terms
        })));
        setTranslatedPromoCodes(promoCodes.map(promo => ({
          ...promo,
          translatedTitle: promo.title,
          translatedSubtitle: promo.subtitle
        })));
      } finally {
        setTranslating(false);
      }
    };

    translatePromotions();
  }, [language, banners, promoCodes]);

  const handleCopyCode = (code, index) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(index);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading) {
    return (
      <section className="py-12 px-4 md:px-8 lg:px-36 bg-section dark:bg-gray-900">
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Loading promotions...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 px-4 md:px-8 lg:px-36 bg-section dark:bg-gray-900">
      <div>
        <h2 className="text-3xl md:text-4xl font-bold text-title dark:text-white mb-8">
          {translations.activePromotions}
        </h2>

        {/* 🖼️ Banner Swiper */}
        {(banners.length > 0 || translatedBanners.length > 0) && (
          <div className="relative mb-16">
            {/* Previous Button */}
            <button
              className="swiper-button-prev-promotions absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-10 p-3 rounded-full bg-white dark:bg-gray-700 shadow-lg hover:shadow-xl transition-all focus:outline-none hover:bg-gray-50 dark:hover:bg-gray-600"
              aria-label="Previous promotion"
            >
              <ChevronLeftIcon className="h-6 w-6 text-gray-700 dark:text-white" />
            </button>

            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={20}
              slidesPerView={1}
              navigation={{
                prevEl: ".swiper-button-prev-promotions",
                nextEl: ".swiper-button-next-promotions",
              }}
              pagination={{ 
                clickable: true,
                el: '.swiper-pagination-promotions',
                bulletClass: 'swiper-pagination-bullet',
                bulletActiveClass: 'swiper-pagination-bullet-active'
              }}
              autoplay={{ delay: 4000 }}
              breakpoints={{
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 4 },
              }}
              style={{ height: '280px' }}
              className="pb-12"
            >
              {(translatedBanners.length > 0 ? translatedBanners : banners).map((banner, i) => {
                const displayTitle = banner.translatedTitle || banner.title || '';
                const displaySubtitle = banner.translatedSubtitle || banner.subtitle || '';
                const displayHighlight = banner.translatedHighlight || banner.highlight;
                const displayTerms = banner.translatedTerms || banner.terms || '';
                
                return (
                  <SwiperSlide key={i} style={{ height: '280px' }}>
                    <div className="relative rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow h-full w-full group shine-effect">
                      <img
                        src={banner.image}
                        alt={displayTitle}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/30 dark:from-black/60 dark:to-black/40"></div>
                      <div className="absolute inset-0 p-4 flex flex-col justify-between h-full">
                        <div className="flex-shrink-0 overflow-hidden">
                          <h3 className="text-white font-bold text-lg md:text-xl mb-1 drop-shadow-lg line-clamp-2 break-words">
                            {displayTitle}
                          </h3>
                          <p className="text-white font-semibold text-sm md:text-base drop-shadow-md line-clamp-2 break-words">
                            {displaySubtitle}
                          </p>
                          {displayHighlight && (
                            <div className="mt-2 inline-block bg-yellow-400 text-gray-900 font-bold text-xs px-3 py-1 rounded-full whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
                              {displayHighlight}
                            </div>
                          )}
                        </div>
                        <p className="text-white/90 text-[10px] md:text-xs flex-shrink-0 mt-auto line-clamp-1">
                          {displayTerms}
                        </p>
                      </div>
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
            
            {/* Pagination */}
            <div className="swiper-pagination-promotions mt-4 flex justify-center gap-2"></div>

            {/* Next Button */}
            <button
              className="swiper-button-next-promotions absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-10 p-3 rounded-full bg-white dark:bg-gray-700 shadow-lg hover:shadow-xl transition-all focus:outline-none hover:bg-gray-50 dark:hover:bg-gray-600"
              aria-label="Next promotion"
            >
              <ChevronRightIcon className="h-6 w-6 text-gray-700 dark:text-white" />
            </button>
          </div>
        )}

        {/* 💰 Promo Code Swiper */}
        {(promoCodes.length > 0 || translatedPromoCodes.length > 0) && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <ClipboardDocumentIcon className="h-6 w-6 text-blue-600 dark:text-blue-300" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-title dark:text-white">
                {translations.newUserPromoCodes}
              </h2>
            </div>

            <div className="relative">
              {/* Previous Button */}
              <button
                className="swiper-button-prev-promocodes absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-10 p-3 rounded-full bg-white dark:bg-gray-700 shadow-lg hover:shadow-xl transition-all focus:outline-none hover:bg-gray-50 dark:hover:bg-gray-600"
                aria-label="Previous promo code"
              >
                <ChevronLeftIcon className="h-6 w-6 text-gray-700 dark:text-white" />
              </button>

              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={20}
                slidesPerView={1}
                navigation={{
                  prevEl: ".swiper-button-prev-promocodes",
                  nextEl: ".swiper-button-next-promocodes",
                }}
                pagination={{ 
                  clickable: true,
                  el: '.swiper-pagination-promocodes',
                  bulletClass: 'swiper-pagination-bullet',
                  bulletActiveClass: 'swiper-pagination-bullet-active'
                }}
                autoplay={{ delay: 5000 }}
                breakpoints={{
                  768: { slidesPerView: 2 },
                  1024: { slidesPerView: 4 },
                }}
                className="pb-7"
              >
                {(translatedPromoCodes.length > 0 ? translatedPromoCodes : promoCodes).map((promo, index) => {
              const Icon = promo.icon;
              const displayTitle = promo.translatedTitle || promo.title || '';
              const displaySubtitle = promo.translatedSubtitle || promo.subtitle || '';
              
              return (
                <SwiperSlide key={index}>
                  <div
                    className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col h-[160px] shine-effect ${
                      !promo.active ? "opacity-60" : ""
                    }`}
                  >
                    <div className="flex gap-3 mb-3 flex-1 min-h-0">
                      <div
                        className={`${promo.iconBg} rounded-full p-2 h-10 w-10 flex items-center justify-center flex-shrink-0`}
                      >
                        <Icon className={`h-5 w-5 ${promo.iconColor}`} />
                      </div>
                      <div className="flex-grow min-w-0 overflow-hidden">
                        <h3 className="text-sm font-bold text-title dark:text-white mb-1 leading-tight line-clamp-2">
                          {displayTitle}
                        </h3>
                        <p className="text-xs text-body dark:text-gray-300 line-clamp-2">
                          {displaySubtitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-auto">
                      <div className="flex-grow min-w-0 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 flex items-center gap-2">
                        <ClipboardDocumentIcon className="h-4 w-4 text-gray-500 dark:text-gray-300 flex-shrink-0" />
                        <span className="text-sm font-semibold text-gray-700 dark:text-white truncate">
                          {promo.code}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopyCode(promo.code, index)}
                        disabled={!promo.active}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 flex-shrink-0 ${
                          promo.active
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        {copiedCode === index ? (
                          <CheckIcon className="h-5 w-5" />
                        ) : (
                          translations.copy
                        )}
                      </button>
                    </div>
                  </div>
                </SwiperSlide>
                );
              })}
              </Swiper>
              
              {/* Pagination */}
              <div className="swiper-pagination-promocodes mt-4 flex justify-center gap-2"></div>

              {/* Next Button */}
              <button
                className="swiper-button-next-promocodes absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-10 p-3 rounded-full bg-white dark:bg-gray-700 shadow-lg hover:shadow-xl transition-all focus:outline-none hover:bg-gray-50 dark:hover:bg-gray-600"
                aria-label="Next promo code"
              >
                <ChevronRightIcon className="h-6 w-6 text-gray-700 dark:text-white" />
              </button>
            </div>
          </>
        )}

        {banners.length === 0 && promoCodes.length === 0 && translatedBanners.length === 0 && translatedPromoCodes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No active promotions at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
}
