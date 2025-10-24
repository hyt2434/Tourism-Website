import React from 'react';
import FilterSidebar from '../FilterSidebar';
import TourCard from '../TourCard';

export default function ServicesAdmin() {
  return (
    <section className="admin-section">
      <h2>🛠️ Services</h2>
      <p>Manage tours, accommodations, and transport providers.</p>
      <FilterSidebar />
      <div className="card-grid">
        <TourCard />
        {/* Add AccommodationCard and TransportCard if available */}
      </div>
    </section>
  );
}