# Evidence-Grounded AI Academic Research Agent

A production-ready full-stack academic research application inspired by the limitations and future directions identified in the research survey: **"Deep Research: A Survey of Autonomous Research Agents"**.

---

## 🌟 Overview & Key Innovations

This project implements an autonomous academic research agent designed to systematically overcome the core limitations of existing LLM search workflows:

1. **Multi-Tool Integration**: Provider interfaces for concurrent querying across arXiv, Semantic Scholar, OpenAlex, and Crossref.
2. **Factuality & Citation Verification**: Automated grounding service that checks generated claims against extracted paper evidence snippets, categorizing claims as `Supported`, `Inferred`, or `Uncertain`.
3. **Multimodal Reasoning**: Full-text section segmentation (Abstract, Introduction, Methodology, Results, Conclusion) and detection of figure captions & table structures.
4. **Adaptive Workflow Design**: 12-stage state machine (Planning → Search → Filtering → Extraction → Verification → Comparison → Gap Detection → Survey Synthesis).
5. **Efficient Optimization**: Levenshtein distance string similarity deduplication and term-frequency relevance scoring.
6. **Personalization**: User profile tracking research interests, domain focus, and saved paper libraries.
7. **Candidate Research-Gap Detection**: Automatic identification of unaddressed paper limitations and formulation of candidate future research directions.
8. **Paper Comparison & Literature Survey Generation**: Interactive side-by-side paper comparison matrices and structured 11-section survey generation with explicit citation anchors.

---

## 🛠️ Technology Stack

### Monorepo Structure
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS v3, React Router v6, Axios, Lucide Icons
- **Backend**: Node.js, Express, TypeScript, Mongoose (MongoDB Atlas), JWT, bcryptjs, pdf-parse, Vitest
- **Shared Package**: `@research-agent/shared` containing unified domain contracts

---

## 📂 Project Folder Structure

```text
/
├── frontend/                   # React Vite TypeScript Web Application
│   ├── src/
│   │   ├── components/         # Common badges, Paper cards, Gap cards, Navbar, Footer
│   │   ├── context/            # AuthContext with JWT persistence
│   │   ├── pages/              # 13 Application views
│   │   ├── services/           # Axios client with request/response interceptors
│   │   ├── App.tsx             # Protected routing configuration
│   │   └── main.tsx
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── backend/                    # Express Node.js TypeScript API
│   ├── src/
│   │   ├── config/             # Environment & MongoDB Atlas connection
│   │   ├── controllers/        # Auth, Research, Paper, User controllers
│   │   ├── middleware/         # Auth JWT token verification & Error handler
│   │   ├── models/             # Mongoose schemas (User, Paper, Session, SavedPaper, Report)
│   │   ├── providers/          # Academic adapters (arXiv, Semantic Scholar, OpenAlex, Crossref)
│   │   ├── routes/             # REST endpoints (/api/auth, /api/research, /api/papers, /api/user)
│   │   ├── services/research/  # Pipeline modules (Planner, Search, Deduplication, Ranking, Verification...)
│   │   └── server.ts           # Express app entry point
│   └── tests/                  # Vitest unit & API service tests
│
├── packages/
│   └── shared/                 # Shared TypeScript types & interfaces
│
├── .env.example
├── package.json
└── README.md
```

---

## ⚙️ Environment Variables Setup

Create a `.env` file in the root directory (or separate `.env` files in `frontend/` and `backend/`):

```env
# Backend Environment
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/evidence_research_agent?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Optional API Keys (Free public endpoints operate without keys if left blank)
SEMANTIC_SCHOLAR_API_KEY=
OPENAI_API_KEY=

# Frontend Environment
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 🚀 Local Development Setup

### 1. Install Dependencies
In the root directory, run:
```bash
npm install
```

### 2. Build Shared Package
```bash
npm run build --workspace=packages/shared
```

### 3. Run Backend & Frontend Concurrently
```bash
npm run dev
```
- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000/api`
- **API Health Check**: `http://localhost:5000/api/health`

---

## 🍃 MongoDB Atlas Setup

1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Under **Database Access**, create a database user with password credentials.
3. Under **Network Access**, add `0.0.0.0/0` (or your deployment IP) to the IP Access List.
4. Copy your connection string into `MONGODB_URI` in `.env`.

---

## 📡 Key REST API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/signup` - Register a new researcher account
- `POST /api/auth/login` - Authenticate and receive JWT token
- `POST /api/auth/logout` - Logout session
- `GET /api/auth/me` - Fetch authenticated user profile

### Research Pipeline (`/api/research`)
- `POST /api/research/start` - Initialize new adaptive research session
- `GET /api/research/status/:id` - Poll real-time progress and stage logs
- `GET /api/research/history` - Fetch all past completed research sessions
- `GET /api/research/stats` - Get summary statistics (sessions, verified claims, saved papers)
- `POST /api/research/compare` - Generate side-by-side comparative matrix
- `GET /api/research/:id` - Fetch full research details, report, and candidate gaps

### Papers Library (`/api/papers`)
- `GET /api/papers/saved` - List bookmarked papers
- `POST /api/papers/:paperId/save` - Save paper to personal library
- `DELETE /api/papers/:paperId/save` - Remove paper from saved library
- `GET /api/papers/:id` - Fetch paper details and extracted PDF sections

---

## 🧪 Testing

Run backend service tests with Vitest:
```bash
npm run test --workspace=backend
```

---

## 🌐 Production Build & Deployment

### Build Command
```bash
npm run build
```

### Frontend Deployment (Vercel / Netlify)
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variable**: Set `VITE_API_BASE_URL` to your production backend API URL.

### Backend Deployment (Render / Railway / Heroku / AWS)
- **Root Directory**: `backend`
- **Build Command**: `npm run build`
- **Start Command**: `npm run start`
- Set environment variables `MONGODB_URI`, `JWT_SECRET`, and `PORT`.

---

## ⚖️ Limitations & Ethical Access

- **Paywalled Literature**: Papers restricted by commercial paywalls are indexed strictly via open metadata, DOIs, and abstracts. The agent provides legitimate publisher links and never attempts to bypass access controls.
- **Visual Chart Parsing**: Table and figure extraction relies on PDF caption metadata and structured OCR text segmentation.

---

## 🔮 Future Improvements

1. Direct integration with vision-language models (e.g., Gemini 1.5 Pro / GPT-4o) for vector diagram decoding.
2. Real-time peer-review feedback simulation during research query decomposition.
