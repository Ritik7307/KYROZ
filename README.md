# Smart Kitchen SaaS

Production-ready monorepo starter for multi-tenant Smart Kitchen SaaS.

## Apps
- apps/api-core: Core SaaS API (Express)
- apps/api-ai: AI + RAG service (FastAPI)
- apps/web-admin: Admin dashboard shell (React)
- apps/web-chef: Chef portal shell (React)

## Quick Start
1. Install Node dependencies:
   npm install
2. Start core API:
   npm run dev:core
3. Setup Python env and install AI deps:
   pip install -r apps/api-ai/requirements.txt
4. Start AI service:
   npm run dev:ai
