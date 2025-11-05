import { useState, useEffect } from "react";
import { useState, useEffect } from "react";
import TourCard from "./TourCard";
import FilterSidebar from "./FilterSidebar";
import { useLanguage } from "../context/LanguageContext";
import { Badge } from "./ui/badge";
import { weatherSuggestions, promotions, topRatedDestinations } from "../data/toursData";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { ArrowUpDown, Grid, List, MapPin, Star, Sun, Tag } from "lucide-react";

export default function ToursPage() {
  const { translations } = useLanguage();
  const [allTours, setAllTours] = useState([]);
  const [filteredTours, setFilteredTours] = useState([]);
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState("rating-desc");
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [currentWeather] = useState("sunny"); // Giả lập thời tiết

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
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
    
    return sorted;
  };

  const handleSortChange = (sortOption) => {
    setSortBy(sortOption);
  };

  const weather = weatherSuggestions[currentWeather];
  const suggestedTours = allTours.filter((t) =>
    weather.tours.includes(t.id)
  );

  useEffect(() => {
    const buildQueryString = (filterParams) => {
      const params = new URLSearchParams();

      if (filterParams.search) {
        params.append('search', filterParams.search);
      }
      if (filterParams.maxPrice && filterParams.maxPrice < 10000000) {
        params.append('price', filterParams.maxPrice);
      }
      if (filterParams.minRating && filterParams.minRating > 0) {
        params.append('rating', filterParams.minRating);
      }

      if (filterParams.regions && filterParams.regions.length > 0) {
        params.append('region', filterParams.regions[0]); 
      }
      if (filterParams.provinces && filterParams.provinces.length > 0) {
        params.append('province', filterParams.provinces[0]); 
      }
      if (filterParams.tourTypes && filterParams.tourTypes.length > 0) {
        params.append('type', filterParams.tourTypes[0]);
      }
      
      return params.toString();
    };

    const fetchTours = async () => {
      const queryString = buildQueryString(filters);
      const apiUrl = `http://localhost:5000/api/tour/?${queryString}`;
      
      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`Lỗi HTTP! Status: ${response.status}`);
        }
        const data = await response.json();
        
        setAllTours(data); 

        const sortedData = applySorting(data, sortBy);
        
        setFilteredTours(sortedData);
        
      } catch (error) {
        console.error("Lỗi khi fetch tour:", error);
      }
    };

    fetchTours();
  }, [filters, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Khám Phá Tour Du Lịch
          </h1>
          <p className="text-xl text-blue-100">
            Hơn {allTours.length} tour tuyệt vời đang chờ bạn
          </p>
        </div>
      </div>

      {/* Main Search & Filter Section - ĐƯA LÊN TRÊN */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <FilterSidebar onFilterChange={handleFilterChange} />
          </div>

          {/* Tours List */}
          <div className="lg:col-span-3">
            {/* Toolbar */}
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
              <p className="text-gray-600">
                Tìm thấy <strong>{filteredTours.length}</strong> tour
              </p>
              
              <div className="flex items-center gap-3">
                {/* View Mode */}
                <div className="flex border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 ${viewMode === "grid" ? "bg-blue-600 text-white" : "bg-white text-gray-600"}`}
                  >
                    <Grid size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 ${viewMode === "list" ? "bg-blue-600 text-white" : "bg-white text-gray-600"}`}
                  >
                    <List size={18} />
                  </button>
                </div>

                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="rating-desc">⭐ Đánh giá cao nhất</option>
                  <option value="rating-asc">⭐ Đánh giá thấp nhất</option>
                  <option value="price-asc">💰 Giá thấp → cao</option>
                  <option value="price-desc">💰 Giá cao → thấp</option>
                  <option value="reviews-desc">💬 Nhiều review nhất</option>
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
              <div className="text-center py-20 bg-white rounded-lg">
                <p className="text-xl text-gray-500 mb-4">
                  😔 Không tìm thấy tour phù hợp
                </p>
                <p className="text-gray-400">
                  Thử điều chỉnh bộ lọc để xem thêm tour
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Rated Destinations - ĐƯA XUỐNG DƯỚI */}
      <div className="bg-white py-8 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            📍 Địa Điểm Được Đánh Giá Cao
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {topRatedDestinations.map((dest, index) => (
              <Card key={index} className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-32 object-cover"
                />
                <div className="p-3">
                  <h3 className="font-semibold text-gray-900">{dest.name}</h3>
                  <p className="text-xs text-gray-500">{dest.province}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold">{dest.rating}</span>
                    <span className="text-xs text-gray-500">({dest.reviews})</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Weather-based Suggestions - Ở DƯỚI */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <Sun className="w-8 h-8 text-orange-500" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {weather.icon} Gợi Ý Theo Thời Tiết Hôm Nay
              </h2>
              <p className="text-gray-600">
                {weather.condition} • {weather.temp} • {weather.description}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {suggestedTours.slice(0, 3).map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        </div>
      </div>

      {/* Active Promotions - Ở DƯỚI */}
      {promotions.length > 0 && (
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-6">
              <Tag className="w-6 h-6 text-pink-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                🎉 Khuyến Mãi Đang Diễn Ra
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {promotions.map((promo) => (
                <Card key={promo.id} className="overflow-hidden border-2 border-pink-200">
                  <img
                    src={promo.image}
                    alt={promo.title}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-4">
                    <Badge variant="destructive" className="mb-2">
                      Giảm {promo.discount}%
                    </Badge>
                    <h3 className="font-bold text-gray-900 mb-2">{promo.title}</h3>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-600">
                        <strong>Mã:</strong> <code className="bg-pink-100 px-2 py-1 rounded">{promo.code}</code>
                      </p>
                      <p className="text-gray-600">
                        <strong>HSD:</strong> {promo.validUntil}
                      </p>
                      <p className="text-xs text-gray-500">{promo.condition}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Promotions */}
      <div className="bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            💡 Khuyến Mãi Liên Quan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promotions.map((promo) => {
              const relatedTours = allTours.filter((t) =>
                promo.tourIds.includes(t.id)
              );
              return (
                <Card key={promo.id} className="p-6 hover:shadow-lg transition-shadow">
                  <Badge variant="destructive" className="mb-3">
                    -{promo.discount}%
                  </Badge>
                  <h3 className="font-bold text-lg mb-2">{promo.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{promo.condition}</p>
                  <div className="flex items-center justify-between">
                    <code className="bg-gray-200 px-3 py-1 rounded text-sm font-mono">
                      {promo.code}
                    </code>
                    <Button size="sm" variant="outline">Xem chi tiết</Button>
                  </div>
                  {relatedTours.length > 0 && (
                    <p className="text-xs text-gray-500 mt-3">
                      Áp dụng cho: {relatedTours.map((t) => t.name).join(", ")}
                    </p>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}