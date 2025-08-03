"use client"

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useNFT, NFTToken } from '@/hooks/use-nft';
import { ExternalLink, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface NFTGalleryProps {
  className?: string;
}

export function NFTGallery({ className }: NFTGalleryProps) {
  const { userNFTs, loading, refreshNFTs } = useNFT();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshNFTs();
      toast.success('NFTs refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh NFTs');
    } finally {
      setRefreshing(false);
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = 'none';
    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
    if (fallback) {
      fallback.style.display = 'flex';
    }
  };

  if (loading) {
    return (
      <div className={className}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-emerald-900">Your Garden NFTs</h3>
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-emerald-100">
              <CardContent className="p-4">
                <Skeleton className="h-48 w-full mb-3" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (userNFTs.length === 0) {
    return (
      <div className={className}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-emerald-900">Your Garden NFTs</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="border-emerald-200 text-emerald-700"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        <Card className="border-emerald-100 bg-emerald-50/50">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="w-8 h-8 text-emerald-600" />
            </div>
            <h4 className="text-lg font-medium text-emerald-900 mb-2">No NFTs Yet</h4>
            <p className="text-emerald-700 mb-4">
              Plant your first idea to mint your first Garden NFT!
            </p>
            <Badge variant="outline" className="border-emerald-200 text-emerald-700">
              NFTs will appear here after you submit ideas
            </Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-emerald-900">
          Your Garden NFTs ({userNFTs.length})
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="border-emerald-200 text-emerald-700"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {userNFTs.map((nft) => (
          <NFTCard key={nft.id} nft={nft} onImageError={handleImageError} />
        ))}
      </div>
    </div>
  );
}

interface NFTCardProps {
  nft: NFTToken;
  onImageError: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

function NFTCard({ nft, onImageError }: NFTCardProps) {
  const [imageLoading, setImageLoading] = useState(true);

  return (
    <Card className="border-emerald-100 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        {/* NFT Image */}
        <div className="relative aspect-square mb-3 bg-emerald-50 rounded-lg overflow-hidden">
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
          )}
          
          <img
            src={nft.metadata.image}
            alt={nft.metadata.name}
            className={`w-full h-full object-cover ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => setImageLoading(false)}
            onError={onImageError}
          />
          
          {/* Fallback for failed images */}
          <div 
            className="absolute inset-0 flex items-center justify-center bg-emerald-100"
            style={{ display: 'none' }}
          >
            <div className="text-center">
              <ImageIcon className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm text-emerald-600">NFT #{nft.id}</p>
            </div>
          </div>
        </div>

        {/* NFT Info */}
        <div className="space-y-2">
          <h4 className="font-semibold text-emerald-900 text-sm truncate">
            {nft.metadata.name}
          </h4>
          
          <p className="text-xs text-emerald-600 line-clamp-2">
            {nft.metadata.description}
          </p>

          {/* Attributes */}
          <div className="flex flex-wrap gap-1">
            {nft.metadata.attributes.map((attr, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {attr.trait_type}: {attr.value}
              </Badge>
            ))}
          </div>

          {/* Token ID */}
          <div className="flex items-center justify-between pt-2 border-t border-emerald-100">
            <span className="text-xs text-emerald-500">Token #{nft.id}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-emerald-600 hover:text-emerald-700"
              onClick={() => {
                // Open NFT in explorer or view details
                toast.info('NFT details feature coming soon!');
              }}
            >
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 