import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Hero from "./components/Hero";
import { TourCarousel } from "./components/TourCarousel";
import HighlightCard from "./components/HighlightCard";
import { WeatherForecast } from "./components/WeatherForecast";
import Footer from "./components/Footer";
import Login from "./components/Login";
import ToursPage from "./components/TourPage"; // ✅ Import trang mới

export default function App() {
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
      <Routes>
        {/* Trang chủ */}
        <Route
          path="/"
          element={
            <div className="min-h-screen bg-white">
              <Navigation />
              <Hero heroImage={heroImage} />
              <TourCarousel tours={tours} />

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

        {/* ✅ Trang danh sách tour */}
        <Route path="/tours" element={<ToursPage />} />

        {/* Trang đăng nhập */}
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}