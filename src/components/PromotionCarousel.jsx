// components/PromotionCarousel.jsx
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import PromotionCard from "./PromotionCard";

export default function PromotionCarousel({ promotions }) {
  return (
    <section className="max-w-[1440px] mx-auto px-20 py-20">
      <h2 className="text-black mb-12 tracking-tight">Active Promotions</h2>

      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={30}
        slidesPerView={3}
        navigation
        pagination={{ clickable: true }}
        breakpoints={{
          0: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
      >
        {promotions.map((promo, index) => (
          <SwiperSlide key={index}>
            <PromotionCard
              image={promo.image}
              title={promo.title}
              features={promo.features}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
