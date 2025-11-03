import React from "react";
import { useLanguage } from "../../context/LanguageContext"; // 👈 thêm

export default function StoriesSection() {
  const { translations } = useLanguage(); // 👈 lấy translations

  const stories = [
    translations.trending,
    "Hạ Long",
    "Sapa",
    "Phú Quốc",
    "Đà Lạt",
    "Nha Trang",
  ];

  return (
    <div className="mb-6 overflow-x-auto">
      <div className="flex gap-4 pb-2">
        {stories.map((story) => (
          <div
            key={story}
            className="flex flex-col items-center gap-2 cursor-pointer flex-shrink-0"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 via-red-500 to-pink-500 p-0.5">
              <div className="w-full h-full rounded-full bg-background dark:bg-gray-900 p-1">
                <div className="w-full h-full rounded-full bg-muted dark:bg-gray-700" />
              </div>
            </div>
            <p className="text-muted-foreground dark:text-gray-400">{story}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
