

# Early Intervention System

A full-stack student early warning platform that helps schools detect at-risk students using attendance, grades, behavior incidents, and intervention history.

- **Backend:** Django + Django REST Framework + JWT auth
- **Frontend:** React + Vite
- **ML Engine:** Scikit-learn model for risk prediction

---

## 1) System Requirements

### Required software

- **Python 3.10+** (recommended: 3.11)
- **Node.js 18+** and **npm 9+**
- **Git**

### Database options

- **Default (easy): SQLite** (no setup needed)


### Tested local ports

- Backend API: `http://127.0.0.1:8000`
- Frontend app: `http://localhost:5173`

---

## 2) Project Structure

```text
Early-Intervention-System/
├── backend/                # Django API
├── frontend/               # React app (Vite)
├── ml_engine/              # Model scripts + trained model/data
├── System_Architecture/    
└── README.md
```

---

## 3) Setup & Run (Local Machine)

### Step A — Clone

```bash
git clone <this repository >
open  Early-Intervention-System on VScode
```

### Step B — Backend setup (Django)

```bash
cd backend
python -m venv .venv
Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Run migrations and start backend:

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

Backend now runs at: `http://127.0.0.1:8000`

### Step C — Frontend setup (React)

Open a **new terminal**:

```bash
cd frontend
npm install
npm run dev
```

Frontend now runs at: `http://localhost:5173`

> The frontend is preconfigured to call `http://127.0.0.1:8000/api`.

---

## 4) First-Time Admin User (recommended)

Create a superuser so you can access Django admin and manage data:

```bash
cd backend
Windows: .venv\Scripts\activate
python manage.py createsuperuser
```

Admin panel:

- URL: `http://127.0.0.1:8000/admin/`

---

## 5) How to Add Your Own Data

You can add data using either:

1. **Django Admin UI** (easiest for manual entry), or
2. **API endpoints** (best for importing from another system/script).

### A) Using Django Admin

1. Login at `/admin/`.
2. Create users with correct roles (`student`, `teacher`, `counselor`, `admin`).
3. Add attendance logs, grades, and interventions from respective models.

### B) Using API

Main endpoints (all prefixed with `/api/`):

- `POST /users/register/` — create user
- `POST /users/login/` — get JWT tokens
- `POST /attendance/` — add attendance
- `POST /grades/` — add grade
- `POST /interventions/` — add intervention

Use login token as:

```http
Authorization: Bearer <access_token>
```

---

## 6) How to Clean / Reset the Database

> Choose the method that matches your database.

### Option A — Quick reset for SQLite (development)

```bash
cd backend
rm -f db.sqlite3
find . -path "*/migrations/*.py" -not -name "__init__.py" -delete
find . -path "*/migrations/*.pyc" -delete
python manage.py makemigrations
python manage.py migrate
```

Then recreate admin user:

```bash
python manage.py createsuperuser
```

### Option B — Keep schema but delete data only

```bash
cd backend
python manage.py flush --no-input
```

This removes table data but keeps migrations/schema.

### Option C — PostgreSQL reset (manual)

```sql
DROP DATABASE early_intervention_db;
CREATE DATABASE early_intervention_db;
```

Then run again:

```bash
cd backend
python manage.py migrate
python manage.py createsuperuser
```

---

## 7) ML Engine (Risk Model)

Inside `ml_engine/`:

- `generate_data.py` — generates synthetic training CSV
- `train_model.py` — trains and saves model to `ml_engine/model/risk_model.pkl`
- `predict.py` — inference helper used by backend

To regenerate training data and retrain model:

```bash
cd ml_engine
python generate_data.py
python train_model.py
```

---

## 8) Common Run Commands

### Start backend

```bash
cd backend
 Windows: .venv\Scripts\activate
python manage.py runserver
```

### Start frontend

```bash
cd frontend
npm run dev
```

### Run backend checks

```bash
cd backend
python manage.py check
```



