import React from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import Hero from '../components/Hero';
import FilterSidebar from '../components/FilterSidebar';
import TourCard from '../components/TourCard';
import PromotionCard from '../components/PromotionCard';
import ReviewCard from '../components/ReviewCard';
import WeatherForecast from '../components/WeatherForecast';

import ServicesAdmin from './AdminSections/ServicesAdmin';
import PromotionsAdmin from './AdminSections/PromotionsAdmin';
import OrdersAdmin from './AdminSections/OrdersAdmin';
import ReviewsAdmin from './AdminSections/ReviewsAdmin';
import LanguageAdmin from './AdminSections/LanguageAdmin';
import WeatherAdmin from './AdminSections/WeatherAdmin';


export default function Admin() {
  return (
    <>
      <Navigation />
      <Hero
        title="Admin Dashboard"
        subtitle="Manage all aspects of your tourism platform"
      />

      <main className="admin-container" style={{ padding: '2rem' }}>
        {/* Services Section */}
        <section className="admin-section">
          <h2>🛠️ Services</h2>
          <p>Create, edit, approve, or hide tours, accommodations, and transport providers. Manage schedules and time slots.</p>
          <FilterSidebar />
          <div className="card-grid">
            <TourCard />
            {/* Add AccommodationCard, TransportCard if available */}
          </div>
        </section>

        {/* Promotions Section */}
        <section className="admin-section">
          <h2>🎁 Promotions</h2>
          <p>Create discount codes, configure display conditions, and track usage.</p>
          <PromotionCard />
          {/* Add form or modal for creating/editing promotions */}
        </section>

        {/* Orders & Payments Section */}
        <section className="admin-section">
          <h2>💳 Orders & Payments</h2>
          <p>Lookup orders, handle rescheduling/cancellations, and record refunds.</p>
          {/* Replace with actual order table or list */}
          <div className="order-placeholder">[Order management UI goes here]</div>
        </section>

        {/* Social & Reviews Section */}
        <section className="admin-section">
          <h2>💬 Social & Reviews</h2>
          <p>Manage review queues, handle reports, and maintain decision logs.</p>
          <ReviewCard />
          {/* Add moderation tools if available */}
        </section>

        {/* Languages Section */}
        <section className="admin-section">
          <h2>🌐 Languages</h2>
          <p>Audit translations (VI/EN), and add/edit UI and service content.</p>
          <div className="translation-placeholder">[Translation audit table goes here]</div>
        </section>

        {/* Weather Suggestions Section */}
        <section className="admin-section">
          <h2>🌤️ Weather Suggestions</h2>
          <p>Configure display rules based on weather forecasts.</p>
          <WeatherForecast />
          {/* Add rule configuration UI */}
        </section>
      </main>

      <Footer />
    </>
  );
}