import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Navigation, Footer } from "./components/Navigation";
import Hero from "./components/Hero";
import HighlightCard from "./components/HighlightCard";
import { SeasonCard } from "./components/SeasonCard";
import { PromotionCard } from "./components/PromotionCard";
import { ReviewCard } from "./components/ReviewCard";
import { TourCarousel } from "./components/TourCarousel";
import { WeatherForecast } from "./components/WeatherForecast";
import Login from "./components/Login"; 
import Admin from "./components/admin"; 


export default function App() {
  // Giữ nguyên dữ liệu của bạn
  const heroImage =
    "https://images.unsplash.com/photo-1722706202511-8743d7b34794?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWV0bmFtJTIwbGFuZHNjYXBlJTIwaG9pJTIwYW58ZW58MXx8fHwxNzYwOTc4OTgyfDA&ixlib=rb-4.1.0&q=80&w=1080";

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
  ];

  return (
    <BrowserRouter>
      {/* Thanh điều hướng luôn hiển thị */}
      <Navigation />

      {/* ✅ Nút “Đăng nhập” thêm ở trên cùng bên phải */}

      <Link
        to="/login"
        className="text-blue-600 hover:underline font-medium text-lg"
      >
      </Link>

      <Routes>
        {/* ✅ Trang chủ */}
        <Route
          path="/"
          element={
            <div className="min-h-screen bg-white">
              <Hero heroImage={heroImage} />
              <TourCarousel tours={tours} />

              {/* Giữ nguyên phần nội dung của bạn */}
              <section className="max-w-[1440px] mx-auto px-20 py-20">
                <h2 className="text-black mb-12 tracking-tight">Highlights</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <HighlightCard
                    image="https://images.unsplash.com/photo-1709664309663-80382516172b?auto=format&fit=crop&w=800&q=80"
                    title="Escape to a Tropical Paradise"
                    description="Immerse yourself in crystal-clear waters and soft white sand."
                  />
                </div>
              </section>

              <WeatherForecast />
              <Footer />
            </div>
          }
        />

        {/* ✅ Trang đăng nhập */}
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}