interface ActivityData {
  fullName: string
  emailAddress: string
  region: string
  hub: string
  eventName: string
  role: string
  manager: string
  program: string
  quarter: string
  points: number
  timestamp?: string
  id?: string
}

// In-memory storage for Vercel serverless environment
// Note: Data will reset between function cold starts - perfect for MVP testing
let activitiesCache: ActivityData[] = []

const Q1_FY27_TEST_ACTIVITIES = [
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

const Q1_FY27_DAY_OFFSETS = [1, 3, 5, 8, 10, 12, 15, 18, 20, 22, 23, 24]

function getTestUserEmail(): string | null {
  return process.env.TEST_USER_EMAIL || null
}

function seedTestDataForUser(): void {
  const email = getTestUserEmail()
  if (!email) return

  const activities: ActivityData[] = Q1_FY27_TEST_ACTIVITIES.map((a, i) => {
    const date = new Date(2026, 1, Q1_FY27_DAY_OFFSETS[i])
    return {
      id: `test-q1fy27-${i}`,
      fullName: "Test User",
      emailAddress: email,
      region: "AMER",
      hub: "San Francisco",
      eventName: a.eventName,
      role: a.role,
      manager: "Test Manager",
      program: "Culture Guides",
      quarter: "Q1 FY27",
      points: a.points,
      timestamp: date.toISOString(),
    }
  })

  activitiesCache.push(...activities)
  console.log(`✅ Pre-seeded ${activities.length} Q1 FY27 activities for ${email}`)
}

export class LocalStorageService {
  constructor() {
    if (activitiesCache.length === 0) {
      activitiesCache = [
        {
          id: "demo-1",
          fullName: "Demo User",
          emailAddress: "demo.user@salesforce.com",
          region: "AMER",
          hub: "San Francisco",
          eventName: "Culture Connect Demo Event",
          role: "project-manager",
          manager: "Demo Manager",
          program: "Culture Guides",
          quarter: "Q4 FY26",
          points: 100,
          timestamp: new Date().toISOString(),
        },
      ]
      seedTestDataForUser()
    }
  }

  async logActivity(data: ActivityData, customTimestamp?: string): Promise<void> {
    try {
      const activity = {
        ...data,
        id: generateId(),
        timestamp: customTimestamp || new Date().toISOString(),
      }

      // Add new activity to beginning of array (latest first)
      activitiesCache.unshift(activity)
      
      // Keep only last 1000 activities to prevent memory issues
      if (activitiesCache.length > 1000) {
        activitiesCache = activitiesCache.slice(0, 1000)
      }
      
      console.log('✅ Activity logged to memory storage:', activity.eventName)
      console.log('📊 Total activities in cache:', activitiesCache.length)
    } catch (error) {
      console.error('❌ Error logging to memory storage:', error)
      throw new Error('Failed to log activity to memory storage')
    }
  }

  async getActivities(limit: number = 100): Promise<ActivityData[]> {
    try {
      return activitiesCache.slice(0, limit)
    } catch (error) {
      console.error('❌ Error reading from memory storage:', error)
      return []
    }
  }

  async getLeaderboard(): Promise<any[]> {
    try {
      const activities = activitiesCache // Use all activities for leaderboard
      
      // Group by fullName and calculate total points
      const leaderboard = activities.reduce((acc: any, activity) => {
        const name = activity.fullName
        if (!acc[name]) {
          acc[name] = {
            name,
            points: 0,
            activities: 0,
            lastActivity: activity.timestamp,
            emailAddress: activity.emailAddress,
            region: activity.region,
            hub: activity.hub
          }
        }
        acc[name].points += activity.points || 0
        acc[name].activities += 1
        
        return acc
      }, {})

      // Convert to array and sort by points
      return Object.values(leaderboard)
        .sort((a: any, b: any) => b.points - a.points)
        .slice(0, 10) // Top 10
    } catch (error) {
      console.error('❌ Error generating leaderboard:', error)
      return []
    }
  }

  async clearAllData(): Promise<void> {
    try {
      activitiesCache = []
      console.log('✅ All data cleared from memory storage')
    } catch (error) {
      console.error('❌ Error clearing data:', error)
      throw new Error('Failed to clear data')
    }
  }

  async getStats(): Promise<{ totalActivities: number, totalPoints: number, uniqueUsers: number }> {
    try {
      const totalActivities = activitiesCache.length
      const totalPoints = activitiesCache.reduce((sum, activity) => sum + (activity.points || 0), 0)
      const uniqueUsers = new Set(activitiesCache.map(activity => activity.fullName)).size
      
      return { totalActivities, totalPoints, uniqueUsers }
    } catch (error) {
      console.error('❌ Error getting stats:', error)
      return { totalActivities: 0, totalPoints: 0, uniqueUsers: 0 }
    }
  }
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export const localStorageService = new LocalStorageService()