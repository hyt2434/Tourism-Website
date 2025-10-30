// components/TourCarousel.jsx
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Autoplay } from "swiper/modules";
import { Link } from "react-router-dom";

export default function TourCarousel({ tours }) {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-36 max-w-container">
        <h2 className="text-3xl md:text-4xl font-bold text-title mb-8">
          Highlights
        </h2>

        <div className="relative">
          {/* Previous Button */}
          <button
            className="swiper-button-prev-tours absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-10 p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all focus:outline-none"
            aria-label="Previous tour"
          >
            <ChevronLeftIcon className="h-6 w-6 text-gray-700" />
          </button>

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

          {/* Next Button */}
          <button
            className="swiper-button-next-tours absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-10 p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all focus:outline-none"
            aria-label="Next tour"
          >
            <ChevronRightIcon className="h-6 w-6 text-gray-700" />
          </button>
        </div>
      </div>
    </section>
  );
}
