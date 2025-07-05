const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Testing Flow Mainnet connection...");

  try {
    // Get network info
    const network = await ethers.provider.getNetwork();
    console.log("✅ Connected to network:");
    console.log("   Name:", network.name);
    console.log("   Chain ID:", network.chainId.toString());
    
    // Get latest block
    const blockNumber = await ethers.provider.getBlockNumber();
    console.log("   Latest block:", blockNumber);
    
    // Get gas price
    try {
      const feeData = await ethers.provider.getFeeData();
      console.log("   Gas price:", ethers.formatUnits(feeData.gasPrice || "1000000000", "gwei"), "Gwei");
    } catch (e) {
      console.log("   Gas price: Unable to fetch");
    }

    if (network.chainId === 747n) {
      console.log("🎉 Successfully connected to Flow Mainnet!");
    } else {
      console.log("⚠️ Connected to different network, expected Flow Mainnet (747)");
    }

    // Test if we have an account configured
    try {
      const signers = await ethers.getSigners();
      if (signers.length > 0) {
        const signer = signers[0];
        console.log("\n💰 Account info:");
        console.log("   Address:", signer.address);
        
        const balance = await ethers.provider.getBalance(signer.address);
        console.log("   Balance:", ethers.formatEther(balance), "FLOW");
        
        if (balance < ethers.parseEther("0.1")) {
          console.log("⚠️ Low balance! Need at least 0.1 FLOW for deployment");
          console.log("   Current balance:", ethers.formatEther(balance), "FLOW");
          console.log("   Required balance: 0.1 FLOW");
        } else {
          console.log("✅ Sufficient balance for deployment");
        }
      } else {
        console.log("\n⚠️ No signers found");
      }
    } catch (error) {
      console.log("\n⚠️ Account error:", error.message);
    }

  } catch (error) {
    console.error("❌ Connection failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });