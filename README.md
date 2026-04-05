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
8. Cloudinary for media storage
9. ESLint for linting

## Tradeoffs and Design Decisions

1. Direct SQL (`pg`) over ORM
   - Pros: Full SQL control, fewer runtime abstractions, predictable queries.
   - Tradeoff: More manual query and schema management.
2. JWT cookie sessions
   - Pros: Simple stateless session handling and easy API integration.
   - Tradeoff: Token invalidation strategy is simpler than a full session store.
3. Cloudinary for uploaded media
   - Pros: Durable hosted storage, simple setup, and deployment-safe media handling.
   - Tradeoff: Adds a third-party dependency and environment configuration.
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
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Optional:

- `CLOUDINARY_UPLOAD_FOLDER`

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

## Media Storage Setup

1. Create a free Cloudinary account.
2. From the Cloudinary dashboard, copy your cloud name, API key, and API secret.
3. Add those values to your `.env` file.
4. Optionally set `CLOUDINARY_UPLOAD_FOLDER` to organize uploads under a custom folder.

Post images are uploaded to Cloudinary, so media is not stored on the local server filesystem.

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

## Deployment

This project should be deployed as a full-stack Next.js application, not as a frontend-only static site.

1. Deploy the app to Vercel.
2. Use a managed PostgreSQL provider such as Neon.
3. Configure these environment variables in Vercel:

- `DATABASE_URL` or the individual database variables
- `JWT_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_UPLOAD_FOLDER` (optional)

Because uploads are stored in Cloudinary, media remains durable across deployments and serverless executions.

## Notes

1. In production, `JWT_SECRET` must be set.
2. Image uploads require valid Cloudinary credentials.
3. Text-only posts still work without an image upload.
4. Managed media storage makes this setup compatible with Vercel and other serverless platforms.
