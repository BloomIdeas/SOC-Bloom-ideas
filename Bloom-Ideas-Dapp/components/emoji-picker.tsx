"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Search, Smile } from "lucide-react"

const popularEmojis = [
  "🌱", "🌸", "🌺", "🌻", "🌹", "🌷", "🌼", "🌿", "🍀", "🌳", "🌲", "🌴",
  "🌵", "🌾", "🌽", "🌻", "🌼", "🌷", "🌹", "🌺", "🌸", "🌼", "🌻", "🌺",
  "🐝", "🦋", "🐛", "🐌", "🐞", "🦗", "🕷️", "🕸️", "🦂", "🦟", "🦠", "🐜",
  "🌞", "🌝", "🌛", "🌜", "🌚", "🌕", "🌖", "🌗", "🌘", "🌑", "🌒", "🌓",
  "⭐", "🌟", "✨", "⚡", "💫", "🌈", "☀️", "🌤️", "⛅", "🌥️", "☁️", "🌦️",
  "🎨", "🎭", "🎪", "🎟️", "🎫", "🎬", "🎤", "🎧", "🎼", "🎹", "🥁", "🎷",
  "🚀", "💎", "🔮", "🎯", "🎲", "🎮", "🎸", "🎺", "🎻", "🎹", "🎼", "🎤",
  "🏆", "🥇", "🥈", "🥉", "🎖️", "🏅", "🎗️", "🏵️", "🎀", "🎁", "🎂", "🎄"
]

const emojiCategories = {
  "Nature": ["🌱", "🌸", "🌺", "🌻", "🌹", "🌷", "🌼", "🌿", "🍀", "🌳", "🌲", "🌴", "🌵", "🌾", "🌽"],
  "Animals": ["🐝", "🦋", "🐛", "🐌", "🐞", "🦗", "🕷️", "🕸️", "🦂", "🦟", "🦠", "🐜"],
  "Space": ["🌞", "🌝", "🌛", "🌜", "🌚", "🌕", "🌖", "🌗", "🌘", "🌑", "🌒", "🌓", "⭐", "🌟", "✨"],
  "Weather": ["⚡", "💫", "🌈", "☀️", "🌤️", "⛅", "🌥️", "☁️", "🌦️"],
  "Arts": ["🎨", "🎭", "🎪", "🎟️", "🎫", "🎬", "🎤", "🎧", "🎼", "🎹", "🥁", "🎷"],
  "Tech": ["🚀", "💎", "🔮", "🎯", "🎲", "🎮", "🎸", "🎺", "🎻", "🎹", "🎼", "🎤"],
  "Achievement": ["🏆", "🥇", "🥈", "🥉", "🎖️", "🏅", "🎗️", "🏵️", "🎀", "🎁", "🎂", "🎄"]
}

interface EmojiPickerProps {
  selectedEmoji: string
  onEmojiSelect: (emoji: string) => void
  trigger?: React.ReactNode
}

export default function EmojiPicker({ selectedEmoji, onEmojiSelect, trigger }: EmojiPickerProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Nature")

  const filteredEmojis = searchQuery
    ? popularEmojis.filter(emoji => 
        emojiCategories[selectedCategory as keyof typeof emojiCategories]?.includes(emoji) ||
        popularEmojis.includes(emoji)
      ).filter(emoji => emoji.includes(searchQuery))
    : emojiCategories[selectedCategory as keyof typeof emojiCategories] || popularEmojis

  const defaultTrigger = (
    <Button variant="outline" className="w-12 h-12 text-2xl p-0 border-emerald-200 hover:bg-emerald-50">
      {selectedEmoji || "🌱"}
    </Button>
  )

  return (
    <Popover>
      <PopoverTrigger asChild>
        {trigger || defaultTrigger}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <Card className="border-emerald-100">
          <CardContent className="p-4">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-400 w-4 h-4" />
              <Input
                placeholder="Search emojis..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-emerald-200 focus:border-emerald-400"
              />
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-1 mb-4">
              {Object.keys(emojiCategories).map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={`text-xs ${
                    selectedCategory === category
                      ? "bg-emerald-500 text-white"
                      : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  }`}
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Emoji Grid */}
            <div className="grid grid-cols-8 gap-2 max-h-60 overflow-y-auto">
              {filteredEmojis.map((emoji, index) => (
                <Button
                  key={`${emoji}-${index}`}
                  variant="ghost"
                  size="sm"
                  onClick={() => onEmojiSelect(emoji)}
                  className="w-8 h-8 p-0 text-lg hover:bg-emerald-100 border border-transparent hover:border-emerald-200"
                >
                  {emoji}
                </Button>
              ))}
            </div>

            {/* Popular Emojis */}
            {!searchQuery && (
              <div className="mt-4 pt-4 border-t border-emerald-100">
                <p className="text-sm font-medium text-emerald-700 mb-2">Popular</p>
                <div className="grid grid-cols-8 gap-2">
                  {popularEmojis.slice(0, 16).map((emoji, index) => (
                    <Button
                      key={`popular-${emoji}-${index}`}
                      variant="ghost"
                      size="sm"
                      onClick={() => onEmojiSelect(emoji)}
                      className="w-8 h-8 p-0 text-lg hover:bg-emerald-100 border border-transparent hover:border-emerald-200"
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  )
} 