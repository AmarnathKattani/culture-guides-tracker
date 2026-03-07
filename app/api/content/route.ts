import { NextResponse } from 'next/server'
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase'

export async function GET(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ blocks: {} }, { status: 200 })
  }

  const supabase = getSupabaseClient()
  if (!supabase) return NextResponse.json({ blocks: {} }, { status: 200 })

  const { searchParams } = new URL(req.url)
  const slugs = searchParams.get('slugs')?.split(',').filter(Boolean) ?? []

  try {
    let query = supabase.from('content_blocks').select('slug, content')
    if (slugs.length > 0) {
      query = query.in('slug', slugs)
    }
    const { data, error } = await query

    if (error) {
      console.warn('Supabase content_blocks fetch error:', error)
      return NextResponse.json({ blocks: {} }, { status: 200 })
    }

    const blocks: Record<string, string> = {}
    for (const row of data ?? []) {
      blocks[row.slug] = row.content ?? ''
    }
    return NextResponse.json({ blocks })
  } catch (err) {
    console.warn('Content fetch error:', err)
    return NextResponse.json({ blocks: {} }, { status: 200 })
  }
}
