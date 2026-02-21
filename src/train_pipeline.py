# train_pipeline.py

import pandas as pd
import numpy as np
import os
import pickle

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from imblearn.over_sampling import SMOTE

# ============================
# 1. Load Dataset
# ============================

DATA_PATH = "../data/loan_approval_dataset.csv"
df = pd.read_csv(DATA_PATH)
df.columns = df.columns.str.strip()  # remove hidden spaces

print("Dataset Loaded Successfully")
print(df.head())
print("\nColumns:\n", df.columns)

# ============================
# 2. Basic Cleaning
# ============================

df.drop(columns=["loan_id"], inplace=True, errors="ignore")  # drop ID column
df.dropna(inplace=True)  # drop missing values

# ============================
# 3. Separate Target
# ============================

y = df["loan_status"].str.strip()
X = df.drop("loan_status", axis=1)

print("\nUnique target values:", y.unique())

# Convert target to binary
y = y.map({"Approved": 1, "Rejected": 0})
if y.isna().sum() > 0:
    print("WARNING: Some target values were not mapped correctly!")
    print("Unmapped values:", df["loan_status"].unique())

# ============================
# 4. Encode Categorical Features
# ============================

label_encoders = {}
categorical_cols = X.select_dtypes(include="object").columns

for col in categorical_cols:
    le = LabelEncoder()
    X[col] = le.fit_transform(X[col].astype(str))
    label_encoders[col] = le

# ============================
# 5. Train Test Split
# ============================

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# ============================
# 6. SMOTE (Handle Imbalance)
# ============================

smote = SMOTE(random_state=42)
X_train_smote, y_train_smote = smote.fit_resample(X_train, y_train)

print("\nAfter SMOTE:")
print(y_train_smote.value_counts())

# ============================
# 7. Scaling
# ============================

scaler = StandardScaler()
X_train_smote = scaler.fit_transform(X_train_smote)
X_test_scaled = scaler.transform(X_test)

# ============================
# 8. Train Model
# ============================

model = RandomForestClassifier(
    n_estimators=300,
    max_depth=12,
    random_state=42
)

model.fit(X_train_smote, y_train_smote)

# ============================
# 9. Evaluate Model
# ============================

y_pred = model.predict(X_test_scaled)

print("\nAccuracy:", accuracy_score(y_test, y_pred))
print("\nClassification Report:\n", classification_report(y_test, y_pred))
print("\nConfusion Matrix:\n", confusion_matrix(y_test, y_pred))

# ============================
# 10. Save Model + Artifacts (pickle)
# ============================

MODEL_DIR = "../models"
os.makedirs(MODEL_DIR, exist_ok=True)

# Save model
with open(os.path.join(MODEL_DIR, "loan_model.pkl"), "wb") as f:
    pickle.dump(model, f)

# Save scaler
with open(os.path.join(MODEL_DIR, "scaler.pkl"), "wb") as f:
    pickle.dump(scaler, f)

# Save feature columns
with open(os.path.join(MODEL_DIR, "feature_columns.pkl"), "wb") as f:
    pickle.dump(X.columns.tolist(), f)

# Save label encoders
with open(os.path.join(MODEL_DIR, "label_encoders.pkl"), "wb") as f:
    pickle.dump(label_encoders, f)

print("\n✅ Model and artifacts saved successfully with pickle!")
