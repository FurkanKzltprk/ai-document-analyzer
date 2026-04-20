import psutil
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from backend.pdf_utils import extract_text
from backend.ai_service import ask_llama

app = FastAPI(title="AI Document Analyzer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Yüklenen PDF'in metnini geçici olarak hafızada tutuyoruz
document_store: dict[str, str] = {}


class QuestionRequest(BaseModel):
    doc_id: str
    question: str
    mode: str = "document"  # "document" veya "cv"


@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Sadece PDF dosyası yükleyebilirsiniz.")

    contents = await file.read()
    text = extract_text(contents)

    if not text.strip():
        raise HTTPException(status_code=422, detail="PDF'den metin çıkarılamadı.")

    doc_id = file.filename
    document_store[doc_id] = text

    return {"doc_id": doc_id, "message": "PDF başarıyla yüklendi.", "char_count": len(text)}


@app.post("/ask")
async def ask_question(req: QuestionRequest):
    text = document_store.get(req.doc_id)
    if not text:
        raise HTTPException(status_code=404, detail="Doküman bulunamadı. Önce PDF yükleyin.")

    answer = ask_llama(document_text=text, question=req.question, mode=req.mode)
    return {"answer": answer}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/stats")
def system_stats():
    ram = psutil.virtual_memory()
    return {
        "cpu_percent": psutil.cpu_percent(interval=0.2),
        "ram_used_gb": round(ram.used / 1024 ** 3, 1),
        "ram_total_gb": round(ram.total / 1024 ** 3, 1),
        "ram_percent": ram.percent,
    }
