// lib/sprouts.ts
import { supabase } from "./supabaseClient"

// In-memory cache for sprout type IDs
const sproutTypeIdCache: Record<string, number> = {}

export async function getSproutTypeId(typeName: string): Promise<number> {
  if (sproutTypeIdCache[typeName]) return sproutTypeIdCache[typeName]
  const { data, error } = await supabase
    .from("sprout_types")
    .select("id")
    .eq("name", typeName)
    .single()
  if (error || !data) throw new Error(`Sprout type '${typeName}' not found`)
  sproutTypeIdCache[typeName] = data.id
  return data.id
}

export async function getUserTotalSprouts(userAddress: string): Promise<number> {
  // Use the materialized view for efficiency
  const { data, error } = await supabase
    .from("user_sprout_totals")
    .select("total_sprouts")
    .eq("user", userAddress) // <-- FIXED COLUMN NAME
    .single()
  if (error || !data) return 0
  return data.total_sprouts || 0
}

export async function getUserSproutsByType(userAddress: string): Promise<Record<string, number>> {
  // Use the materialized view for efficiency
  const { data, error } = await supabase
    .from("user_sprout_totals")
    .select("nurtures, neglects, planted_ideas, comments, build_requests, invites")
    .eq("user", userAddress) // <-- FIXED COLUMN NAME
    .single()
  if (error || !data) return {}
  return {
    nurture: data.nurtures || 0,
    neglect: data.neglects || 0,
    plant_idea: data.planted_ideas || 0,
    comment: data.comments || 0,
    build_request: data.build_requests || 0,
    invite: data.invites || 0,
  }
}

export function calculateSproutsForSubmission(projectCount: number): number {
  return 50 + (projectCount * 10) // 50 for first, +10 for each additional
}

export function getReputationLevel(sprouts: number): {
  name: string
  level: number
  color: string
  sproutsNeeded: number
} {
  const levels = [
    { name: "Seed", level: 1, color: "bg-yellow-400", sproutsNeeded: 0 },
    { name: "Sprout", level: 2, color: "bg-green-400", sproutsNeeded: 50 },
    { name: "Bloom", level: 3, color: "bg-emerald-400", sproutsNeeded: 150 },
    { name: "Grove-Keeper", level: 4, color: "bg-teal-400", sproutsNeeded: 300 },
    { name: "Garden Master", level: 5, color: "bg-purple-400", sproutsNeeded: 500 },
  ]
  for (let i = levels.length - 1; i >= 0; i--) {
    if (sprouts >= levels[i].sproutsNeeded) {
      return levels[i]
    }
  }
  return levels[0]
} 