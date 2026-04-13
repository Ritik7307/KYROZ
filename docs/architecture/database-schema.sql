-- PostgreSQL schema starter for Smart Kitchen SaaS

CREATE TABLE tenant (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE app_user (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  password_hash TEXT NOT NULL,
  global_status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tenant_user (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenant(id),
  user_id UUID NOT NULL REFERENCES app_user(id),
  role_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, user_id)
);

CREATE TABLE subscription (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenant(id),
  provider TEXT NOT NULL,
  provider_subscription_id TEXT,
  plan_code TEXT NOT NULL,
  status TEXT NOT NULL,
  renew_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE sop_document (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenant(id),
  category TEXT,
  title TEXT NOT NULL,
  source_type TEXT NOT NULL,
  storage_url TEXT NOT NULL,
  version INT NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE sop_chunk (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenant(id),
  document_id UUID NOT NULL REFERENCES sop_document(id),
  chunk_text TEXT NOT NULL,
  token_count INT,
  embedding_ref TEXT,
  metadata_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE conversation (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenant(id),
  user_id UUID NOT NULL REFERENCES app_user(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE message (
  id UUID PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversation(id),
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  model TEXT,
  token_in INT,
  token_out INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE inventory_item (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenant(id),
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 0,
  reorder_level NUMERIC,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE audit_log (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenant(id),
  actor_user_id UUID REFERENCES app_user(id),
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  before_json JSONB,
  after_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tenant_user_tenant ON tenant_user(tenant_id);
CREATE INDEX idx_sop_document_tenant ON sop_document(tenant_id);
CREATE INDEX idx_sop_chunk_tenant_doc ON sop_chunk(tenant_id, document_id);
CREATE INDEX idx_conversation_tenant_user ON conversation(tenant_id, user_id);
CREATE INDEX idx_inventory_tenant ON inventory_item(tenant_id);
