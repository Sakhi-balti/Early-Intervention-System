import pickle, os
import numpy as np
from django.conf import settings

MODEL_PATH = os.path.join(settings.BASE_DIR, '..', 'ml_engine', 'model', 'risk_model.pkl')

def get_features(student_id):
    """Pull last 30 days of data and compute feature values."""
    from apps.attendance.models import AttendanceLog
    from apps.grades.models import GradeRecord
    from django.utils import timezone
    from datetime import timedelta

    since = timezone.now().date() - timedelta(days=30)

    logs  = AttendanceLog.objects.filter(student_id=student_id, date__gte=since)
    total = logs.count()
    present = logs.filter(status='present').count()
    attendance_pct = (present / total * 100) if total > 0 else 100.0

    grades = GradeRecord.objects.filter(student_id=student_id, date__gte=since)
    grade_avg = grades.aggregate(avg=models.Avg('score'))['avg'] or 75.0

    from apps.interventions.models import Intervention
    incidents = Intervention.objects.filter(student_id=student_id).count()

    return attendance_pct, grade_avg, incidents

def calculate_and_save_risk(student_id):
    """Load model, predict risk, save to DB."""
    from apps.risk.models import RiskScore
    from django.db import models

    attendance_pct, grade_avg, incidents = get_features(student_id)

    # Load saved ML model
    try:
        with open(MODEL_PATH, 'rb') as f:
            model = pickle.load(f)
        features = np.array([[attendance_pct, grade_avg, incidents]])
        category = model.predict(features)[0]          # 'low' / 'medium' / 'high'
        proba    = model.predict_proba(features)[0]
        score    = round(float(max(proba)) * 100, 2)
    except FileNotFoundError:
        # Fallback rule-based scoring if model not trained yet
        score = 0
        if attendance_pct < 60: score += 40
        elif attendance_pct < 75: score += 20
        if grade_avg < 40: score += 40
        elif grade_avg < 55: score += 20
        score += incidents * 5
        score = min(score, 100)
        category = 'high' if score >= 70 else 'medium' if score >= 40 else 'low'

    risk = RiskScore.objects.create(
        student_id=student_id,
        score=score,
        category=category,
        attendance_pct=attendance_pct,
        grade_avg=grade_avg,
        incidents=incidents,
    )

    # Trigger alert if HIGH risk
    if category == 'high':
        from apps.alerts.models import Alert
        from apps.users.models import User
        counselors = User.objects.filter(role='counselor')
        for c in counselors:
            Alert.objects.create(
                student_id=student_id,
                sent_to=c,
                alert_type='high_risk',
                message=f"Student risk score is {score:.0f}% — attendance {attendance_pct:.0f}%, avg grade {grade_avg:.0f}",
            )
    return risk
