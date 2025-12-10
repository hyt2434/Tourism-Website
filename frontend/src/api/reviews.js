const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const checkCanReview = async (bookingId) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
        return { success: false, message: 'Not authenticated' };
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/can-review`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            console.error('Check review failed:', response.status, data);
        }
        
        return data;
    } catch (error) {
        console.error('Network error checking review:', error);
        return { success: false, message: 'Network error' };
    }
};

export const createReview = async (reviewData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reviewData)
    });
    return response.json();
};

export const updateReview = async (reviewId, reviewData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reviewData)
    });
    return response.json();
};

export const deleteReview = async (reviewId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.json();
};

export const getTourReviews = async (tourId) => {
    const response = await fetch(`${API_BASE_URL}/api/tours/${tourId}/reviews`);
    return response.json();
};

export const getUserReviews = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/users/my-reviews`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.json();
};

export const checkCanReviewServices = async (bookingId) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
        return { success: false, message: 'Not authenticated' };
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/can-review-services`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            console.error('Check service review failed:', response.status, data);
        }
        
        return data;
    } catch (error) {
        console.error('Network error checking service review:', error);
        return { success: false, message: 'Network error' };
    }
};

export const createServiceReviews = async (reviewData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/reviews/services`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reviewData)
    });
    return response.json();
};

