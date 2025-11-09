// Contact page functionality
document.addEventListener('DOMContentLoaded', () => {
    Auth.updateNavigation();
    
    const contactForm = document.getElementById('contactForm');
    const contactMessage = document.getElementById('contactMessage');
    
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // In a real application, you would send this to your backend
            contactMessage.textContent = 'Thank you for your message! We will get back to you soon.';
            contactMessage.style.display = 'block';
            contactForm.reset();
            
            setTimeout(() => {
                contactMessage.style.display = 'none';
            }, 5000);
        });
    }
});




