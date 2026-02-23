// ===== API FUNCTIONS =====

class LoanAPI {
    constructor(baseURL, apiKey) {
        this.baseURL = baseURL;
        this.apiKey = apiKey;
        this.timeout = CONFIG.TIMEOUT;
    }

    // Make HTTP request with timeout
    async request(endpoint, method = 'GET', data = null) {
        const url = `${this.baseURL}${endpoint}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey
                },
                signal: controller.signal
            };

            if (data) {
                options.body = JSON.stringify(data);
            }

            const response = await fetch(url, options);
            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new Error('Request timeout. Please try again.');
            }
            
            throw error;
        }
    }

    // Check API health
    async checkHealth() {
        try {
            const response = await fetch(`${this.baseURL}/`, {
                method: 'GET',
                signal: AbortSignal.timeout(5000)
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    // Predict single loan
    async predictSingle(applicationData) {
        const data = [applicationData]; // API expects array
        return await this.request('/predict', 'POST', data);
    }

    // Predict batch
    async predictBatch(applications) {
        return await this.request('/predict', 'POST', applications);
    }
}

// Initialize API client
const api = new LoanAPI(CONFIG.API_URL, CONFIG.API_KEY);

// Rate limiting
let lastPredictionTime = 0;
let isRateLimited = false;

function checkRateLimit() {
    const now = Date.now();
    if (now - lastPredictionTime < CONFIG.RATE_LIMIT_DELAY) {
        return false;
    }
    lastPredictionTime = now;
    return true;
}

function applyRateLimit() {
    isRateLimited = true;
    const predictBtn = document.getElementById('predictBtn');
    predictBtn.disabled = true;
    let countdown = 3;
    
    const timer = setInterval(() => {
        predictBtn.textContent = `Wait ${countdown}s before next prediction`;
        countdown--;
        
        if (countdown < 0) {
            clearInterval(timer);
            isRateLimited = false;
            predictBtn.disabled = false;
            predictBtn.innerHTML = '<i class="fas fa-magic"></i> Predict Loan Status';
        }
    }, 1000);
}

// Format data for API
function formatDataForAPI(formData) {
    return {
        no_of_dependents: parseInt(formData.get('no_of_dependents')),
        education: formData.get('education'),
        self_employed: formData.get('self_employed'),
        income_annum: parseFloat(formData.get('income_annum')),
        loan_amount: parseFloat(formData.get('loan_amount')),
        loan_term: parseFloat(formData.get('loan_term')),
        cibil_score: parseFloat(formData.get('cibil_score')),
        residential_assets_value: parseFloat(formData.get('residential_assets_value')),
        commercial_assets_value: parseFloat(formData.get('commercial_assets_value')),
        luxury_assets_value: parseFloat(formData.get('luxury_assets_value')),
        bank_asset_value: parseFloat(formData.get('bank_asset_value'))
    };
}

// Show loading indicator
function showLoading(show = true) {
    const predictBtn = document.getElementById('predictBtn');
    if (show) {
        predictBtn.disabled = true;
        predictBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Predicting...';
    } else {
        predictBtn.disabled = false;
        predictBtn.innerHTML = '<i class="fas fa-magic"></i> Predict Loan Status';
    }
}

// Auto-refresh health status
function setupHealthCheck() {
    async function checkHealth() {
        const isOnline = await api.checkHealth();
        updateHealthStatus(isOnline);
    }
    
    // Initial check
    checkHealth();
    
    // Periodic checks
    setInterval(checkHealth, 30000); // Every 30 seconds
}

function updateHealthStatus(isOnline) {
    const statusDot = document.getElementById('healthStatus');
    const statusText = document.getElementById('healthText');
    const apiStatusBox = document.getElementById('apiStatus');
    
    if (isOnline) {
        statusDot.classList.remove('offline');
        statusText.textContent = 'API is Online';
        apiStatusBox.classList.remove('status-offline');
        apiStatusBox.classList.add('status-online');
        apiStatusBox.querySelector('h4').textContent = 'Online';
    } else {
        statusDot.classList.add('offline');
        statusText.textContent = 'API is Offline';
        apiStatusBox.classList.remove('status-online');
        apiStatusBox.classList.add('status-offline');
        apiStatusBox.querySelector('h4').textContent = 'Offline';
    }
}
