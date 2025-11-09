# Quick Start Guide - HTML Frontend

## 🚀 Getting Started

### Option 1: Open Directly in Browser

1. Navigate to the `frontend-html` folder
2. Double-click `index.html` to open in your browser
3. That's it! No build process needed.

### Option 2: Use a Local Server (Recommended)

```bash
# Navigate to frontend-html directory
cd frontend-html

# Using Python
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server -p 8000

# Using PHP
php -S localhost:8000
```

Then open: `http://localhost:8000`

## ⚙️ Configuration

### 1. Update API URL

Edit `js/config.js`:

```javascript
const API_CONFIG = {
  BASE_URL: "http://localhost:5000/api", // Your backend API URL
};
```

### 2. Make Sure Backend is Running

- Backend should be running on port 5000 (or update the URL above)
- Backend API should be accessible from your browser

## 📁 File Structure

```
frontend-html/
├── index.html          # Home page
├── search.html         # Search properties
├── property.html       # Property details
├── login.html          # Login
├── register.html       # Register
├── dashboard.html      # User dashboard
├── about.html          # About Nepal
├── contact.html        # Contact
├── css/
│   └── style.css      # All styles
└── js/
    ├── config.js      # API configuration
    ├── api.js         # API functions
    ├── auth.js        # Authentication
    └── ...            # Other page scripts
```

## 🎯 Features

✅ **No Build Process** - Just HTML, CSS, and JavaScript  
✅ **Responsive Design** - Works on mobile and desktop  
✅ **Authentication** - Login, register, logout  
✅ **Property Search** - Search and filter properties  
✅ **Booking System** - Book properties with multiple payment options  
✅ **User Dashboard** - View bookings and profile  
✅ **Mobile Menu** - Hamburger menu for mobile devices

## 🔧 Customization

### Change Colors

Edit `css/style.css` and modify CSS variables:

```css
:root {
  --primary-color: #0284c7; /* Main color */
  --primary-dark: #0369a1; /* Darker shade */
  --primary-light: #38bdf8; /* Lighter shade */
}
```

### Add Google Maps

1. Get Google Maps API key
2. Edit `js/property.js`
3. Replace `YOUR_GOOGLE_MAPS_API_KEY` with your key

### Modify Layout

- Edit HTML files for structure
- Edit `css/style.css` for styling
- Edit JavaScript files for functionality

## 🐛 Troubleshooting

### API Not Working

- Check if backend is running
- Verify API URL in `js/config.js`
- Check browser console for errors
- Ensure CORS is enabled on backend

### Styling Issues

- Ensure `css/style.css` is loaded
- Check browser console for 404 errors
- Clear browser cache

### Authentication Issues

- Clear browser localStorage
- Check if token is being stored
- Verify backend authentication endpoints

## 📱 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

## 🚀 Deployment

### GitHub Pages

1. Push to GitHub
2. Enable GitHub Pages
3. Update API URL to production
4. Deploy!

### Netlify/Vercel

1. Connect repository
2. Set publish directory to `frontend-html`
3. Update API URL
4. Deploy!

### Any Static Hosting

1. Upload all files
2. Update API URL
3. Done!

## 📝 Notes

- All data is fetched from the backend API
- Authentication tokens stored in localStorage
- No server-side rendering needed
- Works with any static file server
- Can be hosted anywhere (GitHub Pages, Netlify, etc.)

## 🎨 Styling

The CSS uses CSS variables for easy theming:

- Primary colors
- Text colors
- Background colors
- Shadows
- Border radius

Just modify the `:root` variables in `css/style.css` to change the entire theme!

## 🔒 Security

- Tokens stored in localStorage (consider httpOnly cookies for production)
- API calls include authentication headers
- CORS should be configured on backend
- Input validation on forms

## 📚 Documentation

See `README.md` for more detailed documentation.

## 🆘 Need Help?

1. Check browser console for errors
2. Verify backend is running
3. Check API URL configuration
4. Ensure CORS is enabled on backend
5. Clear browser cache and localStorage

## ✨ Features to Add

- [ ] Owner dashboard (create/edit properties)
- [ ] Admin dashboard (manage all properties/users)
- [ ] Payment integration (Khalti, eSewa, Stripe)
- [ ] Review system
- [ ] Image upload
- [ ] Email notifications
- [ ] Multi-language support

---

**Enjoy your HTML-based frontend! 🎉**



