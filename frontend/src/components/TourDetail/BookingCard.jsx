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

export function BookingCard({ basePrice, customization = { additional: [], removed: [] } }) {
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [startDate, setStartDate] = useState(new Date(2025, 10, 15));
  const [endDate, setEndDate] = useState(new Date(2025, 10, 20));
  const [selectedAttractions, setSelectedAttractions] = useState([
    "halong-bay",
    "old-quarter",
  ]);

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

    // Thêm chi phí từ dịch vụ bổ sung
    if (customization.additional) {
      customization.additional.forEach((service) => {
        if (service.selected) {
          total += service.price * days;
        }
      });
    }

    // Trừ giảm giá từ dịch vụ đã loại bỏ
    if (customization.removed) {
      customization.removed.forEach((service) => {
        if (service.removed) {
          total -= service.discount * days;
        }
      });
    }

    return total;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
      <div className="mb-6">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl text-primary">${basePrice}</span>
          <span className="text-muted-foreground">/ người</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Giá khởi điểm - tùy chỉnh chuyến đi bên dưới
        </p>
      </div>

      <div className="space-y-4">
        {/* Số lượng khách */}
        <div>
          <Label htmlFor="guests" className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4" />
            Số lượng khách
          </Label>
          <Select
            value={guests.toString()}
            onValueChange={(v) => setGuests(Number(v))}
          >
            <SelectTrigger
              id="guests"
              className="bg-white border border-gray-300"
            >
              <SelectValue placeholder="Chọn số khách" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-300 shadow-lg">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} Khách
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Số phòng */}
        <div>
          <Label htmlFor="rooms" className="flex items-center gap-2 mb-2">
            <Hotel className="w-4 h-4" />
            Số phòng khách sạn
          </Label>
          <Select
            value={rooms.toString()}
            onValueChange={(v) => setRooms(Number(v))}
          >
            <SelectTrigger
              id="rooms"
              className="bg-white border border-gray-300"
            >
              <SelectValue placeholder="Chọn số phòng" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-300 shadow-lg">
              {[1, 2, 3, 4].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} Phòng
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Thời gian */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="mb-2 block">Ngày đi</Label>
            {/* Ngày đi */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-white border border-gray-300"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "dd/MM/yyyy") : "Chọn ngày đi"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white border border-gray-300 shadow-lg">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  disabled={(date) => date < new Date()} // chỉ chặn ngày trong quá khứ}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label className="mb-2 block">Ngày về</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  onClick={() => console.log("click choose date")}
                  variant="outline"
                  className="w-full justify-start bg-white border border-gray-300"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "dd/MM/yyyy") : "Chọn ngày về"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white border border-gray-300 shadow-lg">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                  disabled={(date) => date < startDate} // chỉ chặn ngày về trước ngày đi
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Điểm tham quan */}
        <div>
          <Label className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4" />
            Chọn điểm tham quan
          </Label>
          <div className="space-y-2">
            {attractions.map((attraction) => (
              <label
                key={attraction.id}
                className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors"
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
                  <div className="text-sm">{attraction.name}</div>
                  <div className="text-xs text-muted-foreground">
                    ${attraction.price}/người
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Chi tiết giá */}
        <div className="pt-4 border-t space-y-2">
          <div className="flex justify-between text-sm">
            <span>Tour cơ bản ({guests} khách)</span>
            <span>${basePrice * guests}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Khách sạn ({rooms} phòng)</span>
            <span>${rooms * 80}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Điểm tham quan</span>
            <span>
              $
              {selectedAttractions.reduce((sum, id) => {
                const attr = attractions.find((a) => a.id === id);
                return sum + (attr ? attr.price * guests : 0);
              }, 0)}
            </span>
          </div>
          
          {/* Hiển thị các dịch vụ bổ sung đã chọn */}
          {customization.additional &&
            customization.additional
              .filter((s) => s.selected)
              .map((service) => (
                <div key={service.id} className="flex justify-between text-sm">
                  <span className="text-green-600">+ {service.name}</span>
                  <span className="text-green-600">
                    ${service.price}
                  </span>
                </div>
              ))}

          {/* Hiển thị các dịch vụ đã loại bỏ */}
          {customization.removed &&
            customization.removed
              .filter((s) => s.removed)
              .map((service) => (
                <div key={service.id} className="flex justify-between text-sm">
                  <span className="text-red-600">- {service.name}</span>
                  <span className="text-red-600">
                    -${service.discount}
                  </span>
                </div>
              ))}
          
          <div className="flex justify-between pt-2 border-t">
            <span>Tổng cộng</span>
            <span className="text-xl text-primary">${calculateTotal()}</span>
          </div>
        </div>

        {/* Nút đặt tour */}
        <Button className="w-full bg-[#3B82F6] hover:bg-[#2563EB]" size="lg">
          Đặt ngay
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Miễn phí hủy trước 24 giờ khởi hành
        </p>
      </div>
    </div>
  );
}
