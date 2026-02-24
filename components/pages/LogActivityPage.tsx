"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { CheckCircle, Star, Users, Heart, Zap, Loader2 } from "lucide-react"

const activityTypes = [
  {
    id: "project-manager",
    role: "Project Manager",
    points: 100,
    description: "Lead and coordinate cultural initiatives",
    gradient: "from-purple-500 to-pink-500",
    icon: Star,
  },
  {
    id: "committee-member",
    role: "Committee Member",
    points: 50,
    description: "Actively participate in planning committees",
    gradient: "from-blue-500 to-cyan-500",
    icon: Users,
  },
  {
    id: "on-site-help",
    role: "On-site Help",
    points: 25,
    description: "Provide support during events and activities",
    gradient: "from-green-500 to-emerald-500",
    icon: Heart,
  },
]

interface LogActivityPageProps {
  onNavigate: (page: string) => void
}

export default function LogActivityPage({ onNavigate }: LogActivityPageProps) {
  const [formData, setFormData] = useState({
    role: "",
    eventName: "",
    eventDate: "",
    name: "",
    slackHandle: "",
    notes: "",
    notifyManager: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submissionResult, setSubmissionResult] = useState<any>(null)

  const handleDismissSuccess = () => {
    setIsSubmitted(false)
    setFormData({
      role: "",
      eventName: "",
      eventDate: "",
      name: "",
      slackHandle: "",
      notes: "",
      notifyManager: false,
    })
    setSubmissionResult(null)
    onNavigate("dashboard")
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.role) newErrors.role = "Please select a participation role."
    if (!formData.eventName) newErrors.eventName = "Event name is required."
    if (!formData.eventDate) newErrors.eventDate = "Event date is required."
    if (!formData.name) newErrors.name = "Your name is required."
    if (!formData.slackHandle) newErrors.slackHandle = "Slack handle is required."
    else if (!formData.slackHandle.startsWith("@")) newErrors.slackHandle = "Slack handle must start with @."
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/log-activity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        setSubmissionResult(result)
        setIsSubmitted(true)
        // Remove auto-hide timeout - user will click OK button to dismiss
      } else {
        throw new Error(result.error || "Failed to submit")
      }
    } catch (error) {
      console.error("Submission error:", error)
      setErrors({ submit: "Failed to submit activity. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }))

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  if (isSubmitted) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="liquid-glass border-0 shadow-2xl rounded-3xl p-12 text-center relative overflow-hidden"
          >
            {/* Confetti Effect */}
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 50 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    backgroundColor: ["#fb7c47", "#87ceeb", "#fbbf24", "#10b981"][Math.floor(Math.random() * 4)],
                  }}
                  animate={{
                    y: [-20, -100],
                    opacity: [1, 0],
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 2,
                    delay: Math.random() * 2,
                    repeat: Number.POSITIVE_INFINITY,
                  }}
                />
              ))}
            </div>

            <div className="relative z-10 space-y-6">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center shadow-2xl">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>

              <div className="space-y-4">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Activity Logged Successfully!
                </h2>
              </div>

              {submissionResult && (
                <div className="bg-gray-100 dark:bg-white/10 backdrop-blur-sm rounded-2xl p-6 space-y-2">
                  <p className="text-2xl font-bold text-orange-500">+{submissionResult.points} Points Earned! 🌟</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Thank you for your contribution! Your manager has been notified and points are added towards your rockstar points.
                  </p>
                </div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8"
              >
                <Button
                  onClick={handleDismissSuccess}
                  className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-8 py-3 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Continue
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-6">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent tracking-normal">
            Log Your Activity
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Share your cultural contributions and earn points for making Salesforce an amazing place to work!
          </p>
        </div>

        {/* Form */}
        <Card className="liquid-glass border border-gray-200 dark:border-blue-500/20 shadow-2xl p-8 md:p-12 bg-white/90 dark:bg-card/70 backdrop-blur-md">
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Role Selection */}
            <div className="space-y-6">
              <label className="block text-2xl font-bold text-center text-gray-900 dark:text-white">Choose Your Participation Role</label>
              <div className="grid md:grid-cols-3 gap-6">
                {activityTypes.map((activity, index) => (
                  <motion.label
                    key={activity.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative p-8 border-2 rounded-3xl cursor-pointer transition-all duration-300 group ${
                      formData.role === activity.id
                        ? "border-orange-500 bg-gradient-to-br from-orange-500/10 to-pink-500/10 shadow-2xl scale-105"
                        : "border-gray-200 dark:border-white/20 hover:border-orange-300 dark:hover:border-orange-300 hover:shadow-xl hover:scale-102 bg-white/60 dark:bg-transparent"
                    }`}
                    whileHover={{ y: -5 }}
                  >
                    <input type="radio" name="role" value={activity.id} onChange={handleChange} className="sr-only" />

                    <div className="text-center space-y-4">
                      <div
                        className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-r ${activity.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                      >
                        <activity.icon 
                          className={`w-10 h-10 text-white transition-all duration-300 ${
                            activity.id === 'project-manager' 
                              ? 'group-hover:animate-spin-slow' 
                              : activity.id === 'committee-member'
                              ? 'group-hover:animate-bounce'
                              : activity.id === 'on-site-help'
                              ? 'group-hover:animate-heartbeat'
                              : ''
                          }`} 
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="text-4xl font-bold text-orange-500">{activity.points}</div>
                        <div className="text-xs font-bold text-gray-500 dark:text-gray-400 tracking-wider">POINTS</div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{activity.role}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{activity.description}</p>
                      </div>
                    </div>

                    {formData.role === activity.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-3 -right-3 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center shadow-lg"
                      >
                        <CheckCircle className="w-6 h-6 text-white" />
                      </motion.div>
                    )}
                  </motion.label>
                ))}
              </div>
              {errors.role && <p className="text-red-500 text-center">{errors.role}</p>}
            </div>

            {/* Form Fields */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label htmlFor="eventName" className="block text-lg font-semibold text-gray-900 dark:text-white">
                  Event Name *
                </label>
                <Input
                  type="text"
                  id="eventName"
                  name="eventName"
                  value={formData.eventName}
                  onChange={handleChange}
                  placeholder="e.g., Salesforce Adventure Club"
                  className={`h-14 text-lg border-2 transition-all duration-300 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
                    errors.eventName ? "border-red-500" : "border-gray-300 dark:border-white/20 focus:border-orange-500"
                  }`}
                />
                {errors.eventName && <p className="text-red-500 text-sm">{errors.eventName}</p>}
              </div>

              <div className="space-y-3">
                <label htmlFor="eventDate" className="block text-lg font-semibold text-gray-900 dark:text-white">
                  Event Date *
                </label>
                <Input
                  type="date"
                  id="eventDate"
                  name="eventDate"
                  value={formData.eventDate}
                  onChange={handleChange}
                  className={`h-14 text-lg border-2 transition-all duration-300 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white ${
                    errors.eventDate ? "border-red-500" : "border-gray-300 dark:border-white/20 focus:border-orange-500"
                  }`}
                />
                {errors.eventDate && <p className="text-red-500 text-sm">{errors.eventDate}</p>}
              </div>

              <div className="space-y-3">
                <label htmlFor="name" className="block text-lg font-semibold text-gray-900 dark:text-white">
                  Your Name *
                </label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className={`h-14 text-lg border-2 transition-all duration-300 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
                    errors.name ? "border-red-500" : "border-gray-300 dark:border-white/20 focus:border-orange-500"
                  }`}
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
              </div>

              <div className="space-y-3">
                <label htmlFor="slackHandle" className="block text-lg font-semibold text-gray-900 dark:text-white">
                  Slack Handle *
                </label>
                <Input
                  type="text"
                  id="slackHandle"
                  name="slackHandle"
                  value={formData.slackHandle}
                  onChange={handleChange}
                  placeholder="@john.doe"
                  className={`h-14 text-lg border-2 transition-all duration-300 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
                    errors.slackHandle ? "border-red-500" : "border-gray-300 dark:border-white/20 focus:border-orange-500"
                  }`}
                />
                {errors.slackHandle && <p className="text-red-500 text-sm">{errors.slackHandle}</p>}
              </div>
            </div>

            <div className="space-y-3">
              <label htmlFor="notes" className="block text-lg font-semibold text-gray-900 dark:text-white">
                Additional Notes
              </label>
              <Textarea
                id="notes"
                name="notes"
                rows={4}
                value={formData.notes}
                onChange={handleChange}
                placeholder="Share more details about your contribution..."
                className="text-lg border-2 border-gray-300 dark:border-white/20 focus:border-orange-500 transition-all duration-300 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            <div className="flex items-center space-x-4 p-6 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl">
              <input
                id="notifyManager"
                name="notifyManager"
                type="checkbox"
                checked={formData.notifyManager}
                onChange={handleChange}
                className="w-6 h-6 rounded border-gray-300 dark:border-gray-600 text-orange-500 focus:ring-orange-500"
              />
              <label htmlFor="notifyManager" className="text-lg font-medium text-gray-900 dark:text-white">
                📧 Notify my manager about this contribution
              </label>
            </div>

            {errors.submit && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                <p className="text-red-500 text-center">{errors.submit}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-16 text-xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Submitting...
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Zap className="w-6 h-6" />
                  Submit Activity & Earn Points 🚀
                </div>
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
