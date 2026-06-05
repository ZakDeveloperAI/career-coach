# Career Coach — Frontend

Frontend React per Career Coach. Consuma il backend Spring sulla porta 8080 via proxy Vite.

## Stack

- **Vite** + **React 19** (JavaScript)
- **Redux Toolkit** + **Redux Thunk** (async via `createAsyncThunk`)
- **React Router 6** (incluso dynamic routing)
- **Tailwind CSS 3**
- **Axios**

## Setup

```powershell
npm install
npm run dev          # avvia su http://localhost:5173
```

Il backend deve girare su http://localhost:8080. Tutte le `/api/*` del frontend vengono proxate al backend (vedi `vite.config.js`).

## Funzionalita'

### 9 pagine
| Path | Pagina | Note |
|---|---|---|
| `/` | Home | Vetrina + stats totali e top companies |
| `/login` | Login | Form controllato con validation |
| `/register` | Register | Form controllato con scelta del ruolo |
| `/jobs` | Listing offerte | **Filtri + paginazione** (q, location, remote, salary, categoria, contract, skills) |
| `/jobs/:id` | Job detail | **Dynamic routing**, form candidatura, save job, CTA AI review |
| `/me` | Candidate dashboard | CV (CRUD), cover letters, candidature |
| `/me/ai-review` | AI Coach | Analizza CV vs offerta + genera cover letter |
| `/recruiter` | Recruiter dashboard | Aziende, offerte (CRUD), candidature ricevute |
| `*` | 404 | Not found |

### 8 controlled forms con validation
1. Login (email + password)
2. Register (email, password, nome, cognome, role)
3. Create CV
4. Apply to job (scelta CV + cover letter)
5. AI review (scelta offerta + CV)
6. Generate cover letter (offerta + CV + tone)
7. Create company
8. Create job

### Ruoli e routing protetto
- **CANDIDATE**: vede `/me`, `/me/ai-review`
- **RECRUITER**: vede `/recruiter`
- **ADMIN**: vede entrambi
- I `ProtectedRoute` redirigono a `/login` se non autenticati e alla home se ruolo sbagliato.

### Redux slices
- `auth` — login/register/me/logout, token JWT in `localStorage`
- `jobs` — list paginata, current, filtri, CRUD
- `applications` — mine + per company
- `resumes` — CRUD CV + cover letters
- `ai` — review + cover letter generation, status loading/error
- `companies` — list + mine + create

Ogni async usa `createAsyncThunk` (Redux Thunk).

### Stato globale e gestione errori
- Token JWT iniettato dall'interceptor Axios in ogni request
- 401 → logout automatico + redirect a `/login`
- Errori dell'API esposti nelle slice come `state.error`
- Validation lato form prima del submit

## Struttura
```
src/
├── api/client.js              axios + interceptor JWT
├── store/index.js             configureStore + reducers
├── features/
│   ├── auth/authSlice.js
│   ├── jobs/jobsSlice.js
│   ├── applications/applicationsSlice.js
│   ├── resumes/resumesSlice.js
│   ├── ai/aiSlice.js
│   └── companies/companiesSlice.js
├── components/
│   ├── Layout.jsx             header + outlet + footer
│   ├── ProtectedRoute.jsx     guard auth + role
│   └── JobCard.jsx
├── pages/                     9 pagine
├── App.jsx                    rotte
├── main.jsx                   Provider + BrowserRouter
└── index.css                  Tailwind + reset
```

## Account di test

Al primo avvio del backend, un admin di default viene creato:
- `admin@career.coach` / `admin123`

Crea poi un recruiter e un candidate dalla pagina `/register`.

## Build production

```powershell
npm run build       # genera ./dist
npm run preview     # serve ./dist su :4173 per verifica
```
