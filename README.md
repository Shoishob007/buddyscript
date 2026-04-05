# BuddyScript Implementation Summary

## Database migration completed

The application was migrated from SQLite/Prisma runtime usage to direct PostgreSQL access using the `pg` driver.

Implemented changes:

1. Runtime Prisma access was removed from auth, feed, posts, comments, replies, and likes flows.
2. A shared PostgreSQL connection pool was added.
3. A plain SQL schema file was added for direct database bootstrap.
4. A database init script was added to create the BuddyScript database and apply schema.
5. Local environment database URLs were aligned to PostgreSQL usage.

## Upload handling improved

Upload writes were moved out of the repository path so generated files no longer appear in the codebase.

Implemented changes:

1. Post image files are now stored in runtime upload directory (`UPLOAD_DIR` env or OS temp directory fallback).
2. Images are served through API endpoint: `/api/upload/[filename]`.
3. Repository ignore rules were updated for upload-related paths.

## Security hardening completed

JWT configuration was hardened to prevent insecure production behavior.

Implemented changes:

1. `JWT_SECRET` is now mandatory in production.
2. Development fallback secret remains dev-only.

## Current stack

1. Next.js app router
2. Direct PostgreSQL access via `pg`
3. SQL schema bootstrap script
4. JWT-based auth
