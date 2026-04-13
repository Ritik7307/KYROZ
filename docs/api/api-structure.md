# API Structure

## Core API (`apps/api-core`)
- `POST /v1/auth/login`
- `POST /v1/auth/refresh`
- `GET /v1/tenants`
- `GET /v1/subscriptions/plans`
- `GET /v1/sops`
- `POST /v1/sops/upload`
- `POST /v1/chat/query`
- `GET /v1/inventory/suggestions`
- `GET /v1/analytics/overview`

## AI API (`apps/api-ai`)
- `POST /v1/chat/query` (RAG answer)
- `POST /v1/sops/embed` (embedding queue)
- `GET /health`
