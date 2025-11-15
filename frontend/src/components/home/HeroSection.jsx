import React, { useState } from "react";

import {
  Hotel,
  Plane,
  PartyPopper,
  MoreHorizontal,
  MapPin,
  Calendar as CalIcon,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext"; // 👈 thêm

export default function HeroSection({ children }) {
  const [activeService, setActiveService] = useState("flight");
  const { translations } = useLanguage(); // 👈 lấy translations

  return (
    <section className="pb-16 pt-12 px-4 md:px-8 lg:px-36 transition-colors duration-300">
      <div className="relative w-full h-[600px] md:h-[700px] lg:h-[800px] rounded-3xl overflow-visible">
        {/* Background image */}
        <div
          className="absolute inset-0 rounded-3xl overflow-hidden"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1200)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60 dark:from-black/70 dark:via-black/60 dark:to-black/70 rounded-3xl" />

        {/* Content */}
        <div className="relative h-full flex flex-col justify-center items-center px-6 md:px-12 lg:px-16 z-10">
          {/* Hero Title */}
          <h1 className="text-white text-center text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold mb-6 leading-tight drop-shadow-2xl max-w-5xl tracking-tight">
            {translations.heroTitle}
          </h1>
          
          {/* Subtitle */}
          <p className="text-white/90 text-center text-lg md:text-xl lg:text-2xl font-light mb-16 drop-shadow-lg max-w-3xl">
            {translations.heroSubtitle}
          </p>

          {/* Service tabs */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <ServiceTab
              icon={Hotel}
              label={translations.hotels}
              active={activeService === "hotel"}
              onClick={() => setActiveService("hotel")}
            />
            <ServiceTab
              icon={Plane}
              label={translations.flights}
              active={activeService === "flight"}
              onClick={() => setActiveService("flight")}
            />
            <ServiceTab
              icon={MapPin}
              label={translations.toursLabel}
              active={activeService === "pickup"}
              onClick={() => setActiveService("pickup")}
            />
          </div>

          {/* Search form */}
          <div className="w-full max-w-6xl">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

function ServiceTab({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-6 md:px-8 py-3 md:py-4 rounded-full transition-all transform hover:scale-105 hover:-translate-y-1 ${
        active
          ? "bg-white text-blue-600 shadow-2xl font-semibold"
          : "bg-white/20 text-white dark:text-gray-200 hover:bg-white/30 dark:hover:bg-white/30 backdrop-blur-md font-medium"
      }`}
    >
      <Icon className="w-5 h-5 md:w-6 md:h-6" />
      <span className="text-sm md:text-base lg:text-lg">{label}</span>
    </button>
  );
}
