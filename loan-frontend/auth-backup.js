// ============================================================================
// AUTH.JS - COMPREHENSIVE AUTHENTICATION & USER MANAGEMENT SYSTEM
// ============================================================================

// User Management
const authSystem = {
    currentUser: null,
    users: {},
    sessions: {},
    adminUsers: new Set(),
    
    init() {
        this.loadUsers();
        this.checkSession();
        this.setupAuthListeners();
    },
    
    loadUsers() {
        const stored = localStorage.getItem('loanrisk_users');
        if (stored) {
            try {
                this.users = JSON.parse(stored);
            } catch {
                this.users = this.getDefaultUsers();
            }
        } else {
            this.users = this.getDefaultUsers();
            this.saveUsers();
        }
        
        const adminList = localStorage.getItem('loanrisk_admins');
        if (adminList) {
            try {
                this.adminUsers = new Set(JSON.parse(adminList));
            } catch {
                this.adminUsers = new Set(['admin']);
            }
        } else {
            this.adminUsers = new Set(['admin']);
            this.saveAdminList();
        }
    },
    
    getDefaultUsers() {
        return {
            'admin': {
                username: 'admin',
                password: this.hashPassword('admin123'),
                email: 'admin@loanrisk.ai',
                fullname: 'Administrator',
                role: 'admin',
                createdAt: new Date().toISOString(),
                lastLogin: null,
                loginCount: 0,
                predictions: 0,
                status: 'active'
            }
        };
    },
    
    saveUsers() {
        localStorage.setItem('loanrisk_users', JSON.stringify(this.users));
    },
    
    saveAdminList() {
        localStorage.setItem('loanrisk_admins', JSON.stringify(Array.from(this.adminUsers)));
    },
    
    hashPassword(password) {
        // Simple hash for demo (in production use bcrypt)
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return 'hash_' + Math.abs(hash);
    },
    
    register(username, email, password, confirmPassword, fullname) {
        // Validation
        if (!username || !email || !password || !fullname) {
            return { success: false, message: 'All fields are required' };
        }
        
        if (password !== confirmPassword) {
            return { success: false, message: 'Passwords do not match' };
        }
        
        if (password.length < 6) {
            return { success: false, message: 'Password must be at least 6 characters' };
        }
        
        if (this.users[username]) {
            return { success: false, message: 'Username already exists' };
        }
        
        if (Object.values(this.users).some(u => u.email === email)) {
            return { success: false, message: 'Email already registered' };
        }
        
        // Create new user
        this.users[username] = {
            username: username,
            password: this.hashPassword(password),
            email: email,
            fullname: fullname,
            role: 'user',
            createdAt: new Date().toISOString(),
            lastLogin: null,
            loginCount: 0,
            predictions: 0,
            status: 'active'
        };
        
        this.saveUsers();
        return { success: true, message: '✅ Registration successful! Redirecting to login...' };
    },
    
    login(username, password) {
        const user = this.users[username];
        
        if (!user) {
            return { success: false, message: 'Invalid username or password' };
        }
        
        if (user.password !== this.hashPassword(password)) {
            return { success: false, message: 'Invalid username or password' };
        }
        
        if (user.status !== 'active') {
            return { success: false, message: 'Account is inactive' };
        }
        
        // Create session
        const sessionId = this.generateSessionId();
        const now = new Date().toISOString();
        
        this.currentUser = {
            username: user.username,
            email: user.email,
            fullname: user.fullname,
            role: user.role,
            sessionId: sessionId
        };
        
        this.sessions[sessionId] = {
            username: username,
            loginTime: now,
            lastActivity: now,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        };
        
        // Update user
        user.lastLogin = now;
        user.loginCount++;
        this.saveUsers();
        
        // Save session
        localStorage.setItem('loanrisk_session', JSON.stringify(this.currentUser));
        localStorage.setItem('loanrisk_sessionId', sessionId);
        
        return { success: true, message: 'Login successful!', user: this.currentUser };
    },
    
    logout() {
        if (this.currentUser && this.currentUser.sessionId) {
            delete this.sessions[this.currentUser.sessionId];
        }
        this.currentUser = null;
        localStorage.removeItem('loanrisk_session');
        localStorage.removeItem('loanrisk_sessionId');
        return true;
    },
    
    checkSession() {
        const session = localStorage.getItem('loanrisk_session');
        if (session) {
            try {
                this.currentUser = JSON.parse(session);
                return true;
            } catch {
                this.logout();
                return false;
            }
        }
        return false;
    },
    
    isLoggedIn() {
        return this.currentUser !== null;
    },
    
    isAdmin() {
        return this.currentUser && this.adminUsers.has(this.currentUser.username);
    },
    
    getUser(username) {
        return this.users[username];
    },
    
    getAllUsers() {
        return Object.values(this.users);
    },
    
    updateUser(username, updates) {
        if (this.users[username]) {
            this.users[username] = { ...this.users[username], ...updates };
            this.saveUsers();
            return true;
        }
        return false;
    },
    
    deleteUser(username) {
        if (this.users[username]) {
            delete this.users[username];
            this.adminUsers.delete(username);
            this.saveUsers();
            this.saveAdminList();
            return true;
        }
        return false;
    },
    
    promoteToAdmin(username) {
        if (this.users[username]) {
            this.adminUsers.add(username);
            this.users[username].role = 'admin';
            this.saveUsers();
            this.saveAdminList();
            return true;
        }
        return false;
    },
    
    demoteFromAdmin(username) {
        if (username !== 'admin') { // Protect main admin
            this.adminUsers.delete(username);
            this.users[username].role = 'user';
            this.saveUsers();
            this.saveAdminList();
            return true;
        }
        return false;
    },
    
    deactivateUser(username) {
        if (this.users[username]) {
            this.users[username].status = 'inactive';
            this.saveUsers();
            return true;
        }
        return false;
    },
    
    activateUser(username) {
        if (this.users[username]) {
            this.users[username].status = 'active';
            this.saveUsers();
            return true;
        }
        return false;
    },
    
    incrementPredictionCount(username) {
        if (this.users[username]) {
            this.users[username].predictions++;
            this.saveUsers();
        }
    },
    
    generateSessionId() {
        return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    },
    
    setupAuthListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const username = document.getElementById('loginUsername').value;
                const password = document.getElementById('loginPassword').value;
                
                const result = this.login(username, password);
                if (result.success) {
                    showNotification(result.message, 'success');
                    setTimeout(() => {
                        showAuthUI();
                        navigateTo('home');
                    }, 500);
                } else {
                    showNotification(result.message, 'error');
                }
            });
        }
        
        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const fullname = document.getElementById('registerFullname').value;
                const email = document.getElementById('registerEmail').value;
                const username = document.getElementById('registerUsername').value;
                const password = document.getElementById('registerPassword').value;
                const confirmPassword = document.getElementById('registerConfirm').value;
                
                const result = this.register(username, email, password, confirmPassword, fullname);
                if (result.success) {
                    showNotification(result.message, 'success');
                    setTimeout(() => {
                        document.getElementById('authTabs').children[0].click();
                        registerForm.reset();
                    }, 500);
                } else {
                    showNotification(result.message, 'error');
                }
            });
        }
    }
};

