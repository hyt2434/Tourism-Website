import { useState } from "react";
import { useParams } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Thumbs, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/thumbs";
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
  ChevronLeft,
  ChevronRight,
  Star,
  MapPin,
  Share2,
  Heart,
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [isBookingPanelOpen, setIsBookingPanelOpen] = useState(false);

  // Map ID từ URL sang tourId trong data
  const mappedTourId = tourIdMapping[id] || "halong-hanoi";
  
  // Lấy dữ liệu tour theo ID
  const tourData = toursData[mappedTourId] || toursData["halong-hanoi"];
  const tourImages = tourData.images;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % tourImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + tourImages.length) % tourImages.length
    );
  };

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
            {/* Thư viện ảnh */}
            <div className="relative rounded-2xl overflow-hidden bg-gray-900 aspect-video">
              {/* Swiper chính */}
              <Swiper
                modules={[Navigation, Pagination, Thumbs, Autoplay]}
                navigation
                pagination={{ clickable: true }}
                loop
                autoplay={{ delay: 3000, disableOnInteraction: false }}
                thumbs={{ swiper: thumbsSwiper }}
                className="w-full h-full"
              >
                {tourImages.map((image, index) => (
                  <SwiperSlide key={index}>
                    <ImageWithFallback
                      src={image}
                      alt={`Tour image ${index + 1}`}
                      className="w-full h-full object-cover object-center"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* Swiper thumbnails */}
              <div className="mt-4">
                <Swiper
                  onSwiper={setThumbsSwiper}
                  modules={[Thumbs]}
                  slidesPerView={5}
                  spaceBetween={10}
                  watchSlidesProgress
                  className="cursor-pointer"
                >
                  {tourImages.map((image, index) => (
                    <SwiperSlide key={index}>
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-16 object-cover rounded-md opacity-70 hover:opacity-100 transition"
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>

            {/* Tabs nội dung */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                <TabsTrigger value="itinerary">Lịch trình</TabsTrigger>
                <TabsTrigger value="included">Bao gồm</TabsTrigger>
                <TabsTrigger value="location">Địa điểm</TabsTrigger>
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

      {/* Floating Booking Panel */}
      <BookingPanel
        basePrice={tourData.basePrice}
        isOpen={isBookingPanelOpen}
        onClose={() => setIsBookingPanelOpen(false)}
      />
    </div>
  );
}
