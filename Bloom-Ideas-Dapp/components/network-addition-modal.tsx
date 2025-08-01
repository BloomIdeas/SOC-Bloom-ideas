"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, ExternalLink, AlertTriangle, CheckCircle } from "lucide-react"
import { toast } from "sonner"

interface NetworkAdditionModalProps {
  isOpen: boolean
  onClose: () => void
  onNetworkAdded: () => void
}

const etherlinkTestnetConfig = {
  chainId: '0x1f47b', // 128123 in hex
  chainName: 'Etherlink Testnet',
  nativeCurrency: {
    name: 'XTZ',
    symbol: 'XTZ',
    decimals: 18,
  },
  rpcUrls: ['https://rpc.ankr.com/etherlink_testnet'],
  blockExplorerUrls: ['https://testnet-explorer.etherlink.com'],
}

export default function NetworkAdditionModal({ isOpen, onClose, onNetworkAdded }: NetworkAdditionModalProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [hasAdded, setHasAdded] = useState(false)

  const addNetworkToWallet = async () => {
    if (!window.ethereum) {
      toast.error('No wallet detected. Please install MetaMask or another Web3 wallet.')
      return
    }

    setIsAdding(true)
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [etherlinkTestnetConfig],
      })
      setHasAdded(true)
      toast.success('Etherlink Testnet added to your wallet!')
      setTimeout(() => {
        onNetworkAdded()
        onClose()
      }, 2000)
    } catch (error: any) {
      if (error.code === 4001) {
        toast.error('Network addition was rejected by user')
      } else if (error.code === -32602) {
        toast.error('Network already exists in wallet')
        setHasAdded(true)
      } else {
        toast.error('Failed to add network: ' + error.message)
      }
    } finally {
      setIsAdding(false)
    }
  }

  const copyNetworkConfig = () => {
    const configText = `Chain ID: ${etherlinkTestnetConfig.chainId}
Chain Name: ${etherlinkTestnetConfig.chainName}
RPC URL: ${etherlinkTestnetConfig.rpcUrls[0]}
Block Explorer: ${etherlinkTestnetConfig.blockExplorerUrls[0]}
Currency: ${etherlinkTestnetConfig.nativeCurrency.name} (${etherlinkTestnetConfig.nativeCurrency.symbol})`
    
    navigator.clipboard.writeText(configText)
    toast.success('Network configuration copied to clipboard')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <CardTitle>Add Etherlink Testnet</CardTitle>
          </div>
          <CardDescription>
            Your wallet needs to be configured to use Etherlink Testnet. Add it now to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Network</span>
              <Badge variant="outline" className="border-orange-200 text-orange-700">
                Etherlink Testnet
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Chain ID</span>
              <span className="text-sm text-gray-600">128123</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Currency</span>
              <span className="text-sm text-gray-600">XTZ</span>
            </div>
          </div>

          {hasAdded ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Network added successfully!</span>
            </div>
          ) : (
            <div className="space-y-3">
              <Button
                onClick={addNetworkToWallet}
                disabled={isAdding}
                className="w-full bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600"
              >
                {isAdding ? "Adding Network..." : "Add Etherlink Testnet"}
              </Button>
              
              <div className="text-xs text-gray-500 text-center">
                Having trouble? You can manually add the network to your wallet.
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyNetworkConfig}
                  className="flex-1"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy Config
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="flex-1"
                >
                  <a
                    href="https://testnet-explorer.etherlink.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Explorer
                  </a>
                </Button>
              </div>
            </div>
          )}

          <Button
            variant="ghost"
            onClick={onClose}
            className="w-full"
          >
            Close
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 