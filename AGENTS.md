# Repository Guidelines

## Project Structure & Module Organization
The repository splits functionality into `frontend/` (React + Vite + TypeScript client), `backend/` (Express + Prisma API), `database/` (SQL seed data), and `tests/` (integration scripts). Backend logic lives under `backend/src/` with layered folders: `controllers/`, `routes/`, `services/`, and `utils/`. Prisma schema and migrations are in `backend/prisma/`, while `.env.example` documents runtime variables. Frontend pages reside in `frontend/src/pages/`, shared UI lives in `frontend/src/components/`, stateful logic in `frontend/src/store/`, and API hooks in `frontend/src/services/`. Static assets are served from `frontend/public/`.

## Build, Test, and Development Commands
- `docker-compose up -d postgres redis`: launch required data services.
- `cd backend && npm run db:migrate && npm run db:seed`: apply Prisma migrations and seed data.
- `cd backend && npm install && npm run dev`: start the Express API with nodemon on port 3001 (`npm start` for production).
- `cd frontend && npm install && npm run dev`: run the Vite dev server on port 3000; use `npm run build` then `npm run preview` to validate production bundles.
- `cd tests && npm install && ./run_tests_fixed.sh`: execute API regression coverage; UI flows run with `cd frontend && npm run test:e2e -- --reporter=dot`.

## Coding Style & Naming Conventions
Use 2-space indentation, semicolons, and single quotes across JavaScript/TypeScript. Favor `camelCase` for variables/functions and `PascalCase` for React components. Run `npm run lint`, `npm run lint:fix`, and `npm run format` in `backend/`; the frontend enforces `npm run lint` and `npm run type-check`. Prisma migrations should include timestamp prefixes and mirrored SQL updates in `database/`.

## Testing Guidelines
Prioritize unit tests near their sources (e.g., `backend/src/services/__tests__/*.test.js`). Target ≥80% coverage for mood scoring, recommendation logic, and authentication. Integration and black-box scripts live under `tests/`. Use a dedicated test database via `DATABASE_URL=postgres://.../mood_test`, and clean up with `npm run db:reset`. Include Playwright checks with `npm run test:e2e -- --project=chromium` when UI changes occur.

## Commit & Pull Request Guidelines
Follow Conventional Commits such as `feat:`, `fix:`, or `chore:` with subjects under 70 characters. PRs must summarize changes, list test outputs (e.g., backend unit tests, frontend e2e), link related issues, and attach UI evidence when relevant. Update supporting docs like `DEPLOYMENT.md` any time configuration shifts. Ensure GitHub Actions pass before requesting review and secure at least one maintainer approval.

## Security & Configuration Tips
Never commit secrets or `.env*`; rely on `.env.example` and local overrides. Replace default Docker credentials for non-local environments and enable TLS during deployment. Add new log or backup paths to `.gitignore`, and prefer Redis key prefixes or Prisma middleware for centralized alerting.
