// Property details page functionality
document.addEventListener('DOMContentLoaded', async () => {
    Auth.updateNavigation();
    
    // Get property ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const propertyId = urlParams.get('id');
    
    if (!propertyId) {
        document.getElementById('propertyContent').innerHTML = '<div class="error">Property not found</div>';
        return;
    }
    
    await loadProperty(propertyId);
    await loadReviews(propertyId);
});

async function loadProperty(id) {
    const container = document.getElementById('propertyContent');
    
    try {
        const response = await API.getProperty(id);
        
        if (response.success && response.data) {
            const property = response.data;
            
            // Calculate nights and total
            const checkIn = document.getElementById('bookingCheckIn')?.value;
            const checkOut = document.getElementById('bookingCheckOut')?.value;
            const rooms = document.getElementById('bookingRooms')?.value || 1;
            
            container.innerHTML = `
                <div class="property-header">
                    <h1>${property.name}</h1>
                    <p class="property-location">${property.address?.city || ''}, ${property.address?.district || ''}, ${property.address?.province || ''}</p>
                </div>
                
                <div class="property-images">
                    ${property.images && property.images.length > 0 ? 
                        property.images.map(img => `<img src="${img.url}" alt="${img.alt || property.name}" onerror="this.src='https://via.placeholder.com/800x600?text=No+Image'">`).join('') :
                        `<img src="https://via.placeholder.com/800x600?text=No+Image" alt="${property.name}">`
                    }
                </div>
                
                <div class="property-layout">
                    <div class="property-main">
                        <div class="property-section">
                            <h2>Description</h2>
                            <p>${property.description}</p>
                        </div>
                        
                        <div class="property-section">
                            <h2>Amenities</h2>
                            <div class="amenities-grid">
                                ${property.amenities && property.amenities.length > 0 ?
                                    property.amenities.map(amenity => `<div class="amenity-item">✓ ${amenity}</div>`).join('') :
                                    '<p>No amenities listed</p>'
                                }
                            </div>
                        </div>
                        
                        ${property.location ? `
                        <div class="property-section">
                            <h2>Location</h2>
                            <div id="map" style="width: 100%; height: 400px;"></div>
                        </div>
                        ` : ''}
                        
                        <div class="property-section" id="reviewsSection">
                            <h2>Reviews</h2>
                            <div id="reviewsList">Loading reviews...</div>
                        </div>
                    </div>
                    
                    <div class="property-sidebar">
                        <div class="booking-card">
                            <div class="price-section">
                                <span class="price">NPR ${property.pricePerNight}</span>
                                <span class="price-label">/ night</span>
                            </div>
                            <div class="rating-section">
                                <span class="stars">${'★'.repeat(Math.floor(property.rating?.average || 0))}</span>
                                <span class="rating-text">${(property.rating?.average || 0).toFixed(1)} (${property.rating?.count || 0} reviews)</span>
                            </div>
                            
                            <form id="bookingForm" class="booking-form">
                                <input type="hidden" id="propertyId" value="${property._id}">
                                <div class="form-group">
                                    <label>Check-in</label>
                                    <input type="date" id="bookingCheckIn" required>
                                </div>
                                <div class="form-group">
                                    <label>Check-out</label>
                                    <input type="date" id="bookingCheckOut" required>
                                </div>
                                <div class="form-group">
                                    <label>Guests</label>
                                    <input type="number" id="bookingGuests" min="1" max="${property.maxGuests}" value="1" required>
                                </div>
                                <div class="form-group">
                                    <label>Rooms</label>
                                    <input type="number" id="bookingRooms" min="1" max="${property.rooms?.total || 1}" value="1" required>
                                </div>
                                <div class="form-group">
                                    <label>Payment Method</label>
                                    <select id="bookingPaymentMethod" required>
                                        <option value="cash">Cash on Arrival</option>
                                        <option value="khalti">Khalti</option>
                                        <option value="esewa">eSewa</option>
                                        <option value="stripe">Stripe (Card)</option>
                                    </select>
                                </div>
                                <div id="totalAmount" class="total-amount">
                                    <strong>Total: NPR 0</strong>
                                </div>
                                <button type="submit" class="btn-primary btn-block">Book Now</button>
                            </form>
                        </div>
                    </div>
                </div>
            `;
            
            // Initialize map if location exists
            if (property.location) {
                initMap(property.location.latitude, property.location.longitude, property.name);
            }
            
            // Setup booking form
            setupBookingForm(property);
        } else {
            container.innerHTML = '<div class="error">Property not found</div>';
        }
    } catch (error) {
        console.error('Error loading property:', error);
        container.innerHTML = '<div class="error">Error loading property. Please try again later.</div>';
    }
}

async function loadReviews(propertyId) {
    const container = document.getElementById('reviewsList');
    if (!container) return;
    
    try {
        const response = await API.getReviews(propertyId);
        
        if (response.success && response.data && response.data.length > 0) {
            container.innerHTML = response.data.map(review => `
                <div class="review-item">
                    <div class="review-header">
                        <strong>${review.user?.name || 'Anonymous'}</strong>
                        <span class="review-rating">${'★'.repeat(review.rating)}</span>
                    </div>
                    ${review.title ? `<h4>${review.title}</h4>` : ''}
                    <p>${review.comment}</p>
                    ${review.ownerReply ? `
                        <div class="owner-reply">
                            <strong>Owner Reply:</strong> ${review.ownerReply.text}
                        </div>
                    ` : ''}
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p>No reviews yet</p>';
        }
    } catch (error) {
        console.error('Error loading reviews:', error);
        container.innerHTML = '<p>Error loading reviews</p>';
    }
}

function initMap(lat, lng, title) {
    // Simple map initialization - you can integrate Google Maps API here
    const mapDiv = document.getElementById('map');
    if (!mapDiv) return;
    
    // Placeholder for Google Maps integration
    mapDiv.innerHTML = `
        <iframe 
            width="100%" 
            height="400" 
            style="border:0" 
            loading="lazy" 
            allowfullscreen
            src="https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${lat},${lng}">
        </iframe>
    `;
}

function setupBookingForm(property) {
    const form = document.getElementById('bookingForm');
    const checkIn = document.getElementById('bookingCheckIn');
    const checkOut = document.getElementById('bookingCheckOut');
    const rooms = document.getElementById('bookingRooms');
    const totalAmount = document.getElementById('totalAmount');
    
    // Calculate total on change
    function calculateTotal() {
        if (checkIn.value && checkOut.value && rooms.value) {
            const checkInDate = new Date(checkIn.value);
            const checkOutDate = new Date(checkOut.value);
            const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
            const total = nights * property.pricePerNight * parseInt(rooms.value);
            totalAmount.innerHTML = `<strong>Total: NPR ${total}</strong>`;
        }
    }
    
    checkIn.addEventListener('change', calculateTotal);
    checkOut.addEventListener('change', calculateTotal);
    rooms.addEventListener('change', calculateTotal);
    
    // Form submission
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!Auth.isAuthenticated()) {
                alert('Please login to book');
                window.location.href = 'login.html';
                return;
            }
            
            try {
                const bookingData = {
                    property: property._id,
                    checkIn: checkIn.value,
                    checkOut: checkOut.value,
                    guests: document.getElementById('bookingGuests').value,
                    rooms: rooms.value,
                    paymentMethod: document.getElementById('bookingPaymentMethod').value
                };
                
                const response = await API.createBooking(bookingData);
                
                if (response.success) {
                    alert('Booking created successfully!');
                    window.location.href = 'dashboard.html';
                }
            } catch (error) {
                alert(error.message || 'Booking failed. Please try again.');
            }
        });
    }
}




