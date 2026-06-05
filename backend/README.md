# Career Coach — Backend

Backend Spring Boot + PostgreSQL per una piattaforma di job board con review CV via AI (Gemini). 3 ruoli utente, JWT auth, import offerte da fonti esterne (Adzuna + RemoteOK).

## Stack

- **Java 17**, **Spring Boot 4.0.x**, Maven
- **PostgreSQL 16** in Docker
- **Spring Data JPA** + **Flyway** (migrations)
- **Spring Security** + **JWT** (jjwt 0.12)
- **Validation** (Jakarta Bean Validation)
- **Lombok**

## Setup veloce

### 1. Prerequisiti
- JDK 17, Maven 3.9+
- Docker Desktop

### 2. Configurazione
Copia `.env.example` in `.env` e riempi i valori:

```env
GEMINI_API_KEY=la-tua-chiave        # https://aistudio.google.com/app/apikey
GEMINI_MODEL=gemini-2.5-flash
JWT_SECRET=segreto-256-bit
JWT_EXPIRATION_MINUTES=120

ADZUNA_APP_ID=                       # https://developer.adzuna.com
ADZUNA_APP_KEY=
ADZUNA_COUNTRY=it
REMOTEOK_ENABLED=true
```

### 3. Avvio
```powershell
docker compose up -d        # avvia Postgres
mvn spring-boot:run         # avvia backend su :8080
```

Al primo avvio:
- Flyway crea le 12 tabelle (V1) + seed di categorie e skill (V2)
- Un utente admin di default viene creato: `admin@career.coach` / `admin123` (cambia in produzione)

### 4. Postman
Importa `postman/career-coach.postman_collection.json`. Esegui i request della cartella **Auth** per primi: i token vengono salvati automaticamente nelle variabili. Tutte le altre chiamate usano i token corretti.

## Architettura

```
src/main/java/com/zak/careercoach/
├── CareerCoachApplication.java
├── config/        AdminBootstrap (admin di default al primo avvio)
├── entity/        12 entita' (User, Company, Job, ...) + 1 inheritance JOINED
│   └── enums/     Role, ContractType, JobStatus, ApplicationStatus, Tone
├── repository/    11 Spring Data JPA repository
├── dto/           DTO request/response (record)
│   └── auth/      RegisterRequest, LoginRequest, AuthResponse
├── security/      JwtService, JwtAuthFilter, SecurityConfig, CurrentUser
├── service/       AuthService, JobService, CompanyService, AiReviewService,
│                  CoverLetterService, ApplicationService, ResumeService,
│                  JobImportService, JobSpecifications
├── external/      GeminiClient, AdzunaClient, RemoteOkClient
├── controller/    AuthController, UserController, CompanyController,
│                  JobController, ResumeController, CoverLetterController,
│                  ApplicationController, SavedJobController, AiReviewController,
│                  CategoryController, SkillController, StatsController,
│                  AdminController
└── exception/     AppException, ErrorResponse, GlobalExceptionHandler
```

## Modello dati

```
                    +-----------+
                    |   User    |
                    +-----+-----+
                          |
        +-----------------+-----------------+
        |                 |                 |
    +---v-----+   +-------v--------+   +----v-----+
    | Company |   |   Application  |   | Document |  (astratta, JOINED)
    +---+-----+   +-------+--------+   +----+-----+
        |                 |                 |
        |                 |          +------+------+
    +---v-+         +-----v-+        |             |
    | Job +<--------+ Job(M)|     +--v---+   +-----v------+
    +-+-+-+         +-------+     |Resume|   |CoverLetter |
      | |                          +------+   +------------+
      | +--ManyToMany-> Skill
      +--ManyToOne---> Category
```

**Inheritance JOINED** su `documents`:
- tabella `documents` con colonna `doc_type` (discriminator)
- tabella `resumes` (chiave FK a documents) con campi specifici del CV
- tabella `cover_letters` (chiave FK a documents) con tono + target job + flag AI

## Ruoli e permessi

