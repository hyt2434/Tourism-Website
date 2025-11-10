import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

export default function FilterSidebar({ onFilterChange }) {
  const [filters, setFilters] = useState({
    destination: "",
    minPrice: 0,
    maxPrice: 10000000,
    startDate: "",
  });

  const destinations = [
    "Hà Nội",
    "TP Hồ Chí Minh",
    "Đà Nẵng",
    "Hạ Long",
    "Phú Quốc",
    "Nha Trang",
    "Đà Lạt",
    "Hội An",
  ];

  const handleChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-4 transition-colors duration-300">
      <div className="flex items-center gap-2 mb-6">
        <SlidersHorizontal size={20} className="text-gray-600 dark:text-gray-300" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Bộ lọc tìm kiếm</h3>
      </div>

      {/* Search */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Tìm kiếm
        </label>
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
          />
          <input
            type="text"
            placeholder="Tên tour, địa điểm..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            onChange={(e) => handleChange("search", e.target.value)}
          />
        </div>
      </div>

      {/* Destination */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Điểm đến
        </label>
        <select
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          onChange={(e) => handleChange("destination", e.target.value)}
        >
          <option value="">Tất cả điểm đến</option>
          {destinations.map((dest) => (
            <option key={dest} value={dest}>
              {dest}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Khoảng giá (VNĐ)
        </label>
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
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>0đ</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              {filters.maxPrice.toLocaleString("vi-VN")}đ
            </span>
          </div>
        </div>
      </div>

      {/* Date */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Ngày khởi hành
        </label>
        <input
          type="date"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          onChange={(e) => handleChange("startDate", e.target.value)}
        />
      </div>

      {/* Reset */}
      <button
        onClick={() => {
          setFilters({
            destination: "",
            minPrice: 0,
            maxPrice: 10000000,
            startDate: "",
          });
          onFilterChange({});
        }}
        className="w-full py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-semibold"
      >
        Xóa bộ lọc
      </button>
    </div>
  );
}
