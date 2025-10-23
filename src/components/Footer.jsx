import { Link } from "react-router-dom";


import { Facebook, Linkedin, Youtube, Instagram } from "lucide-react";

export  default  function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="max-w-[1440px] mx-auto px-20 py-12">
        <div className="grid grid-cols-4 gap-8 mb-12">
          {/* Column 1 */}
          <div>
            <h3 className="mb-6">Viet Travel</h3>
            <p className="text-black">
              Discover the beauty of Vietnam with our premium travel services.
            </p>
          </div>

          {/* Column 2 */}
          <div>
            <h4 className="mb-6 text-black">Popular Provinces</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-black">Hanoi</a></li>
              <li><a href="#" className="text-black">Ho Chi Minh</a></li>
              <li><a href="#" className="text-black">Da Nang</a></li>
              <li><a href="#" className="text-black">Hue</a></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h4 className="mb-6 text-black">More Destinations</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-black">Hoi An</a></li>
              <li><a href="#" className="text-black">Phu Quoc</a></li>
              <li><a href="#" className="text-black">Nha Trang</a></li>
              <li><a href="#" className="text-black">Ha Long Bay</a></li>
            </ul>
          </div>

          {/* Column 4 */}
          <div>
            <h4 className="mb-6 text-black">Legal</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-black">Terms of Service</a></li>
              <li><a href="#" className="text-black">Privacy Policy</a></li>
              <li><a href="#" className="text-black">Cookie Policy</a></li>
              <li><a href="#" className="text-black">Accessibility</a></li>
            </ul>
          </div>
        </div>

        {/* Social Icons */}
        <div className="flex gap-2 mt-8">
          <button className="w-10 h-10 rounded flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors">
            <Facebook className="w-6 h-6 text-gray-500" />
          </button>
          <button className="w-10 h-10 rounded flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors">
            <Linkedin className="w-6 h-6 text-gray-500" />
          </button>
          <button className="w-10 h-10 rounded flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors">
            <Youtube className="w-6 h-6 text-gray-500" />
          </button>
          <button className="w-10 h-10 rounded flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors">
            <Instagram className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="border-t border-gray-200 mt-8"></div>
      </div>
    </footer>
  );
}