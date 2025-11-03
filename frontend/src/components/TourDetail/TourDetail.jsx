import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Thumbs, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/thumbs";
import { BookingCard } from "./BookingCard";
import { ReviewCard } from "./ReviewCard";
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

export default function TourDetail() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [isBookingPanelOpen, setIsBookingPanelOpen] = useState(false);

  const tourImages = [
    "https://images.unsplash.com/photo-1668000018482-a02acf02b22a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYWxvbmclMjBiYXklMjB2aWV0bmFtfGVufDF8fHx8MTc2MTY5OTMwMnww&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1729605411476-defbdab14c54?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMGx1eHVyeSUyMHJvb218ZW58MXx8fHwxNzYxNzkxNzI0fDA&ixlib=rb-4.1.0&q=80&w=1080",
    "https://res.klook.com/images/fl_lossy.progressive,q_65/c_fill,w_1200,h_630/w_80,x_15,y_15,g_south_west,l_Klook_water_br_trans_yhcmh3/activities/qmgtdjekctlyucr8itqw/%C4%90%E1%BA%B7t%20tour%20%C4%91i%20V%E1%BB%8Bnh%20H%E1%BA%A1%20Long%20t%E1%BB%AB%20H%C3%A0%20N%E1%BB%99i.jpg",
    "https://bcp.cdnchinhphu.vn/344443456812359680/2025/5/31/hanoi-17486566616582033334984.jpg",

  ];

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
      <div className="bg-white border-b">
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
                  <span className="text-muted-foreground">(324 đánh giá)</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>Hà Nội & Vịnh Hạ Long, Việt Nam</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => setIsBookingPanelOpen(true)}
                className="bg-primary hover:bg-primary/90"
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
                    Bắt đầu cuộc hành trình khó quên qua những điểm đến mang
                    tính biểu tượng nhất của Việt Nam. Chuyến phiêu lưu 5 ngày
                    được thiết kế tỉ mỉ này kết hợp những con phố nhộn nhịp của
                    Hà Nội với vẻ đẹp thanh bình của Vịnh Hạ Long, mang đến cho
                    bạn sự pha trộn hoàn hảo giữa văn hóa, lịch sử và kỳ quan
                    thiên nhiên.
                  </p>
                  <p className="text-foreground mb-4">
                    Trải nghiệm nét quyến rũ của Phố Cổ Hà Nội, nơi những ngôi
                    đền cổ kính đứng cạnh những khu chợ sôi động và những người
                    bán hàng rong phục vụ một số món ăn ngon nhất thế giới. Sau
                    đó, thoát khỏi khung cảnh kỳ diệu của Vịnh Hạ Long, nơi hàng
                    nghìn hòn đảo đá vôi nhô lên từ làn nước màu ngọc lục bảo,
                    tạo nên một trong những cảnh quan biển ngoạn mục nhất thế
                    giới.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Badge variant="secondary">Du lịch văn hóa</Badge>
                    <Badge variant="secondary">Thiên nhiên</Badge>
                    <Badge variant="secondary">Ẩm thực</Badge>
                    <Badge variant="secondary">Nhiếp ảnh</Badge>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6">
                  <h3 className="mb-4">Điểm nổi bật</h3>
                  <ul className="space-y-3">
                    {[
                      "Du nhoàn trên Vịnh Hạ Long bằng thuyền buồm truyền thống",
                      "Khám phá Phố Cổ Hà Nội và các di tích lịch sử",
                      "Tham quan Văn Miếu Quốc Tử Giám - trường đại học đầu tiên của Việt Nam",
                      "Thưởng thức ẩm thực Việt Nam chính gốc và tour ẩm thực đường phố",
                      "Trải nghiệm biểu diễn Múa rối nước truyền thống",
                      "Lưu trú tại các khách sạn boutique được tuyển chọn kỹ lưỡng",
                    ].map((highlight, index) => (
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
                  {[
                    {
                      day: 1,
                      title: "Đến Hà Nội",
                      description:
                        "Chào mừng đến Việt Nam! Đưa đón về khách sạn và thưởng thức bữa tối chào mừng với các món ăn truyền thống Việt Nam.",
                    },
                    {
                      day: 2,
                      title: "Tour Hà Nội",
                      description:
                        "Khám phá Phố Cổ, Văn Miếu và thưởng thức chương trình Múa rối nước truyền thống vào buổi tối.",
                    },
                    {
                      day: 3,
                      title: "Du thuyền Vịnh Hạ Long",
                      description:
                        "Hành trình đến Vịnh Hạ Long và lên tàu du thuyền. Tham quan hang động, chèo kayak và ngắm hoàng hôn trên boong tàu.",
                    },
                    {
                      day: 4,
                      title: "Vịnh Hạ Long & Trở về",
                      description:
                        "Tập Thái Cực Quyền buổi sáng trên boong tàu, tham quan làng chài nổi và trở về Hà Nội vào buổi chiều.",
                    },
                    {
                      day: 5,
                      title: "Khởi hành",
                      description:
                        "Thời gian tự do mua sắm phút chót trước khi đưa ra sân bay.",
                    },
                  ].map((day) => (
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
                      {[
                        "4 đêm lưu trú",
                        "Ăn sáng hàng ngày",
                        "Hướng dẫn viên tiếng Anh chuyên nghiệp",
                        "Tất cả phí tham quan",
                        "Đưa đón sân bay",
                        "Du thuyền Vịnh Hạ Long",
                      ].map((item, index) => (
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
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.863981044554!2d105.84117931533417!3d21.028510885995806!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab9bd9861ca1%3A0xe7887f7b72ca17a9!2sHanoi%2C%20Vietnam!5e0!3m2!1sen!2s!4v1635000000000!5m2!1sen!2s"
                      width="100%"
                      height="400"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                    ></iframe>
                  </div>
                  <div className="space-y-2">
                    <h4>Thông tin khách sạn</h4>
                    <p className="text-muted-foreground">
                      Bạn sẽ lưu trú tại Khách sạn Hanoi Pearl, một khách sạn
                      boutique 4 sao ở trung tâm Phố Cổ, chỉ cách vài bước chân
                      đến Hồ Hoàn Kiếm và những nhà hàng tốt nhất thành phố.
                    </p>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span>📍 87 Mã Mây, Phố Cổ, Hà Nội</span>
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
                  <span className="text-2xl">4.8</span>
                  <div>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          className={
                            i < 5 ? "text-yellow-400" : "text-gray-300"
                          }
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      324 đánh giá
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <ReviewCard
                  name="Nguyễn Minh Anh"
                  rating={5}
                  date="Tháng 10, 2025"
                  review="Trải nghiệm tuyệt vời! Tour được tổ chức hoàn hảo, hướng dẫn viên hiểu biết và thân thiện, Vịnh Hạ Long vượt xa mong đợi. Trải nghiệm ẩm thực ở Hà Nội là điểm nhấn!"
                  helpful={42}
                />
                <ReviewCard
                  name="Trần Văn Hoàng"
                  rating={5}
                  date="Tháng 9, 2025"
                  review="Chuyến đi tuyệt vời nhất! Mọi thứ diễn ra suôn sẻ từ đầu đến cuối. Khách sạn đẹp, du thuyền tuyệt vời, và chúng tôi học được rất nhiều về văn hóa và lịch sử Việt Nam."
                  helpful={28}
                />
                <ReviewCard
                  name="Phạm Thu Hà"
                  rating={4}
                  date="Tháng 8, 2025"
                  review="Tour tuyệt vời với những địa điểm và trải nghiệm tuyệt vời. Chỉ có một lưu ý nhỏ là một số ngày cảm thấy hơi vội, nhưng nhìn chung rất khuyến khích tour này!"
                  helpful={15}
                />
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
        basePrice={299} 
        isOpen={isBookingPanelOpen}
        onClose={() => setIsBookingPanelOpen(false)}
      />
    </div>
  );
}
