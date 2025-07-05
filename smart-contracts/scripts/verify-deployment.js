const { ethers } = require('ethers');
require('dotenv').config();

async function verifyDeployment() {
  const provider = new ethers.JsonRpcProvider('https://mainnet.evm.nodes.onflow.org');
  const contractAddress = '0xd81e174058b2922f836c43c9fd4f8c806673346e';
  
  try {
    const code = await provider.getCode(contractAddress);
    const isDeployed = code !== '0x';
    
    console.log('✅ Contract Verification Results:');
    console.log('📍 Contract Address:', contractAddress);
    console.log('🔗 Contract Deployed:', isDeployed ? 'YES' : 'NO');
    console.log('🌐 FlowScan URL:', 'https://evm.flowscan.org/address/' + contractAddress);
    
    if (isDeployed) {
      console.log('🎉 Contract is successfully deployed on Flow Mainnet!');
      
      // Check if this is an AASharing contract
      const aaSharingInterface = new ethers.Interface([
        'function owner() view returns (address)',
        'function usdc() view returns (address)',
        'function totalPartnerships() view returns (uint256)'
      ]);
      
      const contract = new ethers.Contract(contractAddress, aaSharingInterface, provider);
      
      try {
        const owner = await contract.owner();
        const usdc = await contract.usdc();
        const totalPartnerships = await contract.totalPartnerships();
        
        console.log('📊 Contract Details:');
        console.log('   Owner:', owner);
        console.log('   USDC Token:', usdc);
        console.log('   Total Partnerships:', totalPartnerships.toString());
        
      } catch (error) {
        console.log('ℹ️  Could not read contract details (contract might have different interface)');
      }
    } else {
      console.log('❌ Contract not found at this address');
    }
    
  } catch (error) {
    console.error('❌ Error verifying deployment:', error.message);
  }
}

verifyDeployment();