// components/sprouts-dashboard.tsx
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardMetric, CardBadge } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Leaf,
  Sparkles,
  Trophy,
  TrendingUp,
  Calendar,
  Target,
  Award,
  Flower2,
  Heart,
  MessageCircle,
  Code,
  Users,
  Zap,
  Star,
  Crown,
  Gem,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useSprouts } from "@/hooks/use-sprouts"
import { getReputationLevel } from "@/lib/sprouts"
import { supabase } from "@/lib/supabaseClient"
import { logger } from "@/lib/logger";

interface SproutsDashboardProps {
  walletAddress: string
  onClose: () => void
}

export default function SproutsDashboard({ walletAddress, onClose }: SproutsDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [sproutHistory, setSproutHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const { totalSprouts, sproutsByType, loading } = useSprouts(walletAddress)
  const reputationLevel = getReputationLevel(totalSprouts)

  // Calculate next level
  const allLevels = [
    { name: "Seed", level: 1, color: "bg-yellow-400", sproutsNeeded: 0 },
    { name: "Sprout", level: 2, color: "bg-green-400", sproutsNeeded: 50 },
    { name: "Bloom", level: 3, color: "bg-emerald-400", sproutsNeeded: 150 },
    { name: "Grove-Keeper", level: 4, color: "bg-teal-400", sproutsNeeded: 300 },
    { name: "Garden Master", level: 5, color: "bg-purple-400", sproutsNeeded: 500 },
  ]
  const currentLevelIdx = allLevels.findIndex(l => l.level === reputationLevel.level)
  const nextLevel = allLevels[currentLevelIdx + 1]
  const progressToNext = nextLevel
    ? ((totalSprouts - reputationLevel.sproutsNeeded) / (nextLevel.sproutsNeeded - reputationLevel.sproutsNeeded)) * 100
    : 100

  // Fetch sprout history
  useEffect(() => {
    async function fetchSproutHistory() {
      try {
        const { data, error } = await supabase
          .from('sprouts')
          .select(`
            id,
            amount,
            type,
            created_at,
            projects!inner(title)
          `)
          .eq('user_address', walletAddress)
          .order('created_at', { ascending: false })
          .limit(20)

        if (error) throw error
        setSproutHistory(data || [])
      } catch (error) {
        logger.error("Failed to fetch sprout history:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (walletAddress) {
      fetchSproutHistory()
    }
  }, [walletAddress])

  const getSproutIcon = (type: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      idea_submission: <Code className="w-4 h-4 text-blue-600" />,
      idea_nurture: <Heart className="w-4 h-4 text-rose-600" />,
      idea_neglect: <MessageCircle className="w-4 h-4 text-green-600" />,
      profile_completion: <Users className="w-4 h-4 text-purple-600" />,
      daily_login: <Calendar className="w-4 h-4 text-orange-600" />,
      achievement: <Trophy className="w-4 h-4 text-yellow-600" />,
    }
    return icons[type] || <Sparkles className="w-4 h-4 text-emerald-600" />
  }

  const getSproutLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      idea_submission: "Idea Submission",
      idea_nurture: "Garden Nurturing",
      idea_neglect: "Garden Neglect",
      profile_completion: "Profile Completion",
      daily_login: "Daily Login",
      achievement: "Achievement Unlocked",
    }
    return labels[type] || "Sprout Earned"
  }

  const achievements = [
    {
      id: 1,
      name: "First Bloom",
      description: "Submit your first idea",
      icon: <Flower2 className="w-5 h-5" />,
      unlocked: totalSprouts >= 10,
      progress: Math.min(totalSprouts / 10, 1),
    },
    {
      id: 2,
      name: "Garden Guardian",
      description: "Nurture 10 gardens",
      icon: <Heart className="w-5 h-5" />,
      unlocked: totalSprouts >= 50,
      progress: Math.min(totalSprouts / 50, 1),
    },
    {
      id: 3,
      name: "Sprout Collector",
      description: "Earn 100 sprouts",
      icon: <Sparkles className="w-5 h-5" />,
      unlocked: totalSprouts >= 100,
      progress: Math.min(totalSprouts / 100, 1),
    },
    {
      id: 4,
      name: "Grove Master",
      description: "Reach Grove-Keeper level",
      icon: <Crown className="w-5 h-5" />,
      unlocked: reputationLevel.level >= 4,
      progress: reputationLevel.level >= 4 ? 1 : 0,
    },
  ]

  return (
    <motion.div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        <Card variant="glass" className="w-full max-w-4xl max-h-[90vh] overflow-hidden border-0 shadow-2xl">
          <CardHeader variant="gradient" className="border-b border-emerald-100/50">
            <div className="flex items-center justify-between">
              <motion.div 
                className="flex items-center gap-4"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div 
                  className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <Sparkles className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    Garden Sprouts Dashboard
                  </h2>
                  <p className="text-sm text-emerald-600/80">Track your growth and achievements</p>
                </div>
              </motion.div>
              <motion.button
                onClick={onClose}
                className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-emerald-600 hover:bg-white/30 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                ✕
              </motion.button>
            </div>
          </CardHeader>
          
          <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
            <CardContent className="p-6">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="bg-emerald-50/80 backdrop-blur-sm mb-6 rounded-xl p-1">
                  <TabsTrigger value="overview" className="rounded-lg">Overview</TabsTrigger>
                  <TabsTrigger value="history" className="rounded-lg">History</TabsTrigger>
                  <TabsTrigger value="achievements" className="rounded-lg">Achievements</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  {/* Current Status Cards */}
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <CardMetric
                      icon={<Sparkles className="w-5 h-5" />}
                      value={loading ? "..." : totalSprouts}
                      label="Total Sprouts"
                      trend="up"
                    />
                    
                    <CardMetric
                      icon={<Trophy className="w-5 h-5" />}
                      value={reputationLevel.name}
                      label="Reputation Level"
                      trend="neutral"
                    />
                    
                    <CardMetric
                      icon={<Target className="w-5 h-5" />}
                      value={nextLevel ? nextLevel.sproutsNeeded - totalSprouts : 0}
                      label="To Next Level"
                      trend="down"
                    />
                  </motion.div>

                  {/* Progress to Next Level */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Card variant="gradient" className="border-emerald-100">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-bold text-emerald-900 text-lg">Progress to {nextLevel?.name || "Max Level"}</h3>
                          <CardBadge variant="success" className="text-sm">
                            {Math.round(progressToNext)}%
                          </CardBadge>
                        </div>
                        <Progress value={progressToNext} className="h-3 mb-3" />
                        <div className="flex justify-between text-sm text-emerald-600/70">
                          <span>{reputationLevel.name} ({reputationLevel.sproutsNeeded} sprouts)</span>
                          {nextLevel && (
                            <span>{nextLevel.name} ({nextLevel.sproutsNeeded} sprouts)</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Sprouts Breakdown */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Card variant="glass" className="border-emerald-100">
                      <CardHeader>
                        <h3 className="font-bold text-emerald-900 text-lg">Sprouts Breakdown</h3>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {Object.entries(sproutsByType).map(([type, amount], index) => (
                          <motion.div 
                            key={type} 
                            className="flex items-center justify-between p-4 bg-emerald-50/50 rounded-xl border border-emerald-100/50"
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.6 + index * 0.1 }}
                            whileHover={{ scale: 1.02, y: -2 }}
                          >
                            <div className="flex items-center gap-3">
                              {getSproutIcon(type)}
                              <div>
                                <p className="font-semibold text-emerald-900">{getSproutLabel(type)}</p>
                                <p className="text-sm text-emerald-600">+{amount} sprouts earned</p>
                              </div>
                            </div>
                            <CardBadge variant="success" className="font-bold">
                              {amount}
                            </CardBadge>
                          </motion.div>
                        ))}
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                {/* History Tab */}
                <TabsContent value="history" className="space-y-4">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Card variant="glass" className="border-emerald-100">
                      <CardHeader>
                        <h3 className="font-bold text-emerald-900 text-lg">Recent Activity</h3>
                      </CardHeader>
                      <CardContent>
                        {isLoading ? (
                          <div className="text-center py-8">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              <Sparkles className="w-8 h-8 text-emerald-500 mx-auto" />
                            </motion.div>
                            <p className="text-emerald-600 mt-2">Loading sprout history...</p>
                          </div>
                        ) : sproutHistory.length === 0 ? (
                          <div className="text-center py-8">
                            <Sparkles className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                            <p className="text-emerald-600">No sprout history yet. Start earning sprouts!</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {sproutHistory.map((sprout, index) => (
                              <motion.div 
                                key={sprout.id} 
                                className="flex items-center gap-3 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100/50"
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.4 + index * 0.1 }}
                                whileHover={{ scale: 1.02, y: -2 }}
                              >
                                {getSproutIcon(sprout.type)}
                                <div className="flex-1">
                                  <p className="font-semibold text-emerald-900">
                                    {getSproutLabel(sprout.type)}
                                    {sprout.projects?.title && (
                                      <span className="text-emerald-600 font-normal"> on "{sprout.projects.title}"</span>
                                    )}
                                  </p>
                                  <p className="text-sm text-emerald-600">
                                    {new Date(sprout.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                                <CardBadge variant="success" className="font-bold">
                                  +{sprout.amount}
                                </CardBadge>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                {/* Achievements Tab */}
                <TabsContent value="achievements" className="space-y-4">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Card variant="glass" className="border-emerald-100">
                      <CardHeader>
                        <h3 className="font-bold text-emerald-900 text-lg">Garden Achievements</h3>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {achievements.map((achievement, index) => (
                            <motion.div
                              key={achievement.id}
                              className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                                achievement.unlocked
                                  ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-lg"
                                  : "border-gray-200 bg-gray-50/50"
                              }`}
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.4 + index * 0.1 }}
                              whileHover={{ scale: 1.05, y: -5 }}
                            >
                              <div className="flex items-center gap-4 mb-4">
                                <motion.div
                                  className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                    achievement.unlocked
                                      ? "bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg"
                                      : "bg-gray-300 text-gray-600"
                                  }`}
                                  whileHover={{ scale: 1.1, rotate: 5 }}
                                >
                                  {achievement.icon}
                                </motion.div>
                                <div>
                                  <h4 className={`font-bold text-lg ${
                                    achievement.unlocked ? "text-emerald-900" : "text-gray-600"
                                  }`}>
                                    {achievement.name}
                                  </h4>
                                  <p className={`text-sm ${
                                    achievement.unlocked ? "text-emerald-600" : "text-gray-500"
                                  }`}>
                                    {achievement.description}
                                  </p>
                                </div>
                              </div>
                              <Progress value={achievement.progress * 100} className="h-2 mb-3" />
                              <div className="flex justify-between text-sm">
                                <span className={achievement.unlocked ? "text-emerald-600 font-semibold" : "text-gray-500"}>
                                  {achievement.unlocked ? "🎉 Unlocked!" : "In Progress"}
                                </span>
                                <span className="text-emerald-600 font-medium">
                                  {Math.round(achievement.progress * 100)}%
                                </span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
} 