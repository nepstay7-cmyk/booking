// Dashboard page functionality
document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    if (!Auth.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }
    
    Auth.updateNavigation();
    await loadDashboard();
});

async function loadDashboard() {
    const container = document.getElementById('dashboardContent');
    if (!container) return;
    
    try {
        const user = Auth.getUser();
        
        if (!user) {
            container.innerHTML = '<div class="error">User not found</div>';
            return;
        }
        
        // Load user bookings
        const bookingsResponse = await API.getBookings();
        
        if (user.role === 'user') {
            // User dashboard
            container.innerHTML = `
                <div class="dashboard-section">
                    <h2>Profile</h2>
                    <div class="profile-card">
                        <p><strong>Name:</strong> ${user.name}</p>
                        <p><strong>Email:</strong> ${user.email}</p>
                        <p><strong>Phone:</strong> ${user.phone || 'Not provided'}</p>
                    </div>
                </div>
                
                <div class="dashboard-section">
                    <h2>My Bookings</h2>
                    <div id="bookingsList">
                        ${bookingsResponse.success && bookingsResponse.data && bookingsResponse.data.length > 0 ?
                            bookingsResponse.data.map(booking => `
                                <div class="booking-card">
                                    <h3>${booking.property?.name || 'Property'}</h3>
                                    <p>${booking.property?.address?.city || ''}, ${booking.property?.address?.district || ''}</p>
                                    <p>Check-in: ${new Date(booking.checkIn).toLocaleDateString()}</p>
                                    <p>Check-out: ${new Date(booking.checkOut).toLocaleDateString()}</p>
                                    <p>Guests: ${booking.guests} | Rooms: ${booking.rooms}</p>
                                    <p><strong>Total: NPR ${booking.totalAmount}</strong></p>
                                    <p>Status: <span class="status-${booking.status}">${booking.status}</span></p>
                                    ${booking.status !== 'cancelled' ? `
                                        <button onclick="cancelBooking('${booking._id}')" class="btn-cancel">Cancel Booking</button>
                                    ` : ''}
                                </div>
                            `).join('') :
                            '<p>No bookings yet</p>'
                        }
                    </div>
                </div>
            `;
        } else {
            // Owner/Admin dashboard - redirect to appropriate dashboard
            if (user.role === 'propertyOwner') {
                window.location.href = 'owner-dashboard.html';
            } else if (user.role === 'companyAdmin') {
                window.location.href = 'admin-dashboard.html';
            }
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
        container.innerHTML = '<div class="error">Error loading dashboard. Please try again later.</div>';
    }
}

async function cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
        const response = await API.cancelBooking(bookingId, 'Cancelled by user');
        if (response.success) {
            alert('Booking cancelled successfully');
            loadDashboard();
        }
    } catch (error) {
        alert(error.message || 'Failed to cancel booking');
    }
}




