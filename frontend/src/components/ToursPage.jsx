import { useState, useEffect } from "react";
import TourCard from "./TourCard";
import FilterSidebar from "./FilterSidebar";
import { useLanguage } from "../context/LanguageContext"; // 👈 thêm

export default function ToursPage() {
  const { translations } = useLanguage(); // 👈 lấy translations

  const [allTours, setAllTours] = useState([]);
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

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/tour/");
        
        if (!response.ok) {
          throw new Error(`HTTP Error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        setAllTours(data);
        setFilteredTours(data);
      } catch (error) {
        console.error("Fetching tour is not completed:", error);
      }
    };

    fetchTours();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-20">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {translations.discoverTours}
          </h1>
          <p className="text-xl text-blue-100">
            {translations.overTours.replace("{count}", allTours.length)}
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
              <p className="text-gray-600 dark:text-gray-300">
                {translations.foundTours.replace(
                  "{count}",
                  filteredTours.length
                )}
              </p>
              <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 transition-colors">
                <option>{translations.mostPopular}</option>
                <option>{translations.lowestPrice}</option>
                <option>{translations.highestPrice}</option>
                <option>{translations.highestRating}</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTours.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>

            {filteredTours.length === 0 && (
              <div className="text-center py-20">
                <p className="text-xl text-gray-500 dark:text-gray-400">
                  {translations.noTours}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
