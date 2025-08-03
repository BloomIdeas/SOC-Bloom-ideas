import { ethers } from 'ethers';
import { toast } from 'sonner';
import { logger } from './logger';

// Contract ABI for the GardenArtNFT contract
export const GARDEN_ART_NFT_ABI = [
  "function mintArt(address to, string idea, string description, string minterName) external returns (uint256)",
  "function tokenURI(uint256 tokenId) external view returns (string)",
  "function tokenCounter() external view returns (uint256)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function balanceOf(address owner) external view returns (uint256)",
  "event ArtMinted(uint256 indexed tokenId, address indexed to, string idea, string minterName)"
] as const;

// Contract address (will be updated after deployment)
export const GARDEN_ART_NFT_ADDRESS = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || '';

// Check if contract address is available
export const isContractAvailable = () => {
  return typeof window !== 'undefined' && 
         window.ethereum && 
         GARDEN_ART_NFT_ADDRESS && 
         GARDEN_ART_NFT_ADDRESS !== '';
};

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
}

export interface NFTToken {
  id: number;
  metadata: NFTMetadata;
  owner: string;
}

export class NFTService {
  private contract: ethers.Contract | null = null;
  private provider: ethers.Provider | null = null;
  private signer: ethers.Signer | null = null;

  constructor() {
    this.initializeContract();
  }

  private initializeContract() {
    if (isContractAvailable()) {
      try {
        this.provider = new ethers.BrowserProvider(window.ethereum);
        this.contract = new ethers.Contract(
          GARDEN_ART_NFT_ADDRESS,
          GARDEN_ART_NFT_ABI,
          this.provider
        );
      } catch (error) {
        logger.error('Failed to initialize NFT contract:', error);
      }
    }
  }

  async connectSigner() {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }
    
