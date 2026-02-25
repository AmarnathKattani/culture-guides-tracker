import { type NextRequest, NextResponse } from "next/server"

const FALLBACK_DATA = {
  title: "Ohana Connect",
  description:
    "An inspiring conversation on how we shape the future of work at Salesforce through our Ohana culture.",
  audioUrl: "https://drive.google.com/uc?export=download&id=1-Eog4zwEEl6oXPJ8Btuo_mg3JvK6z6L7",
  metadata: { name: "Ohana Connect Episode", size: null, mimeType: "audio/mpeg", createdTime: null },
}

export async function GET(_request: NextRequest) {
  try {
    const apiKey = process.env.GOOGLE_DRIVE_API_KEY
    if (!apiKey) {
      return NextResponse.json({ success: true, data: FALLBACK_DATA })
    }

    const fileId = "1-Eog4zwEEl6oXPJ8Btuo_mg3JvK6z6L7"
    const metadataUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?key=${apiKey}&fields=name,size,mimeType,createdTime`

    const metadataResponse = await fetch(metadataUrl)
    const metadata = await metadataResponse.json()

    if (metadata.error) {
      return NextResponse.json({ success: true, data: FALLBACK_DATA })
    }

    return NextResponse.json({
      success: true,
      data: {
        ...FALLBACK_DATA,
        metadata: {
          name: metadata.name || FALLBACK_DATA.metadata.name,
          size: metadata.size,
          mimeType: metadata.mimeType,
          createdTime: metadata.createdTime,
        },
      },
    })
  } catch (error) {
    console.error("Error fetching podcast data:", error)
    return NextResponse.json({ success: true, data: FALLBACK_DATA })
  }
}
