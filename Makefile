.PHONY: run stop build install dev test test-frontend test-backend test-lint test-typecheck test-format test-lft lft

# Start everything with Docker
run:
	docker compose up --build

# Stop all containers
stop:
	docker compose down

# Rebuild containers from scratch
build:
	docker compose build --no-cache

# Install deps locally (no Docker)
install:
	cd frontend && npm install
	cd backend && npm install

# Run locally without Docker (needs deps installed)
dev:
	npx concurrently -n backend,frontend -c blue,green "cd backend && npm run dev" "cd frontend && npm run dev"

# ─── Testing & QA ─────────────────────────────────────────────

# Run ALL tests (frontend + backend)
test:
	@echo "══ Frontend Unit Tests ══"
	cd frontend && npm test
	@echo ""
	@echo "══ Backend Integration Tests ══"
	cd backend && SPOTIFY_CLIENT_ID=test-id SPOTIFY_CLIENT_SECRET=test-secret npm test

# Run only frontend tests
test-frontend:
	cd frontend && npm test

# Run only backend tests
test-backend:
	cd backend && SPOTIFY_CLIENT_ID=test-id SPOTIFY_CLIENT_SECRET=test-secret npm test

# Run ESLint on frontend
test-lint:
	cd frontend && npm run lint

# Run TypeScript type-checking on both frontend and backend
test-typecheck:
	@echo "══ Frontend Type Check ══"
	cd frontend && npm run typecheck
	@echo ""
	@echo "══ Backend Type Check ══"
	cd backend && npm run typecheck

# Check code formatting with Prettier
test-format:
	npx prettier --check "frontend/src/**/*.{ts,tsx,css}" "backend/**/*.ts" --ignore-path .gitignore

# ─── Combined QA: Lint + Format + Typecheck ────────────────────
test-lft:
	@echo "══ 1/3 Lint ══"
	@$(MAKE) test-lint
	@echo ""
	@echo "══ 2/3 Format ══"
	@$(MAKE) test-format
	@echo ""
	@echo "══ 3/3 Typecheck ══"
	@$(MAKE) test-typecheck
	@echo ""
	@echo "✅ All checks passed"

# ─── Fix: Auto-fix lint & format, then typecheck ───────────────
lft:
	@echo "══ 1/3 Fixing Lint Issues ══"
	cd frontend && npx eslint . --fix
	@echo ""
	@echo "══ 2/3 Fixing Formatting ══"
	npx prettier --write "frontend/src/**/*.{ts,tsx,css}" "backend/**/*.ts" --ignore-path .gitignore
	@echo ""
	@echo "══ 3/3 Typecheck ══"
	@$(MAKE) test-typecheck
	@echo ""
	@echo "✅ Lint & format fixed, typecheck passed"
