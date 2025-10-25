import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
// import { Facebook, Linkedin, Youtube, Instagram } from "lucide-react";

export default function NAV() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  // Kiểm tra trạng thái đăng nhập
  useEffect(() => {
    const checkAuth = () => {
      const user = localStorage.getItem("currentUser");
      setIsLoggedIn(!!user);
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);

    const handleClickOutside = (e) => {
      if (!e.target.closest(".account-dropdown")) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("storage", checkAuth);
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
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
            <Link to="/tour" className="text-black hover:text-blue-600">
              Tour
            </Link>
            <Link to="/social" className="text-black hover:text-blue-600">
              Social
            </Link>
            <Link to="/partner" className="text-black hover:text-blue-600">
              Partner
            </Link>
            <Link to="/aboutus" className="text-black hover:text-blue-600">
              About us
            </Link>

            <Link to="/admin" className="text-black hover:text-blue-600">
              Admin
            </Link>

            {/* Đăng nhập / Tài khoản */}
            {isLoggedIn ? (
              <div className="relative account-dropdown">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="bg-black text-white px-5 py-2 rounded-lg shadow hover:bg-gray-800 transition"
                >
                  <AccountCircleIcon fontSize="medium" />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        navigate("/profile");
                      }}
                      className="w-full text-left px-4 py-2 text-black hover:bg-gray-100 transition"
                    >
                      Thông tin cá nhân
                    </button>
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
