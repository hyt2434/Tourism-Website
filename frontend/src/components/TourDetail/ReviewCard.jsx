import { Star, ThumbsUp } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { useLanguage } from "../../context/LanguageContext"; // 👈 lấy translations

export function ReviewCard({ name, rating, date, review, helpful }) {
  const { translations } = useLanguage(); // 👈 dùng context

  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
              {name}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300 dark:text-gray-600"
                      }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {date}
              </span>
            </div>
          </div>
        </div>

        <p className="text-gray-700 dark:text-gray-300 mb-4">{review}</p>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-gray-700 dark:text-gray-200"
          >
            <ThumbsUp className="w-4 h-4" />
            <span className="text-sm">
              {translations.reviewHelpful} ({helpful})
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
