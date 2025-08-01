"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Wallet, Copy, ExternalLink, LogOut, User } from "lucide-react"
import Link from "next/link"
import { logger } from "@/lib/logger";

interface WalletConnectionProps {
  onConnect?: (address: string) => void
}

export default function WalletConnection({ onConnect }: WalletConnectionProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState("")
  const [ensName, setEnsName] = useState("")
  const [balance, setBalance] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)

  // Simulate wallet connection
  const connectWallet = async () => {
    try {
      // Simulate wallet connection delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockAddress = "0x1234567890123456789012345678901234567890"
      const mockEnsName = "builder.eth"
      const mockBalance = "2.45"

      setAddress(mockAddress)
      setEnsName(mockEnsName)
      setBalance(mockBalance)
      setIsConnected(true)

      if (onConnect) {
        onConnect(mockAddress)
      }
    } catch (error) {
      logger.error("Failed to connect wallet:", error)
    }
  }

  const disconnectWallet = () => {
    setIsConnected(false)
    setAddress("")
    setEnsName("")
    setBalance("")
    setShowDropdown(false)
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(address)
    // You could add a toast notification here
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (!isConnected) {
    return (
      <Button
        onClick={connectWallet}
        className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
      >
        <Wallet className="w-4 h-4 mr-2" />
        Connect Wallet
      </Button>
    )
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setShowDropdown(!showDropdown)}
        className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-white/80 backdrop-blur-sm"
      >
        <Avatar className="w-5 h-5 mr-2">
          <AvatarFallback className="text-xs bg-emerald-100 text-emerald-700">
            {ensName ? ensName.slice(0, 2).toUpperCase() : address.slice(2, 4).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="font-medium">{ensName || formatAddress(address)}</span>
        <Badge variant="secondary" className="ml-2 bg-emerald-100 text-emerald-700">
          {balance} ETH
        </Badge>
      </Button>

      {showDropdown && (
        <Card className="absolute top-full right-0 mt-2 w-80 border-emerald-100 bg-white/95 backdrop-blur-sm shadow-lg z-50">
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Profile Header */}
              <div className="flex items-center gap-3 pb-3 border-b border-emerald-100">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-emerald-100 text-emerald-700">
                    {ensName ? ensName.slice(0, 2).toUpperCase() : address.slice(2, 4).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-emerald-900">{ensName || "Anonymous Gardener"}</p>
                  <p className="text-sm text-emerald-600/70">{formatAddress(address)}</p>
                  <Badge className="bg-teal-400 text-white border-0 mt-1">Grove-Keeper</Badge>
                </div>
              </div>

              {/* Wallet Info */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-emerald-700">Balance</span>
                  <span className="font-medium text-emerald-900">{balance} ETH</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-emerald-700">Garden Sprouts</span>
                  <span className="font-medium text-emerald-900">342 🌱</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-emerald-700">Network</span>
                  <Badge variant="outline" className="border-emerald-200 text-emerald-700">
                    Ethereum
                  </Badge>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2 border-t border-emerald-100">
                <Link href="/profile/me">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-emerald-700 hover:bg-emerald-50"
                    onClick={() => setShowDropdown(false)}
                  >
                    <User className="w-4 h-4 mr-2" />
                    View Profile
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  onClick={copyAddress}
                  className="w-full justify-start text-emerald-700 hover:bg-emerald-50"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Address
                </Button>
                <Button variant="ghost" className="w-full justify-start text-emerald-700 hover:bg-emerald-50">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on Etherscan
                </Button>
                <Button
                  variant="ghost"
                  onClick={disconnectWallet}
                  className="w-full justify-start text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Disconnect
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
