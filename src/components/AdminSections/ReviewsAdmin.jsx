import React from 'react';
import ReviewCard from '../ReviewCard';

export default function ReviewsAdmin() {
  return (
    <section className="admin-section">
      <h2>💬 Social & Reviews</h2>
      <p>Manage review queues, handle reports, and maintain decision logs.</p>
      <ReviewCard />
      {/* Add moderation tools if available */}
    </section>
  );
}