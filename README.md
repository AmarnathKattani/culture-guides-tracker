# Culture Guides Tracker

A gamified activity tracking platform for Salesforce Culture Guides program. Track activities, earn points, climb tiers, and celebrate team contributions.

## Features

### 🎯 Activity Tracking
- Log Culture Guides activities with role-based points (Project Manager: 100pts, Committee Member: 50pts, On-site Help: 25pts)
- Real-time Google Sheets integration for data persistence
- Quarterly activity tracking with Salesforce fiscal year alignment

### 📊 Personal Impact Dashboard
- Track points, activities count, and day streaks
- Milestone system (First activity → 5 activities → 10 activities → Goal reached)
- Tier progression (Bronze → Silver → Gold → Platinum)
- Confetti celebrations for achievements

### 🏆 Leaderboard & Analytics
- Team leaderboard with points and activity rankings
- Quarter-over-quarter progress tracking
- Regional and hub-based filtering

### 🎧 Resources Hub
- Culture Guides Podcast player with metadata
- Meet the Team section featuring regional program owners
- AI-powered chatbot for Culture Guides knowledge

### 🤖 AI Assistant
- Hugging Face powered chatbot
- Culture Guides program knowledge base
- Interactive help and guidance

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Radix UI** - Accessible components
- **Clerk** - Authentication

### Backend
- **Next.js API Routes** - Serverless functions
- **Google Sheets API** - Data storage
- **Hugging Face API** - AI chatbot
- **Slack API** - Notifications (optional)

### Deployment
- **Vercel** - Hosting and deployment
- **Google Cloud** - Service account credentials

## Quick Start

1. **Clone and install**
   ```bash
   git clone <repo-url>
   cd culture-guides-tracker
   npm install
   ```

2. **Environment setup**
   ```bash
   cp .env.example .env.local
   # Fill in your credentials
   ```

3. **Required credentials**
   - Clerk: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
   - Google Sheets: `GOOGLE_SHEETS_SHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_JSON`
   - Hugging Face: `HUGGINGFACE_API_KEY`

4. **Run locally**
   ```bash
   npm run dev
   ```

5. **Deploy to Vercel**
   - Connect GitHub repo to Vercel
   - Add environment variables
   - Deploy

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── pages/            # Page components
│   ├── ui/               # Reusable UI components
│   └── layout/           # Layout components
├── lib/                   # Utilities and services
│   ├── google-sheets.ts  # Google Sheets integration
│   ├── tiers.ts          # Points and tier logic
│   └── utils.ts          # Helper functions
├── public/               # Static assets
└── config/               # Configuration files
```

## Key APIs

- `/api/activities` - Get activities and leaderboard data
- `/api/log-activity` - Log new activities
- `/api/user/stats` - Get user's personal stats
- `/api/chat` - AI chatbot endpoint
- `/api/podcast` - Podcast metadata

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

Private - Salesforce Culture Guides Team