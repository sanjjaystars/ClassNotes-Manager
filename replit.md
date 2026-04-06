# ClassNotes Hub

## Overview

A full-stack college subject-wise notes management web app with two roles: Admin (upload/manage notes and subjects) and Student (browse/download notes).

pnpm workspace monorepo using TypeScript.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Auth**: Clerk (`@clerk/react` + `@clerk/express`)
- **File Storage**: GCS object storage (presigned URLs for direct upload)
- **Frontend**: React + Vite + TailwindCSS (deep indigo/slate theme)

## Architecture

### Artifacts
- `artifacts/api-server` — Express API server, served at `/api`
- `artifacts/classnotes-hub` — React + Vite frontend, served at `/`

### Libraries
- `lib/db` — Drizzle ORM schema (subjects, notes, admins tables)
- `lib/api-client-react` — Generated React Query hooks from OpenAPI spec
- `lib/api-spec` — OpenAPI 3.0 spec for all endpoints

### Frontend Pages
- `/` — Public landing page
- `/sign-in`, `/sign-up` — Clerk auth pages
- `/admin/login` — Admin sign-in (Clerk)
- `/admin/setup` — Claim admin role with secret key (default: `classnotes-admin-2024`)
- `/admin/dashboard` — Stats, recent notes, subject breakdown
- `/admin/subjects` — CRUD for subjects (name, description, color)
- `/admin/notes/upload` — Upload notes (presigned URL → GCS → DB record)
- `/admin/notes/:id/edit` — Edit or delete note
- `/student/dashboard` — Browse subjects, recent notes
- `/student/subjects/:id` — View notes in a subject with preview/download
- `/student/notes` — All notes with subject filter and search

### API Routes
- `GET/POST /api/subjects` — List/create subjects
- `GET/PUT/DELETE /api/subjects/:id` — Subject CRUD
- `GET /api/subjects/:id/notes` — Notes for a subject
- `GET/POST /api/notes` — List/create notes
- `GET/PUT/DELETE /api/notes/:id` — Note CRUD
- `GET /api/dashboard/stats` — Dashboard statistics
- `GET /api/dashboard/recent` — Recent notes
- `GET /api/admin/verify` — Verify admin status
- `POST /api/admin/setup` — Claim admin role
- `POST /api/storage/upload-url` — Request presigned upload URL
- `GET /api/storage/objects/*` — Serve files from GCS

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Key Design Decisions

- File upload: Client requests presigned URL from API, uploads directly to GCS, then POSTs note metadata to API
- File serving: `/api/storage/objects/*` proxies from GCS
- Admin auth: User signs in with Clerk, then claims admin role with secret key stored in DB
- `ADMIN_SECRET_KEY` env var (default: `classnotes-admin-2024`)

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
