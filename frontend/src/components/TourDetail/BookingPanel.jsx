// BookingPanel.jsx — Part 1 (imports, helpers, component start, header, booking tab)
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
    X as XIcon,
    Calendar,
    CreditCard,
    User,
    Mail,
    Phone,
    Wallet,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

const formatDate = (date, translations) => {
    if (!date) return translations.chooseDate;
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

export function BookingPanel({ basePrice, isOpen, onClose, duration }) {
    if (!isOpen) return null;

    const { translations } = useLanguage();

    // Booking states - dates and user information
    const [startDate, setStartDate] = useState(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
    });
    const [endDate, setEndDate] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState("card"); // "card" or "momo"
    const [userInfo, setUserInfo] = useState({
        fullName: "",
        email: "",
        phone: "",
        notes: "",
    });

    // Extract number of nights from duration (e.g., "3 ngày 2 đêm" -> 2)
    const extractNights = (durationStr) => {
        if (!durationStr) return 1;
        const match = durationStr.match(/(\d+)\s*(?:night|đêm)/i);
        return match ? parseInt(match[1]) : 1;
    };

    const numNights = extractNights(duration);

    // Auto-calculate end date when start date changes
    useEffect(() => {
        if (startDate) {
            const end = new Date(startDate);
            end.setDate(end.getDate() + numNights);
            setEndDate(end);
        }
    }, [startDate, numNights]);

    // Helper to check if date is before today (ignoring time)
    const isDateBeforeToday = (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const compareDate = new Date(date);
        compareDate.setHours(0, 0, 0, 0);
        return compareDate < today;
    };

    const calculateTotal = () => {
        return basePrice;
    };

    const handleInputChange = (field, value) => {
        setUserInfo(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                onClick={(e) => {
                    // Don't close if clicking on popover
                    if (e.target && e.target.closest && e.target.closest('[data-slot="popover-content"]')) {
                        return;
                    }
                    onClose();
                }}
            />

            {/* Panel */}
            <div className="fixed top-[10vh] left-1/2 -translate-x-1/2 w-full max-w-4xl max-h-[80vh] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-visible z-50 flex flex-col mx-4">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-5">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-2xl font-bold">{translations.panelBookTour}</h3>
                            <p className="text-sm opacity-90">{translations.panelBookTour}</p>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="text-right">
                                <p className="text-xs opacity-90">{translations.from || "Từ"}</p>
                                <p className="text-3xl font-bold">{basePrice.toLocaleString("vi-VN")} VND</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                            >
                                <XIcon className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Booking Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 pt-8 space-y-6 pb-8">
                    {/* Date Selection */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Departure Date */}
                                    <div>
                            <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                                            <Calendar className="w-4 h-4" />
                                            {translations.panelDepartureDate}
                            </Label>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={startDate.toISOString().split('T')[0]}
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            const newDate = new Date(e.target.value);
                                            newDate.setHours(0, 0, 0, 0);
                                            setStartDate(newDate);
                                        }
                                    }}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full h-11 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                                    </div>

                        {/* Return Date - Auto-calculated */}
                                    <div>
                            <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                                            <Calendar className="w-4 h-4" />
                                            {translations.panelReturnDate}
                            </Label>
                            <div className="w-full h-11 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center">
                                {endDate ? formatDate(endDate, translations) : translations.chooseReturn || "Chọn ngày về"}
                            </div>
                            {duration && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {translations.duration || "Thời gian"}: {duration}
                                </p>
                                                                )}
                                                            </div>
                                                        </div>

                    {/* User Information Section */}
                    <div className="border-t pt-6">
                        <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                            {translations.contactInformation || "Thông tin liên hệ"}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Full Name */}
                            <div>
                                <Label htmlFor="fullName" className="text-sm font-medium flex items-center gap-2 mb-2">
                                    <User className="w-4 h-4" />
                                    {translations.fullName || "Họ và tên"} <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="fullName"
                                    type="text"
                                    placeholder={translations.enterFullName || "Nhập họ và tên"}
                                    value={userInfo.fullName}
                                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                                    className="h-11"
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2 mb-2">
                                    <Mail className="w-4 h-4" />
                                    {translations.email || "Email"} <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder={translations.enterEmail || "Nhập email"}
                                    value={userInfo.email}
                                    onChange={(e) => handleInputChange("email", e.target.value)}
                                    className="h-11"
                                    required
                                />
                                                    </div>

                            {/* Phone */}
                            <div>
                                <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2 mb-2">
                                    <Phone className="w-4 h-4" />
                                    {translations.phone || "Số điện thoại"} <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder={translations.enterPhone || "Nhập số điện thoại"}
                                    value={userInfo.phone}
                                    onChange={(e) => handleInputChange("phone", e.target.value)}
                                    className="h-11"
                                    required
                                />
                                                </div>

                            {/* Notes (optional) */}
                            <div>
                                <Label htmlFor="notes" className="text-sm font-medium mb-2">
                                    {translations.notes || "Ghi chú"} ({translations.optional || "Tùy chọn"})
                                </Label>
                                <Input
                                    id="notes"
                                    type="text"
                                    placeholder={translations.enterNotes || "Ghi chú thêm (nếu có)"}
                                    value={userInfo.notes}
                                    onChange={(e) => handleInputChange("notes", e.target.value)}
                                    className="h-11"
                                />
                                        </div>
                                    </div>
                                </div>

                    {/* Payment Method Section */}
                    <div className="border-t pt-6">
                        <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                            <Wallet className="w-5 h-5" />
                            {translations.paymentMethod || "Phương thức thanh toán"}
                                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Card Payment */}
                            <div
                                onClick={() => setPaymentMethod("card")}
                                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                                    paymentMethod === "card"
                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                        paymentMethod === "card"
                                            ? "border-blue-500 bg-blue-500"
                                            : "border-gray-300 dark:border-gray-600"
                                    }`}>
                                        {paymentMethod === "card" && (
                                            <div className="w-2 h-2 rounded-full bg-white" />
                                                                )}
                                                            </div>
                                    <CreditCard className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {translations.cardPayment || "Thẻ tín dụng/Ghi nợ"}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {translations.cardPaymentDesc || "Visa, Mastercard, JCB"}
                                        </p>
                                                        </div>
                                                    </div>
                                                </div>

                            {/* MoMo Payment */}
                            <div
                                onClick={() => setPaymentMethod("momo")}
                                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                                    paymentMethod === "momo"
                                        ? "border-pink-500 bg-pink-50 dark:bg-pink-900/20"
                                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                        paymentMethod === "momo"
                                            ? "border-pink-500 bg-pink-500"
                                            : "border-gray-300 dark:border-gray-600"
                                    }`}>
                                        {paymentMethod === "momo" && (
                                            <div className="w-2 h-2 rounded-full bg-white" />
                                        )}
                                        </div>
                                    <div className="w-6 h-6 bg-gradient-to-br from-pink-500 to-pink-700 rounded flex items-center justify-center">
                                        <span className="text-white font-bold text-xs">Mo</span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {translations.momoPayment || "Ví MoMo"}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {translations.momoPaymentDesc || "Thanh toán qua ví điện tử"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer - Sticky */}
                <div className="border-t bg-white dark:bg-gray-800 p-6 pt-6 space-y-4">
                    {/* Total */}
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-lg">{translations.panelTotal || "Tổng cộng"}:</span>
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {calculateTotal().toLocaleString("vi-VN")} VND
                        </span>
                    </div>

                    {/* Book now button */}
                    <Button 
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white" 
                        size="lg"
                        disabled={!userInfo.fullName || !userInfo.email || !userInfo.phone}
                    >
                        {paymentMethod === "card" ? (
                        <CreditCard className="w-4 h-4 mr-2" />
                        ) : (
                            <Wallet className="w-4 h-4 mr-2" />
                        )}
                        <span className="text-white font-semibold">{translations.bookNow}</span>
                    </Button>

                    <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                        💡 {translations.panelPriceIncludesTax || "Giá đã bao gồm thuế và phí dịch vụ"}
                    </p>
                </div>
            </div> {/* close Panel */}
        </>
    );
}
