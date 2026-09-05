# Phase 1: Foundation & Infrastructure - Detailed Implementation Plan

## Project Structure (Monorepo)
```
conmeet.moe/
├── frontend/                 # Next.js + TypeScript + Tailwind
│   ├── src/
│   │   ├── app/              # App Router pages
│   │   ├── components/       # React components
│   │   ├── lib/              # Utilities, API clients
│   │   └── types/            # TypeScript types
│   ├── package.json
│   └── tailwind.config.ts
├── backend/                  # FastAPI + SQLAlchemy + Alembic
│   ├── app/
│   │   ├── api/              # API routes
│   │   ├── core/             # Config, security, database
│   │   ├── models/           # SQLAlchemy models
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── services/         # Business logic
│   │   └── main.py           # FastAPI app entry
│   ├── alembic/              # Migrations
│   ├── pyproject.toml
│   └── .env.example
├── docker-compose.yml        # Local dev (PostgreSQL, Redis)
├── .github/workflows/        # CI/CD
├── Makefile                  # Dev commands
└── README.md
```

---

## Step 1: Monorepo Setup & Tooling
- [x] Create directory structure: `/frontend`, `/backend`, `/docker-compose.yml`, `/.github/workflows`
- [x] Add root `package.json` with workspaces for shared tooling (lint, format)
- [x] Configure ESLint + Prettier + Husky at root level
- [x] Add `.editorconfig`, `.nvmrc` (Node 20+), `.python-version` (3.11+)

---

## Step 2: Frontend Initialization (Next.js 16 App Router)
- [x] Run: `npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm`
  - Installed Next.js 16.3.4 (App Router), React 19, TypeScript 5, Tailwind CSS v4
- [x] Install dependencies:
  - [x] Core: `next`, `react`, `react-dom`, `typescript`
  - [ ] Auth: `next-auth@beta` (v5) or custom JWT + httpOnly cookies — deferred to Step 6
  - [x] UI: `class-variance-authority`, `clsx`, `tailwind-merge`
  - [ ] UI: `@radix-ui/*` primitives — add with components as needed
  - [x] Forms: `react-hook-form`, `@hookform/resolvers`, `zod`
  - [x] API: `@tanstack/react-query`, `ky`
  - [x] Icons: `lucide-react`
  - [x] Utils: `date-fns`, `zustand` (if needed)
- [x] Configure Tailwind CSS v4 (CSS-first config in `globals.css`)
- [x] Set up path aliases in `tsconfig.json` (`@/*`)
- [x] Create base layout: React Query provider, global styles, metadata (`src/components/providers.tsx`)
- [ ] Add Auth provider — deferred to Step 6
- [x] Add `proxy.ts` for route protection (Next.js 16 renamed `middleware.ts` → `proxy.ts`)

---

## Step 3: Backend Initialization (FastAPI)
- [x] Choose package manager: `uv` (recommended) or `poetry`
  - Installed `uv 0.12.9` via Homebrew
- [x] Run: `uv init backend` (or `poetry new backend`)
- [x] Install core dependencies:
  - [x] `fastapi`, `uvicorn[standard]`, `python-multipart`
  - [x] `SQLAlchemy[asyncio]`, `alembic`, `asyncpg`
  - [x] `pydantic[email]`, `pydantic-settings`, `python-jose[cryptography]`, `passlib[bcrypt]` (+ pinned `bcrypt<4.1`, `types-python-jose`, `types-passlib`)
  - [x] `python-dotenv`, `httpx`, `python-multipart`
  - [x] `httpx` for Discord/Google OAuth
  - [x] `google-auth`, `google-auth-oauthlib` for Google OAuth token verification
  - [x] `boto3`/`aiobotocore` for R2 (S3-compatible)
  - [x] Dev: `ruff`, `pytest`, `pytest-asyncio`, `mypy` (not structlog/sentry - optional)
