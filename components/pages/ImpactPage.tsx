"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import confetti from "canvas-confetti"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs"
import {
  Zap,
  Target,
  Flame,
  CheckCircle2,
  Circle,
  Loader2,
  Sparkles,
  Info,
} from "lucide-react"

interface UserStats {
  activitiesThisQuarter: number
  pointsThisQuarter: number
  goal: number
  quarter: string
  streakDays: number
  tier: string
  nextTier: string | null
  pointsToNextTier: number
}

interface ImpactPageProps {
  onNavigate: (page: string) => void
}

function getCurrentQuarter(): string {
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()
  if (currentMonth >= 2 && currentMonth <= 4) {
    return `Q1 FY${String(currentYear + 1).slice(-2)}`
  } else if (currentMonth >= 5 && currentMonth <= 7) {
    return `Q2 FY${String(currentYear + 1).slice(-2)}`
  } else if (currentMonth >= 8 && currentMonth <= 10) {
    return `Q3 FY${String(currentYear + 1).slice(-2)}`
  } else {
    return `Q4 FY${String(currentYear + 1).slice(-2)}`
  }
}

function generateQuarterOptions(): string[] {
  const options: string[] = []
  for (let fy = 26; fy <= 27; fy++) {
    for (let q = 1; q <= 4; q++) {
      options.push(`Q${q} FY${fy}`)
    }
  }
  return options.reverse()
}

function StatCard({
  value,
  label,
  Icon,
  gradient,
}: {
  value: number | string
  label: string
  Icon: React.ComponentType<{ className?: string }>
  gradient: string
}) {
  return (
    <div className="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-600 relative overflow-hidden group bg-white dark:bg-slate-900 cursor-default">
      <div
        className={`absolute inset-0 bg-gradient-to-r ${gradient} translate-y-[100%] group-hover:translate-y-[0%] transition-transform duration-300`}
      />
      <Icon className="absolute z-10 -top-12 -right-12 w-36 h-36 text-slate-100 dark:text-slate-800 group-hover:text-white/30 group-hover:rotate-12 transition-all duration-300" />
      <Icon className="mb-2 w-6 h-6 text-orange-600 dark:text-orange-400 group-hover:text-white transition-colors relative z-10 duration-300" />
      <p className="font-bold text-2xl text-slate-950 dark:text-white group-hover:text-white relative z-10 duration-300">
        {value}
      </p>
      <p className="text-slate-400 dark:text-slate-500 group-hover:text-white/90 relative z-10 duration-300 text-sm">
        {label}
      </p>
    </div>
  )
}

function getMilestones(goal: number) {
  return [
    { id: "first", label: "First activity", target: 1 },
    { id: "five", label: "5 activities", target: 5 },
    { id: "ten", label: "10 activities", target: 10 },
    { id: "goal", label: "Goal reached", target: goal },
  ]
}

