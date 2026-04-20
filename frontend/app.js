const API = "http://localhost:8000";

const dropZone     = document.getElementById("drop-zone");
const fileInput    = document.getElementById("file-input");
const dropLabel    = document.getElementById("drop-label");
const uploadBtn    = document.getElementById("upload-btn");
const uploadStatus = document.getElementById("upload-status");
const askSection   = document.getElementById("ask-section");
const questionInput= document.getElementById("question-input");
const askBtn       = document.getElementById("ask-btn");
const cvShortcuts  = document.getElementById("cv-shortcuts");
const modeBtns     = document.querySelectorAll(".mode-btn");

let currentMode = "document";

modeBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    modeBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentMode = btn.dataset.mode;
    cvShortcuts.style.display = currentMode === "cv" ? "flex" : "none";
    questionInput.placeholder = currentMode === "cv"
      ? "CV hakkında bir soru sor (örn: Adayın becerileri neler?)"
      : "Doküman hakkında bir soru yaz...";
  });
});

document.querySelectorAll(".shortcut-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    questionInput.value = btn.textContent;
    questionInput.focus();
  });
});
const answerBox    = document.getElementById("answer-box");
const answerText   = document.getElementById("answer-text");
const askStatus    = document.getElementById("ask-status");

let selectedFile = null;
let currentDocId = null;

// --- Dosya seçimi ---

dropZone.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", () => {
  if (fileInput.files[0]) setFile(fileInput.files[0]);
});

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("over");
});

dropZone.addEventListener("dragleave", () => dropZone.classList.remove("over"));

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("over");
  const f = e.dataTransfer.files[0];
  if (f && f.type === "application/pdf") setFile(f);
  else setStatus(uploadStatus, "Sadece PDF dosyası yükleyebilirsiniz.", "error");
});

function setFile(file) {
  selectedFile = file;
  dropLabel.textContent = file.name;
  dropZone.classList.add("has-file");
  uploadBtn.disabled = false;
  setStatus(uploadStatus, "", "");
}

// --- PDF Yükleme ---

uploadBtn.addEventListener("click", async () => {
  if (!selectedFile) return;

  uploadBtn.disabled = true;
  setStatus(uploadStatus, "Yükleniyor...", "loading");

  const formData = new FormData();
  formData.append("file", selectedFile);

  try {
    const res = await fetch(`${API}/upload`, { method: "POST", body: formData });
    const data = await res.json();

    if (!res.ok) throw new Error(data.detail || "Yükleme hatası");

    currentDocId = data.doc_id;
    setStatus(uploadStatus, `✓ ${data.char_count} karakter çıkarıldı.`, "success");
    askSection.style.display = "block";
    askSection.scrollIntoView({ behavior: "smooth" });
  } catch (err) {
    setStatus(uploadStatus, err.message, "error");
    uploadBtn.disabled = false;
  }
});

// --- Soru Sorma ---

askBtn.addEventListener("click", askQuestion);
questionInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.ctrlKey) askQuestion();
});

async function askQuestion() {
  const question = questionInput.value.trim();
  if (!question || !currentDocId) return;

  askBtn.disabled = true;
  answerBox.style.display = "none";
  setStatus(askStatus, "Llama3 düşünüyor...", "loading");

  try {
    const res = await fetch(`${API}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doc_id: currentDocId, question, mode: currentMode }),
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.detail || "Bir hata oluştu");

    answerText.textContent = data.answer;
    answerBox.style.display = "block";
    setStatus(askStatus, "", "");
  } catch (err) {
    setStatus(askStatus, err.message, "error");
  } finally {
    askBtn.disabled = false;
  }
}

function setStatus(el, msg, type) {
  el.textContent = msg;
  el.className = `status ${type}`;
}