    try {
      this.signer = await this.provider.getSigner();
      if (this.contract) {
        this.contract = this.contract.connect(this.signer);
      }
    } catch (error) {
      logger.error('Failed to connect signer:', error);
      throw error;
    }
  }

  async mintNFT(
    to: string,
    idea: string,
    description: string,
    minterName: string
  ): Promise<number> {
    if (!this.contract || !this.signer) {
      throw new Error('Contract or signer not initialized');
    }

    try {
      logger.info('Minting NFT for idea:', idea);
      
      const tx = await this.contract.mintArt(to, idea, description, minterName);
      const receipt = await tx.wait();
      
      // Find the ArtMinted event
      const event = receipt?.logs.find((log: any) => {
        try {
          const parsed = this.contract?.interface.parseLog(log);
          return parsed?.name === 'ArtMinted';
        } catch {
          return false;
        }
      });

      if (event) {
        const parsed = this.contract?.interface.parseLog(event);
        const tokenId = parsed?.args[0];
        logger.info('NFT minted successfully with token ID:', tokenId);
        return tokenId;
      } else {
        throw new Error('ArtMinted event not found in transaction receipt');
      }
    } catch (error) {
      logger.error('Failed to mint NFT:', error);
      throw error;
    }
  }

  async getTokenURI(tokenId: number): Promise<string> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      return await this.contract.tokenURI(tokenId);
    } catch (error) {
      logger.error('Failed to get token URI:', error);
      throw error;
    }
  }

  async getNFTMetadata(tokenId: number): Promise<NFTMetadata> {
    try {
      const tokenURI = await this.getTokenURI(tokenId);
      logger.info('Raw token URI:', tokenURI);
      
      // Handle data URI format
      if (tokenURI.startsWith('data:application/json;base64,')) {
        const base64Data = tokenURI.replace('data:application/json;base64,', '');
        const jsonString = atob(base64Data);
        logger.info('Decoded JSON string:', jsonString);
        
        // Clean the JSON string to remove any control characters
        const cleanedJsonString = jsonString.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
        logger.info('Cleaned JSON string:', cleanedJsonString);
        
        // Try to parse the JSON
        try {
          const parsed = JSON.parse(cleanedJsonString);
          logger.info('Successfully parsed metadata:', parsed);
          return parsed;
        } catch (parseError) {
          logger.error('Failed to parse JSON:', parseError);
          logger.error('JSON string that failed:', cleanedJsonString);
          
          // Try to create a minimal valid metadata
          const fallbackMetadata: NFTMetadata = {
            name: `Garden Art NFT #${tokenId}`,
            description: "A unique piece of generative art from the Bloom Ideas garden",
            image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMTAxODI4Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+R2FyZGVuIEFydCBOb3QgRm91bmQ8L3RleHQ+Cjwvc3ZnPgo=",
            attributes: [
              { trait_type: "Token ID", value: tokenId.toString() },
              { trait_type: "Status", value: "Metadata Parse Error" }
            ]
          };
          return fallbackMetadata;
        }
      } else {
        // Handle IPFS or HTTP URIs
        const response = await fetch(tokenURI);
        return await response.json();
      }
    } catch (error) {
      logger.error('Failed to get NFT metadata:', error);
      throw error;
    }
  }

  async getUserNFTs(address: string): Promise<NFTToken[]> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      logger.info('Getting user NFTs for address:', address);
      logger.info('Contract address:', GARDEN_ART_NFT_ADDRESS);
      
      const totalSupply = await this.contract.tokenCounter();
      logger.info('Total supply:', totalSupply);
      
      const nfts: NFTToken[] = [];

      // Check each token to see if the user owns it
      for (let i = 1; i <= totalSupply; i++) {
        try {
          const owner = await this.contract.ownerOf(i);
          logger.info(`Token ${i} owner:`, owner);
          if (owner.toLowerCase() === address.toLowerCase()) {
            try {
              const metadata = await this.getNFTMetadata(i);
              nfts.push({
                id: i,
                metadata,
                owner: address
              });
            } catch (metadataError) {
              logger.error(`Failed to get metadata for token ${i}:`, metadataError);
              // Create fallback metadata
              const fallbackMetadata: NFTMetadata = {
                name: `Garden Art NFT #${i}`,
                description: "A unique piece of generative art from the Bloom Ideas garden",
                image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMTAxODI4Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+R2FyZGVuIEFydCBOb3QgRm91bmQ8L3RleHQ+Cjwvc3ZnPgo=",
                attributes: [
                  { trait_type: "Token ID", value: i.toString() },
                  { trait_type: "Status", value: "Metadata Error" }
                ]
              };
              nfts.push({
                id: i,
                metadata: fallbackMetadata,
                owner: address
              });
            }
          }
        } catch (error) {
          // Token might not exist, continue to next
          logger.info(`Token ${i} does not exist or error:`, error);
          continue;
        }
      }

      logger.info('Found NFTs for user:', nfts.length);
      return nfts;
    } catch (error) {
      logger.error('Failed to get user NFTs:', error);
      throw error;
    }
  }

  async getTotalSupply(): Promise<number> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      logger.info('Getting total supply from contract:', GARDEN_ART_NFT_ADDRESS);
      const totalSupply = await this.contract.tokenCounter();
      logger.info('Total supply result:', totalSupply);
      return totalSupply;
    } catch (error) {
      logger.error('Failed to get total supply:', error);
      throw error;
    }
  }

  async testContractConnection(): Promise<boolean> {
    if (!this.contract) {
      logger.error('Contract not initialized');
      return false;
    }

    try {
      logger.info('Testing contract connection...');
      const totalSupply = await this.contract.tokenCounter();
      logger.info('Contract connection successful, total supply:', totalSupply);
      return true;
    } catch (error) {
      logger.error('Contract connection failed:', error);
      return false;
    }
  }

  async debugTokenMetadata(tokenId: number): Promise<void> {
    try {
      logger.info(`=== Debugging Token ${tokenId} ===`);
      
      if (!this.contract) {
        logger.error('Contract not initialized');
        return;
      }

      // Check if token exists
      try {
        const owner = await this.contract.ownerOf(tokenId);
        logger.info(`Token ${tokenId} owner:`, owner);
      } catch (error) {
        logger.error(`Token ${tokenId} does not exist:`, error);
        return;
      }

      // Get token URI
      try {
        const tokenURI = await this.contract.tokenURI(tokenId);
        logger.info(`Token ${tokenId} URI:`, tokenURI);
        
        if (tokenURI.startsWith('data:application/json;base64,')) {
          const base64Data = tokenURI.replace('data:application/json;base64,', '');
          const jsonString = atob(base64Data);
          logger.info(`Token ${tokenId} decoded JSON:`, jsonString);
          
          // Show character codes for debugging
          const charCodes = Array.from(jsonString).map((char, index) => ({
            index,
            char,
            code: char.charCodeAt(0)
          }));
          logger.info(`Token ${tokenId} character codes:`, charCodes);
        }
      } catch (error) {
        logger.error(`Failed to get token ${tokenId} URI:`, error);
      }
      
      logger.info(`=== End Debug Token ${tokenId} ===`);
    } catch (error) {
      logger.error(`Error debugging token ${tokenId}:`, error);
    }
  }
}

// Singleton instance
export const nftService = new NFTService(); 