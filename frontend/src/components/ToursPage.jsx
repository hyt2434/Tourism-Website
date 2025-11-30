import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import TourCard from "./TourCard";
import FilterSidebar from "./FilterSidebar";
import { useLanguage } from "../context/LanguageContext";
import { getPublishedTours } from "../api/tours";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { ArrowUpDown, Grid, List, MapPin, Star, Sun, Tag } from "lucide-react";

export default function ToursPage() {
  const { translations } = useLanguage();
  const [searchParams] = useSearchParams();

  const [allTours, setAllTours] = useState([]);
  const [filteredTours, setFilteredTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("rating-desc");
  const [viewMode, setViewMode] = useState("grid");
  const [currentWeather] = useState("sunny");
  const [currentPage, setCurrentPage] = useState(1);
  const toursPerPage = 9;

  // Load tours from API with URL params
  useEffect(() => {
    loadTours();
  }, [searchParams]);

  const loadTours = async () => {
    try {
      setLoading(true);
      
      // Build filters from URL params
      const filters = {};
      const search = searchParams.get('search');
      const departureCityId = searchParams.get('departure_city_id');
      const destinationCityId = searchParams.get('destination_city_id');
      const minDuration = searchParams.get('min_duration');
      const maxDuration = searchParams.get('max_duration');
      const numberOfMembers = searchParams.get('number_of_members');

      if (search) filters.search = search;
      if (departureCityId) filters.departure_city_id = departureCityId;
      if (destinationCityId) filters.destination_city_id = destinationCityId;
      if (minDuration) filters.min_duration = parseInt(minDuration);
      if (maxDuration) filters.max_duration = parseInt(maxDuration);
      if (numberOfMembers) filters.number_of_members = parseInt(numberOfMembers);

      const tours = await getPublishedTours(filters);

      setAllTours(tours);
      setFilteredTours(tours);
    } catch (error) {
      console.error('Error loading tours:', error);
      setAllTours([]);
      setFilteredTours([]);
    } finally {
      setLoading(false);
    }
  };

  const applyClientSideFilters = (tours) => {
    // Apply any additional filters that might be in URL params
    // This is for filters that are handled client-side
    let result = [...tours];
    
    const search = searchParams.get('search');
    if (search) {
      result = result.filter((t) =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        (t.destination && t.destination.toLowerCase().includes(search.toLowerCase()))
      );
    }

    setFilteredTours(result);
    applySorting(result, sortBy);
  };

  const getInitialFiltersFromParams = () => {
    const filters = {};
    const search = searchParams.get('search');
    if (search) {
      filters.search = search;
    }
    return filters;
  };

  const handleFilterChange = (filters) => {
    let result = [...allTours];

    if (filters.search) {
      result = result.filter((t) =>
        t.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        (t.destination && t.destination.toLowerCase().includes(filters.search.toLowerCase()))
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
        t.type && t.type.some((type) => filters.tourTypes.includes(type))
      );
    }

    if (filters.startDate) {
      // Giả lập filter theo ngày
    }

    setFilteredTours(result);
    applySorting(result, sortBy);
    setCurrentPage(1); // Reset to first page when filters change
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

  // Pagination logic
  const indexOfLastTour = currentPage * toursPerPage;
  const indexOfFirstTour = indexOfLastTour - toursPerPage;
  const currentTours = filteredTours.slice(indexOfFirstTour, indexOfLastTour);
  const totalPages = Math.ceil(filteredTours.length / toursPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading tours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-gray-850 dark:to-gray-900 py-20 px-4 md:px-8 lg:px-36 border-b border-gray-200 dark:border-gray-700">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-gray-900 dark:text-white">
            {translations.exploreTours || "Khám Phá Tour Du Lịch"}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400">
            {allTours.length} {translations.toursWaiting || "trải nghiệm đặc biệt đang chờ bạn khám phá"}
          </p>
        </div>
      </div>

      {/* Main Search & Filter Section */}
      <div className="px-4 md:px-8 lg:px-36 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <FilterSidebar onFilterChange={handleFilterChange} initialFilters={getInitialFiltersFromParams()} />
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
                  className="px-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
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
              <>
                <div className={viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                  : "space-y-4"
                }>
                  {currentTours.map((tour) => (
                    <TourCard key={tour.id} tour={tour} viewMode={viewMode} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center items-center gap-2">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    
                    <div className="flex gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        // Show first page, last page, current page, and pages around current
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() => paginate(page)}
                              className={`px-4 py-2 rounded-lg border transition-colors ${
                                currentPage === page
                                  ? "bg-blue-600 text-white border-blue-600"
                                  : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                              }`}
                            >
                              {page}
                            </button>
                          );
                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                          return <span key={page} className="px-2 text-gray-500">...</span>;
                        }
                        return null;
                      })}
                    </div>

                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
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
    </div>
  );
}