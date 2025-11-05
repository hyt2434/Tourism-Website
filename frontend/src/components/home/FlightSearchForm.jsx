import React, { useState } from "react";
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
  Tag,
  Calendar as CalendarIcon,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

// Dữ liệu regions và cities
const regionsData = {
  northernVietnam: ["Hanoi (HAN)", "Hai Phong (HPH)", "Ha Long (VDO)"],
  centralVietnam: ["Da Nang (DAD)", "Hue (HUI)", "Quy Nhon (UIH)"],
  southernVietnam: [
    "Ho Chi Minh City (SGN)",
    "Can Tho (VCA)",
    "Phu Quoc (PQC)",
  ],
};

// Dữ liệu keywords
const keywordsData = [
  "beach",
  "moutain",
  "cul",
  "adventure",
  "fooftour",
  "history",
  "wildlife",
  "shopping",
  "nightlife",
  "relax",
  "photography",
  "luxury",
  "budget",
  "friendly",
];

export default function FlightSearchForm() {
  const [departureDate, setDepartureDate] = useState(new Date(2025, 9, 26));
  const [returnDate, setReturnDate] = useState(new Date(2025, 9, 28));
  const [tripType, setTripType] = useState("round-trip");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [fromLocation, setFromLocation] = useState("TP HCM (SGN)");
  const [toLocation, setToLocation] = useState("Bangkok (BKK)");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [openDeparture, setOpenDeparture] = useState(false);
  const [openReturn, setOpenReturn] = useState(false);
  const [openPassengers, setOpenPassengers] = useState(false);

  const { translations } = useLanguage();

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
  };

  const toggleKeyword = (keyword) => {
    setSelectedKeywords((prev) =>
      prev.includes(keyword)
        ? prev.filter((k) => k !== keyword)
        : [...prev, keyword]
    );
  };

  const handleCityClick = (city) => {
    setSelectedCity(city);
    // Có thể tự động điền vào To location
    setToLocation(city);
  };

  return (
    <div>
      {/* Thanh tìm kiếm */}
      <div className="relative mb-6">
        <div className="flex flex-col md:flex-row gap-2 md:gap-3 items-stretch md:items-center">
          <input
            type="text"
            placeholder={translations.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchOpen(true)}
            className="flex-1 px-4 md:px-6 py-3 md:py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-500/60 rounded-full border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-lg"
          />
          <button
            onClick={() => console.log("Search")}
            className="px-6 py-3 md:py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full hover:bg-blue-400 transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            <Search className="h-5 w-5" />
            <span>{translations.search}</span>
          </button>
        </div>

        {/* Panel bộ lọc khi searchOpen = true */}
        {searchOpen && (
          <div className="absolute top-full mt-4 left-0 right-0 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 z-50 border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setSearchOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-300" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Location - Regions & Cities */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {translations.location}
                  </h3>
                </div>

                <div className="space-y-3">
                  {Object.keys(regionsData).map((region) => (
                    <div key={region}>
                      <button
                        onClick={() =>
                          setSelectedRegion(
                            selectedRegion === region ? null : region
                          )
                        }
                        className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium text-gray-900 dark:text-white"
                      >
                        {translations[region]}
                      </button>

                      {selectedRegion === region && (
                        <div className="ml-4 mt-2 space-y-1">
                          {regionsData[region].map((city) => (
                            <button
                              key={city}
                              onClick={() => handleCityClick(city)}
                              className={`block w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${
                                selectedCity === city
                                  ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200"
                                  : "hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {city}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Keywords */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {translations.keywords}
                  </h3>
                </div>

                <div className="flex flex-wrap gap-2">
                  {keywordsData.map((keyword) => (
                    <button
                      key={keyword}
                      onClick={() => toggleKeyword(keyword)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedKeywords.includes(keyword)
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      {translations[keyword]}
                    </button>
                  ))}
                </div>

                {selectedKeywords.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-2">
                      Selected filters:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedKeywords.map((keyword) => (
                        <span
                          key={keyword}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-white dark:bg-gray-800 rounded text-xs text-gray-700 dark:text-gray-300"
                        >
                          {translations[keyword]}
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-red-500"
                            onClick={() => toggleKeyword(keyword)}
                          />
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() =>
                  console.log("Apply filters", {
                    selectedRegion,
                    selectedCity,
                    selectedKeywords,
                  })
                }
                className="px-8 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors font-semibold"
              >
                {translations.applyFilters}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Loại chuyến đi */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setTripType("round-trip")}
          className={`px-6 py-2 rounded-full text-sm font-medium ${
            tripType === "round-trip"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
          }`}
        >
          {translations.roundTrip}
        </button>

        <button
          onClick={() => setTripType("multi-city")}
          className={`px-6 py-2 rounded-full text-sm font-medium ${
            tripType === "multi-city"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
          }`}
        >
          {translations.multiCity}
        </button>
      </div>

      {/* Các trường nhập liệu */}
      <div className="flex grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
        {/* From */}
        <div className="lg:col-span-3">
          <label className="block text-xs text-gray-600 dark:text-gray-300 mb-2 font-medium">
            {translations.from}
          </label>
          <div className="relative">
            <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={fromLocation}
              onChange={(e) => setFromLocation(e.target.value)}
              className="w-full pl-10 h-12 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        {/* Swap button */}
        <div className="hidden lg:flex items-end justify-center pb-1">
          <button
            onClick={swapLocations}
            className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-gray-700 transition transform hover:rotate-180 duration-300"
          >
            <ArrowLeftRight className="w-5 h-5 text-blue-500" />
          </button>
        </div>

        {/* To */}
        <div className="lg:col-span-3">
          <label className="block text-xs text-gray-600 dark:text-gray-300 mb-2 font-medium">
            {translations.to}
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={toLocation}
              onChange={(e) => setToLocation(e.target.value)}
              className="w-full pl-10 h-12 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>
        {/* Departure date */}
        <div className="lg:col-span-2">
          <label className="block text-xs text-gray-600 dark:text-gray-300 mb-2 font-medium">
            {translations.departureDate}
          </label>
          <Popover open={openDeparture} onOpenChange={setOpenDeparture}>
            <PopoverTrigger asChild>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  readOnly
                  value={formatDate(departureDate)}
                  className={`w-full h-12 pl-10 rounded-lg cursor-pointer
            bg-white dark:bg-gray-800 text-gray-900 dark:text-white
            border ${
              openDeparture
                ? "ring-2 ring-blue-400 border-blue-400"
                : "border-gray-200 dark:border-gray-600"
            }
            focus:outline-none`}
                />
              </div>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600"
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
        <div className="lg:col-span-2">
          <label className="block text-xs text-gray-600 dark:text-gray-300 mb-2 font-medium">
            {translations.returnDate}
          </label>
          <Popover open={openReturn} onOpenChange={setOpenReturn}>
            <PopoverTrigger asChild>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  readOnly
                  value={formatDate(returnDate)}
                  className={`w-full h-12 pl-10 rounded-lg cursor-pointer
            bg-white dark:bg-gray-800 text-gray-900 dark:text-white
            border ${
              openReturn
                ? "ring-2 ring-blue-400 border-blue-400"
                : "border-gray-200 dark:border-gray-600"
            }
            focus:outline-none`}
                />
              </div>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600"
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
        <div className="lg:col-span-1">
          <label className="block text-xs text-gray-600 dark:text-gray-300 mb-2 font-medium">
            {translations.passengers}
          </label>
          <Popover open={openPassengers} onOpenChange={setOpenPassengers}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`w-full justify-start h-12 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg
                  border ${
                    openPassengers
                      ? "ring-2 ring-blue-400 border-blue-400"
                      : "border-gray-200 dark:border-gray-600"
                  }`}
              >
                <Users className="mr-1 h-4 w-4" />
                <span className="text-sm">
                  {adults},{children},{infants}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600">
              <div className="space-y-4">
                <PassengerControl
                  label={translations.adults}
                  value={adults}
                  onDecrease={() => setAdults(Math.max(1, adults - 1))}
                  onIncrease={() => setAdults(adults + 1)}
                />
                <PassengerControl
                  label={translations.children}
                  value={children}
                  onDecrease={() => setChildren(Math.max(0, children - 1))}
                  onIncrease={() => setChildren(children + 1)}
                />
                <PassengerControl
                  label={translations.infants}
                  value={infants}
                  onDecrease={() => setInfants(Math.max(0, infants - 1))}
                  onIncrease={() => setInfants(infants + 1)}
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}

// PassengerControl component
function PassengerControl({ label, value, onDecrease, onIncrease }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-900 dark:text-white">
        {label}
      </span>
      <div className="flex items-center gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDecrease();
          }}
          className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600 
                     hover:border-blue-500 hover:text-blue-500 transition"
        >
          -
        </button>
        <span className="w-6 text-center font-medium text-gray-900 dark:text-white">
          {value}
        </span>
        <button
          onClick={(e) => {
            console.log("increase");
            e.stopPropagation();
            onIncrease();
          }}
          className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600 
                     hover:border-blue-500 hover:text-blue-500 transition"
        >
          +
        </button>
      </div>
    </div>
  );
}
