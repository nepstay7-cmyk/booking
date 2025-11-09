// Register page functionality
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const errorMessage = document.getElementById('errorMessage');
    
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                password: document.getElementById('password').value,
                role: document.getElementById('role').value
            };
            
            errorMessage.style.display = 'none';
            
            try {
                const response = await API.register(formData);
                
                if (response.success && response.token) {
                    Auth.setToken(response.token);
                    Auth.setUser(response.user);
                    
                    // Redirect based on role
                    if (response.user.role === 'companyAdmin') {
                        window.location.href = 'admin-dashboard.html';
                    } else if (response.user.role === 'propertyOwner') {
                        window.location.href = 'owner-dashboard.html';
                    } else {
                        window.location.href = 'dashboard.html';
                    }
                }
            } catch (error) {
                errorMessage.textContent = error.message || 'Registration failed. Please try again.';
                errorMessage.style.display = 'block';
            }
        });
    }
});