function ImpactContent({
  stats,
  onNavigate,
}: {
  stats: UserStats
  onNavigate: (page: string) => void
}) {
  const hasReachedGoal = stats.activitiesThisQuarter >= stats.goal

  useEffect(() => {
    if (hasReachedGoal) {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } })
    }
  }, [hasReachedGoal])

  return (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="space-y-6 sm:space-y-8"
      >
        {/* Hero section with image background */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative min-h-[220px] rounded-2xl overflow-hidden border border-orange-200/50 dark:border-orange-500/20"
        >
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/Culture%20Guides%20Re-Launch-%20%28EV%29%20Q3%20FY24%20-%201205668211021529-01.png')" }}
          />
        </motion.section>

        {/* Interactive stats cards - HoverDev style */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: Zap,
              value: stats.pointsThisQuarter,
              label: "Points",
              gradient: "from-orange-500 to-pink-500",
            },
            {
              icon: Target,
              value: `${stats.activitiesThisQuarter}/${stats.goal}`,
              label: "Activities",
              gradient: "from-blue-500 to-cyan-500",
            },
            {
              icon: Flame,
              value: stats.streakDays,
              label: "day streak",
              gradient: "from-amber-500 to-orange-500",
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * i }}
            >
              <StatCard
                value={stat.value}
                label={stat.label}
                Icon={stat.icon}
                gradient={stat.gradient}
              />
            </motion.div>
          ))}
        </div>

        {/* Interactive milestones with progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card className="bg-white/95 dark:bg-card/80 border border-gray-200 dark:border-blue-500/20 overflow-hidden">
            <CardContent className="pt-6 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Milestones
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {getMilestones(stats.goal).map((m, i) => {
                  const achieved = stats.activitiesThisQuarter >= m.target
                  const progress = Math.min(
                    (stats.activitiesThisQuarter / m.target) * 100,
                    100
                  )
                  return (
                    <motion.div
                      key={m.id}
                      className={`p-4 rounded-xl border-2 transition-all cursor-default ${
                        achieved
                          ? "border-green-300 dark:border-green-600 bg-green-50/50 dark:bg-green-900/20"
                          : "border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30"
                      }`}
                      whileHover={{ scale: 1.03 }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {achieved ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        )}
                        <span
                          className={`text-sm font-medium ${
                            achieved
                              ? "text-green-700 dark:text-green-300"
                              : "text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          {m.label}
                        </span>
                      </div>
                      {!achieved && (
                        <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-orange-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.6, delay: 0.1 * i }}
                          />
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tips / Did you know section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-200/50 dark:border-blue-500/20">
            <CardContent className="pt-6 pb-6">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Did you know?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Project Manager roles earn 100 points, Committee Member 50, and
                On-site Help or Managed Committee Call 25 points each. Log
                activities to climb the leaderboard and reach your quarterly
                goal!
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={() => onNavigate("log-activity")}
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold shadow-lg"
            >
              Log Activity
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={() => onNavigate("dashboard")}
              variant="outline"
              size="lg"
              className="border-gray-300 dark:border-gray-600"
            >
              View Dashboard
            </Button>
          </motion.div>
        </motion.div>

      </motion.div>
  )
}

function EmptyState({ onNavigate }: { onNavigate: (page: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="text-center py-12 space-y-8"
    >
      <div className="w-24 h-24 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <Target className="w-12 h-12 text-gray-400 dark:text-gray-500" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Your impact starts here
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          Log your first activity and join Culture Guides making a difference.
        </p>
      </div>
      <Button
        onClick={() => onNavigate("log-activity")}
        size="lg"
        className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold"
      >
        Log your first activity
      </Button>
    </motion.div>
  )
}

export default function ImpactPage({ onNavigate }: ImpactPageProps) {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedQuarter, setSelectedQuarter] = useState(getCurrentQuarter())

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch(
          `/api/user/stats?quarter=${encodeURIComponent(selectedQuarter)}`
        )
        if (!res.ok) {
          if (res.status === 401) {
            setError("unauthorized")
            return
          }
          throw new Error("Failed to fetch stats")
        }
        const json = await res.json()
        if (json.success && json.data) {
          setStats(json.data)
        }
      } catch (err) {
        setError("failed")
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [selectedQuarter])

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Your Impact
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track your progress and celebrate your contributions
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={selectedQuarter}
            onValueChange={setSelectedQuarter}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Quarter" />
            </SelectTrigger>
            <SelectContent>
              {generateQuarterOptions().map((q) => (
                <SelectItem key={q} value={q}>
                  {q}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      <SignedIn>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
            <p className="text-gray-500 dark:text-gray-400">
              Loading your impact...
            </p>
          </div>
        ) : error === "unauthorized" ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Sign in to see your impact.
            </p>
            <SignInButton mode="modal">
              <Button>Sign In</Button>
            </SignInButton>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Something went wrong. Please try again.
            </p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        ) : stats ? (
          <ImpactContent stats={stats} onNavigate={onNavigate} />
        ) : (
          <EmptyState onNavigate={onNavigate} />
        )}
      </SignedIn>

      <SignedOut>
        <div className="text-center py-16 space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Target className="w-10 h-10 text-gray-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Sign in to see your impact
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Track your activities, earn points, and see your progress toward
              your quarterly goal.
            </p>
            <SignInButton mode="modal">
              <Button
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
              >
                Sign In
              </Button>
            </SignInButton>
          </div>
        </div>
      </SignedOut>
    </div>
  )
}
