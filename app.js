// ====== CONFIG ======
const BASE_URL = "https://talent-predictor-api.onrender.com"; // change for prod if needed

// ====== DOM ======
const form = document.getElementById("predictForm");
const predictBtn = document.getElementById("predictBtn");
const resultPanel = document.getElementById("resultPanel");
const modelVersionEl = document.getElementById("modelVersion");
const verdictBadge = document.getElementById("verdictBadge");
const probText = document.getElementById("probability-text");
const probValue = document.getElementById("probability-value");
const probFill = document.getElementById("probability-fill");
const latencyEl = document.getElementById("latency");
const copyCurlBtn = document.getElementById("copyCurlBtn");
const toast = document.getElementById("toast");
const histTableBody = document.querySelector("#histTable tbody");

// ====== STARTUP ======
document.addEventListener("DOMContentLoaded", async () => {
  await loadSchemaAndPopulate();
});

// ====== SCHEMA LOADING ======
async function loadSchemaAndPopulate() {
  try {
    const res = await fetch(`${BASE_URL}/schema`, { method: "GET" });
    if (!res.ok) throw new Error("schema not found");
    const schema = await res.json();
    if (schema?.categoricals) {
      fillSelect("relevent_experience", schema.categoricals.relevent_experience);
      fillSelect("enrolled_university", schema.categoricals.enrolled_university);
      fillSelect("education_level", schema.categoricals.education_level);
      fillSelect("major_discipline", schema.categoricals.major_discipline);
      fillSelect("company_size", schema.categoricals.company_size);
      fillSelect("company_type", schema.categoricals.company_type);
    }
  } catch (e) {
    // Fallback defaults if /schema is unavailable
    fillSelect("relevent_experience", [
      "Has relevent experience",
      "No relevent experience",
    ]);
    fillSelect("enrolled_university", [
      "no_enrollment",
      "Full time course",
      "Part time course",
    ]);
    fillSelect("education_level", [
      "Primary School",
      "High School",
      "Graduate",
      "Masters",
      "Phd",
    ]);
    // Other selects left empty so user knows to check schema or exact strings
  }
}

function fillSelect(id, options) {
  const sel = document.getElementById(id);
  if (!sel || !Array.isArray(options)) return;
  // keep placeholder, remove others
  while (sel.options.length > 1) sel.remove(1);
  options.forEach((opt) => {
    const o = document.createElement("option");
    o.value = opt;
    o.textContent = opt;
    sel.appendChild(o);
  });
}

// ====== FORM HANDLING ======
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearFormErrors();

  const payload = collectPayload();
  const v = validateClientSide(payload);
  if (!v.ok) {
    showFormErrors(v.errors);
    return;
  }

  setLoading(true);
  try {
    const data = await postPredictRaw(payload);
    renderResult(data);
    pushHistory(data);
    renderHistory();
    modelVersionEl.textContent = `Model: ${data.model_version}`;
    resultPanel.style.display = "block";
    // store request payload for curl
    copyCurlBtn.dataset.payload = JSON.stringify(payload);
    showToast("Prediction completed successfully!", "success");
  } catch (err) {
    showToast(err.message || "Request failed", "error");
  } finally {
    setLoading(false);
  }
});

function collectPayload() {
  return {
    city_development_index: parseFloat(document.getElementById("city_development_index").value),
    experience: document.getElementById("experience").value.trim(),
    last_new_job: document.getElementById("last_new_job").value.trim(),
    training_hours: parseInt(document.getElementById("training_hours").value, 10),

    relevent_experience: document.getElementById("relevent_experience").value,
    enrolled_university: document.getElementById("enrolled_university").value,
    education_level: document.getElementById("education_level").value,
    major_discipline: document.getElementById("major_discipline").value,
    company_size: document.getElementById("company_size").value,
    company_type: document.getElementById("company_type").value,
  };
}

