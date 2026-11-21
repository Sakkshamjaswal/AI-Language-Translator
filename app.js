// ============================================================
// AI Language Translator — Frontend Logic
// ============================================================

const $ = (sel) => document.querySelector(sel);

// ---- DOM refs -----------------------------------------------
const sourceLangEl = $("#sourceLang");
const targetLangEl = $("#targetLang");
const sourceTextEl = $("#sourceText");
const outputTextEl = $("#outputText");
const translateBtn = $("#translateBtn");
const swapBtn = $("#swapBtn");
const clearBtn = $("#clearBtn");
const copyBtn = $("#copyBtn");
const speakSourceBtn = $("#speakSourceBtn");
const speakTargetBtn = $("#speakTargetBtn");
const charCountEl = $("#charCount");
const loader = $("#loader");
const toastEl = $("#toast");
const themeToggle = $("#themeToggle");
const historyListEl = $("#historyList");
const clearHistoryBtn = $("#clearHistoryBtn");

// ---- State --------------------------------------------------
let translatedText = "";
const MAX_HISTORY = 20;

// ---- Initialise languages -----------------------------------
async function loadLanguages() {
    try {
        const res = await fetch("/api/languages");
        const langs = await res.json();
        populateSelect(sourceLangEl, langs, "auto");
        populateSelect(targetLangEl, langs.filter((l) => l.code !== "auto"), "es");
    } catch {
        // Fallback hard-coded pair
        addOption(sourceLangEl, "en", "English", true);
        addOption(targetLangEl, "es", "Spanish", true);
    }
}

function populateSelect(select, langs, defaultCode) {
    select.innerHTML = "";
    langs.forEach((l) => addOption(select, l.code, l.name, l.code === defaultCode));
}

function addOption(select, value, text, selected) {
    const opt = document.createElement("option");
    opt.value = value;
    opt.textContent = text;
    opt.selected = selected;
    select.appendChild(opt);
}

// ---- Character counter --------------------------------------
sourceTextEl.addEventListener("input", () => {
    const len = sourceTextEl.value.length;
    charCountEl.textContent = `${len.toLocaleString()} / 5,000`;
    charCountEl.style.color = len >= 4800 ? "var(--danger)" : "";
});

// ---- Translate ----------------------------------------------
translateBtn.addEventListener("click", translate);

// Ctrl + Enter shortcut
sourceTextEl.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") translate();
});

