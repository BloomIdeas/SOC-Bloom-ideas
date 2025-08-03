import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
  console.log("Deploying GardenArtNFT contract...");

  const GardenArtNFT = await ethers.getContractFactory("GardenArtNFT");
  const gardenArtNFT = await GardenArtNFT.deploy();

  await gardenArtNFT.waitForDeployment();

  const address = await gardenArtNFT.getAddress();
  console.log("GardenArtNFT deployed to:", address);

  // Verify the contract on Etherlink explorer
  console.log("Waiting for block confirmations...");
  await gardenArtNFT.deploymentTransaction()?.wait(6);
  console.log("Contract deployed and verified!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 