# Colima Setup Guide for Trainify

This project has been configured to work with **Colima** (Container Linux Manager) instead of Docker Desktop due to company restrictions.

## Prerequisites

### 1. Install Colima
```bash
brew install colima
```

### 2. Install Docker Compose
```bash
brew install docker-compose
```

### 3. Configure Docker CLI
Update your `~/.docker/config.json` to enable the compose plugin:
```json
{
	"auths": {},
	"currentContext": "colima",
	"cliPluginsExtraDirs": [
		"/opt/homebrew/lib/docker/cli-plugins"
	]
}
```

## Getting Started

### 1. Start Colima
```bash
colima start
```
This starts the Colima VM and container runtime.

### 2. (Optional) Set Up Environment Variables
To ensure Docker commands use Colima's socket, you can source the provided configuration:
```bash
source .colima.env
```

This sets:
- `DOCKER_HOST` to use Colima's docker socket
- `DOCKER_CONTEXT` to use the colima context

### 3. Install Dependencies
```bash
make install
```
This installs dependencies for both frontend and backend locally.

### 4. Run the Project

#### Option A: With Colima (Containerized)
```bash
make run
```
This builds and runs both frontend and backend in Docker containers via Colima.

#### Option B: Locally (No Docker)
```bash
make dev
```
This runs both frontend and backend directly on your machine.

## Common Commands

- `make build` - Rebuild Docker images from scratch
- `make stop` - Stop all running containers
- `make dev` - Run frontend and backend locally without Docker

## Stopping Colima
When done, stop Colima with:
```bash
colima stop
```

## Troubleshooting

### Docker socket errors
1. Ensure Colima is running: `colima status`
2. Source the environment file: `source .colima.env`
3. Verify the socket exists: `ls ~/.colima/docker.sock`

### Docker compose not found
Run the configuration step from Prerequisites section 3 to update `~/.docker/config.json`

### Container build issues
Clear Docker cache and rebuild:
```bash
make build
```

All Docker commands (`docker`, `docker compose`) now use Colima's container runtime instead of Docker Desktop.
