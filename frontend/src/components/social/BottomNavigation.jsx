import React from "react";
import { Button } from "../ui/button";
import { Home, Compass, Plus, Film, User } from "lucide-react";

export default function BottomNavigation({
  activeTab,
  onTabChange,
  onCreatePost,
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 md:hidden">
      <div className="flex items-center justify-around py-3">
        <Button
          variant="ghost"
          size="sm"
          className={
            activeTab === "home"
              ? "text-primary dark:text-white"
              : "text-muted-foreground dark:text-gray-400"
          }
          onClick={() => onTabChange("home")}
        >
          <Home className="w-6 h-6" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={
            activeTab === "explore"
              ? "text-primary dark:text-white"
              : "text-muted-foreground dark:text-gray-400"
          }
          onClick={() => onTabChange("explore")}
        >
          <Compass className="w-6 h-6" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground dark:text-gray-400"
          onClick={onCreatePost}
        >
          <Plus className="w-6 h-6" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={
            activeTab === "reels"
              ? "text-primary dark:text-white"
              : "text-muted-foreground dark:text-gray-400"
          }
          onClick={() => onTabChange("reels")}
        >
          <Film className="w-6 h-6" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={
            activeTab === "profile"
              ? "text-primary dark:text-white"
              : "text-muted-foreground dark:text-gray-400"
          }
          onClick={() => onTabChange("profile")}
        >
          <User className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}
