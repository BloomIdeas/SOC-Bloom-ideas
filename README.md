# 🌱 SOC-Bloom-Ideas

> **Etherlink Hackathon Project** | **Track: Collab Culture** | **NFT Integration**

A decentralized platform for collaborative idea sharing and community-driven innovation, built on Etherlink blockchain with NFT rewards for contributors.

## 🚀 Project Overview

**SOC-Bloom-Ideas** is a Web3 hackathon platform that transforms idea sharing into a collaborative garden ecosystem. Users can plant ideas, nurture them through community engagement, and earn NFT rewards as their ideas bloom into successful projects.

### 🌟 Key Features

- **🌱 Idea Planting**: Submit innovative ideas with detailed descriptions, tech stacks, and mockups
- **💧 Community Nurturing**: Users can nurture or neglect ideas, building reputation through engagement
- **🌸 NFT Rewards**: Earn unique garden-themed NFTs as your ideas grow and succeed
- **🌿 Garden Ecosystem**: Immersive UI with seasonal themes and weather effects
- **🔗 Etherlink Integration**: Built on Etherlink testnet for fast, secure transactions
- **👥 Collaborative Culture**: Foster meaningful connections and teamwork

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI Components
- **Blockchain**: Etherlink Testnet (Tezos-based)
- **Wallet**: RainbowKit, WalletConnect
- **Database**: Supabase (PostgreSQL)
- **State Management**: React Query, Context API
- **UI/UX**: Framer Motion, Lucide Icons

### Blockchain Integration
- **Network**: Etherlink Testnet (Chain ID: 128123)
- **Currency**: XTZ (Tezos)
- **RPC**: https://rpc.ankr.com/etherlink_testnet
- **Explorer**: https://testnet-explorer.etherlink.com

## 🔗 Why Etherlink?

### 🚀 **Etherlink Advantages We Leveraged**

**1. EVM Compatibility with Tezos Benefits**
- Full Ethereum compatibility with Tezos's security and efficiency
- Seamless integration with existing Ethereum tooling (Hardhat, Wagmi, RainbowKit)
- Access to Tezos's robust ecosystem and governance

**2. Superior Performance**
- **Fast Finality**: Sub-second transaction finality for instant NFT minting
- **Low Gas Costs**: Efficient gas pricing for frequent NFT operations
- **High Throughput**: Handles multiple concurrent NFT mints without congestion

**3. Enhanced Security**
- **Tezos Security Model**: Inherits Tezos's battle-tested security
- **Formal Verification**: Smart contracts can be formally verified
- **Upgradeable Infrastructure**: Network can evolve without hard forks

**4. Developer Experience**
- **Familiar Tooling**: Works with standard Ethereum development tools
- **Rich Ecosystem**: Access to both Ethereum and Tezos ecosystems
- **Excellent Documentation**: Comprehensive guides and examples

### 📍 **Etherlink Integration in Our Code**

#### **1. Network Configuration** 
```typescript
// lib/wagmi.ts - Etherlink Testnet Setup
const etherlinkTestnet = {
  id: 128123,
  name: 'Etherlink Testnet',
  nativeCurrency: {
    name: 'XTZ',
    symbol: 'XTZ', 
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://rpc.ankr.com/etherlink_testnet'] },
    public: { http: ['https://rpc.ankr.com/etherlink_testnet'] },
  },
  blockExplorers: {
    default: {
      name: 'Etherlink Testnet Explorer',
      url: 'https://testnet-explorer.etherlink.com',
    },
  },
  testnet: true,
} as const
```

#### **2. Smart Contract Deployment**
```typescript
// contracts/hardhat.config.ts - Etherlink Network Config
networks: {
  etherlinkTestnet: {
    url: "https://node.ghostnet.etherlink.com",
    chainId: 128123,
    accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    gasPrice: 1000000000, // 1 gwei - Etherlink's efficient pricing
  },
}
```

#### **3. NFT Contract on Etherlink**
```solidity
// contracts/GardenArtNFT.sol - On-chain Generative NFTs
contract GardenArtNFT is ERC721, Ownable {
    // Etherlink's fast finality enables real-time NFT minting
    function mintArt(address to, string calldata idea, string calldata description, string calldata minterName) 
        external onlyOwner returns (uint256) {
        // Sub-second transaction finality ensures instant NFT creation
        unchecked { tokenCounter++; }
        uint256 newTokenId = tokenCounter;
        _safeMint(to, newTokenId);
        _tokenMetadata[newTokenId] = TokenMetadata(idea, description, minterName);
        emit ArtMinted(newTokenId, to, idea, minterName);
        return newTokenId;
    }
}
```

#### **4. Wallet Integration**
```typescript
// components/universal-wallet-connection.tsx - Etherlink-First UX
const handleSwitchToEtherlink = async () => {
  try {
    await switchChain({ chainId: etherlinkTestnet.id })
    toast.success('Switched to Etherlink Testnet')
  } catch (error) {
    toast.error('Failed to switch network. Please add Etherlink Testnet to your wallet.')
  }
}
```

#### **5. Network Addition Helper**
```typescript
// components/network-addition-modal.tsx - Seamless Onboarding
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
```

### 🎯 **Etherlink-Specific Features We Built**

**1. XTZ Balance Display**
- Shows XTZ balance instead of ETH when on Etherlink
- Real-time balance updates with Etherlink's fast block times

**2. Etherlink Explorer Integration**
- Direct links to Etherlink testnet explorer for transactions
- Transaction status tracking on Etherlink's efficient network

**3. Gas Optimization**
- Leveraged Etherlink's low gas costs for frequent NFT operations
- Optimized contract calls for Etherlink's performance characteristics

**4. Network Detection & Switching**
- Automatic detection of Etherlink testnet connection
- One-click network switching with user-friendly prompts