function validateClientSide(p) {
  const errors = {};
  if (Number.isNaN(p.city_development_index)) {
    errors.city_development_index = "Enter a number, e.g., 0.92";
  }
  if (p.city_development_index < 0 || p.city_development_index > 1) {
    errors.city_development_index = "Must be between 0 and 1";
  }
  if (Number.isNaN(p.training_hours) || p.training_hours < 0) {
    errors.training_hours = "Enter a non-negative number";
  }
  // require a selection for all categoricals
  ["relevent_experience","enrolled_university","education_level",
   "major_discipline","company_size","company_type"].forEach((c) => {
    if (!p[c]) errors[c] = "Please select a value";
  });
  if (!p.experience) errors.experience = "Required";
  if (!p.last_new_job) errors.last_new_job = "Required";
  return { ok: Object.keys(errors).length === 0, errors };
}

async function postPredictRaw(payload) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 12000);
  const res = await fetch(`${BASE_URL}/predict_raw`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: ctrl.signal,
  });
  clearTimeout(t);

  const text = await res.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { /* leave as {} */ }

  if (!res.ok) {
    // 400 validation
    if (res.status === 400 && data.error === "validation_error" && data.details) {
      showFormErrors(data.details);
      throw new Error("Validation error");
    }
    throw new Error(data.message || `HTTP ${res.status}`);
  }
  return data;
}

function setLoading(on) {
  predictBtn.disabled = on;
  predictBtn.textContent = on ? "Predicting…" : "Predict";
}

function clearFormErrors() {
  document.querySelectorAll(".error[id^='err_']").forEach((el) => (el.textContent = ""));
}

function showFormErrors(details) {
  Object.entries(details).forEach(([field, msg]) => {
    const el = document.getElementById(`err_${field}`);
    if (el) el.textContent = String(msg);
  });
}

// ====== RENDERING ======
function renderResult(r) {
  const pct = Math.round((r.probability || 0) * 100);
  probValue.textContent = `${pct}%`;
  probText.textContent = `Probability: ${pct}%`;
  probFill.style.width = `${pct}%`;

  const switchy = r.prediction === 1;
  verdictBadge.textContent = switchy ? "Likely to Switch" : "Likely to Stay";
  verdictBadge.className = `verdict-badge ${switchy ? "verdict-switch" : "verdict-stay"}`;

  latencyEl.textContent = `Latency: ${r.latency_ms ?? "—"} ms`;
}

// ====== HISTORY ======
const historyArr = [];
function pushHistory(entry) {
  historyArr.unshift({
    ts: Date.now(),
    prediction: entry.prediction,
    probability: entry.probability,
  });
  if (historyArr.length > 10) historyArr.pop();
}
function renderHistory() {
  histTableBody.innerHTML = "";
  for (const h of historyArr) {
    const tr = document.createElement("tr");
    const pct = Math.round((h.probability || 0) * 100);
    tr.innerHTML = `
      <td>${new Date(h.ts).toLocaleString()}</td>
      <td>${h.prediction === 1 ? "Switch" : "Stay"}</td>
      <td>${pct}%</td>
    `;
    histTableBody.appendChild(tr);
  }
}

// ====== TOAST & CURL ======
function showToast(msg, kind = "success") {
  toast.textContent = msg;
  toast.className = kind === "error" ? "error" : "";
  toast.style.display = "block";
  setTimeout(() => (toast.style.display = "none"), 2500);
}

copyCurlBtn.addEventListener("click", () => {
  const payload = copyCurlBtn.dataset.payload || "{}";
  const curl = [
    `curl -X POST "${BASE_URL}/predict_raw"`,
    `-H "Content-Type: application/json"`,
    `-d '${payload.replaceAll("'", "\\'")}'`
  ].join(" ");
  navigator.clipboard.writeText(curl).then(
    () => showToast("cURL copied"),
    () => showToast("Could not copy", "error")
  );
});
