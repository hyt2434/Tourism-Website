import React, { useState } from "react";
import {
  GiftIcon,
  ClipboardDocumentIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import {
  StarIcon,
  BuildingOfficeIcon,
  XCircleIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

export default function Promotions() {
  const [copiedCode, setCopiedCode] = useState(null);

  // Banner data
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

  // Promo codes
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
    {
      icon: StarIcon,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      title: "Get 100,000 VND off domestic flight packages.",
      subtitle: "Valid for bookings above 2 million VND.",
      code: "FLYNOW100",
      active: true,
    },
  ];

  // Copy function
  const handleCopyCode = (code, index) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(index);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-36 max-w-container">
        {/* Section Title */}
        <h2 className="text-3xl md:text-4xl font-bold text-title mb-8">
          Active Promotions
        </h2>

        {/* ======== BANNER SLIDER ======== */}
        <div className="mb-16">
          <Swiper
            modules={[Navigation]}
            navigation
            spaceBetween={16}
            slidesPerView={1}
            breakpoints={{
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 4 },
            }}
            loop={true}
            className="!overflow-hidden"
          >
            {banners.map((banner, i) => (
              <SwiperSlide key={i}>
                <div className="relative rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition aspect-video group">
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/30"></div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/80 to-teal-500/80 rounded-bl-[100px] opacity-90"></div>
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
        </div>

        {/* ======== PROMO CODES SLIDER ======== */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <GiftIcon className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-title">
              New User Promo Codes
            </h2>
          </div>

          <Swiper
            modules={[Navigation]}
            navigation
            spaceBetween={16}
            slidesPerView={1}
            breakpoints={{
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 4 },
            }}
            loop={true}
            className="!overflow-hidden"
          >
            {promoCodes.map((promo, i) => {
              const Icon = promo.icon;
              return (
                <SwiperSlide key={i}>
                  <div
                    className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition p-4 flex flex-col ${
                      !promo.active ? "opacity-60" : ""
                    }`}
                  >
                    {/* Icon & content */}
                    <div className="flex gap-3 mb-4 flex-grow">
                      <div
                        className={`${promo.iconBg} rounded-full p-2 h-10 w-10 flex items-center justify-center`}
                      >
                        <Icon className={`h-5 w-5 ${promo.iconColor}`} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-title mb-1 leading-tight">
                          {promo.title}
                        </h3>
                        <p className="text-xs text-body">{promo.subtitle}</p>
                      </div>
                    </div>

                    {/* Code row */}
                    <div className="flex gap-2">
                      <div className="flex-grow bg-gray-100 rounded-lg px-3 py-2 flex items-center gap-2">
                        <ClipboardDocumentIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-semibold text-gray-700">
                          {promo.code}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopyCode(promo.code, i)}
                        disabled={!promo.active}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition focus:outline-none ${
                          promo.active
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        {copiedCode === i ? (
                          <CheckIcon className="h-5 w-5" />
                        ) : (
                          "Copy"
                        )}
                      </button>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
