import { ethers } from 'ethers';
import { logger } from './logger';

export interface BalanceCheckResult {
  hasEnoughBalance: boolean;
  currentBalance: string;
  estimatedGas: string;
  network: string;
}

export class BalanceCheckService {
  private provider: ethers.Provider | null = null;

  constructor() {
    this.initializeProvider();
  }

  private initializeProvider() {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        this.provider = new ethers.BrowserProvider(window.ethereum);
      } catch (error) {
        logger.error('Failed to initialize provider for balance check:', error);
      }
    }
  }

  async checkBalance(address: string): Promise<BalanceCheckResult> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const balance = await this.provider.getBalance(address);
      const balanceInXTZ = ethers.formatEther(balance);
      
      // Estimate gas for NFT minting (approximate)
      const estimatedGas = '0.001'; // Approximate gas cost for NFT minting
      const hasEnoughBalance = parseFloat(balanceInXTZ) > parseFloat(estimatedGas);

      return {
        hasEnoughBalance,
        currentBalance: balanceInXTZ,
        estimatedGas,
        network: 'Etherlink Testnet'
      };
    } catch (error) {
      logger.error('Failed to check balance:', error);
      throw error;
    }
  }

  getFaucetUrl(): string {
    return 'https://faucet.etherlink.com/';
  }

  getExplorerUrl(): string {
    return 'https://testnet.explorer.etherlink.com/';
  }
}

export const balanceCheckService = new BalanceCheckService(); 