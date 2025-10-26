import React from "react";

export default function WeatherBanner() {
  return (
    <section className="py-12 bg-section">
      <div className="container mx-auto px-36 max-w-container">
        <div
          className="relative rounded-2xl overflow-hidden shadow-md h-[300px] md:h-[400px]"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1561484930-998b6a7b22e8?w=1400&h=600&fit=crop&q=80)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Overlay for better text visibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/80 to-transparent"></div>

          {/* Text Content */}
          <div className="relative h-full flex items-center px-8 md:px-16">
            <div>
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-serif text-title leading-tight">
                How's the
                <br />
                weather ?
              </h2>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
