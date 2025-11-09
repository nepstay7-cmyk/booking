// Search page functionality
let currentPage = 1;
let currentFilters = {};

document.addEventListener('DOMContentLoaded', async () => {
    Auth.updateNavigation();
    
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const city = urlParams.get('city');
    const checkIn = urlParams.get('checkIn');
    const checkOut = urlParams.get('checkOut');
    const maxGuests = urlParams.get('maxGuests');
    
    // Set filter values from URL
    if (city) {
        document.getElementById('filterCity').value = city;
        currentFilters.city = city;
    }
    if (maxGuests) {
        currentFilters.maxGuests = maxGuests;
    }
    
    // Load properties
    await loadProperties();
});

async function loadProperties() {
    const container = document.getElementById('propertiesList');
    const resultsCount = document.getElementById('resultsCount');
    
    if (!container) return;
    
    container.innerHTML = '<div class="loading">Loading properties...</div>';
    
    try {
        const params = {
            ...currentFilters,
            page: currentPage,
            limit: 12
        };
        
        const response = await API.getProperties(params);
        
        if (response.success && response.data && response.data.length > 0) {
            resultsCount.textContent = `Found ${response.total} properties`;
            
            container.innerHTML = response.data.map(property => `
                <div class="property-card">
                    ${property.images && property.images[0] ? 
                        `<img src="${property.images[0].url}" alt="${property.name}" onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'">` :
                        `<img src="https://via.placeholder.com/400x300?text=No+Image" alt="${property.name}">`
                    }
                    <div class="property-info">
                        <h3>${property.name}</h3>
                        <p class="property-location">${property.address?.city || ''}, ${property.address?.district || ''}</p>
                        <p class="property-description">${(property.description || '').substring(0, 100)}...</p>
                        <div class="property-footer">
                            <span class="property-price">NPR ${property.pricePerNight}/night</span>
                            <span class="property-rating">★ ${(property.rating?.average || 0).toFixed(1)}</span>
                        </div>
                        <a href="property.html?id=${property._id}" class="btn-view">View Details</a>
                    </div>
                </div>
            `).join('');
            
            // Pagination
            updatePagination(response.total, response.pages);
        } else {
            container.innerHTML = '<div class="no-results">No properties found.</div>';
            resultsCount.textContent = 'No properties found';
        }
    } catch (error) {
        console.error('Error loading properties:', error);
        container.innerHTML = '<div class="no-results">Error loading properties. Please try again later.</div>';
        resultsCount.textContent = 'Error loading properties';
    }
}

function applyFilters() {
    currentFilters = {
        city: document.getElementById('filterCity').value,
        type: document.getElementById('filterType').value,
        minPrice: document.getElementById('filterMinPrice').value,
        maxPrice: document.getElementById('filterMaxPrice').value,
        minRating: document.getElementById('filterRating').value,
        sort: document.getElementById('filterSort').value
    };
    
    // Remove empty filters
    Object.keys(currentFilters).forEach(key => {
        if (!currentFilters[key]) delete currentFilters[key];
    });
    
    currentPage = 1;
    loadProperties();
}

function updatePagination(total, pages) {
    const pagination = document.getElementById('pagination');
    if (!pagination || pages <= 1) {
        if (pagination) pagination.innerHTML = '';
        return;
    }
    
    let html = '<div class="pagination-buttons">';
    
    if (currentPage > 1) {
        html += `<button onclick="changePage(${currentPage - 1})">Previous</button>`;
    }
    
    for (let i = 1; i <= pages; i++) {
        if (i === currentPage) {
            html += `<button class="active">${i}</button>`;
        } else {
            html += `<button onclick="changePage(${i})">${i}</button>`;
        }
    }
    
    if (currentPage < pages) {
        html += `<button onclick="changePage(${currentPage + 1})">Next</button>`;
    }
    
    html += '</div>';
    pagination.innerHTML = html;
}

function changePage(page) {
    currentPage = page;
    loadProperties();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}




