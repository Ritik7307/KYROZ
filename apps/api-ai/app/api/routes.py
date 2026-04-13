from fastapi import APIRouter
from app.services.rag_service import answer_query

router = APIRouter()

@router.post("/chat/query")
def chat_query(payload: dict) -> dict:
    tenant_id = payload.get("tenantId")
    question = payload.get("question", "")
    return answer_query(tenant_id=tenant_id, question=question)

@router.post("/sops/embed")
def embed_sop(payload: dict) -> dict:
    return {
        "status": "queued",
        "documentId": payload.get("documentId"),
        "tenantId": payload.get("tenantId")
    }
