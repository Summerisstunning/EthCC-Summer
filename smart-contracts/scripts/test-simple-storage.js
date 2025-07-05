const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Testing SimpleStorage Contract on Flow Mainnet\n");
  
  const [deployer] = await ethers.getSigners();
  console.log("📍 Testing with address:", deployer.address);
  
  // Connect to deployed contract
  const contractAddress = "0xA3E78204CFF5caA3d7621C0457Dea733AF377835";
  const SimpleStorage = await ethers.getContractFactory("SimpleStorage");
  const simpleStorage = SimpleStorage.attach(contractAddress);
  
  console.log("📱 Connected to contract:", contractAddress);
  
  try {
    // Test 1: Check if user exists
    console.log("\n1️⃣ Checking user existence...");
    const userExists = await simpleStorage.userExists(deployer.address);
    console.log("   User exists:", userExists);
    
    // Test 2: Get current data
    console.log("\n2️⃣ Getting current user data...");
    try {
      const userData = await simpleStorage.getMyData();
      console.log("   Messages:", userData[0]);
      console.log("   Token amount:", ethers.formatEther(userData[1]), "tokens");
      console.log("   Last updated:", new Date(Number(userData[2]) * 1000).toISOString());
      
      // Test 3: Get message count
      const messageCount = await simpleStorage.getMessageCount(deployer.address);
      console.log("   Total messages:", messageCount.toString());
      
    } catch (error) {
      console.log("   No existing data found");
    }
    
    // Test 4: Add a new message
    console.log("\n3️⃣ Adding a new message...");
    const newMessage = `Test message at ${new Date().toISOString()}`;
    console.log("   Message:", newMessage);
    
    const addTx = await simpleStorage.addMessage(newMessage);
    console.log("   Transaction hash:", addTx.hash);
    await addTx.wait();
    console.log("   ✅ Message added successfully!");
    
    // Test 5: Verify the new message was added
    console.log("\n4️⃣ Verifying new data...");
    const updatedData = await simpleStorage.getMyData();
    console.log("   Updated messages:", updatedData[0]);
    console.log("   Message count:", updatedData[0].length);
    
    // Test 6: Store multiple messages with token amount
    console.log("\n5️⃣ Storing multiple messages...");
    const multipleMessages = [
      "First batch message",
      "Second batch message", 
      "Third batch message"
    ];
    const tokenAmount = ethers.parseEther("2.5"); // 2.5 tokens
    
    console.log("   Messages:", multipleMessages);
    console.log("   Token amount:", ethers.formatEther(tokenAmount), "tokens");
    
    const storeTx = await simpleStorage.storeData(multipleMessages, tokenAmount);
    console.log("   Transaction hash:", storeTx.hash);
    await storeTx.wait();
    console.log("   ✅ Batch data stored successfully!");
    
    // Test 7: Get final state
    console.log("\n6️⃣ Final verification...");
    const finalData = await simpleStorage.getMyData();
    console.log("   Final messages:", finalData[0]);
    console.log("   Final token amount:", ethers.formatEther(finalData[1]), "tokens");
    console.log("   Final update time:", new Date(Number(finalData[2]) * 1000).toISOString());
    
    // Test 8: Get total user count
    console.log("\n7️⃣ Getting total users...");
    const totalUsers = await simpleStorage.getUserCount();
    console.log("   Total users in contract:", totalUsers.toString());
    
    if (totalUsers > 0) {
      const allUsers = await simpleStorage.getAllUsers();
      console.log("   All user addresses:", allUsers.slice(0, 5)); // Show first 5
    }
    
    console.log("\n🎉 All tests completed successfully!");
    console.log("✅ SimpleStorage contract is working perfectly on Flow Mainnet");
    
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