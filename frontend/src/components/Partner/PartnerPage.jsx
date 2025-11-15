import { mockPartners } from "./PartnerData";
import { useState } from "react";
import { Card, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { PlusCircle, Star, Users, CreditCard, BarChart, Globe } from "lucide-react";


export default function PartnerPage() {
  const [partners] = useState([...mockPartners]);
  const [selectedPartner, setSelectedPartner] = useState(null);
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
        <div className="flex flex-col gap-6 mb-12">
          {partners.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelectedPartner(p)}
              className="transition-all duration-300 cursor-pointer transform hover:scale-[1.02]"
            >
              <Card className="flex flex-col md:flex-row items-center p-6 shadow-sm hover:shadow-lg hover:bg-gray-100 w-full">
                <img
                  src={p.logo}
                  alt={p.name}
                  className="w-24 h-24 rounded-full mb-4 md:mb-0 md:mr-6 object-cover"
                />
                <div className="flex-1 text-center md:text-left">
                  <CardTitle className="text-xl font-semibold mb-2">{p.name}</CardTitle>
                  <p className="text-gray-500 text-sm mb-1">Ngày hợp tác: {p.date}</p>
                  <CardContent className="text-gray-700 text-sm space-y-1">
                    <p><strong>Nội dung tour:</strong> {p.tourCore}</p>
                    <p><strong>Lợi ích:</strong> {p.benefit}</p>
                    <div className="flex justify-center md:justify-start mt-2 text-yellow-500">
                      {Array.from({ length: p.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                  </CardContent>
                </div>
              </Card>
            </div>
          ))}
        </div>

 <div className="bg-white rounded-2xl shadow p-8 mt-12 mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Why Our Agency?</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center">
              <Users className="w-10 h-10 text-blue-500 mb-3" />
              <p className="font-semibold">Reach More Guests</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <CreditCard className="w-10 h-10 text-green-500 mb-3" />
              <p className="font-semibold">
                Enjoy an easy & worry-free payment experience (supports Momo transfer)
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <BarChart className="w-10 h-10 text-orange-500 mb-3" />
              <p className="font-semibold">
                Reach new peaks for your accommodation using our data analytics & market insight
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Globe className="w-10 h-10 text-purple-500 mb-3" />
              <p className="font-semibold">
                Expand your business with tailor-made strategy & key market insights
              </p>
            </div>
          </div>
        </div>

{selectedPartner && (
          <Dialog open={!!selectedPartner} onOpenChange={() => setSelectedPartner(null)}>
            <DialogContent className="max-w-lg bg-white rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-center text-2xl font-bold mb-4">
                  {selectedPartner.name}
                </DialogTitle>
              </DialogHeader>

              <div className="flex flex-col items-center text-center space-y-3">
                <img
                  src={selectedPartner.logo}
                  alt={selectedPartner.name}
                  className="w-28 h-28 rounded-full object-cover mb-2"
                />
                <p className="text-gray-600 px-4">
                  {selectedPartner.tourCore || "No introduction available."}
                </p>
                <div className="text-gray-700">
                  <p><strong>Email:</strong> contact@{selectedPartner.name.replace(/\s+/g, "").toLowerCase()}.com</p>
                  <p><strong>Phone:</strong> +84 123 456 789</p>
                  <p>
                    <strong>Website:</strong>{" "}
                    <a
                      href={`https://www.${selectedPartner.name.replace(/\s+/g, "").toLowerCase()}.com`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      www.{selectedPartner.name.replace(/\s+/g, "").toLowerCase()}.com
                    </a>
                  </p>
                </div>
                <Button
                  className="mt-4 w-full"
                  onClick={() => window.location.href = `/partner/${selectedPartner.id}`}
                >
                  Book Now
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

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
                <DialogTitle>Đăng ký hợp tác</DialogTitle>
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
