import { NextRequest, NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"

export const dynamic = "force-dynamic"
import { googleSheetsService } from "@/lib/google-sheets"
import { localStorageService } from "@/lib/local-storage"
import { getCurrentQuarter } from "@/lib/google-sheets"
import { ACTIVITIES_GOAL_PER_QUARTER, getTierInfo } from "@/lib/tiers"

/**
 * Parse timestamp to date string (YYYY-MM-DD) for streak calculation
 */
function parseActivityDate(timestamp: string | undefined): string | null {
  if (!timestamp) return null
  try {
    const d = new Date(timestamp)
    if (isNaN(d.getTime())) return null
    return d.toISOString().slice(0, 10)
  } catch {
    return null
  }
}

/**
 * Calculate consecutive days streak ending at the most recent activity date
 */
function calculateStreak(activities: { timestamp?: string }[]): number {
  const dates = activities
    .map((a) => parseActivityDate(a.timestamp))
    .filter((d): d is string => d != null)
  const uniqueDates = Array.from(new Set(dates)).sort().reverse()

  if (uniqueDates.length === 0) return 0

  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

  // Streak only counts if last activity was today or yesterday
  const lastDate = uniqueDates[0]
  if (lastDate !== today && lastDate !== yesterday) return 0

  let streak = 0
  let expectedDate = lastDate

  for (const d of uniqueDates) {
    if (d !== expectedDate) break
    streak++
    const prev = new Date(expectedDate)
    prev.setDate(prev.getDate() - 1)
    expectedDate = prev.toISOString().slice(0, 10)
  }

  return streak
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await currentUser()
    const email = user?.emailAddresses?.[0]?.emailAddress
    if (!email) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 400 }
      )
    }

    const quarterParam = request.nextUrl.searchParams.get("quarter")
    const currentQuarter = quarterParam || getCurrentQuarter()
    const forceLocalStorage = !!process.env.TEST_USER_EMAIL || !!process.env.FORCE_LOCAL_STORAGE
    let activities: { emailAddress?: string; quarter?: string; points?: number; timestamp?: string }[] = []

    try {
      if (!forceLocalStorage && googleSheetsService.isGoogleSheetsConfigured()) {
        activities = await googleSheetsService.getActivities(5000, currentQuarter)
      } else {
        const all = await localStorageService.getActivities(5000)
        activities = all.filter((a) => a.quarter === currentQuarter)
      }
    } catch (err) {
      const all = await localStorageService.getActivities(5000)
      activities = all.filter((a) => a.quarter === currentQuarter)
    }

    const userActivities = activities.filter(
      (a) => a.emailAddress?.toLowerCase() === email.toLowerCase()
    )

    const activitiesThisQuarter = userActivities.length
    const pointsThisQuarter = userActivities.reduce(
      (sum, a) => sum + (a.points || 0),
      0
    )
    const streakDays = calculateStreak(userActivities)
    const { tier, nextTier, pointsToNextTier } = getTierInfo(pointsThisQuarter)

    return NextResponse.json({
      success: true,
      data: {
        activitiesThisQuarter,
        pointsThisQuarter,
        goal: ACTIVITIES_GOAL_PER_QUARTER,
        quarter: currentQuarter,
        streakDays,
        tier,
        nextTier,
        pointsToNextTier,
      },
    })
  } catch (error) {
    console.error("Error fetching user stats:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
