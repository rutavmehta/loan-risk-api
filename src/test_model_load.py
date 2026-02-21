import joblib

MODEL_DIR = r"E:\loan-risk-platform\models"

loan_model_test = joblib.load(f"{MODEL_DIR}/loan_model.pkl")

print("✅ Model loaded successfully!")
print(loan_model_test)
