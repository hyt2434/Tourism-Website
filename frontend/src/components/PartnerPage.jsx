import { useState } from "react";
import { Card, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { PlusCircle, Star } from "lucide-react";

export default function PartnerPage() {
  const [partners] = useState([
    {
      id: 1,
      name: "Sunshine Travel",
      logo: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
      date: "12/03/2023",
      tourCore: "Tour khám phá miền Trung - di sản và biển xanh.",
      benefit: "Tăng 45% lượt khách đặt tour qua nền tảng, nâng cao thương hiệu địa phương.",
      rating: 5,
    },
    {
      id: 2,
      name: "Green Hotel Group",
      logo: "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
      date: "07/08/2023",
      tourCore: "Chuỗi nghỉ dưỡng xanh kết hợp du lịch sinh thái.",
      benefit: "Nhận hơn 2.000 lượt đặt phòng mới qua các tour tích hợp với website.",
      rating: 5,
    },
    {
      id: 3,
      name: "Ocean Transport",
      logo: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b",
      date: "15/01/2024",
      tourCore: "Dịch vụ vận chuyển khách du lịch biển đảo cao cấp.",
      benefit: "Tăng doanh thu 30% từ khách hàng đặt combo tour và vận chuyển.",
      rating: 5,
    },
    {
      id: 4,
      name: "Mountain Adventure Co.",
      logo: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e",
      date: "02/06/2024",
      tourCore: "Tour leo núi kết hợp cắm trại - hướng đến du lịch mạo hiểm bền vững.",
      benefit: "Website giúp quảng bá dịch vụ đến nhóm khách quốc tế nhanh chóng hơn.",
      rating: 5,
    },
    {
      id: 5,
      name: "City Culture Tours",
      logo: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
      date: "20/09/2024",
      tourCore: "Khám phá văn hóa và ẩm thực đặc sắc tại các thành phố lớn.",
      benefit: "Nhờ website, lượng khách nội địa tăng 50% chỉ sau 2 tháng.",
      rating: 5,
    },
  ]);

  const [formData, setFormData] = useState({
    tourName: "",
    location: "",
    provider: "",
    price: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const newTour = {
      id: Date.now(),
      name: formData.tourName,
      location: formData.location,
      provider: formData.provider,
      price: formData.price,
      startDate: formData.startDate,
      endDate: formData.endDate,
      description: formData.description,
      status: "pending",
    };

    const existing = JSON.parse(localStorage.getItem("pendingTours") || "[]");
    localStorage.setItem("pendingTours", JSON.stringify([...existing, newTour]));

    alert("✅ Đăng ký hợp tác thành công! Admin sẽ xem xét thông tin của bạn.");

    setFormData({
      tourName: "",
      location: "",
      provider: "",
      price: "",
      startDate: "",
      endDate: "",
      description: "",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-6">
        <h1 className="text-3xl font-bold mb-4 text-center">Đối tác của chúng tôi</h1>
        <p className="text-center text-gray-600 mb-8">
          Cùng nhau hợp tác để mang đến những trải nghiệm du lịch tuyệt vời nhất.
        </p>

        {/* Danh sách đối tác */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
          {partners.map((p) => (
            <Card key={p.id} className="p-4 flex flex-col items-center text-center shadow-sm">
              <img src={p.logo} alt={p.name} className="w-20 h-20 rounded-full mb-3" />
              <CardTitle className="text-lg font-semibold mb-1">{p.name}</CardTitle>
              <p className="text-gray-500 text-sm mb-1">Ngày hợp tác: {p.date}</p>
              <CardContent className="text-sm text-gray-700 space-y-1">
                <p><strong>Nội dung tour:</strong> {p.tourCore}</p>
                <p><strong>Lợi ích:</strong> {p.benefit}</p>
                <div className="flex justify-center mt-2 text-yellow-500">
                  {Array.from({ length: p.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Nút đăng ký hợp tác */}
        <div className="flex justify-center">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="lg" className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5" /> Đăng ký trở thành đối tác
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-lg bg-white">
              <DialogHeader>
                <DialogTitle>{translations.partnerRegisterTitle}</DialogTitle>
                <DialogDescription>
                  {translations.partnerRegisterDescription || "Fill in the details to register as a partner"}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Tên Tour</Label>
                  <Input
                    required
                    value={formData.tourName}
                    onChange={(e) => setFormData({ ...formData, tourName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Địa điểm</Label>
                  <Input
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tên nhà cung cấp</Label>
                  <Input
                    required
                    value={formData.provider}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Giá (VNĐ)</Label>
                  <Input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Ngày khởi hành</Label>
                    <Input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ngày kết thúc</Label>
                    <Input
                      type="date"
                      required
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Mô tả ngắn</Label>
                  <Textarea
                    placeholder="Giới thiệu ngắn gọn về tour hoặc đối tác..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="flex justify-end mt-4">
                  <Button type="submit">Xác nhận đăng ký</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
