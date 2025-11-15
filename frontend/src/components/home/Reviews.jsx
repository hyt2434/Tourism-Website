import React from "react";
import Card from "./Card";
import { useLanguage } from "../../context/LanguageContext"; // 👈 thêm

export default function Reviews() {
  const { translations } = useLanguage(); // 👈 lấy translations

  const reviews = [
    {
      quote: translations.review1,
      name: "Emma Wilson",
      location: "UK",
      avatar: "https://i.pravatar.cc/150?img=1",
    },
    {
      quote: translations.review2,
      name: "Daniel Nguyen",
      location: "Vietnam",
      avatar: "https://i.pravatar.cc/150?img=12",
    },
    {
      quote: translations.review2,
      name: "Daniel Nguyen",
      location: "Vietnam",
      avatar: "https://i.pravatar.cc/150?img=13",
    },
    {
      quote: translations.review3,
      name: "Sofia Martínez",
      location: "Spain",
      avatar: "https://i.pravatar.cc/150?img=5",
    },
  ];

  return (
    <section className="py-12 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-36 max-w-container">
        <h2 className="text-3xl md:text-4xl font-bold text-title dark:text-white mb-8">
          {translations.reviewsTitle}
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
