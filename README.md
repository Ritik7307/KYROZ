# Smart Kitchen SaaS

Production-ready monorepo starter for multi-tenant Smart Kitchen SaaS.

## Apps
- apps/api-core: Core SaaS API (Express)
- apps/api-ai: AI + RAG service (FastAPI)
- apps/web-admin: Member dashboard (React) - single UI in use
- apps/web-chef: Legacy shell (currently not used)

## Quick Start
1. Install Node dependencies:
   npm install
2. Start core API:
   npm run dev:core
3. Start member dashboard:
   npm run dev:member
4. Setup Python env and install AI deps:
   pip install -r apps/api-ai/requirements.txt
5. Start AI service:
   npm run dev:ai
