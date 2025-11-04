import { Heart, MapPin, Calendar, Users } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function TourCard({ tour }) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <Link
      to={`/tours/${tour.id}`}
      className="group bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
    >
      {/* Image */}
      <div className="relative h-64 overflow-hidden">
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
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {tour.name}
        </h3>

        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-4">
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
            <span>{tour.maxSlots} chỗ còn lại</span>
          </div>
        </div>

        {/* Rating */}
        {tour.rating && (
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-blue-600 text-white px-2 py-1 rounded font-bold text-sm">
              {tour.rating}
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              ({tour.reviews} đánh giá)
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-end justify-between pt-3 border-t border-gray-100 dark:border-gray-700 transition-colors">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Từ</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {parseFloat(tour.price).toLocaleString("vi-VN")} đ
            </p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
            Đặt ngay
          </button>
        </div>
      </div>
    </Link>
  );
}
