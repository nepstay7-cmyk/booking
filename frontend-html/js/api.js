// API Utility Functions
class API {
    static async request(endpoint, options = {}) {
        const url = `${API_CONFIG.BASE_URL}${endpoint}`;
        const token = localStorage.getItem('token');
        
        const defaultHeaders = {
            'Content-Type': 'application/json',
        };
        
        if (token) {
            defaultHeaders['Authorization'] = `Bearer ${token}`;
        }
        
        const config = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
        };
        
        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'API request failed');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
    
    // Auth API
    static async login(email, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    }
    
    static async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    }
    
    static async getMe() {
        return this.request('/auth/me');
    }
    
    // Properties API
    static async getProperties(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/properties?${queryString}`);
    }
    
    static async getProperty(id) {
        return this.request(`/properties/${id}`);
    }
    
    // Bookings API
    static async getBookings() {
        return this.request('/bookings');
    }
    
    static async createBooking(bookingData) {
        return this.request('/bookings', {
            method: 'POST',
            body: JSON.stringify(bookingData),
        });
    }
    
    static async cancelBooking(id, reason) {
        return this.request(`/bookings/${id}/cancel`, {
            method: 'PUT',
            body: JSON.stringify({ reason }),
        });
    }
    
    // Reviews API
    static async getReviews(propertyId) {
        return this.request(`/reviews/property/${propertyId}`);
    }
    
    // Admin API
    static async getAdminStats() {
        return this.request('/admin/stats');
    }
}




