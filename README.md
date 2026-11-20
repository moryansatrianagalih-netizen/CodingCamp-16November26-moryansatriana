# 📋 To-Do Lists Dashboard

A clean, fully client-side productivity dashboard built with **HTML · CSS · Vanilla JavaScript**.  
No frameworks, no backend, no build step — just open `index.html`.

## ✨ Features

| Feature | Details |
|---------|---------|
| **Greeting** | Live clock + date, time-based greeting (morning / afternoon / evening / night), custom name saved to LocalStorage |
| **Focus Timer** | Pomodoro-style countdown, Start / Stop / Reset, custom duration (1–120 min), animated progress bar, browser notification on completion |
| **To-Do List** | Add, edit (modal), mark done, delete tasks; filter by All / Active / Done; "Clear done" bulk action; task count; persisted in LocalStorage |
| **Quick Links** | Add labeled URLs, favicon auto-fetched from Google S2, emoji fallback, delete button, opens in new tab; persisted in LocalStorage |
| **Light / Dark mode** | Toggle button in topbar, preference saved to LocalStorage |

## 📂 Project Structure

```
├── index.html
├── css/
│   └── style.css
├── js/
│   └── app.js
└── README.md
```

## 🚀 Usage

1. Clone or download the repo
2. Open `index.html` in any modern browser
3. No install, no build step needed

## 🌐 Deployment (GitHub Pages)

1. Push repo to GitHub
2. Go to **Settings → Pages**
3. Set source to `main` branch, `/ (root)`
4. Your site will be live at `https://<username>.github.io/<repo>/`

## 🧰 Tech Stack

- HTML5
- CSS3 (custom properties, grid, flexbox)
- Vanilla JavaScript (ES2020+)
- Browser LocalStorage API
