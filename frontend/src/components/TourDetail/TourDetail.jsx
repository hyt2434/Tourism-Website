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
import { useLanguage } from "../../context/LanguageContext";
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
  const { translations } = useLanguage();
  const { id } = useParams();
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Tour Title Section */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                {tourData.title}
              </h1>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1 text-lg font-semibold">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-gray-900 dark:text-white">{tourData.rating}</span>
                  <span className="text-gray-600 dark:text-gray-400 font-normal">
                    ({tourData.reviewCount} {translations.reviews || "đánh giá"})
                  </span>
                </div>
                <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300 font-medium">
                  <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
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
                {translations.bookNow || "Đặt Tour Ngay"}
              </Button>
              <Button variant="outline" size="icon" className="rounded-full border-gray-300 dark:border-gray-600">
                <Share2 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full border-gray-300 dark:border-gray-600">
                <Heart className="w-5 h-5 text-gray-700 dark:text-gray-300" />
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
              <TabsList className="w-full justify-start bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <TabsTrigger value="overview" className="data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-gray-700">
                  {translations.tourOverview || "Tổng quan"}
                </TabsTrigger>
                <TabsTrigger value="itinerary" className="data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-gray-700">
                  {translations.tourItinerary || "Lịch trình"}
                </TabsTrigger>
                <TabsTrigger value="included" className="data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-gray-700">
                  {translations.tourIncluded || "Bao gồm"}
                </TabsTrigger>
                <TabsTrigger value="location" className="data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-gray-700">
                  {translations.tourLocation || "Địa điểm"}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 mt-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="mb-4 text-gray-900 dark:text-white">
                    {translations.aboutTrip || "Về chuyến đi này"}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {tourData.description.overview}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {tourData.description.detail}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {tourData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="mb-4 text-gray-900 dark:text-white">
                    {translations.tourHighlights || "Điểm nổi bật"}
                  </h3>
                  <ul className="space-y-3">
                    {tourData.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 dark:text-gray-300">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="itinerary" className="mt-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 space-y-6 border border-gray-200 dark:border-gray-700">
                  {tourData.itinerary.map((day) => (
                    <div key={day.day} className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center font-semibold">
                          {day.day}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="mb-2 text-gray-900 dark:text-white">{day.title}</h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          {day.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="included" className="mt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h4 className="mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      {translations.tourIncludedItems || "Bao gồm"}
                    </h4>
                    <ul className="space-y-2">
                      {tourData.included.map((item, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-2 text-gray-700 dark:text-gray-300"
                        >
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h4 className="mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                      <X className="w-5 h-5 text-red-500" />
                      {translations.tourExcludedItems || "Không bao gồm"}
                    </h4>
                    <ul className="space-y-2">
                      {tourData.excluded.map((item, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-2 text-gray-700 dark:text-gray-300"
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
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="mb-4 text-gray-900 dark:text-white">
                    {translations.tourLocationHotel || "Địa điểm Tour & Khách sạn"}
                  </h3>
                  <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 mb-4">
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
                    <h4 className="text-gray-900 dark:text-white">{tourData.hotel.name}</h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      {tourData.hotel.description}
                    </p>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4" />
                      <span>{tourData.hotel.address}</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Phần đánh giá */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-900 dark:text-white">
                  {translations.customerReviews || "Đánh giá từ khách hàng"}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{tourData.rating}</span>
                  <div>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(tourData.rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "fill-gray-300 text-gray-300 dark:fill-gray-600 dark:text-gray-600"
                            }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {tourData.reviewCount} {translations.reviews || "đánh giá"}
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

              <Separator className="my-6 bg-gray-200 dark:bg-gray-700" />

              <Button variant="outline" className="w-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                {translations.viewAllReviews || "Xem tất cả đánh giá"}
              </Button>
            </div>

            {/* Liên hệ nhà cung cấp */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="mb-4 text-gray-900 dark:text-white">
                {translations.contactProvider || "Liên hệ nhà cung cấp Tour"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {translations.contactProviderDesc || "Có câu hỏi về tour này? Đội ngũ của chúng tôi sẵn sàng giúp bạn lên kế hoạch cho chuyến đi hoàn hảo."}
              </p>

              <div className="grid md:grid-cols-3 gap-4">
                <Button variant="outline" className="flex items-center gap-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Phone className="w-4 h-4" />
                  {translations.callPhone || "Gọi điện"}
                </Button>
                <Button variant="outline" className="flex items-center gap-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Mail className="w-4 h-4" />
                  Email
                </Button>
                <Button variant="outline" className="flex items-center gap-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <MessageCircle className="w-4 h-4" />
                  {translations.liveChat || "Chat trực tiếp"}
                </Button>
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  💡 <span className="font-medium">{translations.tip || "Mẹo"}:</span> {translations.bookingTip || "Đặt trước ít nhất 2 tuần để có lựa chọn tốt nhất về chỗ trống và giá cả. Đội ngũ của chúng tôi có thể tùy chỉnh tour này theo sở thích của bạn!"}
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