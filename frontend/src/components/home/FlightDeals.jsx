import React, { useState } from "react";
import { Plane } from "lucide-react";
import { Badge } from "../ui/badge";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const flightDeals = [
  {
    id: 1,
    from: "TP HCM",
    to: "Hà Nội",
    price: "896.600 VND",
    label: "MỘT CHIỀU",
    image:
      "https://images.unsplash.com/photo-1677560349334-a87b79e84843?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    id: 2,
    from: "Hà Nội",
    to: "TP HCM",
    price: "896.600 VND",
    label: "MỘT CHIỀU",
    image:
      "https://images.unsplash.com/photo-1677560349334-a87b79e84843?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    id: 3,
    from: "TP HCM",
    to: "Đà Nẵng",
    price: "680.600 VND",
    label: "MỘT CHIỀU",
    image:
      "https://images.unsplash.com/photo-1699451505639-55fb416908c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    id: 4,
    from: "Hà Nội",
    to: "Nha Trang",
    price: "896.600 VND",
    label: "MỘT CHIỀU",
    image:
      "https://images.unsplash.com/photo-1533002832-1721d16b4bb9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    id: 5,
    from: "TP HCM",
    to: "Phú Quốc",
    price: "680.600 VND",
    label: "MỘT CHIỀU",
    image:
      "https://images.unsplash.com/photo-1668570496303-e22d19a17f65?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
];

export default function FlightDeals() {
  const [activeTab, setActiveTab] = useState("hot-deal");

  return (
    <div className="container mx-auto px-4 py-12 bg-gray-50">
      {/* Title */}
      <div className="flex items-center gap-3 mb-6">
        <Plane className="w-6 h-6 text-blue-600" />
        <h2 className="text-lg font-semibold">Vé máy bay giá tốt nhất</h2>
      </div>
      <p className="text-gray-600 mb-6">Vô vàn điểm đến hot</p>

      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        {[
          { key: "hot-deal", label: "🔥 Hot deal" },
          { key: "domestic", label: "Nội địa" },
          { key: "international", label: "Quốc tế" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-6 py-2 rounded-full text-sm transition ${
              activeTab === tab.key
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
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
        {flightDeals.map((deal) => (
          <SwiperSlide key={deal.id}>
            <div className="w-full bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer">
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
                <h3 className="mb-2 font-medium">
                  {deal.from} - {deal.to}
                </h3>
                <p className="text-gray-600 text-sm mb-1">🛫 Giá tốt nhất từ</p>
                <p className="text-orange-600 font-semibold">{deal.price}</p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
