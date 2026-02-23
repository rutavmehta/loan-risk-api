// ===== ANALYTICS FUNCTIONS =====

let approvalChart = null;
let riskDistributionChart = null;
let incomeRiskChart = null;
let cibilChart = null;
let featureImportanceChart = null;

// Initialize analytics
function initializeAnalytics() {
    updateAnalyticsKPIs();
    initializeCharts();
    updateHistoryTable();
    setupHistoryFilters();
}

// Update KPI metrics
function updateAnalyticsKPIs() {
    if (predictionHistory.length === 0) {
        document.getElementById('kpiApproved').textContent = '0';
        document.getElementById('kpiRejected').textContent = '0';
        document.getElementById('kpiApprovedPct').textContent = '0%';
        document.getElementById('kpiRejectedPct').textContent = '0%';
        document.getElementById('kpiAvgRisk').textContent = '0';
        document.getElementById('kpiTotal').textContent = '0';
        
        document.getElementById('totalPredictions').textContent = '0';
        document.getElementById('approvalRate').textContent = '0%';
        document.getElementById('avgRiskScore').textContent = '0';
        return;
    }
    
    const approved = predictionHistory.filter(p => p.status === 'Approved').length;
    const rejected = predictionHistory.filter(p => p.status === 'Rejected').length;
    const total = predictionHistory.length;
    const approvalRate = (approved / total * 100).toFixed(1);
    
    // Calculate average risk score
    const avgRiskScore = Math.round(
        predictionHistory.reduce((sum, p) => {
            return sum + getRiskLevel(p.originalData.rejection_probability).score;
        }, 0) / total
    );
    
    // Update KPI cards
    document.getElementById('kpiApproved').textContent = approved;
    document.getElementById('kpiRejected').textContent = rejected;
    document.getElementById('kpiApprovedPct').textContent = (approved / total * 100).toFixed(1) + '%';
    document.getElementById('kpiRejectedPct').textContent = (rejected / total * 100).toFixed(1) + '%';
    document.getElementById('kpiAvgRisk').textContent = avgRiskScore;
    document.getElementById('kpiTotal').textContent = total;
    
    // Update home page stats
    document.getElementById('totalPredictions').textContent = total;
    document.getElementById('approvalRate').textContent = approvalRate + '%';
    document.getElementById('avgRiskScore').textContent = avgRiskScore;
}

// Initialize all charts
function initializeCharts() {
    updateApprovalChart();
    updateRiskDistributionChart();
    updateIncomeRiskChart();
    updateCibilChart();
    updateFeatureImportanceChart();
}

// Approval Distribution Chart
function updateApprovalChart() {
    const approved = predictionHistory.filter(p => p.status === 'Approved').length;
    const rejected = predictionHistory.filter(p => p.status === 'Rejected').length;
    
    const ctx = document.getElementById('approvalChart').getContext('2d');
    
    if (approvalChart) {
        approvalChart.destroy();
    }
    
    approvalChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Approved', 'Rejected'],
            datasets: [{
                data: [approved, rejected],
                backgroundColor: ['#10b981', '#ef4444'],
                borderColor: ['#059669', '#dc2626'],
                borderWidth: 2
            }]
        },
        options: {
            ...CONFIG.CHARTS_CONFIG,
            plugins: {
                ...CONFIG.CHARTS_CONFIG.plugins,
                datalabels: {
                    ...CONFIG.CHARTS_CONFIG.plugins.datalabels,
                    formatter: (value, context) => {
                        const sum = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = (value * 100 / sum).toFixed(0);
                        return percentage + '%';
                    }
                }
            }
        }
    });
}

