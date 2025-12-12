import React, { useState, useEffect } from 'react';
import { Star, User, Calendar, Trash2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const TourReviews = ({ tourId }) => {
    const { translations } = useLanguage();
    const { toast } = useToast();
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        loadReviews();
        checkAdminStatus();
    }, [tourId]);

    const checkAdminStatus = () => {
        const user = localStorage.getItem('user');
        if (user) {
            const userData = JSON.parse(user);
            setIsAdmin(userData.role === 'admin');
        }
    };

    const loadReviews = async () => {
        try {
            const response = await fetch(`${API_URL}/api/tours/${tourId}/reviews`);
            const data = await response.json();

            if (data.success) {
                setReviews(data.reviews);
                setAverageRating(data.average_rating);
                setTotalReviews(data.total_reviews);
            }
        } catch (error) {
            console.error('Error loading reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review?')) {
            return;
        }

        try {
            setDeletingId(reviewId);
            const token = localStorage.getItem('token');
            
            const response = await fetch(`${API_URL}/api/reviews/${reviewId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            
            if (data.success) {
                toast.success('Review deleted successfully');
                // Reload reviews to update the list and statistics
                loadReviews();
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
            <div className="flex gap-1">
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
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">{translations?.customerReviews || "Đánh giá từ khách hàng"}</h2>

            {/* Rating Summary */}
            {totalReviews > 0 ? (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-6">
                    <div className="flex items-center gap-6">
                        <div className="text-center">
                            <div className="text-5xl font-bold text-blue-600 dark:text-blue-400">{averageRating.toFixed(1)}</div>
                            <div className="flex justify-center mt-2">
                                {renderStars(Math.round(averageRating))}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {totalReviews} {translations?.reviews || "đánh giá"}
                            </div>
                        </div>
                        
                        <div className="flex-1">
                            {[5, 4, 3, 2, 1].map((star) => {
                                const count = reviews.filter(r => r.rating === star).length;
                                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                                
                                return (
                                    <div key={star} className="flex items-center gap-2 mb-2">
                                        <span className="text-sm text-gray-600 dark:text-gray-400 w-12">{star} {translations?.stars || "sao"}</span>
                                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div
                                                className="bg-yellow-400 h-2 rounded-full transition-all"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                        <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500">
                    <p>Chưa có đánh giá nào cho tour này</p>
                </div>
            )}

            {/* Reviews List */}
            <div className="space-y-6">
                {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0 relative">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                                <User size={24} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <h4 className="font-semibold text-gray-800 dark:text-white">
                                            {review.username}
                                        </h4>
                                        <div className="flex items-center gap-3 mt-1">
                                            {renderStars(review.rating)}
                                            <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                <Calendar size={14} />
                                                {formatDate(review.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                    {/* Admin Delete Button */}
                                    {isAdmin && (
                                        <button
                                            onClick={() => handleDeleteReview(review.id)}
                                            disabled={deletingId === review.id}
                                            className="p-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg transition-colors disabled:opacity-50"
                                            title="Delete review"
                                        >
                                            <Trash2 size={18} className={deletingId === review.id ? 'animate-pulse' : ''} />
                                        </button>
                                    )}
                                </div>
                                
                                {review.review_text && (
                                    <p className="text-gray-700 dark:text-gray-300 mt-3 leading-relaxed">
                                        {review.review_text}
                                    </p>
                                )}
                                
                                {review.review_images && review.review_images.length > 0 && (
                                    <div className="grid grid-cols-4 gap-2 mt-4">
                                        {review.review_images.map((image, index) => (
                                            <img
                                                key={index}
                                                src={image}
                                                alt={`Review ${index + 1}`}
                                                className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                                onClick={() => window.open(image, '_blank')}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TourReviews;
