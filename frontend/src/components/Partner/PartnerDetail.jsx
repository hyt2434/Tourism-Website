import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Star, Phone, Globe, Mail, Award, Users, TrendingUp, CheckCircle2, ArrowRight, Calendar, Clock, MessageCircle, Heart, Share2, Sparkles, X, MapPin, User, Trash2 } from "lucide-react";
import { getPartnerDetail } from "../../api/partners";
import { deleteServiceReview } from "../../api/reviews";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";

export default function PartnerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { translations: t } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [data, setData] = useState({
    partner: null,
    tours: [],
    services: { accommodations: [], restaurants: [], transportations: [] },
    reviews: []
  });

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await getPartnerDetail(id);
        if (res?.success) {
          setData({
            partner: res.partner,
            tours: res.tours || [],
            services: res.services || { accommodations: [], restaurants: [], transportations: [] },
            reviews: res.reviews || []
          });
        } else {
          setError(res?.message || "Failed to load partner detail");
        }
      } catch (err) {
        setError(err.message || "Failed to load partner detail");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
    checkAdminStatus();
  }, [id]);

  const checkAdminStatus = () => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setIsAdmin(userData.role === 'admin');
    }
  };

  const handleDeleteServiceReview = async (reviewId, e) => {
    e.stopPropagation(); // Prevent card click event
    
    if (!window.confirm('Are you sure you want to delete this service review?')) {
      return;
    }

    try {
      setDeletingId(reviewId);
      const data = await deleteServiceReview(reviewId);
      
      if (data.success) {
        toast.success('Service review deleted successfully');
        // Remove review from list
        setData(prev => ({
          ...prev,
          reviews: prev.reviews.filter(r => r.id !== reviewId)
        }));
        // Close panel if this review is currently shown
        if (selectedReview?.id === reviewId) {
          setShowDetailPanel(false);
          setSelectedReview(null);
        }
      } else {
        toast.error(data.message || 'Failed to delete service review');
      }
    } catch (error) {
      console.error('Error deleting service review:', error);
      toast.error('Failed to delete service review');
    } finally {
      setDeletingId(null);
    }
  };

  const partner = data.partner;
  const avatar = partner?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(partner?.name || "Partner")}&background=0D8ABC&color=fff`;

  if (!partner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl">{loading ? "⏳" : "❌"}</div>
          <p className="text-xl text-gray-600 font-medium">{loading ? "Loading..." : (error || "Partner not found")}</p>
          <Link to="/partner">
            <Button className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600">
              <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
              Back to Partners
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="container mx-auto px-6 py-12 relative z-10">
        {/* Back Button */}
        <Link to="/partner" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-8 transition-colors">
          <ArrowRight className="w-4 h-4 rotate-180" />
          <span className="font-medium">Back to Partners</span>
        </Link>

        {/* Hero Header Section */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 mb-8 border border-white/20 relative overflow-hidden">
          {/* Decorative gradient */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start">
            {/* Logo with premium effect */}
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-2xl opacity-40"></div>
              <img
                src={avatar}
                alt={partner.name}
                className="relative w-48 h-48 rounded-full object-cover border-8 border-white shadow-2xl ring-4 ring-blue-100"
              />
              <div className="absolute -bottom-3 -right-3 bg-gradient-to-r from-green-400 to-emerald-500 w-14 h-14 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -top-3 -left-3 bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1 rounded-full text-white text-xs font-bold shadow-lg flex items-center gap-1">
                <Award className="w-3 h-3" />
                Verified
              </div>
            </div>

            <div className="flex-1 space-y-5 text-center md:text-left">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold mb-3">
                  <Sparkles className="w-3 h-3" />
                  Premium Partner
                </div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-900 bg-clip-text text-transparent mb-3">
                  {partner.name}
                </h1>
                <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
                  {partner.description || partner.tourCore || t?.partnerSubtitle || ""}
                </p>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-6 h-6 ${i < Math.round(partner.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-gray-600 font-semibold">
                  {(partner.rating ?? 0).toFixed ? (partner.rating ?? 0).toFixed(1) : (partner.rating ?? 0)}
                </span>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {[ 
                  { icon: Users, label: t?.supportTour || "Support Tour", value: data.tours.length },
                  { icon: Calendar, label: t?.partnerTypeLabel || "Type", value: partner.partner_type || "Partner" },
                  { icon: TrendingUp, label: t?.partnerStats4 || "Growth", value: "+45%" },
                  { icon: Award, label: t?.partnerStats3 || "Rating", value: `${(partner.rating ?? 0).toFixed ? (partner.rating ?? 0).toFixed(1) : (partner.rating ?? 0)}★` }
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-white/20 text-center">
                    <stat.icon className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                    <div className="text-lg font-bold text-gray-900">{stat.value}</div>
                    <div className="text-xs text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 p-2.5 flex-shrink-0">
                <Mail className="w-full h-full text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">{t?.email || "Email"}</p>
                <p className="font-semibold text-gray-900">
                  {partner.email || t?.notAvailable || "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 p-2.5 flex-shrink-0">
                <Phone className="w-full h-full text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">{t?.phone || "Phone"}</p>
                <p className="font-semibold text-gray-900">
                  {partner.phone || t?.notAvailable || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <section className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-xl border border-white/20 mb-8">
          <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
            About {partner.name}
          </h2>
          
          <div className="space-y-4">
            <p className="text-gray-700 leading-relaxed text-lg">
              {partner.name} has been one of our trusted travel partners, providing guests with exceptional
              service, comfort, and unforgettable experiences. Whether you're exploring Vietnam's
              breathtaking landscapes or relaxing at a seaside resort, {partner.name} ensures every trip is memorable.
            </p>

            {/* Success metrics */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 mt-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 p-2.5 flex-shrink-0">
                  <TrendingUp className="w-full h-full text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-green-800 mb-2">Partnership Success Story</h3>
                  <p className="text-green-700 leading-relaxed">{partner.benefit}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Available Tours Section */}
        <section className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-xl border border-white/20 mb-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
              Available Tours
            </h2>
            <Button variant="outline" className="border-2">
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.tours.length === 0 && (
              <div className="text-gray-500">No tours linked to this partner yet.</div>
            )}
            {data.tours.map((tour) => (
              <div 
                key={tour.tour_id} 
                className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]"
              >
                {/* Tour Image */}
                <div className="relative overflow-hidden h-48">
                  <img
                    src={tour.image_url || `https://source.unsplash.com/600x400/?travel,vietnam,${tour.tour_id}`}
                    alt={tour.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      Featured
                    </span>
                  </div>
                  
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                    <div>
                      <h3 className="text-white font-bold text-lg">{tour.name}</h3>
                      <p className="text-white/90 text-sm flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {tour.duration || t?.tourDuration || "Flexible"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tour Details */}
                <div className="p-5 space-y-4">
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {t?.partnerToursCompleted || "Completed bookings"}: {tour.completed_bookings}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500">{t?.startingFrom || "Starting from"}</p>
                      <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {tour.total_price ? `${tour.total_price.toLocaleString('vi-VN')} ₫` : t?.contactForPrice || "Contact"}
                      </p>
                    </div>
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg" onClick={() => window.location.href = `/tours/${tour.tour_id}`}>
                      {t?.bookNow || "Book Now"}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Reviews Section */}
        <section className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-xl border border-white/20 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
              {t?.reviews || "Service Reviews"}
            </h2>
          </div>
          {data.reviews.length === 0 ? (
            <p className="text-gray-500">{t?.noReviews || "No reviews yet."}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.reviews.map((rev) => (
                <div 
                  key={rev.id} 
                  onClick={() => {
                    setSelectedReview(rev);
                    setShowDetailPanel(true);
                  }}
                  className="border border-gray-200 rounded-2xl p-4 bg-white shadow-sm hover:shadow-lg cursor-pointer transition-all duration-300 hover:scale-[1.02] group relative"
                >
                  {/* Admin Delete Button */}
                  {isAdmin && (
                    <button
                      onClick={(e) => handleDeleteServiceReview(rev.id, e)}
                      disabled={deletingId === rev.id}
                      className="absolute top-4 right-4 p-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg transition-colors z-10 disabled:opacity-50"
                      title="Delete service review"
                    >
                      <Trash2 size={18} className={deletingId === rev.id ? 'animate-pulse' : ''} />
                    </button>
                  )}
                  {/* Tour Info */}
                  <div className="mb-3 pb-3 border-b border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{rev.tour_name || "Tour"}</h4>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>{rev.created_at ? new Date(rev.created_at).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}</span>
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{rev.username || "Anonymous"}</span>
                  </div>

                  {/* Service Review */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-gray-900">{rev.service_name || "Service"}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          rev.service_type === 'accommodation' ? 'bg-blue-100 text-blue-700' :
                          rev.service_type === 'restaurant' ? 'bg-orange-100 text-orange-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {rev.service_type === 'accommodation' ? 'Accommodation' :
                           rev.service_type === 'restaurant' ? 'Restaurant' :
                           'Transportation'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < (rev.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    </div>
                    {rev.review_text && (
                      <p className="text-sm text-gray-600 line-clamp-2">{rev.review_text}</p>
                    )}
                  </div>

                  {/* Click hint */}
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-blue-600 text-center group-hover:underline">Click to view details</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Review Detail Panel */}
        {showDetailPanel && selectedReview && (
          <>
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
              onClick={() => {
                setShowDetailPanel(false);
                setSelectedReview(null);
              }}
            />
            <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white dark:bg-gray-800 shadow-2xl z-50 overflow-y-auto transform transition-transform">
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Review Details</h2>
                <div className="flex items-center gap-2">
                  {/* Admin Delete Button */}
                  {isAdmin && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteServiceReview(selectedReview.id, e);
                      }}
                      disabled={deletingId === selectedReview.id}
                      className="p-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete service review"
                    >
                      <Trash2 size={20} className={deletingId === selectedReview.id ? 'animate-pulse' : ''} />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowDetailPanel(false);
                      setSelectedReview(null);
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Tour Information */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-3 mb-3">
                    <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedReview.tour_name || "Tour"}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>Reviewed on {selectedReview.created_at ? new Date(selectedReview.created_at).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}</span>
                  </div>
                </div>

                {/* Reviewer Information */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-lg text-gray-900 dark:text-white">
                      {selectedReview.username || "Anonymous"}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Customer</p>
                  </div>
                </div>

                {/* Service Review */}
                <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                        {selectedReview.service_name || "Service"}
                      </h4>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        selectedReview.service_type === 'accommodation' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        selectedReview.service_type === 'restaurant' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                        {selectedReview.service_type === 'accommodation' ? 'Accommodation' :
                         selectedReview.service_type === 'restaurant' ? 'Restaurant' :
                         'Transportation'}
                      </span>
                    </div>
                  </div>

                  {/* Service Rating */}
                  <div>
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Rating</p>
                    <div className="flex items-center gap-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-6 h-6 ${
                            i < (selectedReview.rating || 0)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">{selectedReview.rating || 0}/5</span>
                    </div>
                  </div>

                  {/* Service Review Text */}
                  {selectedReview.review_text && (
                    <div>
                      <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Review</p>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                        {selectedReview.review_text}
                      </p>
                    </div>
                  )}
                </div>

                {/* Navigate to Tour Button */}
                {selectedReview.tour_id && (
                  <div className="sticky bottom-0 bg-white dark:bg-gray-800 pt-4 pb-2 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => navigate(`/tours/${selectedReview.tour_id}`)}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 px-6 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
                    >
                      <span>View Tour Details</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

