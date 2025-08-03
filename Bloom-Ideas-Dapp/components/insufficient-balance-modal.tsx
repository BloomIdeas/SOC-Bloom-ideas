"use client"

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Coins, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import { BalanceCheckResult } from '@/lib/balance-check';

interface InsufficientBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOption1: () => void; // Get test tokens and re-submit later
  onOption2: () => void; // Submit idea without NFT
  balanceInfo: BalanceCheckResult;
}

export function InsufficientBalanceModal({
  isOpen,
  onClose,
  onOption1,
  onOption2,
  balanceInfo
}: InsufficientBalanceModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleOption1 = async () => {
    setIsLoading(true);
    try {
      await onOption1();
    } finally {
      setIsLoading(false);
    }
  };

  const handleOption2 = async () => {
    setIsLoading(true);
    try {
      await onOption2();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-sm border-emerald-100">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-emerald-900">
                Insufficient Balance
              </DialogTitle>
              <p className="text-sm text-emerald-600">
                You need more XTZ to mint your NFT
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Balance Information */}
        <Card className="border-amber-200 bg-amber-50/50 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-amber-800">Current Balance</span>
              <Badge variant="outline" className="border-amber-300 text-amber-700">
                {parseFloat(balanceInfo.currentBalance).toFixed(4)} XTZ
              </Badge>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-amber-800">Estimated Gas</span>
              <Badge variant="outline" className="border-amber-300 text-amber-700">
                {balanceInfo.estimatedGas} XTZ
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-amber-800">Network</span>
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                {balanceInfo.network}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-emerald-900 mb-4">
            Choose an option:
          </h3>

          {/* Option 1: Get Test Tokens */}
          <Card className="border-emerald-200 hover:border-emerald-300 transition-colors cursor-pointer group">
            <CardContent className="p-4" onClick={handleOption1}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Coins className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-emerald-900 mb-1 group-hover:text-emerald-700">
                    Get Test Tokens & Mint NFT
                  </h4>
                  <p className="text-sm text-emerald-600 mb-3">
                    Visit the faucet to get free test tokens, then come back to mint your NFT
                  </p>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open('https://faucet.etherlink.com/', '_blank');
                      }}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Visit Faucet
                    </Button>
                    <span className="text-xs text-emerald-500">
                      Recommended
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Option 2: Submit Without NFT */}
          <Card className="border-gray-200 hover:border-gray-300 transition-colors cursor-pointer group">
            <CardContent className="p-4" onClick={handleOption2}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-gray-700">
                    Submit Idea Without NFT
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Save your idea to the database now. You can mint the NFT later when you have tokens
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-gray-300 text-gray-600">
                      No NFT minting
                    </Badge>
                    <span className="text-xs text-gray-500">
                      Quick submit
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t border-emerald-100">
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="text-emerald-600 hover:text-emerald-700"
          >
            Cancel
          </Button>
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-emerald-700">Processing...</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 