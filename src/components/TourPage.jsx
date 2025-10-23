import { useState } from "react";
import TourCard from "./TourCard";
import FilterSidebar from "./FilterSidebar";
import Navigation from "./Navigation";
import Footer from "./Footer";

export default function ToursPage() {
  // Mock data - sẽ thay bằng API call
  const allTours = [
    {
      id: 1,
      name: "Du thuyền Hạ Long 5 sao - Trải nghiệm sang trọng",
      destination: "Hạ Long",
      image:
        "https://images.unsplash.com/photo-1713551584340-7b7817f39a62?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYWxvbmclMjBiYXklMjB2aWV0bmFtJTIwdG91cnxlbnwxfHx8fDE3NjA5NzkzMzd8MA&ixlib=rb-4.1.0&q=80&w=1080",
      price: 5990000,
      duration: "2 ngày 1 đêm",
      maxSlots: 12,
      rating: 9.2,
      reviews: 248,
      badge: "Bán chạy",
    },
    {
      id: 2,
      name: "Phố cổ Hội An - Khám phá di sản văn hóa",
      destination: "Hội An",
      image:
        "https://images.unsplash.com/photo-1583417319070-4a69db38a482?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob2klMjBhbiUyMHZpZXRuYW18ZW58MXx8fHwxNzYwOTc5Mzc1fDA&ixlib=rb-4.1.0&q=80&w=1080",
      price: 3490000,
      duration: "3 ngày 2 đêm",
      maxSlots: 8,
      rating: 9.5,
      reviews: 512,
    },
    {
      id: 3,
      name: "Phú Quốc - Thiên đường nghỉ dưỡng",
      destination: "Phú Quốc",
      image:
        "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaHUlMjBxdW9jJTIwdmlldG5hbXxlbnwxfHx8fDE3NjA5NzkzOTB8MA&ixlib=rb-4.1.0&q=80&w=1080",
      price: 7290000,
      duration: "4 ngày 3 đêm",
      maxSlots: 5,
      rating: 9.0,
      reviews: 186,
      badge: "Ưu đãi",
    },
    {
      id: 4,
      name: "Sapa - Chinh phục đỉnh Fansipan",
      destination: "Sapa",
      image:
        "https://images.unsplash.com/photo-1583417319070-4a69db38a482?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxzYXBhJTIwdmlldG5hbXxlbnwxfHx8fDE3NjA5Nzk0MDV8MA&ixlib=rb-4.1.0&q=80&w=1080",
      price: 4590000,
      duration: "3 ngày 2 đêm",
      maxSlots: 15,
      rating: 8.8,
      reviews: 324,
    },
  ];

  const [filteredTours, setFilteredTours] = useState(allTours);

  const handleFilterChange = (filters) => {
    let result = [...allTours];

    if (filters.destination) {
      result = result.filter((t) => t.destination === filters.destination);
    }

    if (filters.maxPrice) {
      result = result.filter((t) => t.price <= filters.maxPrice);
    }

    if (filters.search) {
      result = result.filter((t) =>
        t.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredTours(result);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-20">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Khám phá các tour du lịch
          </h1>
          <p className="text-xl text-blue-100">
            Hơn {allTours.length} tour đang chờ bạn khám phá
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-20 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <FilterSidebar onFilterChange={handleFilterChange} />
          </div>

          {/* Tours Grid */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                Tìm thấy <span className="font-bold">{filteredTours.length}</span> tour
              </p>
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option>Phổ biến nhất</option>
                <option>Giá thấp nhất</option>
                <option>Giá cao nhất</option>
                <option>Đánh giá cao nhất</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTours.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>

            {filteredTours.length === 0 && (
              <div className="text-center py-20">
                <p className="text-xl text-gray-500">
                  Không tìm thấy tour phù hợp. Hãy thử điều chỉnh bộ lọc!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}