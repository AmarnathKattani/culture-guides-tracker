import { auth } from '@clerk/nextjs/server'
import { createHuggingFace } from '@ai-sdk/huggingface'
import { streamText, convertToModelMessages, type UIMessage } from 'ai'
import { getCultureGuidesSystemPrompt } from '@/lib/supabase-knowledge'
import {
  createChat,
  getChat,
  loadChatAsUIMessages,
  saveChatMessages,
} from '@/lib/db/queries'
import { isDbConfigured } from '@/lib/db'

const huggingface = createHuggingFace({
  apiKey: process.env.HUGGINGFACE_API_KEY,
})

export const maxDuration = 30

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!process.env.HUGGINGFACE_API_KEY) {
    return new Response(
      JSON.stringify({
        error: 'HUGGINGFACE_API_KEY is not configured. Add it to your environment variables.',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const body = await req.json()
  const chatId = body.chatId ?? body.id
  const messagesParam = body.messages as UIMessage[] | undefined
  const messageParam = body.message as UIMessage | undefined

  let messages: UIMessage[]
  let resolvedChatId = chatId

  if (isDbConfigured()) {
    if (messageParam && chatId) {
      let previous = await loadChatAsUIMessages(chatId, userId)
      if (previous === null) {
        await createChat(userId, 'New Chat', chatId)
        previous = []
      }
      messages = [...previous, messageParam]
    } else if (messagesParam?.length) {
      messages = messagesParam
      if (!chatId) {
        const chat = await createChat(userId)
        if (chat) resolvedChatId = chat.id
      } else {
        let chat = await getChat(chatId, userId)
        if (!chat) {
          await createChat(userId, 'New Chat', chatId)
        }
      }
    } else {
      const chat = await createChat(userId)
      if (chat) resolvedChatId = chat.id
      messages = []
    }
  } else {
    messages = messagesParam ?? (messageParam ? [messageParam] : [])
    if (!resolvedChatId) resolvedChatId = crypto.randomUUID()
  }

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const systemPrompt = await getCultureGuidesSystemPrompt(today)

  const result = streamText({
    model: huggingface('Qwen/Qwen2.5-7B-Instruct'),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
  })

  if (isDbConfigured() && resolvedChatId) {
    const chatIdToSave = resolvedChatId
    result.consumeStream()
    return result.toUIMessageStreamResponse({
      originalMessages: messages,
      onFinish: ({ messages: finishedMessages }) => {
        saveChatMessages(chatIdToSave, userId, finishedMessages)
      },
    })
  }

  return result.toUIMessageStreamResponse()
}