async function translate() {
    const text = sourceTextEl.value.trim();
    if (!text) return showToast("Please enter some text to translate.", "error");

    const sourceLang = sourceLangEl.value;
    const targetLang = targetLangEl.value;

    if (sourceLang === targetLang) {
        return showToast("Source and target languages are the same.", "error");
    }

    translateBtn.disabled = true;
    loader.classList.remove("hidden");
    outputTextEl.innerHTML = "";

    try {
        const res = await fetch("/api/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, sourceLang, targetLang }),
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Translation failed.");

        translatedText = data.translatedText;
        outputTextEl.textContent = translatedText;

        // Save to history
        addHistory({
            source: text,
            translation: translatedText,
            from: sourceLangEl.options[sourceLangEl.selectedIndex].text,
            to: targetLangEl.options[targetLangEl.selectedIndex].text,
        });
    } catch (err) {
        outputTextEl.innerHTML = `<span class="placeholder-text">${err.message}</span>`;
        showToast(err.message, "error");
    } finally {
        translateBtn.disabled = false;
        loader.classList.add("hidden");
    }
}

// ---- Swap languages -----------------------------------------
swapBtn.addEventListener("click", () => {
    if (sourceLangEl.value === "auto") {
        return showToast('Cannot swap when source is "Auto Detect".', "error");
    }
    const tmp = sourceLangEl.value;
    sourceLangEl.value = targetLangEl.value;
    targetLangEl.value = tmp;

    // Also swap texts if translation exists
    if (translatedText) {
        sourceTextEl.value = translatedText;
        outputTextEl.innerHTML = '<span class="placeholder-text">Translation will appear here…</span>';
        translatedText = "";
        sourceTextEl.dispatchEvent(new Event("input"));
    }
});

// ---- Clear --------------------------------------------------
clearBtn.addEventListener("click", () => {
    sourceTextEl.value = "";
    outputTextEl.innerHTML = '<span class="placeholder-text">Translation will appear here…</span>';
    translatedText = "";
    charCountEl.textContent = "0 / 5,000";
    charCountEl.style.color = "";
    sourceTextEl.focus();
});

// ---- Copy ---------------------------------------------------
copyBtn.addEventListener("click", async () => {
    if (!translatedText) return showToast("Nothing to copy.", "error");
    try {
        await navigator.clipboard.writeText(translatedText);
        showToast("Copied to clipboard!", "success");
    } catch {
        showToast("Failed to copy.", "error");
    }
});

// ---- Text-to-Speech -----------------------------------------
function speak(text, langCode) {
    if (!text) return showToast("No text to read.", "error");
    if (!("speechSynthesis" in window)) {
        return showToast("Your browser does not support text-to-speech.", "error");
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = langCode || "en";
    utter.rate = 0.95;
    window.speechSynthesis.speak(utter);
}

speakSourceBtn.addEventListener("click", () =>
    speak(sourceTextEl.value, sourceLangEl.value === "auto" ? "en" : sourceLangEl.value)
);
speakTargetBtn.addEventListener("click", () =>
    speak(translatedText, targetLangEl.value)
);

// ---- Toast --------------------------------------------------
let toastTimer;
function showToast(msg, type = "info") {
    toastEl.textContent = msg;
    toastEl.className = `toast show ${type}`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toastEl.classList.remove("show");
    }, 3000);
}

// ---- Theme toggle -------------------------------------------
function applyTheme(dark) {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    themeToggle.innerHTML = dark
        ? '<i class="fas fa-sun"></i>'
        : '<i class="fas fa-moon"></i>';
    localStorage.setItem("theme", dark ? "dark" : "light");
}

themeToggle.addEventListener("click", () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    applyTheme(!isDark);
});

// Load saved theme
applyTheme(
    localStorage.getItem("theme")
        ? localStorage.getItem("theme") === "dark"
        : window.matchMedia("(prefers-color-scheme: dark)").matches
);

// ---- Translation History ------------------------------------
function getHistory() {
    try {
        return JSON.parse(localStorage.getItem("translateHistory") || "[]");
    } catch {
        return [];
    }
}

function saveHistory(list) {
    localStorage.setItem("translateHistory", JSON.stringify(list));
}

function addHistory(entry) {
    const list = getHistory();
    list.unshift(entry);
    if (list.length > MAX_HISTORY) list.length = MAX_HISTORY;
    saveHistory(list);
    renderHistory();
}

function renderHistory() {
    const list = getHistory();
    if (list.length === 0) {
        historyListEl.innerHTML = '<p class="history-empty">No translations yet.</p>';
        return;
    }
    historyListEl.innerHTML = list
        .map(
            (h) => `
    <div class="history-card">
      <div>
        <div class="lang-badge">${escapeHtml(h.from)}</div>
        <div class="hist-text">${escapeHtml(truncate(h.source, 120))}</div>
      </div>
      <div class="arrow"><i class="fas fa-arrow-right"></i></div>
      <div>
        <div class="lang-badge">${escapeHtml(h.to)}</div>
        <div class="hist-text">${escapeHtml(truncate(h.translation, 120))}</div>
      </div>
    </div>`
        )
        .join("");
}

clearHistoryBtn.addEventListener("click", () => {
    localStorage.removeItem("translateHistory");
    renderHistory();
    showToast("History cleared.", "success");
});

function escapeHtml(str) {
    const d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
}

function truncate(str, max) {
    return str.length > max ? str.slice(0, max) + "…" : str;
}

// ---- Boot ---------------------------------------------------
loadLanguages();
renderHistory();
