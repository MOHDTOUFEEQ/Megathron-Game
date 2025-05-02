# 🎮 Megathron

Megathron is a retro-style, Sega Genesis-inspired 8-bit shoot-and-run game built with *Vanilla JavaScript* & *HTML Canvas, wrapped in a **React.js* frontend and powered by *FastAPI* on the backend. It features two thrilling modes, AI-powered character creation, Solana-wallet authentication, and a competitive real-time leaderboard.


![Megathron Home Screen](https://drive.google.com/uc?export=view&id=16sfsccEKRRjw6og3AoNXcCYEl_HsuNFZ)


---

## 📹 Presentation Video

Watch the presentation on [YouTube](https://www.youtube.com/watch?v=T-1vgFneeRg).
---

## 🚀 Features

- 🕹 *Classic 8-bit Shoot & Run*  
  Vintage Sega Genesis aesthetics, sprite animations, and chiptune SFX.  
- 🔫 *Fight Mode*  
  Full campaign: run, dodge, shoot enemies, collect power-ups, and defeat the Final Boss.  
- 🏆 *Tournament Mode*  
  - *Solana Wallet* login for blockchain-based auth  
  - *Real-time Leaderboard* with MySQL backend  
  - *Prizes* for top scorers  
- 🧠 *AI-Powered Character Generator*  
  - Prompt-to-sprite via *DALL·E 3*  
  - Custom pixel-art avatars saved and loaded on demand  
- 🌐 *Tech Stack*  
  - *Frontend:* React (Vite) + HTML5 Canvas + Vercel  
  - *Backend:* FastAPI (main.py) + ngrok  
  - *Database:* MySQL  
  - *AI/LLM:* DALL·E 3 for sprite generation  
  - *Blockchain Auth:* Solana wallet (Tournament Mode)

---

## 🎮 Game Controls

Control your character using classic keyboard & mouse inputs:

| Key                 | Function            |
|---------------------|---------------------|
| `W`                 | Move Up             |
| `A`                 | Move Left           |
| `S`                 | Move Down           |
| `D`                 | Move Right          |
| Right Mouse Click   | Fire Weapon         |

---

## 📋 Prerequisites

- *Node.js* ≥ v14  
- *npm* or *yarn*  
- *Python* ≥ 3.9  
- *pip* (for FastAPI deps)  
- *MySQL* server  
- *ngrok* CLI (for backend demo)  
- *Solana Wallet* (e.g. Phantom) for Tournament Mode  

---

## ⚙ Installation & Usage


### 1. Clone repo
```bash
git clone https://github.com/MOHDTOUFEEQ/Megathron-Game.git
cd Megathron-Game
```

### 2. Backend setup
```bash
cd Backend
python3 -m venv env
source env/bin/activate            # macOS/Linux
.\env\Scripts\activate           # Windows
pip install -r requirements.txt

#### Start Backend server
python main.py
```


### 3. Frontend setup
```bash
cd ../Frontend
npm install
npm run dev                        # starts Vite on localhost:3000
```

### 4. Web3 auth UI
```bash
cd web3
npm install && npm run dev
```



## Project Structure
```bash
Megathron/
├── Backend/                       # FastAPI backend (AI, auth, leaderboard)
│   ├── env/                       # Python venv & .env
│   ├── static/
│   │   └── images/
│   │       └── homescreen.png
│   ├── requirements.txt
│   └── main.py                    # FastAPI entrypoint
│
├── Frontend/                      # React + Canvas game UI
│   ├── public/                    # static assets
│   ├── src/                       # React source code
│   ├── .env
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── web3/                          # Solana-wallet auth & tournament UI
│   ├── node_modules/
│   ├── public/                    # (if any public assets)
│   ├── src/                       # React or JS source for wallet flows
│   ├── .env                       # SOLANA_RPC, API keys, etc.
│   ├── package.json
│   ├── package-lock.json
│   └── index.js                   # Entry point
│
└── README.md    
```


## 🛠 How It Works

### 🎨 Frontend (React + Canvas)
- *Game Engine:* Vanilla JS + HTML Canvas  
- *Mode Switch:* UI toggles between Fight and Tournament  
- *Wallet Auth:* Integrates Solana Web3.js for wallet login (Tournament only)  
- *API Calls:*  
  - POST /api/generate-character → DALL·E 3 prompts  
  - GET/POST /api/leaderboard → fetch & post scores  

### ⚙ Backend (FastAPI)
- *AI Agent*  
  - Receives character-prompt  
  - Calls OpenAI’s DALL·E 3 API  
  - Saves sprite to Appwrite Cloud Storage 
- *Auth Agent*  
  - Verifies Solana wallet signature  
  - Issues session token  
- *Game Logic API*  
  - POST /scores → submit score  
  - GET /scores  → retrieve leaderboard  

### 🧬 AI-Powered Character Generation
- *Input:* text prompt  
- *Process:* FastAPI → DALL·E 3 → pixel-art image  
- *Output:* JSON payload with sprite URL  

### 🔐 Solana-Wallet Authentication
- Tournament Mode only  
- Wallet connect & sign message  

### 🏅 Leaderboard System
- *Storage:* MySQL (users & scores)  
- *Flow:*  
  - User finishes game → score sent via API  
  - Backend inserts/updates MySQL  
  - Frontend polls /scores for real-time updates
