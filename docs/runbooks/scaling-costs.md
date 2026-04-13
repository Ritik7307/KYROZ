# Scaling Cost Estimation (INR/month)

## Starter (10 tenants, 200 MAU)
- App + DB + Redis + Storage: 35,000-70,000
- LLM + embeddings: 25,000-80,000
- Notifications and ops: 5,000-15,000
- Total: 65,000-165,000

## Growth (100 tenants, 2,000 MAU)
- Infra: 150,000-350,000
- AI usage: 200,000-600,000
- Ops + monitoring: 30,000-80,000
- Total: 380,000-1,030,000

## Scale (500+ tenants, 10,000+ MAU)
- Infra: 700,000-1,800,000
- AI usage: 1,000,000-3,500,000
- Security/compliance: 200,000-500,000
- Total: 1,900,000-5,800,000

## Cost Controls
- Cache repeated SOP responses.
- Use model routing by plan.
- Token quotas per plan.
- Batch embeddings for off-peak hours.
