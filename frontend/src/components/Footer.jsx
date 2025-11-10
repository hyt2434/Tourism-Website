import React from "react";

export default function Footer() {
  const popularProvinces = ["Hanoi", "Da Nang", "Ho Chi Minh", "Hue"];
  const moreDestinations = ["Hoi An", "Phu Quoc", "Nha Trang", "Ha Long Bay"];
  const legal = [
    "Terms of Service",
    "Privacy Policy",
    "Cookie Policy",
    "Accessibility",
  ];

  return (
    <footer className="bg-section dark:bg-gray-800 py-12 transition-colors duration-300">
      <div className="container mx-auto px-36 max-w-container">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center lg:justify-items-start text-center lg:text-left">
          {/* Column 1 - Brand */}
          <div>
            <h3 className="text-lg font-bold text-title dark:text-white mb-3">
              MagicViet
            </h3>
            <p className="text-sm text-body dark:text-gray-300 mb-4 leading-relaxed">
              Discover the beauty of Vietnam with our premium travel services.
            </p>
            <div className="flex gap-4 justify-center lg:justify-start">
              {/* Social Icons */}
              {["facebook", "instagram", "twitter", "youtube"].map(
                (platform) => (
                  <a
                    key={platform}
                    href={`#${platform}`}
                    className="text-body dark:text-gray-300 hover:text-title dark:hover:text-white transition-colors"
                    aria-label={platform}
                  >
                    {/* You can keep your SVGs here as-is */}
                  </a>
                )
              )}
            </div>
          </div>

          {/* Column 2 - Popular Provinces */}
          <div>
            <h3 className="text-lg font-bold text-title dark:text-white mb-3">
              Popular Provinces
            </h3>
            <ul className="space-y-2">
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
          <div>
            <h3 className="text-lg font-bold text-title dark:text-white mb-3">
              More Destinations
            </h3>
            <ul className="space-y-2">
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
          <div>
            <h3 className="text-lg font-bold text-title dark:text-white mb-3">
              Legal
            </h3>
            <ul className="space-y-2">
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
