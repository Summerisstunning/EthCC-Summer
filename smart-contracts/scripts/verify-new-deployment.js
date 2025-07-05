const { ethers } = require('ethers');
require('dotenv').config();

async function verifyNewDeployment() {
  const provider = new ethers.JsonRpcProvider('https://mainnet.evm.nodes.onflow.org');
  
  // Contract addresses from deployment
  const contracts = {
    mockUSDC: '0x49f6B4bE035f86C4C8F6785c39Ca6b26ed60A07E',
    aaSharing: '0xC5EbC476BA2C9fb014b74C017211AbACFa80210c',
    bridge: '0xF49b526BB6687a962a86D9737a773b158a0C2C05'
  };
  
  console.log('🔍 Verifying newly deployed contracts...\n');
  
  for (const [name, address] of Object.entries(contracts)) {
    try {
      const code = await provider.getCode(address);
      const isDeployed = code !== '0x';
      
      console.log(`📍 ${name.toUpperCase()}:`);
      console.log(`   Address: ${address}`);
      console.log(`   Deployed: ${isDeployed ? '✅ YES' : '❌ NO'}`);
      console.log(`   FlowScan: https://flowscan.org/address/${address}`);
      console.log('');
      
    } catch (error) {
      console.error(`❌ Error checking ${name}:`, error.message);
    }
  }
  
  // Test AA Sharing contract functions
  console.log('🧪 Testing AA Sharing contract functions...');
  try {
    const aaSharingInterface = new ethers.Interface([
      'function owner() view returns (address)',
      'function usdc() view returns (address)',
      'function totalPartnerships() view returns (uint256)',
      'function bridgeContract() view returns (address)'
    ]);
    
    const aaSharing = new ethers.Contract(contracts.aaSharing, aaSharingInterface, provider);
    
    const owner = await aaSharing.owner();
    const usdc = await aaSharing.usdc();
    const totalPartnerships = await aaSharing.totalPartnerships();
    const bridgeContract = await aaSharing.bridgeContract();
    
    console.log('✅ AA Sharing Contract Details:');
    console.log(`   Owner: ${owner}`);
    console.log(`   USDC Token: ${usdc}`);
    console.log(`   Total Partnerships: ${totalPartnerships}`);
    console.log(`   Bridge Contract: ${bridgeContract}`);
    console.log('');
    
  } catch (error) {
    console.error('❌ Error testing AA Sharing functions:', error.message);
  }
  
  console.log('🎉 Verification completed!');
}

verifyNewDeployment();