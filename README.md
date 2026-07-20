# 💰 Crypto What-If

Ever wondered what would happen if you bought ₹10,000 worth of Bitcoin on January 1st, 2021 instead of keeping it in a savings account? 

**Crypto What-If** is a full-stack web application that lets you calculate hypothetical cryptocurrency returns based on historical price data, compare multiple coins side-by-side in a battle mode, and store calculation history in MongoDB Atlas.

---

## ✨ Features

- **🧮 Single-Coin Calculator**: Input any crypto symbol (BTC, ETH, DOGE, SOL, etc.), pick a past date, and enter an amount in INR to see your exact units bought, current value, profit/loss, and ROI.
- **⚔️ Multi-Coin Battle**: Compare up to 3 coins for the exact same date and investment amount. Includes a visual bar chart powered by Recharts and automatically highlights the winning coin with the highest return.
- **📜 Public History**: Saves every calculation into a shared MongoDB Atlas collection, sorted by most recent first.
- **📚 Interactive API Docs (Swagger)**: Fully documented REST API endpoints accessible live at `/api/docs`.

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: React 19 + Vite
- **Data Visualization**: Recharts (for multi-coin comparison bar charts)
- **Styling**: Modern Slate Dark Mode CSS with full mobile responsiveness

### **Backend**
- **Runtime**: Node.js + Express (MVC Architecture)
- **Database**: MongoDB Atlas (via Mongoose ODM)
- **External API**: CoinLayer Historical & Live Crypto Price Feed
- **Documentation**: Swagger UI (`swagger-ui-express` + `swagger-jsdoc`)

### **DevOps & Tooling**
- **CI/CD**: GitHub Actions pipeline for automated linting & build checks (`.github/workflows/ci.yml`)
- **Containers**: Docker Compose configuration (`docker-compose.yml`)

---

## 📁 Project Structure

```text
Crypto-What-If/
├── .github/
│   └── workflows/
│       └── ci.yml             # GitHub Actions CI/CD workflow
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB Atlas connection helper
│   ├── controllers/           # Business logic (calculate, history, compare)
│   ├── middleware/            # Global error handling
│   ├── models/                # Mongoose Calculation schema
│   ├── routes/                # Express API routes
│   ├── services/              # CoinLayer API integration layer
│   ├── swagger/               # OpenAPI / Swagger configuration
│   ├── app.js                 # Express app configuration
│   ├── server.js              # Server entry point & Vercel handler
│   ├── vercel.json            # Serverless deployment configuration
│   ├── .env.example           # Environment template
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Main React UI (Calculator, History, Compare tabs)
│   │   ├── index.css          # Slate dark theme design system
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── docker-compose.yml
```

---

## 🚀 Quick Start (Local Setup)

### Prerequisites
- **Node.js**: v18 or higher
- **CoinLayer API Key**: Free API key from [CoinLayer](https://coinlayer.com/)
- **MongoDB Atlas URI**: Connection string from MongoDB Cloud

### 1. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```env
COINLAYER_API_KEY=your_coinlayer_key_here
MONGODB_URI=your_mongodb_atlas_connection_string
PORT=3000
NODE_ENV=development
```

Start the backend server:
```bash
npm start
```
> Server runs at `http://localhost:3000`  
> Swagger API documentation available at `http://localhost:3000/api/docs`

### 2. Frontend Setup
Open a second terminal window:
```bash
cd frontend
npm install
npm run dev
```
> Frontend runs at `http://localhost:5173`

---

## 📚 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/calculate` | Calculate single coin hypothetical return & save to DB |
| `GET` | `/api/history` | Fetch paginated public calculation history |
| `POST` | `/api/compare` | Compare up to 3 coins sequentially & rank by ROI |
| `GET` | `/api/docs` | Interactive Swagger UI API documentation |

---

## 💡 Common Mistakes & Hurdles When Building This (And How to Solve Them)

Building a full-stack app that integrates third-party financial APIs, databases, and serverless deployments often comes with unexpected roadblocks. Here are the most common issues faced during development and their solutions:

### 1. **Third-Party API Rate Limits (HTTP 429 / Failed Requests)**
- **The Problem**: Free tier API keys (like CoinLayer) restrict requests per second. Making historical and live price calls simultaneously caused `429 Too Many Requests` or empty price responses.
- **The Solution**: Implemented a lightweight delay helper (`await new Promise(r => setTimeout(r, 1000))`) between consecutive API calls in `coinlayer.service.js` to ensure the server never breaches rate limits.

### 2. **CORS (Cross-Origin Resource Sharing) Errors in React**
- **The Problem**: Browser blocked requests from the Vite frontend (`http://localhost:5173`) to the Express backend (`http://localhost:3000`).
- **The Solution**: Enabled `cors()` middleware at the top of `app.js` and used environment variables (`import.meta.env.VITE_API_URL`) to seamlessly switch between local dev ports and production backend URLs.

### 3. **Serverless Function Timeouts on Vercel (10-Second Limit)**
- **The Problem**: Vercel free tier limits serverless function execution time to 10 seconds. Comparing 5+ coins sequentially requires multiple historical and live API calls, causing Vercel functions to time out.
- **The Solution**: Capped the multi-coin battle endpoint (`/api/compare`) to a maximum of 3 coins per request and handled single coin failures gracefully without failing the entire batch response.

### 4. **Exhausting MongoDB Connections in Serverless Environments**
- **The Problem**: In serverless deployments (Vercel/AWS Lambda), every incoming request can spin up a new node process. Opening `mongoose.connect()` on every request quickly exhausts database connection limits.
- **The Solution**: Built a cached database connection helper in `config/db.js` that checks `isConnected` state before attempting to connect, reusing existing connections across cold starts.

### 5. **Accidentally Exposing API Keys & Database Credentials on GitHub**
- **The Problem**: Hardcoding API keys or database passwords in code risks getting leaked publicly when pushing to GitHub.
- **The Solution**: Added `.env` and `.env.local` to `.gitignore` and committed `.env.example` templates containing placeholders so collaborators know which environment variables are required.

---

## 📜 License

MIT License — Feel free to use this project for learning or building your own portfolio!
