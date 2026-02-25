"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useUser } from "@clerk/nextjs"
import { Bot, User, Send, Loader2, X } from "lucide-react"
import ReactMarkdown from "react-markdown"

function getUserInitials(firstName?: string | null, lastName?: string | null): string {
  const first = firstName?.trim().charAt(0)?.toUpperCase() || ""
  const last = lastName?.trim().charAt(0)?.toUpperCase() || ""
  if (first && last) return first + last
  if (first) return first
  return ""
}

function getMessageText(message: { parts?: Array<{ type: string; text?: string }>; content?: string }): string {
  if (message.parts?.length) {
    return message.parts
      .filter((p): p is { type: 'text'; text: string } => p.type === 'text' && p.text != null)
      .map(p => p.text)
      .join('')
  }
  return typeof message.content === 'string' ? message.content : ''
}

const questionPools: Record<string, string[]> = {
  signup: [
    'How do I sign up for Culture Guides?',
    'What happens after I sign up?',
    'When does the FY27 sign-up close?',
    'Is manager approval required to join?',
    'How long is the Culture Guide term?',
  ],
  leads: [
    'Who is the regional lead for India?',
    'Who is the regional lead for APAC?',
    'Who is the regional lead for AMER?',
    'How do I become a Hub Lead?',
    'What does a Hub Lead do?',
    'Who is the program owner?',
    'Who is my hub lead?',
  ],
  points: [
    'How do I log my points?',
    'What can I redeem points for?',
    'How many points for project managing an event?',
    'How many points for on-site help?',
    'When can I redeem points?',
  ],
  events: [
    'What is the budget per person for events?',
    'What is Meetingforce and when do I need it?',
    'What are the marquee events?',
    'What local events can Culture Guides run?',
    'How do I plan a post-event recap?',
    'What tools help with event communications?',
  ],
  sustainability: [
    'What are the sustainability rules for events?',
    'Can I give away swag at events?',
    'What food restrictions apply to catering?',
  ],
  slack: [
    'What is the Culture Guides Slack channel?',
    'What hub-specific Slack channels exist?',
    'How do I use the Culture Guide Rockstars workflow?',
  ],
  program: [
    'What is the Culture Guides Program?',
    'What is the time commitment for Culture Guides?',
    'What marquee events do Culture Guides support?',
    'Who is the Culture Guides Program Owner?',
  ],
}

const topicOrder = ['signup', 'leads', 'points', 'events', 'sustainability', 'slack', 'program']

function detectTopic(text: string): string {
  if (text.includes('sign up') || text.includes('join') || text.includes('fy27') || text.includes('registration')) return 'signup'
  if (text.includes('hub lead') || text.includes('lead for') || text.includes('region lead') || text.includes('regional lead') || text.includes('program owner')) return 'leads'
  if (text.includes('point') || text.includes('reward') || text.includes('rockstar') || text.includes('redeem')) return 'points'
  if (text.includes('event') || text.includes('planning') || text.includes('budget') || text.includes('meetingforce')) return 'events'
  if (text.includes('sustainab') || text.includes('plastic') || text.includes('catering') || text.includes('swag')) return 'sustainability'
  if (text.includes('slack') || text.includes('channel') || text.includes('#cultureguides')) return 'slack'
  return 'program'
}

function pickUnused(pool: string[], used: Set<string>, count: number): string[] {
  const available = pool.filter(q => !used.has(q))
  return available.slice(0, count)
}

export default function ResourcesChatbot() {
  const { user } = useUser()
  const userInitials = getUserInitials(user?.firstName, user?.lastName)
  const [isOpen, setIsOpen] = useState(false)
  const [inputMessage, setInputMessage] = useState("")
  const [suggestions, setSuggestions] = useState([
    "What is the Culture Guides Program?",
    "How do I earn points?",
    "What events do Culture Guides plan?",
  ])
  const usedQuestionsRef = useRef<Set<string>>(new Set())
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
    messages: [
      {
        id: 'welcome',
        role: 'assistant',
        parts: [{ type: 'text', text: "Hello! I'm the Culture Guide Assistant. I'm ready to answer your questions about event planning, rewards points, sustainability, and hub leads." }],
      },
    ],
  })

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || status !== 'ready') return
    sendMessage({ text: inputMessage })
    setInputMessage("")
  }

  const isTyping = status === 'submitted' || status === 'streaming'

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  useEffect(() => {
    if (!isTyping) {
      const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant')
      if (!lastAssistant) return
      const text = getMessageText(lastAssistant as Parameters<typeof getMessageText>[0]).toLowerCase()
      const currentTopic = detectTopic(text)
      const sameTopic = pickUnused(questionPools[currentTopic], usedQuestionsRef.current, 2)
      const otherTopics = topicOrder.filter(t => t !== currentTopic)
      let crossQuestion: string | undefined
      for (const topic of otherTopics) {
        const available = pickUnused(questionPools[topic], usedQuestionsRef.current, 1)
        if (available.length > 0) { crossQuestion = available[0]; break }
      }
      const next = crossQuestion ? [...sameTopic, crossQuestion] : sameTopic
      if (next.length > 0) setSuggestions(next)
    }
  }, [messages, isTyping])

  return (
    <>
      {/* Floating trigger button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500 shadow-lg hover:shadow-xl flex items-center justify-center text-white transition-shadow"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open Resources chat"
      >
        <Bot className="w-7 h-7" />
      </motion.button>

      {/* Compact chat popup - Chatfuel style */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] h-[520px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden"
          >
            {/* Header - Original AI Assistant style */}
            <div className="relative bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500 p-4 rounded-t-2xl">
              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-white">AI Assistant</h2>
                  <p className="text-white/80 text-sm">
                    {isTyping ? "Thinking…" : "Enhanced with Culture Guides Knowledge Base"}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="absolute top-3 right-3 h-8 w-8 rounded-full hover:bg-white/20 text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800/50">
              {messages.map((msg, index) => {
                const isUser = (msg as { role: string }).role === 'user'
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.05, 0.2) }}
                    className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`flex items-start gap-2 max-w-[85%] ${isUser ? "flex-row-reverse" : ""}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold ${
                        isUser ? "bg-gradient-to-br from-orange-400 to-pink-500" : "bg-gradient-to-br from-blue-400 to-cyan-500"
                      }`}>
                        {isUser ? (
                          userInitials ? (
                            <span>{userInitials}</span>
                          ) : (
                            <User className="w-4 h-4 text-white" />
                          )
                        ) : (
                          <Bot className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div className={`p-3 rounded-2xl text-sm ${
                        isUser
                          ? "bg-gradient-to-br from-orange-500 to-pink-500 text-white"
                          : "bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-slate-200"
                      }`}>
                        {isUser ? (
                          <p className="leading-relaxed">{getMessageText(msg)}</p>
                        ) : (
                          <div className="leading-relaxed prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5">
                            <ReactMarkdown>{getMessageText(msg)}</ReactMarkdown>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}

              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-3 py-2 rounded-2xl">
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <motion.span
                            key={i}
                            className="w-2 h-2 rounded-full bg-blue-400"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 space-y-2">
              {!isTyping && (
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        usedQuestionsRef.current.add(suggestion)
                        setInputMessage(suggestion)
                      }}
                      className="px-2.5 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full hover:bg-blue-50 dark:hover:bg-gray-600 hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 h-10 text-sm rounded-xl"
                  disabled={isTyping}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!inputMessage.trim() || isTyping}
                  className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 flex-shrink-0"
                >
                  {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
