// components/enhanced-idea-modal.tsx
"use client"

import { useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  X,
  Heart,
  Users,
  Github,
  ExternalLink,
  Leaf,
  Calendar,
  TrendingUp,
  MessageCircle,
  Send,
  Code,
  Zap,
  Share2,
} from "lucide-react"
import { useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { getSproutTypeId } from "@/lib/sprouts"
import { useSprouts } from "@/hooks/use-sprouts"
import { useAccount } from "wagmi"
import { useSignatureVerification } from "@/hooks/use-signature-verification"
import { toast } from "sonner"
import Link from "next/link"
import { useRef } from "react"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { useCallback } from "react"
import { logger } from "@/lib/logger";

interface EnhancedIdeaModalProps {
  idea: {
    id: number
    title: string
    description: string
    fullDescription?: string
    stage: "planted" | "growing" | "bloomed"
    created_at: string
    owner_address?: string
    author?: string
    bloomScore?: number
    nurtureCount: number
    neglectCount: number
    commentCount: number
    joinCount: number
    techStack?: string[]
    team?: { name: string; role: string; avatar?: string }[]
    milestones?: { name: string; status: string; progress: number; date: string }[]
    bloomUsername?: string // Added bloomUsername to the interface
  }
  onClose: () => void
  onProfileClick: (address: string) => void
  links?: { id: number; url: string; label?: string }[]
  visuals?: { id: number; url: string; alt_text?: string }[]
  walletAddress?: string // <-- add this
}

// Helper to parse markdown sections
function parseDescriptionSections(description: string) {
  // Section headers in the order we want to display
  const sectionOrder = [
    { key: "problem", label: "What problem does your idea solve?" },
    { key: "vision", label: "Vision" },
    { key: "features", label: "Features" },
    { key: "tech", label: "Tech" },
    { key: "targetUsers", label: "Who is it for? (target users, impact)" },
    { key: "unique", label: "What makes it unique?" },
  ];
  const regex = /## +([^\n]+)\n/g;
  const matches = [...description.matchAll(regex)];
  const sections: Record<string, string> = {};
  const extraSections: { header: string; content: string }[] = [];
  let lastEnd = 0;
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index! + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : description.length;
    const header = matches[i][1].trim();
    const section = sectionOrder.find(s => header.toLowerCase().replace(/[^a-z]/gi, '') === s.label.toLowerCase().replace(/[^a-z]/gi, ''));
    if (section) {
      sections[section.key] = description.slice(start, end).trim();
    } else {
      extraSections.push({ header, content: description.slice(start, end).trim() });
    }
    lastEnd = end;
  }
  return { sections, extraSections };
}

