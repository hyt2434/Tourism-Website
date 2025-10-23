import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { Facebook, Linkedin, Youtube, Instagram } from "lucide-react";

export function Navigation() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // ✅ Kiểm tra đăng nhập khi load trang VÀ khi có thay đổi
  useEffect(() => {
    const checkAuth = () => {
      const user = localStorage.getItem("user");
      setIsLoggedIn(!!user);
    };

    checkAuth(); // Kiểm tra ngay khi mount

    // ✅ Lắng nghe sự kiện từ Login
    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  // ✅ Xử lý đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="max-w-[1440px] mx-auto px-20 py-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div
            style={{
              fontSize: "36px",
              fontWeight: "bold",
              color: "black",
              textDecoration: "none",
            }}
          >
            MagicViet
          </div>

          {/* Menu */}
          <div className="flex items-center gap-10 text-lg">
            <Link to="/" className="text-black hover:text-blue-600">
              Home
            </Link>
            <a href="#" className="text-black hover:text-blue-600">
              Tour
            </a>
            <a href="#" className="text-black hover:text-blue-600">
              Social
            </a>
            <a href="#" className="text-black hover:text-blue-600">
              Partner
            </a>
            <a href="#" className="text-black hover:text-blue-600">
              About us
            </a>

            {/* ✅ Nút login / icon */}
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="bg-black text-white px-5 py-2 rounded-lg shadow hover:bg-gray-800 transition"
                title="Đăng xuất"
              >
                <AccountCircleIcon fontSize="medium" />
              </button>
            ) : (
              <div className="flex gap-3">
                <Link
                  to="/login"
                  className="bg-black text-white px-6 py-2 rounded-lg shadow hover:bg-gray-800 transition"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="bg-gray-200 text-black px-6 py-2 rounded-lg shadow hover:bg-gray-300 transition"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="bg-white border-t mt-20">
      <div className="max-w-[1440px] mx-auto px-20 py-12">
        <div className="grid grid-cols-4 gap-8 mb-12">
          {/* Column 1 */}
          <div>
            <h3 className="mb-6 font-bold text-2xl text-black">MagicViet</h3>
            <p className="text-black">
              Discover the beauty of Vietnam with our premium travel services.
            </p>
          </div>

          {/* Column 2 */}
          <div>
            <h4 className="mb-6 text-black font-semibold">Popular Provinces</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-black hover:text-blue-600">Hanoi</a></li>
              <li><a href="#" className="text-black hover:text-blue-600">Ho Chi Minh</a></li>
              <li><a href="#" className="text-black hover:text-blue-600">Da Nang</a></li>
              <li><a href="#" className="text-black hover:text-blue-600">Hue</a></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h4 className="mb-6 text-black font-semibold">More Destinations</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-black hover:text-blue-600">Hoi An</a></li>
              <li><a href="#" className="text-black hover:text-blue-600">Phu Quoc</a></li>
              <li><a href="#" className="text-black hover:text-blue-600">Nha Trang</a></li>
              <li><a href="#" className="text-black hover:text-blue-600">Ha Long Bay</a></li>
            </ul>
          </div>

          {/* Column 4 */}
          <div>
            <h4 className="mb-6 text-black font-semibold">Legal</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-black hover:text-blue-600">Terms of Service</a></li>
              <li><a href="#" className="text-black hover:text-blue-600">Privacy Policy</a></li>
              <li><a href="#" className="text-black hover:text-blue-600">Cookie Policy</a></li>
              <li><a href="#" className="text-black hover:text-blue-600">Accessibility</a></li>
            </ul>
          </div>
        </div>

        {/* Social Icons */}
        <div className="flex gap-3 mt-8">
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