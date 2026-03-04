# backend/app/schemas.py

from pydantic import BaseModel, EmailStr
from typing import List


# -----------------------------------
# 🔐 AUTH SCHEMAS
# -----------------------------------

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# -----------------------------------
# 🏦 LOAN APPLICATION SCHEMA
# -----------------------------------

class LoanApplication(BaseModel):
    no_of_dependents: int
    education: str
    self_employed: str
    income_annum: float
    loan_amount: float
    loan_term: float
    cibil_score: float
    residential_assets_value: float
    commercial_assets_value: float
    luxury_assets_value: float
    bank_asset_value: float