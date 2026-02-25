"use client"
export const dynamic = "force-dynamic"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Star, Heart } from "lucide-react"
import Header from "@/components/layout/Header"
import HomePage from "@/components/pages/HomePage"
import LogActivityPage from "@/components/pages/LogActivityPage"
import ImpactPage from "@/components/pages/ImpactPage"
import DashboardPage from "@/components/pages/DashboardPage"
import ResourcesPage from "@/components/pages/ResourcesPage"
import ResourcesChatbot from "@/components/chatbot/ResourcesChatbot"

import LoadingSpinner from "@/components/ui/LoadingSpinner"

// Mock Data
const leaderboardData = [
  {
    rank: 1,
    name: "Sarah Chen",
    points: 425,
    activity: "Project Manager • Last event: Culture Connect SF",
    avatar: "/placeholder.svg?height=100&width=100&text=SC",
  },
  {
    rank: 2,
    name: "Marcus Johnson",
    points: 375,
    activity: "Committee Member • Last event: Ohana Appreciation Week",
    avatar: "/placeholder.svg?height=100&width=100&text=MJ",
  },
  {
    rank: 3,
    name: "Elena Rodriguez",
    points: 350,
    activity: "Project Manager • Last event: Innovation Showcase",
    avatar: "/placeholder.svg?height=100&width=100&text=ER",
  },
  {
    rank: 4,
    name: "David Kim",
    points: 275,
    activity: "Committee Member • Last event: V2MOM Workshop",
    avatar: "/placeholder.svg?height=100&width=100&text=DK",
  },
  {
    rank: 5,
    name: "Priya Patel",
    points: 225,
    activity: "On-site Help • Last event: Mindfulness Monday",
    avatar: "/placeholder.svg?height=100&width=100&text=PP",
  },
]

const activityTypes = [
  {
    id: "project-manager",
    role: "Project Manager",
    points: 100,
    emoji: "🎯",
    description: "Lead and coordinate cultural initiatives",
    gradient: "from-purple-500 to-pink-500",
    icon: Star,
  },
  {
    id: "committee-member",
    role: "Committee Member",
    points: 50,
    emoji: "🤝",
    description: "Actively participate in planning committees",
    gradient: "from-blue-500 to-cyan-500",
    icon: Users,
  },
  {
    id: "on-site-help",
    role: "On-site Help",
    points: 25,
    emoji: "🙋‍♀️",
    description: "Provide support during events and activities",
    gradient: "from-green-500 to-emerald-500",
    icon: Heart,
  },
]

// Helper Components
const AnimatedCounter = ({ value }: { value: number }) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const duration = 1500
    const frameRate = 1000 / 60
    const totalFrames = Math.round(duration / frameRate)
    let frame = 0

    const counter = setInterval(() => {
      frame++
      const progress = frame / totalFrames
      const currentCount = Math.round(value * progress)
      setCount(currentCount)

      if (frame === totalFrames) {
        clearInterval(counter)
        setCount(value)
      }
    }, frameRate)

    return () => clearInterval(counter)
  }, [value])

  return <span className="font-bold">{count.toLocaleString()}</span>
}

const Confetti = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-4 rounded-full animate-bounce"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${-20}%`,
            backgroundColor: ["#fb7c47", "#87ceeb", "#fbbf24", "#10b981"][Math.floor(Math.random() * 4)],
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 3}s`,
          }}
        />
      ))}
    </div>
  )
}

// Page Components
const LandingPage = ({ onNavigate }: { onNavigate: (page: string) => void }) => (
  <div className="space-y-16 md:space-y-24">
    {/* Hero Section */}
    <div className="relative text-center py-20 md:py-32 px-4 overflow-hidden rounded-3xl">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-purple-900/80 to-orange-900/90 backdrop-blur-sm"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width%3D%2260%22 height%3D%2260%22 viewBox%3D%220 0 60 60%22 xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg fill%3D%22none%22 fillRule%3D%22evenodd%22%3E%3Cg fill%3D%22%23ffffff%22 fillOpacity%3D%220.05%22%3E%3Ccircle cx%3D%2230%22 cy%3D%2230%22 r%3D%222%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-20"></div>
      <div className="relative z-10">
        <div className="mb-8">
          <img
            src="/culture-guides-logo-white.png"
            alt="Culture Guides Logo"
            className="h-24 w-24 mx-auto mb-6 drop-shadow-2xl"
          />
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight">
          Culture Guides{" "}
          <span className="bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">Rockstar</span>
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-slate-300">
          Earn points, make an impact, and celebrate Salesforce culture.
        </p>
        <Button
          onClick={() => onNavigate("log-activity")}
          className="mt-8 px-8 py-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300"
        >
          Start Logging Activities
        </Button>
      </div>
    </div>

    {/* Program Overview */}
    <Card className="bg-white border border-gray-200 shadow-lg p-8 md:p-12">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold">How It Works</CardTitle>
        <CardDescription className="text-lg max-w-xl mx-auto">
          Earn points by participating in cultural events and initiatives. Your contributions make a huge difference!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mt-12 grid md:grid-cols-3 gap-8 text-center">
          {activityTypes.map((activity) => (
            <Card
              key={activity.id}
              className="bg-white border border-gray-200 shadow-md p-6 transform hover:-translate-y-2 transition-transform duration-300 group"
            >
              <CardContent className="pt-6">
                <div
                  className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${activity.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <activity.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-5xl font-extrabold text-orange-500">{activity.points}</div>
                <div className="text-sm font-bold text-muted-foreground mt-1">POINTS</div>
                <h3 className="text-xl font-semibold mt-4">{activity.role}</h3>
                <p className="text-3xl mt-2">{activity.emoji}</p>
                <p className="text-sm text-muted-foreground mt-2">{activity.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
)

// Main App Component
export default function CultureGuidesApp() {
  const [activeTab, setActiveTab] = useState("home")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2500)
    
    return () => clearTimeout(timer)
  }, [])

  const renderPage = () => {
    switch (activeTab) {
      case "home":
        return <HomePage onNavigate={setActiveTab} />
      case "log-activity":
        return <LogActivityPage onNavigate={setActiveTab} />
      case "impact":
        return <ImpactPage onNavigate={setActiveTab} />
      case "dashboard":
        return <DashboardPage />
      case "resources":
        return <ResourcesPage />
      default:
        return <HomePage onNavigate={setActiveTab} />
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      {!isLoading && <ResourcesChatbot />}
    </div>
  )
}
