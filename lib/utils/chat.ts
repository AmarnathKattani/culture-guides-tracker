import { nanoid } from 'nanoid'
import type { UIMessage } from 'ai'

export function generateUUID(): string {
  return nanoid(21)
}

export function getMessageText(message: { parts?: Array<{ type: string; text?: string }>; content?: string }): string {
  if (message.parts?.length) {
    return message.parts
      .filter((p): p is { type: 'text'; text: string } => p.type === 'text' && p.text != null)
      .map((p) => p.text)
      .join('')
  }
  return typeof message.content === 'string' ? message.content : ''
}

export function dbMessagesToUIMessages(
  rows: Array<{ id: string; role: string; content: string }>
): UIMessage[] {
  return rows.map((r) => ({
    id: r.id,
    role: r.role as 'user' | 'assistant' | 'system',
    parts: [{ type: 'text' as const, text: r.content }],
  }))
}

export function uiMessagesToDbFormat(messages: UIMessage[]): Array<{ id: string; role: string; content: string }> {
  return messages.map((m) => ({
    id: m.id ?? generateUUID(),
    role: m.role,
    content: getMessageText(m),
  }))
}
