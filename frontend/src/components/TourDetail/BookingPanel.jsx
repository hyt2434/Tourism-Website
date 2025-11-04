import { useState } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
    Plus,
    Minus,
    CheckCircle,
    X as XIcon,
    Calendar,
    Users,
    Hotel,
    MapPin,
    CreditCard,
} from "lucide-react";
import { Calendar as CalendarComponent } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

const formatDate = (date) => {
    if (!date) return "Chọn ngày";
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

export function BookingPanel({ basePrice, isOpen, onClose }) {
    if (!isOpen) return null;
    // Booking states
    const [guests, setGuests] = useState(2);
    const [rooms, setRooms] = useState(1);
    const [startDate, setStartDate] = useState(new Date(2025, 10, 15));
    const [endDate, setEndDate] = useState(new Date(2025, 10, 20));
    const [selectedAttractions, setSelectedAttractions] = useState([
        "halong-bay",
        "old-quarter",
    ]);

    // Customization states
    const [additionalServices, setAdditionalServices] = useState([
        {
            id: "photo",
            name: "Chụp ảnh chuyên nghiệp",
            price: 150,
            category: "premium",
        },
        {
            id: "cooking",
            name: "Lớp học nấu ăn",
            price: 80,
            category: "experience",
        },
        {
            id: "spa",
            name: "Spa & Massage",
            price: 120,
            category: "wellness",
        },
        {
            id: "bike",
            name: "Tour xe đạp",
            price: 60,
            category: "adventure",
        },
    ]);

    const attractions = [
        { id: "halong-bay", name: "Du thuyền Vịnh Hạ Long", price: 120 },
        { id: "old-quarter", name: "Tour Phố Cổ Hà Nội", price: 40 },
        { id: "temple", name: "Văn Miếu Quốc Tử Giám", price: 30 },
        { id: "water-puppet", name: "Múa rối nước", price: 25 },
    ];


    const [removableServices, setRemovableServices] = useState([
        { id: "hotel-upgrade", name: "Hạ cấp khách sạn", discount: 100 },
        { id: "cruise-meal", name: "Bỏ bữa ăn trên tàu", discount: 60 },
        { id: "entrance-fees", name: "Bỏ một số điểm tham quan", discount: 40 },
    ]);

    const toggleAdditionalService = (serviceId) => {
        setAdditionalServices((prev) =>
            prev.map((service) =>
                service.id === serviceId
                    ? { ...service, selected: !service.selected }
                    : service
            )
        );
    };

    const toggleRemovableService = (serviceId) => {
        setRemovableServices((prev) =>
            prev.map((service) =>
                service.id === serviceId
                    ? { ...service, removed: !service.removed }
                    : service
            )
        );
    };

    const calculateTotal = () => {
        let total = basePrice * guests;
        total += rooms * 80;

        selectedAttractions.forEach((id) => {
            const attraction = attractions.find((a) => a.id === id);
            if (attraction) total += attraction.price * guests;
        });

        const days =
            startDate && endDate
                ? Math.ceil(
                    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
                )
                : 5;
        total = total * days;

        // Thêm dịch vụ bổ sung
        additionalServices.forEach((service) => {
            if (service.selected) total += service.price * days;
        });

        // Trừ giảm giá
        removableServices.forEach((service) => {
            if (service.removed) total -= service.discount * days;
        });

        return total;
    };

    const getCategoryColor = (category) => {
        const colors = {
            premium: "bg-purple-100 text-purple-700",
            experience: "bg-blue-100 text-blue-700",
            wellness: "bg-green-100 text-green-700",
            adventure: "bg-orange-100 text-orange-700",
        };
        return colors[category] || "bg-gray-100 text-gray-700";
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 flex flex-col mx-4">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-5">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-2xl font-bold">Đặt Tour</h3>
                            <p className="text-sm opacity-90">Tùy chỉnh & đặt ngay</p>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="text-right">
                                <p className="text-xs opacity-90">Từ</p>
                                <p className="text-3xl font-bold">${basePrice}</p>
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

                {/* Tabs Content - Scrollable */}
                <div className="flex-1 overflow-y-auto">
                    <Tabs defaultValue="booking" className="w-full">
                        <TabsList className="w-full grid grid-cols-2 sticky top-0 z-10 bg-white rounded-none">
                            <TabsTrigger value="booking">Đặt tour</TabsTrigger>
                            <TabsTrigger value="customize">Tùy chỉnh</TabsTrigger>
                        </TabsList>

                        {/* Tab Đặt Tour */}
                        <TabsContent value="booking" className="p-6 m-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Cột trái */}
                                <div className="space-y-4">
                                    {/* Số khách */}
                                    <div>
                                        <label className="text-sm font-medium flex items-center gap-2 mb-2">
                                            <Users className="w-4 h-4" />
                                            Số khách
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setGuests(Math.max(1, guests - 1))}
                                            >
                                                -
                                            </Button>
                                            <span className="text-lg font-semibold w-12 text-center">
                                                {guests}
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setGuests(guests + 1)}
                                            >
                                                +
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Số phòng */}
                                    <div>
                                        <label className="text-sm font-medium flex items-center gap-2 mb-2">
                                            <Hotel className="w-4 h-4" />
                                            Số phòng
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setRooms(Math.max(1, rooms - 1))}
                                            >
                                                -
                                            </Button>
                                            <span className="text-lg font-semibold w-12 text-center">
                                                {rooms}
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setRooms(rooms + 1)}
                                            >
                                                +
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Cột phải */}
                                <div className="space-y-4">
                                    {/* Ngày bắt đầu */}
                                    <div>
                                        <label className="text-sm font-medium flex items-center gap-2 mb-2">
                                            <Calendar className="w-4 h-4" />
                                            Ngày khởi hành
                                        </label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-full justify-start">
                                                    {formatDate(startDate)}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <CalendarComponent
                                                    mode="single"
                                                    selected={startDate}
                                                    onSelect={setStartDate}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    {/* Ngày kết thúc */}
                                    <div>
                                        <label className="text-sm font-medium flex items-center gap-2 mb-2">
                                            <Calendar className="w-4 h-4" />
                                            Ngày về
                                        </label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-full justify-start">
                                                    {formatDate(endDate)}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <CalendarComponent
                                                    mode="single"
                                                    selected={endDate}
                                                    onSelect={setEndDate}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Tab Tùy chỉnh */}
                        <TabsContent value="customize" className="p-6 m-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Cột trái - Điểm tham quan */}
                                <div className="space-y-4">
                                    {/* Điểm tham quan đặc trưng của tour */}
                                    <div>
                                        <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
                                            <MapPin className="w-5 h-5 text-blue-600" />
                                            Điểm tham quan đặc trưng
                                        </h4>
                                        <div className="space-y-2">
                                            {attractions.map((attr) => (
                                                <div
                                                    key={attr.id}
                                                    className={`border rounded-lg p-3 cursor-pointer transition-all ${selectedAttractions.includes(attr.id)
                                                            ? "border-blue-500 bg-blue-50"
                                                            : "border-gray-200 hover:border-gray-300"
                                                        }`}
                                                    onClick={() => {
                                                        if (selectedAttractions.includes(attr.id)) {
                                                            setSelectedAttractions(
                                                                selectedAttractions.filter((id) => id !== attr.id)
                                                            );
                                                        } else {
                                                            setSelectedAttractions([...selectedAttractions, attr.id]);
                                                        }
                                                    }}
                                                >
                                                    <div className="flex items-center justify-between gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium">{attr.name}</p>
                                                        </div>
                                                        <div className="text-right flex-shrink-0">
                                                            <p className="text-sm font-semibold text-blue-600">
                                                                ${attr.price}
                                                            </p>
                                                            <div
                                                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 ${selectedAttractions.includes(attr.id)
                                                                        ? "bg-blue-500 border-blue-500"
                                                                        : "border-gray-300"
                                                                    }`}
                                                            >
                                                                {selectedAttractions.includes(attr.id) && (
                                                                    <CheckCircle className="w-3 h-3 text-white" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Cột phải - Dịch vụ thêm/bớt */}
                                <div className="space-y-4">
                                    {/* Dịch vụ bổ sung */}
                                    <div>
                                        <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
                                            <Plus className="w-4 h-4 text-green-600" />
                                            Dịch vụ bổ sung
                                        </h4>
                                        <div className="space-y-2">
                                            {additionalServices.map((service) => (
                                                <div
                                                    key={service.id}
                                                    className={`border rounded-lg p-3 cursor-pointer transition-all ${service.selected
                                                            ? "border-green-500 bg-green-50"
                                                            : "border-gray-200 hover:border-gray-300"
                                                        }`}
                                                    onClick={() => toggleAdditionalService(service.id)}
                                                >
                                                    <div className="flex items-center justify-between gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium truncate">
                                                                {service.name}
                                                            </p>
                                                            <Badge
                                                                variant="secondary"
                                                                className={`text-xs mt-1 ${getCategoryColor(
                                                                    service.category
                                                                )}`}
                                                            >
                                                                {service.category === "premium" && "Premium"}
                                                                {service.category === "experience" && "Trải nghiệm"}
                                                                {service.category === "wellness" && "Sức khỏe"}
                                                                {service.category === "adventure" && "Phiêu lưu"}
                                                            </Badge>
                                                        </div>
                                                        <div className="text-right flex-shrink-0">
                                                            <p className="text-sm font-semibold text-green-600">
                                                                +${service.price}
                                                            </p>
                                                            <div
                                                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 ${service.selected
                                                                        ? "bg-green-500 border-green-500"
                                                                        : "border-gray-300"
                                                                    }`}
                                                            >
                                                                {service.selected && (
                                                                    <CheckCircle className="w-3 h-3 text-white" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Dịch vụ loại bỏ */}
                                    <div>
                                        <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
                                            <Minus className="w-4 h-4 text-red-600" />
                                            Giảm chi phí
                                        </h4>
                                        <div className="space-y-2">
                                            {removableServices.map((service) => (
                                                <div
                                                    key={service.id}
                                                    className={`border rounded-lg p-3 cursor-pointer transition-all ${service.removed
                                                            ? "border-red-500 bg-red-50"
                                                            : "border-gray-200 hover:border-gray-300"
                                                        }`}
                                                    onClick={() => toggleRemovableService(service.id)}
                                                >
                                                    <div className="flex items-center justify-between gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium truncate">
                                                                {service.name}
                                                            </p>
                                                        </div>
                                                        <div className="text-right flex-shrink-0">
                                                            <p className="text-sm font-semibold text-red-600">
                                                                -${service.discount}
                                                            </p>
                                                            <div
                                                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 ${service.removed
                                                                        ? "bg-red-500 border-red-500"
                                                                        : "border-gray-300"
                                                                    }`}
                                                            >
                                                                {service.removed && (
                                                                    <X className="w-3 h-3 text-white" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Footer - Sticky */}
                <div className="border-t bg-white p-4 space-y-3">
                    {/* Tổng cộng */}
                    <div className="flex justify-between items-center">
                        <span className="font-semibold">Tổng cộng:</span>
                        <span className="text-2xl font-bold text-primary">
                            ${calculateTotal()}
                        </span>
                    </div>

                    {/* Nút đặt tour */}
                    <Button className="w-full" size="lg">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Đặt ngay
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                        💡 Giá đã bao gồm thuế và phí dịch vụ
                    </p>
                </div>
            </div>
        </>
    );
}
