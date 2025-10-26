import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
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

export default function HeroSection({ children }) {
  const [activeService, setActiveService] = useState("flight");

  return (
    <section className="pb-24 pt-8 px-4 md:px-8 lg:px-36">
      {/* Background image container with content overlay */}
      <div className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] rounded-3xl overflow-visible">
        {/* Background image with rounded corners */}
        <div
          className="absolute inset-0 rounded-3xl overflow-hidden"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1200)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        
        {/* Dark overlay for better text contrast */}
        <div className="absolute inset-0 bg-black/40 rounded-3xl" />

        {/* Hero content overlay */}
        <div className="relative h-full flex flex-col justify-center px-4 md:px-8 lg:px-12 z-10">
          <h2 className="text-white text-center text-2xl md:text-3xl lg:text-4xl font-bold mb-12 leading-tight drop-shadow-lg">
            Leading travel app, one touch to go anywhere
          </h2>

          {/* Service tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
          <ServiceTab
            icon={Hotel}
            label="Hotels"
            active={activeService === "hotel"}
            onClick={() => setActiveService("hotel")}
          />
          <ServiceTab
            icon={Plane}
            label="Flights"
            active={activeService === "flight"}
            onClick={() => setActiveService("flight")}
          />

          <ServiceTab
            icon={MapPin}
            label="Tours"
            active={activeService === "pickup"}
            onClick={() => setActiveService("pickup")}
          />

          <ServiceTab
            icon={PartyPopper}
            label="Activities & Fun"
            active={activeService === "activity"}
            onClick={() => setActiveService("activity")}
          />
          <ServiceTab
            icon={MoreHorizontal}
            label="More"
            active={activeService === "other"}
            onClick={() => setActiveService("other")}
          />
        </div>

        {/* Insert Flight Search Form here */}
        {children}
      </div>
    </div>
    </section>
  );
}

function ServiceTab({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-full transition-all transform hover:scale-105 ${
        active
          ? "bg-white text-blue-600 shadow-lg"
          : "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
      }`}
    >
      <Icon className="w-4 h-4 md:w-5 md:h-5" />
      <span className="text-xs md:text-sm font-medium">{label}</span>
    </button>
  );
}
