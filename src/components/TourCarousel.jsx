import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function TourCarousel({ tours }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const toursPerPage = 3;
  const maxIndex = Math.max(0, tours.length - toursPerPage);

  const next = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const prev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const visibleTours = tours.slice(currentIndex, currentIndex + toursPerPage);

  return (
    <section className="max-w-[1440px] mx-auto px-20 py-20">
      <div className="mb-8">
        <h2 className="text-black mb-4 tracking-tight">Popular Tours</h2>
        <div className="flex items-center gap-4">
          <span className="text-black">Popular:</span>
          <button className="px-4 py-2 bg-transparent border border-black rounded-lg hover:bg-black hover:text-white transition-colors">
            Ha Long Bay tour
          </button>
          <button className="px-4 py-2 bg-transparent border border-black rounded-lg hover:bg-black hover:text-white transition-colors">
            Da Nang tour
          </button>
          <button className="px-4 py-2 bg-transparent border border-black rounded-lg hover:bg-black hover:text-white transition-colors">
            Hoi An tour
          </button>
        </div>
      </div>

      <div className="relative">
        {/* Carousel Container */}
        <div className="overflow-hidden">
          <div 
            className="flex gap-6 transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * (100 / toursPerPage)}%)` }}
          >
            {tours.map((tour) => (
              <div key={tour.id} className="min-w-[calc(33.333%-16px)] flex-shrink-0">
                <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <img
                    src={tour.image}
                    alt={tour.name}
                    className="w-full h-[280px] object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-black mb-2">{tour.name}</h3>
                    <p className="text-gray-500 mb-4">{tour.description}</p>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-gray-500">Duration: </span>
                        <span className="text-black">{tour.duration}</span>
                      </div>
                      <div className="text-black">{tour.price}</div>
                    </div>
                    <button className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition-colors">
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={prev}
          disabled={currentIndex === 0}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={next}
          disabled={currentIndex >= maxIndex}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </section>
  );
}
