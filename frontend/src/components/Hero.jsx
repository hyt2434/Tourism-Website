<<<<<<< HEAD
import { Search } from "lucide-react";

export default function Hero({ heroImage }) {
  return (
    <div className="relative w-full h-[720px] overflow-hidden">
      {/* Background Image */}
      <img
        src={heroImage}
        alt="Vietnam landscape"
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-15"></div>

      {/* Content */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-4 h-full flex flex-col items-center justify-center">
        <h1 className="text-center text-white mb-8 max-w-[1408px] tracking-tight leading-tight">
          Discover the Magic of VietNam
        </h1>
        
        <p className="text-center text-white text-opacity-90 max-w-[1027px] mb-12">
          Explore authentic experiences, from stunning landscapes to vibrant culture and cuisine.
        </p>

        {/* Search Box */}
        <div className="flex items-center gap-4 mt-8">
          <div className="w-[368px] h-[69px] bg-teal-50 border border-black rounded-lg shadow-md flex items-center justify-center">
            <input 
              type="text"
              placeholder="Search tours, destination"
              className="bg-transparent text-center text-gray-600 outline-none w-full px-4 placeholder:text-gray-500"
            />
          </div>
          
          <div className="w-[193px] h-[69px] bg-teal-50 border border-black rounded-lg shadow-md flex items-center justify-center">
            <select className="bg-transparent text-gray-600 outline-none cursor-pointer">
              <option>All Provinces</option>
              <option>Hanoi</option>
              <option>Ho Chi Minh</option>
              <option>Da Nang</option>
              <option>Hoi An</option>
            </select>
          </div>
          
          <button className="px-6 py-3.5 bg-black bg-opacity-60 hover:bg-opacity-80 text-white rounded-lg shadow-sm flex items-center gap-2 transition-all">
            <Search className="w-5 h-5" />
            Search
          </button>
        </div>
      </div>
    </div>
=======
import React, { useState } from 'react';
import { MagnifyingGlassIcon, MapPinIcon, TagIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function Hero() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedKeywords, setSelectedKeywords] = useState([]);

  const regions = {
    Northern: ['Hanoi', 'Ha Long Bay', 'Sapa', 'Ninh Binh', 'Mai Chau'],
    Central: ['Da Nang', 'Hoi An', 'Hue', 'Phong Nha', 'Quy Nhon'],
    Southern: ['Ho Chi Minh', 'Phu Quoc', 'Mekong Delta', 'Vung Tau', 'Can Tho'],
  };

  const keywords = [
    'Beach', 'Mountain', 'Culture', 'Adventure', 'Food Tour',
    'History', 'Wildlife', 'Shopping', 'Nightlife', 'Relaxation',
    'Photography', 'Luxury', 'Budget-Friendly', 'Family-Friendly'
  ];

  const handleRegionClick = (region) => {
    setSelectedRegion(selectedRegion === region ? null : region);
    setSelectedCity(null); // Reset city when changing region
  };

  const handleCityClick = (city) => {
    setSelectedCity(selectedCity === city ? null : city);
  };

  const handleKeywordToggle = (keyword) => {
    if (selectedKeywords.includes(keyword)) {
      setSelectedKeywords(selectedKeywords.filter(k => k !== keyword));
    } else {
      setSelectedKeywords([...selectedKeywords, keyword]);
    }
  };

  const handleSearchFocus = () => {
    setSearchOpen(true);
  };

  const handleClose = () => {
    setSearchOpen(false);
    setSelectedRegion(null);
    setSelectedCity(null);
  };
  return (
    <section className="relative">
      <div className="container mx-auto px-4 md:px-8 py-12">
        {/* Headline and Subtext */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-title leading-tight mb-4">
            Discover the Magic of VietNam
          </h1>
          <p className="text-base md:text-lg text-body max-w-[70ch] mx-auto">
            Explore authentic experiences, from stunning landscapes to vibrant culture and cuisine.
          </p>
        </div>

        {/* Hero Image with Search Overlay */}
        <div className="relative">
          <div className="w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-3xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1600&h=900&fit=crop&q=80"
              alt="Tropical beach with palm trees"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Search Box Overlay */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] md:w-auto z-10">
            <div className="bg-white/90 backdrop-blur-sm rounded-full shadow-lg p-2 md:p-3 flex flex-col md:flex-row gap-2 md:gap-0">
              <input
                type="text"
                placeholder="Search tours, destination"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={handleSearchFocus}
                className="flex-1 px-4 md:px-6 py-2 md:py-3 bg-transparent text-title placeholder:text-body/60 focus:outline-none min-w-[250px] md:min-w-[400px]"
              />
              <button className="px-6 py-2 md:py-3 bg-black text-white rounded-full hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-black/20 flex items-center justify-center gap-2">
                <MagnifyingGlassIcon className="h-5 w-5" />
                <span>Search</span>
              </button>
            </div>

            {/* Search Dropdown Panel */}
            {searchOpen && (
              <div className="absolute top-full mt-4 left-0 right-0 bg-white rounded-2xl shadow-2xl p-6 animate-fadeIn min-h-[500px]">
                {/* Close Button */}
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Close search"
                >
                  <XMarkIcon className="h-5 w-5 text-gray-500" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column - Location */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <MapPinIcon className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-bold text-title">Location</h3>
                    </div>

                    {!selectedRegion ? (
                      // Show Regions
                      <div className="space-y-2">
                        {Object.keys(regions).map((region) => (
                          <button
                            key={region}
                            onClick={() => handleRegionClick(region)}
                            className="w-full text-left px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-title group-hover:text-blue-600">
                                {region}
                              </span>
                              <span className="text-sm text-body">
                                {regions[region].length} cities
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      // Show Cities
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
                                onClick={() => handleCityClick(city)}
                                className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                                  isSelected
                                    ? 'border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                                    : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'
                                }`}
                              >
                                <span className={`font-medium ${isSelected ? 'text-white' : 'text-title hover:text-blue-600'}`}>
                                  {city}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column - Keywords */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <TagIcon className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-bold text-title">Keywords</h3>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {keywords.map((keyword) => {
                        const isSelected = selectedKeywords.includes(keyword);
                        return (
                          <button
                            key={keyword}
                            onClick={() => handleKeywordToggle(keyword)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                              isSelected
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50 scale-105'
                                : 'bg-gray-100 text-body hover:bg-gray-200 hover:shadow-md'
                            }`}
                          >
                            {keyword}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Search Action Button */}
                <div className="mt-6 flex justify-end">
                  <button className="px-8 py-3 bg-black text-white rounded-full hover:opacity-90 transition-opacity font-semibold">
                    Apply Filters
                  </button>
                </div>
              </div>
            )}
          </div>
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
    </section>
>>>>>>> 6ca89267b552b0f66325b4e3d2aa37b9e6f89916
  );
}
