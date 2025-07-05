const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));

  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log("Network:", network.name, "Chain ID:", network.chainId.toString());

  let usdcAddress;

  // Use real USDC addresses for mainnet/testnet, deploy mock for local
  if (network.chainId === 747n) {
    // Flow Mainnet - Replace with actual USDC address when available
    console.log("Deploying on Flow Mainnet");
    usdcAddress = "0x"; // TODO: Add real Flow USDC address
  } else if (network.chainId === 545n) {
    // Flow Testnet - Replace with actual USDC address when available
    console.log("Deploying on Flow Testnet");
    usdcAddress = "0x"; // TODO: Add real Flow testnet USDC address
  } else if (network.chainId === 42161n) {
    // Arbitrum Mainnet
    console.log("Deploying on Arbitrum Mainnet");
    usdcAddress = "0xA0b86a33E6441A71F3F5F11CB7F17be1abE70E81"; // USDC on Arbitrum
  } else if (network.chainId === 1n) {
    // Ethereum Mainnet
    console.log("Deploying on Ethereum Mainnet");
    usdcAddress = "0xA0b86a33E6441A71F3F5F11CB7F17be1abE70E81"; // USDC on Ethereum
  } else {
    // Local network or unknown - deploy mock USDC
    console.log("Deploying Mock USDC for testing");
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    const mockUSDC = await MockUSDC.deploy("USD Coin", "USDC", 6);
    await mockUSDC.waitForDeployment();
    usdcAddress = await mockUSDC.getAddress();
    console.log("Mock USDC deployed to:", usdcAddress);
  }

  // Deploy AASharing contract
  console.log("Deploying AASharing contract...");
  const AASharing = await ethers.getContractFactory("AASharing");
  const aaSharing = await AASharing.deploy(usdcAddress);
  await aaSharing.waitForDeployment();

  const aaAddress = await aaSharing.getAddress();
  console.log("AASharing deployed to:", aaAddress);

  // Verify deployment
  console.log("\nVerifying deployment...");
  const owner = await aaSharing.owner();
  const usdcToken = await aaSharing.usdc();
  
  console.log("Contract owner:", owner);
  console.log("USDC token address:", usdcToken);
  console.log("Deployment successful!");

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    aaSharing: aaAddress,
    usdc: usdcAddress,
    deployer: deployer.address,
    deployedAt: new Date().toISOString()
  };

  console.log("\nDeployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  return deploymentInfo;
}

// Handle script execution
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = main;