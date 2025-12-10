import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Calendar, User, Image as ImageIcon, ArrowLeft, Loader, MessageSquare } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";
import ReviewDetailPanel from "./ReviewDetailPanel";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ServiceReviewsPage() {
  const navigate = useNavigate();
  const { translations: t } = useLanguage();
  const { toast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [partnerId, setPartnerId] = useState(null);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    const currentUser = localStorage.getItem("user");
    if (currentUser) {
      const user = JSON.parse(currentUser);
      if (user.role !== "partner") {
        navigate("/");
        return;
      }
      setPartnerId(user.id);
      fetchReviews(user.id);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const fetchReviews = async (partnerId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/partner/${partnerId}/reviews`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setReviews(data.reviews);
        
        // Calculate average rating from service reviews
        let totalRating = 0;
        let ratingCount = 0;
        
        data.reviews.forEach(review => {
          review.service_reviews.forEach(svcReview => {
            totalRating += svcReview.rating;
            ratingCount++;
          });
        });
        
        setAverageRating(ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : 0);
      } else {
        toast.error(data.message || 'Failed to load reviews');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewClick = (review) => {
    setSelectedReview(review);
    setShowDetailPanel(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={`${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/partner/manage')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </button>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {t.partnerReviewsTitle || "Service Reviews"}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {t.partnerReviewsDesc || "Manage and view customer reviews for your services"}
                </p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center gap-2 justify-center mb-2">
                  <Star className="w-8 h-8 fill-yellow-400 text-yellow-400" />
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    {averageRating}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Grid */}
        {reviews.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center border border-gray-200 dark:border-gray-700">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No reviews yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Customer reviews will appear here once they rate your services
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                onClick={() => handleReviewClick(review)}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-2xl border border-gray-200 dark:border-gray-700 p-5 cursor-pointer transition-all duration-300 hover:scale-[1.02] group"
              >
                {/* Tour Info */}
                <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {review.tour_name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Calendar size={14} />
                    <span>{formatDate(review.created_at)}</span>
                  </div>
                </div>

                {/* User Info */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <User size={20} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">
                      {review.username}
                    </p>
                  </div>
                </div>

                {/* Service Reviews */}
                <div className="space-y-3">
                  {review.service_reviews.map((svcReview) => (
                    <div
                      key={svcReview.id}
                      className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-sm text-gray-900 dark:text-white truncate flex-1 mr-2">
                          {svcReview.service_name}
                        </p>
                        {renderStars(svcReview.rating)}
                      </div>
                      
                      {svcReview.review_text && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {svcReview.review_text}
                        </p>
                      )}
                      
                      {svcReview.review_images && svcReview.review_images.length > 0 && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <ImageIcon size={14} />
                          <span>{svcReview.review_images.length} photo{svcReview.review_images.length > 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* View Details Hint */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium text-center group-hover:underline">
                    Click to view details
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Detail Panel */}
      {showDetailPanel && selectedReview && (
        <ReviewDetailPanel
          review={selectedReview}
          onClose={() => {
            setShowDetailPanel(false);
            setSelectedReview(null);
          }}
          onNavigateToTour={(tourId) => {
            navigate(`/tours/${tourId}`);
          }}
        />
      )}
    </div>
  );
}
