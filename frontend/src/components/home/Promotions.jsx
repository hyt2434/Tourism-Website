import React, { useState } from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardDocumentIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import {
  StarIcon,
  BuildingOfficeIcon,
  XCircleIcon,
  SparklesIcon,
} from '@heroicons/react/24/solid';
import { useLanguage } from "../../context/LanguageContext"; // 👈 thêm

export default function Promotions() {
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);
  const [copiedCode, setCopiedCode] = useState(null);
  const { translations } = useLanguage(); // 👈 lấy translations

  const banners = [
    {
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=675&fit=crop&q=80',
      title: 'Chill this weekend',
      subtitle: 'Up to 30% off',
      terms: 'Terms & Conditions apply.',
    },
    {
      image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&h=675&fit=crop&q=80',
      title: 'Book early, fly better',
      subtitle: 'Flights under 1 million VND',
      terms: 'Terms & Conditions apply.',
    },
    {
      image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1200&h=675&fit=crop&q=80',
      title: 'Holiday Sale 2026',
      subtitle: 'Book early, travel worry-free',
      highlight: 'Save up to 1 Million',
      terms: 'Terms & Conditions apply.',
    },
    {
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=675&fit=crop&q=80',
      title: 'Hotel + Flight Combo',
      subtitle: 'Save up to 25%',
      terms: 'Terms & Conditions apply.',
    },
  ];
  const promoCodes = [
    {
      icon: StarIcon,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      title: 'Get up to 50,000 VND off your first flight booking.',
      subtitle: 'Valid for your first booking via the app.',
      code: 'TRAVELNEW',
      active: true,
    },
    {
      icon: BuildingOfficeIcon,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      title: 'Get up to 8% off your first hotel booking.',
      subtitle: 'Valid for your first booking via the app.',
      code: 'TRAVELNEW',
      active: true,
    },
    {
      icon: XCircleIcon,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      title: 'Get up to 8% off your first activity or attraction booking.',
      subtitle: 'Valid for your first booking via the app.',
      code: 'TRAVELNEW',
      active: false,
    },
    {
      icon: SparklesIcon,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      title: 'Extra 7% off your first combo package.',
      subtitle: 'Valid for new users only.',
      code: 'TRAVELNEW',
      active: true,
    },
  ];

  const handleNextBanner = () => {
    setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
  };

  const handlePrevBanner = () => {
    setCurrentBannerIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNextPromo = () => {
    setCurrentPromoIndex((prev) => (prev + 1) % promoCodes.length);
  };

  const handlePrevPromo = () => {
    setCurrentPromoIndex((prev) => (prev - 1 + promoCodes.length) % promoCodes.length);
  };

  const handleCopyCode = (code, index) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(index);
    setTimeout(() => setCopiedCode(null), 2000);
  };
  const visibleBanners = [];
  for (let i = 0; i < 4; i++) {
    const index = (currentBannerIndex + i) % banners.length;
    visibleBanners.push({ ...banners[index], originalIndex: index });
  }

  const visiblePromos = [];
  for (let i = 0; i < 4; i++) {
    const index = (currentPromoIndex + i) % promoCodes.length;
    visiblePromos.push({ ...promoCodes[index], originalIndex: index });
  }

  return (
    <section className="py-12 bg-section dark:bg-gray-900">
      <div className="container mx-auto px-36 md:px-36 max-w-container">
        <h2 className="text-3xl md:text-4xl font-bold text-title dark:text-white mb-8">
          {translations.activePromotions}
        </h2>
        {/* (1) Top Promotional Banner Grid */}
        <div className="mb-16">
          <div className="relative">
            <button onClick={handlePrevBanner} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-10 p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all focus:outline-none">
              <ChevronLeftIcon className="h-6 w-6 text-gray-700 dark:text-white" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {visibleBanners.map((banner) => (
                <div key={banner.originalIndex} className="relative rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow aspect-video group">
                  <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/30 dark:from-black/60 dark:to-black/40"></div>
                  <div className="absolute inset-0 p-4 flex flex-col justify-between">
                    <div>
                      <h3 className="text-white font-bold text-lg md:text-xl mb-1 drop-shadow-lg">{banner.title}</h3>
                      <p className="text-white font-semibold text-sm md:text-base drop-shadow-md">{banner.subtitle}</p>
                      {banner.highlight && (
                        <div className="mt-2 inline-block bg-yellow-400 text-gray-900 font-bold text-xs px-3 py-1 rounded-full">
                          {banner.highlight}
                        </div>
                      )}
                    </div>
                    <p className="text-white/90 text-[10px] md:text-xs">{banner.terms}</p>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={handleNextBanner} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-10 p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all focus:outline-none">
              <ChevronRightIcon className="h-6 w-6 text-gray-700 dark:text-white" />
            </button>
          </div>
        </div>
        {/* (2) New User Discount Codes */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <ClipboardDocumentIcon className="h-6 w-6 text-blue-600 dark:text-blue-300" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-title dark:text-white">
              {translations.newUserPromoCodes}
            </h2>
          </div>

          <div className="relative">
            <button onClick={handlePrevPromo} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-10 p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all focus:outline-none">
              <ChevronLeftIcon className="h-6 w-6 text-gray-700 dark:text-white" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

              {visiblePromos.map((promo) => {
                const Icon = promo.icon;
                const globalIndex = promo.originalIndex;
                return (
                  <div
                    key={globalIndex}
                    className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col ${!promo.active ? "opacity-60" : ""
                      }`}
                  >
                    <div className="flex gap-3 mb-4 flex-grow">
                      <div
                        className={`${promo.iconBg} rounded-full p-2 h-10 w-10 flex items-center justify-center flex-shrink-0`}
                      >
                        <Icon className={`h-5 w-5 ${promo.iconColor}`} />
                      </div>
                      <div className="flex-grow">
                        <h3 className="text-sm font-bold text-title dark:text-white mb-1 leading-tight">
                          {promo.title}
                        </h3>
                        <p className="text-xs text-body dark:text-gray-300">
                          {promo.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <div className="flex-grow bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 flex items-center gap-2">
                        <ClipboardDocumentIcon className="h-4 w-4 text-gray-500 dark:text-gray-300" />
                        <span className="text-sm font-semibold text-gray-700 dark:text-white">
                          {promo.code}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopyCode(promo.code, globalIndex)}
                        disabled={!promo.active}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${promo.active
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                      >
                        {copiedCode === globalIndex ? (
                          <CheckIcon className="h-5 w-5" />
                        ) : (
                          translations.copy
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleNextPromo}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-10 p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all focus:outline-none"
              aria-label="Next promo codes"
            >
              <ChevronRightIcon className="h-6 w-6 text-gray-700 dark:text-white" />
            </button>
          </div>
        </div>
      </div> {/* ✅ Đóng container */}
    </section>
  );
}