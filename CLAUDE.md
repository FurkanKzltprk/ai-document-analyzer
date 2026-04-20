# CLAUDE.md

Bu dosya Claude Code'a (claude.ai/code) bu repoda çalışırken rehberlik eder.

## Proje Hakkında

**AI Document Analyzer** — Tamamen local çalışan AI destekli doküman analiz uygulaması. Kullanıcı PDF yükler, Llama3 modeli ile analiz eder ve sorular sorabilir. Hiç ücretli API kullanılmıyor.

## Teknoloji Stack'i

**Backend (Python)**
- FastAPI + Uvicorn
- Pydantic v2
- PyMuPDF (`fitz`) — PDF metin çıkarma
- `python-multipart` — dosya yükleme
- `requests` — Ollama API'ye istek

**Frontend**
- Vanilla HTML / CSS / JavaScript (framework yok)

**LLM**
- Ollama (local) + Llama3 modeli
- Ollama varsayılan olarak `http://localhost:11434` adresinde çalışır

**Sanal ortam:** `venv/` proje kökünde, Python.

## Komutlar

```bash
# Sanal ortamı aktif et (Windows PowerShell)
venv\Scripts\activate

# Sanal ortamı aktif et (Windows CMD)
venv\Scripts\activate.bat

# Backend'i başlat
uvicorn backend.main:app --reload

# Ollama'yı başlat (ayrı terminalde)
ollama serve

# Llama3 modelini çalıştır (test)
ollama run llama3
```

## Dosya Yapısı

```
D:\ai-saas\
├── backend\
│   ├── main.py          # FastAPI ana uygulama, endpoint'ler
│   ├── pdf_utils.py     # PyMuPDF ile PDF'den metin çıkarma
│   └── ai_service.py    # Ollama LLM entegrasyonu
├── frontend\
│   ├── index.html       # Ana sayfa
│   ├── app.js           # Frontend mantığı, API çağrıları
│   └── style.css        # Stiller
└── venv\                # Python sanal ortam
```

## CV ve Doküman Modu

- Uygulama iki modda çalışır: `document` (genel) ve `cv` (özgeçmiş).
- Mod seçimi frontend'de yapılır; `/ask` isteğiyle birlikte `mode` alanı gönderilir.
- `ai_service.py` içinde her mod için ayrı sistem promptu var: `CV_SYSTEM` ve `DOC_SYSTEM`.
- CV modunda UI'da hazır hızlı soru butonları görünür.

## Frontend Notlar

- `index.html` → `style.css` ve `app.js`'i referans alır; doğrudan tarayıcıda açılır (`file://` yeterli).
- `app.js` içinde `API = "http://localhost:8000"` sabiti var; backend adresi değişirse burası güncellenir.
- Drag & drop ve dosya seçimi desteklenir; `Ctrl+Enter` ile soru gönderilebilir.
- `currentDocId` değişkeni aktif dokümanı tutar; yeni PDF yüklenince üzerine yazılır.

## Mimari Notlar

- Backend ve frontend tamamen ayrı; frontend, backend API'yi `fetch` ile çağırır.
- PDF işleme akışı: Yüklenen dosya → `pdf_utils.py` ile metin çıkarılır → `ai_service.py` üzerinden Ollama'ya gönderilir → yanıt frontend'e döner.
- Ollama entegrasyonu `requests` ile yapılır; `http://localhost:11434/api/generate` endpoint'i kullanılır.
- CORS middleware eklenecek (frontend farklı port'tan istek atacak).
- Çalışma dili: **Türkçe** — tüm açıklamalar ve yanıtlar Türkçe.