## 🎯 Hackathon Goals

### Collab Culture Track Focus
1. **Community-Driven Innovation**: Enable users to collaboratively develop ideas
2. **Reputation System**: Build trust through engagement and contribution
3. **NFT Incentives**: Reward active participants with unique digital assets
4. **Cross-Project Collaboration**: Connect developers, designers, and creators

### NFT Integration Strategy
- **Garden-Themed NFTs**: Seasonal flowers, plants, and garden elements
- **Achievement NFTs**: Unlock based on idea success and community contribution
- **Collaboration NFTs**: Special rewards for team-based idea development
- **Rarity System**: Different NFT tiers based on contribution levels

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- MetaMask or compatible Web3 wallet
- Etherlink Testnet configured in wallet

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/SOC-Bloom-ideas.git
cd SOC-Bloom-ideas/Bloom-Ideas-Dapp

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Add your Supabase and Etherlink configuration

# Run development server
pnpm dev
```

### Environment Setup

Create a `.env.local` file with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_ETHERLINK_RPC=https://rpc.ankr.com/etherlink_testnet
NEXT_PUBLIC_ETHERLINK_EXPLORER=https://testnet-explorer.etherlink.com
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=your_deployed_nft_contract_address
```

## 🌱 How It Works

### 1. Plant Your Idea
- Connect your wallet to Etherlink testnet
- Submit innovative ideas with detailed descriptions
- Add tech stack, mockups, and category tags
- Your idea gets "planted" in the garden

### 2. Community Nurturing
- Other users can "nurture" or "neglect" your ideas
- Build reputation through positive engagement
- Ideas progress through stages: planted → growing → bloomed

### 3. NFT Rewards
- Earn garden-themed NFTs as your ideas succeed
- Seasonal and achievement-based NFT collections
- Rarity levels based on contribution and success metrics

### 4. Collaborative Development
- Connect with other developers and creators
- Form teams around promising ideas
- Share resources and expertise

## 🎨 UI/UX Features

### Garden Theme
- **Seasonal Backgrounds**: Dynamic themes based on real seasons
- **Weather Effects**: Animated weather elements for immersion
- **Garden Elements**: Floating flowers, leaves, and natural animations
- **Responsive Design**: Mobile-first approach with touch-friendly interactions

### Interactive Elements
- **Idea Cards**: Beautiful cards with progress indicators
- **Profile Popups**: Quick user information without page navigation
- **Enhanced Modals**: Rich idea previews with detailed information
- **Wallet Integration**: Seamless Web3 wallet connection

## 🔧 Development

### Project Structure
```
Bloom-Ideas-Dapp/
├── app/                    # Next.js app router pages
│   ├── page.tsx           # Home page with idea browsing
│   ├── submit/            # Idea submission form
│   ├── idea/[id]/         # Individual idea detail pages
│   └── profile/           # User profile management
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components (shadcn/ui)
│   ├── garden-elements.tsx    # Garden theme components
│   └── universal-wallet-connection.tsx  # Web3 integration
├── lib/                  # Utilities and configurations
│   ├── supabaseClient.ts # Database client
│   ├── wagmi.ts          # Blockchain configuration
│   └── types.ts          # TypeScript definitions
├── contracts/            # Smart contracts
│   ├── GardenArtNFT.sol  # NFT contract for Etherlink
│   └── hardhat.config.ts # Etherlink deployment config
└── hooks/                # Custom React hooks
```

### Key Components

#### Garden Theme System
- **SeasonalBackground**: Dynamic backgrounds based on current season
- **GardenWeather**: Animated weather effects
- **FloatingGardenElements**: Ambient garden animations

#### Web3 Integration
- **UniversalWalletConnection**: Multi-wallet support with Etherlink focus
- **NetworkAdditionModal**: Helps users add Etherlink testnet
- **GardenExplorer**: Shows wallet stats in garden theme

#### Idea Management
- **SimplifiedIdeaCard**: Card view for idea browsing
- **EnhancedIdeaModal**: Rich idea preview modal
- **ProfilePopup**: Quick user profile viewing

## 🧪 Testing

```bash
# Run linting
pnpm lint

# Build for production
pnpm build

# Start production server
pnpm start
```

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📱 Screenshots
<img width="1502" height="856" alt="Screenshot 2025-08-03 at 12 34 26 PM" src="https://github.com/user-attachments/assets/6df454b5-9dd2-402c-b341-469653531fe8" />
<img width="1502" height="856" alt="Screenshot 2025-08-03 at 12 34 45 PM" src="https://github.com/user-attachments/assets/441cf0d3-8168-4d5a-9f19-9ee6a20c3a8f" />

## 🏆 Hackathon Impact

### Innovation Goals
- **Decentralized Collaboration**: Enable trustless collaboration through blockchain
- **Community-Driven Development**: Foster organic idea evolution through community input
- **NFT Incentivization**: Create sustainable engagement through digital rewards
- **Cross-Platform Integration**: Bridge traditional hackathon culture with Web3

### Future Roadmap
- **Multi-Chain Support**: Expand beyond Etherlink to other EVM-compatible chains
- **Advanced NFT Features**: Dynamic NFTs that evolve with project success
- **DAO Governance**: Community-driven platform decisions
- **Integration APIs**: Connect with existing hackathon platforms

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Etherlink Team**: For providing the blockchain infrastructure and excellent developer experience
- **Supabase**: For the backend database solution
- **RainbowKit**: For seamless wallet integration
- **shadcn/ui**: For the beautiful component library
- **Open Source Community**: For the amazing tools and libraries

---

**Built with ❤️ for the Etherlink Hackathon | Collab Culture Track**

*Let's grow the future of collaborative innovation together! 🌱*
