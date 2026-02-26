"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { CheckCircle, Star, Users, Heart, Phone, Loader2 } from "lucide-react"
import { useUser } from "@clerk/nextjs"

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
    role: "On-site Help (Logistics)",
    points: 25,
    description: "Provide support during events and activities",
    gradient: "from-green-500 to-emerald-500",
    icon: Heart,
  },
  {
    id: "managed-committee-call",
    role: "Managed Committee Call",
    points: 25,
    description: "Organize and lead committee meetings",
    gradient: "from-orange-500 to-red-500",
    icon: Phone,
  },
]

interface LogActivityPageProps {
  onNavigate: (page: string) => void
}

export default function LogActivityPage({ onNavigate }: LogActivityPageProps) {
  const { user } = useUser()
  const [formData, setFormData] = useState({
    fullName: "",
    emailAddress: "",
    region: "",
    hub: "",
    eventName: "",
    role: "",
    manager: "",
    program: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submissionResult, setSubmissionResult] = useState<any>(null)

  // Auto-populate user data from Clerk
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        emailAddress: user.primaryEmailAddress?.emailAddress || '',
      }))
    }
  }, [user])

  const handleDismissSuccess = () => {
    setIsSubmitted(false)
    setFormData({
      fullName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
      emailAddress: user?.primaryEmailAddress?.emailAddress || '',
      region: "",
      hub: "",
      eventName: "",
      role: "",
      manager: "",
      program: "",
    })
    setSubmissionResult(null)
    onNavigate("dashboard")
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.fullName) newErrors.fullName = "Full name is required."
    if (!formData.emailAddress) newErrors.emailAddress = "Email address is required."
    if (!formData.region) newErrors.region = "Please select a region."
    if (!formData.hub) newErrors.hub = "Hub is required."
    if (!formData.eventName) newErrors.eventName = "Event name is required."
    if (!formData.role) newErrors.role = "Please select your role in the event."
    if (!formData.manager) newErrors.manager = "Manager name is required."
    if (!formData.program) newErrors.program = "Please select a program."
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
            Culture Guide Points
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Share your cultural contributions and earn points for making Salesforce an amazing place to work!
          </p>
        </div>

        {/* Form */}
        <Card className="liquid-glass border border-gray-200 dark:border-blue-500/20 shadow-2xl p-8 md:p-12 bg-white/90 dark:bg-card/70 backdrop-blur-md">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Full Name - Auto-populated, not editable */}
            <div className="space-y-3">
              <label className="block text-lg font-semibold text-gray-900 dark:text-white">Full Name</label>
              <Input
                name="fullName"
                value={formData.fullName}
                readOnly
                className="h-12 text-base border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
              />
              {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName}</p>}
            </div>

            {/* Email Address - Auto-populated, not editable */}
            <div className="space-y-3">
              <label className="block text-lg font-semibold text-gray-900 dark:text-white">Email Address</label>
              <Input
                name="emailAddress"
                value={formData.emailAddress}
                readOnly
                className="h-12 text-base border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
              />
              {errors.emailAddress && <p className="text-red-500 text-sm">{errors.emailAddress}</p>}
            </div>

            {/* Region - Dropdown */}
            <div className="space-y-3">
              <label className="block text-lg font-semibold text-gray-900 dark:text-white">
                Region
              </label>
              <select
                name="region"
                value={formData.region}
                onChange={handleChange}
                className="w-full h-12 text-base border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-orange-500 focus:ring-orange-500 bg-white dark:bg-gray-800"
              >
                <option value="">Select an option</option>
                <option value="AMER">AMER</option>
                <option value="EMEA">EMEA</option>
                <option value="JAPAC">JAPAC</option>
                <option value="India">India</option>
              </select>
              {errors.region && <p className="text-red-500 text-sm">{errors.region}</p>}
            </div>

            {/* Hub - Text input */}
            <div className="space-y-3">
              <label className="block text-lg font-semibold text-gray-900 dark:text-white">
                Hub
              </label>
              <Input
                name="hub"
                value={formData.hub}
                onChange={handleChange}
                placeholder="Write something"
                className="h-12 text-base border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-orange-500 focus:ring-orange-500 bg-white dark:bg-gray-800"
              />
              {errors.hub && <p className="text-red-500 text-sm">{errors.hub}</p>}
            </div>

            {/* Event Name */}
            <div className="space-y-3">
              <label className="block text-lg font-semibold text-gray-900 dark:text-white">
                What event did you work on?
              </label>
              <Input
                name="eventName"
                value={formData.eventName}
                onChange={handleChange}
                placeholder="Write something"
                className="h-12 text-base border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-orange-500 focus:ring-orange-500 bg-white dark:bg-gray-800"
              />
              <p className="text-sm text-gray-500">ex: Salesforce Birthday, Dreamforce, any local event.</p>
              {errors.eventName && <p className="text-red-500 text-sm">{errors.eventName}</p>}
            </div>

            {/* Role - Dropdown */}
            <div className="space-y-3">
              <label className="block text-lg font-semibold text-gray-900 dark:text-white">
                What was your role in the event?
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full h-12 text-base border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-orange-500 focus:ring-orange-500 bg-white dark:bg-gray-800"
              >
                <option value="">Select an option</option>
                <option value="project-manager">Project Manager</option>
                <option value="committee-member">Committee Member</option>
                <option value="on-site-help">On-site Help (Logistics)</option>
                <option value="managed-committee-call">Managed Committee Call</option>
              </select>
              {errors.role && <p className="text-red-500 text-sm">{errors.role}</p>}
            </div>

            {/* Manager - Text input */}
            <div className="space-y-3">
              <label className="block text-lg font-semibold text-gray-900 dark:text-white">
                Who is your manager?
              </label>
              <Input
                name="manager"
                value={formData.manager}
                onChange={handleChange}
                placeholder="Write something"
                className="h-12 text-base border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-orange-500 focus:ring-orange-500 bg-white dark:bg-gray-800"
              />
              {errors.manager && <p className="text-red-500 text-sm">{errors.manager}</p>}
            </div>

            {/* Program - Dropdown */}
            <div className="space-y-3">
              <label className="block text-lg font-semibold text-gray-900 dark:text-white">
                Which program did you work on?
              </label>
              <select
                name="program"
                value={formData.program}
                onChange={handleChange}
                className="w-full h-12 text-base border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-orange-500 focus:ring-orange-500 bg-white dark:bg-gray-800"
              >
                <option value="">Select an option</option>
                <option value="Culture Guides">Culture Guides</option>
                <option value="Salesforce at Home">Salesforce at Home</option>
              </select>
              {errors.program && <p className="text-red-500 text-sm">{errors.program}</p>}
            </div>

            {errors.submit && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-red-500 text-center">{errors.submit}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 text-lg font-bold bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Submitting...
                </div>
              ) : (
                "Submit Activity & Earn Points"
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
