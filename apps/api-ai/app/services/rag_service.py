def answer_query(tenant_id: str | None, question: str) -> dict:
    return {
        "tenantId": tenant_id,
        "question": question,
        "answer": f"Stub RAG answer for: {question}",
        "citations": [],
        "confidence": 0.35
    }
