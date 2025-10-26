import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleRegister = (e) => {
        e.preventDefault();

        // ✅ Lấy danh sách user hiện có
        const allUsers = JSON.parse(localStorage.getItem("users")) || [];

        // ✅ Kiểm tra email đã tồn tại chưa
        const emailExists = allUsers.some((user) => user.email === email);

        if (emailExists) {
            alert("Email đã được đăng ký!");
            return;
        }

        // Dữ liệu người dùng mới
        const newUser = {
            name,
            email,
            password,
            phone: "",
            address: "",
            avatar: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
        };

        // ✅ Thêm user mới vào danh sách
        allUsers.push(newUser);

        // ✅ Lưu danh sách mới vào localStorage
        localStorage.setItem("users", JSON.stringify(allUsers));

        alert("Đăng ký thành công! Hãy đăng nhập để tiếp tục.");
        navigate("/login");
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <form
                onSubmit={handleRegister}
                className="bg-white shadow-xl rounded-2xl p-10 w-[420px]"
            >
                <h2 className="text-3xl font-bold mb-8 text-center">Đăng ký tài khoản</h2>

                <div className="mb-5">
                    <label className="block font-semibold mb-2">Họ và tên</label>
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                    />
                </div>

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
                    Đăng ký
                </button>

                <p className="text-center mt-5 text-gray-600">
                    Đã có tài khoản?{" "}
                    <span
                        onClick={() => navigate("/login")}
                        className="text-blue-600 cursor-pointer hover:underline"
                    >
                        Đăng nhập
                    </span>
                </p>
            </form>
        </div>
    );
}