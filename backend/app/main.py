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
API_KEY = os.getenv("API_KEY", "mysecretapikey123")  # Default key

# ----------------------------
# Import backend modules
# ----------------------------
from .schemas import LoanApplication
from .model_loader import model, scaler, feature_columns, label_encoders
from .utils.logger import logger
from .utils.exceptions import PredictionError, prediction_exception_handler

# NEW: database and auth router
from .database import Base, engine
from .auth_routes import router as auth_router

# ----------------------------
# Security dependency - REQUIRED for predictions
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

# NEW: Create all tables (users, sessions, predictions, etc.)
Base.metadata.create_all(bind=engine)

# NEW: CORS so frontend at http://localhost:3000/3001 can call this API
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "https://yourloanguard.netlify.app", 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# NEW: include authentication routes under /auth
app.include_router(auth_router)

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
# 🔒 Protected Prediction Endpoint (API Key Required)
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

        # Convert all numeric fields to float explicitly
        numeric_fields = [
            "no_of_dependents", "income_annum", "loan_amount", "loan_term",
            "cibil_score", "residential_assets_value", "commercial_assets_value",
            "luxury_assets_value", "bank_asset_value"
        ]
        for field in numeric_fields:
            if field in input_dict and input_dict[field] is not None:
                input_dict[field] = float(input_dict[field])

        # Create DataFrame
        df = pd.DataFrame([input_dict])

        # Label encoding for categorical fields
        categorical_cols = ["education", "self_employed"]
        for col in categorical_cols:
            if col in df.columns and col in label_encoders:
                # Clean and validate value against encoder classes
                value = str(df.at[0, col]).strip()
                classes = [c.strip() for c in label_encoders[col].classes_]

                if value not in classes:
                    raise PredictionError(
                        f"Invalid value for {col}. Allowed values: {classes}"
                    )

                # Encode the categorical value by index
                encoded_value = classes.index(value)
                df[col] = encoded_value

        # Maintain feature order
        df = df[feature_columns]

        # Ensure all features are numeric float (avoid mixed dtypes)
        df = df.astype(float)

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
