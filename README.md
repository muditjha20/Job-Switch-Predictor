# 🔮 Job-Switch Predictor (Frontend)

**An AI-powered web app** that predicts whether a candidate is likely to switch jobs — based on career history and demographics.  
This repository contains the **frontend** only (HTML, CSS, JavaScript). It connects to a Flask + XGBoost backend API hosted on [Render](https://render.com).

🌐 **Live Demo:** [View on GitHub Pages](https://muditjha20.github.io/Job-Switch-Predictor)  
⚡ **Backend API:** [talent-predictor-api.onrender.com](https://talent-predictor-api.onrender.com)  

---

## ✨ Features

- 🎨 **Modern, professional UI** — responsive layout, smooth gradients, clean typography.
- 📊 **Interactive forms** — enter candidate information via dropdowns and numeric inputs.
- ⚡ **Real-time predictions** — results appear instantly with probability bars & verdict badges.
- 🕒 **Prediction history** — see all your previous predictions in a table.
- 📋 **One-click cURL export** — copy the exact API request to test backend endpoints.
- 🧠 **Explainability (optional)** — integration-ready for SHAP explanations from backend.

---

## 🚀 Quick Start

Clone this repository and open `index.html` in your browser, **OR** host it with GitHub Pages.

```bash
git clone https://github.com/muditjha20/Job-Switch-Predictor.git
cd Job-Switch-Predictor
```

---

## 🔧 Configuration

The frontend connects to the backend API via `BASE_URL` in **`app.js`**:

```js
// app.js
const BASE_URL = "https://talent-predictor-api.onrender.com";
```

> ✅ Already set to the live Render backend.

---

## 📂 Project Structure

```
.
├── index.html     # Main HTML page
├── style.css      # Styling (CSS variables, responsive design, animations)
└── app.js         # JavaScript (form handling, API calls, history, notifications)
```

---

## 💡 How It Works

1. User fills out the form with candidate details.
2. Frontend sends the data as JSON → `POST /predict_raw` on the backend.
3. Backend (Flask + XGBoost) preprocesses input, runs prediction, returns JSON:
   ```json
   {
     "prediction": 1,
     "probability": 0.76,
     "model_version": "xgb_v1",
     "latency_ms": 42
   }
   ```
4. Frontend displays a **verdict badge**, **probability bar**, and saves the result to history.

---

## 🌟 Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript (no frameworks required)
- **Backend (separate repo):** Flask, Scikit-learn, XGBoost, Joblib
- **Hosting:** 
  - Frontend → GitHub Pages  
  - Backend → Render Web Service

---

## 🏗️ Deployment

### GitHub Pages (Frontend)
1. Push this repo to GitHub.
2. Go to **Settings → Pages**.
3. Set source: `Deploy from branch` → `main` → `/ (root)`.
4. Done! Your app is live at [https://muditjha20.github.io/Job-Switch-Predictor](https://muditjha20.github.io/Job-Switch-Predictor).

### Render (Backend)
- Backend is live at [https://talent-predictor-api.onrender.com](https://talent-predictor-api.onrender.com).

---

## 🧑‍💻 Author

**Mudit Mayank Jha**  
🎓 Computer Science | University of the West Indies & University of Richmond  
💼 Aspiring SWE | Interested in AI/ML, backend and full-stack  


---

## ⭐ Show Your Support

If you like this project:
- Star ⭐ the repo  
- Share 🔗 with others  
- Fork 🍴 and build on top of it!  

---

> 💡 *"This app is not just about predictions — it’s about making data-driven career insights accessible in a beautiful, intuitive way."*
