import React from 'react';
import PromotionCard from '../PromotionCard';

export default function PromotionsAdmin() {
  return (
    <section className="admin-section">
      <h2>🎁 Promotions</h2>
      <p>Create discount codes and track usage.</p>
      <PromotionCard />
      {/* Add form or modal for creating/editing promotions */}
    </section>
  );
}