  import { useState } from "react";
  import { useNavigate } from "react-router-dom";

  export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = (e) => {
      e.preventDefault();

      const allUsers = JSON.parse(localStorage.getItem("users")) || [];

      const foundUser = allUsers.find(
        (user) => user.email === email && user.password === password
      );

      if (foundUser) {
        // ✅ Gắn thêm trạng thái đăng nhập
        const currentUser = {
          ...foundUser,
          isLoggedIn: true,
        };

        localStorage.setItem("currentUser", JSON.stringify(currentUser));
        window.dispatchEvent(new Event("storage")); // Cập nhật Navigation
        navigate("/");
      } else {
        alert("Sai email hoặc mật khẩu!");
      }
    };

    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <form
          onSubmit={handleLogin}
          className="bg-white shadow-xl rounded-2xl p-10 w-[420px]"
        >
          <h2 className="text-3xl font-bold mb-8 text-center">Đăng nhập</h2>

          <div className="mb-5">
            <label className="block font-semibold mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-8">
            <label className="block font-semibold mb-2">Mật khẩu</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="bg-black text-white w-full py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
          >
            Đăng nhập
          </button>

          <p className="text-center mt-5 text-gray-600">
            Chưa có tài khoản?{" "}
            <span
              onClick={() => navigate("/register")}
              className="text-blue-600 cursor-pointer hover:underline"
            >
              Đăng ký
            </span>
          </p>
        </form>
      </div>
    );
  }
