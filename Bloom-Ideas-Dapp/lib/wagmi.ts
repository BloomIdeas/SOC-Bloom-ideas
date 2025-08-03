'use client';

import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { http } from 'viem'
import { mainnet, sepolia, polygon } from 'viem/chains'

// Etherlink Testnet chain definition
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

export const config = getDefaultConfig({
  appName: 'Bloom Ideas',
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || 'YOUR_PROJECT_ID', // Get a project ID from https://cloud.walletconnect.com
  chains: [etherlinkTestnet, mainnet, sepolia, polygon],
  transports: {
    [etherlinkTestnet.id]: http('https://rpc.ankr.com/etherlink_testnet'),
    [mainnet.id]: http(process.env.NEXT_PUBLIC_ALCHEMY_MAINNET_RPC || 'https://eth-mainnet.g.alchemy.com/v2/demo'),
    [sepolia.id]: http(),
    [polygon.id]: http(),
  },
}) 