// UI Functions
function showAuthUI() {
    const authModal = document.getElementById('authModal');
    const mainWrapper = document.querySelector('.main-wrapper');
    
    if (authSystem.isLoggedIn()) {
        // Hide auth, show app
        if (authModal) authModal.style.display = 'none';
        if (mainWrapper) mainWrapper.style.display = 'flex';
        updateUserDisplay();
    } else {
        // Show auth, hide app
        if (authModal) authModal.style.display = 'flex';
        if (mainWrapper) mainWrapper.style.display = 'none';
    }
}

function updateUserDisplay() {
    if (!authSystem.isLoggedIn()) return;
    
    const userNameSpan = document.getElementById('currentUsername');
    const userRoleBadge = document.getElementById('currentUserRole');
    const userGreeting = document.getElementById('userGreeting');
    
    if (userNameSpan) userNameSpan.textContent = authSystem.currentUser.fullname;
    if (userRoleBadge) {
        userRoleBadge.textContent = authSystem.currentUser.role.toUpperCase();
        userRoleBadge.className = 'user-role-badge ' + authSystem.currentUser.role;
    }
    if (userGreeting) userGreeting.textContent = `Welcome, ${authSystem.currentUser.fullname}!`;
}

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        authSystem.logout();
        showAuthUI();
        showNotification('Logged out successfully', 'success');
    }
}

function switchAuthTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.auth-tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from buttons
    document.querySelectorAll('.auth-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    const tab = document.getElementById(tabName);
    if (tab) {
        tab.classList.add('active');
        event.target.classList.add('active');
    }
}
// End of auth.js
