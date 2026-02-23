// ============================================================================
// MAIN APPLICATION CONTROLLER
// ============================================================================

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Initialize authentication system
    authSystem.init();
    
    // Check if user is logged in
    if (authSystem.isLoggedIn()) {
        showAppUI();
        setupTheme();
        setupNavigation();
        initializePredictions();
        initializeAnalytics();
        
        setupHealthCheck();
        updateUserDisplay();
    } else {
        showAuthUI();
    }
    
    console.log('🚀 LoanRisk AI Platform initialized');
}

// ============================================================================
// AUTHENTICATION UI FUNCTIONS
// ============================================================================

function showAppUI() {
    const authModal = document.getElementById('authModal');
    const mainWrapper = document.querySelector('.main-wrapper');
    
    if (authModal) authModal.style.display = 'none';
    if (mainWrapper) mainWrapper.style.display = 'flex';
}

function showAuthUI() {
    const authModal = document.getElementById('authModal');
    const mainWrapper = document.querySelector('.main-wrapper');
    
    if (authModal) authModal.style.display = 'flex';
    if (mainWrapper) mainWrapper.style.display = 'none';
}

// ============================================================================
// THEME MANAGEMENT
// ============================================================================

function setupTheme() {
    const themeBtn = document.getElementById('themeBtn');
    const savedTheme = localStorage.getItem('loanrisk_theme') || 'light';
    
    // Apply saved theme
    applyTheme(savedTheme);
    
    // Theme toggle
    themeBtn?.addEventListener('click', toggleTheme);
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const themeBtn = document.getElementById('themeBtn');
    
    if (themeBtn) {
        themeBtn.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }
    
    localStorage.setItem('loanrisk_theme', theme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
}

// ============================================================================
// NAVIGATION
// ============================================================================

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.querySelector('.nav-menu');
    
    // Page navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            navigateTo(page);
            
            // Close mobile menu
            navMenu?.classList.remove('active');
        });
    });
    
    // Mobile menu toggle
    navToggle?.addEventListener('click', () => {
        navMenu?.classList.toggle('active');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-container')) {
            navMenu?.classList.remove('active');
        }
    });
}

function navigateTo(page) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    // Show selected page
    const pageElement = document.getElementById(`${page}-page`);
    if (pageElement) {
        pageElement.classList.add('active');
        
        // Update nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-page') === page) {
                link.classList.add('active');
            }
        });
        
        // Page-specific initialization
        if (page === 'analytics') {
            setTimeout(() => {
                analyticsSystem.loadDashboard();
            }, 100);
        } else if (page === 'home') {
            updateHomeStats();
        }
        
        // Scroll to top
        window.scrollTo(0, 0);
    }
}

// ============================================================================
// HOME PAGE STATS
// ============================================================================

function updateHomeStats() {
    const users = authSystem.getAllUsers();
    const predictions = predictionHistory || [];
    
    // Update KPI cards
    const totalUsers = users.length;
    const totalPredictions = predictions.length;
    const approvedCount = predictions.filter(p => p.status === 'Approved').length;
    const approvalRate = totalPredictions > 0 ? ((approvedCount / totalPredictions) * 100).toFixed(1) : 0;
    
    const homeUsersCount = document.getElementById('homeUsersCount');
    const homePredictionsCount = document.getElementById('homePredictionsCount');
    const homeApprovalRate = document.getElementById('homeApprovalRate');
    const homeApiCalls = document.getElementById('homeApiCalls');
    
    if (homeUsersCount) homeUsersCount.textContent = totalUsers;
    if (homePredictionsCount) homePredictionsCount.textContent = totalPredictions;
    if (homeApprovalRate) homeApprovalRate.textContent = approvalRate + '%';
    if (homeApiCalls) homeApiCalls.textContent = (totalPredictions * 2) + (Math.floor(Math.random() * 50));
}

// ============================================================================
// AUTH TAB SWITCHER
// ============================================================================

function switchAuthTab(tabName) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.auth-tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Show selected tab
    const selectedTab = document.getElementById(tabName);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Update button states
    const buttons = document.querySelectorAll('.auth-tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    // Mark current button as active
    if (event && event.target) {
        event.target.classList.add('active');
    }
}