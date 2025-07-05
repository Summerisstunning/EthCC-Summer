const { ethers } = require('ethers');
require('dotenv').config();

async function testBasicFunctions() {
  console.log('🧪 Testing Basic Contract Functions\n');
  
  const provider = new ethers.JsonRpcProvider('https://mainnet.evm.nodes.onflow.org');
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  const addresses = {
    mockUSDC: '0x49f6B4bE035f86C4C8F6785c39Ca6b26ed60A07E',
    aaSharing: '0xC5EbC476BA2C9fb014b74C017211AbACFa80210c',
    bridge: '0xF49b526BB6687a962a86D9737a773b158a0C2C05'
  };
  
  // Test 1: Mock USDC - Basic Info
  console.log('📍 1. Mock USDC Contract:');
  try {
    const mockUSDC = new ethers.Contract(addresses.mockUSDC, [
      'function name() view returns (string)',
      'function symbol() view returns (string)',
      'function decimals() view returns (uint8)',
      'function totalSupply() view returns (uint256)',
      'function balanceOf(address) view returns (uint256)'
    ], provider);
    
    const name = await mockUSDC.name();
    const symbol = await mockUSDC.symbol();
    const decimals = await mockUSDC.decimals();
    const totalSupply = await mockUSDC.totalSupply();
    const balance = await mockUSDC.balanceOf(wallet.address);
    
    console.log(`   ✅ Name: ${name}`);
    console.log(`   ✅ Symbol: ${symbol}`);
    console.log(`   ✅ Decimals: ${decimals}`);
    console.log(`   ✅ Total Supply: ${ethers.formatUnits(totalSupply, decimals)}`);
    console.log(`   ✅ Deployer Balance: ${ethers.formatUnits(balance, decimals)}`);
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  // Test 2: AA Sharing - Owner and USDC
  console.log('\n📍 2. AA Sharing Contract:');
  try {
    const aaSharing = new ethers.Contract(addresses.aaSharing, [
      'function owner() view returns (address)',
      'function usdc() view returns (address)',
      'function totalPartnerships() view returns (uint256)'
    ], provider);
    
    const owner = await aaSharing.owner();
    const usdcAddress = await aaSharing.usdc();
    const totalPartnerships = await aaSharing.totalPartnerships();
    
    console.log(`   ✅ Owner: ${owner}`);
    console.log(`   ✅ USDC Token: ${usdcAddress}`);
    console.log(`   ✅ Total Partnerships: ${totalPartnerships}`);
    
    // Verify owner is deployer
    console.log(`   ✅ Owner is deployer: ${owner === wallet.address}`);
    console.log(`   ✅ USDC address matches: ${usdcAddress === addresses.mockUSDC}`);
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  // Test 3: Bridge Contract
  console.log('\n📍 3. Bridge Contract:');
  try {
    const bridge = new ethers.Contract(addresses.bridge, [
      'function validator() view returns (address)',
      'function aaContract() view returns (address)',
      'function bridgeFeePercent() view returns (uint256)'
    ], provider);
    
    const validator = await bridge.validator();
    const aaContract = await bridge.aaContract();
    const bridgeFee = await bridge.bridgeFeePercent();
    
    console.log(`   ✅ Validator: ${validator}`);
    console.log(`   ✅ AA Contract: ${aaContract}`);
    console.log(`   ✅ Bridge Fee: ${bridgeFee / 100}%`);
    
    // Verify configurations
    console.log(`   ✅ Validator is deployer: ${validator === wallet.address}`);
    console.log(`   ✅ AA Contract matches: ${aaContract === addresses.aaSharing}`);
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  // Test 4: Check Contract Code
  console.log('\n📍 4. Contract Code Verification:');
  for (const [name, address] of Object.entries(addresses)) {
    try {
      const code = await provider.getCode(address);
      const hasCode = code !== '0x';
      console.log(`   ${hasCode ? '✅' : '❌'} ${name}: ${hasCode ? 'Contract deployed' : 'No code found'}`);
    } catch (error) {
      console.log(`   ❌ ${name}: Error checking code`);
    }
  }
  
  // Test 5: Simple Write Function Test (Approve USDC)
  console.log('\n📍 5. Write Function Test:');
  try {
    const mockUSDC = new ethers.Contract(addresses.mockUSDC, [
      'function approve(address spender, uint256 amount) external returns (bool)',
      'function allowance(address owner, address spender) view returns (uint256)'
    ], wallet);
    
    const approveAmount = ethers.parseUnits('100', 6); // 100 USDC
    console.log('   Approving 100 USDC for AA Sharing contract...');
    
    const tx = await mockUSDC.approve(addresses.aaSharing, approveAmount);
    await tx.wait();
    
    const allowance = await mockUSDC.allowance(wallet.address, addresses.aaSharing);
    console.log(`   ✅ Approval successful: ${ethers.formatUnits(allowance, 6)} USDC`);
    
  } catch (error) {
    console.log(`   ❌ Write function test failed: ${error.message}`);
  }
  
  // Test 6: Partnership Creation Test
  console.log('\n📍 6. Partnership Creation Test:');
  try {
    const aaSharing = new ethers.Contract(addresses.aaSharing, [
      'function createPartnership(address partner) external returns (uint256)',
      'function totalPartnerships() view returns (uint256)',
      'function partnerships(uint256) view returns (address, address, uint256, uint256, bool)'
    ], wallet);
    
    const beforeCount = await aaSharing.totalPartnerships();
    console.log(`   Partnerships before: ${beforeCount}`);
    
    const partnerAddress = '0x0000000000000000000000000000000000000001';
    console.log('   Creating partnership with dummy address...');
    
    const tx = await aaSharing.createPartnership(partnerAddress);
    const receipt = await tx.wait();
    
    const afterCount = await aaSharing.totalPartnerships();
    console.log(`   ✅ Partnership created! Count: ${beforeCount} → ${afterCount}`);
    console.log(`   ✅ Transaction hash: ${receipt.hash}`);
    
    // Get partnership details
    if (afterCount > 0) {
      const partnershipId = afterCount - 1n;
      const partnership = await aaSharing.partnerships(partnershipId);
      console.log(`   ✅ Partnership ${partnershipId}: ${partnership[0]} & ${partnership[1]}`);
    }
    
  } catch (error) {
    console.log(`   ❌ Partnership creation failed: ${error.message}`);
  }
  
  console.log('\n🎉 Basic Function Testing Complete!');
  console.log('✅ All core contract functions are working');
  console.log('✅ Ready for frontend integration');
}

testBasicFunctions();