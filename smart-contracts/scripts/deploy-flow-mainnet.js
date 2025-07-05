const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("🚀 Deploying AA Sharing to Flow Mainnet");
  console.log("📍 Deployer address:", deployer.address);
  
  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "FLOW");
  
  if (balance < ethers.parseEther("0.1")) {
    console.warn("⚠️  Low balance! Need at least 0.1 FLOW for deployment");
  }

  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log("🌐 Network:", network.name, "Chain ID:", network.chainId.toString());
  
  if (network.chainId !== 747n) {
    throw new Error("❌ Not connected to Flow Mainnet! Expected chain ID 747");
  }

  console.log("\n📋 Starting deployment...\n");

  // 1. Deploy Mock USDC (since Flow might not have native USDC yet)
  console.log("1️⃣ Deploying Mock USDC...");
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  
  // Deploy with proper decimals for USDC
  const mockUSDC = await MockUSDC.deploy("USD Coin on Flow", "USDC", 6);
  await mockUSDC.waitForDeployment();
  
  const usdcAddress = await mockUSDC.getAddress();
  console.log("✅ Mock USDC deployed:", usdcAddress);

  // 2. Deploy AASharing main contract
  console.log("\n2️⃣ Deploying AA Sharing contract...");
  const AASharing = await ethers.getContractFactory("AASharing");
  const aaSharing = await AASharing.deploy(usdcAddress);
  await aaSharing.waitForDeployment();
  
  const aaSharingAddress = await aaSharing.getAddress();
  console.log("✅ AA Sharing deployed:", aaSharingAddress);

  // 3. Deploy CrossChain Bridge
  console.log("\n3️⃣ Deploying CrossChain Bridge...");
  const CrossChainBridge = await ethers.getContractFactory("CrossChainBridge");
  
  // Use deployer as initial validator (can be changed later)
  const bridge = await CrossChainBridge.deploy(
    usdcAddress,
    aaSharingAddress,
    deployer.address // Initial validator
  );
  await bridge.waitForDeployment();
  
  const bridgeAddress = await bridge.getAddress();
  console.log("✅ CrossChain Bridge deployed:", bridgeAddress);

  // 4. Verify deployments
  console.log("\n4️⃣ Verifying deployments...");
  
  // Check AA Sharing contract
  const owner = await aaSharing.owner();
  const usdcToken = await aaSharing.usdc();
  console.log("   AA Sharing owner:", owner);
  console.log("   AA Sharing USDC:", usdcToken);
  
  // Check Bridge contract
  const bridgeValidator = await bridge.validator();
  const bridgeAAContract = await bridge.aaSharing();
  console.log("   Bridge validator:", bridgeValidator);
  console.log("   Bridge AA contract:", bridgeAAContract);

  // 5. Initial setup
  console.log("\n5️⃣ Initial contract setup...");
  
  // Mint some initial USDC for testing (1M USDC)
  const initialSupply = ethers.parseUnits("1000000", 6);
  await mockUSDC.mint(deployer.address, initialSupply);
  console.log("   Minted 1M USDC to deployer for testing");

  // Set bridge fee to 0.1% (10 basis points)
  await bridge.setBridgeFee(10);
  console.log("   Set bridge fee to 0.1%");

  // 6. Calculate gas costs
  console.log("\n6️⃣ Deployment costs:");
  const finalBalance = await ethers.provider.getBalance(deployer.address);
  const gasUsed = balance - finalBalance;
  console.log("   Total gas used:", ethers.formatEther(gasUsed), "FLOW");
  console.log("   Remaining balance:", ethers.formatEther(finalBalance), "FLOW");

  // 7. Save deployment info
  const deploymentInfo = {
    network: "Flow Mainnet",
    chainId: "747",
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      mockUSDC: {
        address: usdcAddress,
        name: "Mock USDC",
        symbol: "USDC",
        decimals: 6
      },
      aaSharing: {
        address: aaSharingAddress,
        owner: owner,
        usdcToken: usdcToken
      },
      crossChainBridge: {
        address: bridgeAddress,
        validator: bridgeValidator,
        aaContract: bridgeAAContract,
        fee: "0.1%"
      }
    },
    gasUsed: ethers.formatEther(gasUsed),
    deploymentCost: `${ethers.formatEther(gasUsed)} FLOW`
  };

  // Save to file
  const deploymentPath = path.join(__dirname, '../deployments');
  if (!fs.existsSync(deploymentPath)) {
    fs.mkdirSync(deploymentPath, { recursive: true });
  }
  
  const filename = `flow-mainnet-${Date.now()}.json`;
  fs.writeFileSync(
    path.join(deploymentPath, filename),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n🎉 Deployment completed successfully!");
  console.log("📄 Deployment info saved to:", filename);
  
  console.log("\n📋 Contract Addresses:");
  console.log("├── Mock USDC:", usdcAddress);
  console.log("├── AA Sharing:", aaSharingAddress);
  console.log("└── CrossChain Bridge:", bridgeAddress);

  console.log("\n🔗 Flow Scanner URLs:");
  console.log("├── Mock USDC: https://flowscan.org/address/" + usdcAddress);
  console.log("├── AA Sharing: https://flowscan.org/address/" + aaSharingAddress);
  console.log("└── Bridge: https://flowscan.org/address/" + bridgeAddress);

  console.log("\n✨ Next Steps:");
  console.log("1. Verify contracts on FlowScan");
  console.log("2. Update frontend with contract addresses");
  console.log("3. Test basic functionality");
  console.log("4. Set up monitoring and alerts");

  return deploymentInfo;
}

// Handle errors gracefully
main()
  .then((info) => {
    console.log("\n🏁 Deployment process completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });