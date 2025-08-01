"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  X,
  Github,
  Twitter,
  MessageCircle,
  Crown,
  Zap,
  Trophy,
  Heart,
  Code,
  Star,
  ExternalLink,
  Flower2,
  Sparkles,
} from "lucide-react"
import { useSprouts } from "@/hooks/use-sprouts"
import { getReputationLevel } from "@/lib/sprouts"

interface ProfilePopupProps {
  address: string
  onClose: () => void
}

export default function ProfilePopup({ address, onClose }: ProfilePopupProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const { totalSprouts, sproutsByType, loading } = useSprouts(address)
  const reputationLevel = getReputationLevel(totalSprouts)
  const currentLevel = reputationLevel
  const nextLevel = reputationLevel.nextLevel
  const progressToNext = nextLevel
    ? ((totalSprouts - currentLevel.sproutsNeeded) /
        (nextLevel.sproutsNeeded - currentLevel.sproutsNeeded)) *
      100
    : 100

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto border-emerald-100 bg-white/95 backdrop-blur-sm">
        {/* Header */}
        <div className="h-20 bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 rounded-t-lg relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white/20"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <CardContent className="relative pt-0 pb-6">
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row items-start gap-6 -mt-10">
            <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
              <AvatarImage src={"/placeholder.svg"} alt="User Avatar" />
              <AvatarFallback className="text-xl bg-emerald-100 text-emerald-700">GB</AvatarFallback>
            </Avatar>

            <div className="flex-1 pt-8 md:pt-2">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-emerald-900 mb-1">Garden Builder</h1>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-emerald-700 font-medium">builder.eth</span>
                    <span className="text-emerald-600/70">({address})</span>
                    <Badge className={`${currentLevel?.color} text-white border-0`}>
                      <Crown className="w-3 h-3 mr-1" />
                      {reputationLevel.name}
                    </Badge>
                  </div>
                  <p className="text-emerald-800/80 max-w-2xl text-sm">Web3 developer cultivating the future of DeFi. Love building beautiful, functional protocols that make crypto accessible to everyone. 🌱</p>
                </div>

                <div className="flex items-center gap-2 mt-4 md:mt-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-transparent"
                  >
                    Follow
                  </Button>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                  >
                    Message
                  </Button>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-4 mb-4">
                <a
                  href="https://github.com/gardenbuilder"
                  className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="w-4 h-4" />
                  <span className="text-sm">@{mockProfile.social.github}</span>
                </a>
                <a
                  href="https://twitter.com/gardenbuilder_"
                  className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Twitter className="w-4 h-4" />
                  <span className="text-sm">@{mockProfile.social.twitter}</span>
                </a>
                <div className="flex items-center gap-2 text-emerald-600">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm">{mockProfile.social.discord}</span>
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
                  <span>{currentLevel?.name}</span>
                  {nextLevel && (
                    <span>
                      {nextLevel.sproutsNeeded - totalSprouts} to {nextLevel.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-4 my-6">
            <div className="text-center p-3 bg-emerald-50 rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-2">
                <Code className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-lg font-bold text-emerald-900">12</p>
              <p className="text-xs text-emerald-600/70">Ideas Planted</p>
            </div>

            <div className="text-center p-3 bg-emerald-50 rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-2">
                <Trophy className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-lg font-bold text-emerald-900">8</p>
              <p className="text-xs text-emerald-600/70">Ideas Built</p>
            </div>

            <div className="text-center p-3 bg-emerald-50 rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-br from-rose-100 to-rose-200 rounded-full flex items-center justify-center mx-auto mb-2">
                <Heart className="w-4 h-4 text-rose-600" />
              </div>
              <p className="text-lg font-bold text-emerald-900">156</p>
              <p className="text-xs text-emerald-600/70">Votes Cast</p>
            </div>

            <div className="text-center p-3 bg-emerald-50 rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-2">
                <Zap className="w-4 h-4 text-orange-600" />
              </div>
              <p className="text-lg font-bold text-emerald-900">15</p>
              <p className="text-xs text-emerald-600/70">Day Streak</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-emerald-200 mb-6">
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab("overview")}
                className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "overview"
                    ? "border-emerald-500 text-emerald-700"
                    : "border-transparent text-emerald-600/70 hover:text-emerald-700"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("garden")}
                className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "garden"
                    ? "border-emerald-500 text-emerald-700"
                    : "border-transparent text-emerald-600/70 hover:text-emerald-700"
                }`}
              >
                🎨 NFT Garden
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Enhanced Garden Theater */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                    <Flower2 className="w-5 h-5 text-white animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-emerald-900">🌸 Your Personal Garden</h3>
                    <p className="text-sm text-emerald-700/70">A beautiful visualization of your garden activities</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 rounded-xl p-6 border border-emerald-200/50 relative overflow-hidden">
                  {/* Background Elements */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-2 left-2 text-2xl animate-bounce">🌿</div>
                    <div className="absolute top-2 right-2 text-xl animate-bounce" style={{ animationDelay: "1s" }}>
                      🦋
                    </div>
                    <div className="absolute bottom-2 left-2 text-lg animate-bounce" style={{ animationDelay: "2s" }}>
                      🌱
                    </div>
                    <div
                      className="absolute bottom-2 right-2 text-2xl animate-bounce"
                      style={{ animationDelay: "0.5s" }}
                    >
                      🌻
                    </div>
                  </div>

                  {/* Compact Petals Grid */}
                  <div className="relative z-10">
                    <div className="grid grid-cols-8 gap-2 max-w-sm mx-auto mb-4">
                      {Array.from({ length: 32 }).map((_, i) => {
                        const isBloomedPetal = i < Math.floor(totalSprouts / 11)
                        const animationDelay = `${(i * 0.1) % 2}s`

                        return (
                          <div
                            key={i}
                            className={`w-4 h-4 rounded-full transition-all duration-300 ${
                              isBloomedPetal
                                ? "bg-gradient-to-br from-pink-400 to-rose-500 shadow-md animate-pulse"
                                : "bg-emerald-100 border border-emerald-200"
                            }`}
                            style={{
                              animationDelay: isBloomedPetal ? animationDelay : "0s",
                              boxShadow: isBloomedPetal ? "0 0 10px rgba(244, 114, 182, 0.3)" : "none",
                            }}
                          />
                        )
                      })}
                    </div>

                    {/* Compact Stats */}
                    <div className="text-center">
                      <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 border border-emerald-200 mb-3">
                        <div className="w-6 h-6 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center animate-pulse">
                          <Sparkles className="w-3 h-3 text-white" />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-emerald-900">
                            {Math.floor(totalSprouts / 11)} Petals Bloomed
                          </p>
                        </div>
                      </div>

                      <p className="text-sm text-emerald-700 font-medium flex items-center justify-center gap-1">
                        <span className="animate-bounce">🌺</span>
                        Your garden is flourishing beautifully!
                        <span className="animate-bounce" style={{ animationDelay: "0.5s" }}>
                          🌺
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h3 className="text-lg font-semibold text-emerald-900 mb-3">Recent Garden Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <Heart className="w-3 h-3 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-emerald-900 font-medium text-sm">Loved "ZK Privacy Garden"</p>
                      <p className="text-xs text-emerald-600/70">2 hours ago • +1 Sprout</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <MessageCircle className="w-3 h-3 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-emerald-900 font-medium text-sm">Commented on "DeFi Yield Optimizer"</p>
                      <p className="text-xs text-emerald-600/70">1 day ago • +2 Sprouts</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "garden" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-emerald-900">🎨 Invisible Gardens NFT Collection</h3>
                <Badge variant="outline" className="border-emerald-200 text-emerald-700">
                  {totalSprouts} Blooms Earned
                </Badge>
              </div>
              <p className="text-emerald-700/70 text-sm mb-6">
                Your earned achievements and milestones in the garden ecosystem
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                {/* This section needs to be updated to use sproutsByType and totalSprouts */}
                {/* For now, keeping the structure but noting the data source change */}
                {/* Example: */}
                {/* {Object.entries(sproutsByType).map(([type, count]) => ( */}
                {/*   <Card key={type} className="border-emerald-100 hover:shadow-lg transition-all duration-300 group"> */}
                {/*     <CardContent className="p-4"> */}
                {/*       <div className="flex items-start gap-4"> */}
                {/*         <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform"> */}
                {/*           <Flower2 className="w-8 h-8 text-emerald-600" /> */}
                {/*         </div> */}
                {/*         <div className="flex-1"> */}
                {/*           <div className="flex items-center justify-between mb-2"> */}
                {/*             <h4 className="font-semibold text-emerald-900">{type}</h4> */}
                {/*             <Badge */}
                {/*               variant="outline" */}
                {/*               className={`text-xs ${ */}
                {/*                 type === "Legendary" */}
                {/*                   ? "border-purple-300 text-purple-700 bg-purple-50" */}
                {/*                   : type === "Epic" */}
                {/*                     ? "border-orange-300 text-orange-700 bg-orange-50" */}
                {/*                     : type === "Rare" */}
                {/*                       ? "border-blue-300 text-blue-700 bg-blue-50" */}
                {/*                       : "border-gray-300 text-gray-700 bg-gray-50" */}
                {/*               }`} */}
                {/*             > */}
                {/*               {type} */}
                {/*             </Badge> */}
                {/*           </div> */}
                {/*           <p className="text-sm text-emerald-700/80 mb-2">Description for {type}</p> */}
                {/*           <div className="flex items-center justify-between"> */}
                {/*             <span className="text-xs text-emerald-600/70">Earned {count}</span> */}
                {/*             <div className="flex gap-2"> */}
                {/*               <Button size="sm" variant="outline" className="h-6 px-2 text-xs bg-transparent"> */}
                {/*                 <ExternalLink className="w-3 h-3 mr-1" /> */}
                {/*                 View */}
                {/*               </Button> */}
                {/*               <Button size="sm" variant="outline" className="h-6 px-2 text-xs bg-transparent"> */}
                {/*                 <Sparkles className="w-3 h-3 mr-1" /> */}
                {/*                 Mint */}
                {/*               </Button> */}
                {/*             </div> */}
                {/*           </div> */}
                {/*         </div> */}
                {/*       </div> */}
                {/*     </CardContent> */}
                {/*   </Card> */}
                {/* ))} */}
              </div>

              {/* Next Milestone */}
              <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                    <Star className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-emerald-900">Next Bloom: Community Champion</h4>
                    <p className="text-sm text-emerald-700/80">Help 5 more builders get started (3/5 completed)</p>
                    <Progress value={60} className="h-2 mt-2" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
