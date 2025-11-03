import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Thumbs, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/thumbs";
import { BookingCard } from "./BookingCard";
import { ReviewCard } from "./ReviewCard";
import ImageWithFallback from "../../figma/ImageWithFallback";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import {
  CheckCircle,
  Star,
  MapPin,
  Share2,
  Heart,
  X,
  Phone,
  Mail,
  MessageCircle,
} from "lucide-react";

export default function TourDetail() {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  const tourImages = [
    "https://images.unsplash.com/photo-1668000018482-a02acf02b22a?...",
    "https://images.unsplash.com/photo-1729605411476-defbdab14c54?...",
    "https://res.klook.com/images/.../activities/qmgtdjekctlyucr8itqw/...",
    "https://bcp.cdnchinhphu.vn/.../hanoi-17486566616582033334984.jpg",
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Tiêu đề Tour */}
      <div className="bg-white dark:bg-gray-900 border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-primary mb-2">
                Khám phá Việt Nam: Hà Nội & Vịnh Hạ Long
              </h1>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>4.8</span>
                  <span className="text-muted-foreground dark:text-gray-400">
                    (324 đánh giá)
                  </span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground dark:text-gray-400">
                  <MapPin className="w-4 h-4" />
                  <span>Hà Nội & Vịnh Hạ Long, Việt Nam</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
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

      {/* Nội dung */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cột trái */}
          <div className="lg:col-span-2 space-y-8">
            {/* Thư viện ảnh */}
            <div className="relative rounded-2xl overflow-hidden bg-gray-900 dark:bg-gray-800 aspect-video">
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

              {/* Thumbnails */}
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

              {/* Tab Tổng quan */}
              <TabsContent value="overview" className="space-y-4 mt-6">
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border dark:border-gray-700">
                  <h3 className="mb-4 dark:text-gray-100">Về chuyến đi này</h3>
                  <p className="text-foreground dark:text-gray-300 mb-4">
                    Bắt đầu cuộc hành trình khó quên qua những điểm đến mang tính biểu tượng...
                  </p>
                  <p className="text-foreground dark:text-gray-300 mb-4">
                    Trải nghiệm nét quyến rũ của Phố Cổ Hà Nội...
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Badge variant="secondary" className="dark:bg-gray-800 dark:text-gray-200">
                      Du lịch văn hóa
                    </Badge>
                    <Badge variant="secondary" className="dark:bg-gray-800 dark:text-gray-200">
                      Thiên nhiên
                    </Badge>
                    <Badge variant="secondary" className="dark:bg-gray-800 dark:text-gray-200">
                      Ẩm thực
                    </Badge>
                    <Badge variant="secondary" className="dark:bg-gray-800 dark:text-gray-200">
                      Nhiếp ảnh
                    </Badge>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border dark:border-gray-700">
                  <h3 className="mb-4 dark:text-gray-100">Điểm nổi bật</h3>
                  <ul className="space-y-3">
                    {[
                      "Du ngoạn trên Vịnh Hạ Long bằng thuyền buồm truyền thống",
                      "Khám phá Phố Cổ Hà Nội và các di tích lịch sử",
                      "Tham quan Văn Miếu Quốc Tử Giám",
                      "Thưởng thức ẩm thực Việt Nam chính gốc",
                      "Trải nghiệm biểu diễn Múa rối nước",
                      "Lưu trú tại khách sạn boutique",
                    ].map((highlight, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="dark:text-gray-300">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </TabsContent>
              {/* Tab Lịch trình */}
              <TabsContent value="itinerary" className="mt-6">
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 space-y-6 border dark:border-gray-700">
                  {[
                    {
                      day: 1,
                      title: "Đến Hà Nội",
                      description:
                        "Chào mừng đến Việt Nam! Đưa đón về khách sạn và thưởng thức bữa tối chào mừng.",
                    },
                    {
                      day: 2,
                      title: "Tour Hà Nội",
                      description:
                        "Khám phá Phố Cổ, Văn Miếu và xem Múa rối nước truyền thống.",
                    },
                    {
                      day: 3,
                      title: "Du thuyền Vịnh Hạ Long",
                      description:
                        "Hành trình đến Vịnh Hạ Long, tham quan hang động, chèo kayak và ngắm hoàng hôn.",
                    },
                    {
                      day: 4,
                      title: "Vịnh Hạ Long & Trở về",
                      description:
                        "Tập Thái Cực Quyền buổi sáng, tham quan làng chài nổi và trở về Hà Nội.",
                    },
                    {
                      day: 5,
                      title: "Khởi hành",
                      description:
                        "Tự do mua sắm trước khi ra sân bay.",
                    },
                  ].map((day) => (
                    <div key={day.day} className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-[#3B82F6] text-white flex items-center justify-center">
                          {day.day}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="mb-2 dark:text-gray-100">{day.title}</h4>
                        <p className="text-muted-foreground dark:text-gray-400">
                          {day.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Tab Bao gồm */}
              <TabsContent value="included" className="mt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border dark:border-gray-700">
                    <h4 className="mb-4 flex items-center gap-2 dark:text-gray-100">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Bao gồm
                    </h4>
                    <ul className="space-y-2">
                      {[
                        "4 đêm lưu trú",
                        "Ăn sáng hàng ngày",
                        "Hướng dẫn viên tiếng Anh",
                        "Tất cả phí tham quan",
                        "Đưa đón sân bay",
                        "Du thuyền Vịnh Hạ Long",
                      ].map((item, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-2 text-foreground dark:text-gray-300"
                        >
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border dark:border-gray-700">
                    <h4 className="mb-4 flex items-center gap-2 dark:text-gray-100">
                      <X className="w-5 h-5 text-red-500" />
                      Không bao gồm
                    </h4>
                    <ul className="space-y-2">
                      {[
                        "Vé máy bay quốc tế",
                        "Bảo hiểm du lịch",
                        "Chi phí cá nhân",
                        "Bữa trưa và tối (trừ khi ghi chú)",
                        "Tiền tips",
                        "Phí visa",
                      ].map((item, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-2 text-foreground dark:text-gray-300"
                        >
                          <X className="w-4 h-4 text-red-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </TabsContent>

              {/* Tab Địa điểm */}
              <TabsContent value="location" className="mt-6">
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border dark:border-gray-700">
                  <h3 className="mb-4 dark:text-gray-100">Địa điểm Tour & Khách sạn</h3>
                  <div className="rounded-lg overflow-hidden border dark:border-gray-700 mb-4">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=..."
                      width="100%"
                      height="400"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                    ></iframe>
                  </div>
                  <div className="space-y-2">
                    <h4 className="dark:text-gray-100">Thông tin khách sạn</h4>
                    <p className="text-muted-foreground dark:text-gray-400">
                      Bạn sẽ lưu trú tại Khách sạn Hanoi Pearl, một khách sạn boutique 4 sao ở trung tâm Phố Cổ.
                    </p>
                    <div className="flex items-center gap-2 text-muted-foreground dark:text-gray-400">
                      <span>📍 87 Mã Mây, Phố Cổ, Hà Nội</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>



            {/* Phần đánh giá */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="dark:text-gray-100">Đánh giá từ khách hàng</h3>
                <div className="flex items-center gap-2">
                  <span className="text-2xl dark:text-gray-100">4.8</span>
                  <div>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          className={i < 5 ? "text-yellow-400" : "text-gray-300"}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground dark:text-gray-400">
                      324 đánh giá
                    </span>
                  </div> {/* ✅ đóng div sau <span> */}
                </div>   {/* ✅ đóng div flex items-center gap-2 */}
              </div>     {/* ✅ đóng div flex justify-between */}

              <div className="space-y-4">
                <ReviewCard
                  name="Nguyễn Minh Anh"
                  rating={5}
                  date="Tháng 10, 2025"
                  review="Trải nghiệm tuyệt vời! Tour được tổ chức hoàn hảo, hướng dẫn viên thân thiện, Vịnh Hạ Long vượt xa mong đợi."
                  helpful={42}
                />
                <ReviewCard
                  name="Trần Văn Hoàng"
                  rating={5}
                  date="Tháng 9, 2025"
                  review="Chuyến đi tuyệt vời nhất! Mọi thứ diễn ra suôn sẻ, khách sạn đẹp, du thuyền tuyệt vời."
                  helpful={28}
                />
                <ReviewCard
                  name="Phạm Thu Hà"
                  rating={4}
                  date="Tháng 8, 2025"
                  review="Tour tuyệt vời với nhiều trải nghiệm. Một số ngày hơi vội nhưng nhìn chung rất đáng giá."
                  helpful={15}
                />
              </div>

              <Separator className="my-6" />

              <Button variant="outline" className="w-full">
                Xem tất cả đánh giá
              </Button>
            </div>


            {/* Liên hệ nhà cung cấp */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border dark:border-gray-700">
              <h3 className="mb-4 dark:text-gray-100">Liên hệ nhà cung cấp Tour</h3>
              <p className="text-muted-foreground dark:text-gray-400 mb-6">
                Có câu hỏi về tour này? Đội ngũ của chúng tôi sẵn sàng hỗ trợ bạn.
              </p>

              <div className="grid md:grid-cols-3 gap-4">
                <Button variant="outline" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" /> Gọi điện
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" /> Chat trực tiếp
                </Button>
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <p className="text-sm dark:text-gray-300">
                  💡 <span className="font-medium">Mẹo:</span> Đặt trước ít nhất 2 tuần để có lựa chọn tốt nhất về chỗ trống và giá cả.
                  Đội ngũ của chúng tôi có thể tùy chỉnh tour này theo sở thích của bạn!
                </p>
              </div>
            </div>
          </div>

          {/* Cột phải: BookingCard */}
          <div className="lg:col-span-1">
            <BookingCard basePrice={599} />
          </div>
        </div>
      </div>
    </div >
  );
}
