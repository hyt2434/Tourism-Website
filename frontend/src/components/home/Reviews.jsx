import { useState, useEffect } from "react";
import { Star, Loader, Trash2 } from "lucide-react";
import Card from "./Card";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";
import TourReviewDetailPanel from "./TourReviewDetailPanel";
import { getLatestReviews, deleteReview } from "../../api/reviews";

export default function Reviews() {
  const { translations } = useLanguage();
  const { toast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchLatestReviews();
    checkAdminStatus();
  }, []);

  const checkAdminStatus = () => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setIsAdmin(userData.role === 'admin');
    }
  };

  const fetchLatestReviews = async () => {
    try {
      setLoading(true);
      const data = await getLatestReviews(4);
      
      if (data.success) {
        setReviews(data.reviews);
      } else {
        console.error('Failed to fetch reviews:', data.message);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewClick = (review) => {
    setSelectedReview(review);
    setShowDetailPanel(true);
  };

  const handleClosePanel = () => {
    setShowDetailPanel(false);
    setSelectedReview(null);
  };

  const handleDeleteReview = async (reviewId, e) => {
    e.stopPropagation(); // Prevent card click event
    
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      setDeletingId(reviewId);
      const data = await deleteReview(reviewId);
      
      if (data.success) {
        toast.success('Review deleted successfully');
        // Remove review from list
        setReviews(reviews.filter(r => r.id !== reviewId));
        // Close panel if this review is currently shown
        if (selectedReview?.id === reviewId) {
          handleClosePanel();
        }
      } else {
        toast.error(data.message || 'Failed to delete review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    } finally {
      setDeletingId(null);
    }
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
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <section className="py-12 px-4 md:px-8 lg:px-36 bg-white dark:bg-gray-800 transition-colors duration-300">
        <div className="flex items-center justify-center py-12">
          <Loader className="w-12 h-12 animate-spin text-blue-600" />
        </div>
      </section>
    );
  }

  if (reviews.length === 0) {
    return null;
  }

  return (
    <section className="py-12 px-4 md:px-8 lg:px-36 bg-white dark:bg-gray-800 transition-colors duration-300">
      <div>
        <h2 className="text-3xl md:text-4xl font-bold text-title dark:text-white mb-8">
          {translations.reviewsTitle}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((review) => (
            <Card key={review.id} hover={false}>
              <div 
                onClick={() => handleReviewClick(review)}
                className="p-6 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 shine-effect cursor-pointer hover:shadow-lg transition-shadow relative"
              >
                {/* Admin Delete Button */}
                {isAdmin && (
                  <button
                    onClick={(e) => handleDeleteReview(review.id, e)}
                    disabled={deletingId === review.id}
                    className="absolute top-4 right-4 p-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg transition-colors z-10 disabled:opacity-50"
                    title="Delete review"
                  >
                    <Trash2 size={18} className={deletingId === review.id ? 'animate-pulse' : ''} />
                  </button>
                )}

                {/* Tour Name */}
                <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-2 line-clamp-1 pr-12">
                  {review.tour_name}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  {renderStars(review.rating)}
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {review.rating}/5
                  </span>
                </div>

                {/* Review Text */}
                {review.review_text ? (
                  <p className="text-body dark:text-gray-300 mb-4 leading-relaxed line-clamp-3">
                    "{review.review_text}"
                  </p>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 mb-4 italic text-sm">
                    Customer rated this tour {review.rating} stars
                  </p>
                )}

                {/* Reviewer Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-sm">
                        {review.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-title font-medium dark:text-white block">
                        {review.username}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(review.created_at)}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Review Detail Panel */}
      {showDetailPanel && selectedReview && (
        <TourReviewDetailPanel
          review={selectedReview}
          onClose={handleClosePanel}
          isAdmin={isAdmin}
          onDelete={handleDeleteReview}
        />
      )}
    </section>
  );
}
