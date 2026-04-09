from fastapi import FastAPI, Request, Depends, HTTPException, status, Security
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.security.api_key import APIKeyHeader
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import pandas as pd
import os
from dotenv import load_dotenv

# ----------------------------
# Load API key from .env
# ----------------------------
load_dotenv()
API_KEY = os.getenv("API_KEY", "mysecretapikey123")

# ----------------------------
# Import backend modules
# ----------------------------
from .schemas import LoanApplication
from .model_loader import model, scaler, feature_columns, label_encoders
from .utils.logger import logger
from .utils.exceptions import PredictionError, prediction_exception_handler

from .database import Base, engine
from .auth_routes import router as auth_router

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

Base.metadata.create_all(bind=engine)

# -----------------------------------
# ✅ FIXED CORS (IMPORTANT)
# -----------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "https://yourloanguard.netlify.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------------
# Routers
# -----------------------------------
app.include_router(auth_router)


# -----------------------------------
# Exception Handlers
# -----------------------------------
app.add_exception_handler(PredictionError, prediction_exception_handler)


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
    response = await call_next(request)
    logger.info(f"Response status: {response.status_code}")
    return response


# -----------------------------------
# Root Endpoint
# -----------------------------------
@app.get("/")
def root():
    return {"message": "Loan Risk API is running 🚀"}


# -----------------------------------
# 🔒 Protected Prediction Endpoint
# -----------------------------------
@app.post("/predict")
def predict_loan(
    data: List[LoanApplication],
    api_key_valid: bool = Depends(verify_api_key)
):
    logger.info("Authenticated prediction request received")

    results = []

    for item in data:
        input_dict = item.dict()

        numeric_fields = [
            "no_of_dependents", "income_annum", "loan_amount", "loan_term",
            "cibil_score", "residential_assets_value", "commercial_assets_value",
            "luxury_assets_value", "bank_asset_value"
        ]

        for field in numeric_fields:
            if field in input_dict and input_dict[field] is not None:
                input_dict[field] = float(input_dict[field])

        df = pd.DataFrame([input_dict])

        categorical_cols = ["education", "self_employed"]
        for col in categorical_cols:
            if col in df.columns and col in label_encoders:
                value = str(df.at[0, col]).strip()
                classes = [c.strip() for c in label_encoders[col].classes_]

                if value not in classes:
                    raise PredictionError(
                        f"Invalid value for {col}. Allowed values: {classes}"
                    )

                df[col] = classes.index(value)

        df = df[feature_columns]
        df = df.astype(float)

        df_scaled = scaler.transform(df)

        prediction = model.predict(df_scaled)[0]
        probabilities = model.predict_proba(df_scaled)[0]

        result = "Approved" if prediction == 1 else "Rejected"

        results.append({
            "prediction": result,
            "approval_probability": float(probabilities[1]),
            "rejection_probability": float(probabilities[0])
        })

    return results