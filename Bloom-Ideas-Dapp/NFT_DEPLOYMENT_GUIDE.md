# NFT Deployment Guide for Bloom Ideas

This guide will help you deploy the GardenArtNFT contract and integrate it with the Bloom Ideas application.

## Prerequisites

1. **Node.js** (v18 or higher)
2. **npm** or **yarn**
3. **MetaMask** or compatible wallet
4. **Etherlink Testnet XTZ** for gas fees

## Step 1: Deploy the Smart Contract

### 1.1 Navigate to Contracts Directory
```bash
cd contracts
```

### 1.2 Install Dependencies
```bash
npm install
```

### 1.3 Set Up Environment Variables
```bash
cp env.example .env
```

Edit `.env` with your configuration:
```env
PRIVATE_KEY=your_private_key_here
ETHERLINK_RPC_URL=https://node.ghostnet.etherlink.com
ETHERLINK_EXPLORER_URL=https://testnet.explorer.etherlink.com
```

**Important**: 
- Remove the `0x` prefix from your private key
- Never commit your private key to version control
- Use a dedicated wallet for deployment

### 1.4 Compile the Contract
```bash
npm run compile
```

### 1.5 Deploy to Etherlink Testnet
```bash
npm run deploy
```

The deployment will output something like:
```
Deploying GardenArtNFT contract...
GardenArtNFT deployed to: 0x1234567890abcdef...
Contract deployed and verified!
```

**Save this contract address** - you'll need it for the frontend configuration.

## Step 2: Configure Frontend

### 2.1 Update Environment Variables

Create or update your `.env.local` file in the root directory:

```env
# NFT Contract Configuration
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=your_deployed_contract_address_here

# Existing variables...
NEXT_PUBLIC_WC_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_ALCHEMY_MAINNET_RPC=your_alchemy_rpc_url
```

### 2.2 Install Additional Dependencies

The NFT functionality requires these additional packages (already added to package.json):

```bash
npm install
```

## Step 3: Test the Integration

### 3.1 Start the Development Server
```bash
npm run dev
```

### 3.2 Test NFT Minting

1. Connect your wallet to Etherlink Testnet
2. Navigate to the submit page
3. Fill out and submit an idea
4. Approve the NFT minting transaction
5. Check your profile page to see the minted NFT

## Step 4: Verify Contract (Optional)

### 4.1 Verify on Etherlink Explorer

```bash
npm run verify -- --contract-address YOUR_CONTRACT_ADDRESS
```

### 4.2 View on Explorer

Visit `https://testnet.explorer.etherlink.com/address/YOUR_CONTRACT_ADDRESS`

## Troubleshooting

### Common Issues

1. **"Insufficient funds"**
   - Ensure your wallet has XTZ for gas fees on Etherlink testnet
   - Get testnet XTZ from a faucet

2. **"Contract not initialized"**
   - Check that `NEXT_PUBLIC_NFT_CONTRACT_ADDRESS` is set correctly
   - Ensure the contract is deployed to the correct network

3. **"User rejected transaction"**
   - User cancelled the transaction in their wallet
   - Try again and ensure wallet is connected to Etherlink testnet

4. **"Failed to mint NFT"**
   - Check browser console for detailed error messages
   - Ensure wallet is connected and has sufficient funds
   - Verify contract address is correct

### Debug Mode

Enable debug logging by adding to your `.env.local`:

```env
NEXT_PUBLIC_DEBUG=true
```

## Security Considerations

1. **Private Key Security**
   - Never expose your deployment private key
   - Use a dedicated wallet for contract deployment
   - Consider using a hardware wallet for production

2. **Access Control**
   - Only the contract owner can mint NFTs
   - Consider implementing additional access controls for production

3. **Gas Optimization**
   - The contract is optimized for gas efficiency
   - Monitor gas usage during deployment and minting

## Production Deployment

For production deployment:

1. Deploy to Etherlink mainnet (when available)
2. Update environment variables with mainnet addresses
3. Implement additional security measures
4. Consider using a multisig wallet for contract ownership

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Ensure wallet is connected to the correct network
4. Check that the contract is deployed and verified

## Features Implemented

✅ **Smart Contract**: GardenArtNFT with generative SVG art
✅ **NFT Minting**: Automatic minting when ideas are submitted
✅ **NFT Gallery**: Display user's NFTs in profile
✅ **On-chain Metadata**: All NFT data stored on-chain
✅ **Garden Theme**: Fractal tree art with garden colors
✅ **Error Handling**: Comprehensive error handling and user feedback
✅ **Loading States**: Proper loading states for all NFT operations
✅ **Responsive Design**: Mobile-friendly NFT gallery

The NFT functionality is now fully integrated into the Bloom Ideas application! 