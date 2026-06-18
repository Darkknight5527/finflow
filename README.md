# FinFlow — Personal Finance Tracker

A personal finance dashboard built for tracking budget, investments, and expenses. Hosted as a static site — no backend needed.

## Features
- 📊 Dashboard with cashflow bars, spend donut chart, and 10-year investment projection
- 💰 Budget plan for both Internship and Post-Absorption phases
- 📈 Investment tracker (Mutual Funds, Stocks, EPF)
- 🧾 Monthly expense logger with fixed vs variable breakdown
- 🎯 Financial goals tracker with progress bars
- 💾 All data saved locally in your browser (localStorage)

## How to Host on GitHub Pages

### Step 1 — Create a GitHub repo
1. Go to [github.com](https://github.com) and create a new repository
2. Name it `finflow` or anything you like
3. Set it to **Public**

### Step 2 — Upload files
```bash
git init
git add .
git commit -m "Initial FinFlow setup"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/finflow.git
git push -u origin main
```

### Step 3 — Enable GitHub Pages
1. Go to your repo → **Settings** → **Pages**
2. Under "Source", select **Deploy from a branch**
3. Choose **main** branch, **/ (root)** folder
4. Click **Save**

Your site will be live at: `https://YOUR_USERNAME.github.io/finflow`

### Step 4 — Access from anywhere
Bookmark the GitHub Pages URL on your phone, tablet, and laptop.
All data is saved in your browser's localStorage per device.

## Files
```
finflow/
├── index.html   — App structure
├── style.css    — All styles
├── app.js       — All logic + data
└── README.md    — This file
```

## Customization
- Edit `PHASES` in `app.js` to change your budget allocations
- Edit `defaultData.investments` to add your starting investments
- Edit `defaultData.goals` to set your financial goals

## Note on Data
Data is stored in your browser's localStorage. It does NOT sync between devices automatically.
To transfer data: open browser console and run `localStorage.getItem('finflow_data_v1')` to export, then paste into the other device's console with `localStorage.setItem(...)`.
