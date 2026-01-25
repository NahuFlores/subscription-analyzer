# 💳 Subscription Analyzer

A full-stack web application for tracking and analyzing recurring subscriptions using **Python**, **Data Science**, and **Machine Learning**.

![Python](https://img.shields.io/badge/Python-3.13-blue)
![Flask](https://img.shields.io/badge/Flask-3.1-green)
![Pandas](https://img.shields.io/badge/Pandas-2.3-orange)
![Scikit--learn](https://img.shields.io/badge/Scikit--learn-1.8-red)

## 🎯 Features

### 📊 **Data Analysis** (Pandas & NumPy)
- Comprehensive cost analysis and statistics
- Category-based breakdown
- Billing cycle analysis
- Anomaly detection using statistical methods

### 🤖 **Machine Learning** (Scikit-learn)
- **Linear Regression** for cost predictions (6-month forecast)
- **K-Means Clustering** for subscription grouping
- Unused subscription detection
- Cost efficiency metrics

### 📈 **Interactive Visualizations** (Plotly)
- Category cost pie charts
- Cost prediction trends
- Billing cycle comparisons
- Upcoming payment timelines

### 🔥 **Firebase Integration**
- Real-time database (Firestore)
- User authentication ready
- Scalable cloud storage

### 🎨 **Modern UI**
- Premium dark mode design
- Glassmorphism effects
- Smooth animations
- Fully responsive

## 🏗️ Architecture

### Object-Oriented Design
- **Inheritance**: `Subscription` → `MonthlySubscription`, `AnnualSubscription`, `CustomSubscription`
- **Polymorphism**: Different billing cycle calculations
- **Encapsulation**: Private attributes with property decorators
- **Factory Pattern**: `SubscriptionFactory` for object creation
- **Abstraction**: Abstract base classes

### Project Structure
```
subscription-analyzer/
├── backend/
│   ├── models/              # OOP classes
│   │   ├── user.py
│   │   ├── subscription.py  # Inheritance hierarchy
│   │   ├── category.py
│   │   └── alert.py
│   ├── analytics/           # Data analysis
│   │   ├── analyzer.py      # Pandas/NumPy
│   │   ├── predictor.py     # Scikit-learn ML
│   │   └── visualizer.py    # Plotly charts
│   ├── routes/              # Flask API
│   ├── utils/               # Firebase helper
│   ├── config.py
│   └── app.py               # Main Flask app
├── frontend/
│   ├── index.html
│   ├── dashboard.html
│   ├── css/
│   └── js/
└── requirements.txt
```

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- pip3

### Installation

1. **Clone/Navigate to project**
```bash
cd subscription-analyzer
```

2. **Install dependencies** (you already have them!)
```bash
pip3 install -r requirements.txt
```

3. **Set up environment** (Optional - for Firebase)
```bash
cp .env.example .env
# Edit .env and add your Firebase credentials path
```

4. **Run the application**
```bash
cd backend
python3 app.py
```

5. **Open your browser**
```
http://localhost:5000
```

## 📚 API Endpoints

### Subscriptions
- `GET /api/subscriptions?user_id=<id>` - Get all subscriptions
- `POST /api/subscriptions` - Create subscription
- `PUT /api/subscriptions/<id>` - Update subscription
- `DELETE /api/subscriptions/<id>` - Delete subscription

### Analytics
- `GET /api/analytics/summary?user_id=<id>` - Get analytics summary
- `GET /api/analytics/predictions?user_id=<id>` - Get ML predictions
- `GET /api/analytics/charts?user_id=<id>` - Get chart data
- `GET /api/analytics/insights?user_id=<id>` - Get AI insights

### Utilities
- `GET /api/health` - Health check
- `GET /api/categories` - Get all categories

## 🧪 Technologies Used

### Backend
- **Python 3.13** - Core language
- **Flask 3.1** - Web framework
- **Pandas 2.3** - Data manipulation
- **NumPy 2.3** - Numerical computing
- **Scikit-learn 1.8** - Machine learning
- **Matplotlib 3.10** - Static visualizations
- **Plotly 6.5** - Interactive charts
- **Firebase Admin 7.1** - Database

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling (Glassmorphism, Gradients)
- **JavaScript ES6+** - Interactivity
- **Plotly.js** - Chart rendering

## 💡 Key Concepts Demonstrated

### Data Science
✅ Data manipulation with Pandas DataFrames  
✅ Statistical analysis with NumPy  
✅ Data visualization with Matplotlib & Plotly  
✅ Feature engineering  
✅ Data cleaning and transformation  

### Machine Learning
✅ Linear Regression for predictions  
✅ K-Means clustering  
✅ Feature scaling with StandardScaler  
✅ Model training and prediction  
✅ Anomaly detection  

### Object-Oriented Programming
✅ Classes and objects  
✅ Inheritance hierarchy  
✅ Polymorphism  
✅ Encapsulation (private attributes, properties)  
✅ Abstraction (abstract base classes)  
✅ Design patterns (Factory)  

### Web Development
✅ RESTful API design  
✅ MVC architecture  
✅ Frontend-backend integration  
✅ Responsive design  
✅ Modern UI/UX  

## 🎓 Learning Outcomes

This project demonstrates:
1. **Full-stack development** with Python
2. **Data analysis** using Pandas and NumPy
3. **Machine learning** with Scikit-learn
4. **Object-oriented design** principles
5. **API development** with Flask
6. **Database integration** with Firebase
7. **Modern web UI** development

## 📝 Notes

- **Demo Mode**: Works without Firebase (data won't persist)
- **Firebase Setup**: Add credentials in `.env` for data persistence
- **Development**: Debug mode enabled by default
- **Production**: Set `FLASK_ENV=production` in `.env`

## 🔮 Future Enhancements

- [ ] User authentication with Firebase Auth
- [ ] Email notifications for upcoming payments
- [ ] Export reports to PDF/Excel
- [ ] Mobile app (React Native)
- [ ] More ML models (Random Forest, Neural Networks)
- [ ] Spending recommendations
- [ ] Integration with bank APIs

## 📄 License

MIT License - Feel free to use for learning and projects!

## 👨‍💻 Author

Built as a learning project to practice:
- Python programming
- Data analysis with Pandas/NumPy
- Machine Learning with Scikit-learn
- Object-Oriented Programming
- Web development with Flask

---

**Happy Analyzing! 💰📊**
