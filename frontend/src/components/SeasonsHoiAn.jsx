import React from 'react';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

export default function SeasonsHoiAn() {
  const seasons = [
    {
      title: 'Spring – Full of life',
      description: 'Mild weather and blooming bougainvillea make spring perfect for exploring the ancient town and local festivals.',
    },
    {
      title: 'Summer – Bright and lively',
      description: 'Vibrant and sunny—ideal for beach days at An Bàng or Cửa Đại, and magical lantern nights by the river.',
    },
    {
      title: 'Autumn – Romantic and peaceful',
      description: 'Comfortable temperatures and peaceful scenery make autumn great for cycling through rice fields and river cruises.',
    },
    {
      title: 'Winter – Slow and nostalgic',
      description: 'Cooler and quiet, winter brings a nostalgic charm—perfect for slow travel, coffee by old streets, and cultural discovery.',
    },
  ];

  return (
    <section className="py-12 bg-section">
      <div className="container mx-auto px-4 md:px-8 max-w-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Text Content */}
          <div className="flex flex-col justify-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-title leading-tight mb-8">
              Discover Hội An<br />
              in every season
            </h2>

            <div className="space-y-6">
              {seasons.map((season, index) => (
                <div key={index}>
                  <h3 className="text-base md:text-lg font-bold text-title mb-2">
                    {season.title}
                  </h3>
                  <p className="text-sm text-body leading-relaxed">
                    {season.description}
                  </p>
                </div>
              ))}
            </div>

            <button className="mt-8 self-start px-6 py-2 border border-gray-300 rounded-full text-body hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-black/20 flex items-center gap-2">
              <span>More</span>
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Right Column - Image */}
          <div className="order-first lg:order-last">
            <div className="h-[400px] lg:h-full min-h-[500px] rounded-2xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&h=1200&fit=crop&q=80"
                alt="Hoi An street with bougainvillea"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
