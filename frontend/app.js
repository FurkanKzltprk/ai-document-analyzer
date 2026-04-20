const API = "http://localhost:8000";

// ── Sistem Kaynak Grafikleri ─────────────────────

const HISTORY = 60; // kaç veri noktası gösterilsin

function makeChart(canvasId, color) {
  const canvas = document.getElementById(canvasId);
  const ctx    = canvas.getContext("2d");
  const data   = Array(HISTORY).fill(0);

  function draw() {
    const W = canvas.offsetWidth;
    const H = canvas.height;
    canvas.width = W;

    ctx.clearRect(0, 0, W, H);

    // Grid çizgileri
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 1;
    [0.25, 0.5, 0.75].forEach(y => {
      ctx.beginPath();
      ctx.moveTo(0, y * H);
      ctx.lineTo(W, y * H);
      ctx.stroke();
    });

    // Dalga
    const step = W / (HISTORY - 1);
    ctx.beginPath();
    data.forEach((v, i) => {
      const x = i * step;
      const y = H - (v / 100) * H * 0.92 - 2;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });

    // Dolgu
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, color.replace(")", ",0.5)").replace("rgb", "rgba"));
    grad.addColorStop(1, color.replace(")", ",0.02)").replace("rgb", "rgba"));
    ctx.fillStyle = grad;
    ctx.fill();

    // Çizgi
    ctx.beginPath();
    data.forEach((v, i) => {
      const x = i * step;
      const y = H - (v / 100) * H * 0.92 - 2;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth   = 1.5;
    ctx.lineJoin    = "round";
    ctx.stroke();
  }

  return { push(val) { data.push(val); data.shift(); draw(); }, draw };
}

const cpuChart = makeChart("cpu-chart", "rgb(124,111,255)");
const ramChart = makeChart("ram-chart", "rgb(52,211,153)");

const cpuVal   = document.getElementById("cpu-val");
const ramVal   = document.getElementById("ram-val");
const ramTotal = document.getElementById("ram-total");
const cpuBadge = document.getElementById("cpu-badge");
const ramBadge = document.getElementById("ram-badge");
const cpuCard  = document.getElementById("cpu-card");
const ramCard  = document.getElementById("ram-card");

function levelClass(pct) {
  if (pct < 40) return ["low",    "Normal"];
  if (pct < 75) return ["medium", "Orta"];
  return              ["high",   "Yüksek"];
}

async function fetchStats() {
  try {
    const res  = await fetch(`${API}/stats`);
    const data = await res.json();

    cpuVal.textContent = data.cpu_percent;
    ramVal.textContent = data.ram_used_gb;
    ramTotal.textContent = data.ram_total_gb;

    const [cpuCls, cpuLbl] = levelClass(data.cpu_percent);
    const [ramCls, ramLbl] = levelClass(data.ram_percent);

    cpuBadge.textContent = cpuLbl; cpuBadge.className = `stat-badge ${cpuCls}`;
    ramBadge.textContent = ramLbl; ramBadge.className = `stat-badge ${ramCls}`;

    cpuCard.classList.toggle("active", data.cpu_percent > 50);
    ramCard.classList.toggle("active", data.ram_percent > 70);

    cpuChart.push(data.cpu_percent);
    ramChart.push(data.ram_percent);
  } catch { /* backend henüz hazır değilse sessizce geç */ }
}

fetchStats();
setInterval(fetchStats, 2000);
window.addEventListener("resize", () => { cpuChart.draw(); ramChart.draw(); });

const dropZone      = document.getElementById("drop-zone");
const fileInput     = document.getElementById("file-input");
const dropLabel     = document.getElementById("drop-label");
const uploadBtn     = document.getElementById("upload-btn");
const uploadStatus  = document.getElementById("upload-status");
const askSection    = document.getElementById("ask-section");
const questionInput = document.getElementById("question-input");
const askBtn        = document.getElementById("ask-btn");
const askBtnLabel   = document.getElementById("ask-btn-label");
const askSpinner    = document.getElementById("ask-spinner");
const cvShortcuts   = document.getElementById("cv-shortcuts");
const modeBtns      = document.querySelectorAll(".mode-btn");
const answerBox     = document.getElementById("answer-box");
const answerText    = document.getElementById("answer-text");
const askStatus     = document.getElementById("ask-status");
const copyBtn       = document.getElementById("copy-btn");

let currentMode  = "document";
let selectedFile = null;
let currentDocId = null;

// ── Mod Seçimi ──────────────────────────────────

modeBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    modeBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentMode = btn.dataset.mode;
    cvShortcuts.style.display = currentMode === "cv" ? "flex" : "none";
    questionInput.placeholder = currentMode === "cv"
      ? "CV hakkında bir soru sor..."
      : "Doküman hakkında bir soru yaz...";
  });
});

document.querySelectorAll(".chip").forEach(btn => {
  btn.addEventListener("click", () => {
    questionInput.value = btn.textContent;
    questionInput.focus();
  });
});

// ── Dosya Seçimi ────────────────────────────────

dropZone.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", () => {
  if (fileInput.files[0]) setFile(fileInput.files[0]);
});

dropZone.addEventListener("dragover", e => { e.preventDefault(); dropZone.classList.add("over"); });
dropZone.addEventListener("dragleave", () => dropZone.classList.remove("over"));
dropZone.addEventListener("drop", e => {
  e.preventDefault();
  dropZone.classList.remove("over");
  const f = e.dataTransfer.files[0];
  if (f?.type === "application/pdf") setFile(f);
  else setStatus(uploadStatus, "Sadece PDF dosyası yükleyebilirsiniz.", "error");
});

function setFile(file) {
  selectedFile = file;
  dropLabel.textContent = file.name;
  dropZone.classList.add("has-file");
  uploadBtn.disabled = false;
  setStatus(uploadStatus, "", "");
}

// ── PDF Yükleme ─────────────────────────────────

uploadBtn.addEventListener("click", async () => {
  if (!selectedFile) return;

  uploadBtn.disabled = true;
  setStatus(uploadStatus, "Yükleniyor...", "loading");

  const formData = new FormData();
  formData.append("file", selectedFile);

  try {
    const res  = await fetch(`${API}/upload`, { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Yükleme hatası");

    currentDocId = data.doc_id;
    setStatus(uploadStatus, `✓ ${data.char_count.toLocaleString()} karakter çıkarıldı.`, "success");
    askSection.style.display = "block";
    askSection.scrollIntoView({ behavior: "smooth" });
  } catch (err) {
    setStatus(uploadStatus, err.message, "error");
    uploadBtn.disabled = false;
  }
});

// ── Soru Sorma ──────────────────────────────────

askBtn.addEventListener("click", askQuestion);
questionInput.addEventListener("keydown", e => {
  if (e.key === "Enter" && e.ctrlKey) askQuestion();
});

async function askQuestion() {
  const question = questionInput.value.trim();
  if (!question || !currentDocId) return;

  setAsking(true);
  answerBox.style.display = "none";
  setStatus(askStatus, "Llama3 düşünüyor...", "loading");

  try {
    const res  = await fetch(`${API}/ask`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ doc_id: currentDocId, question, mode: currentMode }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Bir hata oluştu");

    answerText.textContent = data.answer;
    answerBox.style.display = "block";
    setStatus(askStatus, "", "");
  } catch (err) {
    setStatus(askStatus, err.message, "error");
  } finally {
    setAsking(false);
  }
}

function setAsking(loading) {
  askBtn.disabled        = loading;
  questionInput.disabled = loading;
  askBtnLabel.textContent = loading ? "Yanıt bekleniyor" : "Sor";
  askSpinner.style.display = loading ? "inline-block" : "none";
}

// ── Kopyala ─────────────────────────────────────

copyBtn.addEventListener("click", async () => {
  const text = answerText.textContent;
  if (!text) return;
  await navigator.clipboard.writeText(text);
  copyBtn.textContent = "✓ Kopyalandı";
  setTimeout(() => {
    copyBtn.innerHTML = `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Kopyala`;
  }, 2000);
});

// ── Yardımcı ────────────────────────────────────

function setStatus(el, msg, type) {
  el.textContent = msg;
  el.className   = `status ${type}`;
}
