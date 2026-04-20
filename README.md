# AI Document & CV Analyzer

PDF dosyalarını ve özgeçmişleri yerel bir yapay zeka modeli ile analiz etmeni sağlayan bir web uygulaması. Hiçbir ücretli API kullanılmıyor — her şey kendi bilgisayarında çalışıyor.

## Ne Yapar?

- PDF veya CV yüklersin
- **Doküman modu:** Genel sorular sor, özet çıkar
- **CV modu:** Deneyimleri, becerileri, eğitim bilgilerini analiz et; hazır sorularla hızlı başla
- Llama3 modeli dokümanı okuyup sana yanıt verir

## Teknolojiler

- **Backend:** Python, FastAPI
- **Frontend:** HTML, CSS, JavaScript
- **Yapay Zeka:** [Ollama](https://ollama.com) + Llama3 (yerel, internet gerektirmez)
- **PDF İşleme:** PyMuPDF

## Kurulum

### 1. Ollama'yı Kur

[ollama.com](https://ollama.com) adresinden indir ve kur. Ardından Llama3 modelini indir:

```bash
ollama pull llama3
```

### 2. Projeyi Klonla

```bash
git clone https://github.com/kiziltoprakfurkan/ai-document-analyzer.git
cd ai-document-analyzer
```

### 3. Python Ortamını Kur

```bash
python -m venv venv

# Windows PowerShell
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 4. Çalıştır

İki ayrı terminal aç:

```bash
# Terminal 1 — Ollama
ollama serve

# Terminal 2 — Backend
uvicorn backend.main:app --reload
```

Sonra `frontend/index.html` dosyasını tarayıcında aç.

## Kullanım

1. **PDF Yükle** — Analiz etmek istediğin dosyayı sürükle ya da seç
2. **Soru Sor** — Doküman hakkında aklına takılan her şeyi yazabilirsin
3. **Yanıt Al** — Llama3 dokümanı okuyup sana yanıt verir

> İlk yanıt biraz uzun sürebilir; model ilk çalıştırmada yükleniyor.

## API

| Method | Endpoint  | Açıklama              |
|--------|-----------|-----------------------|
| POST   | /upload   | PDF yükle             |
| POST   | /ask      | Soru sor              |
| GET    | /health   | Sunucu durumu         |

## Lisans

MIT
