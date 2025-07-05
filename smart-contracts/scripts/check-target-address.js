const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Checking target address balance...");

  const targetAddress = "0x000000000000000000000002D399f1eB0b5CF334";
  
  try {
    const balance = await ethers.provider.getBalance(targetAddress);
    console.log("📍 Target Address:", targetAddress);
    console.log("💰 Balance:", ethers.formatEther(balance), "FLOW");
    
    if (balance > ethers.parseEther("0.1")) {
      console.log("✅ This address has sufficient balance for deployment!");
      console.log("💡 Consider using this address's private key for deployment");
    } else {
      console.log("⚠️ This address has insufficient balance for deployment");
    }

    // Check current configured account
    const [signer] = await ethers.getSigners();
    console.log("\n📱 Current configured account:");
    console.log("   Address:", signer.address);
    
    const currentBalance = await ethers.provider.getBalance(signer.address);
    console.log("   Balance:", ethers.formatEther(currentBalance), "FLOW");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });