import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
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
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [allTours, setAllTours] = useState([]);
  const [filteredTours, setFilteredTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("rating-desc");
  const [viewMode, setViewMode] = useState("grid");
  const [currentWeather] = useState("sunny");
  const [currentPage, setCurrentPage] = useState(1);
  const toursPerPage = 9;
  const [activeFilters, setActiveFilters] = useState({}); // Store active filters to re-apply after API reload

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
      
      // After API reload, re-apply client-side filters if any are active
      if (Object.keys(activeFilters).length > 0) {
        const filtered = applyFiltersToTours(tours, activeFilters);
        setFilteredTours(filtered);
        applySorting(filtered, sortBy);
      } else {
        setFilteredTours(tours);
      }
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

  // Helper function to apply filters to tours
  const applyFiltersToTours = (tours, filters) => {
    let result = [...tours];
    console.log('applyFiltersToTours - input:', tours.length, 'tours, filters:', filters);
    
    // City filter (provinces contains city IDs)
    if (filters.provinces && filters.provinces.length > 0) {
      const cityIds = filters.provinces.map(id => parseInt(id));
      console.log('Filtering by cities:', cityIds);
      const beforeCount = result.length;
      result = result.filter((t) => {
        const destCityId = t.destination_city?.id;
        const depCityId = t.departure_city?.id;
        const matches = cityIds.includes(destCityId) || cityIds.includes(depCityId);
        if (!matches) {
          console.log('Tour', t.id, 'does not match cities. dest:', destCityId, 'dep:', depCityId);
        }
        return matches;
      });
      console.log('City filter:', beforeCount, '->', result.length);
    }

    // Price filter
    if (filters.minPrice !== undefined && filters.minPrice > 0) {
      const beforeCount = result.length;
      result = result.filter((t) => {
        const tourPrice = t.price_per_person || t.price || 0;
        return tourPrice >= filters.minPrice;
      });
      console.log('Min price filter:', beforeCount, '->', result.length);
    }
    if (filters.maxPrice !== undefined && filters.maxPrice < 10000000) {
      const beforeCount = result.length;
      result = result.filter((t) => {
        const tourPrice = t.price_per_person || t.price || 0;
        return tourPrice <= filters.maxPrice;
      });
      console.log('Max price filter:', beforeCount, '->', result.length, 'maxPrice:', filters.maxPrice);
    }

    // Rating filter
    if (filters.minRating !== undefined && filters.minRating > 0) {
      const beforeCount = result.length;
      result = result.filter((t) => {
        const tourRating = t.rating || 0;
        return tourRating >= filters.minRating;
      });
      console.log('Rating filter:', beforeCount, '->', result.length, 'minRating:', filters.minRating);
    }

    // Tour types filter
    if (filters.tourTypes && filters.tourTypes.length > 0) {
      const beforeCount = result.length;
      result = result.filter((t) =>
        t.type && t.type.some((type) => filters.tourTypes.includes(type))
      );
      console.log('Tour types filter:', beforeCount, '->', result.length);
    }

    console.log('applyFiltersToTours - output:', result.length, 'tours');
    return result;
  };

  const handleFilterChange = (filters) => {
    console.log('handleFilterChange called with:', filters);
    console.log('allTours length:', allTours.length);
    
    // Store active filters (excluding search, as that's handled by API)
    // Only store filters that are actually set (not default/empty values)
    const clientSideFilters = {};
    if (filters.provinces && filters.provinces.length > 0) {
      clientSideFilters.provinces = filters.provinces;
    }
    if (filters.minPrice !== undefined && filters.minPrice > 0) {
      clientSideFilters.minPrice = filters.minPrice;
    }
    if (filters.maxPrice !== undefined && filters.maxPrice < 10000000) {
      clientSideFilters.maxPrice = filters.maxPrice;
    }
    if (filters.minRating !== undefined && filters.minRating > 0) {
      clientSideFilters.minRating = filters.minRating;
    }
    if (filters.tourTypes && filters.tourTypes.length > 0) {
      clientSideFilters.tourTypes = filters.tourTypes;
    }
    
    console.log('Stored active filters:', clientSideFilters);
    setActiveFilters(clientSideFilters);
    
    // Handle search filter separately - update URL if search is provided
    const hasSearch = filters.search !== undefined && filters.search && filters.search.trim();
    if (hasSearch) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('search', filters.search.trim());
      setSearchParams(newParams);
      
      // If search is the ONLY filter, return early to let API reload handle it
      const hasOtherFilters = (clientSideFilters.provinces && clientSideFilters.provinces.length > 0) ||
                              (clientSideFilters.minPrice !== undefined && clientSideFilters.minPrice > 0) ||
                              (clientSideFilters.maxPrice !== undefined && clientSideFilters.maxPrice < 10000000) ||
                              (clientSideFilters.minRating !== undefined && clientSideFilters.minRating > 0) ||
                              (clientSideFilters.tourTypes && clientSideFilters.tourTypes.length > 0);
      
      if (!hasOtherFilters) {
        setActiveFilters({}); // Clear filters if only search
        return; // loadTours will be called by useEffect when searchParams changes
      }
      // If there are other filters, API will reload and then we'll apply filters in loadTours
      return;
    }

    // For other filters (no search or empty search), do client-side filtering immediately
    if (allTours.length === 0) {
      console.warn('No tours to filter!');
      return;
    }
    
    // Check if there are any active filters
    const hasActiveFilters = Object.keys(clientSideFilters).length > 0;
    console.log('Has active filters?', hasActiveFilters, clientSideFilters);
    
    if (hasActiveFilters) {
      let result = applyFiltersToTours(allTours, clientSideFilters);
      console.log('After filtering:', result.length, 'tours out of', allTours.length);
      setFilteredTours(result);
      applySorting(result, sortBy);
    } else {
      // No filters, show all tours
      console.log('No active filters, showing all tours');
      setFilteredTours(allTours);
      applySorting(allTours, sortBy);
    }
    
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