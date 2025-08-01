"use client"

import React, { useState, useEffect } from 'react'
import { useGardenTheme } from '@/components/garden-theme-context'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sprout, TreePine, Flower, Archive, CloudRain, TrendingUp, Search, Sparkles } from "lucide-react"
import Link from "next/link"

// Define glossary terms
const glossary = [
  {
    term: "Plant Idea",
    icon: <Sprout className="w-8 h-8 text-green-600" />,    
    definition: "The initial stage when you submit and 'plant' your idea in the garden.",
    color: "from-green-400 to-emerald-500",
    bgColor: "bg-green-50",
    borderColor: "border-green-200"
  },
  {
    term: "Garden",
    icon: <TreePine className="w-8 h-8 text-green-600" />,    
    definition: "The community space where ideas grow, get nurtured, and eventually bloom.",
    color: "from-emerald-400 to-teal-500",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200"
  },
  {
    term: "Sprout",
    icon: <CloudRain className="w-8 h-8 text-blue-600" />,    
    definition: "The stage when an idea has received care actions and is actively 'growing'.",
    color: "from-blue-400 to-cyan-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200"
  },
  {
    term: "Bloom",
    icon: <Flower className="w-8 h-8 text-pink-600" />,    
    definition: "The final stage of an idea, signifying it has reached maturity and is ready for showcase.",
    color: "from-pink-400 to-rose-500",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200"
  },
  {
    term: "Care Action",
    icon: <Archive className="w-8 h-8 text-amber-600" />,    
    definition: "Actions like comments, tips, or endorsements that help nurture an idea.",
    color: "from-amber-400 to-orange-500",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200"
  },
  {
    term: "Garden Weather",
    icon: <CloudRain className="w-8 h-8 text-teal-600" />,    
    definition: "The dynamic conditions (Rain, Sun, Bloom Bonus) that affect idea growth rates.",
    color: "from-teal-400 to-cyan-500",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-200"
  },
  {
    term: "Bloom Score",
    icon: <TrendingUp className="w-8 h-8 text-emerald-600" />,    
    definition: "A quantitative metric that measures community engagement and traction for an idea.",
    color: "from-emerald-400 to-green-500",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200"
  }
]

export default function GlossaryPage() {
  const { gardenTheme } = useGardenTheme()
  const [search, setSearch] = useState("")
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const filtered = glossary.filter(({ term, definition }) =>
    term.toLowerCase().includes(search.toLowerCase()) ||
    definition.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 via-teal-500/20 to-cyan-600/20 animate-pulse" />
        <div className="absolute top-0 left-0 w-full h-full opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          >
            <div className={`w-2 h-2 rounded-full bg-white/20 animate-pulse`} />
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 py-12 px-6">
        <header className="mb-16 text-center">
          <div className={`transform transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Sprout className="w-8 h-8 text-white animate-bounce" />
              </div>
              <h1 className="text-6xl font-black text-white drop-shadow-2xl bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent">
                Garden Glossary
              </h1>
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Flower className="w-8 h-8 text-white animate-pulse" />
              </div>
            </div>
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Your field guide to every seed, sprout, and bloom in our digital garden.
            </p>
          </div>

          {/* Search bar */}
          <div className={`mt-12 max-w-lg mx-auto transform transition-all duration-1000 delay-300 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 group-focus-within:text-white transition-colors" />
              <input
                type="text"
                placeholder="Search the garden..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-6 py-4 rounded-2xl border-0 bg-white/20 backdrop-blur-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/30 transition-all duration-300"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Glossary cards */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto transform transition-all duration-1000 delay-500 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          {filtered.map(({ term, icon, definition, color, bgColor, borderColor }, index) => (
            <div
              key={term}
              className={`group cursor-pointer transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 ${selectedTerm === term ? 'scale-105 -translate-y-2' : ''}`}
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => setSelectedTerm(selectedTerm === term ? null : term)}
            >
              <Card className={`relative overflow-hidden border-0 shadow-2xl ${bgColor} backdrop-blur-md hover:shadow-3xl transition-all duration-500`}>
                {/* Gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                
                {/* Animated border */}
                <div className={`absolute inset-0 rounded-2xl border-2 ${borderColor} group-hover:border-4 transition-all duration-500`} />
                
                <CardContent className="relative p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {icon}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 group-hover:text-gray-900 transition-colors">
                        {term}
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        <Sparkles className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm text-gray-600">Garden Term</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed group-hover:text-gray-800 transition-colors">
                    {definition}
                  </p>
                  
                  {/* Hover effect indicator */}
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
          
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Search className="w-12 h-12 text-white/60" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-2">No terms found</h3>
              <p className="text-white/80">Try searching with different keywords</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className={`mt-20 text-center transform transition-all duration-1000 delay-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <Link 
            href="/" 
            className="inline-flex items-center gap-3 px-8 py-4 bg-white/20 backdrop-blur-md rounded-2xl text-white hover:bg-white/30 transition-all duration-300 hover:scale-105 border border-white/30"
          >
            <Sprout className="w-5 h-5 animate-pulse" />
            <span className="font-semibold">Back to Garden</span>
            <div className="w-2 h-2 bg-white rounded-full animate-ping" />
          </Link>
        </footer>
      </div>


    </div>
  )
}
