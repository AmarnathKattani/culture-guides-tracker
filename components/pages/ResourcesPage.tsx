"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Play, SkipBack, SkipForward, Pause, Volume2, Headphones, Users } from "lucide-react"
import { ShineBorder } from "@/components/ui/shine-border"
import Image from "next/image"

const programOwners = [
  {
    name: "Lauren Prince",
    regionLabel: "AMER Lead",
    title: "Senior Specialist, Employee Engagement & Events, AMER",
    pronouns: null,
    email: "lauren.prince@salesforce.com",
    imagePath: "/Lauren Prince.png",
  },
  {
    name: "Anshita Sharma",
    regionLabel: "India, ASEAN & Japan Lead",
    title: "Manager, Employee Engagement & Events, India & ASEAN",
    pronouns: "She/Her/Hers",
    email: "anshita.sharma@salesforce.com",
    imagePath: "/Anshita Sharma.png",
  },
  {
    name: "Linda Huynh",
    regionLabel: "ANZ & Korea Lead",
    title: "Senior Specialist, Employee Engagement & Events",
    pronouns: "She/Her/Hers",
    email: "lhuynh@salesforce.com",
    imagePath: "/Linda Huynh.png",
  },
  {
    name: "Melina Rochi",
    regionLabel: "LATAM Lead",
    title: "Manager, Employee Engagement & Events, LATAM",
    pronouns: "She/her",
    email: "mrochi@salesforce.com",
    imagePath: "/Melina Rochi.png",
  },
]

