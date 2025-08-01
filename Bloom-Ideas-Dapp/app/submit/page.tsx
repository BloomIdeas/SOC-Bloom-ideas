// app/submit/page.tsx
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { toast } from "sonner"
import { useIsMobile } from "@/hooks/use-mobile"
import { calculateSproutsForSubmission, getSproutTypeId } from "@/lib/sprouts"
import { logger } from "@/lib/logger";

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import UniversalWalletConnection from "@/components/universal-wallet-connection"
import ReactMarkdown from "react-markdown"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

import {
  ArrowLeft,
  Flower2,
  Sparkles,
  Link as LinkIcon,
  Upload,
} from "lucide-react"
import { SeasonalBackground, FloatingGardenElements, GardenWeather } from "@/components/garden-elements"
import { useGardenTheme } from '@/components/garden-theme-context';

interface Category { id: number; name: string }
interface TechStack { id: number; name: string }

export default function SubmitIdeaPage() {
  const router = useRouter()
  const isMobile = useIsMobile()
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

  // Loaded from Supabase
  const [categories, setCategories] = useState<Category[]>([])
  const [techStacks, setTechStacks] = useState<TechStack[]>([])

  // User & form state
  const [walletAddress, setWalletAddress] = useState<string>("")
  const [formData, setFormData] = useState({
    title: "",
    // --- Split description into guided sections ---
    problem: "",
    vision: "",
    features: "",
    tech: "",
    targetUsers: "",
    unique: "",
    // ---
    categoryIds: [] as number[],
    techStackIds: [] as number[],
    links: [] as { url: string; label: string }[],
    visuals: [] as { url: string; alt: string }[],
  })
  const [submitting, setSubmitting] = useState(false)

  // Load categories & techStacks once
  useEffect(() => {
    supabase
      .from("categories")
      .select("id,name")
      .order("name", { ascending: true })
      .then(({ data, error }) => {
        if (error) throw error
        if (data) setCategories(data)
      })
    supabase
      .from("tech_stacks")
      .select("id,name")
      .order("name", { ascending: true })
      .then(({ data, error }) => {
        if (error) throw error
        if (data) setTechStacks(data)
      })
  }, [])

  // Wallet connection callback
  const handleWalletConnectionChange = (connected: boolean, address?: string) => {
    if (connected && address) setWalletAddress(address)
    else setWalletAddress("")
  }

  // Toggle helpers
  const toggleCategory = (id: number) => {
    setFormData((f) => ({
      ...f,
      categoryIds: f.categoryIds.includes(id)
        ? f.categoryIds.filter((c) => c !== id)
        : [...f.categoryIds, id],
    }))
  }
  const toggleTechStack = (id: number) => {
    setFormData((f) => ({
      ...f,
      techStackIds: f.techStackIds.includes(id)
        ? f.techStackIds.filter((t) => t !== id)
        : [...f.techStackIds, id],
    }))
  }

  // Add / remove dynamic links & visuals
  const addLink = () =>
    setFormData((f) => ({ ...f, links: [...f.links, { url: "", label: "" }] }))
  const updateLink = (idx: number, key: "url" | "label", val: string) =>
    setFormData((f) => {
      const l = [...f.links]
      l[idx] = { ...l[idx], [key]: val }
      return { ...f, links: l }
    })
  const removeLink = (idx: number) =>
    setFormData((f) => {
      const l = f.links.filter((_, i) => i !== idx)
      return { ...f, links: l }
    })

  const addVisual = () =>
    setFormData((f) => ({ ...f, visuals: [...f.visuals, { url: "", alt: "" }] }))
  const updateVisual = (idx: number, key: "url" | "alt", val: string) =>
    setFormData((f) => {
      const v = [...f.visuals]
      v[idx] = { ...v[idx], [key]: val }
      return { ...f, visuals: v }
    })
  const removeVisual = (idx: number) =>
    setFormData((f) => ({
      ...f,
      visuals: f.visuals.filter((_, i) => i !== idx),
    }))

  // Submission
  const handleSubmit = async () => {
    if (!walletAddress) {
      toast.error("Connect your wallet first")
      return
    }
    // --- Validate all description sections ---
    if (!formData.title.trim() || !formData.problem.trim() || !formData.vision.trim() || !formData.features.trim() || !formData.tech.trim() || !formData.targetUsers.trim() || !formData.unique.trim()) {
      toast.error("Please fill out all idea detail sections")
      return
    }
    if (formData.categoryIds.length === 0) {
      toast.error("Select at least one category")
      return
    }

    setSubmitting(true)
    try {
      // 1) Count existing projects by this user to calculate sprouts
      const { data: existingProjects, error: countErr } = await supabase
        .from("projects")
        .select("id")
        .eq("owner_address", walletAddress)
      
      if (countErr) throw countErr
      
      const projectCount = existingProjects?.length || 0
      const sproutsAmount = calculateSproutsForSubmission(projectCount)

      // --- Compile description from sections ---
      const compiledDescription = `## What problem does your idea solve?\n${formData.problem}\n\n## Vision\n${formData.vision}\n\n## Features\n${formData.features}\n\n## Tech\n${formData.tech}\n\n## Who is it for? (target users, impact)\n${formData.targetUsers}\n\n## What makes it unique?\n${formData.unique}`

      // 2) Insert project
      const { data: proj, error: projErr } = await supabase
        .from("projects")
        .insert({
          owner_address: walletAddress,
          title: formData.title,
          description: compiledDescription,
        })
        .select("id")
        .single()
      if (projErr || !proj?.id) throw projErr ?? new Error("No project ID")

      const pid = proj.id

      // 3) Award sprouts for planting the idea
      const plantIdeaTypeId = await getSproutTypeId('plant_idea')
      const { error: sproutsErr } = await supabase
        .from("sprouts")
        .insert({
          user_address: walletAddress,
          sprout_type_id: plantIdeaTypeId,
          amount: sproutsAmount,
          related_id: pid,
        })
      
      if (sproutsErr) {
        logger.error("Failed to award sprouts:", sproutsErr)
        // Don't throw here - we still want the project to be created
      }

      // 4) Link categories
      await Promise.all(
        formData.categoryIds.map((cid) =>
          supabase.from("project_categories").insert({ project_id: pid, category_id: cid })
        )
      )

      // 5) Link tech stacks
      await Promise.all(
        formData.techStackIds.map((tid) =>
          supabase.from("project_tech_stacks").insert({ project_id: pid, tech_stack_id: tid })
        )
      )

      // 6) Insert related links
      await Promise.all(
        formData.links.map(({ url, label }) =>
          supabase.from("project_links").insert({ project_id: pid, url, label })
        )
      )

      // 7) Insert visuals
      await Promise.all(
        formData.visuals.map(({ url, alt }) =>
          supabase.from("project_visuals").insert({ project_id: pid, url, alt_text: alt })
        )
      )

      toast.success(`Your idea has been planted! 🌱 +${sproutsAmount} sprouts earned!`)
      router.push("/") // back to garden
    } catch (e) {
      logger.error(e)
      toast.error("Failed to submit idea")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      <SeasonalBackground season={gardenTheme} />
      <FloatingGardenElements />
      
      {/* Header */}
      <header className={`border-b border-emerald-200/50 ${getThemeHeaderGradient()} backdrop-blur-sm sticky top-0 z-50`}>
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4">
              <Link href="/">
                <Button variant="ghost" size={isMobile ? "sm" : "sm"} className="text-emerald-700 hover:bg-emerald-50">
                  <ArrowLeft className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  {isMobile ? "Back" : "Back to Garden"}
                </Button>
              </Link>
              <div className="flex items-center gap-2 md:gap-3">
                <img src="/Logo-bloomideas.png" alt="Bloom Ideas Logo" className="w-8 h-8 rounded-full shadow" />
                <span className="font-semibold text-emerald-800 text-sm md:text-base">Plant New Idea</span>
              </div>
            </div>
            <UniversalWalletConnection onConnectionChange={handleWalletConnectionChange} />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 md:py-8 max-w-4xl relative z-10">
        {/* Hero */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-100 to-teal-100 px-3 md:px-4 py-2 rounded-full mb-3 md:mb-4">
            <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-emerald-600" />
            <span className="text-sm md:text-base text-emerald-700 font-medium">Plant Your Vision</span>
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-3 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent">
            Share Your Blooming Idea
          </h1>
          <p className="text-sm md:text-base text-emerald-700/80 max-w-2xl mx-auto px-4">
            Every great innovation starts as a seed. Plant your idea in our garden and watch the community help it grow.
          </p>
          <div className="max-w-md mx-auto mt-4 md:mt-6">
            <GardenWeather />
          </div>
        </div>

        {/* Form */}
        <Card className="border-emerald-100 bg-white/80 backdrop-blur-sm">
          <div className="h-2 bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400"></div>
          <CardHeader className="pb-4 md:pb-6">
            <h2 className="text-lg md:text-xl font-semibold text-emerald-900">Idea Details</h2>
            <p className="text-sm md:text-base text-emerald-700/70">Fill in the details to help your idea flourish</p>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-6">
            {/* Title */}
            <div>
              <Label htmlFor="title" className="text-emerald-800 font-medium text-sm md:text-base">
                Project Title *
              </Label>
              <Input
                id="title"
                placeholder="Give your idea a memorable name..."
                value={formData.title}
                onChange={(e) => setFormData((f) => ({ ...f, title: e.target.value }))}
                className="border-emerald-200 focus:border-emerald-400 mt-1 md:mt-2"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-emerald-800 font-medium text-sm md:text-base">
                Idea Details *
              </Label>
              <Tabs defaultValue="edit" className="w-full mt-2">
                <TabsList className="bg-emerald-50 mb-2">
                  <TabsTrigger value="edit" className="text-xs md:text-sm">Edit</TabsTrigger>
                  <TabsTrigger value="preview" className="text-xs md:text-sm">Preview</TabsTrigger>
                </TabsList>
                <TabsContent value="edit">
                  <div className="space-y-4">
                    {/* Problem */}
                    <div>
                      <Label className="text-emerald-700 font-medium">What problem does your idea solve?</Label>
                      <Textarea
                        placeholder="Describe the core problem your idea addresses..."
                        value={formData.problem}
                        onChange={e => setFormData(f => ({ ...f, problem: e.target.value }))}
                        className="border-emerald-200 focus:border-emerald-400 font-mono min-h-[60px] text-sm md:text-base mt-1"
                        rows={3}
                      />
                      <div className="text-xs text-emerald-600 mt-1">E.g. What pain point or gap are you solving?</div>
                    </div>
                    {/* Vision */}
                    <div>
                      <Label className="text-emerald-700 font-medium">Vision</Label>
                      <Textarea
                        placeholder="Share your vision for this idea..."
                        value={formData.vision}
                        onChange={e => setFormData(f => ({ ...f, vision: e.target.value }))}
                        className="border-emerald-200 focus:border-emerald-400 font-mono min-h-[60px] text-sm md:text-base mt-1"
                        rows={3}
                      />
                      <div className="text-xs text-emerald-600 mt-1">E.g. What is your long-term goal or dream for this idea?</div>
                    </div>
                    {/* Features */}
                    <div>
                      <Label className="text-emerald-700 font-medium">Features</Label>
                      <Textarea
                        placeholder="List the main features..."
                        value={formData.features}
                        onChange={e => setFormData(f => ({ ...f, features: e.target.value }))}
                        className="border-emerald-200 focus:border-emerald-400 font-mono min-h-[60px] text-sm md:text-base mt-1"
                        rows={3}
                      />
                      <div className="text-xs text-emerald-600 mt-1">E.g. What are the key functionalities?</div>
                    </div>
                    {/* Tech */}
                    <div>
                      <Label className="text-emerald-700 font-medium">Tech</Label>
                      <Textarea
                        placeholder="Describe the technology or stack..."
                        value={formData.tech}
                        onChange={e => setFormData(f => ({ ...f, tech: e.target.value }))}
                        className="border-emerald-200 focus:border-emerald-400 font-mono min-h-[60px] text-sm md:text-base mt-1"
                        rows={3}
                      />
                      <div className="text-xs text-emerald-600 mt-1">E.g. What tech/tools will you use?</div>
                    </div>
                    {/* Target Users */}
                    <div>
                      <Label className="text-emerald-700 font-medium">Who is it for? (Target users, impact)</Label>
                      <Textarea
                        placeholder="Describe your target users and the impact..."
                        value={formData.targetUsers}
                        onChange={e => setFormData(f => ({ ...f, targetUsers: e.target.value }))}
                        className="border-emerald-200 focus:border-emerald-400 font-mono min-h-[60px] text-sm md:text-base mt-1"
                        rows={3}
                      />
                      <div className="text-xs text-emerald-600 mt-1">E.g. Who benefits? What is the impact?</div>
                    </div>
                    {/* Unique */}
                    <div>
                      <Label className="text-emerald-700 font-medium">What makes it unique?</Label>
                      <Textarea
                        placeholder="Explain what sets your idea apart..."
                        value={formData.unique}
                        onChange={e => setFormData(f => ({ ...f, unique: e.target.value }))}
                        className="border-emerald-200 focus:border-emerald-400 font-mono min-h-[60px] text-sm md:text-base mt-1"
                        rows={3}
                      />
                      <div className="text-xs text-emerald-600 mt-1">E.g. Why is this idea different or special?</div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="preview">
                  <div className="prose prose-emerald max-w-none bg-emerald-50/50 p-3 md:p-4 rounded-md border border-emerald-100 min-h-[120px] text-sm md:text-base">
                    {(
                      formData.problem.trim() ||
                      formData.vision.trim() ||
                      formData.features.trim() ||
                      formData.tech.trim() ||
                      formData.targetUsers.trim() ||
                      formData.unique.trim()
                    ) ? (
                      <ReactMarkdown>{`
## What problem does your idea solve?\n${formData.problem}\n\n## Vision\n${formData.vision}\n\n## Features\n${formData.features}\n\n## Tech\n${formData.tech}\n\n## Who is it for? (target users, impact)\n${formData.targetUsers}\n\n## What makes it unique?\n${formData.unique}
                      `}</ReactMarkdown>
                    ) : (
                      <span className="text-emerald-400">Nothing to preview yet. Start filling out the sections above!</span>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Categories */}
            <div>
              <Label className="text-emerald-800 font-medium text-sm md:text-base">Categories *</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {categories.map((cat) => (
                  <label
                    key={cat.id}
                    className={`flex items-center space-x-2 p-2 md:p-3 rounded-lg border ${
                      formData.categoryIds.includes(cat.id)
                        ? "bg-emerald-100 border-emerald-300"
                        : "border-emerald-200"
                    } cursor-pointer hover:bg-emerald-50 transition-colors`}
                  >
                    <Checkbox
                      checked={formData.categoryIds.includes(cat.id)}
                      onCheckedChange={() => toggleCategory(cat.id)}
                    />
                    <span className="text-emerald-700 text-sm md:text-base">{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Tech Stack */}
            <div>
              <Label className="text-emerald-800 font-medium text-sm md:text-base">Tech Stack</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {techStacks.map((tech) => (
                  <label
                    key={tech.id}
                    className={`flex items-center space-x-2 p-2 md:p-3 rounded-lg border ${
                      formData.techStackIds.includes(tech.id)
                        ? "bg-emerald-100 border-emerald-300"
                        : "border-emerald-200"
                    } cursor-pointer hover:bg-emerald-50 transition-colors`}
                  >
                    <Checkbox
                      checked={formData.techStackIds.includes(tech.id)}
                      onCheckedChange={() => toggleTechStack(tech.id)}
                    />
                    <span className="text-emerald-700 text-sm md:text-base">{tech.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Related Links */}
            <div>
              <Label className="text-emerald-800 font-medium text-sm md:text-base">Related Links</Label>
              <div className="space-y-2 mt-2">
                {formData.links.map((lnk, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row gap-2">
                    <Input
                      placeholder="URL"
                      value={lnk.url}
                      onChange={(e) => updateLink(idx, "url", e.target.value)}
                      className="flex-1 border-emerald-200"
                    />
                    <Input
                      placeholder="Label (optional)"
                      value={lnk.label}
                      onChange={(e) => updateLink(idx, "label", e.target.value)}
                      className="flex-1 border-emerald-200"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLink(idx)}
                      className="text-red-500 self-end"
                    >
                      &times;
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addLink} className="text-xs md:text-sm">
                  <LinkIcon className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" /> Add Link
                </Button>
              </div>
            </div>

            {/* Mockups & Visuals */}
            <div>
              <Label className="text-emerald-800 font-medium text-sm md:text-base">Mockups & Visuals</Label>
              <div className="space-y-2 mt-2">
                {formData.visuals.map((v, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row gap-2">
                    <Input
                      placeholder="Image URL"
                      value={v.url}
                      onChange={(e) => updateVisual(idx, "url", e.target.value)}
                      className="flex-1 border-emerald-200"
                    />
                    <Input
                      placeholder="Alt text"
                      value={v.alt}
                      onChange={(e) => updateVisual(idx, "alt", e.target.value)}
                      className="flex-1 border-emerald-200"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeVisual(idx)}
                      className="text-red-500 self-end"
                    >
                      &times;
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addVisual} className="text-xs md:text-sm">
                  <Upload className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" /> Add Visual
                </Button>
              </div>
            </div>

            {/* Submit */}
            <div className="flex flex-col gap-3 md:gap-4 pt-4 md:pt-6">
              <Button
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm md:text-base py-2 md:py-3"
                disabled={submitting}
              >
                <Sparkles className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                {submitting ? "Planting..." : "Plant Idea in Garden"}
              </Button>
              <Button variant="outline" className="border-emerald-200 text-emerald-700 text-sm md:text-base">
                Save Draft
              </Button>
            </div>

            <p className="text-xs md:text-sm text-emerald-600/70 text-center mt-3 md:mt-4">
              Your idea will be reviewed by our garden keepers before blooming publicly
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
