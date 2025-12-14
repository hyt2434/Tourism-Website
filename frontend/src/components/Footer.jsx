import React from "react";
import { useLanguage } from "../context/LanguageContext"; // 👈 import context

export default function Footer() {
  const { translations } = useLanguage();

  const popularProvinces = [
    translations.hanoi,
    translations.danang,
    translations.hcm,
    translations.hue,
  ];

  const moreDestinations = [
    translations.hoian,
    translations.phuquoc,
    translations.nhatrang,
    translations.halong,
  ];

  const legal = [
    translations.terms,
    translations.privacy,
    translations.cookies,
    translations.accessibility,
  ];

  return (
    <footer className="bg-section dark:bg-gray-800 py-8 sm:py-10 lg:py-12 transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24 max-w-container">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 justify-items-center lg:justify-items-start text-center lg:text-left">
          {/* Column 1 - Brand */}
          <div className="w-full sm:w-auto">
            <h3 className="text-base sm:text-lg font-bold text-title dark:text-white mb-2 sm:mb-3">
              MagicViet
            </h3>
            <p className="text-xs sm:text-sm text-body dark:text-gray-300 mb-3 sm:mb-4 leading-relaxed max-w-xs mx-auto lg:mx-0">
              {translations.footerDescription}
            </p>
            <div className="flex gap-3 sm:gap-4 justify-center lg:justify-start">
              {["facebook", "instagram", "twitter", "youtube"].map((platform) => (
                <a
                  key={platform}
                  href={`#${platform}`}
                  className="text-body dark:text-gray-300 hover:text-title dark:hover:text-white transition-colors"
                  aria-label={platform}
                >
                  {/* SVG icons giữ nguyên */}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2 - Popular Provinces */}
          <div className="w-full sm:w-auto">
            <h3 className="text-base sm:text-lg font-bold text-title dark:text-white mb-2 sm:mb-3">
              {translations.popularProvinces}
            </h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {popularProvinces.map((province) => (
                <li key={province}>
                  <a
                    href={`#${province.toLowerCase().replace(" ", "-")}`}
                    className="text-sm text-body dark:text-gray-300 hover:text-title dark:hover:text-white transition-colors hover:underline"
                  >
                    {province}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 - More Destinations */}
          <div className="w-full sm:w-auto">
            <h3 className="text-base sm:text-lg font-bold text-title dark:text-white mb-2 sm:mb-3">
              {translations.moreDestinations}
            </h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {moreDestinations.map((destination) => (
                <li key={destination}>
                  <a
                    href={`#${destination.toLowerCase().replace(" ", "-")}`}
                    className="text-sm text-body dark:text-gray-300 hover:text-title dark:hover:text-white transition-colors hover:underline"
                  >
                    {destination}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 - Legal */}
          <div className="w-full sm:w-auto">
            <h3 className="text-base sm:text-lg font-bold text-title dark:text-white mb-2 sm:mb-3">
              {translations.legal}
            </h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {legal.map((item) => (
                <li key={item}>
                  <a
                    href={`#${item.toLowerCase().replace(" ", "-")}`}
                    className="text-sm text-body dark:text-gray-300 hover:text-title dark:hover:text-white transition-colors hover:underline"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

