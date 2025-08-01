// hooks/use-sprouts.ts
import { useState, useEffect } from "react"
import { getUserTotalSprouts, getUserSproutsByType } from "@/lib/sprouts"
import { logger } from "@/lib/logger";

export function useSprouts(userAddress: string | null) {
  const [totalSprouts, setTotalSprouts] = useState<number>(0)
  const [sproutsByType, setSproutsByType] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const refreshSprouts = async () => {
    if (!userAddress) {
      setTotalSprouts(0)
      setSproutsByType({})
      return
    }

    setLoading(true)
    setError(null)

    try {
      const [total, byType] = await Promise.all([
        getUserTotalSprouts(userAddress),
        getUserSproutsByType(userAddress)
      ])
      
      setTotalSprouts(total)
      setSproutsByType(byType)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch sprouts")
      logger.error("Error fetching sprouts:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshSprouts()
  }, [userAddress])

  return {
    totalSprouts,
    sproutsByType,
    loading,
    error,
    refreshSprouts
  }
} 