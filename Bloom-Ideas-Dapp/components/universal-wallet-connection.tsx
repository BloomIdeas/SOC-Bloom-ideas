"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, ExternalLink, LogOut, User, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { useAccount, useBalance, useChainId, useDisconnect, useEnsName, useEnsAvatar, useSwitchChain } from 'wagmi'
import { getAddress } from 'viem'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { formatUnits } from 'viem'
import { mainnet, sepolia, polygon } from 'viem/chains'
import MessageSigningModal from './message-signing-modal'
import NetworkAdditionModal from './network-addition-modal'
import { useSignatureVerification } from '@/hooks/use-signature-verification'
import { supabase } from '@/lib/supabaseClient'
import { useIsMobile } from '@/hooks/use-mobile'
import { useSprouts } from "@/hooks/use-sprouts"
import { JsonRpcProvider } from 'ethers/providers'

// Etherlink Testnet chain definition (matching the one in wagmi.ts)
const etherlinkTestnet = {
  id: 128123,
  name: 'Etherlink Testnet',
  nativeCurrency: {
    name: 'XTZ',
    symbol: 'XTZ',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.ankr.com/etherlink_testnet'],
    },
    public: {
      http: ['https://rpc.ankr.com/etherlink_testnet'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Etherlink Testnet Explorer',
      url: 'https://testnet-explorer.etherlink.com',
    },
  },
  testnet: true,
} as const

interface UniversalWalletConnectionProps {
  onConnectionChange?: (isConnected: boolean, address?: string) => void
}