function ProgramOwnerCard({
  person,
  index,
}: {
  person: (typeof programOwners)[0]
  index: number
}) {
  const [imageError, setImageError] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className="group relative h-full liquid-glass border-0 bg-white/90 dark:bg-slate-800/50 shadow-xl hover:shadow-2xl overflow-hidden transition-all duration-300">
        <ShineBorder shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} borderWidth={2} />
        <CardContent className="p-4 relative">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            {person.regionLabel}:
          </p>
          <div className="flex flex-col sm:flex-row gap-3 items-center sm:items-start">
            <motion.div
              className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-slate-700 ring-2 transition-all duration-300 ${
                isHovered ? "ring-orange-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-800" : "ring-transparent"
              }`}
              animate={isHovered ? { scale: 1.05 } : { scale: 1 }}
            >
              {!imageError ? (
                <Image
                  src={person.imagePath}
                  alt={person.name}
                  fill
                  className="object-cover"
                  sizes="96px"
                  onError={() => setImageError(true)}
                />
              ) : null}
              <div
                className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br from-orange-500 to-pink-500 text-white font-bold text-lg ${
                  imageError ? "" : "hidden"
                }`}
              >
                {person.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
            </motion.div>
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {person.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                {person.title}
              </p>
              {person.pronouns && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {person.pronouns}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function ResourcesPage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState("0:00")
  const [duration, setDuration] = useState("0:00")
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => {
      const current = audio.currentTime
      const total = audio.duration
      setCurrentTime(formatTime(current))
      setDuration(formatTime(total))
      setProgress((current / total) * 100)
    }

    const handleLoadedMetadata = () => {
      setDuration(formatTime(audio.duration))
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setProgress(0)
      audio.currentTime = 0
    }

    audio.volume = volume
    audio.addEventListener("timeupdate", updateTime)
    audio.addEventListener("loadedmetadata", handleLoadedMetadata)
    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.removeEventListener("timeupdate", updateTime)
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      audio.removeEventListener("ended", handleEnded)
    }
  }, [volume])

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00"
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const togglePlayPause = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const skipForward = () => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = Math.min(audio.currentTime + 10, audio.duration)
  }

  const skipBackward = () => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = Math.max(audio.currentTime - 10, 0)
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    if (!audio) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    audio.currentTime = percentage * audio.duration
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
    const audio = audioRef.current
    if (audio) {
      audio.volume = newVolume
    }
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isMuted) {
      audio.volume = volume
      setIsMuted(false)
    } else {
      audio.volume = 0
      setIsMuted(true)
    }
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen space-y-12">
      {/* Podcast Section */}
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-6"
        >
          <div className="inline-flex items-center justify-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 dark:from-emerald-500/30 dark:to-teal-500/30">
              <Headphones className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-1">
            <span className="text-gray-900 dark:text-white">Culture Guides </span>
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
              Podcast
            </span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Listen to the Culture Guides team share insights on building connections</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 dark:from-blue-900/40 dark:via-purple-900/30 dark:to-indigo-900/40 border border-gray-200 dark:border-blue-500/20 shadow-xl backdrop-blur-md">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Album Art - Spinning Circular Culture Guides Logo */}
                <div className="w-20 h-20 rounded-full overflow-hidden shadow-lg flex-shrink-0 bg-white dark:bg-white p-1">
                  <motion.img
                    src="/culture-guides-logo.png"
                    alt="Culture Guides Logo"
                    className="w-full h-full object-contain rounded-full"
                    animate={isPlaying ? { rotate: 360 } : {}}
                    transition={isPlaying ? { duration: 3, repeat: Infinity, ease: "linear" } : {}}
                  />
                </div>

                {/* Track Info */}
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">Ohana Connect</h3>
                  <p className="text-green-600 dark:text-green-400 text-base font-medium mb-1">Culture Guides Team</p>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Building connections that drive innovation at Salesforce</p>
                </div>
              </div>

              {/* Spotify-style Progress Bar */}
              <div className="space-y-3 mt-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-600 dark:text-slate-400 w-8">{currentTime}</span>
                  <div className="flex-1 group">
                    <div
                      className="w-full bg-gray-300 dark:bg-slate-600 rounded-full h-1 hover:h-1.5 transition-all duration-200 cursor-pointer"
                      onClick={handleProgressClick}
                    >
                      <div
                        className="bg-green-600 dark:bg-green-500 h-full rounded-full relative transition-all duration-200"
                        style={{ width: `${progress}%` }}
                      >
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-gray-800 dark:bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"></div>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-slate-600 dark:text-slate-400 w-8">{duration}</span>
                </div>
              </div>

              {/* Spotify-style Player Controls */}
              <div className="flex items-center justify-center gap-4 mt-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={skipBackward}
                  className="hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 hover:text-gray-800 dark:hover:text-white w-8 h-8"
                >
                  <SkipBack className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  onClick={togglePlayPause}
                  className="w-12 h-12 bg-green-600 hover:bg-green-500 dark:bg-green-500 dark:hover:bg-green-400 text-white rounded-full shadow-lg hover:scale-105 transition-all"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={skipForward}
                  className="hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 hover:text-gray-800 dark:hover:text-white w-8 h-8"
                >
                  <SkipForward className="w-4 h-4" />
                </Button>
              </div>

              {/* Volume Control */}
              <div className="flex items-center justify-center gap-3 mt-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  className="hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 hover:text-gray-800 dark:hover:text-white w-8 h-8"
                >
                  <Volume2 className={`w-4 h-4 ${isMuted ? "opacity-50" : ""}`} />
                </Button>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-1 bg-gray-300 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #059669 0%, #059669 ${(isMuted ? 0 : volume) * 100}%, #94a3b8 ${(isMuted ? 0 : volume) * 100}%, #94a3b8 100%)`,
                    }}
                  />
                  <span className="text-xs text-slate-500 dark:text-slate-400 w-8 text-center">
                    {Math.round((isMuted ? 0 : volume) * 100)}%
                  </span>
                </div>
              </div>

              <audio ref={audioRef} src="/audio/culture-intro.wav" preload="metadata" />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Culture Guides Regional Program Owners */}
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-6"
        >
          <div className="inline-flex items-center justify-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 dark:from-indigo-500/30 dark:to-violet-500/30">
              <Users className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-1">
            <span className="text-gray-900 dark:text-white">Culture Guides Regional </span>
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 dark:from-indigo-400 dark:via-violet-400 dark:to-purple-400 bg-clip-text text-transparent">
              Program Owners
            </span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm max-w-2xl mx-auto mt-1 mb-6">
            Meet the leaders driving culture and engagement across our global regions
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
            {programOwners.map((person, index) => (
              <ProgramOwnerCard key={person.name} person={person} index={index} />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
