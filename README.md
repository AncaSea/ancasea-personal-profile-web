# 🚀 AI-Powered Personal Profile & Admin Dashboard

A futuristic, high-performance personal portfolio website built with modern web technologies. It features a stunning glassmorphism landing page and a secure, hidden Admin Dashboard powered by Supabase and Gemini AI.

## ✨ Features

- **Futuristic UI/UX**: Smooth parallax scrolling, glassmorphism design, and dynamic hover effects using TailwindCSS.
- **Hidden Admin Login**: No boring `/login` links! Access the admin portal via a secret "Easter Egg" (clicking the hero name 3 times).
- **Secure Authentication**: Powered by Supabase Google OAuth with strict sign-up blocking (only authorized Google accounts can enter).
- **AI CV Extractor**: Upload a PDF CV/Resume, and **Gemini 1.5 Flash AI** will automatically parse and populate your Experiences, Skills, Educations, and Projects directly into the database.
- **Markdown Blog Engine**: Built-in markdown editor to write, draft, and publish articles seamlessly.
- **AI Analytics**: Beautiful Recharts-powered dashboard to monitor Gemini API token usage over time.

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TailwindCSS, Lucide Icons, Recharts.
- **Backend & Database**: Supabase (PostgreSQL), Prisma ORM.
- **AI Integration**: Google Gen AI SDK (Gemini 1.5 Flash).
- **Deployment**: Vercel.

## 🚀 Getting Started Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/ancasea-portfolio.git
   cd ancasea-portfolio
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory and add the following:
   ```env
   # Connect to Supabase via connection pooling with Supavisor.
   DATABASE_URL="postgres://postgres.[YOUR_PROJECT_REF]:[YOUR_PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
   
   # Direct connection to the database. Used for migrations.
   DIRECT_URL="postgres://postgres.[YOUR_PROJECT_REF]:[YOUR_PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

   NEXT_PUBLIC_SUPABASE_URL="https://[YOUR_PROJECT_REF].supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

   GEMINI_API_KEY="your-google-gemini-api-key"
   ```

4. **Run Prisma Migrations:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📄 License

This project is open-sourced under the [MIT License](LICENSE).