# 🌿 MindEase: The Digital Sanctuary

MindEase is a modern, comprehensive mental health and wellness platform designed to serve as an emotional sanctuary. By integrating advanced artificial intelligence, real-time community chat rooms, personalized check-in logs, and a dedicated wellness hub, MindEase helps users navigate their feelings, track their daily mental health journey, and find emotional support in moments of stress or distress.

---

## 📖 Table of Contents

1. [🌟 Core Concept & Value Proposition](#-core-concept--value-proposition)
2. [✨ Key Features & Functionality](#-key-features--functionality)
   - [Daily Emotional Check-Ins](#1-daily-emotional-check-ins)
   - [Empathetic AI Companion](#2-empathetic-ai-companion)
   - [Wellness Hub & Practices](#3-wellness-hub--practices)
   - [Toxicity Filter & Safety Logger](#4-toxicity-filter--safety-logger)
   - [SafetyNet Crisis Escalation](#5-safetynet-crisis-escalation)
   - [Interactive Analytics & Dashboard](#6-interactive-analytics--dashboard)
   - [Secure Firebase Authentication](#7-secure-firebase-authentication)
   - [Community Support Chat Rooms](#8-community-support-chat-rooms)
3. [🛠️ Technical Architecture & Stack](#%EF%B8%8F-technical-architecture--stack)
4. [📁 Directory Structure](#-directory-structure)
5. [⚙️ Installation & Configuration](#%EF%B8%8F-installation--configuration)
   - [Prerequisites](#prerequisites)
   - [Step 1: Clone and Install Dependencies](#step-1-clone-and-install-dependencies)
   - [Step 2: Environment Setup](#step-2-environment-setup)
   - [Step 3: Run the Application](#step-3-run-the-application)
6. [🔒 Security and Moderation](#-security-and-moderation)
7. [🤝 Contributing](#-contributing)
8. [📄 License](#-license)

---

## 🌟 Core Concept & Value Proposition

In a fast-paced digital world, **MindEase** acts as a gentle, quiet pause. The platform is designed around the philosophy of intentional wellness, providing users with space to reflect, speak, and rest. 

Unlike general chatbots or generic mental health logs, MindEase bridges the gap between **self-reflection and active support**:
- **Listen First:** Classified emotions determine what wellness exercises are recommended.
- **Support Language Locally:** Provides seamless support in both English and Tamil.
- **Safety First:** Instantly triggers support hotlines if severe distress or crisis indicators are detected.
- **Holistic Care:** Balances private reflection (meditation, journal, soundscapes) with social support (community chat rooms).

---

## ✨ Key Features & Functionality

### 1. Daily Emotional Check-Ins
- **Deep Tracking:** Users can log their overall mood, select specific physical symptoms (headache, fatigue, tension, etc.), rate their sleep quality, and choose underlying feelings (joy, anger, worry, calm).
- **Daily Gratitude Note:** Includes a space to quickly write down something they are thankful for, boosting positive psychology.
- **Dynamic Context:** Each check-in automatically saves to local history and updates the user's dashboard charts.

### 2. Empathetic AI Companion
- **Adaptive Memory:** The chat page provides a private AI therapist conversation powered by Google Gemini and Groq, utilizing conversation memory context (simulating LangChain history buffer).
- **Emotion Classification API:** Integrates with the Hugging Face multilingual emotion classification model (`tabularisai/multilingual-emotion-classification`) to map user input to 6 primary states: *Happy, Sad, Stressed, Angry, Tired, Neutral*.
- **Offline Local Fallback:** Uses an intelligent rule-based keyword analyzer to ensure immediate, uninterrupted emotional support even if external LLM APIs are offline.
- **Bilingual Interface:** Supports typing and AI-generation in native **Tamil** script and English.

### 3. Wellness Hub & Practices
- **Zen Breathing Exercises:** Interactive breathing bubble with visual and text feedback guiding users through breathing rhythms (Inhale, Hold, Exhale).
- **Guided Meditation Timer:** Customizable timers for calm, focus, and sleep with beautiful progress rings.
- **Atmospheric Soundscapes:** Built-in audio controller with toggles for relaxing sounds (Rain, Forest, Ocean, White Noise) to block out background distractions.
- **Gratitude Journal & Sleep Tracker:** Allows writing extensive personal journals and logging daily sleep durations.

### 4. Toxicity Filter & Safety Logger
- **Automated Censorship:** Scans community rooms and private AI chats for offensive keywords, slurs, or harassment.
- **Security Reporting:** Flags inappropriate behavior and writes automated violation logs directly to `reports.json` on the server for admin auditing.

### 5. SafetyNet Crisis Escalation
- **Immediate Warning Detection:** Inspects text messages for sustained negative sentiments or severe self-harm/suicidal ideation keywords.
- **Hotline Directories:** Overrides the general AI prompts to show direct national help numbers (e.g., AASRA India, US 988, UK 111) in both English and Tamil to guarantee user safety.

### 6. Interactive Analytics & Dashboard
- **Visual Trends:** Custom React charts highlighting weekly emotion breakdowns, sleep durations, and energy variations.
- **Wellness Score Card:** Tracks active streaks (consecutive days of practice) and logs completed activities.

### 7. Secure Firebase Authentication
- **Multi-Factor Support:** Integrates Google OAuth and SMS Phone OTP authentication to authenticate users safely and store settings.

### 8. Community Support Chat Rooms
- Focused, pre-populated, and user-active group discussion rooms:
  - 💼 *Workplace Stress*
  - 🧘 *Zen Breathing Practice*
  - 🕊️ *Grief Support Sanctuary*
  - 📝 *Gratitude Journal Swap*

---

## 🛠️ Technical Architecture & Stack

MindEase is built using a modern decoupled architecture:

### Frontend (Client-side)
* **Framework:** React 19 + TypeScript
* **Build System:** Vite
* **Styling:** Tailwind CSS + Vanilla CSS variables for modern theme consistency
* **Routing:** React Router DOM (v6)
* **Animations:** Framer Motion (for smooth micro-interactions and transitions)
* **Icons:** Lucide React + Material Symbols
* **Auth Provider:** Firebase Client SDK

### Backend (Server-side)
* **Runtime:** Node.js (Express framework)
* **AI Integration:** Google Generative AI SDK (`@google/generative-ai`) & Fetch APIs for Groq.
* **Emotion Inference:** Hugging Face Multilingual Emotion Classification Model
* **Data Store:** File-based local JSON banks (`activityBank.json`, `reports.json`) and temporary chat queues.

---

## 📁 Directory Structure

```
├── dist/                             # Compiled client-side assets for production deployment
├── public/                           # Static assets, fonts, and images
├── server-new/                       # Backend Node.js Express server
│   ├── services/
│   │   ├── activityBank.json         # Seed wellness and coping activities recommended by AI
│   │   └── emotionService.js         # Classifier handling Hugging Face APIs and local fallbacks
│   ├── .env                          # Backend keys (Gemini, Groq, Hugging Face)
│   ├── index.js                      # Main Express server router and safety controllers
│   ├── package.json
│   └── test.js                       # Integration and response diagnostics
├── src/                              # Frontend React Source Code
│   ├── components/
│   │   └── Layout.tsx                # Universal navbar, footer, and theme shell
│   ├── context/
│   │   ├── AuthContext.tsx           # Session management for user auth state
│   │   └── CheckInContext.tsx        # Local store for daily emotional history
│   ├── firebase/
│   │   └── firebase.ts               # Firebase initialization settings
│   ├── pages/                        # Page components for each screen
│   │   ├── ChatPage.tsx              # Private AI chat and public community channels
│   │   ├── CheckInPageNew.tsx        # Detailed check-in journal and questionnaires
│   │   ├── CrisisPage.tsx            # Emergency support hotlines and immediate resources
│   │   ├── DashboardPage.tsx         # User performance metrics, trends, and charts
│   │   ├── HomePageNew.tsx           # Brand landing page (The Digital Sanctuary)
│   │   ├── HomePageApp.tsx           # Logged-in user hub
│   │   ├── LoginPage.tsx             # Firebase phone OTP & Google login
│   │   ├── SignupPage.tsx            # New user account configuration
│   │   ├── ResourcesPage.tsx         # Therapeutic techniques, articles, and coping guides
│   │   └── WellnessPage.tsx          # Breath bubble, soundscape, journal, and meditation timer
│   ├── App.tsx                       # Client-side router configuration
│   ├── index.css                     # Global styles, variables, and Tailwind imports
│   └── main.tsx                      # Vite React mount
├── package.json                      # Workspace dependencies and commands
├── tailwind.config.js                # Design variables, fonts, and theme layout
└── tsconfig.json                     # TypeScript compiler configuration
```

---

## ⚙️ Installation & Configuration

### Prerequisites
Make sure you have [Node.js](https://nodejs.org) (v18 or higher) and [npm](https://www.npmjs.com/) installed on your machine.

---

### Step 1: Clone and Install Dependencies

1. Navigate to the project root directory and install frontend dependencies:
   ```bash
   npm install
   ```

2. Navigate into the `server-new` directory and install backend dependencies:
   ```bash
   cd server-new
   npm install
   cd ..
   ```

---

### Step 2: Environment Setup

#### Client Configuration
Create a `.env` file in the **root** folder:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

#### Server Configuration
Create a `.env` file in the **`server-new`** folder:
```env
PORT=5000
HF_TOKEN=your_huggingface_token
GEMINI_API_KEY=your_google_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.1-8b-instant
```
*Note: If `HF_TOKEN`, `GEMINI_API_KEY`, or `GROQ_API_KEY` are not set, the server will automatically default to local keyword classifiers and pre-designed local fallback prompts so the application remains functional.*

---

### Step 3: Run the Application

You can launch both the frontend and backend servers simultaneously:

1. **Start the Frontend Development Client:**
   In the root directory, run:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser to view the client application.

2. **Start the Backend Server:**
   In a separate terminal tab in the root directory, run:
   ```bash
   npm run server
   ```
   The backend server will spin up and listen on port `5000` (or your customized `PORT` in `.env`).

---

## 🔒 Security and Moderation

1. **Flagged Content:** User messages in community rooms or private conversations matching hostile content criteria trigger automatic reports stored locally inside `server-new/reports.json`.
2. **SafetyNet Interceptor:** In case of emergency, the server bypasses external APIs to avoid prompt manipulation or delays, responding immediately with national suicide and crisis intervention directory resources.
3. **Data Protection:** User inputs and check-ins are managed securely. Ensure database rules are applied properly in Firebase before moving to a production environment.

---

## 🤝 Contributing

Contributions make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the ISC License. See `LICENSE` or `package.json` for details.

*Developed with care to bring mental peace and clarity to digital spaces.* 🕊️