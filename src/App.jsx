import { BrowserRouter, Routes, Route } from "react-router-dom";

import NAV from "./components/NAV";
import Footer from "./components/Footer";
import TourCarousel from "./components/TourCarousel";
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";
import SocialPage from "./components/social/SocialPage";
import ToursPage from "./components/ToursPage";
import AdminPage from "./components/AdminSections/AdminPage";
import WeatherBanner from "./components/home/WeatherBanner";

import HeroSection from "./components/home/HeroSection";
import FlightSearchForm from "./components/home/FlightSearchForm";
import Promotions from "./components/home/Promotions";
import FlightDeals from "./components/home/FlightDeals";
import Reviews from "./components/home/Reviews";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function App() {
  const heroImage =
    "https://images.unsplash.com/photo-1722706202511-8743d7b34794?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWV0bmFtJTIwbGFuZHNjYXBlJTIwaG9pJTIwYW58ZW58MXx8fHwxNzYwOTc4OTgyfDA&ixlib=rb-4.1.0&q=80&w=1080";

  // ✅ Thêm các ảnh bị thiếu
  const beachImage =
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80";
  const coastalImage =
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80";
  const oceanImage =
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80";
  const seasonsImage =
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80";
  const promoImage =
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80";
  const travelersImage =
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80";

  const tours = [
    {
      id: 1,
      name: "Ha Long Bay Cruise",
      image:
        "https://images.unsplash.com/photo-1713551584340-7b7817f39a62?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYWxvbmclMjBiYXklMjB2aWV0bmFtJTIwdG91cnxlbnwxfHx8fDE3NjA5NzkzMzd8MA&ixlib=rb-4.1.0&q=80&w=1080",
      price: "$299",
      duration: "2 Days",
      description: "Explore the stunning limestone karsts and emerald waters",
    },
    {
      id: 2,
      name: "Da Nang Beach Tour",
      image:
        "https://images.unsplash.com/flagged/photo-1583863374731-4224cbbc8c36?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYW5hbmclMjB2aWV0bmFtJTIwYmVhY2h8ZW58MXx8fHwxNzYwOTc5MzM3fDA&ixlib=rb-4.1.0&q=80&w=1080",
      price: "$199",
      duration: "1 Day",
      description: "Relax on pristine beaches and enjoy water activities",
    },
    {
      id: 3,
      name: "Hoi An Ancient Town",
      image:
        "https://images.unsplash.com/photo-1664650440553-ab53804814b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob2klMjBhbiUyMGFuY2llbnQlMjB0b3dufGVufDF8fHx8MTc2MDk3OTMzOHww&ixlib=rb-4.1.0&q=80&w=1080",
      price: "$149",
      duration: "1 Day",
      description: "Walk through lantern-lit streets and historic architecture",
    },
    {
      id: 4,
      name: "Phu Quoc Island",
      image:
        "https://images.unsplash.com/photo-1668570496303-e22d19a17f65?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaHUlMjBxdW9jJTIwaXNsYW5kfGVufDF8fHx8MTc2MDk3OTMzOHww&ixlib=rb-4.1.0&q=80&w=1080",
      price: "$399",
      duration: "3 Days",
      description: "Paradise beaches and tropical island adventures",
    },
    {
      id: 5,
      name: "Nha Trang Bay",
      image:
        "https://images.unsplash.com/photo-1533002832-1721d16b4bb9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuaGElMjB0cmFuZyUyMGJlYWNofGVufDF8fHx8MTc2MDg2MjU2NXww&ixlib=rb-4.1.0&q=80&w=1080",
      price: "$249",
      duration: "2 Days",
      description: "Crystal waters, island hopping, and vibrant nightlife",
    },
  ];
  const promotions = [
    {
      image: promoImage,
      title: "Save 40% - Special Holiday Deal",
      features: [
        "40% OFF for bookings this week",
        "Free Coconut Boat Tour in Bay Mau Forest",
        "Complimentary Vietnamese Dinner by the river",
        "Kids under 6 travel FREE",
      ],
    },
    {
      image:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
      title: "Limited Offer – Up to 50% OFF!",
      features: [
        "Up to 50% discount for early booking",
        "Group offer: Book 4 pay 3",
        "Free lantern boat ride in Hoi An",
        "Airport pick-up included",
      ],
    },
    {
      image:
        "https://images.unsplash.com/photo-1533002832-1721d16b4bb9?auto=format&fit=crop&w=800&q=80",
      title: "Save 35% – Limited Time Offer!",
      features: [
        "35% OFF festival season bookings",
        "Free Lantern Boat Ticket",
        "Traditional Costume Rental Included (Ao Dai)",
        "Souvenir Lantern Gift for each guest",
      ],
    },
    {
      image:
        "https://images.unsplash.com/photo-1519821172141-b5d8f0550b25?auto=format&fit=crop&w=800&q=80",
      title: "Summer Special – Up to 30% OFF!",
      features: [
        "30% OFF for beach destinations",
        "Complimentary snorkeling session",
        "Free welcome drinks at resort",
        "Late check-out included",
      ],
    },
    {
      image:
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
      title: "Romantic Getaway – 25% Discount",
      features: [
        "Exclusive package for couples",
        "Free candlelight dinner by the beach",
        "Spa session included",
        "Complimentary wine and dessert",
      ],
    },
    {
      image:
        "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=800&q=80",
      title: "Family Adventure Deal – Save 20%",
      features: [
        "20% OFF for groups of 4+",
        "Kids stay and eat free",
        "Free local guide and photographer",
        "Family-friendly attractions included",
      ],
    },
  ];

  return (
    <BrowserRouter>
      <NAV />
      <Routes>
        <Route
          path="/"
          element={
            <div className="min-h-screen bg-gray-50 ">
              <HeroSection>
                <FlightSearchForm />
              </HeroSection>
              <TourCarousel tours={tours} />
              <Promotions />

              <Reviews />
              <FlightDeals />
              <WeatherBanner />
            </div>
          }
        />
        <Route path="/tour" element={<ToursPage />} />
        <Route path="/login" element={<Login />} />
        {/* ✅ Trang đăng ký */}
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/social" element={<SocialPage />} />
        <Route path="/partner" element={<div>Hello</div>} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
