// Main page functionality
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize navigation
    Auth.updateNavigation();
    
    // Load featured properties
    await loadFeaturedProperties();
    
    // Setup search form
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const city = document.getElementById('searchCity').value;
            const checkIn = document.getElementById('checkIn').value;
            const checkOut = document.getElementById('checkOut').value;
            const guests = document.getElementById('guests').value;
            
            const params = new URLSearchParams();
            if (city) params.append('city', city);
            if (checkIn) params.append('checkIn', checkIn);
            if (checkOut) params.append('checkOut', checkOut);
            if (guests) params.append('maxGuests', guests);
            
            window.location.href = `search.html?${params.toString()}`;
        });
    }
    
    // Mobile menu toggle
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }
});

async function loadFeaturedProperties() {
    const container = document.getElementById('featuredProperties');
    if (!container) return;
    
    try {
        const response = await API.getProperties({
            limit: 6,
            sort: 'rating.average',
            order: 'desc'
        });
        
        if (response.success && response.data && response.data.length > 0) {
            container.innerHTML = response.data.map(property => `
                <div class="property-card">
                    ${property.images && property.images[0] ? 
                        `<img src="${property.images[0].url}" alt="${property.name}" onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'">` :
                        `<img src="https://via.placeholder.com/400x300?text=No+Image" alt="${property.name}">`
                    }
                    <div class="property-info">
                        <h3>${property.name}</h3>
                        <p class="property-location">${property.address?.city || ''}, ${property.address?.district || ''}</p>
                        <div class="property-footer">
                            <span class="property-price">NPR ${property.pricePerNight}/night</span>
                            <span class="property-rating">★ ${(property.rating?.average || 0).toFixed(1)}</span>
                        </div>
                        <a href="property.html?id=${property._id}" class="btn-view">View Details</a>
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<div class="no-results">No properties available at the moment.</div>';
        }
    } catch (error) {
        console.error('Error loading properties:', error);
        container.innerHTML = '<div class="no-results">Error loading properties. Please try again later.</div>';
    }
}




