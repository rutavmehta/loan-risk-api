# backend/app/model_loader.py

import os
import pickle

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models")

def load_pickle(file_name):
    file_path = os.path.join(MODEL_DIR, file_name)
    try:
        with open(file_path, "rb") as f:
            obj = pickle.load(f)
        print(f"[✅ Loaded] {file_name}")
        return obj
    except Exception as e:
        print(f"[❌ Failed] {file_name}: {e}")
        return None

feature_columns = load_pickle("feature_columns.pkl")
label_encoders = load_pickle("label_encoders.pkl")
scaler = load_pickle("scaler.pkl")
model = load_pickle("loan_model.pkl")

__all__ = ["model", "scaler", "feature_columns", "label_encoders"]
