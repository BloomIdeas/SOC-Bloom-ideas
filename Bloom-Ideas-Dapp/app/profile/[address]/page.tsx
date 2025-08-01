"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  Flower2,
  Github,
  Twitter,
  MessageCircle,
  ExternalLink,
  Crown,
  Zap,
  Trophy,
  Heart,
  Code,
  Star,
  Bell,
  Sparkles,
} from "lucide-react"
import Link from "next/link"
import { useSprouts } from "@/hooks/use-sprouts"
import { getReputationLevel } from "@/lib/sprouts"
import { useParams } from "next/navigation"
import { useGardenTheme } from '@/components/garden-theme-context';

export default function ProfilePage() {
  const params = useParams();
  const address = params.address as string;
  const [activeTab, setActiveTab] = useState("overview")
  const { totalSprouts, sproutsByType, loading } = useSprouts(address)
  const reputationLevel = getReputationLevel(totalSprouts)
  // Calculate next level
  const allLevels = [
    { name: "Seed", level: 1, color: "bg-yellow-400", sproutsNeeded: 0 },
    { name: "Sprout", level: 2, color: "bg-green-400", sproutsNeeded: 50 },
    { name: "Bloom", level: 3, color: "bg-emerald-400", sproutsNeeded: 150 },
    { name: "Grove-Keeper", level: 4, color: "bg-teal-400", sproutsNeeded: 300 },
    { name: "Garden Master", level: 5, color: "bg-purple-400", sproutsNeeded: 500 },
  ];
  const currentLevelIdx = allLevels.findIndex(l => l.level === reputationLevel.level);
  const nextLevel = allLevels[currentLevelIdx + 1];
  const progressToNext = nextLevel
    ? ((totalSprouts - reputationLevel.sproutsNeeded) / (nextLevel.sproutsNeeded - reputationLevel.sproutsNeeded)) * 100
    : 100;
  const { gardenTheme } = useGardenTheme();
  const getThemeHeaderGradient = () => {
    switch (gardenTheme) {
      case 'spring':
        return 'bg-white/80';
      case 'summer':
        return 'bg-gradient-to-r from-yellow-50/80 to-orange-100/80';
      case 'autumn':
        return 'bg-gradient-to-r from-orange-50/80 to-red-100/80';
      case 'winter':
        return 'bg-gradient-to-r from-blue-50/80 to-purple-100/80';
      default:
        return 'bg-white/80';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      {/* Header */}
      <header className={`border-b border-emerald-200/50 ${getThemeHeaderGradient()} backdrop-blur-sm sticky top-0 z-50`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-emerald-700 hover:bg-emerald-50">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Garden
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <img src="/Logo-bloomideas.png" alt="Bloom Ideas Logo" className="w-8 h-8 rounded-full shadow" />
                <span className="font-semibold text-emerald-800">Profile Garden</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="border-emerald-100 bg-white/80 backdrop-blur-sm mb-8">
          <div className="h-24 bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 rounded-t-lg"></div>
          <CardContent className="relative pt-0 pb-6">
            <div className="flex flex-col md:flex-row items-start gap-6 -mt-12">
              <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                <AvatarImage src={"/placeholder.svg"} alt="Profile Avatar" />
                <AvatarFallback className="text-2xl bg-emerald-100 text-emerald-700">GB</AvatarFallback>
              </Avatar>

              <div className="flex-1 pt-12 md:pt-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-emerald-900 mb-1">Profile Name</h1>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-emerald-700 font-medium">ensName</span>
                      <span className="text-emerald-600/70">({address})</span>
                      <Badge className={`${reputationLevel.color} text-white border-0`}>
                        <Crown className="w-3 h-3 mr-1" />
                        {reputationLevel.level}
                      </Badge>
                    </div>
                    <p className="text-emerald-800/80 max-w-2xl">Bio goes here</p>
                  </div>

                  <div className="flex items-center gap-3 mt-4 md:mt-0">
                    <Button
                      variant="outline"
                      className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-transparent"
                    >
                      <Bell className="w-4 h-4 mr-2" />
                      Follow
                    </Button>
                    <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                  </div>
                </div>

                {/* Social Links */}
                <div className="flex items-center gap-4 mb-4">
                  <a
                    href="https://github.com/placeholder"
                    className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors"
                    target="_blank"
                  >
                    <Github className="w-4 h-4" />
                    <span className="text-sm">@placeholder</span>
                  </a>
                  <a
                    href="https://twitter.com/placeholder"
                    className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors"
                    target="_blank"
                  >
                    <Twitter className="w-4 h-4" />
                    <span className="text-sm">@placeholder</span>
                  </a>
                  <div className="flex items-center gap-2 text-emerald-600">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">placeholder</span>
                  </div>
                </div>

                {/* Reputation Progress */}
                <div className="bg-emerald-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-emerald-800">Garden Growth</span>
                    <span className="text-sm text-emerald-600">{totalSprouts} Sprouts</span>
                  </div>
                  <Progress value={progressToNext} className="h-2 mb-2" />
                  <div className="flex justify-between text-xs text-emerald-600/70">
                    <span>{reputationLevel.name}</span>
                    {nextLevel && (
                      <span>
                        {nextLevel.sproutsNeeded - totalSprouts} to {nextLevel.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card className="border-emerald-100 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-2">
                <Code className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-emerald-900">Ideas Planted</p>
              <p className="text-sm text-emerald-600/70">Ideas Planted</p>
            </CardContent>
          </Card>

          <Card className="border-emerald-100 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-2">
                <Trophy className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-emerald-900">Ideas Built</p>
              <p className="text-sm text-emerald-600/70">Ideas Built</p>
            </CardContent>
          </Card>

          <Card className="border-emerald-100 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-rose-100 to-rose-200 rounded-full flex items-center justify-center mx-auto mb-2">
                <Heart className="w-6 h-6 text-rose-600" />
              </div>
              <p className="text-2xl font-bold text-emerald-900">Votes Cast</p>
              <p className="text-sm text-emerald-600/70">Votes Cast</p>
            </CardContent>
          </Card>

          <Card className="border-emerald-100 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-2">
                <Zap className="w-6 h-6 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-emerald-900">Day Streak</p>
              <p className="text-sm text-emerald-600/70">Day Streak</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 bg-white/80 border border-emerald-200">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-800"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="ideas"
              className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-800"
            >
              Ideas
            </TabsTrigger>
            <TabsTrigger
              value="garden"
              className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-800"
            >
              NFT Garden
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-800"
            >
              Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Enhanced Garden Theater */}
            <Card className="border-emerald-100 bg-white/80 backdrop-blur-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                    <Flower2 className="w-6 h-6 text-white animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-emerald-900">🌸 Your Personal Garden</h3>
                    <p className="text-emerald-700/70">A beautiful visualization of your garden activities</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-100 to-teal-100 px-4 py-2 rounded-full mb-4">
                    <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
                    <span className="text-emerald-700 font-medium">Garden in Full Bloom</span>
                  </div>
                </div>

                {/* Enhanced Garden Visualization */}
                <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 rounded-2xl p-8 border-2 border-emerald-200/50 relative overflow-hidden">
                  {/* Background Garden Elements */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-4 left-4 text-4xl animate-bounce" style={{ animationDelay: "0s" }}>
                      🌿
                    </div>
                    <div className="absolute top-8 right-8 text-3xl animate-bounce" style={{ animationDelay: "1s" }}>
                      🦋
                    </div>
                    <div className="absolute bottom-6 left-8 text-2xl animate-bounce" style={{ animationDelay: "2s" }}>
                      🌱
                    </div>
                    <div
                      className="absolute bottom-4 right-4 text-3xl animate-bounce"
                      style={{ animationDelay: "0.5s" }}
                    >
                      🌻
                    </div>
                  </div>

                  {/* Petals Grid */}
                  <div className="relative z-10">
                    <div className="grid grid-cols-10 gap-3 max-w-2xl mx-auto mb-6">
                      {Array.from({ length: 50 }).map((_, i) => {
                        const isBloomedPetal = i < Math.floor(totalSprouts / 7)
                        const animationDelay = `${(i * 0.1) % 3}s`

                        return (
                          <div
                            key={i}
                            className={`w-6 h-6 rounded-full transition-all duration-500 ${
                              isBloomedPetal
                                ? "bg-gradient-to-br from-pink-400 via-rose-400 to-pink-500 shadow-lg animate-pulse transform hover:scale-125"
                                : "bg-emerald-100 border-2 border-emerald-200 hover:bg-emerald-200"
                            }`}
                            style={{
                              animationDelay: isBloomedPetal ? animationDelay : "0s",
                              boxShadow: isBloomedPetal ? "0 0 15px rgba(244, 114, 182, 0.4)" : "none",
                            }}
                            title={isBloomedPetal ? "Bloomed Petal" : "Waiting to Bloom"}
                          />
                        )
                      })}
                    </div>

                    {/* Garden Stats */}
                    <div className="text-center space-y-4">
                      <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 border border-emerald-200">
                        <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center animate-pulse">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-left">
                          <p className="text-2xl font-bold text-emerald-900">
                            {Math.floor(totalSprouts / 7)} Petals Bloomed
                          </p>
                          <p className="text-sm text-emerald-600/70">From your garden activities</p>
                        </div>
                      </div>

                      {/* Progress to Next Bloom */}
                      <div className="max-w-md mx-auto">
                        <div className="flex justify-between text-sm text-emerald-600/70 mb-2">
                          <span>Next Petal Bloom</span>
                          <span>{7 - (totalSprouts % 7)} sprouts needed</span>
                        </div>
                        <div className="w-full bg-emerald-100 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-pink-400 to-rose-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${((totalSprouts % 7) / 7) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Garden Mood */}
                      <div className="inline-flex items-center gap-2 text-emerald-700">
                        <span className="text-2xl animate-bounce">🌺</span>
                        <span className="font-medium">Your garden is thriving!</span>
                        <span className="text-2xl animate-bounce" style={{ animationDelay: "0.5s" }}>
                          🌺
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-emerald-100 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <h3 className="text-xl font-semibold text-emerald-900">Recent Garden Activity</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Heart className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-emerald-900 font-medium">Loved "ZK Privacy Garden"</p>
                    <p className="text-sm text-emerald-600/70">2 hours ago • +1 Sprout</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-emerald-900 font-medium">Commented on "DeFi Yield Optimizer"</p>
                    <p className="text-sm text-emerald-600/70">1 day ago • +2 Sprouts</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Star className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-emerald-900 font-medium">Planted new idea "Cross-Chain Bridge"</p>
                    <p className="text-sm text-emerald-600/70">3 days ago • +5 Sprouts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="garden" className="space-y-6">
            <Card className="border-emerald-100 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <h3 className="text-xl font-semibold text-emerald-900">🎨 Invisible Gardens NFT Collection</h3>
                <p className="text-emerald-700/70">Your earned achievements and milestones</p>
              </CardHeader>
              <CardContent>
                <div className="text-emerald-600">NFTs coming soon!</div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
