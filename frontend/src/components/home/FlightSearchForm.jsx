import React, { useState } from "react";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

import {
  Hotel,
  Plane,
  Bus,
  Car,
  CarFront,
  PartyPopper,
  MoreHorizontal,
  MapPin,
  Calendar as CalIcon,
  Users,
  Search,
  ArrowLeftRight,
} from "lucide-react";
import { Calendar as CalendarIcon, X, Tag } from "lucide-react";

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

  const regions = {
    Northern: ["Hanoi", "Ha Long Bay", "Sapa", "Ninh Binh", "Mai Chau"],
    Central: ["Da Nang", "Hoi An", "Hue", "Phong Nha", "Quy Nhon"],
    Southern: [
      "Ho Chi Minh",
      "Phu Quoc",
      "Mekong Delta",
      "Vung Tau",
      "Can Tho",
    ],
  };

  const keywords = [
    "Beach",
    "Mountain",
    "Culture",
    "Adventure",
    "Food Tour",
    "History",
    "Wildlife",
    "Shopping",
    "Nightlife",
    "Relaxation",
    "Photography",
    "Luxury",
    "Budget-Friendly",
    "Family-Friendly",
  ];

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

  const handleSearch = () => {
    console.log("Searching flights with filters...", {
      from: fromLocation,
      to: toLocation,
      departureDate,
      returnDate,
      passengers: { adults, children, infants },
      searchQuery,
      region: selectedRegion,
      city: selectedCity,
      keywords: selectedKeywords,
    });
    setSearchOpen(false);
  };

  return (
    <div className="bg-white/75 backdrop-md rounded-2xl p-4 md:p-6 shadow-2xl max-w-6xl mx-auto">
      {/* Search Bar with Filter */}
      <div className="relative mb-6">
        <div className="bg-white/90 backdrop-md border-2 border-gray-200 hover:border-blue-400 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 p-2 md:p-3 flex flex-col md:flex-row gap-2 md:gap-0">
          <input
            type="text"
            placeholder="Search tours, destination"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchOpen(true)}
            className="flex-1 px-4 md:px-6 py-2 md:py-3 bg-transparent text-gray-900 placeholder:text-gray-500/60 focus:outline-none border-0 outline-none ring-0 focus:ring-0 min-w-[250px] md:min-w-[400px] text-base font-medium"
          />
          <button
            onClick={handleSearch}
             className="px-6 py-2 md:py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full hover:bg-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 flex items-center justify-center gap-2 transform hover:scale-105"
          >
            <Search className="h-5 w-5" />
            <span>Search</span>
          </button>
        </div>

        {/* Search Dropdown Panel */}
        {searchOpen && (
          <div className="absolute top-full mt-4 left-0 right-0 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 animate-fadeIn min-h-[400px] z-50">
            <button
              onClick={() => {
                setSearchOpen(false);
                setSelectedRegion(null);
                setSelectedCity(null);
              }}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close search"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Location Filter */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-bold text-gray-900">Location</h3>
                </div>

                {!selectedRegion ? (
                  <div className="space-y-2">
                    {Object.keys(regions).map((region) => (
                      <button
                        key={region}
                        onClick={() => {
                          setSelectedRegion(
                            selectedRegion === region ? null : region
                          );
                          setSelectedCity(null);
                        }}
                        className="w-full text-left px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-900 group-hover:text-blue-600">
                            {region}
                          </span>
                          <span className="text-sm text-gray-600">
                            {regions[region].length} cities
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div>
                    <button
                      onClick={() => setSelectedRegion(null)}
                      className="text-sm text-blue-600 hover:text-blue-700 mb-3 flex items-center gap-1"
                    >
                      ← Back to regions
                    </button>
                    <div className="space-y-2">
                      {regions[selectedRegion].map((city) => {
                        const isSelected = selectedCity === city;
                        return (
                          <button
                            key={city}
                            onClick={() =>
                              setSelectedCity(
                                selectedCity === city ? null : city
                              )
                            }
                            className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                              isSelected
                                ? "border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-500/50"
                                : "border-gray-200 hover:border-blue-500 hover:bg-blue-50"
                            }`}
                          >
                            <span
                              className={`font-medium ${
                                isSelected
                                  ? "text-white"
                                  : "text-gray-900 hover:text-blue-600"
                              }`}
                            >
                              {city}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Keywords Filter */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-bold text-gray-900">Keywords</h3>
                </div>

                <div className="flex flex-wrap gap-2">
                  {keywords.map((keyword) => {
                    const isSelected = selectedKeywords.includes(keyword);
                    return (
                      <button
                        key={keyword}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedKeywords(
                              selectedKeywords.filter((k) => k !== keyword)
                            );
                          } else {
                            setSelectedKeywords([...selectedKeywords, keyword]);
                          }
                        }}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          isSelected
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-500/50 scale-105"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
                        }`}
                      >
                        {keyword}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  handleSearch();
                }}
                className="px-8 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors font-semibold"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Trip type selector */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setTripType("round-trip")}
          className={`px-6 py-2 rounded-full text-sm font-medium transition ${
            tripType === "round-trip"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          One-way / Round-trip
        </button>
        <button
          onClick={() => setTripType("multi-city")}
          className={`px-6 py-2 rounded-full text-sm font-medium transition ${
            tripType === "multi-city"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Multi-city
        </button>
      </div>

      {/* Flight Search Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
        {/* From */}
        <div className="lg:col-span-3">
          <label className="block text-xs text-gray-600 mb-2 font-medium">
            From
          </label>
          <div className="relative">
            <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={fromLocation}
              onChange={(e) => setFromLocation(e.target.value)}
              className="w-full pl-10 h-12 border-gray-200 focus:border-blue-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        {/* Swap button */}
        <div className="hidden lg:flex items-end justify-center pb-1">
          <button
            onClick={swapLocations}
            className="p-2 rounded-full hover:bg-blue-50 transition transform hover:rotate-180 duration-300"
          >
            <ArrowLeftRight className="w-5 h-5 text-blue-500" />
          </button>
        </div>

        {/* To */}
        <div className="lg:col-span-3">
          <label className="block text-xs text-gray-600 mb-2 font-medium">
            To
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={toLocation}
              onChange={(e) => setToLocation(e.target.value)}
              className="w-full pl-10 h-12 border-gray-200 focus:border-blue-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        {/* Departure date */}
        <div className="lg:col-span-2">
          <label className="block text-xs text-gray-600 mb-2 font-medium">
            Departure Date
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start h-12 border-2 border-gray-200 focus:border-blue-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formatDate(departureDate)}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={departureDate}
                onSelect={(date) => date && setDepartureDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Return date */}
        <div className="lg:col-span-2">
          <label className="block text-xs text-gray-600 mb-2 font-medium">
            Return Date
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start h-12 border-2 border-gray-200 hover:border-blue-500 rounded-lg"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formatDate(returnDate)}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={returnDate}
                onSelect={(date) => date && setReturnDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Passengers */}
        <div className="lg:col-span-1">
          <label className="block text-xs text-gray-600 mb-2 font-medium">
            Passengers
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start h-12 border-2 border-gray-200 hover:border-blue-500 rounded-lg"
              >
                <Users className="mr-1 h-4 w-4" />
                <span className="text-sm">
                  {adults},{children},{infants}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4">
              <div className="space-y-4">
                <PassengerControl
                  label="Adults"
                  value={adults}
                  onDecrease={() => setAdults(Math.max(1, adults - 1))}
                  onIncrease={() => setAdults(adults + 1)}
                />
                <PassengerControl
                  label="Children"
                  value={children}
                  onDecrease={() => setChildren(Math.max(0, children - 1))}
                  onIncrease={() => setChildren(children + 1)}
                />
                <PassengerControl
                  label="Infants"
                  value={infants}
                  onDecrease={() => setInfants(Math.max(0, infants - 1))}
                  onIncrease={() => setInfants(infants + 1)}
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

function PassengerControl({ label, value, onDecrease, onIncrease }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDecrease();
          }}
          className="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-blue-500 hover:text-blue-500 transition"
        >
          -
        </button>
        <span className="w-6 text-center font-medium">{value}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onIncrease();
          }}
          className="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-blue-500 hover:text-blue-500 transition"
        >
          +
        </button>
      </div>
    </div>
  );
}
