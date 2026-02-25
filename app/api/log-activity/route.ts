import { type NextRequest, NextResponse } from "next/server"
import { WebClient } from "@slack/web-api"
import { googleSheetsService } from "@/lib/google-sheets"
import { localStorageService } from "@/lib/local-storage"

const slack = new WebClient(process.env.SLACK_BOT_TOKEN)

export async function POST(request: NextRequest) {
  try {
    let body
    try {
      body = await request.json()
    } catch (error) {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 })
    }

    const { fullName, emailAddress, region, hub, eventName, role, manager, program } = body

    // Validate required fields
    if (!fullName || !emailAddress || !region || !hub || !eventName || !role || !manager || !program) {
      return NextResponse.json({ 
        error: "Missing required fields",
        required: ["fullName", "emailAddress", "region", "hub", "eventName", "role", "manager", "program"]
      }, { status: 400 })
    }

    // Validate role is a valid option
    const validRoles = ["project-manager", "committee-member", "on-site-help", "managed-committee-call"]
    if (!validRoles.includes(role)) {
      return NextResponse.json({ 
        error: "Invalid role",
        validRoles
      }, { status: 400 })
    }

    // Validate region is a valid option
    const validRegions = ["AMER", "EMEA", "JAPAC", "India"]
    if (!validRegions.includes(region)) {
      return NextResponse.json({ 
        error: "Invalid region",
        validRegions
      }, { status: 400 })
    }

    // Validate program is a valid option
    const validPrograms = ["Culture Guides", "Salesforce at Home"]
    if (!validPrograms.includes(program)) {
      return NextResponse.json({ 
        error: "Invalid program",
        validPrograms
      }, { status: 400 })
    }

    // Get points for the role
    const pointsMap: Record<string, number> = {
      "project-manager": 100,
      "committee-member": 50,
      "on-site-help": 25,
      "managed-committee-call": 25,
    }
    const points = pointsMap[role] || 0

    // Generate current quarter
    const now = new Date()
    const currentMonth = now.getMonth() + 1 // 1-12
    const currentYear = now.getFullYear()
    
    // Determine quarter based on Salesforce fiscal year (Feb-Jan)
    let quarter: string
    if (currentMonth >= 2 && currentMonth <= 4) {
      quarter = `Q1 FY${String(currentYear + 1).slice(-2)}`
    } else if (currentMonth >= 5 && currentMonth <= 7) {
      quarter = `Q2 FY${String(currentYear + 1).slice(-2)}`
    } else if (currentMonth >= 8 && currentMonth <= 10) {
      quarter = `Q3 FY${String(currentYear + 1).slice(-2)}`
    } else {
      quarter = `Q4 FY${String(currentYear + 1).slice(-2)}`
    }

    // Log activity - try Google Sheets first, fallback to local storage
    const activityData = {
      fullName,
      emailAddress,
      region,
      hub,
      eventName,
      role,
      manager,
      program,
      quarter,
      points,
    }

    let loggedTo = 'local_storage' // Default for MVP
    
    try {
      // Try Google Sheets if it's configured
      if (googleSheetsService.isGoogleSheetsConfigured()) {
        await googleSheetsService.logActivity(activityData)
        console.log('✅ Logged to Google Sheets')
        loggedTo = 'google_sheets'
      } else {
        console.log('ℹ️  Google Sheets not configured, using memory storage for MVP')
        throw new Error('Google Sheets not configured, using memory storage')
      }
    } catch (error) {
      console.log('⚠️  Using memory storage:', error instanceof Error ? error.message : String(error))
      
      try {
        // Fallback to memory storage
        await localStorageService.logActivity(activityData)
        console.log('✅ Successfully logged to memory storage')
        loggedTo = 'memory_storage'
      } catch (storageError) {
        console.error('❌ Failed to log to memory storage:', storageError)
        throw storageError
      }
    }

    // Send Slack notification (optional)
    if (process.env.SLACK_BOT_TOKEN && process.env.SLACK_CHANNEL_ID) {
      try {
        const roleLabels: Record<string, string> = {
          "project-manager": "Project Manager",
          "committee-member": "Committee Member",
          "on-site-help": "On-site Help (Logistics)",
          "managed-committee-call": "Managed Committee Call",
        }

        const slackMessage = {
          channel: process.env.SLACK_CHANNEL_ID,
          text: `🎉 New Culture Guides Activity Logged!`,
          blocks: [
            {
              type: "header",
              text: {
                type: "plain_text",
                text: "🎉 New Culture Guides Activity!",
              },
            },
            {
              type: "section",
              fields: [
                {
                  type: "mrkdwn",
                  text: `*Name:* ${fullName}`,
                },
                {
                  type: "mrkdwn",
                  text: `*Email:* ${emailAddress}`,
                },
                {
                  type: "mrkdwn",
                  text: `*Region:* ${region}`,
                },
                {
                  type: "mrkdwn",
                  text: `*Hub:* ${hub}`,
                },
                {
                  type: "mrkdwn",
                  text: `*Role:* ${roleLabels[role]}`,
                },
                {
                  type: "mrkdwn",
                  text: `*Points Earned:* ${points} 🌟`,
                },
                {
                  type: "mrkdwn",
                  text: `*Event:* ${eventName}`,
                },
                {
                  type: "mrkdwn",
                  text: `*Manager:* ${manager}`,
                },
                {
                  type: "mrkdwn",
                  text: `*Program:* ${program}`,
                },
                {
                  type: "mrkdwn",
                  text: `*Quarter:* ${quarter}`,
                },
              ],
            },
          ],
        }

        await slack.chat.postMessage(slackMessage)
        console.log('✅ Slack notification sent')
      } catch (error) {
        console.log('⚠️  Slack notification failed:', error instanceof Error ? error.message : String(error))
        // Don't fail the request if Slack fails
      }
    }

    return NextResponse.json({
      success: true,
      message: "Activity logged successfully!",
      points,
      storage: loggedTo,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Error logging activity:", error)
    
    // Return different error messages based on error type
    if (error instanceof Error) {
      if (error.message.includes('environment variable')) {
        return NextResponse.json({ 
          error: "Configuration error", 
          message: "Service not properly configured"
        }, { status: 503 })
      }
    }
    
    return NextResponse.json({ 
      error: "Internal server error",
      message: "Failed to log activity. Please try again later."
    }, { status: 500 })
  }
}
