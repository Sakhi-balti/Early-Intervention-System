import sys, os
from django.db.models import Avg
from django.utils import timezone
from datetime import timedelta

# Add ml_engine folder to path so Django can import predict.py
BASE = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
ML_PATH = os.path.join(BASE, 'ml_engine')
if ML_PATH not in sys.path:
    sys.path.insert(0, ML_PATH)


def get_student_features(student_id):
    from apps.attendance.models import AttendanceLog
    from apps.grades.models import GradeRecord
    from apps.interventions.models import Intervention

    since   = timezone.now().date() - timedelta(days=30)
    logs    = AttendanceLog.objects.filter(student_id=student_id, date__gte=since)
    total   = logs.count()
    present = logs.filter(status='present').count()
    attendance_pct = round((present / total * 100), 2) if total > 0 else 100.0

    grades    = GradeRecord.objects.filter(student_id=student_id, date__gte=since)
    grade_avg = grades.aggregate(avg=Avg('score'))['avg'] or 75.0
    grade_avg = round(grade_avg, 2)

    incidents = Intervention.objects.filter(student_id=student_id).count()

    return attendance_pct, grade_avg, incidents


def calculate_and_save_risk(student_id):
    from apps.risk.models import RiskScore
    from apps.alerts.models import Alert
    from apps.users.models import User

    attendance_pct, grade_avg, incidents = get_student_features(student_id)

    try:
        from predict import predict_risk
        category, score = predict_risk(attendance_pct, grade_avg, incidents)
    except Exception as e:
        print(f"ML error: {e} — using fallback rules")
        score = 0
        if attendance_pct < 60:   score += 40
        elif attendance_pct < 75: score += 20
        if grade_avg < 40:        score += 40
        elif grade_avg < 55:      score += 20
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

    if category == 'high':
        counselors = User.objects.filter(role='counselor')
        for counselor in counselors:
            exists = Alert.objects.filter(
                student_id=student_id, sent_to=counselor,
                is_read=False, alert_type='high_risk'
            ).exists()
            if not exists:
                Alert.objects.create(
                    student_id=student_id, sent_to=counselor,
                    alert_type='high_risk',
                    message=f"Risk: {score:.0f}% | Attendance: {attendance_pct:.0f}% | Grade: {grade_avg:.0f} | Incidents: {incidents}",
                )

    return risk
