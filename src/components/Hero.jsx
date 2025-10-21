import { Search } from "lucide-react";

export function Hero({ heroImage }) {
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
  );
}
