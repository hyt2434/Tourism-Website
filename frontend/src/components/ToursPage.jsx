import { useState } from "react";
import TourCard from "./TourCard";
import FilterSidebar from "./FilterSidebar";
import { useLanguage } from "../context/LanguageContext";
import { allToursData, weatherSuggestions, promotions, topRatedDestinations } from "../data/toursData";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { ArrowUpDown, Grid, List, MapPin, Star, Sun, Tag } from "lucide-react";

export default function ToursPage() {
  const { translations } = useLanguage();

  const [filteredTours, setFilteredTours] = useState(allToursData);
  const [sortBy, setSortBy] = useState("rating-desc");
  const [viewMode, setViewMode] = useState("grid");
  const [currentWeather] = useState("sunny");

  const handleFilterChange = (filters) => {
    let result = [...allToursData];

    if (filters.search) {
      result = result.filter((t) =>
        t.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        t.destination.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.regions && filters.regions.length > 0) {
      result = result.filter((t) => filters.regions.includes(t.region));
    }

    if (filters.provinces && filters.provinces.length > 0) {
      result = result.filter((t) => filters.provinces.includes(t.province));
    }

    if (filters.maxPrice) {
      result = result.filter((t) => t.price <= filters.maxPrice);
    }

    if (filters.minRating > 0) {
      result = result.filter((t) => t.rating >= filters.minRating);
    }

    if (filters.tourTypes && filters.tourTypes.length > 0) {
      result = result.filter((t) =>
        t.type.some((type) => filters.tourTypes.includes(type))
      );
    }

    if (filters.startDate) {
      // Giả lập filter theo ngày
    }

    setFilteredTours(result);
    applySorting(result, sortBy);
  };

  const applySorting = (tours, sortOption) => {
    let sorted = [...tours];

    switch (sortOption) {
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "rating-desc":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case "rating-asc":
        sorted.sort((a, b) => a.rating - b.rating);
        break;
      case "reviews-desc":
        sorted.sort((a, b) => b.reviews - a.reviews);
        break;
      default:
        break;
    }

    setFilteredTours(sorted);
  };

  const handleSortChange = (sortOption) => {
    setSortBy(sortOption);
    applySorting(filteredTours, sortOption);
  };

  // Safe access to weather data with fallback
  const weather = weatherSuggestions?.[currentWeather] || {
    icon: "☀️",
    condition: "Sunny",
    temp: "28°C",
    description: "Perfect weather for touring",
    tours: []
  };

  const suggestedTours = allToursData.filter((t) =>
    weather.tours.includes(t.id)
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Hero Section */}
      <div className="py-16 px-4 md:px-8 lg:px-36">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-gray-900 dark:text-white">
            {translations.exploreTours || "Khám Phá Tour Du Lịch"}
          </h1>
          <p className="text-2xl md:text-3xl text-gray-600 dark:text-gray-400 font-light">
            {translations.totalTours || "Hơn"} {allToursData.length} {translations.toursWaiting || "tour tuyệt vời đang chờ bạn"}
          </p>
        </div>
      </div>

      {/* Main Search & Filter Section */}
      <div className="px-4 md:px-8 lg:px-36 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <FilterSidebar onFilterChange={handleFilterChange} />
          </div>

          {/* Tours List */}
          <div className="lg:col-span-3">
            {/* Toolbar */}
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
              <p className="text-gray-600 dark:text-gray-400">
                {translations.found || "Tìm thấy"} <strong className="text-gray-900 dark:text-white">{filteredTours.length}</strong> {translations.toursA || "tour"}
              </p>

              <div className="flex items-center gap-3">
                {/* View Mode */}
                <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 transition-colors ${viewMode === "grid"
                      ? "bg-blue-600 text-white"
                      : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    aria-label={translations.gridView || "Xem dạng lưới"}
                  >
                    <Grid size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 transition-colors ${viewMode === "list"
                      ? "bg-blue-600 text-white"
                      : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    aria-label={translations.listView || "Xem dạng danh sách"}
                  >
                    <List size={18} />
                  </button>
                </div>

                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="rating-desc">⭐ {translations.highestRating || "Đánh giá cao nhất"}</option>
                  <option value="rating-asc">⭐ {translations.lowestRating || "Đánh giá thấp nhất"}</option>
                  <option value="price-asc">💰 {translations.priceLowHigh || "Giá thấp → cao"}</option>
                  <option value="price-desc">💰 {translations.priceHighLow || "Giá cao → thấp"}</option>
                  <option value="reviews-desc">💬 {translations.mostReviews || "Nhiều review nhất"}</option>
                </select>
              </div>
            </div>

            {/* Tours Grid/List */}
            {filteredTours.length > 0 ? (
              <div className={viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                : "space-y-4"
              }>
                {filteredTours.map((tour) => (
                  <TourCard key={tour.id} tour={tour} viewMode={viewMode} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-xl text-gray-500 dark:text-gray-400 mb-4">
                  😔 {translations.noToursFound || "Không tìm thấy tour phù hợp"}
                </p>
                <p className="text-gray-400 dark:text-gray-500">
                  {translations.adjustFilters || "Thử điều chỉnh bộ lọc để xem thêm tour"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Rated Destinations */}
      <div className="bg-section dark:bg-gray-900 py-12 px-4 md:px-8 lg:px-36">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            📍 {translations.topRatedDestinations || "Địa Điểm Được Đánh Giá Cao"}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {topRatedDestinations.map((dest, index) => (
              <Card key={index} className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-32 object-cover"
                />
                <div className="p-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{dest.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{dest.province}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{dest.rating}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">({dest.reviews})</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Weather-based Suggestions */}
      {suggestedTours.length > 0 && (
        <div className="bg-white dark:bg-gray-800 py-12 px-4 md:px-8 lg:px-36">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              {translations.weatherSuggestions || "Gợi Ý Theo Thời Tiết Hôm Nay"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestedTours.slice(0, 3).map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>
          </div>
        </div>
      )}




    </div>
  );
}