// lib/types.ts

// Remove SproutType and Sprout interfaces related to the old enum system.
// Only keep types for User, Project, Category, TechStack, etc.

export interface User {
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

export interface Project {
  id: number
  owner_address: string
  title: string
  description: string
  stage: "planted" | "growing" | "bloomed"
  created_at: string
  updated_at: string
}

export interface Category {
  id: number
  name: string
}

export interface TechStack {
  id: number
  name: string
} 