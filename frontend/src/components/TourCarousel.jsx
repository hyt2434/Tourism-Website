import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext"; // 👈 thêm

export default function TourCarousel({ tours }) {
  const { translations } = useLanguage(); // 👈 lấy translations

  return (
    <section className="py-12 bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-36 max-w-container">
        {/* Tiêu đề */}
        <h2 className="text-3xl md:text-4xl font-bold text-title dark:text-white mb-8">
          {translations.highlights}
        </h2>

        <div className="relative">
          {/* Nút Previous */}
          <button
            className="swiper-button-prev-tours absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-10 p-3 rounded-full bg-white dark:bg-gray-700 shadow-lg hover:shadow-xl transition-all focus:outline-none"
            aria-label={translations.previousTour}
          >
            <ChevronLeftIcon className="h-6 w-6 text-gray-700 dark:text-white" />
          </button>

          {/* Swiper */}
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            spaceBetween={30}
            slidesPerView={3}
            navigation={{
              prevEl: ".swiper-button-prev-tours",
              nextEl: ".swiper-button-next-tours",
            }}
            pagination={{ clickable: true }}
            breakpoints={{
              0: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
          >
            {tours.map((tour) => (
              <SwiperSlide key={tour.id}>
                <Link to={`/tour/${tour.id}`}>
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
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Nút Next */}
          <button
            className="swiper-button-next-tours absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-10 p-3 rounded-full bg-white dark:bg-gray-700 shadow-lg hover:shadow-xl transition-all focus:outline-none"
            aria-label={translations.nextTour}
          >
            <ChevronRightIcon className="h-6 w-6 text-gray-700 dark:text-white" />
          </button>
        </div>
      </div>
    </section>
  );
}
