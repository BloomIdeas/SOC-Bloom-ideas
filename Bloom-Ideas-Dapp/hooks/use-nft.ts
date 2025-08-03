import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { nftService, NFTToken, NFTMetadata, isContractAvailable } from '@/lib/nft';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

export interface UseNFTReturn {
  userNFTs: NFTToken[];
  loading: boolean;
  minting: boolean;
  mintNFT: (idea: string, description: string, minterName: string) => Promise<number | null>;
  refreshNFTs: () => Promise<void>;
  getNFTMetadata: (tokenId: number) => Promise<NFTMetadata | null>;
  debugNFTMetadata: (tokenId: number) => Promise<void>;
}

export function useNFT(): UseNFTReturn {
  const { address, isConnected } = useAccount();
  const [userNFTs, setUserNFTs] = useState<NFTToken[]>([]);
  const [loading, setLoading] = useState(false);
  const [minting, setMinting] = useState(false);

  // Fetch user's NFTs
  const fetchUserNFTs = useCallback(async () => {
    if (!address || !isConnected || !isContractAvailable()) {
      setUserNFTs([]);
      return;
    }

    try {
      setLoading(true);
      
      // Test contract connection first
      const isConnected = await nftService.testContractConnection();
      if (!isConnected) {
        logger.error('Contract connection failed');
        setUserNFTs([]);
        return;
      }
      
      const nfts = await nftService.getUserNFTs(address);
      setUserNFTs(nfts);
    } catch (error) {
      logger.error('Failed to fetch user NFTs:', error);
      // Don't show error toast for contract not available or network issues
      if (error instanceof Error && 
          !error.message.includes('Contract not initialized') &&
          !error.message.includes('missing revert data') &&
          !error.message.includes('could not decode result data')) {
        toast.error('Failed to load your NFTs');
      }
    } finally {
      setLoading(false);
    }
  }, [address, isConnected]);

  // Mint new NFT
  const mintNFT = useCallback(async (
    idea: string,
    description: string,
    minterName: string
  ): Promise<number | null> => {
    if (!address || !isConnected) {
      toast.error('Please connect your wallet first');
      return null;
    }

    if (!isContractAvailable()) {
      toast.error('NFT contract not available. Please check your network connection.');
      return null;
    }

    try {
      setMinting(true);
      
      // Connect signer if not already connected
      await nftService.connectSigner();
      
      // Mint the NFT
      const tokenId = await nftService.mintNFT(address, idea, description, minterName);
      
      toast.success(`NFT minted successfully! Token ID: ${tokenId}`);
      
      // Refresh user's NFTs
      await fetchUserNFTs();
      
      return tokenId;
    } catch (error) {
      logger.error('Failed to mint NFT:', error);
      
      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes('insufficient funds')) {
          toast.error('Insufficient funds for transaction');
        } else if (error.message.includes('user rejected')) {
          toast.error('Transaction was cancelled');
        } else {
          toast.error('Failed to mint NFT. Please try again.');
        }
      } else {
        toast.error('Failed to mint NFT. Please try again.');
      }
      
      return null;
    } finally {
      setMinting(false);
    }
  }, [address, isConnected, fetchUserNFTs]);

  // Get NFT metadata
  const getNFTMetadata = useCallback(async (tokenId: number): Promise<NFTMetadata | null> => {
    try {
      return await nftService.getNFTMetadata(tokenId);
    } catch (error) {
      logger.error('Failed to get NFT metadata:', error);
      return null;
    }
  }, []);

  // Debug NFT metadata
  const debugNFTMetadata = useCallback(async (tokenId: number): Promise<void> => {
    try {
      await nftService.debugTokenMetadata(tokenId);
    } catch (error) {
      logger.error('Failed to debug NFT metadata:', error);
    }
  }, []);

  // Refresh NFTs
  const refreshNFTs = useCallback(async () => {
    await fetchUserNFTs();
  }, [fetchUserNFTs]);

  // Fetch NFTs when address changes
  useEffect(() => {
    fetchUserNFTs();
  }, [fetchUserNFTs]);

  return {
    userNFTs,
    loading,
    minting,
    mintNFT,
    refreshNFTs,
    getNFTMetadata,
    debugNFTMetadata,
  };
} 