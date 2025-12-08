import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
// import { BookingCard } from "./BookingCard";
import { BookingPanel } from "./BookingPanel";
import { EnhancedBookingPanel } from "./EnhancedBookingPanel";
import ImageWithFallback from "../../figma/ImageWithFallback";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { useLanguage } from "../../context/LanguageContext";
import { getPublicTourDetail } from "../../api/tours";
import { getAvailableSchedules } from "../../api/tours";
import TourReviews from "../TourReviews";
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
  MessageSquare,
  ShoppingCart,
  Grid,
  ChevronLeft,
  ChevronRight,
  Hotel,
  Utensils,
  Users,
  Calendar,
  Building2,
  Car,
} from "lucide-react";
import { ReviewCard } from "./ReviewCard";
// THÊM IMPORT NÀY
import TourMap from "./TourMap";

export default function TourDetail() {
  const { translations } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const [tourData, setTourData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [isBookingPanelOpen, setIsBookingPanelOpen] = useState(false);
  const [showStickyButton, setShowStickyButton] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [userRole, setUserRole] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [availableSchedules, setAvailableSchedules] = useState([]);
  const headerButtonRef = useRef(null);

  // Helper function to check if user can book
  const canBook = () => {
    return isLoggedIn && userRole !== "partner";
  };

  // Handle booking button click - redirect to login if not logged in
  const handleBookingClick = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    if (userRole === "partner") {
      alert(translations.partnersCannotBook || "Đối tác không thể đặt tour.");
      return;
    }
    setIsBookingPanelOpen(true);
  };

  // Load tour data from API
  useEffect(() => {
    loadTourData();
  }, [id]);

  const loadTourData = async () => {
    try {
      setLoading(true);
      const data = await getPublicTourDetail(id);
      console.log('Loaded tour data:', data);
      console.log('Itinerary:', data?.itinerary);
      setTourData(data);
      
      // Load available schedules
      const schedules = await getAvailableSchedules(id);
      console.log('Loaded schedules:', schedules);
      setAvailableSchedules(schedules);
    } catch (error) {
      console.error('Error loading tour:', error);
      alert('Failed to load tour details');
    } finally {
      setLoading(false);
    }
  };

  // Check user role from localStorage
  useEffect(() => {
    const currentUser = localStorage.getItem("user");
    if (currentUser) {
      const user = JSON.parse(currentUser);
      setUserRole(user.role);
      setIsLoggedIn(user.isLoggedIn || false);
      // Only allow booking if user is logged in and not a partner
      if (!user.isLoggedIn || user.role === "partner") {
        setIsBookingPanelOpen(false);
      }
    } else {
      // No user logged in, close booking panel if open
      setIsLoggedIn(false);
      setIsBookingPanelOpen(false);
    }
  }, []);

  const tourImages = tourData?.images || [];

  // Detect khi button header scroll ra khỏi màn hình
  useEffect(() => {
    const handleScroll = () => {
      setShowStickyButton(window.scrollY > 200);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const openGallery = (index = 0) => {
    setCurrentImageIndex(index);
    setShowGallery(true);
    document.body.style.overflow = "hidden";
  };

  const closeGallery = () => {
    setShowGallery(false);
    document.body.style.overflow = "unset";
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % tourImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + tourImages.length) % tourImages.length
    );
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showGallery) {
        if (e.key === "Escape") closeGallery();
        if (e.key === "ArrowRight") nextImage();
        if (e.key === "ArrowLeft") prevImage();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showGallery]);

  // Class cho TabsTrigger - ĐÃ SỬA: Viền mềm mại, không nền cho inactive state
  const tabTriggerClassName =
    // --- Style cơ bản (cho tab inactive) ---
    "flex-1 justify-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 " +
    "border border-gray-200 dark:border-gray-600 " + // Viền nhẹ nhàng hơn
    "text-gray-600 dark:text-gray-300 " +
    "hover:bg-gray-50 dark:hover:bg-gray-700 " + // Giữ hover background
    // --- Style khi active (giữ nguyên) ---
    "data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-100 data-[state=active]:to-purple-100 " +
    "dark:data-[state=active]:from-blue-900/40 dark:data-[state=active]:to-purple-900/40 " +
    "data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-300 " +
    "data-[state=active]:font-semibold data-[state=active]:shadow-sm " +
    "data-[state=active]:border-transparent"; // Ẩn viền base khi active

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading tour details...</p>
        </div>
      </div>
    );
  }

  if (!tourData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Tour not found</p>
        </div>
      </div>
    );
  }

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
                  <span className="text-gray-900 dark:text-white">
                    {tourData.rating}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 font-normal">
                    ({tourData.reviewCount} {translations.reviews || "đánh giá"}
                    )
                  </span>
                </div>
                <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300 font-medium">
                  <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>{tourData.location}</span>
                </div>
                {tourData.duration && (
                  <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300 font-medium">
                    <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span>{tourData.duration}</span>
                  </div>
                )}
                {tourData.number_of_members && (
                  <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300 font-medium">
                    <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span>{tourData.number_of_members} {translations.people || "người"}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {userRole !== "partner" && (
                <Button
                  ref={headerButtonRef}
                  onClick={handleBookingClick}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                  size="lg"
                >
                  {translations.bookNow || "Đặt Tour Ngay"}
                </Button>
              )}
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border-gray-300 dark:border-gray-600"
              >
                <Share2 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border-gray-300 dark:border-gray-600"
              >
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
            {tourImages.length > 0 ? (
              <div className="relative rounded-2xl overflow-hidden">
                <div className="grid grid-cols-5 gap-2">
                  {/* Ảnh chính */}
                  <div
                    className="col-span-5 md:col-span-3 relative group cursor-pointer overflow-hidden rounded-lg"
                    onClick={() => openGallery(0)}
                  >
                    <img
                      src={tourImages[0].url}
                      alt={tourImages[0].caption || `${tourData.title} - Ảnh chính`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      style={{ minHeight: "350px", maxHeight: "450px" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* 4 ảnh nhỏ */}
                  <div className="col-span-5 md:col-span-2 grid grid-cols-2 gap-2">
                    {tourImages.slice(1, 4).map((image, index) => (
                      <div
                        key={image.id}
                        className="relative group cursor-pointer overflow-hidden rounded-lg"
                        onClick={() => openGallery(index + 1)}
                      >
                        <img
                          src={image.url}
                          alt={image.caption || `${tourData.title} - Ảnh ${index + 2}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 block"
                          style={{ minHeight: "145px", maxHeight: "145px", display: "block" }}
                        />
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors" />
                      </div>
                    ))}

                    {/* Ảnh cuối với overlay */}
                    {tourImages.length >= 5 && (
                      <div
                        className="relative group cursor-pointer overflow-hidden rounded-lg"
                        onClick={() => openGallery(4)}
                      >
                        <img
                          src={tourImages[4].url}
                          alt={tourImages[4].caption || `${tourData.title} - Ảnh 5`}
                          className="w-full h-full object-cover block"
                          style={{ minHeight: "145px", maxHeight: "145px", display: "block" }}
                        />
                        <div className="absolute inset-0 bg-black/60 hover:bg-black/70 transition-colors flex items-center justify-center">
                          <div className="text-center text-white">
                            <Grid className="w-6 h-6 mx-auto mb-1" />
                            <p className="text-sm font-bold">Xem thêm</p>
                            <p className="text-xs">{tourImages.length} ảnh</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl h-96 flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">Chưa có hình ảnh</p>
              </div>
            )}

            {/* Gallery Modal - Full screen */}
            {showGallery && (
              <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center py-[10vh] px-4">
                {/* Close button */}
                <button
                  onClick={closeGallery}
                  className="absolute top-[10vh] right-4 text-white hover:text-gray-300 transition-colors z-10"
                >
                  <X className="w-8 h-8" />
                </button>

                {/* Image counter */}
                <div className="absolute top-[10vh] left-4 text-white text-lg font-semibold z-10">
                  {currentImageIndex + 1} / {tourImages.length}
                </div>

                {/* Previous button */}
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-3 hover:bg-black/70 z-10"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>

                {/* Main image */}
                <div className="max-w-6xl w-full max-h-[80vh] mx-auto px-4 md:px-20 flex items-center justify-center">
                  <img
                    src={tourImages[currentImageIndex]?.url}
                    alt={tourImages[currentImageIndex]?.caption || `${tourData.title} - Ảnh ${currentImageIndex + 1}`}
                    className="max-w-full max-h-[80vh] w-auto h-auto object-contain"
                  />
                </div>

                {/* Next button */}
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-3 hover:bg-black/70 z-10"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>

                {/* Thumbnails */}
                <div className="absolute bottom-[10vh] left-0 right-0 px-4">
                  <div className="max-w-4xl mx-auto flex gap-2 overflow-x-auto pb-2">
                    {tourImages.map((image, index) => (
                      <img
                        key={image.id}
                        src={image.url}
                        alt={image.caption || `Thumbnail ${index + 1}`}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-20 h-16 object-cover rounded cursor-pointer transition-all ${
                          index === currentImageIndex
                            ? "ring-2 ring-white opacity-100 scale-110"
                            : "opacity-50 hover:opacity-75"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tabs nội dung */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full justify-start bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-gray-700"
                >
                  {translations.tourOverview || "Tổng quan"}
                </TabsTrigger>
                <TabsTrigger
                  value="itinerary"
                  className="data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-gray-700"
                >
                  {translations.tourItinerary || "Lịch trình"}
                </TabsTrigger>
                <TabsTrigger
                  value="included"
                  className="data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-gray-700"
                >
                  {translations.tourIncluded || "Bao gồm"}
                </TabsTrigger>
                <TabsTrigger
                  value="location"
                  className="data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-gray-700"
                >
                  {translations.tourLocation || "Địa điểm"}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 mt-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    {translations.aboutTrip || "Về chuyến đi này"}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-line">
                    {tourData.description}
                  </p>
                  {tourData.tags && tourData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {tourData.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {tourData.highlights && tourData.highlights.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                      {translations.tourHighlights || "Điểm nổi bật"}
                    </h3>
                    <ul className="space-y-3">
                      {tourData.highlights.map((highlight, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700 dark:text-gray-300">
                            {highlight}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Partners Information */}
                {tourData.partners && tourData.partners.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-purple-500" />
                      {translations.tourPartners || "Đối tác"}
                    </h3>
                    <div className="space-y-4">
                      {tourData.partners.map((partner, index) => (
                        <div key={partner.id || index} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0 last:pb-0">
                          <div>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                              {partner.name}
                            </p>
                            {partner.partner_type && (
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {partner.partner_type === 'accommodation' ? 
                                  (translations.partnerTypeAccommodation || translations.accommodation || 'Khách sạn') :
                                 partner.partner_type === 'transportation' ? 
                                  (translations.partnerTypeTransportation || translations.transportation || 'Vận chuyển') :
                                 partner.partner_type === 'restaurant' ? 
                                  (translations.partnerTypeRestaurant || translations.restaurant || 'Nhà hàng') :
                                 partner.partner_type}
                              </p>
                            )}
                          </div>
                          <div className="mt-2 space-y-1">
                            {partner.email && (
                              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm">
                                <Mail className="w-4 h-4" />
                                <span>{partner.email}</span>
                              </div>
                            )}
                            {partner.phone && (
                              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm">
                                <Phone className="w-4 h-4" />
                                <span>{partner.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="itinerary" className="mt-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 space-y-6 border border-gray-200 dark:border-gray-700">
                  {tourData.itinerary && tourData.itinerary.length > 0 ? (
                    tourData.itinerary.map((day) => (
                      <div key={day.day_number || day.id} className="border-l-4 border-blue-500 pl-6 pb-6">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 rounded-full bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center font-semibold text-lg shadow-md">
                            {day.day_number || day.day}
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                              Ngày {day.day_number || day.day}
                            </h4>
                            {day.day_title && (
                              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                                {day.day_title}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {day.day_summary && (
                          <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed whitespace-pre-line">
                            {day.day_summary}
                          </p>
                        )}

                        {/* Time checkpoints if available */}
                        {day.checkpoints && (
                          <div className="space-y-3 mt-4">
                            {/* Morning */}
                            {day.checkpoints.morning && day.checkpoints.morning.length > 0 && (
                              <div>
                                <h5 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">🌅 Buổi sáng</h5>
                                <div className="space-y-2">
                                  {day.checkpoints.morning.map((cp, idx) => (
                                    <div key={cp.id || idx} className="flex gap-2 text-sm">
                                      <span className="font-medium text-blue-600 dark:text-blue-400 min-w-[60px]">
                                        {cp.checkpoint_time}
                                      </span>
                                      <div className="flex-1">
                                        <p className="font-medium text-gray-900 dark:text-white">{cp.activity_title}</p>
                                        {cp.activity_description && (
                                          <p className="text-gray-600 dark:text-gray-400 text-sm">{cp.activity_description}</p>
                                        )}
                                        {cp.location && (
                                          <p className="text-gray-500 dark:text-gray-500 text-xs flex items-center gap-1 mt-1">
                                            <MapPin className="w-3 h-3" /> {cp.location}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Noon */}
                            {day.checkpoints.noon && day.checkpoints.noon.length > 0 && (
                              <div>
                                <h5 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">☀️ Buổi trưa</h5>
                                <div className="space-y-2">
                                  {day.checkpoints.noon.map((cp, idx) => (
                                    <div key={cp.id || idx} className="flex gap-2 text-sm">
                                      <span className="font-medium text-blue-600 dark:text-blue-400 min-w-[60px]">
                                        {cp.checkpoint_time}
                                      </span>
                                      <div className="flex-1">
                                        <p className="font-medium text-gray-900 dark:text-white">{cp.activity_title}</p>
                                        {cp.activity_description && (
                                          <p className="text-gray-600 dark:text-gray-400 text-sm">{cp.activity_description}</p>
                                        )}
                                        {cp.location && (
                                          <p className="text-gray-500 dark:text-gray-500 text-xs flex items-center gap-1 mt-1">
                                            <MapPin className="w-3 h-3" /> {cp.location}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Evening */}
                            {day.checkpoints.evening && day.checkpoints.evening.length > 0 && (
                              <div>
                                <h5 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">🌙 Buổi tối</h5>
                                <div className="space-y-2">
                                  {day.checkpoints.evening.map((cp, idx) => (
                                    <div key={cp.id || idx} className="flex gap-2 text-sm">
                                      <span className="font-medium text-blue-600 dark:text-blue-400 min-w-[60px]">
                                        {cp.checkpoint_time}
                                      </span>
                                      <div className="flex-1">
                                        <p className="font-medium text-gray-900 dark:text-white">{cp.activity_title}</p>
                                        {cp.activity_description && (
                                          <p className="text-gray-600 dark:text-gray-400 text-sm">{cp.activity_description}</p>
                                        )}
                                        {cp.location && (
                                          <p className="text-gray-500 dark:text-gray-500 text-xs flex items-center gap-1 mt-1">
                                            <MapPin className="w-3 h-3" /> {cp.location}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                      {translations.noItinerary || "Chưa có lịch trình chi tiết"}
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="included" className="mt-6">
                <div className="space-y-6">
                  {/* Accommodation - Display detailed information */}
                  {tourData.accommodationDetails && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                        <Hotel className="w-5 h-5 text-purple-500" />
                        {translations.accommodation || "Khách sạn"}
                      </h4>
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h5 className="font-semibold text-gray-900 dark:text-white mb-1">
                              {tourData.accommodationDetails.name}
                            </h5>
                            {tourData.accommodationDetails.star_rating && (
                              <div className="flex items-center gap-1 mb-2">
                                {[...Array(tourData.accommodationDetails.star_rating)].map((_, i) => (
                                  <span key={i} className="text-yellow-500">⭐</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        {tourData.accommodationDetails.address && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-start gap-2">
                            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            {tourData.accommodationDetails.address}
                          </p>
                        )}
                        {tourData.accommodationDetails.description && (
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                            {tourData.accommodationDetails.description}
                          </p>
                        )}
                        
                        {/* Room Details */}
                        {tourData.roomBookings && tourData.roomBookings.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <h6 className="font-medium text-gray-900 dark:text-white mb-3">
                              {translations.roomDetails || "Room Details"} ({tourData.roomBookings.reduce((sum, r) => sum + r.quantity, 0)} {translations.rooms || "rooms"})
                            </h6>
                            <div className="grid md:grid-cols-2 gap-3">
                              {tourData.roomBookings.map((room, idx) => (
                                <div key={idx} className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                                  {room.image && (
                                    <img
                                      src={room.image}
                                      alt={room.name}
                                      className="w-full h-32 object-cover rounded mb-2"
                                    />
                                  )}
                                  <div className="flex items-start justify-between mb-2">
                                    <h6 className="font-medium text-sm text-gray-900 dark:text-white">
                                      {room.name || room.roomType}
                                    </h6>
                                    <Badge variant="secondary" className="text-xs">
                                      {room.quantity} phòng
                                    </Badge>
                                  </div>
                                  <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                                    {room.bedType && (
                                      <p>🛏️ {room.bedType}</p>
                                    )}
                                    {room.maxAdults && (
                                      <p>
                                        <Users className="w-3 h-3 inline mr-1" />
                                        {room.maxAdults} người lớn
                                        {room.maxChildren ? ` + ${room.maxChildren} trẻ em` : ''}
                                      </p>
                                    )}
                                    {room.roomSize && (
                                      <p>📐 {room.roomSize}m²</p>
                                    )}
                                    {room.viewType && (
                                      <p>👁️ {room.viewType}</p>
                                    )}
                                  </div>
                                  {room.amenities && room.amenities.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1">
                                      {room.amenities.slice(0, 3).map((amenity, i) => (
                                        <span key={i} className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                                          {amenity}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Restaurants - Display set meals with details */}
                  {tourData.selectedSetMeals && tourData.selectedSetMeals.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                        <Utensils className="w-5 h-5 text-orange-500" />
                        {translations.meals || "Bữa ăn"}
                      </h4>
                      <div className="space-y-4">
                        {/* Group by day */}
                        {Object.entries(
                          tourData.selectedSetMeals.reduce((acc, meal) => {
                            if (!acc[meal.day_number]) acc[meal.day_number] = [];
                            acc[meal.day_number].push(meal);
                            return acc;
                          }, {})
                        ).map(([day, meals]) => {
                          // Sort meals by session: morning -> noon -> evening
                          const sessionOrder = { 'morning': 1, 'noon': 2, 'evening': 3 };
                          const sortedMeals = [...meals].sort((a, b) => 
                            sessionOrder[a.meal_session] - sessionOrder[b.meal_session]
                          );
                          
                          return (
                          <div key={day} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <h5 className="font-semibold text-gray-900 dark:text-white mb-3">
                              {translations.day || "Day"} {day}
                            </h5>
                            <div className="space-y-3">
                              {sortedMeals.map((meal, idx) => (
                                <div key={idx} className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <Badge variant="secondary" className="text-xs">
                                          {meal.meal_session === 'morning' ? '🌅 ' + (translations.morning || 'Morning') : 
                                           meal.meal_session === 'noon' ? '☀️ ' + (translations.noon || 'Noon') : 
                                           '🌙 ' + (translations.evening || 'Evening')}
                                        </Badge>
                                      </div>
                                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1">
                                        <Utensils className="w-3 h-3" />
                                        {meal.restaurant_name}
                                        {meal.cuisine_type && ` • ${meal.cuisine_type}`}
                                      </p>
                                      {meal.set_meal_description && (
                                        <p className="text-xs text-gray-700 dark:text-gray-300 mb-2">
                                          {meal.set_meal_description}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Menu items in set meal */}
                                  {meal.menu_items && meal.menu_items.length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Món ăn:
                                      </p>
                                      <div className="grid grid-cols-2 gap-2">
                                        {meal.menu_items.map((item, i) => (
                                          <div key={i} className="text-xs text-gray-600 dark:text-gray-400">
                                            <span className="font-medium text-gray-800 dark:text-gray-200">
                                              • {item.name}
                                            </span>
                                            {item.description && (
                                              <p className="text-gray-500 dark:text-gray-500 ml-3 line-clamp-1">
                                                {item.description}
                                              </p>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Transportation */}
                  {tourData.services?.transportation && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                        <Car className="w-5 h-5 text-blue-500" />
                        {translations.transportation || "Phương tiện di chuyển"}
                      </h4>
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <h5 className="font-semibold text-gray-900 dark:text-white mb-3">
                          {(() => {
                            if (tourData.services.transportation.service_name) {
                              // Capitalize first letter of vehicle type only (e.g., "bus - 30A-12345" -> "Bus - 30A-12345")
                              const parts = tourData.services.transportation.service_name.split(' - ');
                              if (parts.length > 0) {
                                const vehicleType = parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
                                return parts.length > 1 ? `${vehicleType} - ${parts.slice(1).join(' - ')}` : vehicleType;
                              }
                              return tourData.services.transportation.service_name;
                            }
                            if (tourData.services.transportation.vehicle_type) {
                              return tourData.services.transportation.vehicle_type.charAt(0).toUpperCase() + 
                                     tourData.services.transportation.vehicle_type.slice(1).toLowerCase();
                            }
                            return '';
                          })()}
                        </h5>
                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                          {tourData.services.transportation.vehicle_type && (
                            <p className="flex items-center gap-2">
                              <Car className="w-4 h-4" />
                              <span>
                                {translations.vehicleType || "Loại xe"}: {
                                  tourData.services.transportation.vehicle_type.charAt(0).toUpperCase() + 
                                  tourData.services.transportation.vehicle_type.slice(1).toLowerCase()
                                }
                              </span>
                            </p>
                          )}
                          {tourData.services.transportation.license_plate && (
                            <p>{translations.licensePlate || "Biển số"}: {tourData.services.transportation.license_plate}</p>
                          )}
                          {tourData.services.transportation.brand && (
                            <p>{translations.brand || "Hãng"}: {tourData.services.transportation.brand}</p>
                          )}
                          {tourData.services.transportation.capacity && (
                            <p>{translations.capacity || "Sức chứa"}: {tourData.services.transportation.capacity} {translations.people || "người"}</p>
                          )}
                          {tourData.services.transportation.description && (
                            <p className="mt-2 text-gray-700 dark:text-gray-300">{tourData.services.transportation.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Included Items (if any) */}
                  {tourData.included && tourData.included.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
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
                  )}
                </div>
              </TabsContent>

              <TabsContent value="location" className="mt-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    {translations.tourLocationHotel ||
                      "Địa điểm Tour & Khách sạn"}
                  </h3>

                  {/* Embedded Map showing destination city */}
                  {tourData.destination_city && (
                    <TourMap
                      locations={tourData.tourLocations || []}
                      centerCoords={tourData.centerCoordinates}
                      destinationCityName={tourData.destination_city.name}
                      hotelInfo={tourData.hotel ? {
                        name: tourData.hotel.name,
                        description: tourData.hotel.description,
                        address: tourData.hotel.address,
                        coordinates: tourData.hotel.coordinates,
                      } : null}
                    />
                  )}

                  {tourData.hotel && (
                    /* Thông tin khách sạn bên dưới map */
                    <div className="mt-6 space-y-2">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {tourData.hotel.name}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        {tourData.hotel.description}
                      </p>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>{tourData.hotel.address}</span>
                      </div>
                    </div>
                  )}

                  {/* Danh sách địa điểm trong tour */}
                  {tourData.tourLocations &&
                    tourData.tourLocations.length > 0 && (
                      <div className="mt-8">
                        <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                          Các địa điểm tham quan
                        </h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          {tourData.tourLocations.map((location, index) => (
                            <div
                              key={index}
                              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                  <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex-1">
                                  <h5 className="font-semibold text-gray-900 dark:text-white mb-1">
                                    {location.name}
                                  </h5>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    {location.description}
                                  </p>
                                  {location.visitDay && (
                                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                      Ngày {location.visitDay}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </TabsContent>
            </Tabs>

            {/* Tour Reviews Section */}
            <TourReviews tourId={tourData.id} />

            {/* Liên hệ nhà cung cấp */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                {translations.contactProvider || "Liên hệ nhà cung cấp Tour"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {translations.contactProviderDesc ||
                  "Có câu hỏi về tour này? Đội ngũ của chúng tôi sẵn sàng giúp bạn lên kế hoạch cho chuyến đi hoàn hảo."}
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="flex items-center gap-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Phone className="w-4 h-4" />
                  {translations.callPhone || "Gọi điện"}
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Mail className="w-4 h-4" />
                  Email
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <MessageCircle className="w-4 h-4" />
                  {translations.liveChat || "Chat trực tiếp"}
                </Button>
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  💡{" "}
                  <span className="font-medium">
                    {translations.tip || "Mẹo"}:
                  </span>{" "}
                  {translations.bookingTip ||
                    "Đặt trước ít nhất 2 tuần để có lựa chọn tốt nhất về chỗ trống và giá cả. Đội ngũ của chúng tôi có thể tùy chỉnh tour này theo sở thích của bạn!"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Booking Button - Bottom Mobile */}
      {showStickyButton && userRole !== "partner" && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-50 md:hidden">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Giá từ
              </span>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {tourData.basePrice.toLocaleString("vi-VN")}đ
              </span>
            </div>
            <Button
              onClick={handleBookingClick}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl px-8 py-6 text-lg"
            >
              Đặt Tour Ngay
            </Button>
          </div>
        </div>
      )}

      {/* Sticky Booking Button - Side Desktop */}
      {showStickyButton && userRole !== "partner" && (
        <div className="hidden md:block fixed bottom-8 right-8 z-50">
          <Button
            onClick={handleBookingClick}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold shadow-2xl hover:shadow-3xl px-8 py-6 text-lg rounded-full animate-pulse hover:animate-none"
            size="lg"
          >
            <span className="flex items-center gap-2">💼 Đặt Tour Ngay</span>
          </Button>
        </div>
      )}

      {/* Enhanced Booking Panel */}
      {canBook() && (
        <EnhancedBookingPanel
          isOpen={isBookingPanelOpen}
          onClose={() => setIsBookingPanelOpen(false)}
          tourId={tourData.id}
          tourData={tourData}
          basePrice={tourData.basePrice}
        />
      )}
    </div>
  );
}
