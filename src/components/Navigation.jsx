import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { Facebook, Linkedin, Youtube, Instagram } from "lucide-react";

export function Navigation() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  // ✅ Kiểm tra đăng nhập khi load trang VÀ khi có thay đổi
  useEffect(() => {
    const checkAuth = () => {
      const user = localStorage.getItem("currentUser"); // ✅ ĐỔI từ "user" sang "currentUser"
      setIsLoggedIn(!!user);
    };

    checkAuth(); // Kiểm tra ngay khi mount

    // ✅ Lắng nghe sự kiện từ Login
    window.addEventListener("storage", checkAuth);

    // ✅ Đóng dropdown khi click bên ngoài
    const handleClickOutside = (e) => {
      if (!e.target.closest(".relative")) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("storage", checkAuth);
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // ✅ Xử lý đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("currentUser"); // ✅ Chỉ xóa currentUser, không xóa danh sách users
    setIsLoggedIn(false);
    setShowDropdown(false);
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

            {/* ✅ Nút login / icon với dropdown */}
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="bg-black text-white px-5 py-2 rounded-lg shadow hover:bg-gray-800 transition"
                  title="Tài khoản"
                >
                  <AccountCircleIcon fontSize="medium" />
                </button>

                {/* Dropdown menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {/* Thông tin cá nhân */}
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        navigate("/profile");
                      }}
                      className="w-full text-left px-4 py-2 text-black hover:bg-gray-100 transition"
                    >
                      Thông tin cá nhân
                    </button>

                    {/* Đăng xuất */}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-black hover:bg-gray-100 transition"
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-black text-white px-6 py-2 rounded-lg shadow hover:bg-gray-800 transition"
              >
                Đăng nhập
              </Link>
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
              <li>
                <a href="#" className="text-black hover:text-blue-600">
                  Hanoi
                </a>
              </li>
              <li>
                <a href="#" className="text-black hover:text-blue-600">
                  Ho Chi Minh
                </a>
              </li>
              <li>
                <a href="#" className="text-black hover:text-blue-600">
                  Da Nang
                </a>
              </li>
              <li>
                <a href="#" className="text-black hover:text-blue-600">
                  Hue
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h4 className="mb-6 text-black font-semibold">More Destinations</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-black hover:text-blue-600">
                  Hoi An
                </a>
              </li>
              <li>
                <a href="#" className="text-black hover:text-blue-600">
                  Phu Quoc
                </a>
              </li>
              <li>
                <a href="#" className="text-black hover:text-blue-600">
                  Nha Trang
                </a>
              </li>
              <li>
                <a href="#" className="text-black hover:text-blue-600">
                  Ha Long Bay
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4 */}
          <div>
            <h4 className="mb-6 text-black font-semibold">Legal</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-black hover:text-blue-600">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-black hover:text-blue-600">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-black hover:text-blue-600">
                  Cookie Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-black hover:text-blue-600">
                  Accessibility
                </a>
              </li>
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