# System Architecture

```mermaid
flowchart LR
  subgraph client[ClientApps]
    admin[AdminPortalReact]
    chef[ChefPortalReact]
  end

  admin --> bff[ApiCoreNode]
  chef --> bff

  bff --> auth[AuthTenantRBAC]
  bff --> sop[SOPService]
  bff --> billing[BillingService]
  bff --> kitchen[KitchenOpsService]
  bff --> analytics[AnalyticsService]
  bff --> aiProxy[AIProxy]

  aiProxy --> aiSvc[FastAPIAISvc]
  aiSvc --> llm[OpenAILLM]
  aiSvc --> vec[(VectorDB)]

  sop --> obj[(S3ObjectStore)]
  sop --> pg[(PostgreSQL)]
  auth --> pg
  billing --> pg
  kitchen --> pg
  analytics --> pg

  bff --> redis[(RedisCacheRateLimit)]
  bff --> queue[SQSQueue]
  queue --> worker[Workers]
  worker --> vec
  worker --> notif[EmailSMSSvc]
```

## Multi-Tenant Security
- Tenant-bound JWT claims: `tenantId`, `role`, `planCode`.
- Every query filtered by `tenant_id`.
- SOP retrieval and embeddings always include tenant namespace.
- API rate-limits per tenant and per user.
