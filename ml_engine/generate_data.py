
import pandas as pd
import numpy as np
import os

np.random.seed(42)
NUM_STUDENTS = 500

data = []

for i in range(NUM_STUDENTS):
    # Randomly assign a risk profile
    profile = np.random.choice(['low', 'medium', 'high'], p=[0.5, 0.3, 0.2])

    if profile == 'low':
        attendance_pct = np.random.uniform(80, 100)
        grade_avg      = np.random.uniform(60, 100)
        incidents      = np.random.randint(0, 2)

    elif profile == 'medium':
        attendance_pct = np.random.uniform(60, 80)
        grade_avg      = np.random.uniform(40, 65)
        incidents      = np.random.randint(1, 4)

    else:  
        attendance_pct = np.random.uniform(30, 65)
        grade_avg      = np.random.uniform(20, 50)
        incidents      = np.random.randint(3, 8)

    # Add some noise to make data realistic
    attendance_pct = min(100, max(0, attendance_pct + np.random.normal(0, 3)))
    grade_avg      = min(100, max(0, grade_avg      + np.random.normal(0, 4)))

    data.append({
        'attendance_pct': round(attendance_pct, 2),
        'grade_avg':      round(grade_avg, 2),
        'incidents':      incidents,
        'risk_label':     profile,
    })

df = pd.DataFrame(data)

# Save to CSV
os.makedirs('data', exist_ok=True)
df.to_csv('data/students.csv', index=False)

print(f"Generated {NUM_STUDENTS} student records")
print(f"\nRisk distribution:")
print(df['risk_label'].value_counts())
print(f"\nSample data:")
print(df.head(10))
