import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { listChats } from '@/lib/db/queries'
import { isDbConfigured } from '@/lib/db'

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isDbConfigured()) {
    return NextResponse.json({ chats: [] })
  }

  const chats = await listChats(userId)
  return NextResponse.json({
    chats: chats.map((c) => ({
      id: c.id,
      title: c.title,
      updatedAt: c.updatedAt,
    })),
  })
}
