import { Heart, MapPin, Calendar, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext"; // 👈 thêm

export default function TourCard({ tour, viewMode = "grid" }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const { translations } = useLanguage(); // 👈 lấy translations

  // Check user role from localStorage
  useEffect(() => {
    const currentUser = localStorage.getItem("user");
    if (currentUser) {
      const user = JSON.parse(currentUser);
      setUserRole(user.role);
    }
  }, []);

  // List view layout
  if (viewMode === "list") {
    return (
      <Link
        to={`/tours/${tour.id}`}
        className="group bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row"
      >
        {/* Image - smaller in list view */}
        <div className="relative w-full sm:w-64 h-48 sm:h-auto flex-shrink-0 overflow-hidden">
          <img
            src={tour.image}
            alt={tour.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Favorite button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsFavorite(!isFavorite);
            }}
            className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-gray-700 rounded-full hover:bg-white dark:hover:bg-gray-600 transition-colors"
          >
            <Heart
              size={18}
              className={
                isFavorite
                  ? "fill-red-500 text-red-500"
                  : "text-gray-600 dark:text-gray-300"
              }
            />
          </button>

          {/* Badge */}
          {tour.badge && (
            <div className="absolute top-3 left-3 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
              {tour.badge}
            </div>
          )}
        </div>

        {/* Content - on the right in list view */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {tour.name}
            </h3>

            <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-300 mb-4">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
                <span className="line-clamp-1">{tour.destination}</span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
                <span>{tour.duration}</span>
              </div>

              <div className="flex items-center gap-2">
                <Users size={16} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
                <span>
                  {tour.maxSlots} {translations.slotsLeft}
                </span>
              </div>

              {/* Rating */}
              {tour.rating && (
                <div className="flex items-center gap-2">
                  <div className="bg-blue-600 text-white px-2 py-0.5 rounded font-bold text-xs">
                    {tour.rating}
                  </div>
                  <span className="text-xs">
                    ({tour.reviews} {translations.reviews})
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Price - aligned at bottom */}
          <div className="flex items-end justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {translations.from}
              </p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {tour.price.toLocaleString("vi-VN")} đ
              </p>
            </div>
            {userRole !== "partner" && (
              <button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm">
                {translations.bookNow}
              </button>
            )}
          </div>
        </div>
      </Link>
    );
  }

  // Grid view layout (default)
  return (
    <Link
      to={`/tours/${tour.id}`}
      className="group bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 flex flex-col"
    >
      {/* Image */}
      <div className="relative h-64 overflow-hidden flex-shrink-0">
        <img
          src={tour.image}
          alt={tour.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Favorite button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsFavorite(!isFavorite);
          }}
          className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-gray-700 rounded-full hover:bg-white dark:hover:bg-gray-600 transition-colors"
        >
          <Heart
            size={20}
            className={
              isFavorite
                ? "fill-red-500 text-red-500"
                : "text-gray-600 dark:text-gray-300"
            }
          />
        </button>

        {/* Badge */}
        {tour.badge && (
          <div className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {tour.badge}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col h-full">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 min-h-[3.5rem] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {tour.name}
        </h3>

        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-4 flex-grow">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
            <span className="line-clamp-1">{tour.destination}</span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
            <span>{tour.duration}</span>
          </div>

          <div className="flex items-center gap-2">
            <Users size={16} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
            <span>
              {tour.maxSlots} {translations.slotsLeft}
            </span>
          </div>
        </div>

        {/* Rating */}
        {tour.rating && (
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-blue-600 text-white px-2 py-1 rounded font-bold text-sm">
              {tour.rating}
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              ({tour.reviews} {translations.reviews})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-end justify-between pt-3 border-t border-gray-100 dark:border-gray-700 transition-colors mt-auto">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {translations.from}
            </p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {tour.price.toLocaleString("vi-VN")} đ
            </p>
          </div>
          {userRole !== "partner" && (
            <button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
              {translations.bookNow}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
