import React, { useState, useEffect } from 'react';
import { Star, Upload, X, Send, Loader, Hotel, Utensils, Car } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ServiceReviewForm = ({ bookingId, tourId, onSuccess, onCancel }) => {
    const [services, setServices] = useState([]);
    const [serviceReviews, setServiceReviews] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        fetchServices();
    }, [bookingId]);

    const fetchServices = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/bookings/${bookingId}/can-review-services`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            
            if (data.success && data.services) {
                // Filter out services that have already been reviewed
                const unreviewedServices = data.services.filter(service => !service.has_review);
                
                if (unreviewedServices.length === 0) {
                    setError('Tất cả dịch vụ đã được đánh giá');
                    setServices([]);
                    setIsLoading(false);
                    return;
                }
                
                setServices(unreviewedServices);
                // Initialize review states for unreviewed services only
                const initialReviews = {};
                unreviewedServices.forEach(service => {
                    initialReviews[service.tour_service_id] = {
                        rating: 0,
                        hoverRating: 0,
                        review_text: '',
                        review_images: [],
                        imagePreviews: []
                    };
                });
                setServiceReviews(initialReviews);
            }
        } catch (err) {
            console.error('Error fetching services:', err);
            setError('Không thể tải danh sách dịch vụ');
        } finally {
            setIsLoading(false);
        }
    };

    const getServiceIcon = (type) => {
        switch (type) {
            case 'accommodation':
                return <Hotel size={20} className="text-blue-600" />;
            case 'restaurant':
                return <Utensils size={20} className="text-orange-600" />;
            case 'transportation':
                return <Car size={20} className="text-green-600" />;
            default:
                return null;
        }
    };

    const getServiceTypeLabel = (type) => {
        switch (type) {
            case 'accommodation':
                return 'Khách sạn';
            case 'restaurant':
                return 'Nhà hàng';
            case 'transportation':
                return 'Phương tiện';
            default:
                return type;
        }
    };

    const updateServiceReview = (serviceId, field, value) => {
        setServiceReviews(prev => ({
            ...prev,
            [serviceId]: {
                ...prev[serviceId],
                [field]: value
            }
        }));
    };

    const handleImageUpload = (serviceId, e) => {
        const files = Array.from(e.target.files);
        const currentImages = serviceReviews[serviceId]?.review_images || [];
        
        if (files.length + currentImages.length > 5) {
            setError('Bạn chỉ có thể tải lên tối đa 5 ảnh cho mỗi dịch vụ');
            return;
        }

        const newPreviews = [];
        const newFiles = [];

        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                newPreviews.push(reader.result);
                if (newPreviews.length === files.length) {
                    updateServiceReview(serviceId, 'imagePreviews', [
                        ...(serviceReviews[serviceId]?.imagePreviews || []),
                        ...newPreviews
                    ]);
                }
            };
            reader.readAsDataURL(file);
            newFiles.push(file);
        });

        updateServiceReview(serviceId, 'review_images', [
            ...currentImages,
            ...newFiles
        ]);
        setError('');
    };

    const removeImage = (serviceId, index) => {
        const currentReview = serviceReviews[serviceId];
        updateServiceReview(serviceId, 'review_images', 
            currentReview.review_images.filter((_, i) => i !== index)
        );
        updateServiceReview(serviceId, 'imagePreviews', 
            currentReview.imagePreviews.filter((_, i) => i !== index)
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate that at least one service has a rating
        const reviewedServices = Object.entries(serviceReviews).filter(
            ([_, review]) => review.rating > 0
        );

        if (reviewedServices.length === 0) {
            setError('Vui lòng đánh giá ít nhất một dịch vụ');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            
            // Prepare service reviews data
            const serviceReviewsData = reviewedServices.map(([serviceId, review]) => ({
                tour_service_id: parseInt(serviceId),
                rating: review.rating,
                review_text: review.review_text,
                review_images: review.imagePreviews
            }));

            const response = await fetch(`${API_URL}/api/reviews/services`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    booking_id: bookingId,
                    tour_id: tourId,
                    service_reviews: serviceReviewsData
                })
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Đánh giá dịch vụ đã được gửi thành công!');
                if (onSuccess) onSuccess(data);
            } else {
                setError(data.message || 'Không thể gửi đánh giá');
                toast.error(data.message || 'Không thể gửi đánh giá');
            }
        } catch (err) {
            console.error('Error submitting service reviews:', err);
            setError('Đã xảy ra lỗi khi gửi đánh giá');
            toast.error('Đã xảy ra lỗi khi gửi đánh giá');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader className="animate-spin text-blue-600" size={48} />
            </div>
        );
    }

    if (services.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Không có dịch vụ nào để đánh giá</p>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto border border-blue-100 max-h-[90vh] overflow-y-auto">
            <div className="mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    Đánh giá dịch vụ
                </h2>
                <p className="text-gray-600">Chia sẻ trải nghiệm của bạn về các dịch vụ trong tour</p>
            </div>
            
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg mb-6 shadow-md">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                        </svg>
                        {error}
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    {services.map((service) => {
                        const review = serviceReviews[service.tour_service_id] || {};
                        
                        return (
                            <div key={service.tour_service_id} className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
                                    {getServiceIcon(service.service_type)}
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg text-gray-900">{service.service_name}</h3>
                                        <p className="text-sm text-gray-500">{getServiceTypeLabel(service.service_type)}</p>
                                    </div>
                                </div>

                                {/* Rating Stars */}
                                <div className="mb-4">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Đánh giá
                                    </label>
                                    <div className="flex items-center gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => updateServiceReview(service.tour_service_id, 'rating', star)}
                                                onMouseEnter={() => updateServiceReview(service.tour_service_id, 'hoverRating', star)}
                                                onMouseLeave={() => updateServiceReview(service.tour_service_id, 'hoverRating', 0)}
                                                className="focus:outline-none transition-all duration-200 hover:scale-110 transform"
                                            >
                                                <Star
                                                    size={32}
                                                    className={`${
                                                        star <= (review.hoverRating || review.rating || 0)
                                                            ? 'fill-yellow-400 text-yellow-400 drop-shadow-lg'
                                                            : 'text-gray-300'
                                                    }`}
                                                />
                                            </button>
                                        ))}
                                        {review.rating > 0 && (
                                            <span className="ml-2 text-sm font-semibold text-gray-700">
                                                {review.rating === 5 && '⭐ Tuyệt vời'}
                                                {review.rating === 4 && '⭐ Rất tốt'}
                                                {review.rating === 3 && '⭐ Tốt'}
                                                {review.rating === 2 && '😐 Trung bình'}
                                                {review.rating === 1 && '😞 Kém'}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Review Text */}
                                <div className="mb-4">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Nhận xét
                                    </label>
                                    <textarea
                                        value={review.review_text || ''}
                                        onChange={(e) => updateServiceReview(service.tour_service_id, 'review_text', e.target.value)}
                                        rows="3"
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-700 placeholder-gray-400 transition-all"
                                        placeholder="Chia sẻ trải nghiệm của bạn về dịch vụ này..."
                                    />
                                </div>

                                {/* Image Upload */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Thêm ảnh (tối đa 5 ảnh)
                                    </label>
                                    <div className="grid grid-cols-5 gap-3">
                                        {(review.imagePreviews || []).map((preview, index) => (
                                            <div key={index} className="relative group">
                                                <img
                                                    src={preview}
                                                    alt={`Preview ${index + 1}`}
                                                    className="w-full h-20 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(service.tour_service_id, index)}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                        
                                        {(review.imagePreviews || []).length < 5 && (
                                            <label className="w-full h-20 border-2 border-dashed border-blue-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    onChange={(e) => handleImageUpload(service.tour_service_id, e)}
                                                    className="hidden"
                                                />
                                                <Upload size={20} className="text-blue-400 group-hover:text-blue-600" />
                                                <span className="text-xs text-gray-500 group-hover:text-blue-600 font-medium mt-1">Ảnh</span>
                                            </label>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 justify-end pt-6 mt-6 border-t border-gray-200">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold shadow-sm hover:shadow-md"
                            disabled={isSubmitting}
                        >
                            Hủy
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        <Send size={20} />
                        {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá dịch vụ'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ServiceReviewForm;
