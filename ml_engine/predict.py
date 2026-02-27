import pickle
import numpy as np
import os

# Path to saved model
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model', 'risk_model.pkl')

# Load model once when Django starts (not on every request)
_model = None

def get_model():
    global _model
    if _model is None:
        with open(MODEL_PATH, 'rb') as f:
            _model = pickle.load(f)
    return _model


def predict_risk(attendance_pct, grade_avg, incidents):
    # Predict risk through ML model,
    try:
        model    = get_model()
        features = np.array([[attendance_pct, grade_avg, incidents]])

        category = model.predict(features)[0]         
        proba    = model.predict_proba(features)[0]
        score    = round(float(max(proba)) * 100, 2)

        return category, score
    except Exception as e:
        print(f"Error in prediction: {e}")
        return "error", 0.0

    
