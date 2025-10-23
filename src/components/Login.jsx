import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // ✅ Login giả lập (sau này thay bằng API thật)
    if (email && password) {
      // Lưu trạng thái đăng nhập
      localStorage.setItem("user", JSON.stringify({ email }));

      // ✅ Thông báo cho Navigation cập nhật
      window.dispatchEvent(new Event("storage"));

      alert("Đăng nhập thành công!");
      navigate("/"); // quay lại trang chủ
    } else {
      alert("Vui lòng nhập đầy đủ thông tin!");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 shadow-lg rounded-2xl">
        <h2 className="text-3xl font-bold mb-6 text-center text-black">
          Đăng nhập
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Mật khẩu"
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition"
          >
            Đăng nhập
          </button>
        </form>

        <p className="text-center text-gray-500 mt-4">
          Chưa có tài khoản?{" "}
          <a href="/register" className="text-blue-600 hover:underline">
            Đăng ký
          </a>
        </p>
      </div>
    </div>
  );
}