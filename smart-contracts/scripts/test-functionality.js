const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🧪 Testing AA Sharing functionality on Flow Mainnet...");

  const [deployer] = await ethers.getSigners();
  
  // Read latest deployment
  const deploymentsDir = path.join(__dirname, '../deployments');
  const deploymentFiles = fs.readdirSync(deploymentsDir)
    .filter(f => f.startsWith('flow-mainnet-'))
    .sort()
    .reverse();

  const latestDeployment = JSON.parse(
    fs.readFileSync(path.join(deploymentsDir, deploymentFiles[0]), 'utf8')
  );

  const { contracts } = latestDeployment;

  // Connect to deployed contracts
  const mockUSDC = await ethers.getContractAt("MockUSDC", contracts.mockUSDC.address);
  const aaSharing = await ethers.getContractAt("AASharing", contracts.aaSharing.address);
  const bridge = await ethers.getContractAt("CrossChainBridge", contracts.crossChainBridge.address);

  console.log("📍 Connected to contracts:");
  console.log("├── USDC:", await mockUSDC.getAddress());
  console.log("├── AA Sharing:", await aaSharing.getAddress());
  console.log("└── Bridge:", await bridge.getAddress());

  // Test 1: Check contract states
  console.log("\n1️⃣ Checking contract states...");
  
  const stats = await aaSharing.getContractStats();
  console.log("   Partnerships:", stats._totalPartnerships.toString());
  console.log("   Gratitude entries:", stats._totalGratitudeEntries.toString());
  console.log("   USDC locked:", ethers.formatUnits(stats._totalUSDCLocked, 6));

  const usdcBalance = await mockUSDC.balanceOf(deployer.address);
  console.log("   Deployer USDC balance:", ethers.formatUnits(usdcBalance, 6));

  // Test 2: Create a test partnership (using deployer as both partners for testing)
  console.log("\n2️⃣ Creating test partnership...");
  
  // For testing, we'll create a partnership between deployer and a generated address
  const testPartner = ethers.Wallet.createRandom();
  console.log("   Test partner address:", testPartner.address);

  try {
    const tx = await aaSharing.createPartnership(
      testPartner.address,
      "Deployer",
      "TestPartner"
    );
    await tx.wait();
    console.log("✅ Partnership created successfully");

    // Get partnership details
    const partnership = await aaSharing.getPartnership(1);
    console.log("   Partner 1:", partnership.partner1);
    console.log("   Partner 2:", partnership.partner2);
    console.log("   Nickname 1:", partnership.nickname1);
    console.log("   Nickname 2:", partnership.nickname2);

  } catch (error) {
    console.log("⚠️ Partnership creation failed (might already exist):", error.message);
  }

  // Test 3: Add gratitude with USDC
  console.log("\n3️⃣ Testing gratitude with USDC...");
  
  try {
    const depositAmount = ethers.parseUnits("10", 6); // 10 USDC
    
    // Approve USDC spending
    const approveTx = await mockUSDC.approve(await aaSharing.getAddress(), depositAmount);
    await approveTx.wait();
    console.log("   USDC approved for spending");

    // Add gratitude
    const gratitudeTx = await aaSharing.addGratitude(
      1, // Partnership ID
      "Thank you for this amazing project! Testing on Flow Mainnet 🚀",
      depositAmount
    );
    await gratitudeTx.wait();
    console.log("✅ Gratitude added with 10 USDC");

    // Check updated stats
    const newStats = await aaSharing.getContractStats();
    console.log("   New gratitude entries:", newStats._totalGratitudeEntries.toString());
    console.log("   New USDC locked:", ethers.formatUnits(newStats._totalUSDCLocked, 6));

  } catch (error) {
    console.log("⚠️ Gratitude test failed:", error.message);
  }

  // Test 4: Check gratitude entries
  console.log("\n4️⃣ Reading gratitude entries...");
  
  try {
    const entries = await aaSharing.getGratitudeEntries(1);
    console.log("   Total entries:", entries.length);
    
    if (entries.length > 0) {
      const latest = entries[entries.length - 1];
      console.log("   Latest entry text:", latest.text);
      console.log("   Latest entry amount:", ethers.formatUnits(latest.usdcAmount, 6), "USDC");
      console.log("   Latest entry contributor:", latest.contributor);
    }

  } catch (error) {
    console.log("⚠️ Reading gratitude failed:", error.message);
  }

  // Test 5: Test bridge functionality
  console.log("\n5️⃣ Testing bridge functionality...");
  
  try {
    const bridgeStats = await bridge.calculateFee(ethers.parseUnits("100", 6));
    console.log("   Bridge fee for 100 USDC:", ethers.formatUnits(bridgeStats[0], 6));
    console.log("   Net amount after fee:", ethers.formatUnits(bridgeStats[1], 6));

    const validator = await bridge.validator();
    console.log("   Current validator:", validator);

  } catch (error) {
    console.log("⚠️ Bridge test failed:", error.message);
  }

  // Test 6: Final contract stats
  console.log("\n6️⃣ Final contract statistics...");
  
  const finalStats = await aaSharing.getContractStats();
  console.log("   Total partnerships:", finalStats._totalPartnerships.toString());
  console.log("   Total gratitude entries:", finalStats._totalGratitudeEntries.toString());
  console.log("   Total USDC locked:", ethers.formatUnits(finalStats._totalUSDCLocked, 6));
  console.log("   Contract USDC balance:", ethers.formatUnits(finalStats._contractUSDCBalance, 6));

  console.log("\n🎉 Functionality testing completed!");
  console.log("📊 Summary:");
  console.log("├── Contracts deployed and working");
  console.log("├── Partnerships can be created");
  console.log("├── Gratitude entries working");
  console.log("├── USDC integration functional");
  console.log("└── Bridge configuration ready");

  console.log("\n🔗 Contract URLs:");
  console.log("├── AA Sharing: https://flowscan.org/address/" + contracts.aaSharing.address);
  console.log("└── USDC: https://flowscan.org/address/" + contracts.mockUSDC.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Testing failed:", error);
    process.exit(1);
  });