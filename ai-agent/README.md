#  RepoPilot — AI-Powered Code Review Platform

RepoPilot is a code review platform designed to help developers identify potential code issues, understand their severity, and discover suggested improvements. It combines a React frontend, a Spring Boot backend, and a Python-based analysis agent built with LangGraph.

##  Features

- **Code Editor:** Paste or write code directly in the web interface.
- **Automated Code Analysis:** Analyze submitted code and identify configured code patterns.
- **Severity Classification:** Organize findings by severity, such as High, Medium, and Low.
- **Suggested Fixes:** Display recommendations alongside detected findings.
- **Review History:** Revisit reviews during the current frontend session.
- **JSON Export:** Copy review results in JSON format.
- **File Upload:** Load supported source-code files into the editor.

##  Tech Stack

| Component | Technology |
|---|---|
| Frontend | React, Vite, JavaScript |
| UI Icons | Lucide React |
| Backend | Java, Spring Boot |
| AI Agent Service | Python, FastAPI, LangGraph |
| Communication | HTTP, JSON |

##  Architecture

```text
┌─────────────────────────┐
│    React + Vite UI      │
│    localhost:5173       │
└────────────┬────────────┘
             │ POST /api/ai-review
             ▼
┌─────────────────────────┐
│   Spring Boot Backend   │
│    localhost:8080       │
└────────────┬────────────┘
             │ POST /review
             ▼
┌─────────────────────────┐
│ Python + LangGraph      │
│ FastAPI: localhost:8000 │
└─────────────────────────┘
```

The frontend sends source code to the Spring Boot backend. The backend forwards the request to the Python analysis service, which processes the code and returns findings for display in the UI.

## 📁 Project Structure

```text
RepoPilot/
├── backend/                # Spring Boot REST API
├── ai-agent/               # Python analysis agent
└── RepoPilot-frontend/      # React + Vite application
```

## ⚙️ Getting Started

### Prerequisites

Install the following tools before running the project:

- Java Development Kit (JDK)
- Node.js and npm
- Python
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/RepoPilot.git
cd RepoPilot
```

Replace `YOUR-USERNAME` with your GitHub username.

### 2. Start the Python Agent

Open a terminal in the `ai-agent` directory:

```powershell
.\.venv\Scripts\python.exe -m uvicorn main:app --port 8000
```

Keep this terminal running.

If the virtual environment is not present, create it and install the dependencies listed in your project's dependency file before starting the service.

Health check:

```text
http://localhost:8000/health
```

### 3. Start the Spring Boot Backend

Open another terminal:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

The backend runs on port `8080` by default.

### 4. Start the Frontend

Open another terminal:

```powershell
cd RepoPilot-frontend
npm install
npm run dev
```

Open the local URL printed by Vite in your terminal. It is usually `http://localhost:5173`, but the port may differ if that port is already in use.

##  Testing the Application

1. Start all three services.
2. Open the frontend in your browser.
3. Enter or load a code sample.
4. Click **Review Code**.
5. Inspect the detected findings, severity levels, and suggested fixes.
6. Copy the results as JSON if needed.

##  Roadmap

- [x] React-based code review dashboard
- [x] Spring Boot REST API integration
- [x] Python analysis service integration
- [x] Initial rule-based code checks
- [ ] Connect GitHub repositories
- [ ] Review commits and pull requests automatically
- [ ] Expand language and rule support
- [ ] Improve analysis with an LLM-powered agent
- [ ] Add automated tests and richer review reports

## Security Notes

- Do not commit API keys, passwords, access tokens, or `.env` files.
- Keep virtual environments, dependency folders, and generated build files out of version control.
- Review code carefully before applying suggested fixes.
- This project is under active development; analysis results depend on the rules and agent capabilities currently implemented.

##  Author

Samruddhi dilip kulkarni

GitHub: 
https://github.com/samruddhikulkarni467-ux
