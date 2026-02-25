import { google } from 'googleapis'
import * as fs from 'fs'
import * as path from 'path'

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
}

interface ServiceAccountCredentials {
  client_email: string
  private_key: string
}

/**
 * Loads Google Sheets credentials. Supports three patterns (in order of precedence):
 *   1. GOOGLE_SERVICE_ACCOUNT_JSON — full service account JSON string (recommended for Vercel)
 *   2. GOOGLE_SHEETS_CLIENT_EMAIL + GOOGLE_SHEETS_PRIVATE_KEY — individual env vars
 *   3. config/google-service-account.json (for local development)
 */
function loadCredentials(): { credentials: ServiceAccountCredentials; spreadsheetId: string } | null {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SHEET_ID
  if (!spreadsheetId) return null

  // Option 1: Full JSON string (recommended for Vercel — paste the whole service account JSON)
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    try {
      const parsed = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON)
      if (parsed.client_email && parsed.private_key) {
        return {
          credentials: {
            client_email: parsed.client_email,
            private_key: parsed.private_key.replace(/\\n/g, '\n'),
          },
          spreadsheetId,
        }
      }
    } catch (e) {
      console.error('Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON:', e)
    }
  }

  // Option 2: Individual env vars
  if (process.env.GOOGLE_SHEETS_CLIENT_EMAIL && process.env.GOOGLE_SHEETS_PRIVATE_KEY) {
    return {
      credentials: {
        client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      spreadsheetId,
    }
  }

  // Option 3: Load from config/google-service-account.json (local development)
  const jsonPath = process.env.GOOGLE_SHEETS_CREDENTIALS_PATH
    ? path.resolve(process.env.GOOGLE_SHEETS_CREDENTIALS_PATH)
    : path.join(process.cwd(), 'config', 'google-service-account.json')

  if (fs.existsSync(jsonPath)) {
    try {
      const fileContent = fs.readFileSync(jsonPath, 'utf-8')
      const parsed = JSON.parse(fileContent)
      if (parsed.client_email && parsed.private_key) {
        return {
          credentials: {
            client_email: parsed.client_email,
            private_key: parsed.private_key.replace(/\\n/g, '\n'),
          },
          spreadsheetId,
        }
      }
    } catch (e) {
      console.error('Failed to load google-service-account.json:', e)
    }
  }

  return null
}

