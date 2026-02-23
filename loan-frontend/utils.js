// ===== UTILITY FUNCTIONS =====

// Format currency
function formatCurrency(value) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0
    }).format(value);
}

// Format number with commas
function formatNumber(value) {
    return new Intl.NumberFormat('en-IN').format(Math.round(value));
}

// Format percentage
function formatPercentage(value, decimals = 1) {
    return (value * 100).toFixed(decimals) + '%';
}

// Calculate risk level based on probability
function getRiskLevel(rejectionProbability) {
    if (rejectionProbability <= RISK_THRESHOLDS.LOW) {
        return { level: 'Low', score: Math.round(rejectionProbability * 100), color: COLORS.success };
    } else if (rejectionProbability <= RISK_THRESHOLDS.MEDIUM) {
        return { level: 'Medium', score: Math.round(rejectionProbability * 100), color: COLORS.warning };
    } else {
        return { level: 'High', score: Math.round(rejectionProbability * 100), color: COLORS.danger };
    }
}

// Show notification
function showNotification(message, type = 'info', duration = 5000) {
    const container = document.getElementById('notificationContainer');
    if (!container) {
        console.error('Notification container not found');
        return;
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    notification.innerHTML = `
        <i class="${icons[type] || icons.info}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(notification);
    
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    setTimeout(() => {
        notification.style.animation = 'slideDown 0.3s ease-out reverse';
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Save to localStorage
function saveToLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('localStorage error:', error);
    }
}

// Load from localStorage
function loadFromLocalStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error('localStorage error:', error);
        return defaultValue;
    }
}

// Download JSON file
function downloadJSON(data, filename) {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    downloadFile(blob, filename);
}

// Download CSV file
function downloadCSV(data, filename) {
    let csv = 'Date & Time,Income,Loan Amount,CIBIL,Status,Probability,Risk Level\n';
    
    data.forEach(row => {
        csv += `"${row.timestamp}","${row.income}","${row.loanAmount}","${row.cibil}","${row.status}","${row.probability}","${row.riskLevel}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    downloadFile(blob, filename);
}

// Generic download function
function downloadFile(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}

// Validate input ranges
function validateInputs(formData) {
    const errors = [];
    
    if (formData.income_annum < 100000 || formData.income_annum > 50000000) {
        errors.push('Income must be between ₹100,000 and ₹50,000,000');
    }
    
    if (formData.loan_amount < 50000 || formData.loan_amount > 30000000) {
        errors.push('Loan Amount must be between ₹50,000 and ₹30,000,000');
    }
    
    if (formData.cibil_score < 300 || formData.cibil_score > 900) {
        errors.push('CIBIL Score must be between 300 and 900');
    }
    
    if (formData.loan_term < 1 || formData.loan_term > 30) {
        errors.push('Loan Term must be between 1 and 30 years');
    }
    
    return errors;
}

// Format date and time
function formatDateTime(date) {
    return new Intl.DateTimeFormat('en-IN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).format(date);
}

// Copy to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Copied to clipboard!', 'success', 2000);
    }).catch(err => {
        console.error('Clipboard error:', err);
    });
}

// Initialize tooltips
function initializeTooltips() {
    const tooltips = document.querySelectorAll('.tooltip-icon');
    tooltips.forEach(tooltip => {
        tooltip.addEventListener('mouseenter', (e) => {
            const title = e.target.getAttribute('title');
            if (title) {
                // Add tooltip display logic here if needed
            }
        });
    });
}

// Animate number counting
function animateCounter(element, target, duration = 1000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const counter = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(counter);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// Get browser preference for dark mode
function getSystemThemePreference() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Check if date is today
function isToday(date) {
    const today = new Date();
    return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
}

// Truncate text
function truncateText(text, maxLength) {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

// Deep clone object
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// Generate UUID
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
