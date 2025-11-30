// BookingPanel.jsx — Part 1 (imports, helpers, component start, header, booking tab)
import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
    X as XIcon,
    Calendar as CalendarIcon,
    CreditCard,
    User,
    Mail,
    Phone,
    Wallet,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

// Initialize Stripe
// Note: Add VITE_STRIPE_PUBLISHABLE_KEY to your frontend .env file
// Get your publishable key from Stripe Dashboard (it starts with pk_test_ for test mode)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const formatDate = (date, translations) => {
    if (!date) return translations.chooseDate;
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

// Inner component that uses Stripe hooks
function BookingForm({ basePrice, onClose, duration, tourId, translations }) {
    const stripe = useStripe();
    const elements = useElements();

    // Check if user is a partner (partners cannot book tours)
    const [isPartner, setIsPartner] = useState(false);
    // Check if user is logged in
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    
    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const user = JSON.parse(storedUser);
                if (user.role === 'partner') {
                    setIsPartner(true);
                }
                if (user.isLoggedIn) {
                    setIsLoggedIn(true);
                }
            }
        } catch (e) {
            console.log('Error reading user:', e);
        }
    }, []);

    // Booking states - dates and user information
    const [startDate, setStartDate] = useState(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
    });
    const [endDate, setEndDate] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState(null); // null, "card", or "momo"
    const [openDeparture, setOpenDeparture] = useState(false);
    const [cardholderName, setCardholderName] = useState("");
    const [cardError, setCardError] = useState(null);
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

    const validateCardInfo = () => {
        if (!cardholderName.trim()) {
            setCardError(translations.cardholderNameRequired || "Tên chủ thẻ là bắt buộc");
            return false;
        }
        const cardElement = elements?.getElement(CardElement);
        if (!cardElement) {
            setCardError(translations.cardInformationRequired || "Thông tin thẻ là bắt buộc");
            return false;
        }
        setCardError(null);
        return true;
    };

    // Stripe payment processing using Stripe Elements
    const processStripePayment = async () => {
        try {
            if (!stripe || !elements) {
                throw new Error('Stripe not initialized');
            }

            const cardElement = elements.getElement(CardElement);
            if (!cardElement) {
                throw new Error('Card element not found');
            }

            // Create payment intent on backend
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const response = await fetch(`${API_URL}/api/payments/create-intent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: Math.round(calculateTotal()),
                    currency: 'vnd',
                    tour_id: null, // You may want to pass tour ID here
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create payment intent');
            }

            const { client_secret, payment_intent_id } = await response.json();

            // Create PaymentMethod using Stripe Elements (secure, PCI compliant)
            const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
                billing_details: {
                    name: cardholderName,
                },
            });

            if (pmError) {
                throw new Error(pmError.message || 'Failed to create payment method');
            }

            if (!paymentMethod) {
                throw new Error('Payment method creation failed');
            }

            // Confirm payment with PaymentMethod ID
            const confirmResponse = await fetch(`${API_URL}/api/payments/confirm-payment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    payment_intent_id: payment_intent_id,
                    payment_method_id: paymentMethod.id,
                }),
            });

            if (!confirmResponse.ok) {
                const errorData = await confirmResponse.json();
                throw new Error(errorData.message || 'Payment confirmation failed');
            }

            const confirmData = await confirmResponse.json();
            
            if (confirmData.success && confirmData.status === 'succeeded') {
                return { success: true, payment_intent_id: confirmData.payment_intent_id };
            } else {
                throw new Error(confirmData.message || 'Payment failed');
            }
        } catch (error) {
            console.error('Payment error:', error);
            return { success: false, error: error.message };
        }
    };

    const handleBookNow = async () => {
        // Prevent non-logged-in users from booking tours
        if (!isLoggedIn) {
            alert(translations.pleaseLoginToBook || "Vui lòng đăng nhập để đặt tour.");
            return;
        }

        // Prevent partners from booking tours
        if (isPartner) {
            alert(translations.partnersCannotBook || "Đối tác không thể đặt tour. Vui lòng đăng nhập bằng tài khoản khách hàng.");
            return;
        }

        // Validate user info
        if (!userInfo.fullName || !userInfo.email || !userInfo.phone) {
            alert(translations.pleaseFillAllFields || "Vui lòng điền đầy đủ thông tin");
            return;
        }

        // Validate payment method
        if (!paymentMethod) {
            alert(translations.pleaseSelectPaymentMethod || "Vui lòng chọn phương thức thanh toán");
            return;
        }

        let paymentIntentId = null;

        // Validate card info if credit card is selected
        if (paymentMethod === "card") {
            if (!validateCardInfo()) {
                alert(translations.pleaseFixCardErrors || "Vui lòng sửa các lỗi trong thông tin thẻ");
                return;
            }

            // Process Stripe payment
            const result = await processStripePayment();
            if (!result.success) {
                alert(translations.paymentFailed || "Thanh toán thất bại: " + result.error);
                return;
            }
            paymentIntentId = result.payment_intent_id;
        }

        // Save booking to database
        try {
            // Get current user ID from localStorage if logged in
            let currentUserId = null;
            try {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    const user = JSON.parse(storedUser);
                    if (user.id && user.isLoggedIn) {
                        currentUserId = user.id;
                    }
                }
            } catch (e) {
                console.log('No user logged in or error reading user:', e);
            }

            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const bookingResponse = await fetch(`${API_URL}/api/bookings/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tour_id: tourId,
                    user_id: currentUserId, // Set to null if user is not logged in (guest booking)
                    full_name: userInfo.fullName,
                    email: userInfo.email,
                    phone: userInfo.phone,
                    departure_date: startDate.toISOString().split('T')[0],
                    return_date: endDate ? endDate.toISOString().split('T')[0] : null,
                    number_of_guests: 1, // Can be calculated from adults + children + infants if needed
                    total_price: calculateTotal(),
                    payment_method: paymentMethod,
                    payment_intent_id: paymentIntentId,
                    notes: userInfo.notes || '',
                }),
            });

            if (!bookingResponse.ok) {
                const errorData = await bookingResponse.json();
                throw new Error(errorData.message || 'Failed to save booking');
            }

            const bookingData = await bookingResponse.json();
            alert(translations.bookingSuccess || "Đặt tour thành công! Mã đặt tour: " + bookingData.booking_id);
            onClose();
        } catch (error) {
            console.error('Error saving booking:', error);
            alert(translations.bookingSaveError || "Thanh toán thành công nhưng lưu đặt tour thất bại. Vui lòng liên hệ hỗ trợ.");
        }
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

            {/* Panel - Centered vertically with equal spacing from header and bottom */}
            <div className="fixed inset-y-[80px] left-1/2 -translate-x-1/2 w-full max-w-4xl max-h-[calc(100vh-160px)] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-visible z-50 flex flex-col mx-4">
                {/* Header */}
                {!isLoggedIn ? (
                    <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white p-5">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-2xl font-bold">{translations.loginRequired || "Yêu cầu đăng nhập"}</h3>
                                <p className="text-sm opacity-90 mt-2">{translations.loginRequiredMessage || "Vui lòng đăng nhập để đặt tour. Nếu chưa có tài khoản, vui lòng đăng ký."}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                            >
                                <XIcon className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                ) : isPartner ? (
                    <div className="bg-gradient-to-r from-red-600 to-red-500 text-white p-5">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-2xl font-bold">{translations.accessDenied || "Không thể đặt tour"}</h3>
                                <p className="text-sm opacity-90 mt-2">{translations.partnersCannotBookMessage || "Tài khoản đối tác không thể đặt tour. Vui lòng đăng nhập bằng tài khoản khách hàng."}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                            >
                                <XIcon className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                ) : (
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
                )}

                {isLoggedIn && !isPartner && (
                    <>
                        {/* Booking Content - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-6 pt-8 space-y-6 pb-8">
                    {/* Date Selection */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Departure Date */}
                        <div>
                            <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                                <CalendarIcon className="w-4 h-4" />
                                {translations.panelDepartureDate}
                            </Label>
                            <Popover 
                                open={openDeparture} 
                                onOpenChange={(open) => {
                                    setOpenDeparture(open);
                                }}
                            >
                                <PopoverTrigger asChild>
                                    <div className="relative">
                                        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            readOnly
                                            value={formatDate(startDate, translations)}
                                            onClick={() => setOpenDeparture(true)}
                                            className={`w-full h-11 pl-10 rounded-md cursor-pointer font-medium
                                                bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                                border-2 ${
                                                    openDeparture
                                                        ? "ring-2 ring-blue-500 border-blue-500"
                                                        : "border-gray-300 dark:border-gray-600"
                                                }
                                                focus:outline-none`}
                                        />
                                    </div>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-auto p-0 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-500 z-[60]"
                                    align="start"
                                    onInteractOutside={(e) => {
                                        // Close when clicking outside
                                        setOpenDeparture(false);
                                    }}
                                >
                                    <Calendar
                                        mode="single"
                                        selected={startDate}
                                        onSelect={(date) => {
                                            if (date) {
                                                const newDate = new Date(date);
                                                newDate.setHours(0, 0, 0, 0);
                                                setStartDate(newDate);
                                                setOpenDeparture(false);
                                            }
                                        }}
                                        disabled={(date) => isDateBeforeToday(date)}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Return Date - Auto-calculated */}
                        <div>
                            <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                                <CalendarIcon className="w-4 h-4" />
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
                            {translations.paymentMethod || "Phương thức thanh toán"} <span className="text-red-500">*</span>
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

                        {/* Card Information Form - Show only when credit card is selected */}
                        {paymentMethod === "card" && (
                            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                <h5 className="text-sm font-semibold mb-4 text-gray-900 dark:text-white">
                                    {translations.cardInformation || "Thông tin thẻ"}
                                </h5>
                                <div className="space-y-4">
                                    {/* Cardholder Name */}
                                    <div>
                                        <Label htmlFor="cardholderName" className="text-sm font-medium mb-2">
                                            {translations.cardholderName || "Tên chủ thẻ"} <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="cardholderName"
                                            type="text"
                                            placeholder={translations.enterCardholderName || "Nhập tên chủ thẻ"}
                                            value={cardholderName}
                                            onChange={(e) => {
                                                setCardholderName(e.target.value);
                                                if (cardError) setCardError(null);
                                            }}
                                            className="h-11"
                                        />
                                    </div>

                                    {/* Stripe CardElement */}
                                    <div>
                                        <Label className="text-sm font-medium mb-2">
                                            {translations.cardNumber || "Thông tin thẻ"} <span className="text-red-500">*</span>
                                        </Label>
                                        <div className="h-11 px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700">
                                            <CardElement
                                                options={{
                                                    style: {
                                                        base: {
                                                            fontSize: '16px',
                                                            color: '#424770',
                                                            '::placeholder': {
                                                                color: '#aab7c4',
                                                            },
                                                        },
                                                        invalid: {
                                                            color: '#9e2146',
                                                        },
                                                    },
                                                }}
                                                onChange={(e) => {
                                                    if (e.error) {
                                                        setCardError(e.error.message);
                                                    } else {
                                                        setCardError(null);
                                                    }
                                                }}
                                            />
                                        </div>
                                        {cardError && (
                                            <p className="text-xs text-red-500 mt-1">{cardError}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
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
                        onClick={handleBookNow}
                        disabled={!userInfo.fullName || !userInfo.email || !userInfo.phone || !paymentMethod}
                    >
                        {paymentMethod === "card" ? (
                            <CreditCard className="w-4 h-4 mr-2" />
                        ) : paymentMethod === "momo" ? (
                            <Wallet className="w-4 h-4 mr-2" />
                        ) : null}
                        <span className="text-white font-semibold">{translations.bookNow}</span>
                    </Button>

                    <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                        💡 {translations.panelPriceIncludesTax || "Giá đã bao gồm thuế và phí dịch vụ"}
                    </p>
                </div>
                    </>
                )}
            </div> {/* close Panel */}
        </>
    );
}

// Main component that wraps BookingForm with Elements provider
export function BookingPanel({ basePrice, isOpen, onClose, duration, tourId }) {
    if (!isOpen) return null;

    const { translations } = useLanguage();

    return (
        <Elements stripe={stripePromise}>
            <BookingForm 
                basePrice={basePrice} 
                onClose={onClose} 
                duration={duration} 
                tourId={tourId}
                translations={translations} 
            />
        </Elements>
    );
}
