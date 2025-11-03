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
    <section className="py-12 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-36 max-w-container">
        <h2 className="text-3xl md:text-4xl font-bold text-title dark:text-white mb-8">
          Reviews / Ratings
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((review, index) => (
            <Card key={index} hover={false}>
              <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800">
                <p className="text-body dark:text-gray-300 mb-4 leading-relaxed">
                  "{review.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <img
                    src={review.avatar}
                    alt={review.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <div className="text-sm">
                    <span className="text-title font-medium dark:text-white">
                      {review.name}
                    </span>
                    <span className="text-body dark:text-gray-400">
                      {" "}
                      — "{review.location}"
                    </span>
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
