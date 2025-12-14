import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon } from "@heroicons/react/24/outline";
import { Loader } from "lucide-react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { getTranslatedContent } from "../utils/translation";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function TourCarousel() {
  const { translations, language } = useLanguage();
  const [tours, setTours] = useState([]);
  const [translatedTours, setTranslatedTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    fetchHighlightedTours();
  }, []);

  const fetchHighlightedTours = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/tours/highlights?limit=6`);
      const data = await response.json();
      
      if (data.success) {
        setTours(data.tours);
      } else {
        console.error('Failed to fetch highlighted tours:', data.error);
      }
    } catch (error) {
      console.error('Error fetching highlighted tours:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tours.length === 0) return;
    
    const translateTours = async () => {
      setTranslating(true);
      try {
        const translated = await Promise.all(
          tours.map(async (tour) => {
            const translatedName = await getTranslatedContent(tour.name || '', language);
            const translatedDescription = await getTranslatedContent(tour.description || '', language);
            
            return {
              ...tour,
              translatedName,
              translatedDescription
            };
          })
        );
        setTranslatedTours(translated);
      } catch (error) {
        console.error('Error translating tours:', error);
        setTranslatedTours(tours.map(tour => ({
          ...tour,
          translatedName: tour.name,
          translatedDescription: tour.description
        })));
      } finally {
        setTranslating(false);
      }
    };

    translateTours();
  }, [language, tours]);

  const formatPrice = (price, currency) => {
    if (currency === 'VND') {
      return `${price.toLocaleString('vi-VN')} ₫`;
    }
    return `$${price}`;
  };

  if (loading) {
    return (
      <section className="py-8 px-4 md:px-8 lg:px-36 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="flex items-center justify-center py-12">
          <Loader className="w-12 h-12 animate-spin text-blue-600" />
        </div>
      </section>
    );
  }

  if (tours.length === 0) {
    return null;
  }

  return (
    <section className="py-8 px-4 md:px-8 lg:px-36 bg-section dark:bg-gray-900 transition-colors duration-300">
      <div>
        {/* Tiêu đề */}
        <h2 className="text-3xl md:text-4xl font-bold text-title dark:text-white mb-8">
          {translations.highlights}
        </h2>

        <div className="relative pb-12">
          {/* Nút Previous */}
          <button
            className="swiper-button-prev-tours absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-10 p-3 rounded-full bg-white dark:bg-gray-700 shadow-lg hover:shadow-xl transition-all focus:outline-none hover:bg-gray-50 dark:hover:bg-gray-600"
            aria-label={translations.previousTour}
          >
            <ChevronLeftIcon className="h-6 w-6 text-gray-700 dark:text-white" />
          </button>

          {/* Swiper */}
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            spaceBetween={30}
            slidesPerView={4}
            navigation={{
              prevEl: ".swiper-button-prev-tours",
              nextEl: ".swiper-button-next-tours",
            }}
            pagination={{ clickable: true }}
            breakpoints={{
              0: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 4 },
            }}
            className="pb-10"
          >
            {(translatedTours.length > 0 ? translatedTours : tours).map((tour) => {
              const displayName = tour.translatedName || tour.name || '';
              const displayDescription = tour.translatedDescription || tour.description || '';
              
              return (
                <SwiperSlide key={tour.id}>
                  <Link to={`/tours/${tour.id}`}>
                    <div className="rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shine-effect group">
                      <div className="relative">
                        <img
                          src={tour.image}
                          alt={displayName}
                          className="w-full h-60 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {tour.booking_count > 0 && (
                          <div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                            🔥 {tour.booking_count} {translations.bookings || 'bookings'}
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white line-clamp-2 min-h-[3.5rem]">
                          {displayName}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mt-2 line-clamp-2 text-sm">
                          {displayDescription}
                        </p>
                        <div className="mt-3 flex items-center justify-between">
                          <div>
                            <p className="font-medium text-blue-600 dark:text-blue-400">
                              {formatPrice(tour.price, tour.currency)}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              <CalendarIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {tour.duration}
                              </p>
                            </div>
                          </div>
                          {tour.rating > 0 && (
                            <div className="flex items-center gap-1 text-sm">
                              <span className="text-yellow-400">⭐</span>
                              <span className="text-gray-700 dark:text-gray-300 font-medium">{tour.rating}</span>
                              <span className="text-gray-500 dark:text-gray-400">({tour.reviews})</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </SwiperSlide>
              );
            })}
          </Swiper>

          {/* Nút Next */}
          <button
            className="swiper-button-next-tours absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-10 p-3 rounded-full bg-white dark:bg-gray-700 shadow-lg hover:shadow-xl transition-all focus:outline-none hover:bg-gray-50 dark:hover:bg-gray-600"
            aria-label={translations.nextTour}
          >
            <ChevronRightIcon className="h-6 w-6 text-gray-700 dark:text-white" />
          </button>
        </div>
      </div>
    </section>
  );
}