import { eq, desc } from 'drizzle-orm'
import { db } from './index'
import { chats, messages } from './schema'
import type { UIMessage } from 'ai'

function getText(m: UIMessage): string {
  if (m.parts?.length) {
    return m.parts
      .filter((p): p is { type: 'text'; text: string } => p.type === 'text' && p.text != null)
      .map((p) => p.text)
      .join('')
  }
  const c = (m as { content?: string }).content
  return typeof c === 'string' ? c : ''
}

export async function createChat(userId: string, title = 'New Chat', id?: string) {
  if (!db) return null
  const values = id ? { id, userId, title } : { userId, title }
  const [chat] = await db.insert(chats).values(values).returning()
  return chat
}

export async function getChat(chatId: string, userId: string) {
  if (!db) return null
  const [chat] = await db
    .select()
    .from(chats)
    .where(eq(chats.id, chatId))
  if (!chat || chat.userId !== userId) return null
  return chat
}

export async function listChats(userId: string, limit = 50) {
  if (!db) return []
  return db
    .select()
    .from(chats)
    .where(eq(chats.userId, userId))
    .orderBy(desc(chats.updatedAt))
    .limit(limit)
}

export async function updateChatTitle(chatId: string, userId: string, title: string) {
  if (!db) return null
  const [updated] = await db
    .update(chats)
    .set({ title, updatedAt: new Date() })
    .where(eq(chats.id, chatId))
    .returning()
  if (!updated || updated.userId !== userId) return null
  return updated
}

export async function addMessage(chatId: string, role: 'user' | 'assistant' | 'system', content: string) {
  if (!db) return null
  const [msg] = await db
    .insert(messages)
    .values({ chatId, role, content })
    .returning()
  if (msg) {
    await db.update(chats).set({ updatedAt: new Date() }).where(eq(chats.id, chatId))
  }
  return msg
}

export async function getMessages(chatId: string, userId: string) {
  if (!db) return null
  const chat = await getChat(chatId, userId)
  if (!chat) return null
  const rows = await db
    .select()
    .from(messages)
    .where(eq(messages.chatId, chatId))
    .orderBy(messages.createdAt)
  return rows
}

export async function loadChatAsUIMessages(chatId: string, userId: string): Promise<UIMessage[] | null> {
  const rows = await getMessages(chatId, userId)
  if (!rows) return null
  return rows.map((r) => ({
    id: r.id,
    role: r.role as 'user' | 'assistant' | 'system',
    parts: [{ type: 'text' as const, text: r.content }],
  }))
}

export async function saveChatMessages(chatId: string, userId: string, uiMessages: UIMessage[]) {
  if (!db) return false
  const chat = await getChat(chatId, userId)
  if (!chat) return false
  await db.delete(messages).where(eq(messages.chatId, chatId))
  for (const m of uiMessages) {
    const text = getText(m)
    if (!text && m.role === 'system') continue
    await db.insert(messages).values({
      id: m.id ?? crypto.randomUUID(),
      chatId,
      role: m.role,
      content: text || '(empty)',
    })
  }
  await db.update(chats).set({ updatedAt: new Date() }).where(eq(chats.id, chatId))
  return true
}
