"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  Flower2,
  Github,
  Twitter,
  MessageCircle,
  ExternalLink,
  Edit,
  Save,
  AlertCircle,
  CheckCircle,
  Loader2,
  User,
} from "lucide-react"
import Link from "next/link"
import { useAccount } from "wagmi"
import { useSignatureVerification } from "@/hooks/use-signature-verification"
import { supabase } from "@/lib/supabaseClient"
import { toast } from "sonner"
import EmojiPicker from "@/components/emoji-picker"
import { useSprouts } from "@/hooks/use-sprouts"
import { getReputationLevel } from "@/lib/sprouts"
import { useGardenTheme } from '@/components/garden-theme-context';
import { logger } from "@/lib/logger";

// Types
interface UserProfile {
  wallet_address: string
  signature: string
  signature_count: number
  role: 'user' | 'admin' | 'moderator'
  blocked: boolean
  bloom_username?: string
  description?: string
  github_username?: string
  twitter_username?: string
  pfp_emoji?: string
  created_at: string
  updated_at: string
}

const defaultProfile: UserProfile = {
  wallet_address: "",
  signature: "",
  signature_count: 1,
  role: 'user',
  blocked: false,
  bloom_username: "",
  description: "",
  github_username: "",
  twitter_username: "",
  pfp_emoji: "🌱",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

export default function MyProfilePage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [profileData, setProfileData] = useState<UserProfile>(defaultProfile)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [usernameCheckLoading, setUsernameCheckLoading] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)

  const { address, isConnected } = useAccount()
  const { hasVerifiedSignature } = useSignatureVerification()
  const { totalSprouts, sproutsByType, loading } = useSprouts(address)
  const reputationLevel = getReputationLevel(totalSprouts)
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

  // Check if user is authenticated
  const isAuthenticated = isConnected && hasVerifiedSignature && address

  // Fetch user profile on mount
  useEffect(() => {
    if (isAuthenticated && address) {
      fetchUserProfile()
    } else {
      setIsLoading(false)
    }
  }, [isAuthenticated, address])

  // Fetch user profile from Supabase
  const fetchUserProfile = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', address)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data) {
        setProfileData({
          wallet_address: data.wallet_address,
          signature: data.signature,
          signature_count: data.signature_count,
          role: data.role,
          blocked: data.blocked,
          bloom_username: data.bloom_username || "",
          description: data.description || "",
          github_username: data.github_username || "",
          twitter_username: data.twitter_username || "",
          pfp_emoji: data.pfp_emoji || "🌱",
          created_at: data.created_at,
          updated_at: data.updated_at,
        })
      } else {
        // Create new profile if doesn't exist
        setProfileData({
          ...defaultProfile,
          wallet_address: address || "",
        })
      }
    } catch (error) {
      logger.error('Error fetching profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }

  // Check username availability
  const checkUsernameAvailability = async (username: string) => {
    if (!username || username.length < 3 || !address) {
      setUsernameAvailable(null)
      return
    }

    try {
      setUsernameCheckLoading(true)
      const { data, error } = await supabase
        .from('users')
        .select('bloom_username')
        .eq('bloom_username', username)
        .neq('wallet_address', address) // Exclude current user
        .single()

      if (error && error.code === 'PGRST116') {
        // No user found with this username
        setUsernameAvailable(true)
      } else if (data) {
        // Username already taken
        setUsernameAvailable(false)
      } else {
        setUsernameAvailable(true)
      }
    } catch (error) {
      console.error('Error checking username:', error)
      setUsernameAvailable(null)
    } finally {
      setUsernameCheckLoading(false)
    }
  }

  // Helper function to clean social media usernames
  const cleanSocialUsername = (username: string): string => {
    // Remove @ symbol if present and trim whitespace
    return username.replace(/^@/, '').trim()
  }

  // Validate form data
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    // Username validation
    if (!profileData.bloom_username) {
      errors.bloom_username = "Bloom username is required"
    } else if (profileData.bloom_username.length < 3) {
      errors.bloom_username = "Username must be at least 3 characters"
    } else if (!/^[a-zA-Z0-9_-]+$/.test(profileData.bloom_username)) {
      errors.bloom_username = "Username can only contain letters, numbers, hyphens, and underscores"
    } else if (usernameAvailable === false) {
      errors.bloom_username = "Username is already taken"
    }

    // Description validation
    if (profileData.description && profileData.description.length > 500) {
      errors.description = "Description must be 500 characters or less"
    }

    // Social media validation
    if (profileData.github_username) {
      const cleanGithub = cleanSocialUsername(profileData.github_username)
      if (!cleanGithub) {
        errors.github_username = "GitHub username cannot be empty"
      } else if (!/^[a-zA-Z0-9-]+$/.test(cleanGithub)) {
        errors.github_username = "GitHub username can only contain letters, numbers, and hyphens"
      } else if (cleanGithub.length > 39) {
        errors.github_username = "GitHub username must be 39 characters or less"
      }
    }

    if (profileData.twitter_username) {
      const cleanTwitter = cleanSocialUsername(profileData.twitter_username)
      if (!cleanTwitter) {
        errors.twitter_username = "Twitter username cannot be empty"
      } else if (!/^[a-zA-Z0-9_]+$/.test(cleanTwitter)) {
        errors.twitter_username = "Twitter username can only contain letters, numbers, and underscores"
      } else if (cleanTwitter.length > 15) {
        errors.twitter_username = "Twitter username must be 15 characters or less"
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle form field changes
  const handleFieldChange = (field: keyof UserProfile, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }))
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: "" }))
    }

    // Check username availability
    if (field === 'bloom_username') {
      const timeoutId = setTimeout(() => checkUsernameAvailability(value), 500)
      return () => clearTimeout(timeoutId)
    }
  }

  // Save profile data
  const handleSave = async () => {
    if (!isAuthenticated || !address) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!validateForm()) {
      // Show specific validation errors
      const errorMessages = Object.values(validationErrors).filter(msg => msg)
      if (errorMessages.length > 0) {
        toast.error(`Please fix the following errors: ${errorMessages.join(', ')}`)
      }
      return
    }

    try {
      setIsSaving(true)
      
      // Clean social media usernames before saving
      const cleanGithub = profileData.github_username ? cleanSocialUsername(profileData.github_username) : null
      const cleanTwitter = profileData.twitter_username ? cleanSocialUsername(profileData.twitter_username) : null
      
      const updateData = {
        wallet_address: address,
        signature: profileData.signature, // Keep existing signature
        signature_count: profileData.signature_count, // Keep existing signature count
        role: profileData.role, // Keep existing role
        blocked: profileData.blocked, // Keep existing blocked status
        bloom_username: profileData.bloom_username || null,
        description: profileData.description || null,
        pfp_emoji: profileData.pfp_emoji || "🌱",
        github_username: cleanGithub,
        twitter_username: cleanTwitter,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from('users')
        .upsert(updateData, { onConflict: 'wallet_address' })

      if (error) {
        throw error
      }

      toast.success('Profile updated successfully!')
      setIsEditing(false)
      setValidationErrors({})
      setUsernameAvailable(null)
      
      // Refresh profile data
      await fetchUserProfile()
    } catch (error) {
      logger.error('Error saving profile:', error)
      toast.error('Failed to save profile')
    } finally {
      setIsSaving(false)
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-emerald-700">Loading your garden profile...</p>
        </div>
      </div>
    )
  }

  // Show authentication required
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center">
        <Card className="border-emerald-100 bg-white/80 backdrop-blur-sm max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Flower2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-semibold text-emerald-900 mb-2">Garden Access Required</h2>
            <p className="text-emerald-700 mb-6">
              Please connect your wallet and sign a message to access your garden profile.
            </p>
            <Link href="/">
              <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Garden
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

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
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                  <Flower2 className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-emerald-800">My Garden Profile</span>
              </div>
            </div>
            {/* Header buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                disabled={isSaving}
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-transparent"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : isEditing ? (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </>
                )}
              </Button>
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
              {/* Avatar with Emoji Picker */}
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                  <AvatarFallback className="text-3xl bg-emerald-100 text-emerald-700">
                    {profileData.pfp_emoji || "🌱"}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <div className="absolute -bottom-2 -right-2">
                    <EmojiPicker
                      selectedEmoji={profileData.pfp_emoji || "🌱"}
                      onEmojiSelect={(emoji) => handleFieldChange('pfp_emoji', emoji)}
                    />
                  </div>
                )}
              </div>

              <div className="flex-1 pt-12 md:pt-4">
                {isEditing ? (
                  <div className="space-y-4">
                    {/* Username Field */}
                    <div>
                      <Label htmlFor="bloom_username">Bloom Username *</Label>
                      <div className="relative">
                        <Input
                          id="bloom_username"
                          value={profileData.bloom_username || ""}
                          onChange={(e) => handleFieldChange('bloom_username', e.target.value)}
                          className={`border-emerald-200 focus:border-emerald-400 ${
                            validationErrors.bloom_username ? 'border-red-300' : ''
                          }`}
                          placeholder="your-username"
                        />
                        {usernameCheckLoading && (
                          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-emerald-400" />
                        )}
                        {usernameAvailable === true && !usernameCheckLoading && (
                          <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
                        )}
                        {usernameAvailable === false && !usernameCheckLoading && (
                          <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-500" />
                        )}
                      </div>
                      {validationErrors.bloom_username && (
                        <p className="text-sm text-red-600 mt-1">{validationErrors.bloom_username}</p>
                      )}
                      <p className="text-xs text-emerald-600/70 mt-1">
                        This will be your unique identifier in the garden. Only letters, numbers, hyphens, and underscores allowed.
                      </p>
                    </div>

                    {/* Description Field */}
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={profileData.description || ""}
                        onChange={(e) => handleFieldChange('description', e.target.value)}
                        className={`border-emerald-200 focus:border-emerald-400 ${
                          validationErrors.description ? 'border-red-300' : ''
                        }`}
                        placeholder="Tell us about yourself and your interests..."
                        rows={4}
                      />
                      {validationErrors.description && (
                        <p className="text-sm text-red-600 mt-1">{validationErrors.description}</p>
                      )}
                      <p className="text-xs text-emerald-600/70 mt-1">
                        {(profileData.description || "").length}/500 characters
                      </p>
                    </div>

                    {/* Social Links */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="github">GitHub Username</Label>
                        <Input
                          id="github"
                          value={profileData.github_username || ""}
                          onChange={(e) => handleFieldChange('github_username', e.target.value)}
                          className={`border-emerald-200 focus:border-emerald-400 ${
                            validationErrors.github_username ? 'border-red-300' : ''
                          }`}
                          placeholder="username or @username"
                        />
                        {validationErrors.github_username && (
                          <p className="text-sm text-red-600 mt-1">{validationErrors.github_username}</p>
                        )}
                        <p className="text-xs text-emerald-600/70 mt-1">
                          Enter username only (e.g., "johndoe" or "@johndoe"). We'll automatically add https://github.com/
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="twitter">Twitter Username</Label>
                        <Input
                          id="twitter"
                          value={profileData.twitter_username || ""}
                          onChange={(e) => handleFieldChange('twitter_username', e.target.value)}
                          className={`border-emerald-200 focus:border-emerald-400 ${
                            validationErrors.twitter_username ? 'border-red-300' : ''
                          }`}
                          placeholder="username or @username"
                        />
                        {validationErrors.twitter_username && (
                          <p className="text-sm text-red-600 mt-1">{validationErrors.twitter_username}</p>
                        )}
                        <p className="text-xs text-emerald-600/70 mt-1">
                          Enter username only (e.g., "johndoe" or "@johndoe"). We'll automatically add https://x.com/
                        </p>
                      </div>
                    </div>

                    {/* Save Button */}
                    <Button 
                      onClick={handleSave} 
                      disabled={isSaving || Object.keys(validationErrors).length > 0}
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div>
                    <h1 className="text-2xl font-bold text-emerald-900 mb-1">
                      {profileData.bloom_username || "Anonymous Gardener"}
                    </h1>
                    <div className="flex items-center gap-2 mb-2">
                      {profileData.bloom_username && (
                        <span className="text-emerald-700 font-medium">@{profileData.bloom_username}</span>
                      )}
                      <span className="text-emerald-600/70">({address?.slice(0, 6)}...{address?.slice(-4)})</span>
                      <Badge className="bg-teal-400 text-white border-0">
                        <User className="w-3 h-3 mr-1" />
                        {profileData.role}
                      </Badge>
                    </div>
                    <p className="text-emerald-800/80 max-w-2xl mb-4">
                      {profileData.description || "No description provided yet."}
                    </p>

                    {/* Social Links */}
                    <div className="flex items-center gap-4 mb-4">
                      {profileData.github_username && (
                        <a
                          href={`https://github.com/${profileData.github_username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors"
                        >
                          <Github className="w-4 h-4" />
                          <span className="text-sm">@{profileData.github_username}</span>
                        </a>
                      )}
                      {profileData.twitter_username && (
                        <a
                          href={`https://x.com/${profileData.twitter_username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors"
                        >
                          <Twitter className="w-4 h-4" />
                          <span className="text-sm">@{profileData.twitter_username}</span>
                        </a>
                      )}
                    </div>

                    {/* Account Info */}
                    <div className="bg-emerald-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-emerald-800">Account Status</span>
                        <span className="text-sm text-emerald-600">
                          {profileData.blocked ? "Blocked" : "Active"}
                        </span>
                      </div>
                     
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 bg-white/80 border border-emerald-200">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-800"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-800"
            >
              Activity
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-800"
            >
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Garden Theater */}
            <Card className="border-emerald-100 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <h3 className="text-xl font-semibold text-emerald-900">🌸 Garden Theater</h3>
                <p className="text-emerald-700/70">Your personal garden visualization</p>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-8 text-center">
                  <div className="grid grid-cols-8 gap-2 max-w-md mx-auto mb-4">
                    {Array.from({ length: 32 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-6 h-6 rounded-full ${
                          i < Math.floor((profileData.signature_count || 0) / 2)
                            ? "bg-gradient-to-br from-pink-400 to-rose-500 animate-pulse"
                            : "bg-emerald-100"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-emerald-700 font-medium">
                    {Math.floor((profileData.signature_count || 0) / 2)} petals bloomed from your garden activities
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card className="border-emerald-100 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <h3 className="text-xl font-semibold text-emerald-900">Recent Garden Activity</h3>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Flower2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <p className="text-emerald-700">Start building to see your activity here!</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="border-emerald-100 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <h3 className="text-xl font-semibold text-emerald-900">Account Settings</h3>
                <p className="text-emerald-700/70">Manage your account preferences</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
                  <div>
                    <p className="font-medium text-emerald-900">Wallet Address</p>
                    <p className="text-sm text-emerald-600">{address}</p>
                  </div>
                  <Badge variant="outline" className="border-emerald-200 text-emerald-700">
                    Connected
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
                  <div>
                    <p className="font-medium text-emerald-900">Account Role</p>
                    <p className="text-sm text-emerald-600 capitalize">{profileData.role}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
                  <div>
                    <p className="font-medium text-emerald-900">Account Status</p>
                    <p className="text-sm text-emerald-600">
                      {profileData.blocked ? "Blocked" : "Active"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
                  <div>
                    <p className="font-medium text-emerald-900">Profile Created</p>
                    <p className="text-sm text-emerald-600">
                      {new Date(profileData.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
                  <div>
                    <p className="font-medium text-emerald-900">Last Updated</p>
                    <p className="text-sm text-emerald-600">
                      {new Date(profileData.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
