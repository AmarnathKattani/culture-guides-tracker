"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import confetti from "canvas-confetti"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { NumberTicker } from "@/components/ui/number-ticker"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Trophy, Users, Calendar, TrendingUp, Loader2, Table2, Database } from "lucide-react"
import AnimatedList from "@/components/ui/AnimatedList"

interface LeaderboardEntry {
  name: string
  points: number
  activities: number
  lastActivity: string
  emailAddress: string
  region: string
  hub: string
}

function getCurrentQuarter(): string {
  const now = new Date()
  const currentMonth = now.getMonth() + 1 // 1-12
  const currentYear = now.getFullYear()
  
  // Determine quarter based on Salesforce fiscal year (Feb-Jan)
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
  const startYear = 26 // FY26
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()
  
  // Determine current fiscal year and quarter
  let currentFY: number
  let currentQ: number
  
  if (currentMonth >= 2) {
    currentFY = currentYear + 1
    if (currentMonth >= 2 && currentMonth <= 4) currentQ = 1
    else if (currentMonth >= 5 && currentMonth <= 7) currentQ = 2
    else if (currentMonth >= 8 && currentMonth <= 10) currentQ = 3
    else currentQ = 4
  } else {
    currentFY = currentYear
    currentQ = 4
  }
  
  const currentFYShort = currentFY % 100

  const options: string[] = []
  for (let fy = startYear; fy <= currentFYShort; fy++) {
    const maxQ = fy === currentFYShort ? currentQ : 4
    for (let q = 1; q <= maxQ; q++) {
      options.push(`Q${q} FY${fy}`)
    }
  }
  return options.reverse()
}

interface DashboardStats {
  uniqueUsers: number
  totalPoints: number
  totalActivities: number
  avgPointsPerGuide: number
}

const defaultStats: DashboardStats = {
  uniqueUsers: 0,
  totalPoints: 0,
  totalActivities: 0,
  avgPointsPerGuide: 0,
}

