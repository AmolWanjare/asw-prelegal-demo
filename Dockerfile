# Stage 1: Build frontend static export
FROM node:22-alpine AS node-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Install Python dependencies
FROM python:3.12-slim AS python-builder
WORKDIR /app
RUN pip install uv
COPY backend/pyproject.toml backend/uv.lock backend/.python-version ./
RUN uv sync --frozen --no-dev

# Stage 3: Runtime
FROM python:3.12-slim AS runtime
WORKDIR /app

# Copy Python venv
COPY --from=python-builder /app/.venv ./.venv

# Copy backend source
COPY backend/app ./app
COPY backend/pyproject.toml ./

# Copy templates and catalog (needed at runtime for future AI features)
COPY templates/ ./templates/
COPY catalog.json ./

# Copy built frontend static export
COPY --from=node-builder /app/frontend/out ./static

# Create data directory for SQLite
RUN mkdir -p ./data

ENV PATH="/app/.venv/bin:$PATH"
ENV DATABASE_URL="sqlite:///./data/prelegal.db"
ENV STATIC_DIR="./static"

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
