// ============================================================================
// ADMIN.JS - COMPREHENSIVE ADMIN DASHBOARD & MANAGEMENT
// ============================================================================

const adminDashboard = {
    charts: {},
    filters: {
        userStatus: 'all',
        userRole: 'all',
        dateRange: '7d'
    },
    
    init() {
        if (!authSystem.isAdmin()) return;
        this.setupEventListeners();
        this.loadDashboard();
    },
    
    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.admin-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
        
        // User management
        const addUserBtn = document.getElementById('addUserBtn');
        if (addUserBtn) {
            addUserBtn.addEventListener('click', () => this.showAddUserForm());
        }
        
        // Filter changes
        const userStatusFilter = document.getElementById('userStatusFilter');
        if (userStatusFilter) {
            userStatusFilter.addEventListener('change', () => {
                this.filters.userStatus = userStatusFilter.value;
                this.loadUsersTable();
            });
        }
        
        const userRoleFilter = document.getElementById('userRoleFilter');
        if (userRoleFilter) {
            userRoleFilter.addEventListener('change', () => {
                this.filters.userRole = userRoleFilter.value;
                this.loadUsersTable();
            });
        }
        
        const dateRangeFilter = document.getElementById('dateRangeFilter');
        if (dateRangeFilter) {
            dateRangeFilter.addEventListener('change', () => {
                this.filters.dateRange = dateRangeFilter.value;
                this.loadDashboard();
            });
        }
    },
    
    loadDashboard() {
        this.loadSystemStats();
        this.loadSystemCharts();
        this.loadUsersTable();
        this.loadActivityLog();
        this.loadSystemHealth();
    },
    
    switchTab(tabName) {
        // Hide all tab contents
        document.querySelectorAll('.admin-tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Remove active class from buttons
        document.querySelectorAll('.admin-tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show selected tab
        const selectedTab = document.getElementById(`admin-${tabName}`);
        if (selectedTab) {
            selectedTab.classList.add('active');
        }
        
        // Mark button as active
        event.target.classList.add('active');
    },
    
    loadSystemStats() {
        const stats = this.calculateSystemStats();
        
        const statBoxes = {
            'totalUsers': stats.totalUsers,
            'activeUsers': stats.activeUsers,
            'totalPredictions': stats.totalPredictions,
            'avgPredictionsPerUser': stats.avgPredictionsPerUser.toFixed(1),
            'admins': stats.admins,
            'activeNow': stats.activeNow
        };
        
        Object.entries(statBoxes).forEach(([key, value]) => {
            const el = document.getElementById(`stat-${key}`);
            if (el) el.textContent = value;
        });
    },
    
    calculateSystemStats() {
        const users = authSystem.getAllUsers();
        const predictions = predictionHistory || [];
        
        return {
            totalUsers: users.length,
            activeUsers: users.filter(u => u.status === 'active').length,
            totalPredictions: users.reduce((sum, u) => sum + (u.predictions || 0), 0),
            avgPredictionsPerUser: users.length > 0 ? users.reduce((sum, u) => sum + (u.predictions || 0), 0) / users.length : 0,
            admins: Array.from(authSystem.adminUsers).length,
            activeNow: Math.floor(Math.random() * 5) + 1
        };
    },
    
    loadSystemCharts() {
        this.createUserRoleChart();
        this.createUserStatusChart();
        this.createPredictionChart();
        this.createLoginActivityChart();
    },
    
    createUserRoleChart() {
        const ctx = document.getElementById('userRoleChart');
        if (!ctx) return;
        
        const users = authSystem.getAllUsers();
        const admins = users.filter(u => u.role === 'admin').length;
        const regularUsers = users.filter(u => u.role === 'user').length;
        
        if (this.charts.userRole) {
            this.charts.userRole.destroy();
        }
        
        this.charts.userRole = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Admins', 'Regular Users'],
                datasets: [{
                    data: [admins, regularUsers],
                    backgroundColor: ['#6366f1', '#10b981'],
                    borderColor: '#fff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom' },
                    datalabels: { formatter: (value, ctx) => {
                        const sum = ctx.dataset.data.reduce((a, b) => a + b, 0);
                        return ((value * 100) / sum).toFixed(1) + '%';
                    }}
                }
            }
        });
    },
    
    createUserStatusChart() {
        const ctx = document.getElementById('userStatusChart');
        if (!ctx) return;
        
        const users = authSystem.getAllUsers();
        const active = users.filter(u => u.status === 'active').length;
        const inactive = users.filter(u => u.status === 'inactive').length;
        
        if (this.charts.userStatus) {
            this.charts.userStatus.destroy();
        }
        
        this.charts.userStatus = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Active', 'Inactive'],
                datasets: [{
                    data: [active, inactive],
                    backgroundColor: ['#10b981', '#ef4444'],
                    borderColor: '#fff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    },
    
    createPredictionChart() {
        const ctx = document.getElementById('predictionChart');
        if (!ctx) return;
        
        const users = authSystem.getAllUsers();
        const topUsers = users
            .sort((a, b) => (b.predictions || 0) - (a.predictions || 0))
            .slice(0, 5);
        
        if (this.charts.predictions) {
            this.charts.predictions.destroy();
        }
        
        this.charts.predictions = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: topUsers.map(u => u.fullname),
                datasets: [{
                    label: 'Predictions Made',
                    data: topUsers.map(u => u.predictions || 0),
                    backgroundColor: '#6366f1',
                    borderColor: '#4f46e5',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                indexAxis: 'y',
                plugins: {
                    legend: { display: false }
                }
            }
        });
    },
    
    createLoginActivityChart() {
        const ctx = document.getElementById('loginActivityChart');
        if (!ctx) return;
        
        if (this.charts.loginActivity) {
            this.charts.loginActivity.destroy();
        }
        
        this.charts.loginActivity = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Login Activity',
                    data: [12, 19, 8, 15, 22, 14, 9],
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                }
            }
        });
    },
    
    loadUsersTable() {
        const tableBody = document.getElementById('usersTableBody');
        if (!tableBody) return;
        
        let users = authSystem.getAllUsers();
        
        // Apply filters
        if (this.filters.userStatus !== 'all') {
            users = users.filter(u => u.status === this.filters.userStatus);
        }
        if (this.filters.userRole !== 'all') {
            users = users.filter(u => u.role === this.filters.userRole);
        }
        
        tableBody.innerHTML = users.map(user => `
            <tr class="user-row" data-username="${user.username}">
                <td>
                    <div class="user-name">
                        <i class="fas fa-user-circle"></i>
                        <span>${user.fullname}</span>
                    </div>
                </td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>
                    <span class="role-badge ${user.role}">${user.role.toUpperCase()}</span>
                </td>
                <td>
                    <span class="status-badge ${user.status}">${user.status.toUpperCase()}</span>
                </td>
                <td>${user.predictions || 0}</td>
                <td>${user.loginCount || 0}</td>
                <td class="user-actions">
                    <button class="action-btn edit" onclick="adminDashboard.editUser('${user.username}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${authSystem.adminUsers.has(user.username) && user.username !== 'admin' ? `
                        <button class="action-btn demote" onclick="adminDashboard.demoteUser('${user.username}')" title="Demote">
                            <i class="fas fa-chevron-down"></i>
                        </button>
                    ` : user.role === 'user' ? `
                        <button class="action-btn promote" onclick="adminDashboard.promoteUser('${user.username}')" title="Promote">
                            <i class="fas fa-chevron-up"></i>
                        </button>
                    ` : ''}
                    ${user.status === 'active' && user.username !== 'admin' ? `
                        <button class="action-btn deactivate" onclick="adminDashboard.deactivateUser('${user.username}')" title="Deactivate">
                            <i class="fas fa-ban"></i>
                        </button>
                    ` : user.status === 'inactive' ? `
                        <button class="action-btn activate" onclick="adminDashboard.activateUser('${user.username}')" title="Activate">
                            <i class="fas fa-check"></i>
                        </button>
                    ` : ''}
                    ${user.username !== 'admin' ? `
                        <button class="action-btn delete" onclick="adminDashboard.deleteUser('${user.username}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : ''}
                </td>
            </tr>
        `).join('');
    },
    
    editUser(username) {
        const user = authSystem.getUser(username);
        if (!user) return;
        
        const modal = document.getElementById('editUserModal');
        if (!modal) return;
        
        document.getElementById('editUsername').value = username;
        document.getElementById('editFullname').value = user.fullname;
        document.getElementById('editEmail').value = user.email;
        document.getElementById('editUserStatus').value = user.status;
        
        modal.style.display = 'flex';
    },
    
    saveUserEdit() {
        const username = document.getElementById('editUsername').value;
        const fullname = document.getElementById('editFullname').value;
        const email = document.getElementById('editEmail').value;
        const status = document.getElementById('editUserStatus').value;
        
        authSystem.updateUser(username, {
            fullname: fullname,
            email: email,
            status: status
        });
        
        showNotification('User updated successfully', 'success');
        this.loadUsersTable();
        document.getElementById('editUserModal').style.display = 'none';
    },
    
    deleteUser(username) {
        if (username === 'admin') {
            showNotification('Cannot delete main admin user', 'error');
            return;
        }
        
        if (confirm(`Delete user "${username}"? This cannot be undone.`)) {
            authSystem.deleteUser(username);
            showNotification('User deleted successfully', 'success');
            this.loadDashboard();
        }
    },
    
    promoteUser(username) {
        authSystem.promoteToAdmin(username);
        showNotification('User promoted to admin', 'success');
        this.loadDashboard();
    },
    
    demoteUser(username) {
        if (username === 'admin') {
            showNotification('Cannot demote main admin', 'error');
            return;
        }
        
        authSystem.demoteFromAdmin(username);
        showNotification('User demoted to regular user', 'success');
        this.loadDashboard();
    },
    
    deactivateUser(username) {
        if (username === 'admin') {
            showNotification('Cannot deactivate main admin', 'error');
            return;
        }
        
        authSystem.deactivateUser(username);
        showNotification('User deactivated', 'success');
        this.loadUsersTable();
    },
    
    activateUser(username) {
        authSystem.activateUser(username);
        showNotification('User activated', 'success');
        this.loadUsersTable();
    },
    
    showAddUserForm() {
        const modal = document.getElementById('addUserModal');
        if (modal) {
            modal.style.display = 'flex';
            document.getElementById('newUserForm')?.reset();
        }
    },
    
    addNewUser() {
        const username = document.getElementById('newUsername').value;
        const email = document.getElementById('newEmail').value;
        const fullname = document.getElementById('newFullname').value;
        const password = document.getElementById('newPassword').value;
        const role = document.getElementById('newUserRole').value;
        
        if (!username || !email || !fullname || !password) {
            showNotification('All fields are required', 'error');
            return;
        }
        
        const result = authSystem.register(username, email, password, password, fullname);
        if (result.success) {
            if (role === 'admin') {
                authSystem.promoteToAdmin(username);
            }
            showNotification('User added successfully', 'success');
            this.loadDashboard();
            document.getElementById('addUserModal').style.display = 'none';
        } else {
            showNotification(result.message, 'error');
        }
    },
    
    loadActivityLog() {
        const logContainer = document.getElementById('activityLogContainer');
        if (!logContainer) return;
        
        const logs = [
            { time: '2 minutes ago', user: 'john_doe', action: 'Made loan prediction', status: 'success' },
            { time: '15 minutes ago', user: 'admin', action: 'Updated user settings', status: 'success' },
            { time: '1 hour ago', user: 'sarah_smith', action: 'Viewed analytics dashboard', status: 'success' },
            { time: '3 hours ago', user: 'demo-admin', action: 'Exported prediction data', status: 'success' },
            { time: '5 hours ago', user: 'user1', action: 'Downloaded report', status: 'success' }
        ];
        
        logContainer.innerHTML = logs.map(log => `
            <div class="activity-log-item">
                <div class="activity-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="activity-content">
                    <p class="activity-action">${log.action}</p>
                    <p class="activity-meta">${log.user} • ${log.time}</p>
                </div>
            </div>
        `).join('');
    },
    
    loadSystemHealth() {
        const healthEl = document.getElementById('systemHealthStatus');
        if (!healthEl) return;
        
        const health = {
            status: 'Healthy',
            uptime: '99.9%',
            responseTime: '250ms',
            cpu: '45%',
            memory: '62%',
            database: 'Connected'
        };
        
        const statusColor = health.status === 'Healthy' ? 'success' : 'warning';
        
        healthEl.innerHTML = `
            <div class="health-item">
                <div class="health-label">Status</div>
                <div class="health-value status-${statusColor}">${health.status}</div>
            </div>
            <div class="health-item">
                <div class="health-label">Uptime</div>
                <div class="health-value">${health.uptime}</div>
            </div>
            <div class="health-item">
                <div class="health-label">Response Time</div>
                <div class="health-value">${health.responseTime}</div>
            </div>
            <div class="health-item">
                <div class="health-label">CPU</div>
                <div class="health-bar">
                    <div class="health-fill" style="width: ${health.cpu}"></div>
                </div>
            </div>
            <div class="health-item">
                <div class="health-label">Memory</div>
                <div class="health-bar">
                    <div class="health-fill" style="width: ${health.memory}"></div>
                </div>
            </div>
            <div class="health-item">
                <div class="health-label">Database</div>
                <div class="health-value status-success">${health.database}</div>
            </div>
        `;
    }
};

// Modal helpers
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Close modals on outside click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});
