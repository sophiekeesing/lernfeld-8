# Quick Reference: Docker → Colima Migration

## One-Time Setup
```bash
# Install Colima
brew install colima

# Install docker-compose (if not installed)
brew install docker-compose

# Update ~/.docker/config.json with this content:
{
	"auths": {},
	"currentContext": "colima",
	"cliPluginsExtraDirs": [
		"/opt/homebrew/lib/docker/cli-plugins"
	]
}

# Start Colima
colima start
```

## Daily Workflow - No Changes!
```bash
# Same commands as before, but now running on Colima:

# Install dependencies
make install

# Run with containers (Colima)
make run

# Run without containers
make dev

# Rebuild containers
make build

# Stop containers
make stop
```

## Key Differences from Docker Desktop
| Aspect | Docker Desktop | Colima |
|--------|---|---|
| CLI Commands | Same (`docker`, `docker compose`) | Same ✓ |
| Volume Mounting | Direct | virtiofs (faster) ✓ |
| Socket Path | Varies | `~/.colima/docker.sock` |
| Memory Usage | Higher | Lower ✓ |
| Cost | Paid (for teams) | Free ✓ |
| Company Policy | May be restricted | Usually allowed ✓ |

## Troubleshooting

### Docker commands not found
```bash
# Start Colima first
colima start

# Verify it's running
colima status
```

### Docker compose command not found
```bash
# Update Docker config
cat > ~/.docker/config.json << 'EOF'
{
	"auths": {},
	"currentContext": "colima",
	"cliPluginsExtraDirs": [
		"/opt/homebrew/lib/docker/cli-plugins"
	]
}
EOF
```

### Permission/Socket errors
```bash
# Source environment (optional)
source .colima.env

# Or set manually
export DOCKER_HOST=unix:///$HOME/.colima/docker.sock
```

## Full Documentation
See `COLIMA_SETUP.md` for detailed setup and troubleshooting.
See `MIGRATION_SUMMARY.md` for complete change log.
