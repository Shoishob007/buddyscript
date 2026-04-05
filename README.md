# BuddyScript

BuddyScript is a small social feed application built with Next.js and PostgreSQL. Users can register, log in, create posts (with optional image uploads), like content, and engage through comments and replies.

## Project Overview

Core functionality:

1. User authentication (register, login, logout)
2. Feed with posts and media support
3. Nested engagement model (likes, comments, replies)
4. Server-side API routes for all core actions
5. PostgreSQL-backed persistence with SQL bootstrap

## Tech Stack

1. Next.js 16 (App Router)
2. React 19
3. TypeScript
4. PostgreSQL
5. `pg` for database access
6. JWT auth with `jose`
7. `bcryptjs` for password hashing
8. ESLint for linting

## Tradeoffs and Design Decisions

1. Direct SQL (`pg`) over ORM
   - Pros: Full SQL control, fewer runtime abstractions, predictable queries.
   - Tradeoff: More manual query and schema management.
2. JWT cookie sessions
   - Pros: Simple stateless session handling and easy API integration.
   - Tradeoff: Token invalidation strategy is simpler than a full session store.
3. File uploads served through API route
   - Pros: Keeps app-level control over file access and response behavior.
   - Tradeoff: More backend handling versus delegating to object storage/CDN.
4. SQL bootstrap script for local setup
   - Pros: Fast and explicit local database initialization.
   - Tradeoff: No migration history tooling by default.

## Prerequisites

1. Node.js 20+
2. npm 10+
3. PostgreSQL 14+ running locally

## Environment Setup

1. Copy environment template:

```bash
cp .env.example .env
```

2. Update values in `.env` for your local PostgreSQL instance.

Minimum required variables:

- `DB_USER`
- `DB_PASSWORD`
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `JWT_SECRET`

## Run the Application (Step by Step)

1. Install dependencies:

```bash
npm install
```

2. Initialize database and apply schema:

```bash
npm run db:init
```

3. Start development server:

```bash
npm run dev
```

4. Open the app:

```text
http://localhost:3000
```

## Helpful Commands

Run linter:

```bash
npm run lint
```

Build production bundle:

```bash
npm run build
```

Start production server:

```bash
npm run start
```
