"""
Custom Prometheus metrics for ML model monitoring
Tracks prediction performance, model accuracy, and business metrics
"""

from prometheus_client import Counter, Histogram, Gauge
import time
from functools import wraps

# =====================================================
# PREDICTION METRICS
# =====================================================

# Counter: Total predictions made
predictions_total = Counter(
    'ml_predictions_total',
    'Total number of predictions made',
    ['prediction_result', 'model_version']
)

# Histogram: Prediction latency
prediction_latency = Histogram(
    'ml_prediction_latency_seconds',
    'Time taken for prediction in seconds',
    buckets=(0.01, 0.05, 0.1, 0.5, 1.0, 2.0, 5.0)
)

# Counter: Approved loans
loans_approved = Counter(
    'ml_loans_approved_total',
    'Total number of approved loans',
    ['loan_purpose', 'income_bracket']
)

# Counter: Rejected loans
loans_rejected = Counter(
    'ml_loans_rejected_total',
    'Total number of rejected loans',
    ['rejection_reason', 'income_bracket']
)

# Gauge: Average loan amount
average_loan_amount = Gauge(
    'ml_average_loan_amount',
    'Average loan amount processed',
    ['prediction_result']
)

# Gauge: Average CIBIL score
average_cibil_score = Gauge(
    'ml_average_cibil_score',
    'Average CIBIL score of applicants',
    ['prediction_result']
)

# =====================================================
# MODEL PERFORMANCE METRICS
# =====================================================

# Gauge: Model accuracy
model_accuracy = Gauge(
    'ml_model_accuracy',
    'Current model accuracy',
    ['model_version']
)

# Gauge: Model precision
model_precision = Gauge(
    'ml_model_precision',
    'Model precision for loan approval prediction',
    ['model_version']
)

# Gauge: Model recall
model_recall = Gauge(
    'ml_model_recall',
    'Model recall for loan approval prediction',
    ['model_version']
)

# Gauge: Model F1 score
model_f1_score = Gauge(
    'ml_model_f1_score',
    'Model F1 score',
    ['model_version']
)

# Gauge: Prediction confidence
prediction_confidence = Histogram(
    'ml_prediction_confidence',
    'Distribution of prediction confidence scores',
    buckets=(0.5, 0.6, 0.7, 0.8, 0.9, 0.95, 1.0)
)

# =====================================================
# DATA QUALITY METRICS
# =====================================================

# Counter: Invalid inputs
invalid_inputs_total = Counter(
    'ml_invalid_inputs_total',
    'Total number of invalid input submissions',
    ['validation_error']
)

# Gauge: Data quality score
data_quality_score = Gauge(
    'ml_data_quality_score',
    'Overall data quality score (0-100)'
)

# Counter: Missing values
missing_values_detected = Counter(
    'ml_missing_values_total',
    'Total missing values detected in features',
    ['feature_name']
)

# =====================================================
# API HEALTH METRICS
# =====================================================

# Counter: API errors
api_errors_total = Counter(
    'ml_api_errors_total',
    'Total API errors',
    ['error_type', 'endpoint']
)

# Gauge: Model load time
model_load_time = Gauge(
    'ml_model_load_time_seconds',
    'Time taken to load the model'
)

# Gauge: Active predictions
active_predictions = Gauge(
    'ml_active_predictions',
    'Number of predictions currently being processed'
)

# =====================================================
# BUSINESS METRICS
# =====================================================

# Gauge: Approval rate
approval_rate = Gauge(
    'ml_approval_rate',
    'Current loan approval rate (0-100)'
)

# Gauge: Average processing time
average_processing_time = Gauge(
    'ml_average_processing_time_seconds',
    'Average time to process a loan application'
)

# Counter: High-risk applications
high_risk_applications = Counter(
    'ml_high_risk_applications_total',
    'Total high-risk applications detected',
    ['risk_level']
)


def track_prediction_time(func):
    """Decorator to track prediction execution time"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        active_predictions.inc()
        try:
            result = func(*args, **kwargs)
            return result
        finally:
            duration = time.time() - start_time
            prediction_latency.observe(duration)
            active_predictions.dec()
    return wrapper


def track_model_metrics(accuracy, precision, recall, f1, model_version="1.0"):
    """Update model performance metrics"""
    model_accuracy.labels(model_version=model_version).set(accuracy)
    model_precision.labels(model_version=model_version).set(precision)
    model_recall.labels(model_version=model_version).set(recall)
    model_f1_score.labels(model_version=model_version).set(f1)
