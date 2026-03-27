.PHONY: run stop build install dev

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
