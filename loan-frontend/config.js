// ===== CONFIGURATION FILE =====
const CONFIG = {
    API_URL: 'http://54.224.188.210:8000',
    API_KEY: 'mysecretapikey123',
    TIMEOUT: 30000, // 30 seconds
    RATE_LIMIT_DELAY: 3000, // 3 seconds between predictions
    HISTORY_LIMIT: 20, // Max history items stored
    CHARTS_CONFIG: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                display: true,
                position: 'top',
            },
            datalabels: {
                display: true,
                color: '#fff',
                font: {
                    weight: 'bold',
                    size: 12
                },
                formatter: (value) => {
                    return (value * 100).toFixed(0) + '%';
                }
            }
        }
    }
};

// Feature metadata
const FEATURE_METADATA = {
    'no_of_dependents': {
        label: 'Number of Dependents',
        category: 'Personal',
        type: 'select'
    },
    'education': {
        label: 'Education',
        category: 'Personal',
        type: 'select'
    },
    'self_employed': {
        label: 'Employment Type',
        category: 'Personal',
        type: 'select'
    },
    'income_annum': {
        label: 'Annual Income',
        category: 'Financial',
        type: 'currency'
    },
    'loan_amount': {
        label: 'Loan Amount',
        category: 'Financial',
        type: 'currency'
    },
    'loan_term': {
        label: 'Loan Term',
        category: 'Financial',
        type: 'number'
    },
    'cibil_score': {
        label: 'CIBIL Score',
        category: 'Credit',
        type: 'number'
    },
    'residential_assets_value': {
        label: 'Residential Assets',
        category: 'Assets',
        type: 'currency'
    },
    'commercial_assets_value': {
        label: 'Commercial Assets',
        category: 'Assets',
        type: 'currency'
    },
    'luxury_assets_value': {
        label: 'Luxury Assets',
        category: 'Assets',
        type: 'currency'
    },
    'bank_asset_value': {
        label: 'Bank Assets',
        category: 'Assets',
        type: 'currency'
    }
};

// Risk thresholds
const RISK_THRESHOLDS = {
    LOW: 0.33,
    MEDIUM: 0.66,
    HIGH: 1.0
};

// Color schemes
const COLORS = {
    approved: '#10b981',
    rejected: '#ef4444',
    primary: '#6366f1',
    warning: '#f59e0b',
    success: '#10b981',
    danger: '#ef4444'
};
