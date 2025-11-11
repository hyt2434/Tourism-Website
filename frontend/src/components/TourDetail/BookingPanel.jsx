// BookingPanel.jsx — Part 1 (imports, helpers, component start, header, booking tab)
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
    X,
} from "lucide-react";
import { Calendar as CalendarComponent } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useLanguage } from "../../context/LanguageContext";

const formatDate = (date, translations) => {
    if (!date) return translations.chooseDate;
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

export function BookingPanel({ basePrice, isOpen, onClose }) {
    if (!isOpen) return null;

    const { translations } = useLanguage();

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
            name: translations.servicePhoto,
            price: 150,
            category: "premium",
            selected: false,
        },
        {
            id: "cooking",
            name: translations.serviceCooking,
            price: 80,
            category: "experience",
            selected: false,
        },
        {
            id: "spa",
            name: translations.serviceSpa,
            price: 120,
            category: "wellness",
            selected: false,
        },
        {
            id: "bike",
            name: translations.serviceBike,
            price: 60,
            category: "adventure",
            selected: false,
        },
    ]);

    const attractions = [
        { id: "halong-bay", name: translations.halongCruise, price: 120 },
        { id: "old-quarter", name: translations.hanoiOldQuarter, price: 40 },
        { id: "temple", name: translations.templeOfLiterature, price: 30 },
        { id: "water-puppet", name: translations.waterPuppetShow, price: 25 },
    ];

    const [removableServices, setRemovableServices] = useState([
        {
            id: "hotel-upgrade",
            name: translations.removeHotelUpgrade,
            discount: 100,
            removed: false,
        },
        {
            id: "cruise-meal",
            name: translations.removeCruiseMeal,
            discount: 60,
            removed: false,
        },
        {
            id: "entrance-fees",
            name: translations.removeEntranceFees,
            discount: 40,
            removed: false,
        },
    ]);

    const toggleAdditionalService = (serviceId) => {
        setAdditionalServices((prev) =>
            prev.map((service) =>
                service.id === serviceId ? { ...service, selected: !service.selected } : service
            )
        );
    };

    const toggleRemovableService = (serviceId) => {
        setRemovableServices((prev) =>
            prev.map((service) =>
                service.id === serviceId ? { ...service, removed: !service.removed } : service
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
                ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
                : 5;

        total = total * days;

        additionalServices.forEach((service) => {
            if (service.selected) total += service.price * days;
        });

        removableServices.forEach((service) => {
            if (service.removed) total -= service.discount * days;
        });

        return total;
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 flex flex-col mx-4">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-5">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-2xl font-bold">{translations.panelBookTour}</h3>
                            <p className="text-sm opacity-90">{translations.panelCustomizeAndBook}</p>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="text-right">
                                <p className="text-xs opacity-90">{translations.from}</p>
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
                        <TabsList className="w-full grid grid-cols-2 sticky top-0 z-10 bg-white dark:bg-gray-800 rounded-none">
                            <TabsTrigger value="booking">{translations.panelBookTour}</TabsTrigger>
                            <TabsTrigger value="customize">{translations.panelCustomize}</TabsTrigger>
                        </TabsList>

                        {/* Tab Đặt Tour / Booking */}
                        <TabsContent value="booking" className="p-6 m-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left column */}
                                <div className="space-y-4">
                                    {/* Guests */}
                                    <div>
                                        <label className="text-sm font-medium flex items-center gap-2 mb-2">
                                            <Users className="w-4 h-4" />
                                            {translations.panelGuests}
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setGuests(Math.max(1, guests - 1))}
                                                className="dark:border-gray-700 dark:text-gray-100"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </Button>
                                            <span className="text-lg font-semibold w-12 text-center">
                                                {guests}
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setGuests(guests + 1)}
                                                className="dark:border-gray-700 dark:text-gray-100"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Rooms */}
                                    <div>
                                        <label className="text-sm font-medium flex items-center gap-2 mb-2">
                                            <Hotel className="w-4 h-4" />
                                            {translations.panelRooms}
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setRooms(Math.max(1, rooms - 1))}
                                                className="dark:border-gray-700 dark:text-gray-100"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </Button>
                                            <span className="text-lg font-semibold w-12 text-center">
                                                {rooms}
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setRooms(rooms + 1)}
                                                className="dark:border-gray-700 dark:text-gray-100"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Right column */}
                                <div className="space-y-4">
                                    {/* Start date */}
                                    <div>
                                        <label className="text-sm font-medium flex items-center gap-2 mb-2">
                                            <Calendar className="w-4 h-4" />
                                            {translations.panelDepartureDate}
                                        </label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="w-full justify-start dark:border-gray-700 dark:text-gray-100"
                                                >
                                                    {formatDate(startDate, translations)}
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

                                    {/* End date */}
                                    <div>
                                        <label className="text-sm font-medium flex items-center gap-2 mb-2">
                                            <Calendar className="w-4 h-4" />
                                            {translations.panelReturnDate}
                                        </label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="w-full justify-start dark:border-gray-700 dark:text-gray-100"
                                                >
                                                    {formatDate(endDate, translations)}
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
                        {/* Tab Tùy chỉnh / Customize */}
                        <TabsContent value="customize" className="p-6 m-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left column - Featured Attractions */}
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
                                            <MapPin className="w-5 h-5 text-blue-600" />
                                            {translations.featuredAttractions}
                                        </h4>
                                        <div className="space-y-2">
                                            {attractions.map((attr) => (
                                                <div
                                                    key={attr.id}
                                                    className={`border rounded-lg p-3 cursor-pointer transition-all ${selectedAttractions.includes(attr.id)
                                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                                                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
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
                                                                    : "border-gray-300 dark:border-gray-600"
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

                                {/* Right column - Services */}
                                <div className="space-y-4">
                                    {/* Additional Services */}
                                    <div>
                                        <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
                                            <Plus className="w-4 h-4 text-green-600" />
                                            {translations.extraServices}
                                        </h4>
                                        <div className="space-y-2">
                                            {additionalServices.map((service) => (
                                                <div
                                                    key={service.id}
                                                    className={`border rounded-lg p-3 cursor-pointer transition-all ${service.selected
                                                        ? "border-green-500 bg-green-50 dark:bg-green-900/30"
                                                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                                                        }`}
                                                    onClick={() => toggleAdditionalService(service.id)}
                                                >
                                                    <div className="flex items-center justify-between gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium truncate">
                                                                {translations[`service_${service.id}`]} {/* 👈 lấy từ file dịch */}
                                                            </p>
                                                            <Badge variant="secondary" className="text-xs mt-1">
                                                                {service.category}
                                                            </Badge>
                                                        </div>
                                                        <div className="text-right flex-shrink-0">
                                                            <p className="text-sm font-semibold text-green-600">
                                                                +${service.price}
                                                            </p>
                                                            <div
                                                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 ${service.selected
                                                                    ? "bg-green-500 border-green-500"
                                                                    : "border-gray-300 dark:border-gray-600"
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

                                    {/* Removable Services */}
                                    <div>
                                        <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
                                            <Minus className="w-4 h-4 text-red-600" />
                                            {translations.reduceCost}
                                        </h4>
                                        <div className="space-y-2">
                                            {removableServices.map((service) => (
                                                <div
                                                    key={service.id}
                                                    className={`border rounded-lg p-3 cursor-pointer transition-all ${service.removed
                                                            ? "border-red-500 bg-red-50 dark:bg-red-900/30"
                                                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                                                        }`}
                                                    onClick={() => toggleRemovableService(service.id)}
                                                >
                                                    <div className="flex items-center justify-between gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium truncate">
                                                                {service.id === "hotel-upgrade" && translations.removeHotelUpgrade}
                                                                {service.id === "cruise-meal" && translations.removeCruiseMeal}
                                                                {service.id === "entrance-fees" && translations.removeEntranceFees}
                                                            </p>
                                                        </div>
                                                        <div className="text-right flex-shrink-0">
                                                            <p className="text-sm font-semibold text-red-600">
                                                                -${service.discount}
                                                            </p>
                                                            <div
                                                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 ${service.removed
                                                                        ? "bg-red-500 border-red-500"
                                                                        : "border-gray-300 dark:border-gray-600"
                                                                    }`}
                                                            >
                                                                {service.removed && <X className="w-3 h-3 text-white" />}
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
                        {/* End of Tabs contents */}
                    </Tabs> {/* close Tabs */}
                </div> {/* close flex-1 overflow container */}

                {/* Footer - Sticky */}
                <div className="border-t bg-white dark:bg-gray-800 p-4 space-y-3">
                    {/* Total */}
                    <div className="flex justify-between items-center">
                        <span className="font-semibold">{translations.panelTotal}:</span>
                        <span className="text-2xl font-bold text-primary">
                            ${calculateTotal()}
                        </span>
                    </div>

                    {/* Book now button */}
                    <Button className="w-full" size="lg">
                        <CreditCard className="w-4 h-4 mr-2" />
                        {translations.bookNow}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                        💡 {translations.panelPriceIncludesTax}
                    </p>
                </div>
            </div> {/* close Panel */}
        </>
    );
}
