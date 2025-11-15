import { useState } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../ui/select";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar as CalendarIcon, Users, Hotel, MapPin } from "lucide-react";
import { format } from "date-fns";
import { useLanguage } from "../../context/LanguageContext";

export function BookingCard({ basePrice, customization = { additional: [], removed: [] } }) {
  const { t } = useLanguage();
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [startDate, setStartDate] = useState(new Date(2025, 10, 15));
  const [endDate, setEndDate] = useState(new Date(2025, 10, 20));
  const [selectedAttractions, setSelectedAttractions] = useState(["halong-bay", "old-quarter"]);

  const attractions = [
    { id: "halong-bay", name: t("halongCruise"), price: 120 },
    { id: "old-quarter", name: t("hanoiOldQuarter"), price: 40 },
    { id: "temple", name: t("templeOfLiterature"), price: 30 },
    { id: "water-puppet", name: t("waterPuppetShow"), price: 25 },
  ];

  const calculateTotal = () => {
    let total = basePrice * guests;
    total += rooms * 80;
    selectedAttractions.forEach((id) => {
      const attraction = attractions.find((a) => a.id === id);
      if (attraction) total += attraction.price * guests;
    });
    const days = startDate && endDate
      ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      : 5;
    total = total * days;

    if (customization.additional) {
      customization.additional.forEach((service) => {
        if (service.selected) total += service.price * days;
      });
    }
    if (customization.removed) {
      customization.removed.forEach((service) => {
        if (service.removed) total -= service.discount * days;
      });
    }
    return total;
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 sticky top-24">
      <div className="mb-6">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl text-primary">${basePrice}</span>
          <span className="text-muted-foreground dark:text-gray-400">{t("perPerson")}</span>
        </div>
        <p className="text-sm text-muted-foreground dark:text-gray-400">
          {t("basePriceNote")}
        </p>
      </div>
      <div className="space-y-4">
        {/* Số lượng khách */}
        <div>
          <Label htmlFor="guests" className="flex items-center gap-2 mb-2 text-gray-800 dark:text-gray-200">
            <Users className="w-4 h-4" />
            {t("guests")}
          </Label>
          <Select value={guests.toString()} onValueChange={(v) => setGuests(Number(v))}>
            <SelectTrigger id="guests" className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
              <SelectValue placeholder={t("chooseGuests")} />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow-lg">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} {t("adults")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Số phòng */}
        <div>
          <Label htmlFor="rooms" className="flex items-center gap-2 mb-2 text-gray-800 dark:text-gray-200">
            <Hotel className="w-4 h-4" />
            {t("rooms")}
          </Label>
          <Select value={rooms.toString()} onValueChange={(v) => setRooms(Number(v))}>
            <SelectTrigger id="rooms" className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
              <SelectValue placeholder={t("chooseRooms")} />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow-lg">
              {[1, 2, 3, 4].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} {t("roomUnit")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Thời gian */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="mb-2 block text-gray-800 dark:text-gray-200">{t("departureDate")}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "dd/MM/yyyy") : t("chooseDeparture")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow-lg">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label className="mb-2 block text-gray-800 dark:text-gray-200">{t("returnDate")}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "dd/MM/yyyy") : t("chooseReturn")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow-lg">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                  disabled={(date) => date < startDate}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        {/* Điểm tham quan */}
        <div>
          <Label className="flex items-center gap-2 mb-3 text-gray-800 dark:text-gray-200">
            <MapPin className="w-4 h-4" />
            {t("attractions")}
          </Label>
          <div className="space-y-2">
            {attractions.map((attraction) => (
              <label
                key={attraction.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedAttractions.includes(attraction.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedAttractions([...selectedAttractions, attraction.id]);
                    } else {
                      setSelectedAttractions(selectedAttractions.filter((id) => id !== attraction.id));
                    }
                  }}
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <div className="text-sm text-gray-800 dark:text-gray-200">{attraction.name}</div>
                  <div className="text-xs text-muted-foreground dark:text-gray-400">
                    ${attraction.price}/{t("perPerson")}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Chi tiết giá */}
        <div className="pt-4 border-t border-gray-300 dark:border-gray-600 space-y-2">
          <div className="flex justify-between text-sm text-gray-800 dark:text-gray-200">
            <span>{t("baseTour")} ({guests} {t("guests")})</span>
            <span>${basePrice * guests}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-800 dark:text-gray-200">
            <span>{t("hotel")} ({rooms} {t("rooms")})</span>
            <span>${rooms * 80}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-800 dark:text-gray-200">
            <span>{t("attractionFee")}</span>
            <span>
              $
              {selectedAttractions.reduce((sum, id) => {
                const attr = attractions.find((a) => a.id === id);
                return sum + (attr ? attr.price * guests : 0);
              }, 0)}
            </span>
          </div>

          {/* Hiển thị dịch vụ bổ sung */}
          {customization.additional &&
            customization.additional.filter((s) => s.selected).map((service) => (
              <div key={service.id} className="flex justify-between text-sm text-green-600">
                <span>+ {service.name}</span>
                <span>${service.price}</span>
              </div>
            ))}

          {/* Hiển thị dịch vụ đã loại bỏ */}
          {customization.removed &&
            customization.removed.filter((s) => s.removed).map((service) => (
              <div key={service.id} className="flex justify-between text-sm text-red-600">
                <span>- {service.name}</span>
                <span>- ${service.discount}</span>
              </div>
            ))}

          <div className="flex justify-between pt-2 border-t border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200">
            <span>{t("total")}</span>
            <span className="text-xl text-primary">${calculateTotal()}</span>
          </div>
        </div>
        {/* Nút đặt tour */}
        <Button className="w-full bg-[#3B82F6] hover:bg-[#2563EB]" size="lg">
          {t("bookNow")}
        </Button>

        <p className="text-xs text-center text-muted-foreground dark:text-gray-400">
          {t("freeCancel")}
        </p>
      </div>
    </div>
  );
}
