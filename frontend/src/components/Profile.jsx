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

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData((prev) => ({ ...prev, avatar: reader.result }));
        };
        reader.readAsDataURL(file);
    };

    const handleSave = () => {
        const updatedUser = { ...user, ...formData };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setShowEdit(false);
        window.dispatchEvent(new Event("storage"));
    };

    return (
        <div className="max-w-[900px] mx-auto mt-24 p-10 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 shadow-xl rounded-2xl relative transition-colors duration-300">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
                <div className="relative">
                    <img
                        src={
                            user?.avatar ||
                            "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                        }
                        alt="Avatar"
                        className="w-40 h-40 rounded-full border-4 border-gray-200 dark:border-gray-600 object-cover"
                    />
                </div>

                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                        Thông tin cá nhân
                    </h1>
                    <div className="space-y-4 text-lg text-gray-800 dark:text-gray-200">
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

                    {user && (
                        <div className="mt-8">
                            <button
                                onClick={() => setShowEdit(true)}
                                className="bg-black dark:bg-white dark:text-black text-white px-6 py-2 rounded-lg shadow hover:bg-gray-800 dark:hover:bg-gray-200 transition"
                            >
                                Chỉnh sửa thông tin
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {showEdit && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 rounded-xl shadow-lg p-8 w-[500px] relative transition-colors duration-300">
                        <h2 className="text-2xl font-bold mb-6 text-center">
                            Chỉnh sửa thông tin
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block font-semibold mb-1">Họ và tên</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
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
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Ảnh đại diện</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="block w-full text-sm text-gray-600 dark:text-gray-300"
                                />
                                {formData.avatar && (
                                    <img
                                        src={formData.avatar}
                                        alt="Preview"
                                        className="w-24 h-24 mt-3 rounded-full object-cover border border-gray-300 dark:border-gray-600"
                                    />
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 mt-8">
                            <button
                                onClick={() => setShowEdit(false)}
                                className="px-5 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-5 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200"
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
