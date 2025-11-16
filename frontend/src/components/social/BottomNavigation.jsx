import React from "react";
import { Button } from "../ui/button";
import { Home, Plus, User, Search, ShoppingBag } from "lucide-react";

export default function BottomNavigation({
  activeTab,
  onTabChange,
  onCreatePost,
}) {
  const navItems = [
    { icon: Home, tab: "home" },
    { icon: Search, tab: "search" },
    { icon: Plus, tab: "create", action: true },
    { icon: ShoppingBag, tab: "orders" },
    { icon: User, tab: "profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 lg:hidden z-50 pb-safe">
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.tab;
          
          return (
            <Button
              key={item.tab}
              variant="ghost"
              size="sm"
              className={`h-full flex-1 rounded-none hover:bg-transparent ${
                isActive && !item.action
                  ? "text-black dark:text-white"
                  : "text-gray-500 dark:text-gray-400"
              }`}
              onClick={() => {
                if (item.action) {
                  onCreatePost?.();
                } else {
                  onTabChange(item.tab);
                }
              }}
            >
              <Icon 
                className={`w-6 h-6 transition-transform ${
                  isActive && !item.action ? "scale-110" : ""
                } ${item.action ? "hover:scale-110" : ""}`}
                strokeWidth={isActive && !item.action ? 2.5 : 2}
              />
            </Button>
          );
        })}
      </div>
    </div>
  );
}
