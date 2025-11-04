import React, { useState } from "react";
import { Plane } from "lucide-react";
import { Badge } from "../ui/badge";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { useLanguage } from "../../context/LanguageContext"; // 👈 thêm

const flightDeals = (translations) => [
  {
    id: 1,
    from: "Ho Chi Minh",
    to: "Hanoi",
    price: "896,600 VND",
    label: translations.oneWay,
    image:
      "https://images.unsplash.com/photo-1677560349334-a87b79e84843?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    id: 2,
    from: "Hanoi",
    to: "Ho Chi Minh",
    price: "896,600 VND",
    label: translations.oneWay,
    image:
      "https://images.unsplash.com/photo-1677560349334-a87b79e84843?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    id: 3,
    from: "Ho Chi Minh",
    to: "Da Nang",
    price: "680,600 VND",
    label: translations.oneWay,
    image:
      "https://images.unsplash.com/photo-1699451505639-55fb416908c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    id: 4,
    from: "Hanoi",
    to: "Nha Trang",
    price: "896,600 VND",
    label: translations.oneWay,
    image:
      "https://images.unsplash.com/photo-1533002832-1721d16b4bb9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    id: 5,
    from: "Ho Chi Minh",
    to: "Phu Quoc",
    price: "680,600 VND",
    label: translations.oneWay,
    image:
      "https://images.unsplash.com/photo-1668570496303-e22d19a17f65?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
];

export default function FlightDeals() {
  const [activeTab, setActiveTab] = useState("hot-deal");
  const { translations } = useLanguage(); // 👈 lấy translations
  const deals = flightDeals(translations);

  return (
    <section className="py-12 bg-section dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-36 max-w-container">
        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Plane className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-title dark:text-white">
            {translations.bestFlightDeals}
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {[
            { key: "hot-deal", label: `🔥 ${translations.hotDeal}` },
            { key: "domestic", label: translations.domestic },
            { key: "international", label: translations.international },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-2 rounded-full text-sm transition ${activeTab === tab.key
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Swiper Carousel */}
        <Swiper
          modules={[Navigation, Autoplay]}
          navigation
          autoplay={{ delay: 4000 }}
          spaceBetween={24}
          slidesPerView={1}
          loop={true}
          breakpoints={{
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            1280: { slidesPerView: 4 },
          }}
          className="pb-10"
        >
          {deals.map((deal) => (
            <SwiperSlide key={deal.id}>
              <div className="w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer">
                <div className="relative h-48">
                  <img
                    src={deal.image}
                    alt={`${deal.from} to ${deal.to}`}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-3 left-3 bg-black/70 text-white backdrop-blur-sm">
                    {deal.label}
                  </Badge>
                </div>
                <div className="p-4">
                  <h3 className="mb-2 font-medium text-gray-900 dark:text-white">
                    {deal.from} - {deal.to}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-1">
                    🛫 {translations.bestPriceFrom}
                  </p>
                  <p className="text-orange-600 dark:text-orange-400 font-semibold">
                    {deal.price}
                  </p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
