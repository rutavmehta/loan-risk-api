// ===== PREDICTION HANDLING =====

let currentPrediction = null;
let predictionHistory = [];
let probChart = null;
let riskChart = null;

// Initialize prediction page
function initializePredictions() {
    const form = document.getElementById('predictionForm');
    form.addEventListener('submit', handlePrediction);
    
    // Load saved inputs
    loadSavedInputs();
    
    // Load history
    loadPredictionHistory();
}

// Handle prediction submission
async function handlePrediction(e) {
    e.preventDefault();
    
    // Check rate limit
    if (!checkRateLimit()) {
        showNotification('Please wait before making another prediction', 'warning');
        applyRateLimit();
        return;
    }
    
    const form = new FormData(e.target);
    
    try {
        // Validate inputs
        const formData = formatDataForAPI(form);
        const errors = validateInputs(formData);
        
        if (errors.length > 0) {
            showNotification(errors.join(', '), 'error');
            return;
        }
        
        // Show loading
        showLoading(true);
        
        // Make API call
        const result = await api.predictSingle(formData);
        const prediction = result[0]; // API returns array
        
        // Process result
        currentPrediction = {
            ...formData,
            ...prediction,
            timestamp: new Date(),
            id: generateUUID()
        };
        
        // Display results
        displayPredictionResults(currentPrediction);
        
        // Save to history
        addToPredictionHistory(currentPrediction);
        
        // Save inputs
        saveCurrentInputs(formData);
        
        // Show success notification
        showNotification('Prediction completed successfully!', 'success');
        
        // Apply rate limit
        applyRateLimit();
        
    } catch (error) {
        console.error('Prediction error:', error);
        showNotification(`Error: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

// Display prediction results
function displayPredictionResults(prediction) {
    const container = document.getElementById('resultsContainer');
    const placeholder = document.getElementById('noResultsPlaceholder');
    
    // Hide placeholder, show results
    placeholder.style.display = 'none';
    container.style.display = 'block';
    
    // Update status badge
    const isApproved = prediction.prediction === 'Approved';
    const statusBadge = document.getElementById('statusBadge');
    statusBadge.className = `status-badge ${isApproved ? 'approved' : 'rejected'}`;
    statusBadge.innerHTML = `
        <i class="fas ${isApproved ? 'fa-check-circle' : 'fa-times-circle'}"></i>
        <span id="predictionText">${prediction.prediction}</span>
    `;
    
    // Update status details
    const approvalProb = (prediction.approval_probability * 100).toFixed(2);
    document.getElementById('loanStatus').textContent = prediction.prediction;
    document.getElementById('approvalProb').textContent = approvalProb + '%';
    
    // Update risk score
    const rejectionProb = prediction.rejection_probability;
    const riskInfo = getRiskLevel(rejectionProb);
    const riskScore = riskInfo.score;
    
    document.getElementById('riskScoreText').textContent = riskScore;
    document.getElementById('riskLabel').textContent = riskInfo.level + ' Risk';
    document.getElementById('riskLabel').style.color = riskInfo.color;
    
    // Update gauge
    const circumference = 251.2; // For path length
    const strokeDashoffset = circumference * (1 - (riskScore / 100));
    const gaugeFill = document.getElementById('gaugeFill');
    gaugeFill.style.strokeDasharray = `${circumference - strokeDashoffset}, ${circumference}`;
    
    if (riskScore <= 33) {
        gaugeFill.classList.remove('medium-risk', 'high-risk');
        gaugeFill.classList.add('low-risk');
    } else if (riskScore <= 66) {
        gaugeFill.classList.remove('low-risk', 'high-risk');
        gaugeFill.classList.add('medium-risk');
    } else {
        gaugeFill.classList.remove('low-risk', 'medium-risk');
        gaugeFill.classList.add('high-risk');
    }
    
    // Update charts
    updatePredictionCharts(prediction);
    
    // Update explanation
    updateExplanation(prediction);
    
    // Update input summary table
    updateInputSummaryTable(prediction);
    
    // Show recommendations if rejected
    if (prediction.prediction === 'Rejected') {
        showRecommendations(prediction);
    } else {
        document.getElementById('recommendationPanel').style.display = 'none';
    }
    
    // Scroll to results
    setTimeout(() => {
        document.getElementById('resultsContainer').scrollIntoView({ behavior: 'smooth' });
    }, 100);
}

// Update prediction charts
function updatePredictionCharts(prediction) {
    const approvalProb = prediction.approval_probability;
    const rejectionProb = prediction.rejection_probability;
    
    // Probability bar chart
    const probCtx = document.getElementById('probChart').getContext('2d');
    
    if (probChart) {
        probChart.destroy();
    }
    
    probChart = new Chart(probCtx, {
        type: 'bar',
        data: {
            labels: ['Rejection', 'Approval'],
            datasets: [{
                label: 'Probability',
                data: [rejectionProb, approvalProb],
                backgroundColor: [
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(16, 185, 129, 0.8)'
                ],
                borderColor: [
                    '#ef4444',
                    '#10b981'
                ],
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            ...CONFIG.CHARTS_CONFIG,
            indexAxis: 'y',
            scales: {
                x: {
                    beginAtZero: true,
                    max: 1,
                    ticks: {
                        callback: value => (value * 100).toFixed(0) + '%'
                    }
                }
            }
        }
    });
    
    // Risk distribution pie chart
    const riskCtx = document.getElementById('riskChart').getContext('2d');
    
    if (riskChart) {
        riskChart.destroy();
    }
    
    const riskInfo = getRiskLevel(rejectionProb);
    const riskColors = {
        'Low': '#10b981',
        'Medium': '#f59e0b',
        'High': '#ef4444'
    };
    
    riskChart = new Chart(riskCtx, {
        type: 'doughnut',
        data: {
            labels: ['Risk', 'Safe'],
            datasets: [{
                data: [rejectionProb, approvalProb],
                backgroundColor: [
                    riskColors[riskInfo.level],
                    'rgba(200, 200, 200, 0.3)'
                ],
                borderColor: [
                    riskColors[riskInfo.level],
                    '#ccc'
                ],
                borderWidth: 2
            }]
        },
        options: CONFIG.CHARTS_CONFIG
    });
}

// Update explanation panel
function updateExplanation(prediction) {
    const explanationDiv = document.getElementById('explanationText');
    let explanation = '<ul style="list-style-position: inside; line-height: 1.8;">';
    
    const isApproved = prediction.prediction === 'Approved';
    const approvalProb = prediction.approval_probability;
    
    // CIBIL Score explanation
    if (prediction.cibil_score < 500) {
        explanation += '<li><strong>❌ Low CIBIL Score:</strong> Credit score below 500 significantly increases risk of default.</li>';
    } else if (prediction.cibil_score >= 500 && prediction.cibil_score < 750) {
        explanation += '<li><strong>⚠️ Fair CIBIL Score:</strong> Score between 500-750 indicates moderate credit risk.</li>';
    } else {
        explanation += '<li><strong>✓ Strong CIBIL Score:</strong> Score above 750 demonstrates good creditworthiness.</li>';
    }
    
    // Income to Loan ratio
    const loanToIncomeRatio = (prediction.loan_amount / prediction.income_annum) * 100;
    if (loanToIncomeRatio > 50) {
        explanation += `<li><strong>❌ High Loan-to-Income Ratio:</strong> Loan is ${loanToIncomeRatio.toFixed(0)}% of annual income, indicating high repayment burden.</li>`;
    } else if (loanToIncomeRatio > 30) {
        explanation += `<li><strong>⚠️ Moderate Loan-to-Income Ratio:</strong> Loan is ${loanToIncomeRatio.toFixed(0)}% of annual income.</li>`;
    } else {
        explanation += `<li><strong>✓ Healthy Loan-to-Income Ratio:</strong> Loan is ${loanToIncomeRatio.toFixed(0)}% of annual income, showing strong repayment capacity.</li>`;
    }
    
    // Assets explanation
    const totalAssets = prediction.residential_assets_value + 
                       prediction.commercial_assets_value + 
                       prediction.luxury_assets_value + 
                       prediction.bank_asset_value;
    
    if (totalAssets > prediction.loan_amount * 2) {
        explanation += '<li><strong>✓ Strong Asset Base:</strong> Total assets exceed 2x the loan amount, providing good collateral security.</li>';
    } else if (totalAssets > prediction.loan_amount) {
        explanation += '<li><strong>⚠️ Moderate Asset Base:</strong> Assets cover loan amount but limited surplus available.</li>';
    } else {
        explanation += '<li><strong>❌ Weak Asset Base:</strong> Assets insufficient to cover loan amount.</li>';
    }
    
    // Employment status
    if (prediction.self_employed === 'Yes') {
        explanation += '<li><strong>⚠️ Self-Employed:</strong> Income variability of self-employed individuals adds to risk.</li>';
    } else {
        explanation += '<li><strong>✓ Salaried:</strong> Stable employment with consistent income stream reduces risk.</li>';
    }
    
    // Final verdict
    explanation += '<li style="border-top: 1px solid #ccc; margin-top: 1rem; padding-top: 1rem;">';
    if (isApproved) {
        explanation += `<strong>✓ APPROVED:</strong> Strong approval probability of ${(approvalProb * 100).toFixed(1)}% based on positive indicators.`;
    } else {
        explanation += `<strong>❌ REJECTED:</strong> Approval probability is only ${(approvalProb * 100).toFixed(1)}% due to risk factors above.`;
    }
    explanation += '</li>';
    
    explanation += '</ul>';
    explanationDiv.innerHTML = explanation;
}

// Show recommendations
function showRecommendations(prediction) {
    const panel = document.getElementById('recommendationPanel');
    const list = document.getElementById('recommendationList');
    list.innerHTML = '';
    
    const recommendations = [];
    
    // Credit score improvement
    if (prediction.cibil_score < 650) {
        recommendations.push('Improve CIBIL score - aim for 700+ by paying bills on time');
    }
    
    // Loan amount reduction
    if ((prediction.loan_amount / prediction.income_annum) > 0.4) {
        const reducedAmount = Math.floor(prediction.income_annum * 0.4);
        recommendations.push(`Request lower loan amount (approx. ₹${formatNumber(reducedAmount)})`);
    }
    
    // Asset increase
    const totalAssets = prediction.residential_assets_value + 
                       prediction.commercial_assets_value + 
                       prediction.luxury_assets_value + 
                       prediction.bank_asset_value;
    if (totalAssets < prediction.loan_amount) {
        recommendations.push('Increase collateral/security assets');
    }
    
    // Income increase suggestion
    if ((prediction.loan_amount / prediction.income_annum) > 0.5) {
        recommendations.push('Increase household income or add co-applicant with additional income');
    }
    
    // Default recommendations
    if (recommendations.length === 0) {
        recommendations.push('Reapply after 6 months with improved financial profile');
        recommendations.push('Consult with financial advisor for debt management');
    }
    
    recommendations.forEach(rec => {
        const li = document.createElement('li');
        li.textContent = rec;
        list.appendChild(li);
    });
    
    panel.style.display = 'block';
}

// Update input summary table
function updateInputSummaryTable(prediction) {
    const tbody = document.querySelector('#inputTable tbody');
    tbody.innerHTML = '';
    
    const previousPrediction = predictionHistory.length > 1 ? predictionHistory[1] : null;
    
    Object.entries(prediction).forEach(([key, value]) => {
        if (['prediction', 'approval_probability', 'rejection_probability', 'timestamp', 'id'].includes(key)) {
            return;
        }
        
        const metadata = FEATURE_METADATA[key];
        if (!metadata) return;
        
        const tr = document.createElement('tr');
        let displayValue = value;
        
        if (metadata.type === 'currency') {
            displayValue = formatCurrency(value);
        } else if (metadata.type === 'number') {
            displayValue = formatNumber(value);
        }
        
        // Check if value changed from previous prediction
        const isChanged = previousPrediction && previousPrediction[key] !== value;
        const rowClass = isChanged ? 'table-changed' : '';
        
        tr.className = rowClass;
        tr.innerHTML = `
            <td><strong>${metadata.label}</strong></td>
            <td>${displayValue}</td>
            <td><span style="color: #999; font-size: 0.9rem;">${metadata.category}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

// Add to prediction history
function addToPredictionHistory(prediction) {
    const historyItem = {
        id: prediction.id,
        timestamp: formatDateTime(prediction.timestamp),
        income: formatCurrency(prediction.income_annum),
        loanAmount: formatCurrency(prediction.loan_amount),
        cibil: prediction.cibil_score,
        status: prediction.prediction,
        probability: (prediction.approval_probability * 100).toFixed(1) + '%',
        riskLevel: getRiskLevel(prediction.rejection_probability).level,
        originalData: prediction
    };
    
    predictionHistory.unshift(historyItem);
    
    // Limit history size
    if (predictionHistory.length > CONFIG.HISTORY_LIMIT) {
        predictionHistory = predictionHistory.slice(0, CONFIG.HISTORY_LIMIT);
    }
    
    // Save to localStorage
    saveToLocalStorage('predictionHistory', predictionHistory);
    
    // Update history table in analytics
    updateHistoryTable();
    
    // Update KPIs
    updateAnalyticsKPIs();
}

// Load prediction history
function loadPredictionHistory() {
    predictionHistory = loadFromLocalStorage('predictionHistory', []);
}

// Save current inputs to localStorage
function saveCurrentInputs(formData) {
    saveToLocalStorage('lastInputs', formData);
}

// Load saved inputs
function loadSavedInputs() {
    const saved = loadFromLocalStorage('lastInputs');
    if (!saved) return;
    
    Object.entries(saved).forEach(([key, value]) => {
        const element = document.querySelector(`[name="${key}"]`);
        if (element) {
            element.value = value;
        }
    });
}

// Download single prediction
function downloadSinglePrediction() {
    if (!currentPrediction) {
        showNotification('No prediction to download', 'warning');
        return;
    }
    
    const data = {
        timestamp: currentPrediction.timestamp,
        prediction: currentPrediction.prediction,
        approvalProbability: (currentPrediction.approval_probability * 100).toFixed(2) + '%',
        rejectionProbability: (currentPrediction.rejection_probability * 100).toFixed(2) + '%',
        riskScore: getRiskLevel(currentPrediction.rejection_probability).score,
        applicantDetails: {
            income: formatCurrency(currentPrediction.income_annum),
            loanAmount: formatCurrency(currentPrediction.loan_amount),
            cibilScore: currentPrediction.cibil_score,
            loanTerm: currentPrediction.loan_term + ' years',
            education: currentPrediction.education,
            employed: currentPrediction.self_employed === 'No' ? 'Salaried' : 'Self-Employed',
            dependents: currentPrediction.no_of_dependents
        }
    };
    
    downloadJSON(data, `prediction_${new Date().getTime()}.json`);
    showNotification('Prediction downloaded!', 'success');
}
