import { useState, useEffect, Fragment } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import {
    X as XIcon,
    Calendar as CalendarIcon,
    Users,
    Hotel,
    Utensils,
    Car,
    ChevronRight,
    ChevronLeft,
    Check,
    ArrowUp,
    Wallet,
    CreditCard,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { createBooking } from "../../api/bookings";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Inner component with Stripe hooks
function EnhancedBookingForm({ 
    isOpen, 
    onClose, 
    tourId, 
    tourData,
    basePrice 
}) {
    const { translations } = useLanguage();
    const stripe = useStripe();
    const elements = useElements();
    
    // Booking flow steps
    const [currentStep, setCurrentStep] = useState(1); // 1: Date & People, 2: Customize, 3: Confirm
    
    // Step 1: Date and People Selection
    const [schedules, setSchedules] = useState([]);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [numberOfPeople, setNumberOfPeople] = useState(1);
    const [loadingSchedules, setLoadingSchedules] = useState(false);
    
    // Step 2: Customization Options
    const [roomUpgrade, setRoomUpgrade] = useState(null); // null or { room_id, upgrade_price }
    const [availableRoomUpgrades, setAvailableRoomUpgrades] = useState([]);
    const [selectedMeals, setSelectedMeals] = useState({}); // { day_1_morning: true, day_1_noon: false, ... }
    const [transportOptions, setTransportOptions] = useState({
        outbound: true,  // A to B
        return: true     // B to A
    });
    
    // Step 3: User Info & Payment
    const [userInfo, setUserInfo] = useState({
        fullName: "",
        email: "",
        phone: "",
        notes: ""
    });
    const [paymentMethod, setPaymentMethod] = useState(null); // null, "card", or "momo"
    const [cardholderName, setCardholderName] = useState("");
    const [cardError, setCardError] = useState(null);
    
    // Price calculation
    const [calculatedPrice, setCalculatedPrice] = useState(basePrice);
    const [priceBreakdown, setPriceBreakdown] = useState({
        base: basePrice,
        roomUpgrade: 0,
        meals: 0,
        transportation: 0,
        serviceFee: 0,
        total: basePrice
    });

    // Load schedules when modal opens
    useEffect(() => {
        if (isOpen && tourId) {
            loadSchedules();
            initializeMealSelections();
        }
    }, [isOpen, tourId]);

    const loadSchedules = async () => {
        setLoadingSchedules(true);
        try {
            const response = await fetch(`${API_URL}/api/tours/${tourId}/schedules`);
            const data = await response.json();
            // Filter only future schedules with available slots
            const futureSchedules = data.filter(s => {
                const depDate = new Date(s.departure_datetime);
                return depDate > new Date() && s.slots_available > 0;
            });
            setSchedules(futureSchedules);
        } catch (error) {
            console.error("Error loading schedules:", error);
        } finally {
            setLoadingSchedules(false);
        }
    };

    const initializeMealSelections = () => {
        // Initialize all meals as selected by default
        if (!tourData?.selectedSetMeals) return;
        
        const selections = {};
        tourData.selectedSetMeals.forEach(meal => {
            const key = `day_${meal.day_number}_${meal.meal_session}`;
            selections[key] = true; // All selected by default
        });
        setSelectedMeals(selections);
    };

    // Load available room upgrades when people count changes
    useEffect(() => {
        if (numberOfPeople > 0 && tourData?.services?.accommodation) {
            loadRoomUpgrades();
        }
    }, [numberOfPeople, tourData]);

    const loadRoomUpgrades = async () => {
        if (!tourData?.services?.accommodation?.service_id) return;
        
        try {
            const response = await fetch(
                `${API_URL}/api/tours/accommodation/${tourData.services.accommodation.service_id}/rooms`
            );
            const rooms = await response.json();
            
            // Get current room type from tour (should be Standard)
            const currentRoom = tourData.roomBookings?.[0];
            if (!currentRoom) return;
            
            // Build upgrade options from the room's upgrade price fields
            const upgrades = [];
            
            // Find Standard and Quad rooms
            const standardRoom = rooms.find(room => 
                room.is_available && room.room_type === 'Standard'
            );
            
            const quadRoom = rooms.find(room =>
                room.is_available && room.room_type === 'Standard Quad'
            );
            
            if (standardRoom) {
                // Add Deluxe upgrade option if price exists
                if (standardRoom.deluxe_upgrade_price && standardRoom.deluxe_upgrade_price > 0) {
                    upgrades.push({
                        id: `deluxe_${standardRoom.id}`,
                        room_type: 'Deluxe',
                        bed_type: standardRoom.bed_type,
                        room_size: standardRoom.room_size,
                        base_price: parseFloat(currentRoom.base_price) + parseFloat(standardRoom.deluxe_upgrade_price),
                        upgrade_price: parseFloat(standardRoom.deluxe_upgrade_price),
                        is_available: true,
                        amenities: standardRoom.amenities,
                        description: 'Nâng cấp tất cả phòng lên Deluxe'
                    });
                }
                
                // Add Suite upgrade option if price exists
                if (standardRoom.suite_upgrade_price && standardRoom.suite_upgrade_price > 0) {
                    upgrades.push({
                        id: `suite_${standardRoom.id}`,
                        room_type: 'Suite',
                        bed_type: standardRoom.bed_type,
                        room_size: standardRoom.room_size,
                        base_price: parseFloat(currentRoom.base_price) + parseFloat(standardRoom.suite_upgrade_price),
                        upgrade_price: parseFloat(standardRoom.suite_upgrade_price),
                        is_available: true,
                        amenities: standardRoom.amenities,
                        description: 'Nâng cấp tất cả phòng lên Suite'
                    });
                }
            }
            
            // Add Quad room option if there are 4+ people
            if (quadRoom && numberOfPeople >= 4) {
                const numQuadRooms = Math.floor(numberOfPeople / 4);
                const remainingPeople = numberOfPeople % 4;
                const numStandardRooms = remainingPeople > 0 ? Math.ceil(remainingPeople / 2) : 0;
                
                let description = '';
                if (numQuadRooms > 0 && numStandardRooms > 0) {
                    description = `${numQuadRooms} phòng Quad (4 người) + ${numStandardRooms} phòng Standard (2 người)`;
                } else if (numQuadRooms > 0) {
                    description = `${numQuadRooms} phòng Quad (4 người)`;
                }
                
                upgrades.push({
                    id: `quad_${quadRoom.id}`,
                    room_type: 'Standard Quad',
                    bed_type: quadRoom.bed_type,
                    room_size: quadRoom.room_size,
                    base_price: quadRoom.base_price,
                    upgrade_price: 0, // Will calculate in price calculation
                    is_available: true,
                    amenities: quadRoom.amenities,
                    description: description,
                    numQuadRooms: numQuadRooms,
                    numStandardRooms: numStandardRooms
                });
            }
            
            setAvailableRoomUpgrades(upgrades);
        } catch (error) {
            console.error("Error loading room upgrades:", error);
        }
    };

    // Calculate price whenever selections change
    useEffect(() => {
        calculateTotalPrice();
    }, [numberOfPeople, roomUpgrade, selectedMeals, transportOptions]);

    const calculateTotalPrice = () => {
        if (!tourData) return;
        
        // Base price shown on tour card is for 2 people (includes room + services for 2)
        // We need to break it down into room cost and per-person cost
        const roomCostPerRoom = tourData.roomBookings?.[0]?.base_price || 0;
        const numNights = tourData.duration ? Math.max(1, tourData.duration - 1) : 1;
        const totalRoomCostFor2People = roomCostPerRoom * numNights;
        
        // Per-person cost (excluding room) = (basePrice - roomCost) / 2
        const basePriceFor2People = basePrice * 2; // Base price is per person, but designed for 2
        const perPersonCostExcludingRoom = (basePriceFor2People - totalRoomCostFor2People) / 2;
        
        // Now calculate total based on actual people
        const roomsNeeded = Math.ceil(numberOfPeople / 2);
        
        // Total = (per-person services × people) + (room cost × rooms)
        let total = (perPersonCostExcludingRoom * numberOfPeople) + (roomCostPerRoom * roomsNeeded * numNights);
        
        const breakdown = {
            base: total,
            roomUpgrade: 0,
            meals: 0,
            transportation: 0,
            serviceFee: 0,
            total: 0
        };
        
        // Calculate room upgrade cost
        if (roomUpgrade && tourData.roomBookings?.[0]) {
            const numNights = tourData.duration ? Math.max(1, tourData.duration - 1) : 1;
            const currentRoomPrice = tourData.roomBookings[0].base_price || 0;
            
            // Check if this is a quad room option
            if (roomUpgrade.room_type === 'Standard Quad') {
                const numQuadRooms = roomUpgrade.numQuadRooms || 0;
                const numStandardRooms = roomUpgrade.numStandardRooms || 0;
                const quadRoomPrice = roomUpgrade.base_price || 0;
                
                // Calculate total cost of quad + standard combination
                const quadComboCost = (quadRoomPrice * numQuadRooms + currentRoomPrice * numStandardRooms) * numNights;
                
                // Calculate cost of all standard rooms
                const allStandardRooms = Math.ceil(numberOfPeople / 2);
                const allStandardCost = currentRoomPrice * allStandardRooms * numNights;
                
                // Price difference (could be positive or negative)
                breakdown.roomUpgrade = quadComboCost - allStandardCost;
                total += breakdown.roomUpgrade;
            } else {
                // Regular upgrade (Deluxe or Suite)
                const numRooms = Math.ceil(numberOfPeople / 2); // 2 people per room
                const upgradeRoomPrice = roomUpgrade.base_price || 0;
                
                // Only pay the difference between current and upgrade room
                const priceDiff = upgradeRoomPrice - currentRoomPrice;
                breakdown.roomUpgrade = priceDiff * numRooms * numNights;
                total += breakdown.roomUpgrade;
            }
        }
        
        // Calculate meal deductions for unselected meals
        if (tourData.selectedSetMeals && tourData.selectedSetMeals.length > 0) {
            let totalMealDeduction = 0;
            
            tourData.selectedSetMeals.forEach(meal => {
                const key = `day_${meal.day_number}_${meal.meal_session}`;
                if (!selectedMeals[key]) {
                    // Each set meal price is now per person
                    const pricePerPerson = meal.total_price || 0;
                    totalMealDeduction += pricePerPerson * numberOfPeople;
                }
            });
            
            breakdown.meals = -totalMealDeduction;
            total -= totalMealDeduction;
        }
        
        // Calculate transportation deduction based on selected trips
        if (tourData.services?.transportation) {
            const transportPricePerPerson = tourData.services.transportation.price_per_person || 0;
            let tripsIncluded = 0;
            if (transportOptions.outbound) tripsIncluded++;
            if (transportOptions.return) tripsIncluded++;
            
            // If not using all trips (2), calculate deduction
            const tripsNotUsed = 2 - tripsIncluded;
            if (tripsNotUsed > 0) {
                const transportDeduction = transportPricePerPerson * numberOfPeople * tripsNotUsed;
                breakdown.transportation = -transportDeduction;
                total -= transportDeduction;
            }
        }
        
        // Add 10% service fee
        const serviceFee = total * 0.1;
        breakdown.serviceFee = serviceFee;
        total += serviceFee;
        
        breakdown.total = Math.max(0, total);
        
        setPriceBreakdown(breakdown);
        setCalculatedPrice(breakdown.total);
    };

    const handleNext = () => {
        if (currentStep === 1) {
            if (!selectedSchedule || numberOfPeople < 1) {
                alert("Vui lòng chọn ngày khởi hành và số lượng người");
                return;
            }
            if (numberOfPeople > selectedSchedule.slots_available) {
                alert(`Chỉ còn ${selectedSchedule.slots_available} chỗ trống`);
                return;
            }
        }
        setCurrentStep(currentStep + 1);
    };

    const handleBack = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleSubmit = async () => {
        // Validate user info
        if (!userInfo.fullName || !userInfo.email || !userInfo.phone) {
            alert("Vui lòng điền đầy đủ thông tin");
            return;
        }
        
        // Validate payment method
        if (!paymentMethod) {
            alert("Vui lòng chọn phương thức thanh toán");
            return;
        }

        // Validate card details if card payment
        if (paymentMethod === "card") {
            if (!cardholderName.trim()) {
                alert("Vui lòng nhập tên chủ thẻ");
                return;
            }
            if (!stripe || !elements) {
                alert("Stripe chưa được khởi tạo. Vui lòng thử lại.");
                return;
            }
        }
        
        try {
            let paymentIntentId = null;

            // Process Stripe payment if card method
            if (paymentMethod === "card") {
                const cardElement = elements.getElement(CardElement);
                
                // Create payment method
                const { error: pmError, paymentMethod: pm } = await stripe.createPaymentMethod({
                    type: 'card',
                    card: cardElement,
                    billing_details: {
                        name: cardholderName,
                        email: userInfo.email,
                    },
                });

                if (pmError) {
                    throw new Error(pmError.message || 'Failed to create payment method');
                }

                if (!pm) {
                    throw new Error('Payment method creation failed');
                }

                // TODO: Call backend to create payment intent and confirm payment
                // For now, we'll use the payment method ID
                paymentIntentId = pm.id;
            }

            // Get user ID from localStorage if logged in
            const userStr = localStorage.getItem('user');
            const userId = userStr ? JSON.parse(userStr).id : null;
            
            // Calculate slots needed based on rooms (2 people per room)
            const roomsNeeded = Math.ceil(numberOfPeople / 2);
            const slotsNeeded = roomsNeeded * 2; // Each room takes 2 slots
            
            // Create booking data
            const bookingData = {
                tour_id: tourId,
                tour_schedule_id: selectedSchedule.id,
                user_id: userId,
                full_name: userInfo.fullName,
                email: userInfo.email,
                phone: userInfo.phone,
                departure_date: selectedSchedule.departure_datetime,
                return_date: selectedSchedule.return_datetime,
                number_of_guests: numberOfPeople, // Actual number of people
                number_of_adults: numberOfPeople, // Actual number of people
                number_of_children: 0,
                total_price: calculatedPrice,
                payment_method: paymentMethod,
                payment_intent_id: paymentIntentId,
                notes: userInfo.notes,
                customizations: {
                    room_upgrade: roomUpgrade ? {
                        room_id: roomUpgrade.id,
                        room_price: roomUpgrade.base_price,
                        upgrade_price: roomUpgrade.upgrade_price
                    } : null,
                    default_room: !roomUpgrade && tourData.roomBookings?.[0] ? {
                        room_id: tourData.roomBookings[0].room_id,
                        room_price: tourData.roomBookings[0].base_price
                    } : null,
                    selected_meals: Object.entries(selectedMeals)
                        .filter(([_, selected]) => selected)
                        .map(([key, _]) => {
                            const parts = key.split('_');
                            return {
                                day_number: parseInt(parts[1]),
                                meal_session: parts[2]
                            };
                        }),
                    transport_options: transportOptions,
                    actual_people_count: numberOfPeople // Store actual people count in customizations
                }
            };
            
            // Submit booking
            const result = await createBooking(bookingData);
            
            if (result.success) {
                alert(`Đặt tour thành công!\n\nMã đặt tour: ${result.booking_id}\nChúng tôi đã gửi email xác nhận đến ${userInfo.email}`);
                onClose();
                // Optionally redirect to booking confirmation page
                // window.location.href = `/bookings/${result.booking_id}`;
            } else {
                throw new Error(result.message || 'Booking failed');
            }
        } catch (error) {
            console.error('Booking error:', error);
            alert(`Đặt tour thất bại: ${error.message}`);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-24">
            <div className="relative w-full max-w-6xl max-h-[calc(100vh-12rem)] bg-white dark:bg-gray-900 rounded-lg shadow-xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Đặt tour
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Bước {currentStep}/3
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    >
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="flex items-center justify-center px-6 py-4 bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-2 max-w-2xl w-full">
                    {[
                        { num: 1, label: 'Ngày & Số người' },
                        { num: 2, label: 'Tùy chỉnh' },
                        { num: 3, label: 'Xác nhận' }
                    ].map((step, idx) => (
                        <Fragment key={step.num}>
                            <div className="flex flex-col items-center" style={{ width: '100px' }}>
                                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                                    currentStep >= step.num 
                                        ? 'bg-blue-500 text-white' 
                                        : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                }`}>
                                    {currentStep > step.num ? <Check className="w-5 h-5" /> : step.num}
                                </div>
                                <span className="text-xs mt-1 text-center text-gray-600 dark:text-gray-400 font-medium whitespace-nowrap">
                                    {step.label}
                                </span>
                            </div>
                            {idx < 2 && (
                                <div className={`flex-1 h-1 ${
                                    currentStep > step.num 
                                        ? 'bg-blue-500' 
                                        : 'bg-gray-300 dark:bg-gray-700'
                                }`} />
                            )}
                        </Fragment>
                    ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {currentStep === 1 && (
                        <Step1DatePeople
                            schedules={schedules}
                            selectedSchedule={selectedSchedule}
                            setSelectedSchedule={setSelectedSchedule}
                            numberOfPeople={numberOfPeople}
                            setNumberOfPeople={setNumberOfPeople}
                            loadingSchedules={loadingSchedules}
                            tourData={tourData}
                        />
                    )}

                    {currentStep === 2 && (
                        <Step2Customize
                            numberOfPeople={numberOfPeople}
                            tourData={tourData}
                            roomUpgrade={roomUpgrade}
                            setRoomUpgrade={setRoomUpgrade}
                            availableRoomUpgrades={availableRoomUpgrades}
                            selectedMeals={selectedMeals}
                            setSelectedMeals={setSelectedMeals}
                            transportOptions={transportOptions}
                            setTransportOptions={setTransportOptions}
                            priceBreakdown={priceBreakdown}
                        />
                    )}

                    {currentStep === 3 && (
                        <Step3Confirm
                            userInfo={userInfo}
                            setUserInfo={setUserInfo}
                            paymentMethod={paymentMethod}
                            setPaymentMethod={setPaymentMethod}
                            cardholderName={cardholderName}
                            setCardholderName={setCardholderName}
                            cardError={cardError}
                            setCardError={setCardError}
                            selectedSchedule={selectedSchedule}
                            numberOfPeople={numberOfPeople}
                            roomUpgrade={roomUpgrade}
                            selectedMeals={selectedMeals}
                            transportOptions={transportOptions}
                            priceBreakdown={priceBreakdown}
                            tourData={tourData}
                        />
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <div className="text-left">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Tổng tiền</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {calculatedPrice.toLocaleString()} VND
                        </p>
                    </div>
                    <div className="flex gap-3">
                        {currentStep > 1 && (
                            <Button
                                variant="outline"
                                onClick={handleBack}
                            >
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                Quay lại
                            </Button>
                        )}
                        {currentStep < 3 ? (
                            <Button onClick={handleNext}>
                                Tiếp tục
                                <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        ) : (
                            <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                                Xác nhận đặt tour
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Step 1: Date and People Selection
function Step1DatePeople({ 
    schedules, 
    selectedSchedule, 
    setSelectedSchedule, 
    numberOfPeople, 
    setNumberOfPeople,
    loadingSchedules,
    tourData
}) {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-4 text-center">Chọn ngày khởi hành</h3>
                {loadingSchedules ? (
                    <p className="text-gray-500 text-center">Đang tải lịch trình...</p>
                ) : schedules.length === 0 ? (
                    <p className="text-gray-500 text-center">Không có lịch trình khả dụng</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                        {schedules.map((schedule) => {
                            const depDate = new Date(schedule.departure_datetime);
                            const retDate = new Date(schedule.return_datetime);
                            
                            return (
                                <div
                                    key={schedule.id}
                                    onClick={() => setSelectedSchedule(schedule)}
                                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                        selectedSchedule?.id === schedule.id
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                                    }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <CalendarIcon className="w-4 h-4 text-blue-500" />
                                                <span className="font-semibold">
                                                    {depDate.toLocaleDateString('vi-VN')}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Về: {retDate.toLocaleDateString('vi-VN')}
                                            </p>
                                        </div>
                                        <Badge variant={schedule.slots_available > 10 ? "default" : "destructive"}>
                                            {schedule.slots_available} chỗ trống
                                        </Badge>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div>
                <Label htmlFor="numberOfPeople" className="text-base font-semibold mb-2 block text-center">
                    Số lượng người
                </Label>
                {selectedSchedule && (
                    <div className="text-center mb-3">
                        <div 
                            className="inline-block rounded-md px-3 py-1 text-sm font-medium"
                            style={{ 
                                backgroundColor: selectedSchedule.slots_available > 10 ? '#22c55e' : '#ef4444',
                                color: '#ffffff',
                                border: 'none'
                            }}
                        >
                            Còn {selectedSchedule.slots_available} chỗ trống
                        </div>
                    </div>
                )}
                <div className="flex items-center justify-center gap-4 mt-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setNumberOfPeople(Math.max(1, numberOfPeople - 1))}
                        disabled={numberOfPeople <= 1}
                    >
                        -
                    </Button>
                    <Input
                        id="numberOfPeople"
                        type="number"
                        min="1"
                        max={selectedSchedule?.slots_available || 100}
                        value={numberOfPeople}
                        onChange={(e) => setNumberOfPeople(parseInt(e.target.value) || 1)}
                        className="w-24 text-center text-lg font-semibold"
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setNumberOfPeople(numberOfPeople + 1)}
                        disabled={selectedSchedule && numberOfPeople >= selectedSchedule.slots_available}
                    >
                        +
                    </Button>
                    <span className="text-gray-600 dark:text-gray-400">
                        <Users className="w-5 h-5 inline mr-1" />
                        người
                    </span>
                </div>
                {selectedSchedule && numberOfPeople > selectedSchedule.slots_available && (
                    <p className="text-red-500 text-sm mt-2 text-center">
                        Chỉ còn {selectedSchedule.slots_available} chỗ trống
                    </p>
                )}
            </div>
        </div>
    );
}

// Step 2: Customization
function Step2Customize({ 
    numberOfPeople,
    tourData,
    roomUpgrade, 
    setRoomUpgrade, 
    availableRoomUpgrades,
    selectedMeals,
    setSelectedMeals,
    transportOptions,
    setTransportOptions,
    priceBreakdown
}) {
    // Check if user has opted out of any meals
    const hasOptedOutMeals = () => {
        return Object.values(selectedMeals).some(selected => !selected);
    };
    
    // Check if user has opted out of any transport
    const hasOptedOutTransport = () => {
        return !transportOptions.outbound || !transportOptions.return;
    };
    
    const toggleMeal = (key) => {
        // Can't modify meals if transport is opted out
        if (hasOptedOutTransport()) {
            alert('Bạn không thể bỏ bữa ăn khi đã chọn không dùng một số chuyến xe. Vui lòng chọn lại tất cả chuyến xe trước.');
            return;
        }
        
        setSelectedMeals(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };
    
    const toggleTransport = (trip) => {
        // Can't modify transport if meals are opted out
        if (hasOptedOutMeals()) {
            alert('Bạn không thể bỏ chuyến xe khi đã chọn bỏ một số bữa ăn. Vui lòng chọn lại tất cả bữa ăn trước.');
            return;
        }
        
        setTransportOptions(prev => ({
            ...prev,
            [trip]: !prev[trip]
        }));
    };

    return (
        <div className="space-y-6">
            {/* Room Upgrade */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                    <Hotel className="w-5 h-5 text-purple-500" />
                    <h3 className="text-lg font-semibold">Nâng cấp phòng (tùy chọn)</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    ℹ️ Mỗi phòng cho 2 người. Số phòng: {Math.ceil(numberOfPeople / 2)}
                </p>
                
                {availableRoomUpgrades.length === 0 ? (
                    <p className="text-gray-500 text-sm">Không có tùy chọn nâng cấp</p>
                ) : (
                    <div className="space-y-3">
                        {/* Current room */}
                        <div
                            onClick={() => setRoomUpgrade(null)}
                            className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                !roomUpgrade
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-200 dark:border-gray-700'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Phòng hiện tại (Standard)</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Đã bao gồm trong giá tour
                                    </p>
                                </div>
                                {!roomUpgrade && <Check className="w-5 h-5 text-blue-500" />}
                            </div>
                        </div>

                        {/* Upgrade options */}
                        {availableRoomUpgrades.map((room) => (
                            <div
                                key={room.id}
                                onClick={() => setRoomUpgrade(room)}
                                className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                    roomUpgrade?.id === room.id
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="w-full">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium">{room.room_type}</p>
                                            {room.room_type !== 'Standard Quad' && (
                                                <ArrowUp className="w-4 h-4 text-green-500" />
                                            )}
                                        </div>
                                        
                                        {room.room_type === 'Standard Quad' ? (
                                            <>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {room.description}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                    {room.bed_type} • {room.room_size}m²
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {room.bed_type} • {room.room_size}m²
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {room.description}
                                                </p>
                                                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                                                    +{room.upgrade_price?.toLocaleString()} VND/phòng/đêm
                                                </p>
                                            </>
                                        )}
                                    </div>
                                    {roomUpgrade?.id === room.id && <Check className="w-5 h-5 text-blue-500" />}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Meal Selection */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                    <Utensils className="w-5 h-5 text-orange-500" />
                    <h3 className="text-lg font-semibold">Chọn bữa ăn</h3>
                    <p className="text-sm text-gray-500">(Bỏ chọn để giảm giá)</p>
                </div>
                
                {hasOptedOutTransport() && (
                    <p className="text-sm text-red-600 dark:text-red-400 mb-3 p-2 bg-red-50 dark:bg-red-900/20 rounded">
                        ⚠️ Không thể bỏ bữa ăn khi đã bỏ chuyến xe
                    </p>
                )}
                
                <div className="space-y-3">
                    {tourData?.selectedSetMeals && 
                        Object.entries(
                            tourData.selectedSetMeals.reduce((acc, meal) => {
                                if (!acc[meal.day_number]) acc[meal.day_number] = [];
                                acc[meal.day_number].push(meal);
                                return acc;
                            }, {})
                        ).map(([day, meals]) => {
                            const sessionOrder = { 'morning': 1, 'noon': 2, 'evening': 3 };
                            const sortedMeals = [...meals].sort((a, b) => 
                                sessionOrder[a.meal_session] - sessionOrder[b.meal_session]
                            );

                            return (
                                <div key={day} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                                    <p className="font-medium mb-2">Ngày {day}</p>
                                    <div className="space-y-2">
                                        {sortedMeals.map((meal) => {
                                            const key = `day_${meal.day_number}_${meal.meal_session}`;
                                            const isSelected = selectedMeals[key];
                                            
                                            return (
                                                <label
                                                    key={key}
                                                    className={`flex items-center gap-3 p-2 rounded ${hasOptedOutTransport() ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => toggleMeal(key)}
                                                        disabled={hasOptedOutTransport()}
                                                        className="w-4 h-4 rounded border-gray-300 disabled:opacity-50"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium">
                                                                {meal.meal_session === 'morning' ? '🌅 Sáng' : 
                                                                 meal.meal_session === 'noon' ? '☀️ Trưa' : 
                                                                 '🌙 Tối'} - {meal.set_meal_name}
                                                            </span>
                                                            <span className="text-xs text-gray-600 dark:text-gray-400">
                                                                {meal.restaurant_name}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })
                    }
                </div>
            </div>

            {/* Transportation */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                    <Car className="w-5 h-5 text-blue-500" />
                    <h3 className="text-lg font-semibold">Phương tiện di chuyển</h3>
                    <p className="text-sm text-gray-500">(Bỏ chọn để giảm giá)</p>
                </div>
                
                {tourData?.services?.transportation && (
                    <div className="space-y-3">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {tourData.services.transportation.vehicle_type} - {tourData.services.transportation.license_plate}
                        </p>
                        
                        {/* Outbound trip */}
                        <label className="flex items-center gap-3 p-3 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50">
                            <input
                                type="checkbox"
                                checked={transportOptions.outbound}
                                onChange={() => toggleTransport('outbound')}
                                disabled={hasOptedOutMeals()}
                                className="w-4 h-4 rounded border-gray-300 disabled:opacity-50"
                            />
                            <div className="flex-1">
                                <p className="font-medium">🚌 Chuyến đi ({tourData.departure_city?.name || tourData.departure_city} → {tourData.destination_city?.name || tourData.destination_city})</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Từ {tourData.departure_city?.name || tourData.departure_city} đến {tourData.destination_city?.name || tourData.destination_city}
                                </p>
                            </div>
                        </label>
                        
                        {/* Return trip */}
                        <label className="flex items-center gap-3 p-3 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50">
                            <input
                                type="checkbox"
                                checked={transportOptions.return}
                                onChange={() => toggleTransport('return')}
                                disabled={hasOptedOutMeals()}
                                className="w-4 h-4 rounded border-gray-300 disabled:opacity-50"
                            />
                            <div className="flex-1">
                                <p className="font-medium">🚌 Chuyến về ({tourData.destination_city?.name || tourData.destination_city} → {tourData.departure_city?.name || tourData.departure_city})</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Từ {tourData.destination_city?.name || tourData.destination_city} về {tourData.departure_city?.name || tourData.departure_city}
                                </p>
                            </div>
                        </label>
                        
                        {(!transportOptions.outbound || !transportOptions.return) && (
                            <p className="text-sm text-orange-600 dark:text-orange-400 mt-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
                                ⚠️ Bạn sẽ tự lo phương tiện cho chuyến đã bỏ chọn
                            </p>
                        )}
                        
                        {hasOptedOutMeals() && (
                            <p className="text-sm text-red-600 dark:text-red-400 mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded">
                                ⚠️ Không thể bỏ chuyến xe khi đã bỏ bữa ăn
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Price Summary */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h4 className="font-semibold mb-3">Chi tiết giá</h4>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span>Giá cơ bản ({numberOfPeople} người)</span>
                        <span>{priceBreakdown.base.toLocaleString()} VND</span>
                    </div>
                    {priceBreakdown.roomUpgrade > 0 && (
                        <div className="flex justify-between text-green-600 dark:text-green-400">
                            <span>+ Nâng cấp phòng</span>
                            <span>+{priceBreakdown.roomUpgrade.toLocaleString()} VND</span>
                        </div>
                    )}
                    {priceBreakdown.meals < 0 && (
                        <div className="flex justify-between text-orange-600 dark:text-orange-400">
                            <span>- Bỏ bớt bữa ăn</span>
                            <span>{priceBreakdown.meals.toLocaleString()} VND</span>
                        </div>
                    )}
                    {priceBreakdown.transportation < 0 && (
                        <div className="flex justify-between text-orange-600 dark:text-orange-400">
                            <span>- Không dùng xe tour</span>
                            <span>{priceBreakdown.transportation.toLocaleString()} VND</span>
                        </div>
                    )}
                    {priceBreakdown.serviceFee > 0 && (
                        <div className="flex justify-between text-gray-600 dark:text-gray-400">
                            <span>+ Phí dịch vụ (10%)</span>
                            <span>+{priceBreakdown.serviceFee.toLocaleString()} VND</span>
                        </div>
                    )}
                    <div className="border-t border-gray-300 dark:border-gray-600 pt-2 mt-2">
                        <div className="flex justify-between font-bold text-base">
                            <span>Tổng cộng</span>
                            <span className="text-blue-600 dark:text-blue-400">
                                {priceBreakdown.total.toLocaleString()} VND
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Step 3: Confirmation
function Step3Confirm({ 
    userInfo, 
    setUserInfo,
    paymentMethod,
    setPaymentMethod,
    cardholderName,
    setCardholderName,
    cardError,
    setCardError,
    selectedSchedule, 
    numberOfPeople,
    roomUpgrade,
    selectedMeals,
    transportOptions,
    priceBreakdown,
    tourData
}) {
    const depDate = selectedSchedule ? new Date(selectedSchedule.departure_datetime) : null;
    const retDate = selectedSchedule ? new Date(selectedSchedule.return_datetime) : null;

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-4">Thông tin liên hệ</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="fullName">Họ và tên *</Label>
                        <Input
                            id="fullName"
                            value={userInfo.fullName}
                            onChange={(e) => setUserInfo({...userInfo, fullName: e.target.value})}
                            placeholder="Nguyễn Văn A"
                        />
                    </div>
                    <div>
                        <Label htmlFor="phone">Số điện thoại *</Label>
                        <Input
                            id="phone"
                            value={userInfo.phone}
                            onChange={(e) => setUserInfo({...userInfo, phone: e.target.value})}
                            placeholder="0912345678"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                            id="email"
                            type="email"
                            value={userInfo.email}
                            onChange={(e) => setUserInfo({...userInfo, email: e.target.value})}
                            placeholder="email@example.com"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <Label htmlFor="notes">Ghi chú</Label>
                        <textarea
                            id="notes"
                            value={userInfo.notes}
                            onChange={(e) => setUserInfo({...userInfo, notes: e.target.value})}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md"
                            rows="3"
                            placeholder="Yêu cầu đặc biệt..."
                        />
                    </div>
                </div>
            </div>

            {/* Payment Method Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Wallet className="w-5 h-5" />
                    Phương thức thanh toán <span className="text-red-500">*</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Card Payment */}
                    <div
                        onClick={() => setPaymentMethod("card")}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                            paymentMethod === "card"
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
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
                                    Thẻ tín dụng/Ghi nợ
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Visa, Mastercard, JCB
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
                                : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
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
                                    Ví MoMo
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Thanh toán qua ví điện tử
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card Information Form */}
                {paymentMethod === "card" && (
                    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h5 className="text-sm font-semibold mb-4 text-gray-900 dark:text-white">
                            Thông tin thẻ
                        </h5>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="cardholderName" className="text-sm font-medium mb-2">
                                    Tên chủ thẻ <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="cardholderName"
                                    type="text"
                                    placeholder="Nhập tên chủ thẻ"
                                    value={cardholderName}
                                    onChange={(e) => {
                                        setCardholderName(e.target.value);
                                        if (cardError) setCardError(null);
                                    }}
                                    className="h-11"
                                />
                            </div>

                            <div>
                                <Label className="text-sm font-medium mb-2">
                                    Thông tin thẻ <span className="text-red-500">*</span>
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

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-semibold mb-4">Xác nhận đặt tour</h3>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Ngày khởi hành:</span>
                        <span className="font-medium">{depDate?.toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Ngày về:</span>
                        <span className="font-medium">{retDate?.toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Số người:</span>
                        <span className="font-medium">{numberOfPeople} người</span>
                    </div>
                    {roomUpgrade && (
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Phòng:</span>
                            <span className="font-medium">{roomUpgrade.room_type}</span>
                        </div>
                    )}
                    {(!transportOptions.outbound || !transportOptions.return) && (
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Phương tiện:</span>
                            <span className="font-medium text-orange-600">
                                {!transportOptions.outbound && !transportOptions.return ? 'Tự túc cả 2 chiều' : 
                                 !transportOptions.outbound ? 'Tự túc chiều đi' : 
                                 'Tự túc chiều về'}
                            </span>
                        </div>
                    )}
                    <div className="border-t border-gray-300 dark:border-gray-600 pt-3 mt-3">
                        <div className="flex justify-between text-lg font-bold">
                            <span>Tổng tiền:</span>
                            <span className="text-blue-600 dark:text-blue-400">
                                {priceBreakdown.total.toLocaleString()} VND
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Wrapper component with Stripe Elements provider
export function EnhancedBookingPanel(props) {
    return (
        <Elements stripe={stripePromise}>
            <EnhancedBookingForm {...props} />
        </Elements>
    );
}
