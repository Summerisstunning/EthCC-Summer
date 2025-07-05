const { ethers } = require("hardhat");

async function main() {
  console.log("🌐 Deploying AASharing contract to Flow Mainnet EVM...");
  
  // Get the ContractFactory and Signers here.
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy AASharing contract
  const AASharing = await ethers.getContractFactory("AASharing");
  const aaSharing = await AASharing.deploy();
  
  await aaSharing.waitForDeployment();
  
  const contractAddress = await aaSharing.getAddress();
  
  console.log("✅ AASharing contract deployed to:", contractAddress);
  console.log("🔗 View on FlowScan:", `https://evm.flowscan.org/address/${contractAddress}`);
  
  // Save deployment info
  const deploymentInfo = {
    network: "flow-mainnet",
    contractAddress: contractAddress,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    chainId: 747,
    explorer: `https://evm.flowscan.org/address/${contractAddress}`
  };
  
  console.log("\n📋 Deployment Summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  
  // Write deployment info to file
  const fs = require('fs');
  fs.writeFileSync('deployment.json', JSON.stringify(deploymentInfo, null, 2));
  
  console.log("\n💾 Deployment info saved to deployment.json");
  console.log("\n🎉 Ready for hackathon submission! Contract live on Flow Mainnet EVM");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });