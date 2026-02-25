"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Menu, X, Sun, Moon, User, LogOut } from "lucide-react"
import { useTheme } from "next-themes"
import Image from "next/image"
import { SignedIn, SignedOut, SignInButton, useClerk, useUser } from "@clerk/nextjs"

interface HeaderProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const navItems = [
  { id: "home", label: "Home" },
  { id: "log-activity", label: "Log Activity" },
  { id: "impact", label: "Your Impact" },
  { id: "dashboard", label: "Dashboard" },
  { id: "resources", label: "Resources" },
]

export default function Header({ activeTab, onTabChange }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { signOut } = useClerk()
  const { user } = useUser()
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Only render theme-dependent content after mounting to avoid hydration mismatches
  useEffect(() => {
    setMounted(true)
  }, [])

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [userMenuOpen])

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="backdrop-blur-xl bg-white/70 dark:bg-black/90 dark:border-b dark:border-gray-700/50 shadow-lg shadow-black/5 dark:shadow-black/20">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 sm:h-20 md:h-22 lg:h-24">
            {/* Logo */}
            <motion.div
              className="flex items-center cursor-pointer py-2"
              onClick={() => onTabChange("home")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Image
                src="/salesforce-logo.png"
                alt="Salesforce Logo"
                width={140}
                height={60}
                className="object-contain h-12 w-auto sm:h-14 md:h-16 lg:h-18"
                priority
              />
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-2">
              {navItems.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="ghost"
                    onClick={() => onTabChange(item.id)}
                    className={`relative px-6 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                      activeTab === item.id
                        ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg hover:shadow-xl"
                        : "text-gray-700 dark:text-gray-100 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-gray-700/60 dark:bg-gray-800/40"
                    }`}
                  >
                    {item.label}
                    {activeTab === item.id && (
                      <motion.div
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 -z-10"
                        layoutId="activeTab"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Button>
                </motion.div>
              ))}
            </nav>

            <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
              {/* Theme Toggle */}
              {mounted && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                    className="rounded-xl border-0 bg-gray-100/80 dark:bg-gray-700/60 dark:border dark:border-gray-600/50 hover:bg-gray-200/80 dark:hover:bg-gray-600/60 hidden sm:flex shadow-sm"
                  >
                    <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-gray-700 dark:text-gray-200" />
                    <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-gray-700 dark:text-gray-200" />
                    <span className="sr-only">Toggle theme</span>
                  </Button>
                </motion.div>
              )}

              {/* User Auth */}
              <SignedIn>
                <div className="relative" ref={userMenuRef}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="rounded-xl border-0 bg-gray-100/80 dark:bg-gray-700/60 dark:border dark:border-gray-600/50 hover:bg-gray-200/80 dark:hover:bg-gray-600/60 shadow-sm"
                    >
                      <User className="h-5 w-5 text-gray-700 dark:text-gray-200" />
                    </Button>
                  </motion.div>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-12 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-xl z-50"
                      >
                        <div className="p-4">
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Signed in as:
                          </div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4 break-all">
                            {user?.primaryEmailAddress?.emailAddress}
                          </div>
                          <Button
                            onClick={() => {
                              signOut()
                              setUserMenuOpen(false)
                            }}
                            variant="ghost"
                            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign out
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <Button
                    size="sm"
                    className="rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-medium shadow-sm hidden sm:flex"
                  >
                    Sign In
                  </Button>
                </SignInButton>
              </SignedOut>

              {/* Mobile Menu Button */}
              <div className="lg:hidden">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="rounded-xl border-0 bg-gray-100/80 dark:bg-gray-700/60 dark:border dark:border-gray-600/50 hover:bg-gray-200/80 dark:hover:bg-gray-600/60 shadow-sm"
                  >
                    {isMobileMenuOpen ? (
                      <X className="w-6 h-6 text-gray-700 dark:text-gray-200" />
                    ) : (
                      <Menu className="w-6 h-6 text-gray-700 dark:text-gray-200" />
                    )}
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden backdrop-blur-xl bg-white/70 dark:bg-black/90 dark:border-t dark:border-gray-700/50">
            <nav className="px-3 sm:px-4 py-3 sm:py-4 space-y-3">
              {navItems.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="ghost"
                    onClick={() => {
                      onTabChange(item.id)
                      setIsMobileMenuOpen(false)
                    }}
                    className={`w-full justify-start rounded-xl text-sm sm:text-base font-medium transition-all duration-300 ${
                      activeTab === item.id
                        ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg"
                        : "text-gray-700 dark:text-gray-100 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-gray-700/60 dark:bg-gray-800/40"
                    }`}
                  >
                    {item.label}
                  </Button>
                </motion.div>
              ))}
              
              {/* Mobile Theme Toggle */}
              {mounted && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="ghost"
                    onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                    className="w-full justify-start rounded-xl text-sm sm:text-base font-medium text-gray-700 dark:text-gray-100 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-gray-700/60 dark:bg-gray-800/40 sm:hidden transition-all duration-300"
                  >
                    <div className="flex items-center">
                      <Sun className="h-4 w-4 mr-2 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                      <Moon className="absolute h-4 w-4 ml-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                      <span className="ml-6">Toggle theme</span>
                    </div>
                  </Button>
                </motion.div>
              )}
            </nav>
          </motion.div>
        )}
      </div>
    </header>
  )
}
