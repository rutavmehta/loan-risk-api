// ============================================================================
// AUTH.JS - COMPREHENSIVE AUTHENTICATION & USER MANAGEMENT SYSTEM
// ============================================================================

const authSystem = {
    currentUser: null,
    users: {},
    sessions: {},
    adminUsers: new Set(),
    
    init() {
        console.log('🔐 Initializing authentication system...');
        this.loadUsers();
        this.checkSession();
        this.setupAuthListeners();
        console.log('✅ Auth initialized');
    },
    
    loadUsers() {
        const stored = localStorage.getItem('loanrisk_users');
        if (stored) {
            try {
                this.users = JSON.parse(stored);
                console.log('📦 Users loaded from localStorage');
            } catch (e) {
                console.error('Error loading users:', e);
                this.users = this.getDefaultUsers();
            }
        } else {
            this.users = this.getDefaultUsers();
            this.saveUsers();
            console.log('📦 Default users created');
        }
        
        // Load admin list
        const adminList = localStorage.getItem('loanrisk_admins');
        if (adminList) {
            try {
                this.adminUsers = new Set(JSON.parse(adminList));
            } catch (e) {
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
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return 'hash_' + Math.abs(hash).toString(36);
    },
    
    checkSession() {
        const sessionId = localStorage.getItem('loanrisk_session');
        const username = localStorage.getItem('loanrisk_username');
        
        if (sessionId && username && this.users[username]) {
            this.currentUser = {
                username: username,
                email: this.users[username].email,
                fullname: this.users[username].fullname,
                role: this.users[username].role,
                sessionId: sessionId
            };
            console.log('✅ Session restored for:', username);
        }
    },
    
    isLoggedIn() {
        return this.currentUser !== null;
    },
    
    isAdmin() {
        if (!this.currentUser) return false;
        return this.adminUsers.has(this.currentUser.username);
    },
    
    register(username, email, password, confirmPassword, fullname) {
        console.log('📝 Attempting registration for:', username);
        
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
        console.log('✅ User registered:', username);
        return { success: true, message: '✅ Registration successful! Redirecting to login...' };
    },
    
    login(username, password) {
        console.log('🔑 Attempting login for:', username);
        
        const user = this.users[username];
        
        if (!user) {
            console.log('❌ User not found:', username);
            return { success: false, message: 'Invalid username or password' };
        }
        
        if (user.password !== this.hashPassword(password)) {
            console.log('❌ Wrong password for:', username);
            return { success: false, message: 'Invalid username or password' };
        }
        
        if (user.status !== 'active') {
            console.log('❌ Account inactive:', username);
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
        
        // Save session
        localStorage.setItem('loanrisk_session', sessionId);
        localStorage.setItem('loanrisk_username', username);
        
        // Update last login
        user.lastLogin = now;
        user.loginCount++;
        this.saveUsers();
        
        console.log('✅ Login successful:', username);
        return { success: true, message: '✅ Login successful! Welcome ' + user.fullname };
    },
    
    logout() {
        console.log('🚪 Logging out:', this.currentUser?.username);
        this.currentUser = null;
        localStorage.removeItem('loanrisk_session');
        localStorage.removeItem('loanrisk_username');
        console.log('✅ Logged out');
    },
    
    promoteToAdmin(username) {
        if (this.users[username] && username !== 'admin') {
            this.adminUsers.add(username);
            this.users[username].role = 'admin';
            this.saveUsers();
            this.saveAdminList();
            return true;
        }
        return false;
    },
    
    demoteFromAdmin(username) {
        if (username !== 'admin') {
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
    
    deleteUser(username) {
        if (username !== 'admin') {
            delete this.users[username];
            this.adminUsers.delete(username);
            this.saveUsers();
            this.saveAdminList();
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
        console.log('🎯 Setting up auth listeners...');
        
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            console.log('✅ Login form found');
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('🔄 Login form submitted');
                
                const username = document.getElementById('loginUsername').value.trim();
                const password = document.getElementById('loginPassword').value.trim();
                
                console.log('📤 Credentials entered - Username:', username);
                
                const result = this.login(username, password);
                
                if (result.success) {
                    console.log('✅ Login successful');
                    showNotification(result.message, 'success');
                    
                    // Show app after 500ms
                    setTimeout(() => {
                        console.log('🔄 Switching to app UI');
                        showAppUI();
                        updateUserDisplay();
                        navigateTo('home');
                    }, 500);
                } else {
                    console.log('❌ Login failed:', result.message);
                    showNotification(result.message, 'error');
                }
            });
        } else {
            console.warn('⚠️ Login form NOT found');
        }
        
        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            console.log('✅ Register form found');
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('🔄 Register form submitted');
                
                const fullname = document.getElementById('registerFullname').value.trim();
                const email = document.getElementById('registerEmail').value.trim();
                const username = document.getElementById('registerUsername').value.trim();
                const password = document.getElementById('registerPassword').value.trim();
                const confirmPassword = document.getElementById('registerConfirm').value.trim();
                
                console.log('📤 Registration data - Username:', username);
                
                const result = this.register(username, email, password, confirmPassword, fullname);
                
                if (result.success) {
                    console.log('✅ Registration successful');
                    showNotification(result.message, 'success', 4000);
                    
                    // Clear form and switch to login
                    setTimeout(() => {
                        console.log('🔄 Switching to login tab');
                        registerForm.reset();
                        switchAuthTab('loginTab');
                    }, 2000);
                } else {
                    console.log('❌ Registration failed:', result.message);
                    showNotification(result.message, 'error');
                }
            });
        } else {
            console.warn('⚠️ Register form NOT found');
        }
    }
};

// ============================================================================
// UI FUNCTIONS
// ============================================================================

function showAppUI() {
    console.log('🎨 Showing app UI');
    const authModal = document.getElementById('authModal');
    const mainWrapper = document.querySelector('.main-wrapper');
    
    console.log('authModal:', authModal ? '✅ found' : '❌ not found');
    console.log('mainWrapper:', mainWrapper ? '✅ found' : '❌ not found');
    
    if (authModal) {
        authModal.style.display = 'none';
    }
    if (mainWrapper) {
        mainWrapper.style.display = 'flex';
    }
}

function showAuthUI() {
    console.log('🎨 Showing auth UI');
    const authModal = document.getElementById('authModal');
    const mainWrapper = document.querySelector('.main-wrapper');
    
    if (authModal) {
        authModal.style.display = 'flex';
    }
    if (mainWrapper) {
        mainWrapper.style.display = 'none';
    }
}

function updateUserDisplay() {
    console.log('📝 Updating user display');
    
    if (!authSystem.isLoggedIn()) {
        console.log('⚠️ User not logged in');
        return;
    }
    
    const userNameSpan = document.getElementById('currentUsername');
    const userRoleBadge = document.getElementById('currentUserRole');
    const userGreeting = document.getElementById('userGreeting');
    
    if (userNameSpan) {
        userNameSpan.textContent = authSystem.currentUser.fullname;
    }
    if (userRoleBadge) {
        userRoleBadge.textContent = authSystem.currentUser.role.toUpperCase();
        userRoleBadge.className = 'user-role-badge ' + authSystem.currentUser.role;
    }
    if (userGreeting) {
        userGreeting.textContent = `Welcome, ${authSystem.currentUser.fullname}!`;
    }
}

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        authSystem.logout();
        showAuthUI();
        showNotification('Logged out successfully', 'success');
    }
}

console.log('✅ auth.js loaded');