export function getSalesforceFiscalQuarter(): string {
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

export function getQuarterSheetName(quarter: string): string {
  return quarter
}

export function getCurrentQuarter(): string {
  return getSalesforceFiscalQuarter()
}

const HEADERS = ['Timestamp', 'Full Name', 'Email Address', 'Region', 'Hub', 'What event did you work on?', 'What was your role in the event?', 'Who is your manager?', 'Which program did you work on?', 'Quarter', 'Points']

export class GoogleSheetsService {
  private sheets: any
  private isConfigured: boolean = false
  private config: { credentials: ServiceAccountCredentials; spreadsheetId: string } | null = null

  constructor() {
    this.config = loadCredentials()
    this.isConfigured = !!this.config
  }

  isGoogleSheetsConfigured(): boolean {
    return this.isConfigured
  }

  private initializeSheets() {
    if (!this.isConfigured || !this.config) {
      throw new Error('Google Sheets is not configured. Using local storage fallback.')
    }

    if (!this.sheets) {
      const auth = new google.auth.GoogleAuth({
        credentials: this.config.credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      })

      this.sheets = google.sheets({ version: 'v4', auth })
    }
    return this.sheets
  }

  private getSpreadsheetId(): string {
    if (!this.config) throw new Error('Google Sheets not configured')
    return this.config.spreadsheetId
  }

  async ensureSheet(sheetName: string): Promise<void> {
    const spreadsheetId = this.getSpreadsheetId()
    const sheets = this.initializeSheets()

    try {
      const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId })
      const existing = spreadsheet.data.sheets?.find(
        (s: any) => s.properties?.title === sheetName
      )

      if (!existing) {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: [{ addSheet: { properties: { title: sheetName } } }],
          },
        })
      }

      // Ensure headers on this tab
      const headerResp = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `'${sheetName}'!A1:K1`,
      })

      if (!headerResp.data.values || headerResp.data.values.length === 0) {
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `'${sheetName}'!A1:K1`,
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: [HEADERS] },
        })
      }
    } catch (error) {
      console.error(`Error ensuring sheet "${sheetName}":`, error)
      throw error
    }
  }

  async logActivity(data: ActivityData, customTimestamp?: string): Promise<void> {
    if (!this.isConfigured) {
      throw new Error('Google Sheets not configured')
    }

    const sheetName = getQuarterSheetName(data.quarter)
    const timestamp = customTimestamp || new Date().toISOString()
    const spreadsheetId = this.getSpreadsheetId()
    const sheets = this.initializeSheets()

    try {
      await this.ensureSheet(sheetName)

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `'${sheetName}'!A:K`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[
            timestamp,
            data.fullName,
            data.emailAddress,
            data.region,
            data.hub,
            data.eventName,
            data.role,
            data.manager,
            data.program,
            data.quarter,
            data.points
          ]],
        },
      })
    } catch (error) {
      console.error('Error logging to Google Sheets:', error)
      throw new Error('Failed to log activity to Google Sheets')
    }
  }

  /**
   * Batch import activities to a sheet. Appends rows in batches of 100.
   */
  async batchImportActivities(activities: ActivityData[], quarter: string = 'Q4 FY26'): Promise<{ imported: number; errors: string[] }> {
    if (!this.isConfigured) {
      throw new Error('Google Sheets not configured')
    }

    const sheetName = getQuarterSheetName(quarter)
    const spreadsheetId = this.getSpreadsheetId()
    const sheets = this.initializeSheets()
    const errors: string[] = []

    try {
      await this.ensureSheet(sheetName)

      const BATCH_SIZE = 100
      let imported = 0

      for (let i = 0; i < activities.length; i += BATCH_SIZE) {
        const batch = activities.slice(i, i + BATCH_SIZE)
        const rows = batch.map((data) => [
          new Date().toISOString(),
          data.fullName,
          data.emailAddress,
          data.region,
          data.hub,
          data.eventName,
          data.role,
          data.manager,
          data.program,
          data.quarter || quarter,
          data.points,
        ])

        await sheets.spreadsheets.values.append({
          spreadsheetId,
          range: `'${sheetName}'!A:K`,
          valueInputOption: 'USER_ENTERED',
          insertDataOption: 'INSERT_ROWS',
          requestBody: { values: rows },
        })

        imported += batch.length
        console.log(`Imported ${imported}/${activities.length} rows...`)
      }

      return { imported, errors }
    } catch (error) {
      console.error('Error batch importing to Google Sheets:', error)
      throw new Error('Failed to batch import activities to Google Sheets')
    }
  }

  async getActivities(limit: number = 100, quarter?: string): Promise<any[]> {
    if (!this.isConfigured) {
      throw new Error('Google Sheets not configured')
    }

    const sheetName = quarter || getCurrentQuarter()
    const spreadsheetId = this.getSpreadsheetId()
    const sheets = this.initializeSheets()

    try {
      await this.ensureSheet(sheetName)

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `'${sheetName}'!A2:K${limit + 1}`,
      })

      if (!response.data.values) {
        return []
      }

      return response.data.values.map((row: any[]) => ({
        timestamp: row[0],
        fullName: row[1],
        emailAddress: row[2],
        region: row[3],
        hub: row[4],
        eventName: row[5],
        role: row[6],
        manager: row[7],
        program: row[8],
        quarter: row[9],
        points: parseInt(row[10]) || 0,
      }))
    } catch (error) {
      console.error('Error fetching activities from Google Sheets:', error)
      throw new Error('Failed to fetch activities from Google Sheets')
    }
  }

  async clearSheet(quarter?: string): Promise<void> {
    if (!this.isConfigured) {
      throw new Error('Google Sheets not configured')
    }

    const sheetName = quarter || getCurrentQuarter()
    const spreadsheetId = this.getSpreadsheetId()
    const sheets = this.initializeSheets()

    try {
      await this.ensureSheet(sheetName)

      await sheets.spreadsheets.values.clear({
        spreadsheetId,
        range: `'${sheetName}'!A2:K`,
      })

      console.log(`✅ Cleared data from sheet "${sheetName}"`)
    } catch (error) {
      console.error(`Error clearing sheet "${sheetName}":`, error)
      throw new Error('Failed to clear Google Sheets data')
    }
  }

  async listSheets(): Promise<string[]> {
    if (!this.isConfigured) {
      throw new Error('Google Sheets not configured')
    }

    const spreadsheetId = this.getSpreadsheetId()
    const sheets = this.initializeSheets()

    try {
      const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId })
      const allTabs: string[] = (spreadsheet.data.sheets || [])
        .map((s: any) => s.properties?.title)
        .filter(Boolean)

      // Return only quarter-formatted tabs (Q1 FY26, Q2 FY26, etc.)
      return allTabs
        .filter((name: string) => /^Q[1-4] FY\d{2}$/.test(name))
        .sort((a: string, b: string) => {
          const aMatch = a.match(/^Q(\d) FY(\d{2})$/)
          const bMatch = b.match(/^Q(\d) FY(\d{2})$/)
          if (!aMatch || !bMatch) return 0
          
          const [, qa, ya] = aMatch.map(Number)
          const [, qb, yb] = bMatch.map(Number)
          return ya !== yb ? yb - ya : qb - qa
        })
    } catch (error) {
      console.error('Error listing sheets:', error)
      throw new Error('Failed to list sheets')
    }
  }
}

export const googleSheetsService = new GoogleSheetsService()
