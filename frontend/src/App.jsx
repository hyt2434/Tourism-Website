import { BrowserRouter, Routes, Route } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import "./utils/leaflet-setup";
import NAV from "./components/NAV";
import Footer from "./components/Footer";
import TourCarousel from "./components/TourCarousel";
import Login from "./components/Login";
import Register from "./components/Register";
import ForgotPassword from "./components/ForgotPassword";
import Profile from "./components/Profile";
import SocialPage from "./components/social/SocialPage";
import ToursPage from "./components/ToursPage";
import AdminPage from "./components/AdminSections/AdminPage";
import PartnerManagePage from "./components/PartnerManagePage";
import AccountPage from "./components/AccountPage";
import WeatherBanner from "./components/home/WeatherBanner";
import TourDetail from "./components/TourDetail/TourDetail";
import HeroSection from "./components/home/HeroSection";
import FlightSearchForm from "./components/home/FlightSearchForm";
import Promotions from "./components/home/Promotions";
import FlightDeals from "./components/home/FlightDeals";
import Reviews from "./components/home/Reviews";
import PartnerPage from "./components/Partner/PartnerPage";
import PartnerDetail from "./components/Partner/PartnerDetail";
import AboutUs from "./components/AboutUs";
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
            element={(
              <div className="relative min-h-screen">
                {/* Animated gradient background */}
                <div className="fixed inset-0 -z-10 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20" />
                  <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-blue-200/30 to-purple-200/30 dark:from-blue-500/10 dark:to-purple-500/10 rounded-full blur-3xl animate-blob" />
                  <div className="absolute top-1/3 -right-1/4 w-1/2 h-1/2 bg-gradient-to-br from-purple-200/30 to-pink-200/30 dark:from-purple-500/10 dark:to-pink-500/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
                  <div className="absolute -bottom-1/4 left-1/3 w-1/2 h-1/2 bg-gradient-to-br from-pink-200/30 to-blue-200/30 dark:from-pink-500/10 dark:to-blue-500/10 rounded-full blur-3xl animate-blob animation-delay-4000" />
                </div>
                
                <HeroSection>
                  <FlightSearchForm />
                </HeroSection>
                <TourCarousel tours={tours} />
                <Promotions />
                <Reviews />
                <FlightDeals />
                <WeatherBanner />
              </div>
            )}
          />
          {/* ✅ Thêm route chi tiết tour */}
          <Route path="/tours/:id" element={<TourDetail tours={tours} />} />
          <Route path="/tour" element={<ToursPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/partner-manage" element={<PartnerManagePage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/aboutus" element={<AboutUs />} />
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