- [x] Create directory structure per plan (`app/api/v1/routes`, `app/core`, `app/models`, `app/schemas`, `app/services`, `tests`)
- [x] Configure `pyproject.toml` with `[tool.uv]` (`package = false`), `[tool.ruff]`, `[tool.mypy]`, `[tool.pytest.ini_options]`
- [x] Create `app/core/config.py` using `pydantic-settings` (BaseSettings)
- [x] Create `app/core/database.py` with async SQLAlchemy engine + sessionmaker
- [x] Create `app/core/security.py` (JWT handlers, password hashing)
- [x] Create `app/main.py` with FastAPI app, CORS, lifespan events

---

## Step 4: Database Setup (PostgreSQL + SQLAlchemy + Alembic)
- [x] Create `docker-compose.yml` with:
  - [x] `postgres:16` (with `POSTGRES_DB`, `USER`, `PASSWORD`)
  - [x] `pgadmin` (optional)
  - [x] `redis` (for future caching/sessions)
- [x] Run: `docker compose up -d`
  - Note: postgres mapped to host port `5433` (5432 taken by native PostgreSQL 17); `DATABASE_URL` uses 5433
- [x] Initialize Alembic: `alembic init alembic`
- [x] Configure `alembic.ini` and `env.py` for async SQLAlchemy
  - Added explicit PG enum create/drop (`create_type=False`) so downgrade is reversible
- [x] Create base model (`app/models/base.py`):
  - [x] `Base = DeclarativeBase` (with naming convention)
  - [x] `TimestampMixin` (created_at, updated_at)
  - [x] UUID primary keys (uuid4 via `UUIDPrimaryKeyMixin`)
- [x] Create User model (`app/models/user.py`):
  - [x] id, discord_id (unique), username, avatar_url, email
  - [x] access_token_encrypted, refresh_token_encrypted, token_expires_at
  - [x] role (user/admin), is_active, created_at
- [x] Create Convention model (basic, for Phase 2)
- [x] Generate first migration: `alembic revision --autogenerate -m "init"` (`f48464fbc0c8`)
- [x] Run migration: `alembic upgrade head` (verified full downgrade/upgrade cycle)

---

