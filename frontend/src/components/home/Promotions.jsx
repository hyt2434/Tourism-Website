import React, { useState } from "react";
import { ClipboardDocumentIcon, CheckIcon } from "@heroicons/react/24/outline";
import {
  StarIcon,
  BuildingOfficeIcon,
  XCircleIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { useLanguage } from "../../context/LanguageContext";

export default function Promotions() {
  const [copiedCode, setCopiedCode] = useState(null);
  const { translations } = useLanguage();

  const banners = [
    {
      image:
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=675&fit=crop&q=80",
      title: "Chill this weekend",
      subtitle: "Up to 30% off",
      terms: "Terms & Conditions apply.",
    },
    {
      image:
        "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&h=675&fit=crop&q=80",
      title: "Book early, fly better",
      subtitle: "Flights under 1 million VND",
      terms: "Terms & Conditions apply.",
    },
    {
      image:
        "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1200&h=675&fit=crop&q=80",
      title: "Holiday Sale 2026",
      subtitle: "Book early, travel worry-free",
      highlight: "Save up to 1 Million",
      terms: "Terms & Conditions apply.",
    },
    {
      image:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=675&fit=crop&q=80",
      title: "Hotel + Flight Combo",
      subtitle: "Save up to 25%",
      terms: "Terms & Conditions apply.",
    },
  ];

  const promoCodes = [
    {
      icon: StarIcon,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      title: "Get up to 50,000 VND off your first flight booking.",
      subtitle: "Valid for your first booking via the app.",
      code: "TRAVELNEW",
      active: true,
    },
    {
      icon: BuildingOfficeIcon,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      title: "Get up to 8% off your first hotel booking.",
      subtitle: "Valid for your first booking via the app.",
      code: "TRAVELNEW",
      active: true,
    },
    {
      icon: XCircleIcon,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      title: "Get up to 8% off your first activity or attraction booking.",
      subtitle: "Valid for your first booking via the app.",
      code: "TRAVELNEW",
      active: false,
    },
    {
      icon: SparklesIcon,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      title: "Extra 7% off your first combo package.",
      subtitle: "Valid for new users only.",
      code: "TRAVELNEW",
      active: true,
    },
  ];

  const handleCopyCode = (code, index) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(index);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <section className="py-12 px-4 md:px-8 lg:px-36 bg-section dark:bg-gray-900">
      <div>
        <h2 className="text-3xl md:text-4xl font-bold text-title dark:text-white mb-8">
          {translations.activePromotions}
        </h2>

        {/* 🖼️ Banner Swiper */}
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={20}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 4000 }}
          breakpoints={{
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 4 },
          }}
          className="mb-16"
        >
          {banners.map((banner, i) => (
            <SwiperSlide key={i}>
              <div className="relative rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow aspect-video group shine-effect">
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/30 dark:from-black/60 dark:to-black/40"></div>
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
            </SwiperSlide>
          ))}
        </Swiper>

        {/* 💰 Promo Code Swiper */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <ClipboardDocumentIcon className="h-6 w-6 text-blue-600 dark:text-blue-300" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-title dark:text-white">
            {translations.newUserPromoCodes}
          </h2>
        </div>

        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={20}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000 }}
          breakpoints={{
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 4 },
          }}
        >
          {promoCodes.map((promo, index) => {
            const Icon = promo.icon;
            return (
              <SwiperSlide key={index}>
                <div
                  className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col h-full min-h-[180px] shine-effect ${
                    !promo.active ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex gap-3 mb-4 flex-1">
                    <div
                      className={`${promo.iconBg} rounded-full p-2 h-10 w-10 flex items-center justify-center flex-shrink-0`}
                    >
                      <Icon className={`h-5 w-5 ${promo.iconColor}`} />
                    </div>
                    <div className="flex-grow min-h-0">
                      <h3 className="text-sm font-bold text-title dark:text-white mb-1 leading-tight line-clamp-2">
                        {promo.title}
                      </h3>
                      <p className="text-xs text-body dark:text-gray-300 line-clamp-2">
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
                      onClick={() => handleCopyCode(promo.code, index)}
                      disabled={!promo.active}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
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
      </div>
    </section>
  );
}
