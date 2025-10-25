import React from "react";
import Card from "./Card";

export default function Reviews() {
  const reviews = [
    {
      quote: "Amazing experience! The tour was well-organized and stress-free.",
      name: "Emma Wilson",
      location: "UK",
      avatar: "https://i.pravatar.cc/150?img=1",
    },
    {
      quote: "Beautiful destinations and friendly guide. Highly recommended!",
      name: "Daniel Nguyen",
      location: "Descriptions",
      avatar: "https://i.pravatar.cc/150?img=12",
    },
    {
      quote: "Beautiful destinations and friendly guide. Highly recommended!",
      name: "Daniel Nguyen",
      location: "Descriptions",
      avatar: "https://i.pravatar.cc/150?img=13",
    },
    {
      quote: "Great value for money. Loved the lantern boat in Hoi An!",
      name: "Sofia Martínez",
      location: "Spain",
      avatar: "https://i.pravatar.cc/150?img=5",
    },
  ];

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4 md:px-8 max-w-container">
        <h2 className="text-3xl md:text-4xl font-bold text-title mb-8">
          Reviews / Ratings
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((review, index) => (
            <Card key={index} hover={false}>
              <div className="p-6 border border-gray-200 rounded-xl">
                <p className="text-body mb-4 leading-relaxed">
                  "{review.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <img
                    src={review.avatar}
                    alt={review.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <div className="text-sm">
                    <span className="text-title font-medium">
                      {review.name}
                    </span>
                    <span className="text-body"> — "{review.location}"</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
