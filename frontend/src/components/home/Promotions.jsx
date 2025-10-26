import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, GiftIcon, ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';
import { StarIcon, BuildingOfficeIcon, XCircleIcon, SparklesIcon } from '@heroicons/react/24/solid';

export default function Promotions() {
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);
  const [copiedCode, setCopiedCode] = useState(null);

  // Top Promotional Banners
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

  // New User Promo Codes
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
    {
      icon: StarIcon,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      title: 'Get 100,000 VND off domestic flight packages.',
      subtitle: 'Valid for bookings above 2 million VND.',
      code: 'FLYNOW100',
      active: true,
    },
    {
      icon: BuildingOfficeIcon,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      title: 'Save 15% on luxury hotel stays.',
      subtitle: 'Valid for 5-star hotels only.',
      code: 'LUXURY15',
      active: true,
    },
    {
      icon: SparklesIcon,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      title: 'Weekend special: 20% off resort bookings.',
      subtitle: 'Valid for Friday-Sunday stays.',
      code: 'WEEKEND20',
      active: true,
    },
    {
      icon: StarIcon,
      iconBg: 'bg-pink-100',
      iconColor: 'text-pink-600',
      title: 'Free airport transfer with premium packages.',
      subtitle: 'Minimum booking 3 nights required.',
      code: 'PREMIUM3N',
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
    <section className="py-12 bg-section">
      <div className="container mx-auto px-36 md:px-36 max-w-container">
        
        {/* Active Promotions Heading */}
        <h2 className="text-3xl md:text-4xl font-bold text-title mb-8">
          Active Promotions
        </h2>

        {/* (1) Top Promotional Banner Grid */}
        <div className="mb-16">
          <div className="relative">
            {/* Previous Button */}
            <button
              onClick={handlePrevBanner}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-10 p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all focus:outline-none"
              aria-label="Previous banner"
            >
              <ChevronLeftIcon className="h-6 w-6 text-gray-700" />
            </button>

            {/* Banner Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {visibleBanners.map((banner, index) => (
                <div
                  key={currentBannerIndex + index}
                  className="relative rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow aspect-video group"
                >
                  {/* Background Image */}
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/30"></div>
                  
                  {/* Wavy Ribbon Accent */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/80 to-teal-500/80 rounded-bl-[100px] opacity-90"></div>
                  
                  {/* Content */}
                  <div className="absolute inset-0 p-4 flex flex-col justify-between">
                    <div>
                      <h3 className="text-white font-bold text-lg md:text-xl mb-1 drop-shadow-lg">
                        {banner.title}
                      </h3>
                      <p className="text-white font-semibold text-sm md:text-base drop-shadow-md">
                        {banner.subtitle}
                      </p>
                      {banner.highlight && (
                        <div className="mt-2 inline-block bg-yellow-400 text-gray-900 font-bold text-xs px-3 py-1 rounded-full">
                          {banner.highlight}
                        </div>
                      )}
                    </div>
                    <p className="text-white/90 text-[10px] md:text-xs">
                      {banner.terms}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={handleNextBanner}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-10 p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all focus:outline-none"
              aria-label="Next banner"
            >
              <ChevronRightIcon className="h-6 w-6 text-gray-700" />
            </button>
          </div>
        </div>

        {/* (2) New User Discount Codes */}
        <div>
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <GiftIcon className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-title">
              New User Promo Codes
            </h2>
          </div>

          {/* Promo Code Grid with Navigation */}
          <div className="relative">
            {/* Previous Button */}
            <button
              onClick={handlePrevPromo}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-10 p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all focus:outline-none"
              aria-label="Previous promo codes"
            >
              <ChevronLeftIcon className="h-6 w-6 text-gray-700" />
            </button>

            {/* Promo Code Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {visiblePromos.map((promo, index) => {
                const Icon = promo.icon;
                const globalIndex = (currentPromoIndex + index) % promoCodes.length;
                return (
                  <div
                    key={currentPromoIndex + index}
                    className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col ${
                      !promo.active ? 'opacity-60' : ''
                    }`}
                  >
                    {/* Icon and Content */}
                    <div className="flex gap-3 mb-4 flex-grow">
                      <div className={`${promo.iconBg} rounded-full p-2 h-10 w-10 flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`h-5 w-5 ${promo.iconColor}`} />
                      </div>
                      <div className="flex-grow">
                        <h3 className="text-sm font-bold text-title mb-1 leading-tight">
                          {promo.title}
                        </h3>
                        <p className="text-xs text-body">
                          {promo.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Code Row */}
                    <div className="flex gap-2">
                      <div className="flex-grow bg-gray-100 rounded-lg px-3 py-2 flex items-center gap-2">
                        <ClipboardDocumentIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-semibold text-gray-700">
                          {promo.code}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopyCode(promo.code, globalIndex)}
                        disabled={!promo.active}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                          promo.active
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {copiedCode === globalIndex ? (
                          <CheckIcon className="h-5 w-5" />
                        ) : (
                          'Copy'
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Next Button */}
            <button
              onClick={handleNextPromo}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-10 p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all focus:outline-none"
              aria-label="Next promo codes"
            >
              <ChevronRightIcon className="h-6 w-6 text-gray-700" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
