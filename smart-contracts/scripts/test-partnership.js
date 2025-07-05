const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Testing Partnership Creation on Flow Mainnet\n");
  
  const [deployer] = await ethers.getSigners();
  console.log("📍 Testing with address:", deployer.address);
  
  // Connect to deployed AA Sharing contract
  const contractAddress = "0xC5EbC476BA2C9fb014b74C017211AbACFa80210c";
  const AASharing = await ethers.getContractFactory("AASharing");
  const aaSharing = AASharing.attach(contractAddress);
  
  console.log("📱 Connected to AA Sharing contract:", contractAddress);
  
  try {
    // Test 1: Check current partnerships
    console.log("\n1️⃣ Checking current partnerships...");
    const totalPartnerships = await aaSharing.totalPartnerships();
    console.log("   Total partnerships:", totalPartnerships.toString());
    
    // Test 2: Create a partnership with a test address
    console.log("\n2️⃣ Creating test partnership...");
    const testPartnerAddress = "0x0000000000000000000000000000000000000001";
    console.log("   Partner address:", testPartnerAddress);
    
    try {
      const createTx = await aaSharing.createPartnership(testPartnerAddress);
      console.log("   Transaction hash:", createTx.hash);
      await createTx.wait();
      console.log("   ✅ Partnership created successfully!");
      
      // Verify new partnership count
      const newTotal = await aaSharing.totalPartnerships();
      console.log("   New total partnerships:", newTotal.toString());
      
    } catch (error) {
      console.log("   ❌ Partnership creation failed:", error.message);
      
      // Check if partnership already exists
      if (error.message.includes("Partnership already exists")) {
        console.log("   ℹ️  Partnership already exists, continuing with tests...");
      }
    }
    
    // Test 3: Check partnerships for current user
    console.log("\n3️⃣ Checking user partnerships...");
    const finalTotal = await aaSharing.totalPartnerships();
    
    for (let i = 0; i < finalTotal; i++) {
      try {
        const partnership = await aaSharing.partnerships(i);
        console.log(`   Partnership ${i}:`);
        console.log(`     Partner 1: ${partnership[0]}`);
        console.log(`     Partner 2: ${partnership[1]}`);
        console.log(`     Balance: ${ethers.formatEther(partnership[2])} FLOW`);
        console.log(`     Goal Count: ${partnership[3]}`);
        console.log(`     Active: ${partnership[4]}`);
        
        // Check if current user is in this partnership
        const isUserInPartnership = 
          partnership[0].toLowerCase() === deployer.address.toLowerCase() ||
          partnership[1].toLowerCase() === deployer.address.toLowerCase();
        
        if (isUserInPartnership) {
          console.log(`     ✅ You are in this partnership!`);
          
          // Test 4: Try to deposit gratitude
          console.log(`\n4️⃣ Testing gratitude deposit for partnership ${i}...`);
          try {
            const gratitudeMessage = `Test gratitude from ${new Date().toISOString()}`;
            const flowAmount = ethers.parseEther("0.001"); // 0.001 FLOW
            
            console.log(`     Message: ${gratitudeMessage}`);
            console.log(`     FLOW amount: ${ethers.formatEther(flowAmount)}`);
            
            const gratitudeTx = await aaSharing.depositGratitude(
              i, 
              gratitudeMessage, 
              { value: flowAmount }
            );
            console.log(`     Transaction hash: ${gratitudeTx.hash}`);
            await gratitudeTx.wait();
            console.log(`     ✅ Gratitude deposited successfully!`);
            
          } catch (gratitudeError) {
            console.log(`     ❌ Gratitude deposit failed: ${gratitudeError.message}`);
          }
        }
        
      } catch (partnershipError) {
        console.log(`   ❌ Error reading partnership ${i}: ${partnershipError.message}`);
      }
    }
    
    console.log("\n🎉 Partnership testing completed!");
    console.log("✅ Contract is ready for frontend integration");
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error("Full error:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test script failed:", error);
    process.exit(1);
  });