// Risk Distribution Chart
function updateRiskDistributionChart() {
    let lowRisk = 0, mediumRisk = 0, highRisk = 0;
    
    predictionHistory.forEach(p => {
        const riskLevel = getRiskLevel(p.originalData.rejection_probability).level;
        if (riskLevel === 'Low') lowRisk++;
        else if (riskLevel === 'Medium') mediumRisk++;
        else highRisk++;
    });
    
    const ctx = document.getElementById('riskDistributionChart').getContext('2d');
    
    if (riskDistributionChart) {
        riskDistributionChart.destroy();
    }
    
    riskDistributionChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Low Risk', 'Medium Risk', 'High Risk'],
            datasets: [{
                data: [lowRisk, mediumRisk, highRisk],
                backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                borderColor: ['#059669', '#d97706', '#dc2626'],
                borderWidth: 2
            }]
        },
        options: {
            ...CONFIG.CHARTS_CONFIG,
            plugins: {
                ...CONFIG.CHARTS_CONFIG.plugins,
                datalabels: {
                    ...CONFIG.CHARTS_CONFIG.plugins.datalabels,
                    formatter: (value, context) => {
                        const sum = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = (value * 100 / sum).toFixed(0);
                        return percentage + '%';
                    }
                }
            }
        }
    });
}

// Income vs Risk Score Chart
function updateIncomeRiskChart() {
    const data = predictionHistory.map(p => ({
        x: p.originalData.income_annum,
        y: getRiskLevel(p.originalData.rejection_probability).score,
        label: p.status
    }));
    
    const approvedData = data.filter(d => d.label === 'Approved');
    const rejectedData = data.filter(d => d.label === 'Rejected');
    
    const ctx = document.getElementById('incomeRiskChart').getContext('2d');
    
    if (incomeRiskChart) {
        incomeRiskChart.destroy();
    }
    
    incomeRiskChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'Approved',
                    data: approvedData,
                    backgroundColor: 'rgba(16, 185, 129, 0.5)',
                    borderColor: '#10b981',
                    borderWidth: 2,
                    showLine: false
                },
                {
                    label: 'Rejected',
                    data: rejectedData,
                    backgroundColor: 'rgba(239, 68, 68, 0.5)',
                    borderColor: '#ef4444',
                    borderWidth: 2,
                    showLine: false
                }
            ]
        },
        options: {
            ...CONFIG.CHARTS_CONFIG,
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: {
                        display: true,
                        text: 'Annual Income (₹)'
                    },
                    ticks: {
                        callback: value => '₹' + (value / 100000).toFixed(0) + 'L'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Risk Score'
                    },
                    max: 100
                }
            }
        }
    });
}

// CIBIL vs Approval Rate Chart
function updateCibilChart() {
    // Group by CIBIL score ranges
    const ranges = {
        '300-500': { range: [300, 500], approved: 0, rejected: 0 },
        '500-650': { range: [500, 650], approved: 0, rejected: 0 },
        '650-750': { range: [650, 750], approved: 0, rejected: 0 },
        '750-900': { range: [750, 900], approved: 0, rejected: 0 }
    };
    
    predictionHistory.forEach(p => {
        const cibil = p.originalData.cibil_score;
        for (const [key, obj] of Object.entries(ranges)) {
            if (cibil >= obj.range[0] && cibil < obj.range[1]) {
                if (p.status === 'Approved') obj.approved++;
                else obj.rejected++;
            }
        }
    });
    
    const labels = Object.keys(ranges);
    const approvedCounts = Object.values(ranges).map(r => r.approved);
    const rejectedCounts = Object.values(ranges).map(r => r.rejected);
    
    const ctx = document.getElementById('cibilChart').getContext('2d');
    
    if (cibilChart) {
        cibilChart.destroy();
    }
    
    cibilChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Approved',
                    data: approvedCounts,
                    backgroundColor: '#10b981',
                    borderColor: '#059669',
                    borderWidth: 2
                },
                {
                    label: 'Rejected',
                    data: rejectedCounts,
                    backgroundColor: '#ef4444',
                    borderColor: '#dc2626',
                    borderWidth: 2
                }
            ]
        },
        options: {
            ...CONFIG.CHARTS_CONFIG,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'CIBIL Score Range'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Count'
                    }
                }
            }
        }
    });
}

// Feature Importance Chart
function updateFeatureImportanceChart() {
    // Simulated feature importance based on model training
    const featureImportance = {
        'CIBIL Score': 25,
        'Income': 20,
        'Loan Amount': 18,
        'Total Assets': 15,
        'Loan Term': 10,
        'Employment Type': 7,
        'Education': 5
    };
    
    const ctx = document.getElementById('featureImportanceChart').getContext('2d');
    
    if (featureImportanceChart) {
        featureImportanceChart.destroy();
    }
    
    featureImportanceChart = new Chart(ctx, {
        type: 'barH',
        type: 'bar',
        data: {
            labels: Object.keys(featureImportance),
            datasets: [{
                label: 'Importance Score',
                data: Object.values(featureImportance),
                backgroundColor: [
                    '#6366f1',
                    '#3b82f6',
                    '#10b981',
                    '#f59e0b',
                    '#ef4444',
                    '#8b5cf6',
                    '#ec4899'
                ],
                borderColor: 'rgba(0, 0, 0, 0.1)',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            ...CONFIG.CHARTS_CONFIG,
            scales: {
                x: {
                    beginAtZero: true,
                    max: 30,
                    title: {
                        display: true,
                        text: 'Importance Score'
                    }
                }
            }
        }
    });
}

// Update history table
function updateHistoryTable() {
    const tbody = document.getElementById('historyTableBody');
    tbody.innerHTML = '';
    
    if (predictionHistory.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 2rem; color: #999;">No predictions yet</td></tr>';
        return;
    }
    
    predictionHistory.forEach((item, index) => {
        const tr = document.createElement('tr');
        const statusClass = item.status === 'Approved' ? 'status-approved' : 'status-rejected';
        const riskClass = `risk-${item.riskLevel.toLowerCase()}`;
        
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.timestamp}</td>
            <td>${item.income}</td>
            <td>${item.loanAmount}</td>
            <td>${item.cibil}</td>
            <td><span class="${statusClass}">${item.status}</span></td>
            <td>${item.probability}</td>
            <td><span class="${riskClass}">${item.riskLevel}</span></td>
            <td>
                <button class="btn-icon" onclick="viewPredictionDetail('${item.id}')" title="View">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// View prediction detail
function viewPredictionDetail(id) {
    const prediction = predictionHistory.find(p => p.id === id);
    if (!prediction) return;
    
    // Display the stored prediction details
    currentPrediction = prediction.originalData;
    displayPredictionResults(currentPrediction);
    
    // Navigate to predict page
    navigateTo('predict');
    
    showNotification('Prediction details loaded', 'info');
}

// Setup history filters
function setupHistoryFilters() {
    const searchInput = document.getElementById('historySearch');
    const statusFilter = document.getElementById('historyFilter');
    const riskFilter = document.getElementById('riskFilter');
    
    [searchInput, statusFilter, riskFilter].forEach(el => {
        el.addEventListener('change', filterHistory);
        el.addEventListener('keyup', filterHistory);
    });
}

// Filter history
function filterHistory() {
    const searchTerm = document.getElementById('historySearch').value.toLowerCase();
    const statusFilter = document.getElementById('historyFilter').value;
    const riskFilter = document.getElementById('riskFilter').value;
    
    const tbody = document.getElementById('historyTableBody');
    const rows = tbody.querySelectorAll('tr');
    
    let visibleCount = 0;
    
    rows.forEach((row, index) => {
        if (index === 0 && rows.length === 1) return; // Skip empty state
        
        const cells = row.querySelectorAll('td');
        const income = cells[2]?.textContent.toLowerCase() || '';
        const status = cells[5]?.textContent.toLowerCase() || '';
        const risk = cells[7]?.textContent.toLowerCase() || '';
        
        const matchesSearch = income.includes(searchTerm) || 
                             cells[3]?.textContent.toLowerCase().includes(searchTerm) ||
                             cells[4]?.textContent.toLowerCase().includes(searchTerm);
        const matchesStatus = !statusFilter || status.includes(statusFilter.toLowerCase());
        const matchesRisk = !riskFilter || risk.includes(riskFilter.toLowerCase());
        
        if (matchesSearch && matchesStatus && matchesRisk) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });
    
    if (visibleCount === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 2rem; color: #999;">No results found</td></tr>';
    }
}

// Download history
function downloadHistory() {
    if (predictionHistory.length === 0) {
        showNotification('No history to download', 'warning');
        return;
    }
    
    downloadCSV(predictionHistory, `prediction_history_${new Date().getTime()}.csv`);
    showNotification('History downloaded as CSV!', 'success');
}
