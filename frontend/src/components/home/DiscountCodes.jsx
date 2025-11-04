import React from "react";
import { Copy, Gift, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { useLanguage } from "../../context/LanguageContext"; // 👈 thêm

const discountsData = (translations) => [
  {
    id: 1,
    title: translations.discountFlightTitle,
    description: translations.discountFlightDesc,
    code: "TVLBANNOI",
  },
  {
    id: 2,
    title: translations.discountHotelTitle,
    description: translations.discountHotelDesc,
    code: "TVLBANNOI",
  },
  {
    id: 3,
    title: translations.discountActivityTitle,
    description: translations.discountActivityDesc,
    code: "TVLBANNOI",
  },
];

export default function DiscountCodes() {
  const { translations } = useLanguage(); // 👈 lấy translations
  const discounts = discountsData(translations);

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="container mx-auto px-4 py-12 transition-colors duration-300">
      <div className="flex items-center gap-3 mb-6">
        <Gift className="w-6 h-6 text-blue-700 dark:text-blue-400" />
        <h2 className="text-blue-700 dark:text-blue-400 font-semibold">
          {translations.discountHeader}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {discounts.map((discount) => (
          <div
            key={discount.id}
            className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-lg transition-all"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                <Gift className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm mb-2 text-gray-800 dark:text-white">
                  {discount.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {discount.description}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-950 rounded-lg px-4 py-3">
              <code className="text-sm text-blue-700 dark:text-blue-400">
                {discount.code}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyCode(discount.code)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800"
              >
                <Copy className="w-4 h-4 mr-1" />
                {translations.copy}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-6">
        <Button
          variant="ghost"
          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
        >
          <ChevronRight className="w-4 h-4 mr-1" />
        </Button>
      </div>
    </div>
  );
}
