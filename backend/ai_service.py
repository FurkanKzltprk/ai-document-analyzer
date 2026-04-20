import requests

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "llama3"

CV_SYSTEM = """Sen bir insan kaynakları uzmanısın. Verilen CV içeriğini analiz edip soruları Türkçe olarak yanıtla. Yanıtlarını net, madde madde ve profesyonel tut."""

DOC_SYSTEM = """Aşağıdaki doküman içeriğine dayanarak soruyu Türkçe yanıtla. Yanıtın yalnızca dokümandaki bilgilere dayansın."""


def ask_llama(document_text: str, question: str, mode: str = "document") -> str:
    excerpt = document_text[:3000]
    system = CV_SYSTEM if mode == "cv" else DOC_SYSTEM

    prompt = f"""{system}

İçerik:
{excerpt}

Soru: {question}

Yanıt:"""

    response = requests.post(
        OLLAMA_URL,
        json={"model": MODEL, "prompt": prompt, "stream": False},
        timeout=120,
    )
    response.raise_for_status()
    return response.json()["response"]
