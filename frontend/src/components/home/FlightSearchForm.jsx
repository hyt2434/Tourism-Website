import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Plane,
  MapPin,
  Users,
  Search,
  ArrowLeftRight,
  X,
  Calendar as CalendarIcon,
  ChevronDown,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { getCities } from "../../api/cities";


export default function FlightSearchForm() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const [departureDate, setDepartureDate] = useState(today);
  const [returnDate, setReturnDate] = useState(tomorrow);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [fromLocation, setFromLocation] = useState(null);
  const [toLocation, setToLocation] = useState(null);
  const [cities, setCities] = useState([]);
  const [fromDropdownOpen, setFromDropdownOpen] = useState(false);
  const [toDropdownOpen, setToDropdownOpen] = useState(false);
  const [fromSearchQuery, setFromSearchQuery] = useState("");
  const [toSearchQuery, setToSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDeparture, setOpenDeparture] = useState(false);
  const [openReturn, setOpenReturn] = useState(false);
  const [openPassengers, setOpenPassengers] = useState(false);

  const { translations } = useLanguage();
  const navigate = useNavigate();

  // Load cities from API
  useEffect(() => {
    const loadCities = async () => {
      const citiesData = await getCities();
      setCities(citiesData);
    };
    loadCities();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.from-dropdown-container')) {
        setFromDropdownOpen(false);
      }
      if (!event.target.closest('.to-dropdown-container')) {
        setToDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const swapLocations = () => {
    const temp = fromLocation;
    setFromLocation(toLocation);
    setToLocation(temp);
    const tempQuery = fromSearchQuery;
    setFromSearchQuery(toSearchQuery);
    setToSearchQuery(tempQuery);
  };

  // Filter cities based on search query
  const getFilteredCities = (query) => {
    if (!query) return cities;
    const lowerQuery = query.toLowerCase();
    return cities.filter(
      (city) =>
        city.name.toLowerCase().includes(lowerQuery) ||
        (city.code && city.code.toLowerCase().includes(lowerQuery))
    );
  };

  const formatCityName = (city) => {
    if (!city) return "";
    return city.code ? `${city.name} (${city.code})` : city.name;
  };

  // Calculate duration in days between two dates
  const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return null;
    const timeDiff = endDate.getTime() - startDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    return daysDiff > 0 ? daysDiff : null;
  };

  // Handle search - either keyword search or location/date search
  const handleSearch = (e) => {
    e?.preventDefault();
    
    // Scenario 1: Keyword search
    if (searchQuery && searchQuery.trim()) {
      const params = new URLSearchParams({
        search: searchQuery.trim()
      });
      navigate(`/tour?${params.toString()}`);
      return;
    }

    // Scenario 2: Location/Date search
    if (fromLocation && toLocation && departureDate && returnDate) {
      const duration = calculateDuration(departureDate, returnDate);
      const totalMembers = adults + children + infants;
      
      const params = new URLSearchParams({
        departure_city_id: fromLocation.id.toString(),
        destination_city_id: toLocation.id.toString(),
      });

      if (duration) {
        params.append('min_duration', duration.toString());
        params.append('max_duration', duration.toString());
      }

      if (totalMembers > 0) {
        params.append('number_of_members', totalMembers.toString());
      }

      navigate(`/tour?${params.toString()}`);
      return;
    }

    // If neither condition is met, just navigate to tour page
    navigate('/tours');
  };


  return (
    <div>
      {/* Thanh tìm kiếm */}
      <div className="relative mb-6">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2 md:gap-3 items-stretch md:items-center">
          <input
            type="text"
            placeholder={translations.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchOpen(true)}
            className="flex-1 px-4 md:px-6 py-3 md:py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-500/60 rounded-full border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-lg"
          />
          <button
            onClick={handleSearch}
            className="px-6 py-3 md:py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full hover:bg-blue-400 transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            <Search className="h-5 w-5" />
            <span>{translations.search}</span>
          </button>
        </form>

        {/* Modal with form fields */}
        {searchOpen && (
          <div className="absolute top-full mt-4 left-1/2 -translate-x-1/2 w-full max-w-6xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 z-50 border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setSearchOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-300" />
            </button>

            <div className="flex flex-col items-center justify-center w-full">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                {translations.searchTour || "Search Tour"}
              </h3>

              {/* Form fields */}
              <div className="flex flex-wrap justify-center items-end gap-4 w-full">
              {/* From */}
              <div className="flex-shrink-0 from-dropdown-container" style={{ minWidth: '180px', maxWidth: '200px' }}>
                <label className="block text-xs text-gray-700 dark:text-gray-300 mb-2 font-medium whitespace-nowrap">
                  {translations.from}
                </label>
          <div className="relative">
            <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
            <div className="relative">
              <input
                type="text"
                value={fromSearchQuery || formatCityName(fromLocation) || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setFromSearchQuery(value);
                  if (!value) {
                    setFromLocation(null);
                  }
                  setFromDropdownOpen(true);
                }}
                onFocus={() => setFromDropdownOpen(true)}
                placeholder={translations.from || "From"}
                className="w-full pl-10 pr-10 h-12 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
            {fromDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg shadow-xl max-h-60 overflow-y-auto z-50">
                {getFilteredCities(fromSearchQuery).length > 0 ? (
                  getFilteredCities(fromSearchQuery).map((city) => (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => {
                        setFromLocation(city);
                        setFromSearchQuery("");
                        setFromDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900 dark:text-white">
                        {city.name}
                      </div>
                      {city.code && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {city.code}
                        </div>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-gray-500 dark:text-gray-400 text-sm">
                    No cities found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

              {/* Swap button */}
              <div className="hidden lg:flex items-center justify-center pb-2">
                <button
                  type="button"
                  onClick={swapLocations}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition transform hover:rotate-180 duration-300"
                >
                  <ArrowLeftRight className="w-5 h-5 text-gray-600 dark:text-blue-400" />
                </button>
              </div>

              {/* To */}
              <div className="flex-shrink-0 to-dropdown-container" style={{ minWidth: '180px', maxWidth: '200px' }}>
                <label className="block text-xs text-gray-700 dark:text-gray-300 mb-2 font-medium whitespace-nowrap">
                  {translations.to}
                </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
            <div className="relative">
              <input
                type="text"
                value={toSearchQuery || formatCityName(toLocation) || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setToSearchQuery(value);
                  if (!value) {
                    setToLocation(null);
                  }
                  setToDropdownOpen(true);
                }}
                onFocus={() => setToDropdownOpen(true)}
                placeholder={translations.to || "To"}
                className="w-full pl-10 pr-10 h-12 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
            {toDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg shadow-xl max-h-60 overflow-y-auto z-50">
                {getFilteredCities(toSearchQuery).length > 0 ? (
                  getFilteredCities(toSearchQuery).map((city) => (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => {
                        setToLocation(city);
                        setToSearchQuery("");
                        setToDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900 dark:text-white">
                        {city.name}
                      </div>
                      {city.code && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {city.code}
                        </div>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-gray-500 dark:text-gray-400 text-sm">
                    No cities found
                  </div>
                )}
              </div>
                )}
              </div>
            </div>
              {/* Departure date */}
              <div className="flex-shrink-0" style={{ minWidth: '160px', maxWidth: '180px' }}>
                <label className="block text-xs text-gray-700 dark:text-gray-300 mb-2 font-medium whitespace-nowrap">
                  {translations.departureDate}
                </label>
          <Popover open={openDeparture} onOpenChange={setOpenDeparture}>
            <PopoverTrigger asChild>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  readOnly
                  value={formatDate(departureDate)}
                  className={`w-full h-12 pl-10 rounded-lg cursor-pointer font-medium
            bg-white dark:bg-gray-800 text-gray-900 dark:text-white
            border-2 ${
              openDeparture
                ? "ring-2 ring-blue-500 border-blue-500"
                : "border-gray-300 dark:border-gray-600"
            }
            focus:outline-none`}
                />
              </div>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-500"
              align="start"
            >
              <Calendar
                mode="single"
                selected={departureDate}
                onSelect={(date) => {
                  if (date) {
                    setDepartureDate(date);
                    setOpenDeparture(false); // đóng popover => tắt viền xanh
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

              {/* Return date */}
              <div className="flex-shrink-0" style={{ minWidth: '160px', maxWidth: '180px' }}>
                <label className="block text-xs text-gray-700 dark:text-gray-300 mb-2 font-medium whitespace-nowrap">
                  {translations.returnDate}
                </label>
          <Popover open={openReturn} onOpenChange={setOpenReturn}>
            <PopoverTrigger asChild>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  readOnly
                  value={formatDate(returnDate)}
                  className={`w-full h-12 pl-10 rounded-lg cursor-pointer font-medium
            bg-white dark:bg-gray-800 text-gray-900 dark:text-white
            border-2 ${
              openReturn
                ? "ring-2 ring-blue-500 border-blue-500"
                : "border-gray-300 dark:border-gray-600"
            }
            focus:outline-none`}
                />
              </div>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-500"
              align="start"
            >
              <Calendar
                mode="single"
                selected={returnDate}
                onSelect={(date) => {
                  if (date) {
                    setReturnDate(date);
                    setOpenReturn(false); // đóng popover => tắt viền xanh
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

              {/* Passengers */}
              <div className="flex-shrink-0" style={{ minWidth: '160px', maxWidth: '200px' }}>
                <label className="block text-xs text-gray-700 dark:text-gray-300 mb-2 font-medium whitespace-nowrap">
                  {translations.passengers}
                </label>
                <div className="w-full h-12 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-300 dark:border-gray-600 flex items-center justify-between px-4 hover:border-blue-500 transition-colors">
                  <Users className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        const total = adults + children + infants;
                        if (total > 1) {
                          if (infants > 0) setInfants(infants - 1);
                          else if (children > 0) setChildren(children - 1);
                          else if (adults > 1) setAdults(adults - 1);
                        }
                      }}
                      className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                                 hover:bg-blue-500 hover:border-blue-500 hover:text-white dark:hover:bg-blue-600
                                 transition-all flex items-center justify-center font-bold text-gray-700 dark:text-white text-sm
                                 active:scale-95"
                    >
                      −
                    </button>
                    <span className="text-sm font-medium text-gray-900 dark:text-white min-w-[20px] text-center">
                      {adults + children + infants}
                    </span>
                    <button
                      type="button"
                      onClick={() => setAdults(adults + 1)}
                      className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                                 hover:bg-blue-500 hover:border-blue-500 hover:text-white dark:hover:bg-blue-600
                                 transition-all flex items-center justify-center font-bold text-gray-700 dark:text-white text-sm
                                 active:scale-95"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// PassengerControl component
function PassengerControl({ label, value, onDecrease, onIncrease }) {
  const handleDecrease = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDecrease();
  };

  const handleIncrease = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onIncrease();
  };

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-900 dark:text-white">
        {label}
      </span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleDecrease}
          onMouseDown={(e) => e.stopPropagation()}
          className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600 
                     hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20
                     transition-all flex items-center justify-center font-bold text-gray-700 dark:text-gray-200"
        >
          −
        </button>
        <span className="w-8 text-center font-medium text-gray-900 dark:text-white">
          {value}
        </span>
        <button
          type="button"
          onClick={handleIncrease}
          onMouseDown={(e) => e.stopPropagation()}
          className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600 
                     hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20
                     transition-all flex items-center justify-center font-bold text-gray-700 dark:text-gray-200"
        >
          +
        </button>
      </div>
    </div>
  );
}
