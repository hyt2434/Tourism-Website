import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { BookingCard } from "./BookingCard";
import { BookingPanel } from "./BookingPanel";
import ImageWithFallback from "../../figma/ImageWithFallback";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import {
  CheckCircle,
  X,
  Phone,
  Mail,
  MessageCircle,
  Star,
  MapPin,
  Share2,
  Heart,
  Grid,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ReviewCard } from "./ReviewCard";
import { toursData } from "./tourData";

// Map tour ID từ URL sang tourId trong data
const tourIdMapping = {
  "1": "halong-hanoi",
  "2": "danang-hoian", 
  "3": "danang-hoian",
  "4": "phuquoc",
  "5": "nhatrang",
  "halong-hanoi": "halong-hanoi",
  "danang-hoian": "danang-hoian",
  "saigon-mekong": "saigon-mekong",
  "sapa-hagiang": "sapa-hagiang",
  "phuquoc": "phuquoc",
  "nhatrang": "nhatrang",
};

export default function TourDetail() {
  const { id } = useParams(); // Lấy ID từ URL
  const [isBookingPanelOpen, setIsBookingPanelOpen] = useState(false);
  const [showStickyButton, setShowStickyButton] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const headerButtonRef = useRef(null);

  // Map ID từ URL sang tourId trong data
  const mappedTourId = tourIdMapping[id] || "halong-hanoi";
  
  // Lấy dữ liệu tour theo ID
  const tourData = toursData[mappedTourId] || toursData["halong-hanoi"];
  const tourImages = tourData.images;

  // Detect khi button header scroll ra khỏi màn hình
  useEffect(() => {
    const handleScroll = () => {
      // Hiện sticky button khi scroll xuống hơn 200px
      setShowStickyButton(window.scrollY > 200);
    };

    // Check initial state
    handleScroll();
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openGallery = (index = 0) => {
    setCurrentImageIndex(index);
    setShowGallery(true);
    document.body.style.overflow = 'hidden'; // Prevent scroll
  };

  const closeGallery = () => {
    setShowGallery(false);
    document.body.style.overflow = 'unset';
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % tourImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + tourImages.length) % tourImages.length);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showGallery) {
        if (e.key === 'Escape') closeGallery();
        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'ArrowLeft') prevImage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showGallery]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Tour Title Section */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                {tourData.title}
              </h1>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1 text-lg font-semibold">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-gray-900">{tourData.rating}</span>
                  <span className="text-gray-600 font-normal">({tourData.reviewCount} đánh giá)</span>
                </div>
                <div className="flex items-center gap-1 text-gray-700 font-medium">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <span>{tourData.location}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                ref={headerButtonRef}
                onClick={() => setIsBookingPanelOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                size="lg"
              >
                Đặt Tour Ngay
              </Button>
              <Button variant="outline" size="icon" className="rounded-full">
                <Share2 className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full">
                <Heart className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-8">
          {/* Nội dung chính - Full width */}
          <div className="space-y-8">
            {/* Thư viện ảnh - 1 lớn + 4 nhỏ */}
            <div className="relative rounded-2xl overflow-hidden">
              <div className="grid grid-cols-5 gap-2">
                {/* Ảnh chính - chiếm 3 cột, giảm chiều cao */}
                <div 
                  className="col-span-5 md:col-span-3 relative group cursor-pointer overflow-hidden rounded-lg"
                  onClick={() => openGallery(0)}
                >
                  <ImageWithFallback
                    src={tourImages[0]}
                    alt={`${tourData.title} - Ảnh chính`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    style={{ minHeight: '350px', maxHeight: '450px' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* 4 ảnh nhỏ - chiếm 2 cột, tăng kích thước */}
                <div className="col-span-5 md:col-span-2 grid grid-cols-2 gap-2">
                  {/* 3 ảnh đầu */}
                  {tourImages.slice(1, 4).map((image, index) => (
                    <div 
                      key={index} 
                      className="relative group cursor-pointer overflow-hidden rounded-lg"
                      onClick={() => openGallery(index + 1)}
                    >
                      <ImageWithFallback
                        src={image}
                        alt={`${tourData.title} - Ảnh ${index + 2}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        style={{ minHeight: '145px', maxHeight: '145px' }}
                      />
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors" />
                    </div>
                  ))}

                  {/* Ảnh cuối cùng - có overlay "Xem thêm" */}
                  <div 
                    className="relative group cursor-pointer overflow-hidden rounded-lg"
                    onClick={() => openGallery(4)}
                  >
                    <ImageWithFallback
                      src={tourImages[4]}
                      alt={`${tourData.title} - Ảnh 5`}
                      className="w-full h-full object-cover"
                      style={{ minHeight: '145px', maxHeight: '145px' }}
                    />
                    <div className="absolute inset-0 bg-black/60 hover:bg-black/70 transition-colors flex items-center justify-center">
                      <div className="text-center text-white">
                        <Grid className="w-6 h-6 mx-auto mb-1" />
                        <p className="text-sm font-bold">Xem thêm</p>
                        <p className="text-xs">{tourImages.length} ảnh</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Gallery Modal - Full screen */}
            {showGallery && (
              <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center">
                {/* Close button */}
                <button
                  onClick={closeGallery}
                  className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
                >
                  <X className="w-8 h-8" />
                </button>

                {/* Image counter */}
                <div className="absolute top-4 left-4 text-white text-lg font-semibold z-10">
                  {currentImageIndex + 1} / {tourImages.length}
                </div>

                {/* Previous button */}
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-3 hover:bg-black/70"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>

                {/* Main image */}
                <div className="max-w-6xl max-h-[90vh] mx-auto px-20">
                  <img
                    src={tourImages[currentImageIndex]}
                    alt={`${tourData.title} - Ảnh ${currentImageIndex + 1}`}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Next button */}
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-3 hover:bg-black/70"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>

                {/* Thumbnails */}
                <div className="absolute bottom-4 left-0 right-0 px-4">
                  <div className="max-w-4xl mx-auto flex gap-2 overflow-x-auto pb-2">
                    {tourImages.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-20 h-16 object-cover rounded cursor-pointer transition-all ${
                          index === currentImageIndex 
                            ? 'ring-2 ring-white opacity-100 scale-110' 
                            : 'opacity-50 hover:opacity-75'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tabs nội dung */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full justify-start bg-gradient-to-r from-blue-50 to-purple-50 p-1 rounded-lg shadow-sm gap-0">
                <TabsTrigger 
                  value="overview"
                  className="border-r border-blue-200/50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-100 data-[state=active]:to-purple-100 data-[state=active]:text-blue-700 data-[state=active]:font-semibold data-[state=active]:shadow-sm"
                >
                  Tổng quan
                </TabsTrigger>
                <TabsTrigger 
                  value="itinerary"
                  className="border-r border-blue-200/50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-100 data-[state=active]:to-purple-100 data-[state=active]:text-blue-700 data-[state=active]:font-semibold data-[state=active]:shadow-sm"
                >
                  Lịch trình
                </TabsTrigger>
                <TabsTrigger 
                  value="included"
                  className="border-r border-blue-200/50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-100 data-[state=active]:to-purple-100 data-[state=active]:text-blue-700 data-[state=active]:font-semibold data-[state=active]:shadow-sm"
                >
                  Bao gồm
                </TabsTrigger>
                <TabsTrigger 
                  value="location"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-100 data-[state=active]:to-purple-100 data-[state=active]:text-blue-700 data-[state=active]:font-semibold data-[state=active]:shadow-sm"
                >
                  Địa điểm
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 mt-6">
                <div className="bg-white rounded-xl p-6">
                  <h3 className="mb-4">Về chuyến đi này</h3>
                  <p className="text-foreground mb-4">
                    {tourData.description.overview}
                  </p>
                  <p className="text-foreground mb-4">
                    {tourData.description.detail}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {tourData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6">
                  <h3 className="mb-4">Điểm nổi bật</h3>
                  <ul className="space-y-3">
                    {tourData.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="itinerary" className="mt-6">
                <div className="bg-white rounded-xl p-6 space-y-6">
                  {tourData.itinerary.map((day) => (
                    <div key={day.day} className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-[#3B82F6] text-white flex items-center justify-center">
                          {day.day}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="mb-2">{day.title}</h4>
                        <p className="text-muted-foreground">
                          {day.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="included" className="mt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl p-6">
                    <h4 className="mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Bao gồm
                    </h4>
                    <ul className="space-y-2">
                      {tourData.included.map((item, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-2 text-foreground"
                        >
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white rounded-xl p-6">
                    <h4 className="mb-4 flex items-center gap-2">
                      <X className="w-5 h-5 text-red-500" />
                      Không bao gồm
                    </h4>
                    <ul className="space-y-2">
                      {tourData.excluded.map((item, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-2 text-foreground"
                        >
                          <X className="w-4 h-4 text-red-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="location" className="mt-6">
                <div className="bg-white rounded-xl p-6">
                  <h3 className="mb-4">Địa điểm Tour & Khách sạn</h3>
                  <div className="rounded-lg overflow-hidden border mb-4">
                    <iframe
                      src={tourData.hotel.mapUrl}
                      width="100%"
                      height="400"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                    ></iframe>
                  </div>
                  <div className="space-y-2">
                    <h4>{tourData.hotel.name}</h4>
                    <p className="text-muted-foreground">
                      {tourData.hotel.description}
                    </p>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{tourData.hotel.address}</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Phần đánh giá */}
            <div className="bg-white rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3>Đánh giá từ khách hàng</h3>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{tourData.rating}</span>
                  <div>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(tourData.rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "fill-gray-300 text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {tourData.reviewCount} đánh giá
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {tourData.reviews.map((review, index) => (
                  <ReviewCard
                    key={index}
                    name={review.name}
                    rating={review.rating}
                    date={review.date}
                    review={review.review}
                    helpful={review.helpful}
                  />
                ))}
              </div>

              <Separator className="my-6" />

              <Button variant="outline" className="w-full">
                Xem tất cả đánh giá
              </Button>
            </div>

            {/* Liên hệ nhà cung cấp */}
            <div className="bg-white rounded-xl p-6">
              <h3 className="mb-4">Liên hệ nhà cung cấp Tour</h3>
              <p className="text-muted-foreground mb-6">
                Có câu hỏi về tour này? Đội ngũ của chúng tôi sẵn sàng giúp bạn
                lên kế hoạch cho chuyến đi hoàn hảo.
              </p>

              <div className="grid md:grid-cols-3 gap-4">
                <Button variant="outline" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Gọi điện
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Chat trực tiếp
                </Button>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm">
                  💡 <span className="font-medium">Mẹo:</span> Đặt trước ít nhất
                  2 tuần để có lựa chọn tốt nhất về chỗ trống và giá cả. Đội ngũ
                  của chúng tôi có thể tùy chỉnh tour này theo sở thích của bạn!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Booking Button - Bottom Mobile */}
      {showStickyButton && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 md:hidden">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Giá từ</span>
              <span className="text-2xl font-bold text-blue-600">
                {tourData.basePrice.toLocaleString("vi-VN")}đ
              </span>
            </div>
            <Button
              onClick={() => setIsBookingPanelOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl px-8 py-6 text-lg"
            >
              Đặt Tour Ngay
            </Button>
          </div>
        </div>
      )}

      {/* Sticky Booking Button - Side Desktop */}
      {showStickyButton && (
        <div className="hidden md:block fixed bottom-8 right-8 z-50">
          <Button
            onClick={() => setIsBookingPanelOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold shadow-2xl hover:shadow-3xl px-8 py-6 text-lg rounded-full animate-pulse hover:animate-none"
            size="lg"
          >
            <span className="flex items-center gap-2">
              💼 Đặt Tour Ngay
            </span>
          </Button>
        </div>
      )}

      {/* Floating Booking Panel */}
      <BookingPanel
        basePrice={tourData.basePrice}
        isOpen={isBookingPanelOpen}
        onClose={() => setIsBookingPanelOpen(false)}
      />
    </div>
  );
}
