import React from "react";
import { Button } from "./ui/button";
import { Globe, ChevronDown, User } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-blue-900 to-blue-700 text-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between py-3 border-b border-blue-600 dark:border-gray-700">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <svg width="120" height="24" viewBox="0 0 120 24" fill="none">
                <text
                  x="0"
                  y="18"
                  fill="white"
                  className="tracking-wide"
                  style={{ fontSize: "20px", fontFamily: "Arial, sans-serif" }}
                >
                  traveloka
                </text>
                <path
                  d="M115 8 L120 8 L120 12 L118 14 L115 12 Z"
                  fill="#3b82f6"
                />
              </svg>
            </div>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1 px-3 py-1.5 rounded hover:bg-blue-600 dark:hover:bg-blue-500 transition">
              <img
                src="https://flagcdn.com/w20/vn.png"
                alt="VN"
                className="w-5 h-3"
              />
              <span className="text-sm text-white">VND | VI</span>
              <ChevronDown className="w-4 h-4 text-white" />
            </button>

            <button className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-blue-600 dark:hover:bg-blue-500 transition">
              <Globe className="w-4 h-4 text-white" />
              <span className="text-sm text-white">Khuyến mãi</span>
            </button>

            <button className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-blue-600 dark:hover:bg-blue-500 transition">
              <span className="text-sm text-white">Hỗ trợ</span>
              <ChevronDown className="w-4 h-4 text-white" />
            </button>

            <button className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-blue-600 dark:hover:bg-blue-500 transition">
              <span className="text-sm text-white">Hợp tác với chúng tôi</span>
            </button>

            <button className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-blue-600 dark:hover:bg-blue-500 transition">
              <span className="text-sm text-white">Đặt chỗ của tôi</span>
            </button>

            <Button
              variant="outline"
              className="bg-transparent border-white text-white hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white"
            >
              <User className="w-4 h-4 mr-2" />
              Đăng Nhập
            </Button>

            <Button className="bg-blue-500 dark:bg-blue-600 hover:bg-blue-400 dark:hover:bg-blue-500 text-white">
              Đăng ký
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-6 py-4">
          {[
            "Khách sạn",
            "Vé máy bay",
            "Vé xe khách",
            "Đưa đón sân bay",
            "Cho thuê xe",
            "Hoạt động & Vui chơi",
          ].map((item) => (
            <a
              key={item}
              href="#"
              className="text-sm text-white hover:text-blue-200 dark:hover:text-blue-300 transition"
            >
              {item}
            </a>
          ))}
          <a
            href="#"
            className="flex items-center gap-1 text-sm text-white hover:text-blue-200 dark:hover:text-blue-300 transition"
          >
            More
            <ChevronDown className="w-4 h-4 text-white" />
          </a>
        </nav>
      </div>
    </header>
  );
}
