import { useState } from "react";
import { X, Star, Calendar, User, ChevronLeft, ChevronRight, ArrowRight, MapPin } from "lucide-react";

export default function ReviewDetailPanel({ review, onClose, onNavigateToTour }) {
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);

  const currentService = review.service_reviews[currentServiceIndex];
  const hasMultipleServices = review.service_reviews.length > 1;

  const handlePrevious = () => {
    if (currentServiceIndex > 0) {
      setCurrentServiceIndex(currentServiceIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentServiceIndex < review.service_reviews.length - 1) {
      setCurrentServiceIndex(currentServiceIndex + 1);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
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
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getServiceTypeLabel = (type) => {
    switch (type) {
      case 'accommodation':
        return 'Accommodation';
      case 'restaurant':
        return 'Restaurant';
      case 'transportation':
        return 'Transportation';
      default:
        return type;
    }
  };

  const getServiceTypeColor = (type) => {
    switch (type) {
      case 'accommodation':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'restaurant':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'transportation':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white dark:bg-gray-800 shadow-2xl z-50 overflow-y-auto transform transition-transform">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
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
            <div className="flex items-center gap-3 mb-3">
              <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {review.tour_name}
              </h3>
            </div>
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

          {/* Overall Tour Review (if exists) */}
          {review.review_text && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                Overall Tour Review
              </h4>
              <div className="flex items-center gap-2 mb-3">
                {renderStars(review.rating)}
                <span className="text-lg font-bold text-gray-900 dark:text-white">{review.rating}/5</span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {review.review_text}
              </p>
            </div>
          )}

          {/* Service Review Navigation */}
          {hasMultipleServices && (
            <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
              <button
                onClick={handlePrevious}
                disabled={currentServiceIndex === 0}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="font-semibold text-gray-900 dark:text-white">
                Service {currentServiceIndex + 1} of {review.service_reviews.length}
              </span>
              <button
                onClick={handleNext}
                disabled={currentServiceIndex === review.service_reviews.length - 1}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}

          {/* Current Service Review */}
          <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  {currentService.service_name}
                </h4>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getServiceTypeColor(currentService.service_type)}`}>
                  {getServiceTypeLabel(currentService.service_type)}
                </span>
              </div>
            </div>

            {/* Service Rating */}
            <div>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Rating</p>
              <div className="flex items-center gap-2">
                {renderStars(currentService.rating)}
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{currentService.rating}/5</span>
              </div>
            </div>

            {/* Service Review Text */}
            {currentService.review_text && (
              <div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Review</p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  {currentService.review_text}
                </p>
              </div>
            )}

            {/* Service Review Images */}
            {currentService.review_images && currentService.review_images.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">Photos ({currentService.review_images.length})</p>
                <div className="grid grid-cols-2 gap-3">
                  {currentService.review_images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Review photo ${index + 1}`}
                      className="w-full h-40 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity shadow-md"
                      onClick={() => setSelectedImage(image)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Navigate to Tour Button */}
          <div className="sticky bottom-0 bg-white dark:bg-gray-800 pt-4 pb-2 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => onNavigateToTour(review.tour_id)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 px-6 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
            >
              <span>View Tour Details</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Image Lightbox */}
      {selectedImage && (
        <>
          <div
            className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={32} className="text-white" />
            </button>
            <img
              src={selectedImage}
              alt="Full size"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </>
      )}
    </>
  );
}
