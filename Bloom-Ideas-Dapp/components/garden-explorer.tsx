"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Flower2, Leaf, Heart as HeartIcon, User, Bell, Sparkles, TreePine, Sun, Droplets } from "lucide-react"
import Link from "next/link"
import { useIsMobile } from "@/hooks/use-mobile"
import { useSprouts } from "@/hooks/use-sprouts"
import { getReputationLevel } from "@/lib/sprouts"
import SproutsDashboard from "./sprouts-dashboard"
import { supabase } from "@/lib/supabaseClient"
import { useGardenTheme } from './garden-theme-context';

// Helper: random name generator
const randomNames = [
  "Mystic Fern", "Sunny Sprout", "Bloom Sage", "Petal Whisper", "Dewdrop Dreamer", "Willow Wanderer", "Clover Muse", "Thistle Sage", "Lily Breeze", "Sage Blossom"
]
function getRandomName() {
  return randomNames[Math.floor(Math.random() * randomNames.length)]
}

const seasonParticles = {
  spring: "🌸",
  summer: "☀️",
  autumn: "🍂",
  winter: "❄️"
}

interface GardenExplorerProps {
  walletAddress: string
}

export default function GardenExplorer({ walletAddress }: GardenExplorerProps) {
  const [showGardenDropdown, setShowGardenDropdown] = useState(false)
  const [showSproutsDashboard, setShowSproutsDashboard] = useState(false)
  const { gardenTheme, setGardenTheme } = useGardenTheme();
  const isMobile = useIsMobile()
  const [username, setUsername] = useState<string>("")
  const [showSproutsModal, setShowSproutsModal] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [seasonAnim, setSeasonAnim] = useState<keyof typeof seasonParticles | null>(null)
  
  const { totalSprouts, sproutsByType, loading, refreshSprouts } = useSprouts(walletAddress)
  const reputationLevel = getReputationLevel(totalSprouts)
  const [ideasPlanted, setIdeasPlanted] = useState<number>(0)

  // Fetch username (bloom_username) or fallback
  useEffect(() => {
    async function fetchUsername() {
      if (!walletAddress) return setUsername("")
      const { data, error } = await supabase
        .from("users")
        .select("bloom_username")
        .eq("wallet_address", walletAddress)
        .single()
      if (data?.bloom_username) setUsername(data.bloom_username)
      else setUsername(getRandomName())
    }
    fetchUsername()
  }, [walletAddress])

  // Fetch number of ideas submitted by user
  useEffect(() => {
    async function fetchIdeasPlanted() {
      if (!walletAddress) return setIdeasPlanted(0)
      const { count, error } = await supabase
        .from("projects")
        .select("id", { count: "exact", head: true })
        .eq("owner_address", walletAddress)
      setIdeasPlanted(count || 0)
    }
    fetchIdeasPlanted()
  }, [walletAddress])

  // Modal outside click close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (showSproutsModal && modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowSproutsModal(false)
      }
    }
    if (showSproutsModal) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showSproutsModal])

  // Dropdown outside click close
  useEffect(() => {
    function handleDropdownClickOutside(event: MouseEvent) {
      if (showGardenDropdown && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowGardenDropdown(false)
      }
    }
    if (showGardenDropdown) {
      document.addEventListener("mousedown", handleDropdownClickOutside)
      return () => document.removeEventListener("mousedown", handleDropdownClickOutside)
    }
  }, [showGardenDropdown])

  // Animate season change
  function handleSeasonChange(themeId: keyof typeof seasonParticles) {
    setGardenTheme(themeId)
    setSeasonAnim(themeId)
    setTimeout(() => setSeasonAnim(null), 1200)
  }

  const gardenStats = {
    sprouts: totalSprouts,
    gardensNurtured: sproutsByType.nurture || 0,
    ideasPlanted: ideasPlanted, // use actual project count
    reputation: reputationLevel.name,
    level: reputationLevel.level,
    dailyStreak: 15, // TODO: Implement streak tracking
  }

  const getThemeColors = (theme: string) => {
    switch (theme) {
      case "spring":
        return "from-emerald-500 to-teal-500"
      case "summer":
        return "from-yellow-500 to-orange-500"
      case "autumn":
        return "from-orange-500 to-red-500"
      case "winter":
        return "from-blue-500 to-purple-500"
      default:
        return "from-emerald-500 to-teal-500"
    }
  }

  const getThemeIcon = (theme: string) => {
    switch (theme) {
      case "spring":
        return <Flower2 className="w-4 h-4" />
      case "summer":
        return <Sun className="w-4 h-4" />
      case "autumn":
        return <TreePine className="w-4 h-4" />
      case "winter":
        return <Droplets className="w-4 h-4" />
      default:
        return <Flower2 className="w-4 h-4" />
    }
  }

  return (
    <div className="flex items-center gap-2 md:gap-3">
      {/* Quick Garden Actions */}
      <div className="flex items-center gap-1 md:gap-2">
        <Button
          variant="outline"
          size={isMobile ? "sm" : "sm"}
          className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-white/80 backdrop-blur-sm p-1 md:p-2 relative"
        >
          <Bell className="w-3 h-3 md:w-4 md:h-4" />
          {/* Notification dot */}
          <div className="absolute -top-1 -right-1 w-2 h-2 md:w-3 md:h-3 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-xs text-white font-bold">3</span>
          </div>
        </Button>

        <Link href="/profile/me">
          <Button
            variant="outline"
            size={isMobile ? "sm" : "sm"}
            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-white/80 backdrop-blur-sm p-1 md:p-2"
          >
            <User className="w-3 h-3 md:w-4 md:h-4" />
          </Button>
        </Link>
      </div>

      {/* Garden Explorer */}
      <div className="relative">
        <Button
          variant="outline"
          onClick={() => setShowGardenDropdown(!showGardenDropdown)}
          className={`border-emerald-200 text-white hover:opacity-90 bg-gradient-to-r ${getThemeColors(gardenTheme)} backdrop-blur-sm text-xs md:text-sm transition-colors duration-700`}
        >
          {getThemeIcon(gardenTheme)}
          <span className="font-medium ml-1 md:ml-2 hidden sm:inline">Explore Garden</span>
          <Sparkles className="w-3 h-3 md:w-4 md:h-4 ml-1 md:ml-2 animate-pulse" />
        </Button>

        {showGardenDropdown && (
          <Card
            ref={dropdownRef}
            className={`absolute top-full right-0 mt-2 border-emerald-100 shadow-lg z-50 ${isMobile ? 'w-72' : 'w-80'}
              bg-gradient-to-br transition-colors duration-700
              ${gardenTheme === 'spring' ? 'from-emerald-50 to-teal-50' : ''}
              ${gardenTheme === 'summer' ? 'from-yellow-50 to-orange-100' : ''}
              ${gardenTheme === 'autumn' ? 'from-orange-50 to-red-100' : ''}
              ${gardenTheme === 'winter' ? 'from-blue-50 to-purple-100' : ''}
            `}
          >
            {/* Particle/emoji burst animation on season change */}
            {seasonAnim && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-50 animate-bounce">
                <span className="text-5xl opacity-80 animate-fade-in-out">{seasonParticles[seasonAnim]}</span>
              </div>
            )}
            <CardContent className="p-3 md:p-4 transition-colors duration-700">
              <div className="space-y-3 md:space-y-4">
                {/* Garden Profile Header */}
                <div className="flex items-center gap-2 md:gap-3 pb-2 md:pb-3 border-b border-emerald-100">
                  <Avatar className="w-10 h-10 md:w-12 md:h-12 ring-2 ring-emerald-200">
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs md:text-sm">
                      {walletAddress.slice(2, 4).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-emerald-900 text-sm md:text-base">{username || getRandomName()}</p>
                    <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                      <Badge className="bg-teal-400 text-white border-0 text-xs">
                        <Flower2 className="w-2 h-2 md:w-3 md:h-3 mr-1" />
                        {gardenStats.reputation}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                        <span className="text-xs text-emerald-600">Level {gardenStats.level}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Garden Stats Grid with animated background */}
                <div className={`grid grid-cols-2 gap-2 md:gap-3 rounded-lg transition-colors duration-700
                  ${gardenTheme === 'spring' ? 'bg-gradient-to-br from-emerald-50 to-teal-100' : ''}
                  ${gardenTheme === 'summer' ? 'bg-gradient-to-br from-yellow-50 to-orange-100' : ''}
                  ${gardenTheme === 'autumn' ? 'bg-gradient-to-br from-orange-50 to-red-100' : ''}
                  ${gardenTheme === 'winter' ? 'bg-gradient-to-br from-blue-50 to-purple-100' : ''}
                `}>
                  <div 
                    className="text-center p-2 md:p-3 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg cursor-pointer hover:bg-emerald-100 transition-colors"
                    onClick={() => setShowSproutsModal(true)}
                  >
                    <Leaf className="w-4 h-4 md:w-5 md:h-5 text-emerald-600 mx-auto mb-1" />
                    <p className="text-sm md:text-lg font-bold text-emerald-900">
                      {loading ? "..." : gardenStats.sprouts}
                    </p>
                    <p className="text-xs text-emerald-600/70">Sprouts Earned</p>
                  </div>
                  <div className="text-center p-2 md:p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                    <HeartIcon className="w-4 h-4 md:w-5 md:h-5 text-green-500 mx-auto mb-1" />
                    <p className="text-sm md:text-lg font-bold text-emerald-900">{gardenStats.gardensNurtured}</p>
                    <p className="text-xs text-emerald-600/70">Gardens Nurtured</p>
                  </div>
                  <div className="text-center p-2 md:p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
                    <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-blue-500 mx-auto mb-1" />
                    <p className="text-sm md:text-lg font-bold text-emerald-900">{gardenStats.ideasPlanted}</p>
                    <p className="text-xs text-emerald-600/70">Ideas Planted</p>
                  </div>
                  <div className="text-center p-2 md:p-3 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg">
                    <Sun className="w-4 h-4 md:w-5 md:h-5 text-yellow-500 mx-auto mb-1" />
                    <p className="text-sm md:text-lg font-bold text-emerald-900">{gardenStats.dailyStreak}</p>
                    <p className="text-xs text-emerald-600/70">Day Streak</p>
                  </div>
                </div>

                {/* Garden Theme Selector */}
                <div className="pt-2 md:pt-3 border-t border-emerald-100">
                  <p className="text-xs md:text-sm font-medium text-emerald-800 mb-2">🌸 Garden Season</p>
                  <div className="grid grid-cols-4 gap-1 md:gap-2">
                    {[
                      { id: "spring", label: "Spring", icon: Flower2, color: "emerald" },
                      { id: "summer", label: "Summer", icon: Sun, color: "yellow" },
                      { id: "autumn", label: "Autumn", icon: TreePine, color: "orange" },
                      { id: "winter", label: "Winter", icon: Droplets, color: "blue" },
                    ].map((theme) => (
                      <Button
                        key={theme.id}
                        variant={gardenTheme === theme.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleSeasonChange(theme.id as keyof typeof seasonParticles)}
                        className={`p-1 md:p-2 text-xs ${
                          gardenTheme === theme.id
                            ? `bg-${theme.color}-500 text-white`
                            : `border-${theme.color}-200 text-${theme.color}-700 hover:bg-${theme.color}-50`
                        } transition-colors duration-700`}
                      >
                        <theme.icon className="w-3 h-3 md:w-4 md:h-4" />
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Garden Weather */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-2 md:p-3">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs md:text-sm font-medium text-emerald-800">🌤️ Garden Weather</p>
                      <p className="text-xs text-emerald-600/70">Perfect for planting new ideas!</p>
                    </div>
                    <div className="text-right ml-2">
                      <p className="text-sm md:text-lg font-bold text-emerald-900">Sunny</p>
                      <p className="text-xs text-emerald-600/70">+20% Bloom Bonus</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Sprouts Dashboard Modal (old) */}
      {/* {showSproutsDashboard && (
        <SproutsDashboard 
          walletAddress={walletAddress} 
          onClose={() => setShowSproutsDashboard(false)} 
        />
      )} */}

      {/* Sprouts Modal (new) */}
      {showSproutsModal && (
        <div className="fixed inset-0 z-[1000] min-h-screen flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div ref={modalRef} className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md relative flex flex-col items-center">
            <button
              className="absolute top-3 right-3 text-emerald-500 hover:text-emerald-700 text-xl font-bold"
              onClick={() => setShowSproutsModal(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold text-emerald-900 mb-2">Sprouts Earned</h2>
            <p className="text-emerald-700 mb-4">Total Sprouts: <span className="font-semibold">{gardenStats.sprouts}</span></p>
            <div className="w-full flex flex-col gap-2">
              <div className="flex justify-between text-emerald-800">
                <span className="font-medium">Nurtures</span>
                <span>{sproutsByType.nurture || 0}</span>
              </div>
              <div className="flex justify-between text-emerald-800">
                <span className="font-medium">Ideas Planted</span>
                <span>{ideasPlanted}</span>
              </div>
              <div className="flex justify-between text-emerald-800">
                <span className="font-medium">Comments</span>
                <span>{sproutsByType.comment || 0}</span>
              </div>
              <div className="flex justify-between text-emerald-800">
                <span className="font-medium">Build Requests</span>
                <span>{sproutsByType.build_request || 0}</span>
              </div>
              <div className="flex justify-between text-emerald-800">
                <span className="font-medium">Invites</span>
                <span>{sproutsByType.invite || 0}</span>
              </div>
            </div>
            <Button
              className="mt-6 w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
              onClick={() => { setShowSproutsModal(false); refreshSprouts(); }}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
