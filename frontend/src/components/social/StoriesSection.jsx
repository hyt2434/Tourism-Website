import React, { useState, useEffect } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { getStories } from "../../api/social";

export default function StoriesSection() {
  const { translations } = useLanguage();
  const [stories, setStories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStories = async () => {
      try {
        const data = await getStories();
        setStories([{ content: translations.trending }, ...data]);
      } catch (err) {
        console.error('Error loading stories:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadStories();
  }, [translations.trending]);

  if (error) {
    return (
      <div className="mb-6 text-red-500 dark:text-red-400 text-center">
        {error}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mb-6 overflow-x-auto">
        <div className="flex gap-4 pb-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
              <div className="w-12 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 overflow-x-auto">
      <div className="flex gap-4 pb-2">
        {stories.map((story, index) => (
          <div
            key={story.id || index}
            className="flex flex-col items-center gap-2 cursor-pointer flex-shrink-0"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 via-red-500 to-pink-500 p-0.5">
              <div className="w-full h-full rounded-full bg-background dark:bg-gray-900 p-1">
                {story.image_url ? (
                  <img 
                    src={story.image_url} 
                    alt={story.content}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-muted dark:bg-gray-700" />
                )}
              </div>
            </div>
            <p className="text-muted-foreground dark:text-gray-400 text-sm truncate max-w-[80px]">
              {story.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
