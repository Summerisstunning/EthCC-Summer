const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("🚀 Minimal AA Sharing Deployment to Flow Mainnet");
  console.log("📍 Deployer address:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "FLOW");

  if (balance < ethers.parseEther("0.05")) {
    throw new Error("❌ Insufficient balance! Need at least 0.05 FLOW");
  }

  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log("🌐 Network:", network.name, "Chain ID:", network.chainId.toString());

  console.log("\n📋 Starting minimal deployment...\n");

  // 1. Deploy Mock USDC only
  console.log("1️⃣ Deploying Mock USDC...");
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
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

  // Skip bridge for minimal deployment

  // 3. Basic setup
  console.log("\n3️⃣ Basic setup...");
  
  // Mint some USDC for testing
  const testSupply = ethers.parseUnits("100000", 6); // 100k USDC
  await mockUSDC.mint(deployer.address, testSupply);
  console.log("   Minted 100k USDC for testing");

  // 4. Verification
  console.log("\n4️⃣ Verifying deployments...");
  const owner = await aaSharing.owner();
  const usdcToken = await aaSharing.usdc();
  console.log("   AA Sharing owner:", owner);
  console.log("   AA Sharing USDC:", usdcToken);

  // 5. Calculate costs
  const finalBalance = await ethers.provider.getBalance(deployer.address);
  const gasUsed = balance - finalBalance;
  console.log("\n5️⃣ Deployment costs:");
  console.log("   Gas used:", ethers.formatEther(gasUsed), "FLOW");
  console.log("   Remaining:", ethers.formatEther(finalBalance), "FLOW");

  // Save minimal deployment info
  const deploymentInfo = {
    network: "Flow Mainnet",
    chainId: "747",
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    deploymentType: "minimal",
    contracts: {
      mockUSDC: {
        address: usdcAddress,
        name: "Mock USDC",
        verified: false
      },
      aaSharing: {
        address: aaSharingAddress,
        owner: owner,
        verified: false
      }
    },
    gasUsed: ethers.formatEther(gasUsed),
    notes: "Minimal deployment - Bridge contract not deployed due to gas constraints"
  };

  console.log("\n🎉 Minimal deployment completed!");
  console.log("\n📋 Contract Addresses:");
  console.log("├── Mock USDC:", usdcAddress);
  console.log("└── AA Sharing:", aaSharingAddress);

  console.log("\n🔗 FlowScan URLs:");
  console.log("├── USDC: https://flowscan.org/address/" + usdcAddress);
  console.log("└── AA Sharing: https://flowscan.org/address/" + aaSharingAddress);

  console.log("\n📝 Next Steps:");
  console.log("1. Verify contracts on FlowScan");
  console.log("2. Test basic partnership functionality");
  console.log("3. Deploy bridge when more FLOW available");
  console.log("4. Integrate with frontend");

  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Minimal deployment failed:", error);
    process.exit(1);
  });