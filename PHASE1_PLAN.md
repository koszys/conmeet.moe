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
- [ ] Create directory structure: `/frontend`, `/backend`, `/docker-compose.yml`, `/.github/workflows`
- [ ] Add root `package.json` with workspaces for shared tooling (lint, format)
- [ ] Configure ESLint + Prettier + Husky at root level
- [ ] Add `.editorconfig`, `.nvmrc` (Node 20+), `.python-version` (3.11+)

---

## Step 2: Frontend Initialization (Next.js 14+ App Router)
- [ ] Run: `npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm`
- [ ] Install dependencies:
  - Core: `next`, `react`, `react-dom`, `typescript`
  - Auth: `next-auth@beta` (v5) or custom JWT + httpOnly cookies
  - UI: `@radix-ui/*`, `class-variance-authority`, `clsx`, `tailwind-merge`
  - Forms: `react-hook-form`, `@hookform/resolvers`, `zod`
  - API: `@tanstack/react-query`, `axios` or `ky`
  - Icons: `lucide-react`
  - Utils: `date-fns`, `zustand` (if needed)
- [ ] Configure Tailwind CSS v4 or v3 with `tailwind.config.ts`
- [ ] Set up path aliases in `tsconfig.json` (`@/*`, `@/components/*`, `@/lib/*`)
- [ ] Create base layout: providers (React Query, Auth), global styles, metadata
- [ ] Add `middleware.ts` for route protection (auth check)

---

## Step 3: Backend Initialization (FastAPI)
- [ ] Choose package manager: `uv` (recommended) or `poetry`
- [ ] Run: `uv init backend` (or `poetry new backend`)
- [ ] Install core dependencies:
  - `fastapi`, `uvicorn[standard]`, `python-multipart`
  - `SQLAlchemy[asyncio]`, `alembic`, `asyncpg`
  - `pydantic[email]`, `pydantic-settings`, `python-jose[cryptography]`, `passlib[bcrypt]`
  - `python-dotenv`, `httpx`, `python-multipart`
  - `httpx` for Discord/Google OAuth
  - `google-auth`, `google-auth-oauthlib` for Google OAuth token verification
  - `boto3`/`aiobotocore` for R2 (S3-compatible)
  - `structlog`, `sentry-sdk` (optional)
- [ ] Create directory structure per plan
- [ ] Configure `pyproject.toml` with `[tool.uv]` or `[tool.poetry]`
- [ ] Create `app/core/config.py` using `pydantic-settings` (BaseSettings)
- [ ] Create `app/core/database.py` with async SQLAlchemy engine + sessionmaker
- [ ] Create `app/core/security.py` (JWT handlers, password hashing)
- [ ] Create `app/main.py` with FastAPI app, CORS, lifespan events

---

## Step 4: Database Setup (PostgreSQL + SQLAlchemy + Alembic)
- [ ] Create `docker-compose.yml` with:
  - `postgres:16` (with `POSTGRES_DB`, `USER`, `PASSWORD`)
  - `pgadmin` (optional)
  - `redis` (for future caching/sessions)
- [ ] Run: `docker compose up -d`
- [ ] Initialize Alembic: `alembic init alembic`
- [ ] Configure `alembic.ini` and `env.py` for async SQLAlchemy
- [ ] Create base model (`app/models/base.py`):
  - `Base = DeclarativeBase`
  - `TimestampMixin` (created_at, updated_at)
  - UUID primary keys (using uuid7 or uuid4)
- [ ] Create User model (`app/models/user.py`):
  - id, discord_id (unique), username, avatar_url, email
  - access_token_encrypted, refresh_token_encrypted, token_expires_at
  - role (user/admin), is_active, created_at
- [ ] Create Convention model (basic, for Phase 2)
- [ ] Generate first migration: `alembic revision --autogenerate -m "init"`
- [ ] Run migration: `alembic upgrade head`

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