# Subscription Analyzer

> A full-stack analytics platform for tracking recurring subscriptions, powered by Python data science and modern React.

![Python](https://img.shields.io/badge/Python-3.13-blue?style=flat-square)
![Flask](https://img.shields.io/badge/Flask-3.1-green?style=flat-square)
![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square)
![Pandas](https://img.shields.io/badge/Pandas-2.3-orange?style=flat-square)
![Scikit--learn](https://img.shields.io/badge/Scikit--learn-1.8-red?style=flat-square)

---

## Overview

This application combines **data science**, **machine learning**, and **premium UI design** to help users analyze and optimize their subscription spending. Built with a focus on clean architecture, performance, and user experience.

**Demo:** Run locally with `python app.py` (see Getting Started)

---

## Core Features

### Analytics & Insights
- Real-time cost analysis with Pandas and NumPy
- Category-based spending breakdown
- Billing cycle comparisons
- Statistical anomaly detection
- 6-month cost forecasting using Linear Regression

### Machine Learning
- Cost prediction models with confidence intervals
- K-Means clustering for subscription grouping
- Unused subscription detection
- Automated spending insights

### Visualizations
- **Interactive Charts** - Recharts-powered dashboard with smooth animations
- **Professional Reports** - Matplotlib/Seaborn static visualizations for export
- Monthly cost trends with percentage indicators
- Category distribution analysis
- Upcoming payment timeline

### User Experience
- Glassmorphism design with backdrop blur
- Fluid animations using Framer Motion and Anime.js
- Skeleton loading states
- Silent data refresh (no jarring page reloads)
- Fully responsive, mobile-first design
- Tab navigation between Dashboard and Reports

---

## Tech Stack

### Backend
```
Python 3.13
├── Flask 3.1          # RESTful API
├── Pandas 2.3         # Data analysis
├── NumPy 2.3          # Numerical computing
├── Scikit-learn 1.8   # Machine learning
├── Matplotlib 3.10    # Static visualizations
├── Seaborn 0.13       # Statistical plots
└── Firebase Admin     # Cloud database
```

### Frontend
```
React 18.3
├── Vite 7.3           # Build tool
├── Tailwind CSS v4    # Styling
├── Recharts 2.15      # Interactive charts
├── Framer Motion 12   # Page transitions
├── Anime.js 3.2       # Advanced animations
└── React Router 7     # Client routing
```

---

## Architecture

### Object-Oriented Design
The backend follows clean OOP principles with a well-structured inheritance hierarchy:

```python
Subscription (Abstract Base)
├── MonthlySubscription
├── AnnualSubscription
└── CustomSubscription
```

**Design Patterns:**
- Factory Pattern for object creation
- Encapsulation with property decorators
- Polymorphism for billing calculations
- Singleton pattern for database connections

### Project Structure
```
subscription-analyzer/
├── backend/
│   ├── models/              # Domain models
│   ├── analytics/           # Data science & ML
│   │   ├── analyzer.py      # Pandas analysis
│   │   ├── predictor.py     # ML models
│   │   └── report_generator.py  # Matplotlib/Seaborn
│   ├── routes/              # API endpoints
│   └── utils/               # Firebase & storage
│
└── dashboard/
    ├── src/
    │   ├── components/      # React components
    │   ├── hooks/           # Custom hooks
    │   └── layouts/         # Page layouts
    └── public/              # Static assets
```

---

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- Bun or npm

### Installation

```bash
# Install backend dependencies
pip3 install -r requirements.txt

# Install frontend dependencies
cd dashboard && bun install

# Build frontend (production)
bun run build
```

### Running

**Development:**
```bash
# Terminal 1 - Backend
cd backend && python app.py

# Terminal 2 - Frontend (optional, hot reload)
cd dashboard && bun run dev
```

**Production:**
```bash
# Build first
cd dashboard && bun run build

# Run backend (serves built frontend)
cd ../backend && python app.py
```

Open `http://localhost:5000/dashboard`

---

## API Reference

### Subscriptions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/subscriptions?user_id=<id>` | List all subscriptions |
| POST | `/api/subscriptions` | Create subscription |
| GET | `/api/subscriptions/<id>` | Get single subscription |
| PUT | `/api/subscriptions/<id>` | Update subscription |
| DELETE | `/api/subscriptions/<id>` | Delete subscription |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/summary?user_id=<id>` | Analytics summary |
| GET | `/api/analytics/predictions?user_id=<id>` | ML predictions |
| GET | `/api/analytics/charts?user_id=<id>` | Chart data |
| GET | `/api/analytics/insights?user_id=<id>` | AI insights |
| GET | `/api/analytics/report?user_id=<id>&type=<type>` | Professional reports |

---

## Key Concepts

### Data Science
- Data manipulation with Pandas DataFrames
- Statistical analysis and aggregations
- Time series forecasting
- Feature engineering
- Data visualization pipelines

### Machine Learning
- Supervised learning (Linear Regression)
- Unsupervised learning (K-Means Clustering)
- Feature scaling and normalization
- Model training and evaluation
- Prediction confidence intervals

### Modern Web Development
- Component-based architecture
- Custom React hooks for state management
- RESTful API design
- Performance optimization (Lighthouse)
- Responsive design patterns
- Smooth animations and transitions

---

## Performance

- **Lighthouse Score:** 95+ across all metrics
- **Bundle Size:** Optimized with code splitting
- **Images:** WebP format with preload hints
- **Fonts:** Preloaded with `font-display: swap`
- **API:** Silent data refresh without loading states

---

## Configuration

### Firebase Setup (Optional)
```bash
cp .env.example .env
# Add your Firebase credentials path
```

**Demo Mode:** Works out-of-the-box with in-memory storage (no Firebase required)

---

## Deployment

### Deploy to Render

This project is configured for seamless deployment on [Render](https://render.com) using GitHub integration.

#### Prerequisites
- GitHub account with your repository
- Render account (free tier available)

#### Step-by-Step Guide

**1. Push to GitHub**
```bash
git add .
git commit -m "Add Render deployment configuration"
git push origin main
```

**2. Create New Web Service on Render**
- Go to [Render Dashboard](https://dashboard.render.com)
- Click **"New +"** → **"Web Service"**
- Connect your GitHub repository
- Render will automatically detect `render.yaml`

**3. Configure Environment Variables**

In Render dashboard, add these environment variables:

| Variable | Value | Required |
|----------|-------|----------|
| `PYTHON_VERSION` | `3.13.0` | Yes |
| `FLASK_ENV` | `production` | Yes |
| `SECRET_KEY` | `your-secret-key-here` | Yes |
| `FIREBASE_CREDENTIALS_PATH` | `/etc/secrets/firebase.json` | Optional |

> **Note:** For Firebase, use Render's [Secret Files](https://render.com/docs/secret-files) feature to upload your credentials JSON.

**4. Deploy**
- Click **"Create Web Service"**
- Render will automatically:
  - Run `build.sh` (installs dependencies + builds dashboard)
  - Start the app with Gunicorn
  - Provide you with a live URL

**5. Verify Deployment**
- Visit `https://your-app.onrender.com/api/health`
- Should return: `{"status": "healthy", "version": "1.0.0"}`
- Access dashboard at: `https://your-app.onrender.com/dashboard`

#### Automatic Deployments

Every push to your `main` branch will trigger an automatic deployment on Render.

#### Troubleshooting

**Build fails:**
- Check build logs in Render dashboard
- Ensure `dashboard/package.json` has valid dependencies
- Verify Python version matches `PYTHON_VERSION` env var

**Dashboard shows 503 error:**
- Build script may have failed
- Check that `dashboard/dist` was created during build
- Review build logs for npm errors

**CORS errors:**
- Set `RENDER_EXTERNAL_URL` environment variable to your Render URL
- Example: `https://your-app.onrender.com`

**Firebase not working:**
- Verify `FIREBASE_CREDENTIALS_PATH` points to correct secret file
- Check Render logs for Firebase initialization errors

---

## Development Notes

- **Debug Mode:** Enabled by default in development
- **Production:** Set `FLASK_ENV=production` in `.env`
- **Port:** Backend runs on `http://localhost:5000`
- **CORS:** Configured for local development

---

## Future Roadmap

- User authentication with Firebase Auth
- Email notifications for upcoming payments
- PDF/Excel report exports
- Multi-currency support
- Bank API integration (Plaid)
- Mobile app (React Native)
- Advanced ML models (Random Forest, LSTM)
- Browser extension for auto-detection

---

## License

MIT License - Free to use for learning and projects.

---

## About

Built as a comprehensive learning project to demonstrate proficiency in:
- Full-stack development
- Data science and machine learning
- Object-oriented programming
- Modern React development
- UI/UX design and animations
- Performance optimization

**Author:** Nahuel Flores  
**Year:** 2026
