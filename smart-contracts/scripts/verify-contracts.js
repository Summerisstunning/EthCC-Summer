const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🔍 Verifying contracts on Flow Mainnet...");

  // Read latest deployment info
  const deploymentsDir = path.join(__dirname, '../deployments');
  const deploymentFiles = fs.readdirSync(deploymentsDir)
    .filter(f => f.startsWith('flow-mainnet-'))
    .sort()
    .reverse();

  if (deploymentFiles.length === 0) {
    throw new Error("No deployment files found!");
  }

  const latestDeployment = JSON.parse(
    fs.readFileSync(path.join(deploymentsDir, deploymentFiles[0]), 'utf8')
  );

  console.log("📄 Using deployment:", deploymentFiles[0]);
  
  const { contracts } = latestDeployment;

  try {
    // Verify Mock USDC
    console.log("\n1️⃣ Verifying Mock USDC...");
    await hre.run("verify:verify", {
      address: contracts.mockUSDC.address,
      constructorArguments: ["USD Coin on Flow", "USDC", 6],
      contract: "contracts/MockUSDC.sol:MockUSDC"
    });
    console.log("✅ Mock USDC verified");

    // Verify AA Sharing
    console.log("\n2️⃣ Verifying AA Sharing...");
    await hre.run("verify:verify", {
      address: contracts.aaSharing.address,
      constructorArguments: [contracts.mockUSDC.address],
      contract: "contracts/AASharing.sol:AASharing"
    });
    console.log("✅ AA Sharing verified");

    // Verify CrossChain Bridge
    console.log("\n3️⃣ Verifying CrossChain Bridge...");
    await hre.run("verify:verify", {
      address: contracts.crossChainBridge.address,
      constructorArguments: [
        contracts.mockUSDC.address,
        contracts.aaSharing.address,
        latestDeployment.deployer
      ],
      contract: "contracts/CrossChainBridge.sol:CrossChainBridge"
    });
    console.log("✅ CrossChain Bridge verified");

    console.log("\n🎉 All contracts verified successfully!");

  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("ℹ️ Contracts already verified");
    } else {
      console.error("❌ Verification failed:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });