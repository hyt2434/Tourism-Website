import React from "react";
import { Button } from "./ui/button";
import { Globe, ChevronDown, User } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-blue-900 to-blue-700 text-white">
      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between py-3 border-b border-blue-600">
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
            <button className="flex items-center gap-1 px-3 py-1.5 rounded hover-blue-600 transition">
              <img
                src="https://flagcdn.com/w20/vn.png"
                alt="VN"
                className="w-5 h-3"
              />
              <span className="text-sm">VND | VI</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            <button className="flex items-center gap-2 px-3 py-1.5 rounded hover-blue-600 transition">
              <Globe className="w-4 h-4" />
              <span className="text-sm">Khuyến mãi</span>
            </button>

            <button className="flex items-center gap-2 px-3 py-1.5 rounded hover-blue-600 transition">
              <span className="text-sm">Hỗ trợ</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            <button className="flex items-center gap-2 px-3 py-1.5 rounded hover-blue-600 transition">
              <span className="text-sm">Hợp tác với chúng tôi</span>
            </button>

            <button className="flex items-center gap-2 px-3 py-1.5 rounded hover-blue-600 transition">
              <span className="text-sm">Đặt chỗ của tôi</span>
            </button>

            <Button
              variant="outline"
              className="bg-transparent border-white text-white hover-blue-600 hover-white"
            >
              <User className="w-4 h-4 mr-2" />
              Đăng Nhập
            </Button>

            <Button className="bg-blue-500 hover-blue-400">Đăng ký</Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-6 py-4">
          <a href="#" className="text-sm hover-blue-200 transition">
            Khách sạn
          </a>
          <a href="#" className="text-sm hover-blue-200 transition">
            Vé máy bay
          </a>
          <a href="#" className="text-sm hover-blue-200 transition">
            Vé xe khách
          </a>
          <a href="#" className="text-sm hover-blue-200 transition">
            Đưa đón sân bay
          </a>
          <a href="#" className="text-sm hover-blue-200 transition">
            Cho thuê xe
          </a>
          <a href="#" className="text-sm hover-blue-200 transition">
            Hoạt động & Vui chơi
          </a>
          <a
            href="#"
            className="flex items-center gap-1 text-sm hover-blue-200 transition"
          >
            More
            <ChevronDown className="w-4 h-4" />
          </a>
        </nav>
      </div>
    </header>
  );
}
