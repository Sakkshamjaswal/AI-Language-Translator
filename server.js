// ============================================================
// AI Language Translator — Express Backend
// ============================================================
// Proxies translation requests so API keys never reach the browser.
// Supports two providers: MyMemory (free) and Google Cloud Translation.
// ============================================================

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ---- Provider helpers --------------------------------------

async function translateWithMyMemory(text, sourceLang, targetLang) {
    const langPair = `${sourceLang}|${targetLang}`;
    const params = new URLSearchParams({ q: text, langpair: langPair });
    if (process.env.MYMEMORY_EMAIL) {
        params.append("de", process.env.MYMEMORY_EMAIL);
    }

    const res = await fetch(
        `https://api.mymemory.translated.net/get?${params.toString()}`
    );

    if (!res.ok) {
        throw new Error(`MyMemory API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();

    if (data.responseStatus !== 200) {
        throw new Error(
            data.responseDetails || "Translation failed — MyMemory error"
        );
    }

    return {
        translatedText: data.responseData.translatedText,
        detectedSourceLanguage: data.responseData.match
            ? sourceLang
            : sourceLang,
    };
}

async function translateWithGoogle(text, sourceLang, targetLang) {
    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    if (!apiKey) {
        throw new Error(
            "Google Translate API key is not configured. Set GOOGLE_TRANSLATE_API_KEY in your .env file."
        );
    }

    const body = {
        q: text,
        target: targetLang,
        format: "text",
    };
    if (sourceLang !== "auto") {
        body.source = sourceLang;
    }

    const res = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        }
    );

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
            err?.error?.message || `Google API error: ${res.status}`
        );
    }

    const data = await res.json();
    const translation = data.data.translations[0];

    return {
        translatedText: translation.translatedText,
        detectedSourceLanguage:
            translation.detectedSourceLanguage || sourceLang,
    };
}

// ---- Translate endpoint ------------------------------------

app.post("/api/translate", async (req, res) => {
    try {
        const { text, sourceLang, targetLang } = req.body;

        // Input validation
        if (!text || typeof text !== "string" || text.trim().length === 0) {
            return res.status(400).json({ error: "Please enter some text to translate." });
        }
        if (!targetLang) {
            return res.status(400).json({ error: "Target language is required." });
        }
        if (text.length > 5000) {
            return res.status(400).json({ error: "Text must be 5 000 characters or fewer." });
        }

        const provider = (process.env.TRANSLATION_PROVIDER || "mymemory").toLowerCase();
        let result;

        if (provider === "google") {
            result = await translateWithGoogle(text, sourceLang || "auto", targetLang);
        } else {
            // MyMemory does not support "auto" — default to English
            const src = !sourceLang || sourceLang === "auto" ? "en" : sourceLang;
            result = await translateWithMyMemory(text, src, targetLang);
        }

        return res.json(result);
    } catch (err) {
        console.error("Translation error:", err.message);
        return res.status(500).json({
            error: err.message || "Translation failed. Please try again.",
        });
    }
});

// ---- Supported-languages endpoint --------------------------

app.get("/api/languages", (_req, res) => {
    res.json(LANGUAGES);
});

// ---- Catch-all: serve SPA ----------------------------------

app.get("*", (_req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ---- Language list -----------------------------------------

const LANGUAGES = [
    { code: "auto", name: "Auto Detect" },
    { code: "af", name: "Afrikaans" },
    { code: "sq", name: "Albanian" },
    { code: "am", name: "Amharic" },
    { code: "ar", name: "Arabic" },
    { code: "hy", name: "Armenian" },
    { code: "az", name: "Azerbaijani" },
    { code: "eu", name: "Basque" },
    { code: "be", name: "Belarusian" },
    { code: "bn", name: "Bengali" },
    { code: "bs", name: "Bosnian" },
    { code: "bg", name: "Bulgarian" },
    { code: "ca", name: "Catalan" },
    { code: "ceb", name: "Cebuano" },
    { code: "zh", name: "Chinese" },
    { code: "hr", name: "Croatian" },
    { code: "cs", name: "Czech" },
    { code: "da", name: "Danish" },
    { code: "nl", name: "Dutch" },
    { code: "en", name: "English" },
    { code: "eo", name: "Esperanto" },
    { code: "et", name: "Estonian" },
    { code: "fi", name: "Finnish" },
    { code: "fr", name: "French" },
    { code: "gl", name: "Galician" },
    { code: "ka", name: "Georgian" },
    { code: "de", name: "German" },
    { code: "el", name: "Greek" },
    { code: "gu", name: "Gujarati" },
    { code: "ha", name: "Hausa" },
    { code: "he", name: "Hebrew" },
    { code: "hi", name: "Hindi" },
    { code: "hu", name: "Hungarian" },
    { code: "is", name: "Icelandic" },
    { code: "ig", name: "Igbo" },
    { code: "id", name: "Indonesian" },
    { code: "ga", name: "Irish" },
    { code: "it", name: "Italian" },
    { code: "ja", name: "Japanese" },
    { code: "jv", name: "Javanese" },
    { code: "kn", name: "Kannada" },
    { code: "kk", name: "Kazakh" },
    { code: "km", name: "Khmer" },
    { code: "rw", name: "Kinyarwanda" },
    { code: "ko", name: "Korean" },
    { code: "ku", name: "Kurdish" },
    { code: "ky", name: "Kyrgyz" },
    { code: "lo", name: "Lao" },
    { code: "la", name: "Latin" },
    { code: "lv", name: "Latvian" },
    { code: "lt", name: "Lithuanian" },
    { code: "lb", name: "Luxembourgish" },
    { code: "mk", name: "Macedonian" },
    { code: "mg", name: "Malagasy" },
    { code: "ms", name: "Malay" },
    { code: "ml", name: "Malayalam" },
    { code: "mt", name: "Maltese" },
    { code: "mi", name: "Maori" },
    { code: "mr", name: "Marathi" },
    { code: "mn", name: "Mongolian" },
    { code: "my", name: "Myanmar (Burmese)" },
    { code: "ne", name: "Nepali" },
    { code: "no", name: "Norwegian" },
    { code: "or", name: "Odia" },
    { code: "ps", name: "Pashto" },
    { code: "fa", name: "Persian" },
    { code: "pl", name: "Polish" },
    { code: "pt", name: "Portuguese" },
    { code: "pa", name: "Punjabi" },
    { code: "ro", name: "Romanian" },
    { code: "ru", name: "Russian" },
    { code: "sm", name: "Samoan" },
    { code: "gd", name: "Scots Gaelic" },
    { code: "sr", name: "Serbian" },
    { code: "sn", name: "Shona" },
    { code: "sd", name: "Sindhi" },
    { code: "si", name: "Sinhala" },
    { code: "sk", name: "Slovak" },
    { code: "sl", name: "Slovenian" },
    { code: "so", name: "Somali" },
    { code: "es", name: "Spanish" },
    { code: "su", name: "Sundanese" },
    { code: "sw", name: "Swahili" },
    { code: "sv", name: "Swedish" },
    { code: "tg", name: "Tajik" },
    { code: "ta", name: "Tamil" },
    { code: "tt", name: "Tatar" },
    { code: "te", name: "Telugu" },
    { code: "th", name: "Thai" },
    { code: "tr", name: "Turkish" },
    { code: "tk", name: "Turkmen" },
    { code: "uk", name: "Ukrainian" },
    { code: "ur", name: "Urdu" },
    { code: "ug", name: "Uyghur" },
    { code: "uz", name: "Uzbek" },
    { code: "vi", name: "Vietnamese" },
    { code: "cy", name: "Welsh" },
    { code: "xh", name: "Xhosa" },
    { code: "yi", name: "Yiddish" },
    { code: "yo", name: "Yoruba" },
    { code: "zu", name: "Zulu" },
];

// ---- Start server ------------------------------------------

app.listen(PORT, () => {
    const provider = (process.env.TRANSLATION_PROVIDER || "mymemory").toLowerCase();
    console.log(`\n🌐 AI Language Translator running at http://localhost:${PORT}`);
    console.log(`📡 Translation provider: ${provider}\n`);
});
