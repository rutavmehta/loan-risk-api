import pandas as pd
import pickle

# Load label encoders
with open('backend/app/models/label_encoders.pkl', 'rb') as f:
    label_encoders = pickle.load(f)

with open('backend/app/models/scaler.pkl', 'rb') as f:
    scaler = pickle.load(f)

# Test data
test_data = {
    "no_of_dependents": 2,
    "education": "Graduate",
    "self_employed": "No",
    "income_annum": 850000,
    "loan_amount": 2500000,
    "loan_term": 20,
    "cibil_score": 750,
    "residential_assets_value": 3000000,
    "commercial_assets_value": 0,
    "luxury_assets_value": 200000,
    "bank_asset_value": 500000
}

# Create DataFrame
df = pd.DataFrame([test_data])
print("Initial dtypes:")
print(df.dtypes)
print()

# Try encoding
for col in ["education", "self_employed"]:
    value = str(df.at[0, col]).strip()
    classes = [c.strip() for c in label_encoders[col].classes_]
    encoded_value = classes.index(value)
    df[col] = encoded_value

print("After encoding dtypes:")
print(df.dtypes)
print()

# Select only feature columns
feature_columns = ['no_of_dependents', 'education', 'self_employed', 'income_annum', 
                  'loan_amount', 'loan_term', 'cibil_score', 'residential_assets_value',
                  'commercial_assets_value', 'luxury_assets_value', 'bank_asset_value']
df = df[feature_columns]

print("After column selection dtypes:")
print(df.dtypes)
print()

# Try numeric conversion
for col in df.columns:
    df[col] = pd.to_numeric(df[col], errors='coerce')

print("After numeric conversion dtypes:")
print(df.dtypes)
print()

print("DataFrame:")
print(df)
print()

# Try scaling
try:
    df_scaled = scaler.transform(df)
    print("Scaling successful!")
    print("Scaled data:", df_scaled)
except Exception as e:
    print(f"Scaling failed with error: {e}")
    print(f"Error type: {type(e).__name__}")