| Risorsa | CANDIDATE | RECRUITER | ADMIN |
|---|---|---|---|
| jobs (read) | ✓ | ✓ | ✓ |
| jobs (CRUD) | — | sulle proprie company | tutte |
| companies (read) | ✓ | ✓ | ✓ |
| companies (CRUD) | — | proprie | tutte |
| applications (apply) | ✓ | — | — |
| applications (read recruiter view) | — | sulle proprie company | tutte |
| resumes / cover-letters | proprie CRUD | — | read |
| AI review CV | ✓ | — | — |
| imports da Adzuna/RemoteOK | — | — | ✓ |
| toggle utente attivo | — | — | ✓ |

## API esterne integrate

| Servizio | Uso | Endpoint che la consuma |
|---|---|---|
| **Gemini** (Google) | Review CV vs offerta + generazione cover letter | `POST /ai-reviews`, `POST /cover-letters/generate` |
| **Adzuna** | Import offerte reali nel DB | `POST /admin/imports/adzuna` |
| **RemoteOK** | Import offerte remote nel DB | `POST /admin/imports/remoteok` |

## Query avanzate

`JobSpecifications` espone predicati combinabili: title-like, location-like, remote, min-salary, contract-types-in, category, has-any-skill. Usati da `JobService.search()` per il filtering dinamico.

Aggregazioni JPQL in `StatsController`:
- `/stats/jobs-by-category` — `COUNT(j) GROUP BY category`
- `/stats/jobs-by-contract` — `COUNT(j) GROUP BY contractType`
- `/stats/avg-salary-by-category` — `AVG(salary)` con `COALESCE`
- `/stats/top-companies` — `COUNT DISTINCT j, COUNT DISTINCT a` su JOIN job-application

## Error handling

`GlobalExceptionHandler` mappa:

| Eccezione | Status | Esempio |
|---|---|---|
| `AppException` (custom) | 400/401/403/404/409 | "CV non trovato" |
| `MethodArgumentNotValidException` | 400 | con `details[]` per campo |
| `BadCredentialsException` | 401 | "Email o password non corretti" |
| `AccessDeniedException` | 403 | "Non hai i permessi" |
| `DataIntegrityViolationException` | 409 | duplicati/vincoli |
| `Exception` (generico) | 500 | messaggio safe, stack solo nel log |

## Sicurezza

- Password hashate con **BCrypt**
- JWT firmati HMAC-SHA256, scadenza configurabile
- Tutti i secrets via `.env` (gitignored), `.env.example` come template
- CORS aperto a `http://localhost:5173` / `:3000` (frontend dev)
- `csrf().disable()` perche' API stateless
- Sessione `STATELESS`
- `@PreAuthorize` su endpoint che richiedono ruoli specifici
- Validation su tutti i DTO request (`@Valid`)
- Nessuno stack trace verso l'utente

## Endpoint principali

| Metodo | Path | Auth |
|---|---|---|
| POST | /auth/register | publico |
| POST | /auth/login | publico |
| GET | /users/me | qualunque |
| PATCH | /users/me | qualunque |
| GET | /jobs (filtri + paginazione) | publico |
| GET | /jobs/{id} | publico |
| POST/PATCH/DELETE | /jobs/* | RECRUITER, ADMIN |
| GET/POST/PATCH/DELETE | /companies/* | publico read, RECRUITER+ write |
| GET/POST/PATCH/DELETE | /resumes/* | CANDIDATE |
| GET/POST/PATCH/DELETE | /cover-letters/* | CANDIDATE |
| POST | /cover-letters/generate | CANDIDATE (AI) |
| POST | /ai-reviews | CANDIDATE (AI) |
| GET | /ai-reviews/mine | CANDIDATE |
| POST | /applications | CANDIDATE |
| GET | /applications/mine | CANDIDATE |
| GET | /applications/{companies\|jobs}/{id} | RECRUITER, ADMIN |
| PATCH | /applications/{id}/status | RECRUITER, ADMIN |
| POST/DELETE | /saved-jobs/{jobId} | CANDIDATE |
| POST | /admin/imports/adzuna | ADMIN |
| POST | /admin/imports/remoteok | ADMIN |
| GET | /stats/* | publico |

## Limiti noti

- Profile image upload: l'utente passa una URL gia' hostata altrove (no multipart upload nel backend per ora)
- Import Adzuna richiede registrazione su developer.adzuna.com (free tier 1000 chiamate/mese)
- RemoteOK rate limit aggressivo: 1 import ogni qualche minuto
- L'admin di default ha password hardcoded nell'env: cambiare in produzione
