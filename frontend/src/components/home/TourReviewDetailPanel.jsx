import { X, Star, Calendar, User, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TourReviewDetailPanel({ review, onClose }) {
  const navigate = useNavigate();

  const handleNavigateToTour = () => {
    navigate(`/tours/${review.tour_id}`);
    onClose();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={24}
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

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Centered Panel */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Review Details</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X size={24} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Tour Information */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {review.tour_name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Calendar size={16} />
                <span>Reviewed on {formatDate(review.created_at)}</span>
              </div>
            </div>

            {/* Reviewer Information */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                <User size={32} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-lg text-gray-900 dark:text-white">
                  {review.username}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Customer</p>
              </div>
            </div>

            {/* Review Content */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Rating</p>
                <div className="flex items-center gap-3">
                  {renderStars(review.rating)}
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {review.rating}/5
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Review</p>
                {review.review_text ? (
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {review.review_text}
                  </p>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic">
                    This customer provided a rating but did not write a detailed review.
                  </p>
                )}
              </div>

              {/* Review Images */}
              {review.review_images && review.review_images.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
                    Photos ({review.review_images.length})
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {review.review_images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Review photo ${index + 1}`}
                        className="w-full h-40 object-cover rounded-lg shadow-md hover:opacity-90 transition-opacity"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Navigate to Tour Button */}
            <div className="pt-4">
              <button
                onClick={handleNavigateToTour}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 px-6 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
              >
                <span>View Tour Details</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
