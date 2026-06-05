# Career Coach — Fullstack

Progetto finale Epicode: job board con AI integrata. Due deliverable indipendenti che si possono usare insieme.

## Cosa c'e' dentro

```
Final-Exam/
├── backend/    Spring Boot + PostgreSQL + JWT + Gemini + Adzuna + RemoteOK
└── frontend/   Vite + React + Redux Toolkit + Thunk + React Router + Tailwind
```

Ogni sottocartella ha il proprio `README.md` con istruzioni dettagliate.

## Come avviare tutto (in ordine)

```powershell
# 1. Postgres
cd backend
docker compose up -d

# 2. Backend (resta in foreground)
mvn spring-boot:run        # http://localhost:8080

# 3. Frontend (in un altro terminale)
cd ../frontend
npm install
npm run dev                # http://localhost:5173
```

Account admin di default (creato al primo avvio del backend):
`admin@career.coach` / `admin123`

## Demo veloce

1. Vai su http://localhost:5173 e registra un account `RECRUITER`
2. Crea un'azienda dalla dashboard recruiter
3. Crea 2-3 offerte di lavoro
4. Logout, registra un account `CANDIDATE`
5. Dalla dashboard candidato crea un CV
6. Vai su `/jobs`, applica filtri, apri un'offerta
7. Clicca "Chiedi una review AI" → l'AI (Gemini) analizza il tuo CV vs l'offerta e ti da' uno score 0-100
8. Genera una cover letter su misura dalla pagina AI
9. Candidati all'offerta scegliendo CV + cover letter
10. Logout, login come recruiter → vedi la candidatura nella dashboard
