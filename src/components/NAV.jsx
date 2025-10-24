import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
// import { Facebook, Linkedin, Youtube, Instagram } from "lucide-react";

export default function NAV() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const user = localStorage.getItem("user");
      setIsLoggedIn(!!user);
    };

    checkAuth();

    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

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