export default function DashboardPage() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [stats, setStats] = useState<DashboardStats>(defaultStats)
  const [loading, setLoading] = useState(true)
  const [dataSource, setDataSource] = useState<string>('local_storage')
  const [selectedQuarter, setSelectedQuarter] = useState<string>(getCurrentQuarter())
  const [availableQuarters, setAvailableQuarters] = useState<string[]>(generateQuarterOptions())
  const [selectedLeaderboardEntry, setSelectedLeaderboardEntry] = useState<LeaderboardEntry | null>(null)
  const [selectedRank, setSelectedRank] = useState<number | null>(null)

  useEffect(() => {
    fetchDashboardData(selectedQuarter)
  }, [selectedQuarter])

  const fetchDashboardData = async (quarter: string) => {
    try {
      setLoading(true)

      const [statsResponse, leaderboardResponse, activitiesResponse] = await Promise.all([
        fetch(`/api/activities?type=stats&quarter=${quarter}`),
        fetch(`/api/activities?type=leaderboard&quarter=${quarter}`),
        fetch(`/api/activities?limit=500&quarter=${quarter}`),
      ])

      const statsResult = await statsResponse.json()
      const leaderboardResult = await leaderboardResponse.json()
      const activitiesResult = await activitiesResponse.json()

      if (statsResult.success) {
        setStats(statsResult.data)
      }

      if (leaderboardResult.success) {
        setLeaderboardData(leaderboardResult.data)
        setDataSource(leaderboardResult.source)

        if (leaderboardResult.quarters?.length > 0) {
          const merged = new Set([...generateQuarterOptions(), ...leaderboardResult.quarters])
          setAvailableQuarters(
            Array.from(merged).sort((a, b) => {
              const aMatch = a.match(/^Q(\d) FY(\d{2})$/)
              const bMatch = b.match(/^Q(\d) FY(\d{2})$/)
              if (!aMatch || !bMatch) return 0
              
              const [, qa, ya] = aMatch.map(Number)
              const [, qb, yb] = bMatch.map(Number)
              return ya !== yb ? yb - ya : qb - qa
            })
          )
        }
      }

      if (activitiesResult.success) {
        setActivities(activitiesResult.data)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const maxPoints = leaderboardData.length > 0 ? Math.max(...leaderboardData.map((u) => u.points)) : 1

  const statsData = [
    { label: "Active Culture Guides", color: "text-sky-400" },
    { label: "Total Points Earned", color: "text-orange-500" },
    { label: "Activities Logged", color: "text-yellow-500" },
    { label: "Avg Points per Guide", color: "text-green-500" },
  ]

  const handleTop3Click = (user: LeaderboardEntry, rank: number) => {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
    setTimeout(() => confetti({ particleCount: 50, spread: 100, origin: { y: 0.5, x: 0.3 } }), 200)
    setTimeout(() => confetti({ particleCount: 50, spread: 100, origin: { y: 0.5, x: 0.7 } }), 400)
    setSelectedLeaderboardEntry(user)
    setSelectedRank(rank)
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 min-h-screen">
      {/* Header with Quarter Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select quarter" />
            </SelectTrigger>
            <SelectContent>
              {availableQuarters.map((q) => (
                <SelectItem key={q} value={q}>
                  {q}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
              dataSource === 'google_sheets'
                ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20'
                : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
            }`}
            title={dataSource === 'google_sheets' ? 'Dashboard data is synced from your Google Sheet' : 'Using local storage (Google Sheets not configured)'}
          >
            {dataSource === 'google_sheets' ? (
              <>
                <Table2 className="w-4 h-4" />
                <span>Data from Google Sheets</span>
              </>
            ) : (
              <>
                <Database className="w-4 h-4" />
                <span>Local Storage</span>
              </>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-gray-500 dark:text-gray-400" />
          <span className="ml-2 text-gray-500 dark:text-gray-400">Loading dashboard data...</span>
        </div>
      ) : (
        <>
          {/* Statistics - full scene SVG with corner stats (same approach as Impact page) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative w-full rounded-xl overflow-hidden border border-gray-200 dark:border-blue-500/20 min-h-[220px]"
          >
            {/* Background image - fills container, scale slightly to eliminate corner gaps */}
            <img
              src="/Untitled%20(1280%20x%20220%20px)%20(1).svg"
              alt=""
              className="absolute inset-0 w-full h-full object-cover object-[left_center] scale-[1.02]"
              aria-hidden
            />
            {/* Overlay - right side only, left stays clear for Astro */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/20 dark:to-black/40 pointer-events-none" aria-hidden />
            {/* Left: Astro area (clear). Right: 2x2 grid with stats */}
            <div className="absolute inset-0 flex items-stretch">
              {/* Left - Astro clear */}
              <div className="w-[45%] min-w-[120px] shrink-0" />
              {/* Right - 2x2 grid spanning the full area */}
              <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-3 sm:gap-4 p-3 sm:p-4 content-stretch items-stretch min-w-0">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="min-w-0 min-h-0 flex">
                    <Card className="h-full w-full border border-gray-200/80 dark:border-white/20 bg-white/90 dark:bg-gray-900/80 backdrop-blur-md shadow-none flex flex-col justify-center rounded-md">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-start gap-3 min-w-0">
                          <Users className="w-8 h-8 sm:w-10 sm:h-10 text-sky-500 dark:text-sky-400 flex-shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm sm:text-base font-medium text-gray-600 dark:text-gray-300 truncate">{statsData[0].label}</p>
                            <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tabular-nums truncate">
                              <NumberTicker value={stats.uniqueUsers} className="font-bold" />
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="min-w-0 min-h-0 flex">
                    <Card className="h-full w-full border border-gray-200/80 dark:border-white/20 bg-white/90 dark:bg-gray-900/80 backdrop-blur-md shadow-none flex flex-col justify-center rounded-md">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-start gap-3 min-w-0">
                          <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-orange-500 flex-shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm sm:text-base font-medium text-gray-600 dark:text-gray-300 truncate">{statsData[1].label}</p>
                            <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tabular-nums truncate">
                              <NumberTicker value={stats.totalPoints} className="font-bold" />
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="min-w-0 min-h-0 flex">
                    <Card className="h-full w-full border border-gray-200/80 dark:border-white/20 bg-white/90 dark:bg-gray-900/80 backdrop-blur-md shadow-none flex flex-col justify-center rounded-md">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-start gap-3 min-w-0">
                          <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm sm:text-base font-medium text-gray-600 dark:text-gray-300 truncate">{statsData[2].label}</p>
                            <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tabular-nums truncate">
                              <NumberTicker value={stats.totalActivities} className="font-bold" />
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="min-w-0 min-h-0 flex">
                    <Card className="h-full w-full border border-gray-200/80 dark:border-white/20 bg-white/90 dark:bg-gray-900/80 backdrop-blur-md shadow-none flex flex-col justify-center rounded-md">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-start gap-3 min-w-0">
                          <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm sm:text-base font-medium text-gray-600 dark:text-gray-300 truncate">{statsData[3].label}</p>
                            <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tabular-nums truncate">
                              <NumberTicker value={stats.avgPointsPerGuide} className="font-bold" />
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Leaderboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="w-full min-w-0">
              <Card className="border border-gray-200 dark:border-blue-500/20 bg-white/90 dark:bg-card/70 backdrop-blur-md overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Trophy className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                    Leaderboard
                  </CardTitle>
                  <CardDescription className="text-gray-500 dark:text-gray-400">Scroll for all ranks ({selectedQuarter})</CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-hidden">
                  {leaderboardData.length > 0 ? (
                    <AnimatedList
                      items={leaderboardData.map((user, index) => (
                        <div
                          key={user.emailAddress || `${user.name}-${index}`}
                          className={`flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 min-w-0 ${
                            index < 3 ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition-colors" : ""
                          }`}
                          onClick={index < 3 ? () => handleTop3Click(user, index + 1) : undefined}
                        >
                          <div className="flex-shrink-0">
                            {index < 3 ? (
                              <div className={`flex items-center justify-center w-8 h-8 ${
                                index === 0 ? "text-yellow-500" :
                                index === 1 ? "text-gray-400" :
                                "text-amber-600"
                              }`}>
                                <Trophy className="w-8 h-8" />
                              </div>
                            ) : (
                              <div className="flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm text-white bg-gray-500">
                                {index + 1}
                              </div>
                            )}
                          </div>
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                            {user.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate text-gray-900 dark:text-white">{user.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {user.activities} activities • {user.region} • {user.hub}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold text-lg text-gray-900 dark:text-white">{user.points}</p>
                            <Progress value={(user.points / maxPoints) * 100} className="w-16 h-2 min-w-[4rem]" />
                          </div>
                        </div>
                      ))}
                      showGradients
                      enableArrowNavigation={false}
                      displayScrollbar
                      maxHeight="500px"
                    />
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">No activities logged yet</p>
                      <p className="text-sm">Start logging activities to see the leaderboard!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Activities */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="w-full">
              <Card className="border border-gray-200 dark:border-blue-500/20 bg-white/90 dark:bg-card/70 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Calendar className="w-5 h-5 text-green-500" />
                    Recent Activities
                  </CardTitle>
                  <CardDescription className="text-gray-500 dark:text-gray-400">Scroll for all activities ({selectedQuarter})</CardDescription>
                </CardHeader>
                <CardContent>
                  {activities.length > 0 ? (
                    <AnimatedList
                      items={activities.map((activity, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-white/5"
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {activity.fullName?.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate text-gray-900 dark:text-white">{activity.eventName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {activity.fullName} • {activity.region} • {activity.points} points
                            </p>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                            {new Date(activity.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                      showGradients
                      enableArrowNavigation={false}
                      displayScrollbar
                      maxHeight="500px"
                    />
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">No recent activities</p>
                      <p className="text-sm">Activities will appear here once logged</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </>
      )}

      <Dialog
        open={!!selectedLeaderboardEntry}
        onOpenChange={(open) => !open && (setSelectedLeaderboardEntry(null), setSelectedRank(null))}
      >
        <DialogContent className="w-fit max-w-[90vw] overflow-hidden p-0">
          {selectedLeaderboardEntry && selectedRank !== null && (
            <>
              <div className="p-6">
                <DialogHeader>
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex items-center justify-center flex-shrink-0 ${
                        selectedRank === 1 ? "text-yellow-500" : selectedRank === 2 ? "text-gray-400" : "text-amber-600"
                      }`}
                    >
                      <Trophy className="w-10 h-10" />
                    </div>
                    <div className="flex flex-col gap-1 min-w-0">
                      <DialogTitle className="leading-tight">{selectedLeaderboardEntry.name}</DialogTitle>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedLeaderboardEntry.activities} activities • {selectedLeaderboardEntry.region} • {selectedLeaderboardEntry.hub}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {selectedLeaderboardEntry.points.toLocaleString()} points
                      </p>
                    </div>
                  </div>
                </DialogHeader>
                {/* Celebration image below dialog content */}
                <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 dark:border-white/10">
                  <img
                    src="/EBR-EEF%20Epoch%20Images%20Celebration-1245x1245px-Rec0ADHELC7AA-1.png"
                    alt="EBR-EEF Epoch celebration"
                    className="w-[420px] max-w-[85vw] h-auto object-contain block"
                  />
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
