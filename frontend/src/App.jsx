import { BrowserRouter, Routes, Route } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import "./utils/leaflet-setup";
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
import TourDetail from "./components/TourDetail/TourDetail";
import HeroSection from "./components/home/HeroSection";
import FlightSearchForm from "./components/home/FlightSearchForm";
import Promotions from "./components/home/Promotions";
import FlightDeals from "./components/home/FlightDeals";
import Reviews from "./components/home/Reviews";
import PartnerPage from "./components/Partner/PartnerPage";
import PartnerDetail from "./components/Partner/PartnerDetail";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function App() {
  const tours = [
    {
      id: 1,
      name: "Ha Long Bay Cruise",
      image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&h=600&fit=crop&q=80",
      price: "$299",
      duration: "2 Days",
      description: "Explore the stunning limestone karsts and emerald waters",
    },
    {
      id: 2,
      name: "Da Nang Beach Tour",
      image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&h=600&fit=crop&q=80",
      price: "$199",
      duration: "1 Day",
      description: "Relax on pristine beaches and enjoy water activities",
    },
    {
      id: 3,
      name: "Hoi An Ancient Town",
      image: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&h=600&fit=crop&q=80",
      price: "$149",
      duration: "1 Day",
      description: "Walk through lantern-lit streets and historic architecture",
    },
    {
      id: 4,
      name: "Phu Quoc Island",
      image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&h=600&fit=crop&q=80",
      price: "$399",
      duration: "3 Days",
      description: "Paradise beaches and tropical island adventures",
    },
    {
      id: 5,
      name: "Nha Trang Bay",
      image: "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=800&h=600&fit=crop&q=80",
      price: "$249",
      duration: "2 Days",
      description: "Crystal waters, island hopping, and vibrant nightlife",
    },
  ];

  return (
    <BrowserRouter>
      {/* 👇 Bọc toàn bộ app trong div hỗ trợ dark mode */}
      <div className="bg-white text-black dark:bg-gray-900 dark:text-white min-h-screen transition-colors duration-300">
        <NAV />
        <Routes>
          <Route
            path="/"
            element={
              <div>
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
          {/* ✅ Thêm route chi tiết tour */}
          <Route path="/tours/:id" element={<TourDetail tours={tours} />} />
          <Route path="/tour" element={<ToursPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/aboutus"
            element={
              <h1 className="text-center text-3xl font-bold text-gray-900 dark:text-white mb-6">
                {" "}
                Cao Triết nè
              </h1>
            }
          />
          <Route path="/social" element={<SocialPage />} />
          <Route path="/partner" element={<PartnerPage />} />
          <Route path="/partner/:id" element={<PartnerDetail />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
