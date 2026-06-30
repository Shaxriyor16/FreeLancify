# Freelancify

Freelancify bu freelancer marketplace platformasi:
- Frontend: Vanilla HTML + CSS + JS (Hech qanday Framework yo'q)
- Backend: FastAPI (Python)
- Database: PostgreSQL, Redis, Elasticsearch

## BOSHLASH TARTIBI
1. INFRATUZILMA ISHGA TUSHIRISH:
   `docker-compose up -d`
   (PostgreSQL, Redis, Elasticsearch ishga tushadi)

2. BACKEND SOZLASH:
   cd backend
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   cp .env.example .env
   alembic upgrade head
   uvicorn main:app --reload --port 8000

3. FRONTEND ISHGA TUSHIRISH:
   cd frontend
   Live Server bilan index.html ochiladi
   YOKI: `npx serve . -p 5500`

4. API HUJJATLARI:
   http://localhost:8000/docs (Swagger UI)
   http://localhost:8000/redoc (ReDoc)

5. BIRINCHI ADMIN YARATISH:
   Register qiling. DB da user role ni admindek o'zgartiring:
   `UPDATE users SET role = 'admin' WHERE email = 'your@email.com';`