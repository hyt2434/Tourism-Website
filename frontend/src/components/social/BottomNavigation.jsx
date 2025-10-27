import React from "react";
import { Button } from "../ui/button";
import { Home, Compass, Plus, Film, User } from "lucide-react";

export default function BottomNavigation({
  activeTab,
  onTabChange,
  onCreatePost,
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t md:hidden">
      <div className="flex items-center justify-around py-3">
        <Button
          variant="ghost"
          size="sm"
          className={
            activeTab === "home" ? "text-primary" : "text-muted-foreground"
          }
          onClick={() => onTabChange("home")}
        >
          <Home className="w-6 h-6" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={
            activeTab === "explore" ? "text-primary" : "text-muted-foreground"
          }
          onClick={() => onTabChange("explore")}
        >
          <Compass className="w-6 h-6" />
        </Button>

        <Button variant="ghost" size="sm" onClick={onCreatePost}>
          <Plus className="w-6 h-6" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={
            activeTab === "reels" ? "text-primary" : "text-muted-foreground"
          }
          onClick={() => onTabChange("reels")}
        >
          <Film className="w-6 h-6" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={
            activeTab === "profile" ? "text-primary" : "text-muted-foreground"
          }
          onClick={() => onTabChange("profile")}
        >
          <User className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}
