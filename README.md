# Subscription Analyzer

> **Intelligent Financial Analytics Platform**  
> A production-grade system combining Python data science, machine learning, and modern React to analyze and optimize recurring subscription costs.

![Python](https://img.shields.io/badge/Python-3.13-blue?style=flat-square)
![Flask](https://img.shields.io/badge/Backend-Flask_REST_API-green?style=flat-square)
![React](https://img.shields.io/badge/Frontend-React_18_+_Vite-61DAFB?style=flat-square)
![AI](https://img.shields.io/badge/AI-Groq_%2F_Llama_3-purple?style=flat-square)

---

## 🚀 Overview

This platform empowers users to regain control over their digital subscriptions through:
*   **Data Science:** Real-time cost analysis using Pandas & NumPy.
*   **Machine Learning:** Cost forecasting and anomaly detection with Scikit-learn.
*   **Generative AI:** Personalized financial advice powered by LLMs (Groq).
*   **Premium UX:** A high-performance, responsive dashboard built with React and Tailwind CSS.

**Live Demo:** [subscription-analyzer.onrender.com](https://subscription-analyzer.onrender.com)

---

## 🏗️ Architecture

The backend has been engineered with **Clean Code** principles to ensure scalability and maintainability.

### Service Layer Design
*   **Controllers (Routes):** Thin layer handling HTTP requests and responses.
*   **Services:** Encapsulated business logic, validation, and data transformation.
*   **Data Access:** Robust Firebase integration with "Defense in Depth" error handling.

### Key Technical Features
*   **Defense in Depth:** Verification decorators (`@firebase_operation`) ensure data integrity and detailed audit logging.
*   **Systematic Debugging:** Structured logging and error tracing for rapid issue resolution.
*   **AI Integration:** Hybrid analysis combining deterministic stats with qualitative LLM insights.

### Tech Stack
| Component | Technology |
|-----------|------------|
| **Backend** | Python 3.13, Flask, Pandas, NumPy, Scikit-learn |
| **Frontend** | React 18, Vite, Tailwind CSS v4, Recharts, Framer Motion |
| **Database** | Google Firebase (Firestore) |
| **AI/ML** | Groq SDK (Llama 3), Linear Regression, K-Means Clustering |
| **DevOps** | Render (CI/CD), Gunicorn |

---

## ⚡ Getting Started

### Prerequisites
*   Python 3.10+
*   Node.js 18+

### Installation

```bash
# 1. Clone & Install Backend
cd backend
pip install -r requirements.txt

# 2. Install Frontend
cd ../dashboard
bun install  # or npm install
```

### Running Locally

```bash
# Terminal 1: Backend API
cd backend
python app.py

# Terminal 2: Frontend (Hot Reload)
cd dashboard
bun run dev
```

> **Note:** The backend automatically serves the production build of the frontend at generic routes if simpler deployment is desired.

---

## 💎 Core Features

1.  **Smart Dashboard:** Interactive charts showing monthly costs, category breakdown, and billing cycles.
2.  **Cost Predictions:** ML models forecast future spending based on historical trends.
3.  **AI Advisor:** "Ask the AI" for personalized savings strategies and subscription auditing.
4.  **Anomaly Detection:** Automatic alerts for unusual price hikes or duplicate subscriptions.
5.  **Professional Reports:** Exportable detailed analysis (PDF/images) for financial planning.

---

## 📜 License

MIT License. Created by [Nahuel Flores](https://github.com/nahuflores) - 2026.