## Step 5: OAuth Implementation (Discord + Google)
- [ ] **Discord OAuth**:
  - [ ] Register Discord Application at https://discord.com/developers/applications
    - Redirect URI: `http://localhost:8000/api/v1/auth/discord/callback`
    - Scopes: `identify`, `email`
  - [ ] Add to `.env`: `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `DISCORD_REDIRECT_URI`
- [ ] **Google OAuth**:
  - [ ] Create Google Cloud Project at https://console.cloud.google.com/
  - [ ] Enable Google OAuth2 API, configure OAuth consent screen
  - [ ] Create OAuth 2.0 Client ID (Web application)
    - Redirect URI: `http://localhost:8000/api/v1/auth/google/callback`
    - Scopes: `openid`, `email`, `profile`
  - [ ] Add to `.env`: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`
- [ ] Create `app/api/v1/auth.py` routes:
  - `GET /auth/discord` → redirect to Discord OAuth URL
  - `GET /auth/discord/callback` → exchange code for tokens, fetch user, create/update user, issue JWT
  - `GET /auth/google` → redirect to Google OAuth URL
  - `GET /auth/google/callback` → exchange code for tokens, fetch user, create/update user, issue JWT
  - `POST /auth/refresh` → refresh access token using refresh token
  - `POST /auth/logout` → invalidate tokens
  - `GET /auth/me` → return current user info
- [ ] Implement OAuth services:
  - `app/services/discord.py`:
    - `exchange_code_for_tokens(code)`
    - `fetch_user_info(access_token)`
    - `refresh_access_token(refresh_token)`
  - `app/services/google.py`:
    - `exchange_code_for_tokens(code)`
    - `fetch_user_info(access_token)`
    - `refresh_access_token(refresh_token)`
  - `app/services/oauth.py` (shared):
    - `get_or_create_user(provider, provider_user_info)` - unified user creation/linking
- [ ] Create JWT utility (`app/core/security.py`):
  - `create_access_token(data, expires_delta)`
  - `create_refresh_token(data)`
  - `decode_token(token)` → payload
- [ ] Add auth dependency (`app/api/deps.py`):
  - `get_current_user` (from JWT in Authorization header or httpOnly cookie)
  - `get_current_active_user`
- [ ] Update User model (`app/models/user.py`) to support multiple OAuth providers:
  - Add `google_id` (unique, nullable), `google_access_token_encrypted`, `google_refresh_token_encrypted`
  - Add `provider` enum field (discord/google) or support multiple linked accounts

---

## Step 6: Auth Frontend Integration
- [ ] Create auth context/provider (`src/lib/auth-provider.tsx`):
  - User state, loading, login/logout functions
  - Token refresh logic
- [ ] Create API client (`src/lib/api.ts`):
  - Axios/ky instance with baseURL
  - Interceptor for 401 → refresh token → retry
- [ ] Build Login page (`src/app/login/page.tsx`):
  - "Login with Discord" button → redirects to backend `/auth/discord`
  - "Login with Google" button → redirects to backend `/auth/google`
- [ ] Build Callback page (`src/app/auth/callback/page.tsx`):
  - Handle redirects from both Discord and Google OAuth
  - Receive redirect from backend with tokens in httpOnly cookies or URL
  - Redirect to dashboard/landing
- [ ] Add logout action (server action or API route)
- [ ] Create `ProtectedRoute` wrapper component
- [ ] Add user avatar/menu in header (conditional render)
- [ ] Add account linking UI (settings page) for users to link multiple OAuth providers

---

## Step 7: Cloudflare R2 Setup
- [ ] Create Cloudflare account, enable R2
- [ ] Create buckets:
  - `conmeet-media` (public: images, avatars)
  - `conmeet-uploads` (private: temp uploads)
- [ ] Configure CORS on buckets for frontend uploads
- [ ] Create API Token with R2 permissions (Object Read/Write)
- [ ] Add to backend `.env`:
  - `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`
  - `R2_BUCKET_PUBLIC`, `R2_BUCKET_PRIVATE`, `R2_PUBLIC_URL`
- [ ] Create `app/services/storage.py`:
  - `generate_presigned_upload_url(key, content_type, bucket)`
  - `generate_presigned_download_url(key, bucket)`
  - `delete_object(key, bucket)`
  - `upload_fileobj(fileobj, key, bucket)`
- [ ] Create API route: `POST /api/v1/upload/presign` → returns `{ uploadUrl, key, publicUrl }`

---

## Step 8: Shared Types & API Contracts
- [ ] Backend: `fastapi.openapi()` → generate `openapi.json`
- [ ] Frontend: Use `openapi-typescript` or `orval` to generate TypeScript types
- [ ] Or create manual shared types in `/packages/shared-types` (if using turborepo)

---

## Step 9: CI/CD Foundation
- [ ] Create `.github/workflows/ci.yml`:
  - Lint (frontend + backend)
  - Typecheck (`tsc`, `pyright`/`mypy`)
  - Test (`vitest`, `pytest`)
  - Build (`next build`, `fastapi check`)
- [ ] Add `dependabot.yml` for security updates

---

## Step 10: Local Dev Experience
- [ ] Create `Makefile` or `justfile` with commands:
  - `make dev` (starts frontend + backend + db)
  - `make db-up`, `make db-down`, `make db-migrate`
  - `make test`, `make lint`
- [ ] Add `.env.example` files for frontend and backend
- [ ] Document setup in `README.md`

---

## Execution Order (Dependencies)

```
Week 1:
  Step 1 → Step 2 → Step 3 (parallel) → Step 4

Week 2:
  Step 5 → Step 6 → Step 7 → Step 8 → Step 9 → Step 10
```

---

## Decisions Needed Before Starting

1. **Package Manager**: `uv` (fast, modern) or `poetry` (mature) for Python?
2. **Auth Approach**: `next-auth v5` (beta, RSC friendly) or custom JWT with httpOnly cookies?
3. **R2 Access**: Public bucket for avatars/images, or all private with presigned URLs?
4. **Deployment Target**: Vercel (frontend) + Railway/Render/Fly.io (backend)?
5. **Monorepo Tool**: Turborepo, Nx, or just npm workspaces + manual scripts?