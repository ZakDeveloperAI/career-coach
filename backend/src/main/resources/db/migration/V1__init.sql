-- =========================================================================
-- Career Coach - schema iniziale
-- 12 tabelle, 1 gerarchia di ereditarieta' (documents -> resumes / cover_letters)
-- =========================================================================

-- USERS ----------------------------------------------------------------------
CREATE TABLE users (
    id                  BIGSERIAL PRIMARY KEY,
    email               VARCHAR(255) NOT NULL UNIQUE,
    password_hash       VARCHAR(255) NOT NULL,
    name                VARCHAR(100) NOT NULL,
    surname             VARCHAR(100) NOT NULL,
    profile_image_url   VARCHAR(500),
    role                VARCHAR(20)  NOT NULL
        CHECK (role IN ('CANDIDATE','RECRUITER','ADMIN')),
    registration_date   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    active              BOOLEAN      NOT NULL DEFAULT TRUE
);
CREATE INDEX idx_users_role ON users(role);

-- COMPANIES ------------------------------------------------------------------
CREATE TABLE companies (
    id           BIGSERIAL PRIMARY KEY,
    name         VARCHAR(150) NOT NULL UNIQUE,
    description  TEXT,
    website      VARCHAR(255),
    logo_url     VARCHAR(500),
    location     VARCHAR(200),
    owner_id     BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_companies_owner ON companies(owner_id);

-- CATEGORIES -----------------------------------------------------------------
CREATE TABLE categories (
    id    BIGSERIAL PRIMARY KEY,
    name  VARCHAR(100) NOT NULL,
    slug  VARCHAR(100) NOT NULL UNIQUE
);

-- SKILLS ---------------------------------------------------------------------
CREATE TABLE skills (
    id    BIGSERIAL PRIMARY KEY,
    name  VARCHAR(80) NOT NULL UNIQUE
);

-- JOBS -----------------------------------------------------------------------
CREATE TABLE jobs (
    id               BIGSERIAL PRIMARY KEY,
    title            VARCHAR(200) NOT NULL,
    description      TEXT         NOT NULL,
    salary_min       INTEGER,
    salary_max       INTEGER,
    currency         VARCHAR(3)   NOT NULL DEFAULT 'EUR',
    contract_type    VARCHAR(20)  NOT NULL
        CHECK (contract_type IN ('FULL_TIME','PART_TIME','CONTRACT','INTERNSHIP','FREELANCE')),
    remote           BOOLEAN      NOT NULL DEFAULT FALSE,
    location         VARCHAR(200),
    company_id       BIGINT       NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    category_id      BIGINT                REFERENCES categories(id) ON DELETE SET NULL,
    posted_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status           VARCHAR(20)  NOT NULL DEFAULT 'OPEN'
        CHECK (status IN ('OPEN','CLOSED','DRAFT')),
    external_source  VARCHAR(30),
    external_id      VARCHAR(150),

    CONSTRAINT chk_salary_range CHECK (
        salary_min IS NULL OR salary_max IS NULL OR salary_max >= salary_min
    )
);
CREATE INDEX idx_jobs_company   ON jobs(company_id);
CREATE INDEX idx_jobs_category  ON jobs(category_id);
CREATE INDEX idx_jobs_status    ON jobs(status);
CREATE INDEX idx_jobs_posted    ON jobs(posted_at DESC);
-- evita di importare due volte la stessa offerta esterna
CREATE UNIQUE INDEX uq_jobs_external
    ON jobs(external_source, external_id)
    WHERE external_source IS NOT NULL;

-- JOB_SKILLS (many-to-many) --------------------------------------------------
CREATE TABLE job_skills (
    job_id    BIGINT NOT NULL REFERENCES jobs(id)   ON DELETE CASCADE,
    skill_id  BIGINT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    PRIMARY KEY (job_id, skill_id)
);

-- DOCUMENTS (parent dell'inheritance) ----------------------------------------
CREATE TABLE documents (
    id          BIGSERIAL PRIMARY KEY,
    owner_id    BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(200) NOT NULL,
    doc_type    VARCHAR(20)  NOT NULL
        CHECK (doc_type IN ('RESUME','COVER_LETTER')),
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_documents_owner ON documents(owner_id);
CREATE INDEX idx_documents_type  ON documents(doc_type);

-- RESUMES (child) ------------------------------------------------------------
CREATE TABLE resumes (
    id               BIGINT PRIMARY KEY REFERENCES documents(id) ON DELETE CASCADE,
    summary          TEXT,
    skills_text      TEXT,
    experience_text  TEXT,
    education_text   TEXT
);

-- COVER_LETTERS (child) ------------------------------------------------------
CREATE TABLE cover_letters (
    id               BIGINT PRIMARY KEY REFERENCES documents(id) ON DELETE CASCADE,
    body             TEXT NOT NULL,
    tone             VARCHAR(20)
        CHECK (tone IN ('FORMAL','FRIENDLY','ENTHUSIASTIC','CONCISE')),
    target_job_id    BIGINT REFERENCES jobs(id) ON DELETE SET NULL,
    generated_by_ai  BOOLEAN NOT NULL DEFAULT FALSE
);

-- APPLICATIONS ---------------------------------------------------------------
CREATE TABLE applications (
    id               BIGSERIAL PRIMARY KEY,
    candidate_id     BIGINT       NOT NULL REFERENCES users(id)         ON DELETE CASCADE,
    job_id           BIGINT       NOT NULL REFERENCES jobs(id)          ON DELETE CASCADE,
    resume_id        BIGINT                REFERENCES resumes(id)       ON DELETE SET NULL,
    cover_letter_id  BIGINT                REFERENCES cover_letters(id) ON DELETE SET NULL,
    status           VARCHAR(20)  NOT NULL DEFAULT 'SUBMITTED'
        CHECK (status IN ('SUBMITTED','REVIEWED','REJECTED','ACCEPTED')),
    applied_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    recruiter_notes  TEXT,
    UNIQUE (candidate_id, job_id)
);
CREATE INDEX idx_applications_candidate ON applications(candidate_id);
CREATE INDEX idx_applications_job       ON applications(job_id);
CREATE INDEX idx_applications_status    ON applications(status);

-- AI_REVIEWS -----------------------------------------------------------------
CREATE TABLE ai_reviews (
    id            BIGSERIAL PRIMARY KEY,
    candidate_id  BIGINT       NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    job_id        BIGINT       NOT NULL REFERENCES jobs(id)     ON DELETE CASCADE,
    resume_id     BIGINT       NOT NULL REFERENCES resumes(id)  ON DELETE CASCADE,
    score         INTEGER      NOT NULL CHECK (score BETWEEN 0 AND 100),
    strengths     TEXT,
    gaps          TEXT,
    suggestions   TEXT,
    model_used    VARCHAR(80)  NOT NULL,
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_ai_reviews_candidate ON ai_reviews(candidate_id);
CREATE INDEX idx_ai_reviews_job       ON ai_reviews(job_id);

-- SAVED_JOBS -----------------------------------------------------------------
CREATE TABLE saved_jobs (
    candidate_id  BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id        BIGINT NOT NULL REFERENCES jobs(id)  ON DELETE CASCADE,
    saved_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (candidate_id, job_id)
);
