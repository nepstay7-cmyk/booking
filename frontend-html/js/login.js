// Login page functionality
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            errorMessage.style.display = 'none';
            
            try {
                const response = await API.login(email, password);
                
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
                errorMessage.textContent = error.message || 'Login failed. Please check your credentials.';
                errorMessage.style.display = 'block';
            }
        });
    }
});




