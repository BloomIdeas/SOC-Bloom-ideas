"use client"

import { useState, useEffect } from "react"
import { Flower2, Leaf, Sparkles } from "lucide-react"

// Floating Garden Elements
export function FloatingGardenElements() {
  const [elements, setElements] = useState<Array<{ id: number; x: number; y: number; type: string }>>([])
  const [showCustomCursor, setShowCustomCursor] = useState(false)
  const [cursorElement, setCursorElement] = useState<string>("flower")

  useEffect(() => {
    const generateElements = () => {
      const newElements = Array.from({ length: 48 }, (_, i) => ({ // Increased from 8 to 48 (6x more)
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        type: ["flower", "leaf", "sparkle"][Math.floor(Math.random() * 3)],
      }))
      setElements(newElements)
    }

    generateElements()
    const interval = setInterval(generateElements, 10000) // Regenerate every 10 seconds

    return () => clearInterval(interval)
  }, [])

  // Change cursor element every 3 seconds when custom cursor is active
  useEffect(() => {
    if (!showCustomCursor) return

    const cursorInterval = setInterval(() => {
      const types = ["flower", "leaf", "sparkle"]
      setCursorElement(types[Math.floor(Math.random() * types.length)])
    }, 5000)

    return () => clearInterval(cursorInterval)
  }, [showCustomCursor])

  // Handle mouse movement for custom cursor when active
  useEffect(() => {
    if (!showCustomCursor) return

    const handleMouseMove = (e: MouseEvent) => {
      const cursor = document.querySelector('.custom-cursor') as HTMLElement
      if (cursor) {
        cursor.style.left = e.clientX + 'px'
        cursor.style.top = e.clientY + 'px'
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [showCustomCursor])

  // Handle double click to spawn new elements
  useEffect(() => {
    const handleDoubleClick = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100
      const y = (e.clientY / window.innerHeight) * 100
      
      const newElement = {
        id: Date.now() + Math.random(),
        x,
        y,
        type: ["flower", "leaf", "sparkle"][Math.floor(Math.random() * 3)],
      }
      
      setElements(prev => [...prev, newElement])
      
      // Remove the spawned element after 5 seconds
      setTimeout(() => {
        setElements(prev => prev.filter(el => el.id !== newElement.id))
      }, 5000)
    }

    document.addEventListener('dblclick', handleDoubleClick)
    return () => document.removeEventListener('dblclick', handleDoubleClick)
  }, [])

  // Function to activate custom cursor for 30 seconds
  const activateCustomCursor = () => {
    setShowCustomCursor(true)
    setTimeout(() => {
      setShowCustomCursor(false)
    }, 10000) // 30 seconds
  }

  // Expose the function globally for the footer button
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).activateGardenCursor = activateCustomCursor
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).activateGardenCursor
      }
    }
  }, [])

  const getIcon = (type: string) => {
    switch (type) {
      case "flower":
        return <Flower2 className="w-4 h-4 text-pink-400" />
      case "leaf":
        return <Leaf className="w-4 h-4 text-green-400" />
      case "sparkle":
        return <Sparkles className="w-4 h-4 text-yellow-400" />
      default:
        return <Flower2 className="w-4 h-4 text-pink-400" />
    }
  }

  const getCursorIcon = (type: string) => {
    switch (type) {
      case "flower":
        return "🌸"
      case "leaf":
        return "🍃"
      case "sparkle":
        return "✨"
      default:
        return "🌸"
    }
  }

  return (
    <>
      {/* Custom cursor styles - only when active */}
      {showCustomCursor && (
        <style jsx global>{`
          body {
            cursor: none;
          }
          * {
            cursor: none !important;
          }
          .custom-cursor {
            position: fixed;
            pointer-events: none;
            z-index: 9999;
            font-size: 20px;
            transform: translate(-50%, -50%);
            transition: all 0.1s ease;
            text-shadow: 0 0 10px rgba(0,0,0,0.3);
          }
        `}</style>
      )}
      
      {/* Custom cursor element - only when active */}
      {showCustomCursor && (
        <div 
          className="custom-cursor"
          style={{
            left: '0px',
            top: '0px',
          }}
        >
          {getCursorIcon(cursorElement)}
        </div>
      )}

      {/* Floating elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {elements.map((element) => (
          <div
            key={element.id}
            className="absolute animate-float opacity-20"
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
              animationDelay: `${element.id * 0.5}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          >
            {getIcon(element.type)}
          </div>
        ))}
      </div>
    </>
  )
}

// Garden Loading Animation
export function GardenLoader() {
  return (
    <div className="flex items-center justify-center space-x-2">
      <div className="animate-bounce">🌱</div>
      <div className="animate-bounce" style={{ animationDelay: "0.1s" }}>
        🌿
      </div>
      <div className="animate-bounce" style={{ animationDelay: "0.2s" }}>
        🌸
      </div>
      <span className="ml-2 text-emerald-600 font-medium">Growing your garden...</span>
    </div>
  )
}

// Seasonal Garden Background
export function SeasonalBackground({ season = "spring" }: { season?: string }) {
  const getSeasonalGradient = (season: string) => {
    switch (season) {
      case "spring":
        return "from-emerald-50 via-green-50 to-teal-50"
      case "summer":
        return "from-yellow-50 via-orange-50 to-red-50"
      case "autumn":
        return "from-orange-50 via-red-50 to-purple-50"
      case "winter":
        return "from-blue-50 via-indigo-50 to-purple-50"
      default:
        return "from-emerald-50 via-green-50 to-teal-50"
    }
  }

  return (
    <div className={`fixed inset-0 bg-gradient-to-br ${getSeasonalGradient(season)} -z-10`}>
      <div className="absolute inset-0 bg-white/20"></div>
    </div>
  )
}

// Garden Success Animation
export function GardenSuccessAnimation({ message, onComplete }: { message: string; onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3000)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-50">
      <div className="bg-white rounded-2xl p-8 text-center shadow-2xl border-4 border-emerald-200">
        <div className="text-6xl mb-4 animate-bounce">🌸</div>
        <h3 className="text-2xl font-bold text-emerald-900 mb-2">Garden Bloomed!</h3>
        <p className="text-emerald-700">{message}</p>
        <div className="flex justify-center space-x-2 mt-4">
          <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
          <Flower2 className="w-5 h-5 text-pink-500 animate-pulse" />
          <Leaf className="w-5 h-5 text-green-500 animate-pulse" />
        </div>
      </div>
    </div>
  )
}

// Garden Weather Widget
export function GardenWeather() {
  const [weather, setWeather] = useState({
    condition: "Sunny",
    bonus: "+20% Bloom Bonus",
    icon: "🌤️",
    description: "Perfect for planting new ideas!",
  })

  const weatherConditions = [
    { condition: "Sunny", bonus: "+20% Bloom Bonus", icon: "🌤️", description: "Perfect for planting new ideas!" },
    {
      condition: "Rainy",
      bonus: "+15% Growth Speed",
      icon: "🌧️",
      description: "Great for nurturing existing projects!",
    },
    { condition: "Cloudy", bonus: "+10% Focus Boost", icon: "☁️", description: "Ideal for deep thinking and planning!" },
    { condition: "Windy", bonus: "+25% Collaboration", icon: "💨", description: "Perfect for spreading ideas around!" },
  ]

  useEffect(() => {
    const changeWeather = () => {
      const randomWeather = weatherConditions[Math.floor(Math.random() * weatherConditions.length)]
      setWeather(randomWeather)
    }

    const interval = setInterval(changeWeather, 30000) // Change every 30 seconds
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-3 border border-emerald-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-800">{weather.icon} Garden Weather</p>
          <p className="text-xs text-emerald-600/70">{weather.description}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-emerald-900">{weather.condition}</p>
          <p className="text-xs text-emerald-600/70">{weather.bonus}</p>
        </div>
      </div>
    </div>
  )
}
