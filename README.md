# AI Document & CV Analyzer

Yapay zekaya verilerinizin gittiğinden endişe etmeyin — belge özetleme ve CV analizini kendi cihazınızda yapın.

Hiçbir bulut servisi yok. Hiçbir API anahtarı yok. Dosyalarınız sadece sizin bilgisayarınızda kalır.

## Neden Bu Uygulama?

ChatGPT veya diğer bulut tabanlı araçlara bir CV ya da gizli belge yüklediğinizde, o veriler bir sunucuya gidiyor. Bu uygulama tamamen yerel çalışır: model de, işlem de, yanıt da sizin cihazınızda.

- **Belge analizi** — Sözleşme, rapor, makale, herhangi bir PDF
- **CV analizi** — Deneyim, beceri, eğitim özeti; hazır hızlı sorularla
- **Soru-cevap** — Doküman hakkında istediğinizi sorabilirsiniz

## Teknolojiler

| Katman | Teknoloji |
|--------|-----------|
| Backend | Python, FastAPI |
| Frontend | HTML, CSS, JavaScript |
| AI | [Ollama](https://ollama.com) + Llama3 (yerel) |
| PDF | PyMuPDF |

## Kurulum

### 1. Ollama + Llama3

[ollama.com](https://ollama.com) adresinden Ollama'yı kur, ardından:

```bash
ollama pull llama3
```

### 2. Projeyi Klonla

```bash
git clone https://github.com/FurkanKzltprk/ai-document-analyzer.git
cd ai-document-analyzer
```

### 3. Python Ortamı

```bash
python -m venv venv

# Windows PowerShell
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 4. Çalıştır

```bash
# Terminal 1
ollama serve

# Terminal 2
uvicorn backend.main:app --reload
```

`frontend/index.html` dosyasını tarayıcınızda açın.

## Kullanım

1. **Mod seçin** — Doküman ya da CV
2. **PDF yükleyin** — Sürükleyin veya tıklayın
3. **Soru sorun** — CV modunda hazır sorular mevcut
4. **Yanıtı kopyalayın** — Tek tıkla panoya alın

> İlk sorguda model yüklendiği için biraz bekleme olabilir.

## Sistem Gereksinimleri

- 8 GB+ RAM (16 GB önerilir)
- Llama3 modeli için ~5 GB disk alanı
- İnternet bağlantısı gerekmez

## Lisans

MIT
