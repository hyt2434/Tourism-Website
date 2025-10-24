// components/TourCarousel.jsx
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Autoplay } from "swiper/modules";

export default function TourCarousel({ tours }) {
  return (
    <section className="max-w-[1440px] mx-auto px-20 py-20">
      <h2 className="text-black mb-12 tracking-tight">Popular Tours</h2>
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
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
        {tours.map((tour) => (
          <SwiperSlide key={tour.id}>
            <div className="rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition">
              <img
                src={tour.image}
                alt={tour.name}
                className="w-full h-60 object-cover"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold">{tour.name}</h3>
                <p className="text-gray-600 mt-2">{tour.description}</p>
                <p className="mt-3 font-medium">{tour.price}</p>
                <p className="text-sm text-gray-500">{tour.duration}</p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
