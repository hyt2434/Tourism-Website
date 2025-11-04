import { useState } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar as CalendarIcon, Users, Hotel, MapPin } from "lucide-react";
import { format } from "date-fns";
import { useLanguage } from "../../context/LanguageContext";

export function BookingCard({ basePrice }) {
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [startDate, setStartDate] = useState(new Date(2025, 10, 15));
  const [endDate, setEndDate] = useState(new Date(2025, 10, 20));
  const [selectedAttractions, setSelectedAttractions] = useState([
    "halong-bay",
    "old-quarter",
  ]);

  const { translations } = useLanguage();

  const attractions = [
    { id: "halong-bay", name: "Du thuyền Vịnh Hạ Long", price: 120 },
    { id: "old-quarter", name: "Tour Phố Cổ Hà Nội", price: 40 },
    { id: "temple", name: "Văn Miếu Quốc Tử Giám", price: 30 },
    { id: "water-puppet", name: "Múa rối nước", price: 25 },
  ];

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

    return total;
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 sticky top-24 border dark:border-gray-700">
      <div className="mb-6">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl text-primary">${basePrice}</span>
          <span className="text-muted-foreground dark:text-gray-400">
            {translations.perPerson}
          </span>
        </div>
        <p className="text-sm text-muted-foreground dark:text-gray-400">
          {translations.basePriceNote}
        </p>
      </div>

      <div className="space-y-4">
        {/* Số lượng khách */}
        <div>
          <Label htmlFor="guests" className="flex items-center gap-2 mb-2 dark:text-gray-200">
            <Users className="w-4 h-4" />
            {translations.guests}
          </Label>
          <Select
            value={guests.toString()}
            onValueChange={(v) => setGuests(Number(v))}
          >
            <SelectTrigger
              id="guests"
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600"
            >
              <SelectValue placeholder={translations.chooseGuests} />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow-lg">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} {translations.guests}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Số phòng */}
        <div>
          <Label htmlFor="rooms" className="flex items-center gap-2 mb-2 dark:text-gray-200">
            <Hotel className="w-4 h-4" />
            {translations.rooms}
          </Label>
          <Select
            value={rooms.toString()}
            onValueChange={(v) => setRooms(Number(v))}
          >
            <SelectTrigger
              id="rooms"
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600"
            >
              <SelectValue placeholder={translations.chooseRooms} />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow-lg">
              {[1, 2, 3, 4].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} {translations.rooms}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Thời gian */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="mb-2 block dark:text-gray-200">{translations.departureDate}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate
                    ? format(startDate, "dd/MM/yyyy")
                    : translations.chooseDeparture}
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
            <Label className="mb-2 block dark:text-gray-200">{translations.returnDate}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate
                    ? format(endDate, "dd/MM/yyyy")
                    : translations.chooseReturn}
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
          <Label className="flex items-center gap-2 mb-3 dark:text-gray-200">
            <MapPin className="w-4 h-4" />
            {translations.attractions}
          </Label>
          <div className="space-y-2">
            {attractions.map((attraction) => (
              <label
                key={attraction.id}
                className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors dark:border-gray-600 dark:hover:bg-gray-800"
              >
                <input
                  type="checkbox"
                  checked={selectedAttractions.includes(attraction.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedAttractions([
                        ...selectedAttractions,
                        attraction.id,
                      ]);
                    } else {
                      setSelectedAttractions(
                        selectedAttractions.filter((id) => id !== attraction.id)
                      );
                    }
                  }}
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <div className="text-sm dark:text-gray-200">{attraction.name}</div>
                  <div className="text-xs text-muted-foreground dark:text-gray-400">
                    ${attraction.price}/{translations.perPerson}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
        {/* Chi tiết giá */}
        <div className="pt-4 border-t space-y-2 dark:border-gray-700">
          <div className="flex justify-between text-sm">
            <span className="dark:text-gray-200">
              {translations.baseTour} ({guests} {translations.guests})
            </span>
            <span className="dark:text-gray-200">${basePrice * guests}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="dark:text-gray-200">
              {translations.hotel} ({rooms} {translations.rooms})
            </span>
            <span className="dark:text-gray-200">${rooms * 80}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="dark:text-gray-200">{translations.attractionFee}</span>
            <span className="dark:text-gray-200">
              $
              {selectedAttractions.reduce((sum, id) => {
                const attr = attractions.find((a) => a.id === id);
                return sum + (attr ? attr.price * guests : 0);
              }, 0)}
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t dark:border-gray-700">
            <span className="dark:text-gray-200">{translations.total}</span>
            <span className="text-xl text-primary">${calculateTotal()}</span>
          </div>

          {/* Nút đặt tour */}
          <Button
            className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white"
            size="lg"
          >
            {translations.bookNow}
          </Button>

          <p className="text-xs text-center text-muted-foreground dark:text-gray-400 mt-2">
            {translations.freeCancel}
          </p>
        </div>
      </div>
    </div>
  );
}


