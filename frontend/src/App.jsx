import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import Highlights from './components/Highlights';
import SeasonsHoiAn from './components/SeasonsHoiAn';
import Promotions from './components/Promotions';
import WeatherBanner from './components/WeatherBanner';
import Reviews from './components/Reviews';
import Footer from './components/Footer';
import TestPage from './components/TestPage';
import AuthPage from './components/AuthPage';

function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Highlights />
        <SeasonsHoiAn />
        <Promotions />
        <WeatherBanner />
        <Reviews />
      </main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="/auth" element={<AuthPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
