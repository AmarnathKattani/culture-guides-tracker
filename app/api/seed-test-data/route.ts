import { NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import { googleSheetsService } from "@/lib/google-sheets"
import { localStorageService } from "@/lib/local-storage"

export const dynamic = "force-dynamic"

const QUARTER = "Q1 FY27"

const TEST_ACTIVITIES = [
  { eventName: "Culture Connect Q1 Kickoff", role: "project-manager", points: 100 },
  { eventName: "Ohana Appreciation Week", role: "committee-member", points: 50 },
  { eventName: "Innovation Showcase", role: "project-manager", points: 100 },
  { eventName: "Mindfulness Monday", role: "on-site-help", points: 25 },
  { eventName: "V2MOM Workshop", role: "committee-member", points: 50 },
  { eventName: "Culture Connect SF", role: "project-manager", points: 100 },
  { eventName: "Team Building Event", role: "on-site-help", points: 25 },
  { eventName: "Quarterly Planning Call", role: "managed-committee-call", points: 25 },
  { eventName: "Diversity & Inclusion Summit", role: "committee-member", points: 50 },
  { eventName: "Volunteer Day", role: "on-site-help", points: 25 },
  { eventName: "Culture Champions Meetup", role: "committee-member", points: 50 },
  { eventName: "Q1 Retrospective", role: "managed-committee-call", points: 25 },
]

// Spread across Feb 2026 (Q1 FY27) for streak - last 5 days consecutive
const DAY_OFFSETS = [1, 3, 5, 8, 10, 12, 15, 18, 20, 22, 23, 24]

export async function POST() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await currentUser()
    const email = user?.emailAddresses?.[0]?.emailAddress
    const firstName = user?.firstName || "User"
    const lastName = user?.lastName || ""

    if (!email) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 400 }
      )
    }

    const fullName = `${firstName} ${lastName}`.trim() || "Test User"

    const logOne = async (
      activity: (typeof TEST_ACTIVITIES)[0],
      timestamp: string
    ) => {
      const data = {
        fullName,
        emailAddress: email,
        region: "AMER",
        hub: "San Francisco",
        eventName: activity.eventName,
        role: activity.role,
        manager: "Test Manager",
        program: "Culture Guides",
        quarter: QUARTER,
        points: activity.points,
      }
      if (googleSheetsService.isGoogleSheetsConfigured()) {
        await googleSheetsService.logActivity(data, timestamp)
      } else {
        await localStorageService.logActivity(data, timestamp)
      }
    }

    for (let i = 0; i < TEST_ACTIVITIES.length; i++) {
      const activity = TEST_ACTIVITIES[i]
      const dayOffset = DAY_OFFSETS[i]
      const date = new Date(2026, 1, dayOffset)
      const timestamp = date.toISOString()
      await logOne(activity, timestamp)
    }

    const totalPoints = TEST_ACTIVITIES.reduce((s, a) => s + a.points, 0)

    return NextResponse.json({
      success: true,
      message: `Added ${TEST_ACTIVITIES.length} test activities for Q1 FY27`,
      data: {
        activitiesAdded: TEST_ACTIVITIES.length,
        totalPoints,
        quarter: QUARTER,
        email,
      },
    })
  } catch (error) {
    console.error("Error seeding test data:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