export default function EnhancedIdeaModal({
  idea,
  onClose,
  onProfileClick,
  links = [],
  visuals = [],
  walletAddress,
}: EnhancedIdeaModalProps) {
  const [activeTab, setActiveTab] = useState<"overview"|"progress"|"team"|"community">("overview")
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState("")
  const [submittingComment, setSubmittingComment] = useState(false)
  // Remove useAccount for address unless needed elsewhere
  // const { address, isConnected } = useAccount()
  const { hasVerifiedSignature } = useSignatureVerification()
  const { totalSprouts, refreshSprouts } = useSprouts(walletAddress ?? null)
  const [userCommentCount, setUserCommentCount] = useState(0)
  const modalRef = useRef<HTMLDivElement>(null)
  const [joinRequests, setJoinRequests] = useState<any[]>([])
  const [joinRequestsLoading, setJoinRequestsLoading] = useState(false)
  const [userJoinRequest, setUserJoinRequest] = useState<any>(null)
  const [joinRequestStatus, setJoinRequestStatus] = useState<string>("")
  const [joinRequestSubmitting, setJoinRequestSubmitting] = useState(false)
  // Join request form fields
  const [joinMotivation, setJoinMotivation] = useState("")
  const [joinSkills, setJoinSkills] = useState("")
  const [joinExperience, setJoinExperience] = useState("")
  const [joinLinks, setJoinLinks] = useState("")
  const [teamTabRefresh, setTeamTabRefresh] = useState(0)

  // Helper: get required sprouts for next comment
  function getRequiredSprouts(count: number) {
    if (count === 0) return 5
    if (count === 1) return 4
    return 3
  }
  const requiredSprouts = getRequiredSprouts(userCommentCount)

  // Helper: is owner
  const isOwner = walletAddress && (walletAddress.toLowerCase() === (idea.owner_address || "").toLowerCase())

  // Fetch join requests (for owner)
  const fetchJoinRequests = useCallback(async () => {
    setJoinRequestsLoading(true)
    const { data, error } = await supabase
      .from("join_requests")
      .select(`id, builder_address, questions, status, created_at, assigned_at, users:builder_address (bloom_username, wallet_address)`)
      .eq("project_id", idea.id)
      .order("created_at", { ascending: true })
    if (!error) setJoinRequests(data || [])
    setJoinRequestsLoading(false)
  }, [idea.id])

  // Fetch current user's join request (for non-owner)
  const fetchUserJoinRequest = useCallback(async () => {
    if (!walletAddress) return
    const { data, error } = await supabase
      .from("join_requests")
      .select("id, status, questions, created_at")
      .eq("project_id", idea.id)
      .eq("builder_address", walletAddress)
      .single()
    if (!error && data) {
      setUserJoinRequest(data)
      setJoinRequestStatus(data.status)
    } else {
      setUserJoinRequest(null)
      setJoinRequestStatus("")
    }
  }, [idea.id, walletAddress])

  // Fetch on team tab open
  useEffect(() => {
    if (activeTab === "team") {
      if (isOwner) fetchJoinRequests()
      else fetchUserJoinRequest()
    }
    // eslint-disable-next-line
  }, [activeTab, teamTabRefresh, isOwner, fetchJoinRequests, fetchUserJoinRequest])

  // Submit join request (non-owner)
  const handleJoinRequest = async () => {
    if (!walletAddress) {
      toast.error("Connect your wallet first")
      return
    }
    if (!joinMotivation.trim() || !joinSkills.trim()) {
      toast.error("Please fill in all required fields.")
      return
    }
    setJoinRequestSubmitting(true)
    try {
      const questions = {
        motivation: joinMotivation.trim(),
        skills: joinSkills.trim(),
        experience: joinExperience.trim(),
        links: joinLinks.trim(),
      }
      const { error } = await supabase
        .from("join_requests")
        .insert({
          project_id: idea.id,
          builder_address: walletAddress,
          questions,
        })
      if (error) {
        if (error.code === '23505') {
          toast.error("You have already requested to join.")
        } else {
          toast.error(error.message || "Failed to submit join request")
        }
      } else {
        toast.success("Join request submitted!")
        setTeamTabRefresh(r => r + 1)
        setJoinMotivation("")
        setJoinSkills("")
        setJoinExperience("")
        setJoinLinks("")
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to submit join request")
    } finally {
      setJoinRequestSubmitting(false)
    }
  }

  // Owner: accept/decline join request
  const handleRequestAction = async (requestId: number, action: 'accept' | 'decline') => {
    if (!isOwner) return
    try {
      // Update join_requests status
      const { error: reqError, data: reqData } = await supabase
        .from("join_requests")
        .update({ status: action === 'accept' ? 'approved' : 'declined', assigned_at: action === 'accept' ? new Date().toISOString() : null })
        .eq("id", requestId)
        .select()
      if (reqError || !reqData || reqData.length === 0) {
        toast.error(reqError?.message || "Failed to update request.")
        return
      }
      if (action === 'accept') {
        // Update project stage to growing
        const { error: projError, data: projData } = await supabase
          .from("projects")
          .update({ stage: 'growing' })
          .eq("id", idea.id)
          .select()
        if (projError || !projData || projData.length === 0) {
          toast.error(projError?.message || "Request approved, but failed to update project stage.")
        } else {
          toast.success("Request approved. Project is now growing!")
        }
      } else {
        toast.success("Request declined.")
      }
      setTeamTabRefresh(r => r + 1)
    } catch (e: any) {
      toast.error(e?.message || "Failed to update request.")
    }
  }

  // Modal outside click handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [onClose])

  // determine author/address fallback
  const authorAddr = idea.author || idea.owner_address || ""
  const initials = authorAddr.slice(2, 4).toUpperCase() || "??"

  // status badge helper
  const getStatusInfo = (s: string) => {
    switch (s) {
      case "planted":
        return { emoji: "🌱", label: "Planted", color: "bg-yellow-100 text-yellow-700 border-yellow-200" }
      case "growing":
        return { emoji: "🌿", label: "Growing", color: "bg-emerald-100 text-emerald-700 border-emerald-200" }
      case "bloomed":
        return { emoji: "🌸", label: "Bloomed", color: "bg-pink-100 text-pink-700 border-pink-200" }
      default:
        return { emoji: "❔", label: s, color: "bg-gray-100 text-gray-700 border-gray-200" }
    }
  }
  const status = getStatusInfo(idea.stage)

  // Parse description sections
  const desc = idea.fullDescription || idea.description || "";
  const { sections, extraSections } = parseDescriptionSections(desc);

  // Load comments for this idea
  useEffect(() => {
    const loadComments = async () => {
      const { data, error } = await supabase
        .from("comments")
        .select(`
          id,
          content,
          created_at,
          user_address,
          users!comments_user_address_fkey (
            bloom_username,
            wallet_address
          )
        `)
        .eq("project_id", idea.id)
        .order("created_at", { ascending: true })
      if (!error) setComments(data || [])
      // Count user's comments for this project
      if (walletAddress) {
        const userCount = (data || []).filter((c: any) => c.user_address === walletAddress).length
        setUserCommentCount(userCount)
      } else {
        setUserCommentCount(0)
      }
    }
    if (activeTab === "community") loadComments()
  }, [idea.id, activeTab, walletAddress])

  // Handle comment submission
  const handleSubmitComment = async () => {
    if (!hasVerifiedSignature || !walletAddress) {
      toast.error("Connect your wallet first")
      return
    }
    if (!newComment.trim()) {
      toast.error("Please enter a comment")
      return
    }
    // Always use latest totalSprouts for validation
    if (totalSprouts < requiredSprouts) {
      toast.error(`You need at least ${requiredSprouts} sprouts to comment! Earn more by nurturing, planting, or joining projects.`)
      return
    }
    setSubmittingComment(true)
    try {
      // Insert comment
      const { data: comment, error: commentErr } = await supabase
        .from("comments")
        .insert({
          project_id: idea.id,
          user_address: walletAddress,
          content: newComment.trim(),
        })
        .select("id")
        .single()
      if (commentErr) throw commentErr
      // Add sprouts for commenting (category 5: neglect, positive value)
      const neglectTypeId = await getSproutTypeId('neglect')
      const { error: sproutsErr } = await supabase
        .from("sprouts")
        .insert({
          user_address: walletAddress,
          sprout_type_id: neglectTypeId,
          amount: requiredSprouts, // POSITIVE value
          related_id: comment.id,
        })
      if (!sproutsErr) {
        toast.success(`+${requiredSprouts} sprouts used to comment to reduce comments spam🌱`)
      } else {
        logger.error("Failed to add neglect sprouts:", sproutsErr)
      }
      // Refresh comments and sprouts
      const { data: newComments } = await supabase
        .from("comments")
        .select(`
          id,
          content,
          created_at,
          user_address,
          users!comments_user_address_fkey (
            bloom_username,
            wallet_address
          )
        `)
        .eq("project_id", idea.id)
        .order("created_at", { ascending: true })
      setComments(newComments || [])
      setNewComment("")
      setUserCommentCount((c) => c + 1)
      // Always refresh sprouts after addition
      await refreshSprouts()
    } catch (error) {
      logger.error("Error submitting comment:", error)
      toast.error("Failed to submit comment")
    } finally {
      setSubmittingComment(false)
    }
  }

  // Tab definitions with icons, tooltips, and enabled state
  const tabDefs = [
    {
      value: "overview",
      label: "Overview",
      icon: <span role="img" aria-label="Sprout">🌱</span>,
      tooltip: "Project overview and details",
      enabled: true,
    },
    {
      value: "progress",
      label: "Progress",
      icon: <span role="img" aria-label="Growth">📈</span>,
      tooltip: "Milestones and progress",
      enabled: true,
    },
    {
      value: "team",
      label: "Gardeners",
      icon: <span role="img" aria-label="Team">👥</span>,
      tooltip: "Meet the team",
      enabled: idea.stage === "growing" || idea.stage === "bloomed",
    },
    {
      value: "community",
      label: "Community",
      icon: <span role="img" aria-label="Community">💬</span>,
      tooltip: "Comments and discussion",
      enabled: true,
    },
  ]

  return (
    <TooltipProvider>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-6 transition-all duration-300">
        <div
          ref={modalRef}
          className="w-full max-w-5xl sm:max-w-6xl max-h-[97vh] overflow-y-auto border border-emerald-200 bg-gradient-to-br from-emerald-50 via-green-100 to-teal-50 shadow-2xl rounded-3xl transition-all duration-300 transform scale-100 hover:scale-[1.01]"
          style={{ boxShadow: '0 8px 40px 0 rgba(16, 185, 129, 0.15), 0 1.5px 8px 0 rgba(16, 185, 129, 0.08)' }}
        >
          {/* thick garden gradient bar */}
          <div className="h-3 bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 rounded-t-3xl" />

          <CardHeader className="relative pb-4 px-8 pt-8">
            <div className="absolute top-6 right-6 flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const ideaUrl = `${window.location.origin}/idea/${idea.id}`
                      navigator.clipboard.writeText(ideaUrl).then(() => {
                        toast.success("Idea link copied to clipboard!")
                      }).catch(() => {
                        // Fallback for older browsers
                        const textArea = document.createElement("textarea")
                        textArea.value = ideaUrl
                        document.body.appendChild(textArea)
                        textArea.select()
                        document.execCommand("copy")
                        document.body.removeChild(textArea)
                        toast.success("Idea link copied to clipboard!")
                      })
                    }}
                    className="text-emerald-600 hover:bg-emerald-50 rounded-full p-2 transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share idea link</p>
                </TooltipContent>
              </Tooltip>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-emerald-600 hover:bg-emerald-50 rounded-full p-2 transition-colors"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="pr-16">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  {/* Markdown Title */}
                  <h1 className="text-4xl font-extrabold text-emerald-900 mb-4 tracking-tight leading-tight">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={{p: 'span'}}>{idea.title}</ReactMarkdown>
                  </h1>

                  <div className="flex items-center gap-4 mb-4">
                    <button
                      onClick={() => onProfileClick(authorAddr)}
                      className="flex items-center gap-2 hover:bg-emerald-50 rounded-lg p-2 transition-colors"
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-emerald-100 text-emerald-700 text-lg">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        {/* Show bloomUsername if available, else highlight as unknown */}
                        <span className="text-xs text-emerald-500 font-semibold tracking-wide uppercase mr-1">Planted by</span>
                        <span className={`font-bold text-base rounded px-2 py-1 shadow-sm ${idea.bloomUsername ? 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700' : 'bg-yellow-50 text-gray-400 italic border border-yellow-200'}`}
                        >
                          {idea.bloomUsername ? `@${idea.bloomUsername}` : 'Unknown Planter'}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-emerald-600">Grove-Keeper</span>
                        </div>
                      </div>
                    </button>

                    <Badge className={`${status.color} text-base px-3 py-1 rounded-xl font-semibold`}> {/* More prominent badge */}
                      {status.emoji} {status.label}
                    </Badge>

                    <div className="flex items-center gap-1 text-emerald-600">
                      <Calendar className="w-5 h-5" />
                      <span className="text-base">
                        {new Date(idea.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* top metrics row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
                <div className="text-center p-4 bg-emerald-50 rounded-xl shadow-sm">
                  <Heart className="w-6 h-6 text-rose-500 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-emerald-900">{idea.nurtureCount}</p>
                  <p className="text-xs text-emerald-600/70">Garden Loves</p>
                </div>
                <div className="text-center p-4 bg-emerald-50 rounded-xl shadow-sm">
                  <Users className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-emerald-900">{idea.joinCount}</p>
                  <p className="text-xs text-emerald-600/70">Gardeners</p>
                </div>
                <div className="text-center p-4 bg-emerald-50 rounded-xl shadow-sm">
                  <MessageCircle className="w-6 h-6 text-green-500 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-emerald-900">{idea.commentCount}</p>
                  <p className="text-xs text-emerald-600/70">Discussions</p>
                </div>
                <div className="text-center p-4 bg-emerald-50 rounded-xl shadow-sm">
                  <TrendingUp className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-emerald-900">{idea.bloomScore||0}</p>
                  <p className="text-xs text-emerald-600/70">Bloom Score</p>
                </div>
              </div>

              {/* action buttons */}
              <div className="flex gap-4 mb-2">
                {/* Dynamic Join Garden/Requests button */}
                {isOwner ? (
                  <Button
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-2 rounded-xl text-base font-semibold shadow-md transition-all duration-200"
                    onClick={() => setActiveTab("team")}
                  >
                    <Users className="w-5 h-5 mr-2" />
                    View Join Requests
                  </Button>
                ) : userJoinRequest ? (
                  <Button
                    variant="outline"
                    className="border-emerald-200 text-emerald-700 px-6 py-2 rounded-xl text-base font-semibold transition-all duration-200 cursor-default"
                    disabled
                  >
                    <Users className="w-5 h-5 mr-2" />
                    {userJoinRequest.status === 'pending' && 'Request Pending'}
                    {userJoinRequest.status === 'accepted' && 'Request Accepted'}
                    {userJoinRequest.status === 'declined' && 'Request Declined'}
                  </Button>
                ) : (
                  <Button
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-2 rounded-xl text-base font-semibold shadow-md transition-all duration-200"
                    onClick={() => setActiveTab("team")}
                  >
                    <Leaf className="w-5 h-5 mr-2" />
                    Join Garden
                  </Button>
                )}
                {(idea.stage === "growing" || idea.stage === "bloomed") && (
                  <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 px-6 py-2 rounded-xl text-base font-semibold transition-all duration-200">
                    <Github className="w-5 h-5 mr-2" />
                    Repository
                  </Button>
                )}
                {(idea.stage === "growing" || idea.stage === "bloomed") && (
                  <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 px-6 py-2 rounded-xl text-base font-semibold transition-all duration-200">
                    <ExternalLink className="w-5 h-5 mr-2" />
                    Live Demo
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            {/* Modern Garden-Themed Tabs */}
            <div className="relative mb-6">
              <div className="flex overflow-x-auto no-scrollbar bg-gradient-to-r from-emerald-100 via-green-50 to-teal-100 rounded-2xl shadow-inner p-2 gap-3">
                {tabDefs.map((tab, idx) => (
                  <Tooltip key={tab.value}>
                    <TooltipTrigger asChild>
                      <button
                        className={`relative flex flex-col items-center justify-center px-5 py-2 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50
                          ${activeTab === tab.value ?
                            "bg-gradient-to-br from-emerald-300 to-teal-200 text-emerald-900 shadow-lg scale-105 z-10" :
                            "text-emerald-600 hover:bg-emerald-50/80"}
                          ${!tab.enabled ? "opacity-40 cursor-not-allowed" : ""}
                        `}
                        onClick={() => tab.enabled && setActiveTab(tab.value as typeof activeTab)}
                        disabled={!tab.enabled}
                        aria-label={tab.label}
                        tabIndex={tab.enabled ? 0 : -1}
                      >
                        <span className="text-xl mb-1">{tab.icon}</span>
                        <span className="text-xs font-bold tracking-wide">{tab.label}</span>
                        {/* Fun micro-interaction: sprout grows on active */}
                        {activeTab === tab.value && (
                          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-emerald-400 animate-bounce text-lg select-none">🌱</span>
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>{tab.tooltip}</TooltipContent>
                  </Tooltip>
                ))}
              </div>
              {/* Animated indicator */}
              <div className="absolute left-0 right-0 h-1 flex mt-1 pointer-events-none">
                <div
                  className="transition-all duration-300"
                  style={{
                    width: `calc(25% - 0.5rem)`,
                    marginLeft: `calc(${tabDefs.findIndex(t => t.value === activeTab) * 25}% + ${tabDefs.findIndex(t => t.value === activeTab) * 0.5}rem)`,
                    background: "linear-gradient(90deg, #34d399 0%, #6ee7b7 100%)",
                    borderRadius: 8,
                    height: 4,
                    boxShadow: "0 2px 8px 0 #6ee7b7aa"
                  }}
                />
              </div>
            </div>
            {/* Tab Panels */}
            <div className="rounded-2xl bg-white/90 shadow p-2 min-h-[300px]">
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Visuals Grid */}
                  {visuals.length > 0 && (
                    <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {visuals.map((visual) => (
                        <div key={visual.id} className="rounded-lg overflow-hidden border border-emerald-100 bg-emerald-50 flex flex-col items-center justify-center">
                          <img
                            src={visual.url}
                            alt={visual.alt_text || "Project visual"}
                            className="object-cover w-full h-40 sm:h-48 md:h-56"
                            style={{ maxHeight: 220 }}
                          />
                          {visual.alt_text && (
                            <div className="p-2 text-xs text-emerald-700 text-center bg-emerald-50 w-full">{visual.alt_text}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Sectioned Markdown */}
                  <div className="space-y-6">
                    {[
                      { key: "problem", label: "What problem does your idea solve?" },
                      { key: "vision", label: "Vision" },
                      { key: "features", label: "Features" },
                      { key: "tech", label: "Tech" },
                      { key: "targetUsers", label: "Who is it for? (Target users, impact)" },
                      { key: "unique", label: "What makes it unique?" },
                    ].map(({ key, label }) => (
                      <section key={key} className="bg-emerald-50/60 rounded-xl border border-emerald-100 p-4 shadow-sm">
                        <h3 className="text-lg font-semibold text-emerald-800 mb-2">{label}</h3>
                        <div className="prose prose-emerald max-w-none text-emerald-900">
                          {sections[key] ? (
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{sections[key]}</ReactMarkdown>
                          ) : (
                            <span className="text-emerald-400 italic">No content provided.</span>
                          )}
                        </div>
                      </section>
                    ))}
                    {/* Render any extra ## sections as their own cards */}
                    {extraSections.map(({ header, content }, idx) => (
                      <section key={header + idx} className="bg-emerald-50/60 rounded-xl border border-emerald-100 p-4 shadow-sm">
                        <h3 className="text-lg font-semibold text-emerald-800 mb-2">{header}</h3>
                        <div className="prose prose-emerald max-w-none text-emerald-900">
                          {content ? (
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                          ) : (
                            <span className="text-emerald-400 italic">No content provided.</span>
                          )}
                        </div>
                      </section>
                    ))}
                  </div>
                  {/* Project Links */}
                  {links.length > 0 && (
                    <div className="mt-2">
                      <h3 className="font-semibold text-emerald-800 text-sm mb-2">Project Links</h3>
                      <ul className="space-y-2">
                        {links.map((link) => {
                          let urlObj;
                          try { urlObj = new URL(link.url); } catch { urlObj = null; }
                          const domain = urlObj ? urlObj.hostname.replace(/^www\./, "") : link.url;
                          return (
                            <li key={link.id} className="flex items-center gap-3 p-2 bg-emerald-50 rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-colors">
                              <img
                                src={`https://www.google.com/s2/favicons?domain=${urlObj ? urlObj.hostname : link.url}&sz=32`}
                                alt="favicon"
                                className="w-5 h-5 rounded"
                                style={{ minWidth: 20 }}
                              />
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-700 font-medium hover:underline"
                              >
                                {link.label || domain}
                              </a>
                              <span className="ml-auto text-xs text-emerald-400">{domain}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              {activeTab === "progress" && (
                <div className="space-y-6">
                  {idea.milestones?.length ? (
                    idea.milestones.map((ms, i) => (
                      <div key={i} className="bg-emerald-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-emerald-900">{ms.name}</h4>
                          <Badge
                            variant="outline"
                            className={
                              ms.status === "completed"
                                ? "border-green-200 text-green-700 bg-green-50"
                                : ms.status === "in-progress"
                                ? "border-yellow-200 text-yellow-700 bg-yellow-50"
                                : "border-gray-200 text-gray-700 bg-gray-50"
                            }
                          >
                            {ms.status === "completed"
                              ? "🌸 Bloomed"
                              : ms.status === "in-progress"
                              ? "🌿 Growing"
                              : "🌱 Planted"}
                          </Badge>
                        </div>
                        <Progress value={ms.progress} className="h-2 mb-1" />
                        <p className="text-xs text-emerald-600/70 text-right">
                          {ms.progress}% • {ms.date}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-40 text-emerald-400">
                      <span className="text-4xl mb-2">🌱</span>
                      <span className="font-semibold">No milestones yet. Plant your first goal!</span>
                    </div>
                  )}
                </div>
              )}
              {activeTab === "team" && (
                <div className="space-y-6">
                  {/* Show approved gardeners if any */}
                  {joinRequests.filter(r => r.status === 'approved').length > 0 && (
                    <div className="bg-emerald-100/60 rounded-xl p-4 border border-emerald-200">
                      <h3 className="font-semibold text-emerald-800 mb-3 text-lg flex items-center gap-2"><Users className="w-5 h-5" /> Gardeners</h3>
                      <ul className="flex flex-wrap gap-4">
                        {joinRequests.filter(r => r.status === 'approved').map((gardener) => {
                          const username = gardener.users?.bloom_username || gardener.builder_address.slice(0, 6) + '...' + gardener.builder_address.slice(-4)
                          return (
                            <li key={gardener.id} className="flex items-center gap-3 bg-white rounded-lg p-3 border border-emerald-100 shadow-sm">
                              <Avatar className="w-8 h-8 cursor-pointer" onClick={() => onProfileClick(gardener.builder_address)}>
                                <AvatarFallback className="bg-emerald-100 text-emerald-700">{username.slice(0,2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div>
                                <button onClick={() => onProfileClick(gardener.builder_address)} className="font-semibold text-emerald-900 hover:underline text-base">
                                  {username}
                                </button>
                                <div className="text-xs text-emerald-600">{gardener.builder_address}</div>
                              </div>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )}
                  {/* Owner: View join requests */}
                  {isOwner ? (
                    <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                      <h3 className="font-semibold text-emerald-800 mb-3 text-lg flex items-center gap-2"><Users className="w-5 h-5" /> Join Requests</h3>
                      {joinRequestsLoading ? (
                        <div className="text-emerald-400">Loading requests...</div>
                      ) : joinRequests.length === 0 ? (
                        <div className="text-emerald-400">No join requests yet.</div>
                      ) : (
                        <ul className="space-y-3">
                          {joinRequests.map((req) => {
                            const username = req.users?.bloom_username || req.builder_address.slice(0, 6) + '...' + req.builder_address.slice(-4)
                            return (
                              <li key={req.id} className="flex items-center gap-4 bg-white rounded-lg p-3 border border-emerald-100 shadow-sm">
                                <Avatar className="w-8 h-8"><AvatarFallback className="bg-emerald-100 text-emerald-700">{username.slice(0,2).toUpperCase()}</AvatarFallback></Avatar>
                                <div className="flex-1">
                                  <div className="font-semibold text-emerald-900">{username}</div>
                                  <div className="text-xs text-emerald-600">{req.builder_address}</div>
                                  <div className="text-emerald-700 mt-1 text-sm">
                                    {req.questions?.motivation && <div><span className="font-semibold">Motivation:</span> {req.questions.motivation}</div>}
                                    {req.questions?.skills && <div><span className="font-semibold">Skills:</span> {req.questions.skills}</div>}
                                    {req.questions?.experience && req.questions.experience.length > 0 && <div><span className="font-semibold">Experience:</span> {req.questions.experience}</div>}
                                    {req.questions?.links && req.questions.links.length > 0 && <div><span className="font-semibold">Links:</span> <a href={req.questions.links} target="_blank" rel="noopener noreferrer" className="underline text-emerald-600">{req.questions.links}</a></div>}
                                  </div>
                                  <div className="text-xs text-emerald-400">Requested: {new Date(req.created_at).toLocaleString()}</div>
                                </div>
                                <div className="flex gap-2 items-center">
                                  <Badge className={
                                    req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                    req.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                    'bg-rose-100 text-rose-700'
                                  }>{req.status.charAt(0).toUpperCase() + req.status.slice(1)}</Badge>
                                  {req.status === 'pending' && (
                                    <>
                                      <Button size="sm" className="bg-emerald-500 text-white" onClick={() => handleRequestAction(req.id, 'accept')}>Accept</Button>
                                      <Button size="sm" variant="outline" className="border-rose-200 text-rose-700" onClick={() => handleRequestAction(req.id, 'decline')}>Decline</Button>
                                    </>
                                  )}
                                </div>
                              </li>
                            )
                          })}
                        </ul>
                      )}
                    </div>
                  ) : (
                    // Non-owner: Show join form/status if not already approved
                    (() => {
                      // Check if user is already an approved gardener
                      const isApprovedGardener = joinRequests.some(r => r.status === 'approved' && r.builder_address?.toLowerCase() === walletAddress?.toLowerCase());
                      if (isApprovedGardener) {
                        return (
                          <div className="bg-green-50 rounded-xl p-4 border border-green-200 max-w-lg mx-auto flex flex-col items-center">
                            <Badge className="bg-green-100 text-green-700 mb-2">Approved Gardener</Badge>
                            <div className="text-green-800 font-semibold">You are an approved gardener in this garden!</div>
                          </div>
                        );
                      }
                      // If not approved, show join form/status as before
                      return (
                        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 max-w-lg mx-auto">
                          {userJoinRequest ? (
                            <div className="flex flex-col items-center gap-2">
                              <Badge className={
                                userJoinRequest.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                userJoinRequest.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                'bg-rose-100 text-rose-700'
                              }>{userJoinRequest.status.charAt(0).toUpperCase() + userJoinRequest.status.slice(1)}</Badge>
                              <div className="text-emerald-700">You have already requested to join this garden.</div>
                            </div>
                          ) : (
                            <form onSubmit={e => { e.preventDefault(); handleJoinRequest(); }} className="flex flex-col gap-4">
                              <div>
                                <label className="text-emerald-800 font-semibold block mb-1">Why do you want to join this garden? <span className="text-rose-500">*</span></label>
                                <textarea
                                  className="border border-emerald-200 rounded-lg p-2 min-h-[48px] bg-white focus:border-emerald-400 focus:ring-emerald-400/20 text-sm w-full"
                                  value={joinMotivation}
                                  onChange={e => setJoinMotivation(e.target.value)}
                                  placeholder="Share your motivation..."
                                  required
                                />
                              </div>
                              <div>
                                <label className="text-emerald-800 font-semibold block mb-1">What skills can you bring? <span className="text-rose-500">*</span></label>
                                <input
                                  className="border border-emerald-200 rounded-lg p-2 bg-white focus:border-emerald-400 focus:ring-emerald-400/20 text-sm w-full"
                                  value={joinSkills}
                                  onChange={e => setJoinSkills(e.target.value)}
                                  placeholder="e.g. Solidity, UI/UX, Community, etc."
                                  required
                                />
                              </div>
                              <div>
                                <label className="text-emerald-800 font-semibold block mb-1">Relevant experience</label>
                                <textarea
                                  className="border border-emerald-200 rounded-lg p-2 min-h-[36px] bg-white focus:border-emerald-400 focus:ring-emerald-400/20 text-sm w-full"
                                  value={joinExperience}
                                  onChange={e => setJoinExperience(e.target.value)}
                                  placeholder="Share any relevant experience (optional)"
                                />
                              </div>
                              <div>
                                <label className="text-emerald-800 font-semibold block mb-1">Portfolio/Links</label>
                                <input
                                  className="border border-emerald-200 rounded-lg p-2 bg-white focus:border-emerald-400 focus:ring-emerald-400/20 text-sm w-full"
                                  value={joinLinks}
                                  onChange={e => setJoinLinks(e.target.value)}
                                  placeholder="Link to your portfolio, GitHub, etc. (optional)"
                                />
                              </div>
                              <Button
                                type="submit"
                                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-xl shadow"
                                disabled={joinRequestSubmitting}
                              >
                                {joinRequestSubmitting ? "Submitting..." : "Submit Join Request"}
                              </Button>
                            </form>
                          )}
                        </div>
                      );
                    })()
                  )}
                </div>
              )}
              {activeTab === "community" && (
                <div className="flex flex-col h-[60vh] min-h-[400px] max-h-[500px]">
                  <div className="flex-1 overflow-y-auto px-2 py-4 bg-emerald-50/60 rounded-xl border border-emerald-100 mb-2 flex flex-col gap-2">
                    {comments.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-emerald-600/70">
                        <span className="text-5xl mb-2">🦋</span>
                        <p>No comments yet. Be the first to plant your thoughts!</p>
                      </div>
                    ) : (
                      comments.map((comment) => {
                        const isSelf = walletAddress && comment.user_address === walletAddress
                        const authorName = comment.users?.bloom_username || `${comment.user_address.slice(0, 6)}...${comment.user_address.slice(-4)}`
                        const initials = authorName.slice(0, 2).toUpperCase()
                        const timeAgo = new Date(comment.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
                        return (
                          <div key={comment.id} className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex items-end gap-2 max-w-[80%] ${isSelf ? 'flex-row-reverse' : ''}`}>
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="text-xs bg-emerald-100 text-emerald-700">{initials}</AvatarFallback>
                              </Avatar>
                              <div className={`rounded-2xl px-4 py-2 shadow ${isSelf ? 'bg-emerald-200 text-emerald-900' : 'bg-white text-emerald-900 border border-emerald-100'}`}
                                style={{ wordBreak: 'break-word' }}>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-xs">{authorName}</span>
                                  <span className="text-xs text-emerald-400">{timeAgo}</span>
                                </div>
                                <div className="text-sm">{comment.content}</div>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                  {/* Input area sticky at bottom */}
                  <div className="sticky bottom-0 bg-white/90 rounded-xl border border-emerald-100 p-3 flex flex-col gap-2 shadow-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-emerald-700 font-semibold">Sprouts required to comment: <span className="font-bold">{requiredSprouts}</span></span>
                      {totalSprouts < requiredSprouts && (
                        <span className="text-xs text-rose-500 font-semibold">Not enough sprouts</span>
                      )}
                    </div>
                    <div className="flex gap-2 items-end">
                      <textarea
                        placeholder={totalSprouts < requiredSprouts ? `You need more sprouts to comment!` : "Plant your thoughts..."}
                        className="flex-1 border border-emerald-200 rounded-lg p-2 min-h-[40px] max-h-[80px] resize-none bg-emerald-50 focus:bg-white focus:border-emerald-400 focus:ring-emerald-400/20 text-sm"
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        disabled={submittingComment || totalSprouts < requiredSprouts}
                      />
                      <Button
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-xl shadow"
                        onClick={handleSubmitComment}
                        disabled={submittingComment || totalSprouts < requiredSprouts}
                      >
                        <Send className="w-4 h-4 mr-1" />
                        {submittingComment ? "Sending..." : "Send"}
                      </Button>
                    </div>
                    {totalSprouts < requiredSprouts && (
                      <div className="text-xs text-emerald-700 mt-1 flex items-center gap-2">
                        <span>Need more sprouts? <Link href="/" className="underline text-emerald-600">Learn how to earn</Link></span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </div>
      </div>
    </TooltipProvider>
  )
}
