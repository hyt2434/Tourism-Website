import React from 'react';
import Card from './ui/Card';

export default function Highlights() {
  const highlights = [
    {
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop&q=80',
      title: 'Escape to a Tropical Paradise',
      description: 'Immerse yourself in crystal-clear waters, soft white sand, and swaying palm trees—your perfect hideaway for pure relaxation.',
    },
    {
      image: 'https://i.pinimg.com/1200x/43/28/f7/4328f755e19fb2129c46d5f6f7b3a7fa.jpg',
      title: 'Where the Sea Meets Modern Living',
      description: 'Discover a vibrant coastal destination that blends ocean charm with city energy—ideal for adventure, dining, and seaside leisure.',
    },
    {
      image: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&h=600&fit=crop&q=80',
      title: 'Relax With Ocean Breeze',
      description: 'Unwind by the shore with peaceful waves, warm sunshine, and endless calm—because you deserve a moment of serenity.',
    },
  ];

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4 md:px-8 max-w-container">
        <h2 className="text-3xl md:text-4xl font-bold text-title mb-8">
          Highlights
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {highlights.map((item, index) => (
            <Card key={index}>
              <div className="overflow-hidden rounded-t-xl">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-56 object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-title mb-3">
                  {item.title}
                </h3>
                <p className="text-sm text-body leading-relaxed">
                  {item.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
