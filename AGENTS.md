# AGENTS.md — InsureChain Coding Instructions

## Mandatory Pre-Edit Protocol
1. Read PROJECT_CONTEXT.md and PROGRESS.md before editing any file.
2. Inspect the actual source file before modifying it.
3. Preserve all working features when making changes.
4. Do not remove existing comments unrelated to your edit.

## Architecture Rules
- Frontend: React + TypeScript + Vite, deployed to Vercel.
- Backend: Java 21 + Spring Boot 3.3.4, deployed to Render.
- Database: Supabase PostgreSQL (project `itbfacafyicjznksidyh`).
- Auth: JWT-based, issued by Spring Boot backend.
- AI: Advisory only — never overrides deterministic eligibility or workflow state.

## Code Quality
- Keep TypeScript strict. No `any` unless unavoidable.
- Use existing shared components before creating new ones.
- Enforce permissions on the backend, not just the frontend.
- Every workflow transition must be audited.
- Secrets must never appear in Git, frontend bundles, or documentation.

## Testing
- Run `mvn test` for backend tests before claiming completion.
- Run `npm run build` for frontend type-checking before claiming completion.
- Test both happy paths and error/edge cases.

## Documentation
- Update PROJECT_CONTEXT.md when architecture, APIs, or data models change.
- Update PROGRESS.md after completing or verifying each feature.
- If code and docs disagree, fix the docs to match the code.
