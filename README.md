# 🚀 Career Copilot (AI Resume Adapter)

## 📌 Overview
Career Copilot is a full-stack, AI-powered web application designed to help job seekers instantly tailor their resumes to specific job descriptions. By leveraging Generative AI, it analyzes the target vacancy and rewrites the user's base resume to highlight the most relevant skills and experience, significantly improving ATS (Applicant Tracking System) compatibility. 

The final tailored resume can be instantly exported as a perfectly formatted, ATS-friendly PDF.

🌐 **Live Demo:** [cv.wealthifai.xyz](https://cv.wealthifai.xyz) *(Self-hosted on a Raspberry Pi 5)*

## ✨ Key Features
* **🧠 AI-Powered Tailoring:** Compares a base resume with a job description to generate a highly targeted, ATS-optimized Markdown resume.
* **📄 Bulletproof PDF Export:** Custom-built Python backend using `fpdf2` that flawlessly converts Markdown into a clean, professional, and ATS-readable PDF (handling complex formatting, margins, and lists without breaking).
* **🐳 Fully Containerized:** Both frontend and backend are Dockerized for seamless deployment across any environment.
* **☁️ Secure Zero Trust Deployment:** Hosted locally on an ARM64 architecture (Raspberry Pi 5) and securely exposed to the public internet using Cloudflare Tunnels, bypassing the need for open router ports.

## 🛠️ Tech Stack
**Frontend:**
* React.js (Vite)
* Tailwind CSS (for responsive UI)

**Backend:**
**Backend:**
* Python 3.11+
* FastAPI (High-performance API framework)
* `fpdf2` (Custom PDF generation engine)
* Google Gemini API (Generative AI integration)
* **Google Embeddings** (Semantic matching & text vectorization)

**DevOps & Infrastructure:**
* Docker & Docker Compose
* Raspberry Pi 5 (Ubuntu/Debian ARM64)
* Cloudflare Zero Trust (Tunnels)

## 🏗️ Architecture & Flow
1. **User Input:** The user pastes a job vacancy and their base resume via the React frontend.
2. **Semantic Analysis:** The backend utilizes **Google Embeddings** to semantically map and compare the candidate's existing skills with the core requirements of the job description.
3. **AI Generation:** FastAPI securely communicates with the Gemini AI model to generate a tailored, ATS-optimized Markdown response based on the semantic match.
4. **Rendering:** The frontend displays the tailored text, allowing the user to review the results in real-time.
5. **PDF Generation:** Upon export, the backend recalculates layout effective page widths (EPW) and dynamically renders a PDF using a custom script that handles page breaks and Markdown parsing.

## 🚀 How to Run Locally

### Prerequisites
* Docker & Docker Compose
* Gemini API Key

### Steps
1. Clone the repository:
   ```bash
   git clone [https://github.com/Rork96/career-copilot.git](https://github.com/Rork96/career-copilot.git)
   cd career-copilot

   Create a .env file in the api/ directory and add your API key:

Code snippet
GEMINI_API_KEY=your_api_key_here
Build and start the containers:

Bash
docker compose up -d --build
Access the app at http://localhost:5173

## 💡 Beginner's FAQ: AI, API Keys, and Costs

**Wait, is this really free?**
Yes! This project uses the **Google Gemini API**, which currently offers a very generous free tier for developers and individuals. As long as you stay within the free limits, you can tailor hundreds of resumes without spending a single dime.

**What is an API Key?**
Think of an API Key as a secure digital "ID badge" or a VIP pass for your application. It simply tells Google: *"Hey, allow this app to talk to your AI."* It takes 2 minutes to get one, and it's completely free to generate in the [Google AI Studio](https://aistudio.google.com/).

**What are "Tokens"?**
You might hear the word "tokens" when dealing with AI. Tokens are basically how the AI counts words (1 token is roughly 3/4 of a word). 
* **Input Tokens:** The words in your base resume and the job vacancy.
* **Output Tokens:** The newly generated, tailored resume.
The Gemini free tier gives you millions of tokens per month, which is more than enough to conquer the job market!

👨‍💻 Author
Pavlo Tsyhanash

IT Support / Network Enthusiast

[LinkedIn Placeholder]

Winnipeg, MB, Canada


---
