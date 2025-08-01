"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Shield, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"
import { useSignMessage } from 'wagmi'
import { getAddress } from 'viem'
import { logger } from "@/lib/logger";

interface MessageSigningModalProps {
  address: string
  onSignSuccess: (signature: string) => void
  onSignReject: () => void
}

export default function MessageSigningModal({
  address,
  onSignSuccess,
  onSignReject,
}: MessageSigningModalProps) {
  const [isSigning, setIsSigning] = useState(false)
  const { signMessageAsync } = useSignMessage()

  const welcomeMessage = `Welcome to Digital Garden of Ideas

By signing this message, you acknowledge that you are entering a space where ideas bloom and grow together.

Address: ${getAddress(address)}
Timestamp: ${new Date().toISOString()}

This signature is used to verify your identity and grant you access to the Digital Garden.`

  const handleSignMessage = async () => {
    if (!address) return

    setIsSigning(true)
    try {
      const signature = await signMessageAsync({ message: welcomeMessage })
      toast.success("Message signed successfully! Welcome to the Digital Garden!")
      onSignSuccess(signature)
    } catch (error) {
      logger.error("Signing failed:", error)
      toast.error("Message signing was rejected or failed")
      onSignReject()
    } finally {
      setIsSigning(false)
    }
  }

  const handleReject = () => {
    toast.error("Message signing is required to access the Digital Garden")
    onSignReject()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md border-emerald-200 bg-white/95 backdrop-blur-sm shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-emerald-600" />
          </div>
          <CardTitle className="text-emerald-900 text-xl font-bold">
            Welcome to Digital Garden of Ideas
          </CardTitle>
          <CardDescription className="text-emerald-700">
            Please sign this message to verify your identity and enter the garden
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                {address.slice(0, 6)}...{address.slice(-4)}
              </Badge>
              <span className="text-sm text-emerald-600">will sign</span>
            </div>
            <p className="text-sm text-emerald-700 leading-relaxed">
              "Welcome to Digital Garden of Ideas"
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              onClick={handleSignMessage}
              disabled={isSigning}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold"
            >
              {isSigning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Sign Message & Enter Garden
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleReject}
              disabled={isSigning}
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>

          <div className="text-xs text-emerald-600/70 text-center">
            This signature is used for identity verification only. No transaction will be made.
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 