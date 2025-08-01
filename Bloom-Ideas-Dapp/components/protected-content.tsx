"use client"

import { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useSignatureVerification } from "@/hooks/use-signature-verification"
import { useConnectModal } from "@rainbow-me/rainbowkit"
import { Lock, Sparkles } from "lucide-react"

interface ProtectedContentProps {
  children: ReactNode
  title?: string
  description?: string
}

export default function ProtectedContent({ 
  children, 
  title = "Protected Garden Content",
  description = "This content requires signature verification to access"
}: ProtectedContentProps) {
  const { hasVerifiedSignature, isConnected, isLoading } = useSignatureVerification()
  const { openConnectModal } = useConnectModal()

  if (isLoading) {
    return (
      <Card className="border-emerald-200 bg-white/95 backdrop-blur-sm">
        <CardContent className="p-6 text-center">
          <div className="animate-pulse">
            <div className="h-4 bg-emerald-200 rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-4 bg-emerald-200 rounded w-1/2 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!isConnected) {
    return (
      <Card className="border-emerald-200 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-emerald-600" />
          </div>
          <CardTitle className="text-emerald-900">{title}</CardTitle>
          <CardDescription className="text-emerald-700">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button
            onClick={openConnectModal}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold"
          >
            Connect Wallet to Access
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!hasVerifiedSignature) {
    return (
      <Card className="border-emerald-200 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-emerald-600" />
          </div>
          <CardTitle className="text-emerald-900">{title}</CardTitle>
          <CardDescription className="text-emerald-700">
            Please sign the welcome message to access this content
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-emerald-600 mb-4">
            The signature modal should appear automatically when you connect your wallet.
          </p>
          <Button
            variant="outline"
            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
          >
            Waiting for Signature...
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-emerald-200 bg-white/95 backdrop-blur-sm">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-emerald-600" />
        </div>
        <CardTitle className="text-emerald-900">Welcome to the Garden! 🌱</CardTitle>
        <CardDescription className="text-emerald-700">
          Your signature has been verified. Enjoy exploring the Digital Garden of Ideas!
        </CardDescription>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  )
} 