import { useEffect, useState } from "react";

export default function Profile() {
    const [user, setUser] = useState(null);
    const [showEdit, setShowEdit] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        avatar: "",
    });

    // ✅ Lấy dữ liệu user từ localStorage khi load trang
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("currentUser"));
        if (storedUser) {
            setUser(storedUser);
            setFormData({
                name: storedUser.name || "",
                email: storedUser.email || "",
                phone: storedUser.phone || "",
                address: storedUser.address || "",
                avatar:
                    storedUser.avatar ||
                    "https://cdn-icons-png.flaticon.com/512/149/149071.png",
            });
        }
    }, []);

    // ✅ Xử lý thay đổi input text
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // ✅ Xử lý upload ảnh đại diện
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData((prev) => ({ ...prev, avatar: reader.result }));
        };
        reader.readAsDataURL(file);
    };

    // ✅ Lưu thông tin đã chỉnh sửa
    const handleSave = () => {
        const updatedUser = { ...user, ...formData };

        localStorage.setItem("currentUser", JSON.stringify(updatedUser));

        const allUsers = JSON.parse(localStorage.getItem("users")) || [];
        const userIndex = allUsers.findIndex(u => u.email === updatedUser.email);

        if (userIndex !== -1) {
            allUsers[userIndex] = updatedUser;
            localStorage.setItem("users", JSON.stringify(allUsers));
        }

        setUser(updatedUser);
        setShowEdit(false);
        window.dispatchEvent(new Event("storage"));
    };

    return (
        <div className="max-w-[900px] mx-auto mt-24 p-10 bg-white shadow-xl rounded-2xl relative">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
                {/* Ảnh đại diện */}
                <div className="relative">
                    <img
                        src={user?.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                        alt="Avatar"
                        className="w-40 h-40 rounded-full border-4 border-gray-200 object-cover"
                    />
                </div>

                {/* Thông tin người dùng */}
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">
                        Thông tin cá nhân
                    </h1>

                    <div className="space-y-4 text-lg text-gray-800">
                        <p>
                            <span className="font-semibold">Họ và tên:</span>{" "}
                            {user?.name || "Chưa cập nhật"}
                        </p>
                        <p>
                            <span className="font-semibold">Email:</span>{" "}
                            {user?.email || "Chưa cập nhật"}
                        </p>
                        <p>
                            <span className="font-semibold">Số điện thoại:</span>{" "}
                            {user?.phone || "Chưa cập nhật"}
                        </p>
                    </div>

                    {/* ✅ Chỉ hiện nút khi đã đăng nhập */}
                    {user && (
                        <div className="mt-8">
                            <button
                                onClick={() => setShowEdit(true)}
                                className="bg-black text-white px-6 py-2 rounded-lg shadow hover:bg-gray-800 transition"
                            >
                                Chỉnh sửa thông tin
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ✅ Modal chỉnh sửa thông tin */}
            {showEdit && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-lg p-8 w-[500px] relative">
                        <h2 className="text-2xl font-bold mb-6 text-center">
                            Chỉnh sửa thông tin
                        </h2>

                        {/* Form */}
                        <div className="space-y-4">
                            <div>
                                <label className="block font-semibold mb-1">Họ và tên</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100"
                                    readOnly
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Số điện thoại</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                />
                            </div>

                            {/* ✅ Upload ảnh */}
                            <div>
                                <label className="block font-semibold mb-1">Ảnh đại diện</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="block w-full text-sm text-gray-600"
                                />
                                {formData.avatar && (
                                    <img
                                        src={formData.avatar}
                                        alt="Preview"
                                        className="w-24 h-24 mt-3 rounded-full object-cover border"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-4 mt-8">
                            <button
                                onClick={() => setShowEdit(false)}
                                className="px-5 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-5 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                            >
                                Lưu thay đổi
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}