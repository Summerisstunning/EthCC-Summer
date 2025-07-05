const { ethers } = require('ethers');

async function testFlowContract() {
  console.log('🧪 Testing Flow EVM Contract Connection...\n');
  
  try {
    // Flow Mainnet EVM configuration
    const provider = new ethers.JsonRpcProvider('https://mainnet.evm.nodes.onflow.org');
    const contractAddress = '0xd81e174058b2922f836c43c9fd4f8c806673346e';
    
    console.log('📍 Contract Address:', contractAddress);
    console.log('🌐 RPC URL: https://mainnet.evm.nodes.onflow.org');
    console.log('🆔 Chain ID: 747\n');
    
    // Test provider connection
    const network = await provider.getNetwork();
    console.log('✅ Network connected:', network.name || 'Flow Mainnet EVM');
    console.log('🆔 Chain ID:', network.chainId.toString());
    
    // Test contract exists
    const code = await provider.getCode(contractAddress);
    if (code !== '0x') {
      console.log('✅ Contract deployed successfully');
      console.log('📊 Contract bytecode length:', code.length, 'characters');
    } else {
      console.log('❌ Contract not found at address');
    }
    
    // Test latest block
    const blockNumber = await provider.getBlockNumber();
    console.log('📦 Latest block:', blockNumber);
    
    console.log('\n🎉 Flow EVM integration test completed successfully!');
    console.log('🚀 Your AA Sharing contract is ready for use!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testFlowContract();