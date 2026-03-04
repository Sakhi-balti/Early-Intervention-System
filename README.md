
## 1) Requirements

Install these first:

- Python 3.10+
- Node.js 18+ and npm
- Git

Database:

 SQLite (no extra setup)


---

## 2) Download project

```bash
git clone <This-repo-url>
cd Early-Intervention-System
```

---

## 3) Run backend (Django)

```bash
cd backend
python -m venv .venv
Windows: .venv\Scripts\activate
pip install -r requirements.txt
```
Start backend:

````bash
python manage.py migrate
python manage.py runserver

`````
## 4) Run frontend (React)
Open a new terminal:
```bash
cd frontend
npm install
npm run dev
````

Frontend URL: `http://localhost:5173`

---

## 5) First admin user

```bash
cd backend
Windows: .venv\Scripts\activate
python manage.py createsuperuser
```

Admin panel: `http://127.0.0.1:8000/admin/`

---

## 6) Add your own data

You can add data in 2 ways:

### A) Django admin (easy)

1. Login to `/admin/`
2. Add users (student, teacher, counselor, admin)
3. Add attendance, grades, interventions

### B) API

Main endpoints:

- `POST /api/users/register/`
- `POST /api/users/login/`
- `POST /api/attendance/`
- `POST /api/grades/`
- `POST /api/interventions/`

For protected endpoints use:


## 7) Reset/Clean database

### SQLite full reset (local development)

```bash
cd backend
rm -f db.sqlite3
python manage.py migrate
python manage.py createsuperuser
```

### Delete all data but keep schema

```bash
cd backend
python manage.py flush --no-input
```

### PostgreSQL reset

Drop and recreate your DB, then:

```bash
cd backend
python manage.py migrate
python manage.py createsuperuser
```

---

## 8) ML model commands

```bash
cd ml_engine
python generate_data.py
python train_model.py
```

---