export default function UniversalWalletConnection({
  onConnectionChange,
}: UniversalWalletConnectionProps) {
  const [isMounted, setIsMounted] = useState(false)
  const { address, isConnected } = useAccount()
  const {
    hasVerifiedSignature,
    signature,
    isLoading: signatureLoading,
    verifySignature,
    clearSignature,
  } = useSignatureVerification()
  const checksummedAddress = address ? getAddress(address) : undefined
  const ensNameResult = useEnsName({ address: checksummedAddress, chainId: 1 })
  const ensName = hasVerifiedSignature ? (ensNameResult.data ?? undefined) : undefined
  const ensAvatarResult = useEnsAvatar({ name: ensName, chainId: 1 })
  const ensAvatar = hasVerifiedSignature ? (ensNameResult.data ?? undefined) : undefined
  const chainId = useChainId()
  const { disconnect } = useDisconnect()
  const { openConnectModal } = useConnectModal()
  const { data: balanceData } = useBalance({ address, chainId })
  const { switchChain, isPending: isSwitching } = useSwitchChain()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showSigningModal, setShowSigningModal] = useState(false)
  const [showNetworkModal, setShowNetworkModal] = useState(false)
  const [bloomUsername, setBloomUsername] = useState<string | null>(null)
  const [pfpEmoji, setPfpEmoji] = useState<string | null>(null)
  const [ethersEnsName, setEthersEnsName] = useState<string | null>(null)
  const [ensError, setEnsError] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()

  const { totalSprouts, loading: sproutsLoading } = useSprouts(address ?? null)

  // Check if user is on the correct network (Etherlink Testnet)
  const isOnCorrectNetwork = chainId === etherlinkTestnet.id
  const isOnWrongNetwork = isConnected && !isOnCorrectNetwork

  // Set mounted state
  useEffect(() => { setIsMounted(true) }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])

  // Fetch bloom username and emoji from Supabase
  useEffect(() => {
    async function fetchUserProfile() {
      if (isMounted && isConnected && address && hasVerifiedSignature) {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('bloom_username, pfp_emoji')
            .eq('wallet_address', address)
            .single()
          if (error && error.code !== 'PGRST116') {
            // Ignore not found error
            throw error
          }
          if (data) {
            setBloomUsername(data.bloom_username)
            setPfpEmoji(data.pfp_emoji)
          }
        } catch (err) {
          // Silent fail for profile
        }
      }
    }
    fetchUserProfile()
  }, [isMounted, isConnected, address, hasVerifiedSignature])

  // Ethers.js ENS lookup with error handling
  useEffect(() => {
    const providerUrl = process.env.NEXT_PUBLIC_ALCHEMY_MAINNET_RPC
    if (!providerUrl) {
      setEnsError('ENS lookup unavailable: missing Alchemy RPC URL.')
      setEthersEnsName(null)
      return
    }
    const provider = new JsonRpcProvider(providerUrl)
    async function fetchEns() {
      if (!address) {
        setEthersEnsName(null)
        setEnsError(null)
        return
      }
      try {
        const name = await provider.lookupAddress(address)
        setEthersEnsName(name)
        setEnsError(null)
      } catch (err: any) {
        setEthersEnsName(null)
        setEnsError('Unable to resolve ENS name for this address.')
      }
    }
    fetchEns()
  }, [address])

  // Prompt for signature if needed (only if on correct network)
  useEffect(() => {
    if (
      isMounted &&
      isConnected &&
      address &&
      !signatureLoading &&
      !hasVerifiedSignature &&
      isOnCorrectNetwork
    ) {
      setShowSigningModal(true)
    }
  }, [isMounted, isConnected, address, signatureLoading, hasVerifiedSignature, isOnCorrectNetwork])

  // Propagate connection+auth upward
  useEffect(() => {
    onConnectionChange?.(isConnected && hasVerifiedSignature && isOnCorrectNetwork, address)
  }, [isConnected, hasVerifiedSignature, address, onConnectionChange, isOnCorrectNetwork])

  // Upsert user record in Supabase
  const upsertUserSignature = async (
    wallet: string,
    sig: string
  ): Promise<void> => {
    try {
      const { data: existing, error: selErr } = await supabase
        .from('users')
        .select('signature_count')
        .eq('wallet_address', wallet)
        .single()
      if (selErr && selErr.code !== 'PGRST116') throw selErr
      if (existing) {
        const { error: updErr } = await supabase
          .from('users')
          .update({
            signature: sig,
            signature_count: existing.signature_count + 1,
            updated_at: new Date().toISOString(),
          })
          .eq('wallet_address', wallet)
        if (updErr) throw updErr
      } else {
        const { error: insErr } = await supabase
          .from('users')
          .insert({
            wallet_address: wallet,
            signature: sig,
            signature_count: 1,
          })
        if (insErr) throw insErr
      }
      toast.success('Wallet authenticated')
    } catch (err) {
      toast.error('Failed to record login')
    }
  }

  const handleSignSuccess = (sig: string) => {
    if (!address) return
    verifySignature(sig)
    upsertUserSignature(address, sig)
    setShowSigningModal(false)
  }

  const handleSignReject = () => {
    setShowSigningModal(false)
    clearSignature()
    disconnect()
    toast.error('Signature required to continue')
  }

  const handleDisconnect = () => {
    clearSignature()
    setShowDropdown(false)
    disconnect()
    toast('Disconnected')
  }

  const handleSwitchToEtherlink = async () => {
    try {
      await switchChain({ chainId: etherlinkTestnet.id })
      toast.success('Switched to Etherlink Testnet')
    } catch (error: any) {
      // If switch fails, show network addition modal
      if (error.code === 4902) {
        setShowNetworkModal(true)
      } else {
        toast.error('Failed to switch network. Please add Etherlink Testnet to your wallet.')
        setShowNetworkModal(true)
      }
    }
  }

  const handleNetworkAdded = () => {
    // Try switching again after network is added
    setTimeout(() => {
      handleSwitchToEtherlink()
    }, 1000)
  }

  if (!isMounted) return null

  if (!isConnected) {
    return (
      <Button
        onClick={openConnectModal}
        size={isMobile ? "sm" : "default"}
        className="bg-gradient-to-r from-lime-300 via-lime-400 to-green-400 
                   hover:from-lime-400 hover:to-green-500 text-white font-semibold 
                   shadow-lg px-3 md:px-6 py-2 rounded-lg border-0 focus:ring-2 
                   focus:ring-lime-300 transition-all duration-200 text-xs md:text-sm"
        style={{ background: 'linear-gradient(90deg, #A3E635 0%, #65C32F 100%)' }}
      >
        {isMobile ? "Connect" : "Connect Wallet"}
      </Button>
    )
  }

  // Show network switch prompt if on wrong network
  if (isOnWrongNetwork) {
    return (
      <>
        <Button
          onClick={handleSwitchToEtherlink}
          disabled={isSwitching}
          size={isMobile ? "sm" : "default"}
          className="bg-gradient-to-r from-orange-400 to-red-500 
                     hover:from-orange-500 hover:to-red-600 text-white font-semibold 
                     shadow-lg px-3 md:px-6 py-2 rounded-lg border-0 focus:ring-2 
                     focus:ring-orange-300 transition-all duration-200 text-xs md:text-sm"
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          {isSwitching ? "Switching..." : "Switch to Etherlink Testnet"}
        </Button>
        
        <NetworkAdditionModal
          isOpen={showNetworkModal}
          onClose={() => setShowNetworkModal(false)}
          onNetworkAdded={handleNetworkAdded}
        />
      </>
    )
  }

  if (showSigningModal && address) {
    return (
      <MessageSigningModal
        address={address}
        onSignSuccess={handleSignSuccess}
        onSignReject={handleSignReject}
      />
    )
  }

  const shortAddr = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : ''
  const balance = balanceData
    ? parseFloat(formatUnits(balanceData.value, balanceData.decimals)).toFixed(4)
    : '0.0000'
  const symbol = balanceData?.symbol ?? 'XTZ'
  const chain = chainId
    ? [etherlinkTestnet, mainnet, sepolia, polygon].find((c) => c.id === chainId) ??
      etherlinkTestnet
    : etherlinkTestnet
  const explorerUrl = chain.blockExplorers?.default
    ? `${chain.blockExplorers.default.url}/address/${address}`
    : null

  const copyAddress = async () => {
    try {
      if (address) await navigator.clipboard.writeText(address)
      toast.success('Address copied')
    } catch {
      toast.error('Copy failed')
    }
  }

  // Helper to get a random emoji if pfp_emoji is not set
  function getRandomEmoji() {
    const randomEmojis = ["🌱", "🌸", "🌻", "🌼", "🌷", "🍀", "🪴", "🌺", "🌵", "🍃"];
    return randomEmojis[Math.floor(Math.random() * randomEmojis.length)];
  }

  function AnimatedEmojiAvatar({ emoji, size = 40, animate = false }: { emoji: string, size?: number, animate?: boolean }) {
    return (
      <span
        className={
          `inline-flex items-center justify-center rounded-full bg-emerald-100 shadow-md ` +
          (animate ? 'animate-bounce' : '')
        }
        style={{ fontSize: size, width: size, height: size }}
      >
        {emoji}
      </span>
    )
  }

  function EnsAvatar({ src, size = 40 }: { src: string, size?: number }) {
    return (
      <img
        src={src}
        alt="ENS Avatar"
        style={{ width: size, height: size, borderRadius: '9999px', background: '#f0fdf4' }}
        className="shadow-md"
      />
    )
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size={isMobile ? "sm" : "default"}
        onClick={() => setShowDropdown((v) => !v)}
        className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-white/80 backdrop-blur-sm px-2 md:px-4 py-1 md:py-2 flex items-center gap-2 md:gap-3 text-xs md:text-sm min-h-[44px]"
      >
        {ensAvatar ? (
          <EnsAvatar src={ensAvatar} size={isMobile ? 28 : 32} />
        ) : (
          <AnimatedEmojiAvatar emoji={pfpEmoji || getRandomEmoji()} size={isMobile ? 28 : 32} animate={false} />
        )}
        <span className="font-medium hidden sm:inline">{ethersEnsName || ensName || shortAddr}</span>
        <span className="flex items-center gap-1 ml-1 md:ml-2 text-emerald-700 text-xs font-semibold">
          {sproutsLoading ? '...' : totalSprouts > 0 ? `${totalSprouts}` : '0'} <span className="text-lg">🌱</span>
        </span>
      </Button>

      {showDropdown && (
        <Card 
          ref={dropdownRef}
          className={`absolute top-full right-0 mt-2 border-emerald-100 
                     bg-white/95 backdrop-blur-sm shadow-lg z-50 ${
                       isMobile ? 'w-72' : 'w-80'
                     }`}
        >
          <CardContent className="p-3 md:p-4 space-y-3 md:space-y-4">
            <div className="flex items-center gap-2 md:gap-3 border-b border-emerald-100 pb-2 md:pb-3">
              {ensAvatar ? (
                <EnsAvatar src={ensAvatar} size={isMobile ? 48 : 56} />
              ) : (
                <AnimatedEmojiAvatar emoji={pfpEmoji || getRandomEmoji()} size={isMobile ? 48 : 56} animate={true} />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-emerald-900 text-sm md:text-base">
                  {ethersEnsName || ensName || bloomUsername || "Anonymous Gardener"}
                </p>
                <p className="text-xs md:text-sm text-emerald-600/70">{ethersEnsName || ensName || shortAddr}</p>
                {ensError && (
                  <span className="text-xs text-red-500">{ensError}</span>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-emerald-700 text-xs md:text-sm">
                <span>Balance</span>
                <span className="font-medium text-emerald-900">
                  {balance} {symbol}
                </span>
              </div>
              <div className="flex justify-between text-emerald-700 text-xs md:text-sm">
                <span>Sprouts Earned</span>
                {sproutsLoading ? (
                  <span className="font-medium text-emerald-900">...</span>
                ) : totalSprouts > 0 ? (
                  <span className="font-medium text-emerald-900">{totalSprouts} 🌱</span>
                ) : (
                  <span className="font-medium text-emerald-900">Plant ideas, nurture to earn sprouts</span>
                )}
              </div>
              <div className="flex justify-between text-emerald-700 text-xs md:text-sm">
                <span>Network</span>
                <Badge className="border-emerald-200 text-emerald-700 text-xs">
                  {chain.name}
                </Badge>
              </div>
              {hasVerifiedSignature && (
                <div className="flex justify-between text-emerald-700 text-xs md:text-sm">
                  <span>Garden Access</span>
                  <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                    Verified ✅
                  </Badge>
                </div>
              )}
            </div>
            <div className="space-y-1 md:space-y-2 border-t border-emerald-100 pt-2">
              <Link href="/profile/me">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-emerald-700 hover:bg-emerald-50 text-xs md:text-sm"
                  onClick={() => setShowDropdown(false)}
                >
                  <User className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                  View Profile
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyAddress}
                className="w-full justify-start text-emerald-700 hover:bg-emerald-50 text-xs md:text-sm"
              >
                <Copy className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                Copy Address
              </Button>
              {explorerUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="w-full justify-start text-emerald-700 hover:bg-emerald-50 text-xs md:text-sm"
                >
                  <a
                    href={explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                    View on Explorer
                  </a>
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDisconnect}
                className="w-full justify-start text-red-600 hover:bg-red-50 text-xs md:text-sm"
              >
                <LogOut className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                Disconnect
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

