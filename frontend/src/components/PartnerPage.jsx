import { useState } from "react";
import { Card, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { PlusCircle, Star } from "lucide-react";
import { useLanguage } from "../context/LanguageContext"; // 👈 import context

export default function PartnerPage() {
  const { translations } = useLanguage(); // 👈 lấy translations

  const [partners] = useState([
    {
      id: 1,
      name: "Sunshine Travel",
      logo: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
      date: "12/03/2023",
      tourCore: translations.partner1Core,
      benefit: translations.partner1Benefit,
      rating: 5,
    },
    {
      id: 2,
      name: "Green Hotel Group",
      logo: "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
      date: "07/08/2023",
      tourCore: translations.partner2Core,
      benefit: translations.partner2Benefit,
      rating: 5,
    },
    // ... các partner khác tương tự
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

    alert(translations.partnerRegisterSuccess);

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10">
      <div className="container mx-auto px-6">
        <h1 className="text-3xl font-bold mb-4 text-center text-gray-900 dark:text-white">
          {translations.partnerTitle}
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
          {translations.partnerSubtitle}
        </p>

        {/* Danh sách đối tác */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
          {partners.map((p) => (
            <Card
              key={p.id}
              className="p-4 flex flex-col items-center text-center shadow-sm bg-white dark:bg-gray-800 dark:text-gray-200"
            >
              <img src={p.logo} alt={p.name} className="w-20 h-20 rounded-full mb-3" />
              <CardTitle className="text-lg font-semibold mb-1">{p.name}</CardTitle>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">
                {translations.partnerDate}: {p.date}
              </p>
              <CardContent className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <p><strong>{translations.partnerTourCore}:</strong> {p.tourCore}</p>
                <p><strong>{translations.partnerBenefit}:</strong> {p.benefit}</p>
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
                <PlusCircle className="w-5 h-5" /> {translations.partnerRegisterBtn}
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-lg bg-white dark:bg-gray-800 dark:text-gray-200">
              <DialogHeader>
                <DialogTitle>{translations.partnerRegisterTitle}</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>{translations.tourName}</Label>
                  <Input
                    required
                    value={formData.tourName}
                    onChange={(e) => setFormData({ ...formData, tourName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{translations.location}</Label>
                  <Input
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{translations.provider}</Label>
                  <Input
                    required
                    value={formData.provider}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{translations.price}</Label>
                  <Input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{translations.startDate}</Label>
                    <Input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{translations.endDate}</Label>
                    <Input
                      type="date"
                      required
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{translations.shortDescription}</Label>
                  <Textarea
                    placeholder={translations.shortDescriptionPlaceholder}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="flex justify-end mt-4">
                  <Button type="submit">{translations.confirmRegister}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
