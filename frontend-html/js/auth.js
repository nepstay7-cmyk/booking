// Authentication Utilities
class Auth {
    static setToken(token) {
        localStorage.setItem('token', token);
    }
    
    static getToken() {
        return localStorage.getItem('token');
    }
    
    static removeToken() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
    
    static isAuthenticated() {
        return !!this.getToken();
    }
    
    static setUser(user) {
        localStorage.setItem('user', JSON.stringify(user));
    }
    
    static getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
    
    static logout() {
        this.removeToken();
        window.location.href = 'index.html';
    }
    
    static async checkAuth() {
        if (!this.isAuthenticated()) {
            return false;
        }
        
        try {
            const response = await API.getMe();
            if (response.success && response.user) {
                this.setUser(response.user);
                return response.user;
            }
        } catch (error) {
            this.removeToken();
            return false;
        }
    }
    
    static updateNavigation() {
        const authMenu = document.getElementById('authMenu');
        const userMenu = document.getElementById('userMenu');
        const dashboardLink = document.getElementById('dashboardLink');
        
        if (this.isAuthenticated()) {
            const user = this.getUser();
            if (authMenu) authMenu.style.display = 'none';
            if (userMenu) userMenu.style.display = 'block';
            
            if (dashboardLink && user) {
                if (user.role === 'companyAdmin') {
                    dashboardLink.href = 'admin-dashboard.html';
                } else if (user.role === 'propertyOwner') {
                    dashboardLink.href = 'owner-dashboard.html';
                } else {
                    dashboardLink.href = 'dashboard.html';
                }
            }
        } else {
            if (authMenu) authMenu.style.display = 'block';
            if (userMenu) userMenu.style.display = 'none';
        }
        
        // Add logout handler
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
    }
}

// Initialize auth on page load
document.addEventListener('DOMContentLoaded', () => {
    Auth.updateNavigation();
});




