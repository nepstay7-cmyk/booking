# Nepal Hotel Booking - HTML Frontend

This is a pure HTML/CSS/JavaScript frontend for the Nepal Hotel Booking website. No build process required - just open the HTML files in a browser!

## Features

- Pure HTML, CSS, and JavaScript (no React/Next.js)
- Responsive design
- All pages integrated
- API integration with backend
- Authentication system
- Property search and booking
- User dashboard
- Mobile-friendly

## File Structure

```
frontend-html/
├── index.html          # Home page
├── search.html         # Search properties
├── property.html       # Property details
├── login.html          # Login page
├── register.html       # Registration page
├── dashboard.html      # User dashboard
├── about.html          # About Nepal
├── contact.html        # Contact page
├── css/
│   └── style.css      # All styles
└── js/
    ├── config.js      # API configuration
    ├── api.js         # API functions
    ├── auth.js        # Authentication utilities
    ├── main.js        # Home page functionality
    ├── search.js      # Search page functionality
    ├── property.js    # Property details functionality
    ├── login.js       # Login functionality
    ├── register.js    # Registration functionality
    ├── dashboard.js   # Dashboard functionality
    └── contact.js     # Contact form functionality
```

## Setup

1. **Configure API URL**

   - Open `js/config.js`
   - Update `BASE_URL` to point to your backend API
   - Default: `http://localhost:5000/api`

2. **Open in Browser**

   - Simply open `index.html` in your web browser
   - Or use a local server:

     ```bash
     # Using Python
     python -m http.server 8000

     # Using Node.js (http-server)
     npx http-server

     # Using PHP
     php -S localhost:8000
     ```

3. **Access the Website**
   - Open browser and go to `http://localhost:8000`

## Configuration

### API Configuration

Edit `js/config.js`:

```javascript
const API_CONFIG = {
  BASE_URL: "http://localhost:5000/api",
  // Change to your production API URL
  // BASE_URL: 'https://your-api-domain.com/api'
};
```

### Google Maps (Optional)

To enable Google Maps on property pages:

1. Get a Google Maps API key
2. Edit `js/property.js`
3. Replace `YOUR_GOOGLE_MAPS_API_KEY` with your actual API key
4. Or use the iframe embed method (already implemented)

## Pages

- **Home** (`index.html`) - Featured properties and search
- **Search** (`search.html`) - Search and filter properties
- **Property Details** (`property.html?id=PROPERTY_ID`) - View property details and book
- **Login** (`login.html`) - User login
- **Register** (`register.html`) - User registration
- **Dashboard** (`dashboard.html`) - User dashboard (requires login)
- **About** (`about.html`) - Information about Nepal
- **Contact** (`contact.html`) - Contact form

## Features

### Authentication

- Login/Register
- Token-based authentication
- Role-based navigation (User, Property Owner, Admin)
- Automatic redirects based on user role

### Properties

- Browse properties
- Search and filter
- View property details
- View on map
- Read reviews

### Booking

- Create bookings
- Multiple payment methods
- View booking history
- Cancel bookings

### Responsive Design

- Mobile-friendly
- Works on all screen sizes
- Hamburger menu for mobile

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Notes

- No build process required
- Works with any static file server
- Can be deployed to any hosting service (GitHub Pages, Netlify, Vercel, etc.)
- All API calls are made to the backend
- Authentication tokens are stored in localStorage

## Deployment

### Static Hosting

1. Upload all files to your hosting service
2. Update `js/config.js` with your production API URL
3. Deploy!

### GitHub Pages

1. Push code to GitHub repository
2. Enable GitHub Pages in repository settings
3. Update API URL in `js/config.js`
4. Access your site at `https://username.github.io/repository-name`

### Netlify/Vercel

1. Connect your repository
2. Set build command to: (none - static site)
3. Set publish directory to: `frontend-html`
4. Update API URL in `js/config.js`
5. Deploy!

## Troubleshooting

### API Not Working

- Check if backend is running
- Verify API URL in `js/config.js`
- Check browser console for errors
- Ensure CORS is enabled on backend

### Authentication Issues

- Clear browser localStorage
- Check if token is being stored
- Verify backend authentication endpoints

### Styling Issues

- Ensure `css/style.css` is loaded
- Check browser console for 404 errors
- Verify file paths are correct

## Development

To modify the frontend:

1. Edit HTML files for structure
2. Edit `css/style.css` for styling
3. Edit JavaScript files in `js/` for functionality
4. Refresh browser to see changes (no build needed!)

## License

MIT



