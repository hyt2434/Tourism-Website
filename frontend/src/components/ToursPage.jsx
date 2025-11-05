import { useState, useEffect } from "react";
import TourCard from "./TourCard";
import FilterSidebar from "./FilterSidebar";
import { useLanguage } from "../context/LanguageContext";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { ArrowUpDown, Grid, List, MapPin, Star, Sun, Tag } from "lucide-react";

export default function ToursPage() {
  const { translations } = useLanguage();
  const [allTours, setAllTours] = useState([]);
  const [filteredTours, setFilteredTours] = useState([]);
  const [suggestedTours, setSuggestedTours] = useState([]);
  const [topDestinations, setTopDestinations] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState("rating-desc");
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [currentWeather, setCurrentWeather] = useState("sunny"); // Giả lập thời tiết
  const [weatherDetails, setWeatherDetails] = useState(null);

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
      if (filterParams.startDate) { 
        params.append('start_date', filterParams.startDate); 
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

useEffect(() => {
  const fetchSuggestions = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/suggestions/weather?condition=${currentWeather}`);
      if (!response.ok) {
        throw new Error("Lỗi khi tải gợi ý");
      }
      const data = await response.json();
      setSuggestedTours(data);
    } catch (error) {
      console.error("Lỗi khi fetch gợi ý:", error);
    }
  };

  fetchSuggestions();
}, [currentWeather]);

useEffect(() => {
  const fetchTopDestinations = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/destinations/top-rated");
      if (!response.ok) {
        throw new Error("Lỗi khi tải top destinations");
      }
      const data = await response.json();
      setTopDestinations(data);
    } catch (error) {
      console.error(error);
    }
  };

  fetchTopDestinations();
}, []);

useEffect(() => {
  const fetchPromotions = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/promotions");
      if (!response.ok) {
        throw new Error("Lỗi khi tải promotions");
      }
      const data = await response.json();
      setPromotions(data);
    } catch (error) {
      console.error(error);
    }
  };

  fetchPromotions();
}, []);

useEffect(() => {
      const fetchRealWeather = async () => {
        
        const apiKey = "4d8893b02fa14aa39b2210854250511";
        
        const apiUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=auto:ip&lang=vi`;

        try {
          const response = await fetch(apiUrl);
          if (!response.ok) throw new Error("Lỗi khi gọi API thời tiết");
          
          const data = await response.json();
          
          setCurrentWeather(data.current.condition.text.toLowerCase()); 
          
          setWeatherDetails(data.current); 

        } catch (error) {
          console.error("Không thể lấy thời tiết thật:", error);
        }
      };

      fetchRealWeather();
    }, []);

    const WeatherDescriptions = {
  'nắng': 'Thời tiết hoàn hảo cho hoạt động biển!',
  'nắng đẹp': 'Ngày tuyệt vời để khám phá các điểm tham quan ngoài trời.',
  'clear': 'Thời tiết hoàn hảo để ngắm sao và đi dạo buổi tối.',
  'rải rác mây': 'Nhiệt độ dễ chịu, lý tưởng cho trekking và leo núi.',
  'mưa': 'Thời tiết lý tưởng cho các tour ẩm thực trong nhà và tham quan bảo tàng.',
  'mưa rào': 'Mang theo ô và tận hưởng chuyến thăm đến các chợ và trung tâm mua sắm.',
  'mưa phùn': 'Không quá tệ! Rất phù hợp cho các quán cà phê ấm cúng và lớp học nấu ăn.',
  'lốc xoáy': 'Vì sự an toàn của bạn, chúng tôi chỉ gợi ý các hoạt động trong nhà.',
  'mây': 'Hoàn hảo cho việc đi bộ đường dài mà không bị nắng gắt.',
  'âm u': 'Thời tiết lý tưởng cho các tour di tích lịch sử và văn hóa.',
  'sương mù': 'Tận hưởng vẻ đẹp huyền bí, nhưng hãy cẩn thận khi lái xe.',
  'tuyết': 'Đã đến lúc cho các hoạt động thể thao mùa đông và tour nghỉ dưỡng suối nước nóng.'
};

const removeAccents = (str) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

const getWeatherTip = (weatherText) => {
  if (!weatherText) return 'Hãy kiểm tra dự báo trước khi lên đường!';

  const normalizedInput = removeAccents(weatherText.toLowerCase()); 

  for (const keyword in WeatherDescriptions) {
    const normalizedKeyword = removeAccents(keyword.toLowerCase()); 

    if (normalizedInput.includes(normalizedKeyword)) {
      return WeatherDescriptions[keyword];
    }
  }

  return 'Thời tiết hôm nay có chút bất ngờ! Hãy chuẩn bị mọi thứ.';
};

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {translations.exploreTours || "Khám Phá Tour Du Lịch"}
          </h1>
          <p className="text-xl text-blue-100">
            {translations.totalTours || "Hơn"} {allTours.length} {translations.toursWaiting || "tour tuyệt vời đang chờ bạn"}
          </p>
        </div>
      </div>

      {/* Main Search & Filter Section */}
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
      <div className="bg-white dark:bg-gray-800 py-8 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            📍 {translations.topRatedDestinations || "Địa Điểm Được Đánh Giá Cao"}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {topDestinations.map((dest) => (
              <Card key={dest.id} className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                <img
                  src={dest.image_url}
                  alt={dest.name}
                  className="w-full h-32 object-cover"
                />
                <div className="p-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{dest.name}</h3>
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{parseFloat(dest.avg_rating).toFixed(1)}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">({dest.total_reviews})</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Weather-based Suggestions */}
      {weatherDetails && suggestedTours.length > 0 && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-6">
              {/* 1. Hiển thị Icon "Thật" từ API */}
              <img src={weatherDetails.condition.icon} alt={weatherDetails.condition.text} className="w-10 h-10" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {translations.weatherSuggestions || "Gợi Ý Theo Thời Tiết Hôm Nay"}
                </h2>
                {/* 2. Hiển thị Dữ liệu "Thật" từ API */}
                <p className="text-gray-600 dark:text-gray-400">
                  {weatherDetails.condition.text} • {weatherDetails.temp_c}°C
                  {weatherDetails.condition.text && ` • ${getWeatherTip(weatherDetails.condition.text)}` }
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 3. Hiển thị Tour Gợi ý (từ API Của Ta) */}
              {suggestedTours.slice(0, 3).map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active Promotions */}
      {promotions.length > 0 && (
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-6">
              <Tag className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                🎉 {translations.activePromotions || "Khuyến Mãi Đang Diễn Ra"}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {promotions.map((promo) => (
                <Card key={promo.id} className="overflow-hidden border-2 border-pink-200 dark:border-pink-700 bg-white dark:bg-gray-800">
                  <img
                    src={promo.image_url}
                    alt={promo.title}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-4">
                    <Badge variant="destructive" className="mb-2">
                      {translations.discount || "Giảm"} {promo.discount_value}
                      {promo.discount_type === 'percent' ? '%' : 'đ'}
                    </Badge>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">{promo.title}</h3>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-600 dark:text-gray-400">
                        <strong>{translations.code || "Mã"}:</strong> <code className="bg-pink-100 dark:bg-pink-900/30 px-2 py-1 rounded text-gray-900 dark:text-white">{promo.code}</code>
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        <strong>{translations.validUntil || "HSD"}:</strong> {new Date(promo.end_date).toLocaleDateString('vi-VN')}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">{promo.conditions}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Promotions */}
      <div className="bg-gray-100 dark:bg-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            💡 {translations.relatedPromotions || "Khuyến Mãi Liên Quan"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promotions.map((promo) => {
              {/* TẠM ẨN
              const relatedTours = allTours.filter((t) =>
                promo.tourIds.includes(t.id)
              );
              */}
              return (
                <Card key={promo.id} className="p-6 hover:shadow-lg transition-shadow bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                  <Badge variant="destructive" className="mb-3">
                    -{promo.discount_value} {promo.discount_type === 'percent' ? '%' : 'đ'}
                  </Badge>
                  <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">{promo.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{promo.conditions}</p>
                  <div className="flex items-center justify-between">
                    <code className="bg-gray-200 dark:bg-gray-600 px-3 py-1 rounded text-sm font-mono text-gray-900 dark:text-white">
                      {promo.code}
                    </code>
                    <Button size="sm" variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                      {translations.viewDetails || "Xem chi tiết"}
                    </Button>
                  </div>
                  {/* TẠM ẨN
                  {relatedTours.length > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">
                      {translations.applyFor || "Áp dụng cho"}: {relatedTours.map((t) => t.name).join(", ")}
                    </p>
                  )}
                  */}
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}