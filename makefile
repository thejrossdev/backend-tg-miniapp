# Project Makefile
# Requires: make, pnpm, docker, docker-compose

.PHONY: help setup install dev build test lint format \
        docker-up docker-down docker-logs docker-rebuild docker-rebuild-api docker-api-logs \
        db-shell db-status db-migrate

# Configuration
COMPOSE_FILE := docker-compose.prod.yaml
PNPM := pnpm
DOCKER_COMPOSE := docker compose -f $(COMPOSE_FILE)

# Default target
help: ## 📖 Show available commands
	@echo "Project Makefile"
	@echo "======================="
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# 🔧 Local Development (pnpm)
setup: install ## 🛠️ Initial setup: install deps & configure git hooks
install: ## 📦 Install dependencies
	$(PNPM) install
dev: ## 🚀 Start dev server
	$(PNPM) dev
build: ## 🏗️ Build
	$(PNPM) build
test: ## 🧪 Run test suites
	$(PNPM) test
lint: ## 🔍 Run linter
	$(PNPM) lint
format: ## 🎨 Format code with Prettier
	$(PNPM) format

# 🐳 Docker & Infrastructure
docker-up: ## ☁️ Start production stack (api, postgres)
	$(DOCKER_COMPOSE) up -d
docker-down: ## 🛑 Stop & remove containers
	$(DOCKER_COMPOSE) down
docker-logs: ## 📜 Tail all container logs
	$(DOCKER_COMPOSE) logs -f
docker-rebuild: ## 🔨 Rebuild images & restart
	$(DOCKER_COMPOSE) up -d --build
docker-rebuild-api: ## 🔨 Rebuild image & restart api
	$(DOCKER_COMPOSE) up -d --build app-api
docker-api-logs: ## 🔙 Tail API logs only
	$(DOCKER_COMPOSE) logs -f app-api

# 🗄️ Database
db-status: ## 🟢 Check PostgreSQL container status
	$(DOCKER_COMPOSE) ps postgres
db-shell: ## 🐘 Open PostgreSQL CLI
	$(DOCKER_COMPOSE) exec postgres psql -U postgres

# Generate
gen-secret:
	openssl rand -hex 32
gen-deps:
	mmdc -i ./docs/assets/deps.mermaid -o ./docs/assets/deps.svg
gen-api:
	pnpm swagger-typescript-api generate -p http://localhost:3000/api-json -o ./src/generated -n api.generated.ts --extract-enums
