# 🌐 AI Language Translator

A modern, full-stack **AI Language Translator** web application built with **Node.js / Express** on the backend and vanilla **HTML, CSS, JavaScript** on the frontend.

![License](https://img.shields.io/badge/license-MIT-blue)

---

## ✨ Features

| Feature                   | Description                                              |
| ------------------------- | -------------------------------------------------------- |
| **100+ Languages**        | Translate between 100+ languages                         |
| **Auto Detect**           | Automatically detect the source language                 |
| **Copy to Clipboard**     | One-click copy of the translated text                    |
| **Text-to-Speech**        | Listen to source or translated text with the speaker btn |
| **Swap Languages**        | Instantly swap source ↔ target languages                 |
| **Character Counter**     | Live character count with 5 000-char limit               |
| **Translation History**   | Saved locally — persists across sessions                 |
| **Dark / Light Theme**    | Toggle with one click; respects system preference        |
| **Fully Responsive**      | Works on desktop, tablet, and mobile                     |
| **Secure API Keys**       | Keys stay on the server — never sent to the browser      |
| **Keyboard Shortcut**     | Press `Ctrl+Enter` to translate instantly                 |

---

## 📂 Project Structure

```
ai-language-translator/
├── server.js           # Express backend (API proxy)
├── package.json
├── .env.example        # Environment config template
├── .gitignore
├── README.md
└── public/
    ├── index.html      # Main HTML page
    ├── css/
    │   └── style.css   # All styles & theming
    └── js/
        └── app.js      # Frontend logic
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js ≥ 18** — [download](https://nodejs.org/)

### 1. Clone / navigate to the project

```bash
cd ai-language-translator
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create the `.env` file

```bash
cp .env.example .env     # Linux / macOS
copy .env.example .env   # Windows
```

The app works **out of the box** with the free [MyMemory](https://mymemory.translated.net/) provider — no API key required.

### 4. Start the server

```bash
npm start
# or, for auto-reload during development:
npm run dev
```

### 5. Open the app

Navigate to **http://localhost:3000** in your browser.

---

## ⚙️ Configuration

Edit the `.env` file to change settings:

| Variable                   | Default     | Description                                       |
| -------------------------- | ----------- | ------------------------------------------------- |
| `PORT`                     | `3000`      | Server port                                       |
| `TRANSLATION_PROVIDER`     | `mymemory`  | `mymemory` (free) or `google` (requires API key)  |
| `GOOGLE_TRANSLATE_API_KEY` | —           | Your Google Cloud Translation API key             |
| `MYMEMORY_EMAIL`           | —           | Optional email to raise the free daily limit       |

### Using Google Cloud Translation API

1. Create a project in [Google Cloud Console](https://console.cloud.google.com/).
2. Enable the **Cloud Translation API**.
3. Create an API key under **APIs & Services → Credentials**.
4. Set in `.env`:
   ```
   TRANSLATION_PROVIDER=google
   GOOGLE_TRANSLATE_API_KEY=your-key-here
   ```
5. Restart the server.

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express
- **Frontend:** HTML5, CSS3 (custom properties, grid, flexbox), Vanilla JavaScript
- **APIs:** MyMemory Translation API (default), Google Cloud Translation API (optional)
- **Fonts:** Inter (Google Fonts)
- **Icons:** Font Awesome 6

---

## 📄 License

MIT — feel free to use, modify, and distribute.
