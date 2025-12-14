import React, { useState } from 'react';
import { Star, Upload, X, Send } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const TourReviewForm = ({ bookingId, tourId, onSuccess, onCancel }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [reviewImages, setReviewImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        
        if (files.length + reviewImages.length > 5) {
            setError('Bạn chỉ có thể tải lên tối đa 5 ảnh');
            return;
        }

        // Create previews
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews(prev => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });

        setReviewImages(prev => [...prev, ...files]);
        setError('');
    };

    const removeImage = (index) => {
        setReviewImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (rating === 0) {
            setError('Vui lòng chọn số sao đánh giá');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            
            // Convert images to base64 or use the previews (which are already base64)
            const imageUrls = imagePreviews; // These are already base64 data URLs
            
            console.log('Submitting review with images:', {
                imageCount: imageUrls.length,
                firstImagePreview: imageUrls[0] ? imageUrls[0].substring(0, 50) + '...' : 'none'
            });
            
            const response = await fetch(`${API_URL}/api/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    booking_id: bookingId,
                    rating,
                    review_text: reviewText,
                    is_anonymous: isAnonymous,
                    review_images: imageUrls // Send base64 image data
                })
            });

            const data = await response.json();
            
            console.log('Review submission response:', data);

            if (data.success) {
                if (onSuccess) onSuccess(data.review);
            } else {
                setError(data.message || 'Không thể gửi đánh giá');
            }
        } catch (err) {
            console.error('Error submitting review:', err);
            setError('Đã xảy ra lỗi khi gửi đánh giá');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-2xl p-8 max-w-3xl mx-auto border border-blue-100">
            <div className="mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    Đánh giá tour du lịch
                </h2>
                <p className="text-gray-600">Chia sẻ trải nghiệm của bạn để giúp những khách hàng khác</p>
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
                {/* Rating Stars */}
                <div className="mb-8 bg-white rounded-xl p-6 shadow-md border border-gray-100">
                    <label className="block text-lg font-bold text-gray-800 mb-4">
                        Đánh giá của bạn <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="focus:outline-none transition-all duration-200 hover:scale-125 transform"
                            >
                                <Star
                                    size={48}
                                    className={`${
                                        star <= (hoverRating || rating)
                                            ? 'fill-yellow-400 text-yellow-400 drop-shadow-lg'
                                            : 'text-gray-300'
                                    }`}
                                />
                            </button>
                        ))}
                        {rating > 0 && (
                            <span className="ml-4 text-xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                                {rating === 5 && '⭐ Tuyệt vời'}
                                {rating === 4 && '⭐ Rất tốt'}
                                {rating === 3 && '⭐ Tốt'}
                                {rating === 2 && '😐 Trung bình'}
                                {rating === 1 && '😞 Kém'}
                            </span>
                        )}
                    </div>
                </div>

                {/* Review Text */}
                <div className="mb-8 bg-white rounded-xl p-6 shadow-md border border-gray-100">
                    <label className="block text-lg font-bold text-gray-800 mb-4">
                        Chia sẻ trải nghiệm của bạn
                    </label>
                    <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        rows="6"
                        className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-700 placeholder-gray-400 transition-all"
                        placeholder="Hãy chia sẻ trải nghiệm của bạn về tour này... (VD: Cảnh đẹp, dịch vụ, hướng dẫn viên, khách sạn,...)"
                    />
                    <p className="text-sm text-gray-500 mt-2">Tối thiểu 10 ký tự</p>
                </div>

                {/* Image Upload */}
                <div className="mb-8 bg-white rounded-xl p-6 shadow-md border border-gray-100">
                    <label className="block text-lg font-bold text-gray-800 mb-4">
                        Thêm ảnh (tối đa 5 ảnh)
                    </label>
                    <div className="grid grid-cols-5 gap-4">
                        {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative group">
                                <img
                                    src={preview}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-28 object-cover rounded-xl border-2 border-gray-200 shadow-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                        
                        {imagePreviews.length < 5 && (
                            <label className="w-full h-28 border-3 border-dashed border-blue-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group">
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                                <Upload size={28} className="text-blue-400 group-hover:text-blue-600 mb-1" />
                                <span className="text-xs text-gray-500 group-hover:text-blue-600 font-medium">Tải ảnh</span>
                            </label>
                        )}
                    </div>
                </div>

                {/* Anonymous Option */}
                <div className="mb-8 bg-white rounded-xl p-5 shadow-md border border-gray-100">
                    <label className="flex items-center cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={isAnonymous}
                            onChange={(e) => setIsAnonymous(e.target.checked)}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                        />
                        <span className="ml-3 text-base text-gray-700 group-hover:text-gray-900 font-medium">
                            🕶️ Đánh giá ẩn danh (tên của bạn sẽ không hiển thị)
                        </span>
                    </label>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 justify-end pt-4">
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
                        disabled={isSubmitting || rating === 0}
                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        <Send size={20} />
                        {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TourReviewForm;
