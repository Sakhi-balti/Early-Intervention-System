import pandas as pd
import numpy as np
import pickle
import os
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
from sklearn.preprocessing import LabelEncoder

# ── Load data ─────────────────────────────────────────────
print("Loading training data...")
df = pd.read_csv('data/students.csv')

# ── Features and labels ───────────────────────────────────
X = df[['attendance_pct', 'grade_avg', 'incidents']].values
y = df['risk_label'].values   

# ── Split into train/test ─────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print(f"Training samples : {len(X_train)}")
print(f"Testing  samples : {len(X_test)}")

# ── Train RandomForest ────────────────────────────────────
print("\n Training Random Forest model...")
model = RandomForestClassifier(
    n_estimators=100,
    max_depth=10,
    random_state=42,
    class_weight='balanced',   
)
model.fit(X_train, y_train)

# ── Evaluate ──────────────────────────────────────────────
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

print(f"\n Model Accuracy: {accuracy * 100:.1f}%")
print("\n Detailed Report:")
print(classification_report(y_test, y_pred))

# ── Save model ────────────────────────────────────────────
os.makedirs('model', exist_ok=True)
model_path = 'model/risk_model.pkl'
with open(model_path, 'wb') as f:
    pickle.dump(model, f)

print(f" Model saved to: {model_path}")

# ── Quick test ────────────────────────────────────────────
print("\nQuick test predictions:")
test_cases = [
    [95, 80, 0],   # should be LOW
    [65, 50, 2],   # should be MEDIUM
    [45, 35, 5],   # should be HIGH
]
for case in test_cases:
    pred  = model.predict([case])[0]
    proba = model.predict_proba([case])[0]
    score = round(max(proba) * 100, 1)
    print(f"  Attendance:{case[0]}% | Grade:{case[1]} | Incidents:{case[2]} → {pred.upper()} (confidence: {score}%)")
