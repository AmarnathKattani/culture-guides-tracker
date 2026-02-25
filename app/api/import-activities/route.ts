import { type NextRequest, NextResponse } from "next/server"
import { googleSheetsService } from "@/lib/google-sheets"

/**
 * Parse CSV line handling quoted fields with commas
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      inQuotes = !inQuotes
    } else if ((char === "," && !inQuotes) || char === "\n") {
      result.push(current.trim())
      current = ""
    } else {
      current += char
    }
  }
  result.push(current.trim())
  return result
}

/**
 * Fix malformed email (e.g. namesalesforce.com -> name@salesforce.com)
 */
function fixEmail(email: string): string {
  if (!email || email.includes("@")) return email
  if (email.endsWith("salesforce.com")) {
    return email.replace("salesforce.com", "@salesforce.com")
  }
  if (email.endsWith("salesforce.org")) {
    return email.replace("salesforce.org", "@salesforce.org")
  }
  return email
}

export async function POST(request: NextRequest) {
  try {
    if (!googleSheetsService.isGoogleSheetsConfigured()) {
      return NextResponse.json(
        { error: "Google Sheets is not configured" },
        { status: 503 }
      )
    }

    const contentType = request.headers.get("content-type") || ""
    let csvText: string

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData()
      const file = formData.get("file") as File
      if (!file) {
        return NextResponse.json(
          { error: "No file provided. Use form field 'file'" },
          { status: 400 }
        )
      }
      csvText = await file.text()
    } else {
      csvText = await request.text()
    }

    const lines = csvText.split(/\r?\n/).filter((line) => line.trim())
    if (lines.length < 2) {
      return NextResponse.json(
        { error: "CSV must have header row and at least one data row" },
        { status: 400 }
      )
    }

    const activities: Array<{
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
    }> = []

    for (let i = 1; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i])
      if (cols.length < 10) continue

      const fullName = (cols[0] || "").trim()
      const eventName = (cols[4] || "").trim()
      if (!fullName || !eventName) continue

      const points = parseInt(cols[9], 10) || 0
      const quarter = (cols[8] || "Q4 FY26").trim() || "Q4 FY26"

      activities.push({
        fullName,
        emailAddress: fixEmail((cols[1] || "").trim()),
        region: (cols[2] || "").trim(),
        hub: (cols[3] || "").trim(),
        eventName,
        role: (cols[5] || "").trim(),
        manager: (cols[6] || "").trim(),
        program: (cols[7] || "").trim(),
        quarter,
        points,
      })
    }

    const { imported } = await googleSheetsService.batchImportActivities(
      activities,
      "Q4 FY26"
    )

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${imported} activities to Q4 FY26`,
      imported,
      total: activities.length,
    })
  } catch (error) {
    console.error("Import error:", error)
    return NextResponse.json(
      {
        error: "Failed to import activities",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
