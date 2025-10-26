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
    <div className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 pb-32 pt-8">
      {/* Background overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Hero content */}
      <div className="relative container mx-auto px-4">
        <h2 className="text-white text-center text-2xl mb-12 pt-8">
          App du lịch hàng đầu, một chạm đi bất cứ đâu
        </h2>

        {/* Service tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <ServiceTab
            icon={Hotel}
            label="Khách sạn"
            active={activeService === "hotel"}
            onClick={() => setActiveService("hotel")}
          />
          <ServiceTab
            icon={Plane}
            label="Vé máy bay"
            active={activeService === "flight"}
            onClick={() => setActiveService("flight")}
          />

          <ServiceTab
            icon={MapPin}
            label="Tour"
            active={activeService === "pickup"}
            onClick={() => setActiveService("pickup")}
          />

          <ServiceTab
            icon={PartyPopper}
            label="Hoạt động & Vui chơi"
            active={activeService === "activity"}
            onClick={() => setActiveService("activity")}
          />
          <ServiceTab
            icon={MoreHorizontal}
            label="Khác"
            active={activeService === "other"}
            onClick={() => setActiveService("other")}
          />
        </div>

        {/* Insert Flight Search Form here */}
        {children}
      </div>
    </div>
  );
}

function ServiceTab({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all ${
        active
          ? "bg-white text-blue-600 shadow-lg"
          : "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
