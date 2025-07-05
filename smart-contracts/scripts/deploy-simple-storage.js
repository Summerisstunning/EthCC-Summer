const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("🚀 Deploying SimpleStorage Contract to Flow Mainnet");
  console.log("📍 Deployer address:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "FLOW");

  if (balance < ethers.parseEther("0.01")) {
    throw new Error("❌ Insufficient balance! Need at least 0.01 FLOW");
  }

  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log("🌐 Network:", network.name, "Chain ID:", network.chainId.toString());

  console.log("\n📋 Starting SimpleStorage deployment...\n");

  // Deploy SimpleStorage contract
  console.log("1️⃣ Deploying SimpleStorage...");
  const SimpleStorage = await ethers.getContractFactory("SimpleStorage");
  const simpleStorage = await SimpleStorage.deploy();
  await simpleStorage.waitForDeployment();
  
  const storageAddress = await simpleStorage.getAddress();
  console.log("✅ SimpleStorage deployed:", storageAddress);

  // Test basic functionality
  console.log("\n2️⃣ Testing basic functionality...");
  
  // Test storing data
  const testMessages = ["Hello World", "Test Message 2", "Gratitude test"];
  const testTokenAmount = ethers.parseEther("1.5"); // 1.5 tokens
  
  console.log("   Storing test data...");
  const storeTx = await simpleStorage.storeData(testMessages, testTokenAmount);
  await storeTx.wait();
  console.log("   ✅ Test data stored successfully");
  
  // Verify stored data
  const userData = await simpleStorage.getMyData();
  console.log("   📊 Stored messages:", userData[0]);
  console.log("   💰 Stored token amount:", ethers.formatEther(userData[1]), "tokens");
  console.log("   🕒 Timestamp:", new Date(Number(userData[2]) * 1000).toISOString());

  // Test adding a single message
  console.log("\n   Adding single message...");
  const addTx = await simpleStorage.addMessage("Single message test");
  await addTx.wait();
  console.log("   ✅ Single message added");

  // Check message count
  const messageCount = await simpleStorage.getMessageCount(deployer.address);
  console.log("   📝 Total messages:", messageCount.toString());

  // Calculate costs
  const finalBalance = await ethers.provider.getBalance(deployer.address);
  const gasUsed = balance - finalBalance;
  console.log("\n3️⃣ Deployment costs:");
  console.log("   Gas used:", ethers.formatEther(gasUsed), "FLOW");
  console.log("   Remaining:", ethers.formatEther(finalBalance), "FLOW");

  // Save deployment info
  const deploymentInfo = {
    network: "Flow Mainnet",
    chainId: "747",
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contract: {
      name: "SimpleStorage",
      address: storageAddress,
      verified: false
    },
    gasUsed: ethers.formatEther(gasUsed),
    testData: {
      messagesStored: testMessages.length,
      tokenAmount: ethers.formatEther(testTokenAmount),
      totalMessages: messageCount.toString()
    }
  };

  console.log("\n🎉 SimpleStorage deployment completed!");
  console.log("\n📋 Contract Address:");
  console.log("└── SimpleStorage:", storageAddress);

  console.log("\n🔗 FlowScan URL:");
  console.log("└── https://flowscan.org/address/" + storageAddress);

  console.log("\n📝 Next Steps:");
  console.log("1. Verify contract on FlowScan");
  console.log("2. Update frontend with contract address");
  console.log("3. Test with frontend interface");
  console.log("4. Add more test data");

  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ SimpleStorage deployment failed:", error);
    process.exit(1);
  });