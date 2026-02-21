# main.py

from fastapi import FastAPI, Request, Depends, HTTPException, status, Security
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.security.api_key import APIKeyHeader
from typing import List
import pandas as pd
import os
from dotenv import load_dotenv

# ----------------------------
# Load API key from .env
# ----------------------------
load_dotenv()
API_KEY = os.getenv("API_KEY")
if not API_KEY:
    raise RuntimeError("API_KEY not found in .env file!")

# ----------------------------
# Import backend modules
# ----------------------------
from backend.app.schemas import LoanApplication
from backend.app.model_loader import model, scaler, feature_columns, label_encoders
from backend.app.utils.logger import logger
from backend.app.utils.exceptions import PredictionError, prediction_exception_handler

# ----------------------------
# Security dependency
# ----------------------------
api_key_header = APIKeyHeader(name="x-api-key")


def verify_api_key(api_key: str = Security(api_key_header)):
    if api_key != API_KEY:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid API Key"
        )
    return True

# -----------------------------------
# Create FastAPI App
# -----------------------------------
app = FastAPI(
    title="Loan Risk Prediction API",
    version="1.0.0"
)

# -----------------------------------
# Register Custom Exception Handlers
# -----------------------------------
app.add_exception_handler(PredictionError, prediction_exception_handler)

# 422 Validation Error Handler
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.error(f"Validation Error at {request.url}: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={
            "error": "Validation Error",
            "details": exc.errors()
        }
    )

# 500 Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Exception at {request.url}: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "detail": str(exc)
        }
    )

# -----------------------------------
# Logging Middleware
# -----------------------------------
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Incoming request: {request.method} {request.url}")
    try:
        response = await call_next(request)
    except Exception as e:
        logger.error(f"Unhandled exception: {str(e)}")
        raise e
    logger.info(f"Response status: {response.status_code}")
    return response

# -----------------------------------
# Root Endpoint
# -----------------------------------
@app.get("/")
def root():
    return {"message": "Loan Risk API with API Key Authentication is running 🚀"}

# -----------------------------------
# 🔒 Protected Prediction Endpoint (API Key, batch support)
# -----------------------------------
@app.post("/predict")
def predict_loan(
    data: List[LoanApplication],
    api_key_valid: bool = Depends(verify_api_key)
):
    logger.info(f"Authenticated request using API Key")

    results = []

    for item in data:
        input_dict = item.dict()
        df = pd.DataFrame([input_dict])

        # Label encoding
        categorical_cols = ["education", "self_employed"]
        for col in categorical_cols:
            if col in df.columns and col in label_encoders:
                value = str(df.at[0, col]).strip()
                classes = [c.strip() for c in label_encoders[col].classes_]

                if value not in classes:
                    raise PredictionError(
                        f"Invalid value for {col}. Allowed values: {classes}"
                    )

                df.at[0, col] = classes.index(value)

        # Maintain feature order
        df = df[feature_columns]

        # Convert all to numeric
        for col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')

        # Scale features
        df_scaled = scaler.transform(df)

        # Predict
        prediction = model.predict(df_scaled)[0]
        probabilities = model.predict_proba(df_scaled)[0]

        result = "Approved" if prediction == 1 else "Rejected"

        logger.info(
            f"Prediction: {result}, "
            f"Approval Probability: {probabilities[1]}, "
            f"Rejection Probability: {probabilities[0]}"
        )

        results.append({
            "prediction": result,
            "approval_probability": float(probabilities[1]),
            "rejection_probability": float(probabilities[0])
        })

    return results
