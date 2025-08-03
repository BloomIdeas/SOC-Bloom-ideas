import { expect } from "chai";
import { ethers } from "hardhat";
import { GardenArtNFT } from "../typechain-types";
import { ZeroAddress } from "ethers";

describe("GardenArtNFT", function () {
  let gardenArtNFT: GardenArtNFT;
  let owner: any;
  let user: any;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    const GardenArtNFT = await ethers.getContractFactory("GardenArtNFT");
    gardenArtNFT = await GardenArtNFT.deploy();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await gardenArtNFT.owner()).to.equal(owner.address);
    });

    it("Should start with token counter at 0", async function () {
      expect(await gardenArtNFT.tokenCounter()).to.equal(0);
    });
  });

  describe("Minting", function () {
    it("Should mint NFT successfully", async function () {
      const idea = "Test Idea";
      const description = "Test Description";
      const minterName = "Test User";

      await expect(
        gardenArtNFT.mintArt(user.address, idea, description, minterName)
      )
        .to.emit(gardenArtNFT, "ArtMinted")
        .withArgs(1, user.address, idea, minterName);

      expect(await gardenArtNFT.tokenCounter()).to.equal(1);
      expect(await gardenArtNFT.ownerOf(1)).to.equal(user.address);
    });

    it("Should fail if non-owner tries to mint", async function () {
      await expect(
        gardenArtNFT.connect(user).mintArt(user.address, "Test", "Test", "Test")
      ).to.be.revertedWithCustomError(gardenArtNFT, "OwnableUnauthorizedAccount");
    });

    it("Should fail with empty idea", async function () {
      await expect(
        gardenArtNFT.mintArt(user.address, "", "Test", "Test")
      ).to.be.revertedWith("Idea cannot be empty");
    });

    it("Should fail with empty description", async function () {
      await expect(
        gardenArtNFT.mintArt(user.address, "Test", "", "Test")
      ).to.be.revertedWith("Description cannot be empty");
    });

    it("Should fail with empty minter name", async function () {
      await expect(
        gardenArtNFT.mintArt(user.address, "Test", "Test", "")
      ).to.be.revertedWith("Minter name cannot be empty");
    });

    it("Should fail with zero address", async function () {
      await expect(
        gardenArtNFT.mintArt(ZeroAddress, "Test", "Test", "Test")
      ).to.be.revertedWith("Invalid recipient");
    });
  });

  describe("Token URI", function () {
    beforeEach(async function () {
      await gardenArtNFT.mintArt(user.address, "Test Idea", "Test Description", "Test User");
    });

    it("Should return valid token URI", async function () {
      const tokenURI = await gardenArtNFT.tokenURI(1);
      expect(tokenURI).to.startWith("data:application/json;base64,");
    });

    it("Should fail for non-existent token", async function () {
      await expect(gardenArtNFT.tokenURI(999)).to.be.revertedWith("Token does not exist");
    });
  });

  describe("Multiple Mints", function () {
    it("Should increment token counter correctly", async function () {
      await gardenArtNFT.mintArt(user.address, "Idea 1", "Desc 1", "User 1");
      await gardenArtNFT.mintArt(user.address, "Idea 2", "Desc 2", "User 2");
      await gardenArtNFT.mintArt(user.address, "Idea 3", "Desc 3", "User 3");

      expect(await gardenArtNFT.tokenCounter()).to.equal(3);
      expect(await gardenArtNFT.ownerOf(1)).to.equal(user.address);
      expect(await gardenArtNFT.ownerOf(2)).to.equal(user.address);
      expect(await gardenArtNFT.ownerOf(3)).to.equal(user.address);
    });
  });
}); 