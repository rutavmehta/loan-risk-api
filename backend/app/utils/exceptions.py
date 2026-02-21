from fastapi import Request
from fastapi.responses import JSONResponse
from backend.app.utils.logger import logger

class PredictionError(Exception):
    def __init__(self, detail: str):
        self.detail = detail

async def prediction_exception_handler(request: Request, exc: PredictionError):
    logger.error(f"PredictionError at {request.url}: {exc.detail}")
    return JSONResponse(
        status_code=400,
        content={
            "error": "Prediction failed",
            "detail": exc.detail,
            "url": str(request.url)
        }
    )
