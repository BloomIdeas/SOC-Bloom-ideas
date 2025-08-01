"use client"

import { Card, CardContent, CardBadge } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Heart,
  Users,
  MessageCircle,
  Sparkles,
  TrendingUp,
  Droplet,
  Sprout,
  CloudRain,
  Star,
  Zap,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import React from "react"

interface SimplifiedIdeaCardProps {
  idea: any
  onViewDetails: (idea: any) => void
  onProfileClick: (address: string) => void
}

export default function SimplifiedIdeaCard({
  idea,
  onViewDetails,
  onProfileClick,
}: SimplifiedIdeaCardProps) {
  const [showConfetti, setShowConfetti] = React.useState(false)
  const [isHovered, setIsHovered] = React.useState(false)

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "planted":
        return {
          emoji: "🌱",
          LabelIcon: Sprout,
          label: "Planted",
          color: "success",
          gradient: "from-yellow-400 to-orange-400",
        }
      case "growing":
        return {
          emoji: "🌿",
          LabelIcon: CloudRain,
          label: "Growing",
          color: "success",
          gradient: "from-green-400 to-emerald-400",
        }
      case "bloomed":
        return {
          emoji: "🌸",
          LabelIcon: Sparkles,
          label: "Bloomed",
          color: "success",
          gradient: "from-pink-400 to-rose-400",
        }
      default:
        return {
          emoji: "❓",
          LabelIcon: Sprout,
          label: status,
          color: "default",
          gradient: "from-gray-400 to-slate-400",
        }
    }
  }

  const statusInfo = getStatusInfo(idea.status)

  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative group"
    >
      {/* Floating particles effect */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-emerald-400 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [-10, -30],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <Card 
        variant="glass" 
        className="relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500"
      >
        {/* Animated background gradient */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-teal-50/30 to-cyan-50/50"
          animate={{
            background: [
              "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(20, 184, 166, 0.1) 100%)",
              "linear-gradient(135deg, rgba(20, 184, 166, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)",
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
        />

        {/* Top accent bar with gradient */}
        <motion.div
          className={`h-1 bg-gradient-to-r ${statusInfo.gradient}`}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ transformOrigin: "left" }}
        />

        {/* Glow effect on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />

        <CardContent className="p-6 space-y-4 relative z-10">
          {/* Header with title and status */}
          <div className="flex items-start justify-between">
            <motion.div 
              className="flex-1"
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="text-xl font-bold text-emerald-900 group-hover:text-emerald-700 transition-colors line-clamp-2 mb-2">
                {idea.title}
              </h3>
              <div className="prose prose-sm prose-emerald text-emerald-800/80 line-clamp-2">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {idea.description}
                </ReactMarkdown>
              </div>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="ml-4"
            >
              <CardBadge 
                variant={statusInfo.color as any}
                icon={<statusInfo.LabelIcon className="w-4 h-4" />}
                className="shadow-sm"
              >
                {statusInfo.label}
              </CardBadge>
            </motion.div>
          </div>

          {/* Author section */}
          <motion.div 
            className="flex items-center justify-between"
            whileHover={{ y: -2 }}
          >
            <motion.button
              onClick={(e) => {
                e.stopPropagation()
                onProfileClick(idea.author)
              }}
              className="flex items-center gap-3 hover:bg-emerald-50/80 rounded-full p-2 transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Avatar className="w-8 h-8 ring-2 ring-emerald-200">
                <AvatarFallback className="text-sm bg-gradient-to-br from-emerald-400 to-teal-500 text-white font-bold">
                  {idea.author.slice(2, 4).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <div className="text-sm font-semibold text-emerald-900">
                  builder.eth
                </div>
                <div className="text-xs text-emerald-600">Grove-Keeper</div>
              </div>
            </motion.button>

            {/* Reputation indicator */}
            <motion.div 
              className="flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-medium text-emerald-700">Level 3</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Tags */}
          <motion.div 
            className="flex flex-wrap gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {idea.tags.slice(0, 3).map((tag: string, index: number) => (
              <motion.div
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <CardBadge 
                  variant="default"
                  className="text-xs bg-emerald-50/80 border-emerald-200/50"
                >
                  {tag}
                </CardBadge>
              </motion.div>
            ))}
            {idea.tags.length > 3 && (
              <CardBadge 
                variant="default"
                className="text-xs bg-gray-50/80 border-gray-200/50"
              >
                +{idea.tags.length - 3}
              </CardBadge>
            )}
          </motion.div>

          {/* Metrics with animations */}
          <motion.div 
            className="flex items-center justify-between text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-4">
              {[
                { Icon: Heart, value: idea.votes, color: "text-rose-600", label: "Votes" },
                { Icon: Users, value: idea.interested, color: "text-blue-600", label: "Interested" },
                { Icon: MessageCircle, value: idea.comments || 5, color: "text-green-600", label: "Comments" }
              ].map(({ Icon, value, color, label }, i) => (
                <motion.div
                  key={label}
                  className="flex items-center gap-1 group"
                  whileHover={{ y: -2, scale: 1.05 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                >
                  <Icon className={`w-4 h-4 ${color} group-hover:scale-110 transition-transform`} />
                  <span className="font-semibold text-emerald-900">{value}</span>
                </motion.div>
              ))}
            </div>
            
            <motion.div 
              className="flex items-center gap-1"
              whileHover={{ scale: 1.1 }}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-emerald-700">
                Bloom {idea.bloomScore || 85}
              </span>
            </motion.div>
          </motion.div>

          {/* Action button */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Button
              onClick={() => {
                onViewDetails(idea)
                if (idea.status === "bloomed") {
                  setShowConfetti(true)
                  setTimeout(() => setShowConfetti(false), 1500)
                }
              }}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group"
              size="lg"
            >
              <motion.div
                animate={{ rotate: isHovered ? 360 : 0 }}
                transition={{ duration: 0.5 }}
              >
                <Sparkles className="w-5 h-5" />
              </motion.div>
              <span className="group-hover:translate-x-1 transition-transform">
                Explore Garden
              </span>
            </Button>

            {/* Confetti effect for bloomed ideas */}
            <AnimatePresence>
              {showConfetti && (
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                      }}
                      animate={{
                        y: [-20, -100],
                        x: [0, Math.random() * 40 - 20],
                        opacity: [1, 0],
                        scale: [1, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        delay: i * 0.1,
                      }}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
