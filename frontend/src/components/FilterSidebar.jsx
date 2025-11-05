import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, MapPin, Star, ChevronDown, ChevronUp, X } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";

export default function FilterSidebar({ onFilterChange }) {
  const [filters, setFilters] = useState({
    search: "",
    regions: [],
    provinces: [],
    minPrice: 0,
    maxPrice: 10000000,
    startDate: "",
    minRating: 0,
    tourTypes: [],
    distance: 100,
  });

  const [expandedSections, setExpandedSections] = useState({
    region: true,
    province: false,
    price: true,
    rating: true,
    type: true,
  });

  const [apiData, setApiData] = useState({
    regions: [],
    provinces: [],
    tourTypes: []
  });

  const popularKeywords = [
    "Hà Nội",
    "Phú Quốc",
    "Đà Nẵng",
    "Nha Trang",
    "Sapa",
    "Hội An",
  ];

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleArrayFilter = (key, value) => {
    const currentArray = filters[key];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value];
    
    const newFilters = { ...filters, [key]: newArray };
    setFilters(newFilters);
  };

  const handleChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const applyFilters = () => {
    onFilterChange(filters);
  };

  const resetFilters = () => {
    const resetState = {
      search: "",
      regions: [],
      provinces: [],
      minPrice: 0,
      maxPrice: 10000000,
      startDate: "",
      minRating: 0,
      tourTypes: [],
      distance: 100,
    };
    setFilters(resetState);
    onFilterChange({});
  };

  const activeFilterCount = 
    filters.regions.length + 
    filters.provinces.length + 
    filters.tourTypes.length + 
    (filters.search ? 1 : 0) +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.maxPrice < 10000000 ? 1 : 0);

    useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/filter/");
        if (!response.ok) {
          throw new Error("FILTER NOT WORKING ERROR");
        }
        const data = await response.json();
        setApiData(data);
      } catch (error) {
        console.error(error);
      }
    };
    
    fetchFilterData();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={20} className="text-blue-600" />
          <h3 className="text-lg font-bold text-gray-900">Bộ lọc tìm kiếm</h3>
          {activeFilterCount > 0 && (
            <Badge variant="default" className="ml-2">{activeFilterCount}</Badge>
          )}
        </div>
      </div>

      {/* Từ khóa phổ biến */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Tìm kiếm nhanh
        </label>
        <div className="flex flex-wrap gap-2">
          {popularKeywords.map((keyword) => (
            <Badge
              key={keyword}
              variant={filters.search === keyword ? "default" : "outline"}
              className="cursor-pointer hover:bg-blue-50"
              onClick={() => handleChange("search", keyword)}
            >
              {keyword}
            </Badge>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Tìm kiếm tour / điểm đến
        </label>
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Nhập từ khóa..."
            value={filters.search}
            className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onChange={(e) => handleChange("search", e.target.value)}
          />
          {filters.search && (
            <button
              onClick={() => handleChange("search", "")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Vùng miền */}
      <div className="mb-6 border-t pt-4">
        <button
          onClick={() => toggleSection("region")}
          className="flex items-center justify-between w-full text-sm font-semibold text-gray-700 mb-3"
        >
          <span>Vùng miền</span>
          {expandedSections.region ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {expandedSections.region && (
          <div className="space-y-3">
            {apiData.regions.map((region) => (
              <div key={region.id} className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <Checkbox
                    checked={filters.regions.includes(region.id)}
                    onCheckedChange={() => handleArrayFilter("regions", region.id)}
                  />
                  <span className="text-sm text-gray-700 group-hover:text-blue-600">
                    {region.name}
                  </span>
                  <span className="text-xs text-gray-400">
                    ({apiData.provinces.filter(p => p.region_id === region.id).length})
                  </span>
                </label>
                {/* Tỉnh thành con */}
                {filters.regions.includes(region.id) && (
                  <div className="ml-6 space-y-2 pl-3 border-l-2 border-gray-200">
                    {apiData.provinces.filter(p => p.region_id === region.id).map((province) => (
                      <label key={province} className="flex items-center gap-2 cursor-pointer group">
                        <Checkbox
                          checked={filters.provinces.includes(province.id)}
                          onCheckedChange={() => handleArrayFilter("provinces", province.id)}
                        />
                        <span className="text-sm text-gray-600 group-hover:text-blue-600">
                          {province.name}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Khoảng giá */}
      <div className="mb-6 border-t pt-4">
        <button
          onClick={() => toggleSection("price")}
          className="flex items-center justify-between w-full text-sm font-semibold text-gray-700 mb-3"
        >
          <span>Khoảng giá</span>
          {expandedSections.price ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {expandedSections.price && (
          <div className="space-y-3">
            <input
              type="range"
              min="0"
              max="10000000"
              step="100000"
              value={filters.maxPrice}
              onChange={(e) => handleChange("maxPrice", parseInt(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">0đ</span>
              <span className="text-sm font-semibold text-blue-600">
                {filters.maxPrice.toLocaleString("vi-VN")}đ
              </span>
            </div>
            {/* Quick price filters */}
            <div className="flex flex-wrap gap-2 mt-3">
              {[1000000, 3000000, 5000000, 10000000].map((price) => (
                <Badge
                  key={price}
                  variant={filters.maxPrice === price ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleChange("maxPrice", price)}
                >
                  {price < 10000000 ? `< ${(price / 1000000)}tr` : "Tất cả"}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Đánh giá tối thiểu */}
      <div className="mb-6 border-t pt-4">
        <button
          onClick={() => toggleSection("rating")}
          className="flex items-center justify-between w-full text-sm font-semibold text-gray-700 mb-3"
        >
          <span>Đánh giá</span>
          {expandedSections.rating ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {expandedSections.rating && (
          <div className="space-y-2">
            {[5, 4, 3].map((rating) => (
              <label key={rating} className="flex items-center gap-2 cursor-pointer group">
                <Checkbox
                  checked={filters.minRating === rating}
                  onCheckedChange={() => handleChange("minRating", filters.minRating === rating ? 0 : rating)}
                />
                <div className="flex items-center gap-1">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-sm text-gray-600 ml-1">trở lên</span>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Loại hình tour */}
      <div className="mb-6 border-t pt-4">
        <button
          onClick={() => toggleSection("type")}
          className="flex items-center justify-between w-full text-sm font-semibold text-gray-700 mb-3"
        >
          <span>Loại hình</span>
          {expandedSections.type ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {expandedSections.type && (
          <div className="space-y-2">
            {apiData.tourTypes.map((type) => (
              <label key={type.id} className="flex items-center gap-2 cursor-pointer group">
                <Checkbox
                  checked={filters.tourTypes.includes(type.id)}
                  onCheckedChange={() => handleArrayFilter("tourTypes", type.id)}
                />
                <span className="text-sm text-gray-700 group-hover:text-blue-600">
                  {type.name}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Ngày khởi hành */}
      <div className="mb-6 border-t pt-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Ngày khởi hành
        </label>
        <input
          type="date"
          value={filters.startDate}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          onChange={(e) => handleChange("startDate", e.target.value)}
        />
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-4 border-t sticky bottom-0 bg-white pb-2">
        <Button
          onClick={applyFilters}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-md"
          size="lg"
        >
          Áp dụng bộ lọc
        </Button>
        <Button
          onClick={resetFilters}
          variant="outline"
          className="w-full"
          size="lg"
        >
          Xóa tất cả
        </Button>
      </div>
    </div>
  );
}
