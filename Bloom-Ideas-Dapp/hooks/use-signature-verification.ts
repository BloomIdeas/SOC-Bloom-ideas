import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'

// Helper functions for localStorage
const getStoredSignature = (address: string): string | null => {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem(`garden_signature_${address.toLowerCase()}`)
  return stored ? JSON.parse(stored) : null
}

const setStoredSignature = (address: string, signature: string) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(`garden_signature_${address.toLowerCase()}`, JSON.stringify(signature))
}

const clearStoredSignature = (address: string) => {
  if (typeof window === 'undefined') return
  localStorage.removeItem(`garden_signature_${address.toLowerCase()}`)
}

export function useSignatureVerification() {
  const { address, isConnected } = useAccount()
  const [hasVerifiedSignature, setHasVerifiedSignature] = useState(false)
  const [signature, setSignature] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isConnected && address) {
      const existingSignature = getStoredSignature(address)
      if (existingSignature) {
        setHasVerifiedSignature(true)
        setSignature(existingSignature)
      } else {
        setHasVerifiedSignature(false)
        setSignature(null)
      }
    } else {
      setHasVerifiedSignature(false)
      setSignature(null)
    }
    setIsLoading(false)
  }, [isConnected, address])

  const verifySignature = (newSignature: string) => {
    if (address) {
      setStoredSignature(address, newSignature)
      setHasVerifiedSignature(true)
      setSignature(newSignature)
    }
  }

  const clearSignature = () => {
    if (address) {
      clearStoredSignature(address)
      setHasVerifiedSignature(false)
      setSignature(null)
    }
  }

  return {
    hasVerifiedSignature,
    signature,
    isLoading,
    verifySignature,
    clearSignature,
    isConnected,
    address,
  }
} 