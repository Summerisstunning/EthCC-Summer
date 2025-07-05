const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const USDC_ADDRESSES = {
  // Mainnet addresses
  1: "0xA0b86a33E6441A71F3F5F11CB7F17be1abE70E81", // Ethereum
  42161: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // Arbitrum
  747: "0x", // Flow Mainnet - TODO: Add when available
  
  // Testnet addresses  
  545: "0x", // Flow Testnet - TODO: Add when available
  421614: "0x75faf114eafb1BDbe2F0316DF893fd58CF46854E", // Arbitrum Sepolia
  11155111: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // Ethereum Sepolia
};

module.exports = buildModule("AASharing", (m) => {
  // Get network chain ID
  const chainId = parseInt(m.network.config.chainId || 31337);
  
  // Determine USDC address
  let usdcAddress = USDC_ADDRESSES[chainId];
  
  // If no USDC address for this network, deploy mock
  let usdc;
  if (!usdcAddress) {
    console.log(`No USDC address found for chain ${chainId}, deploying mock USDC`);
    usdc = m.contract("MockUSDC", ["USD Coin", "USDC", 6]);
    usdcAddress = usdc;
  } else {
    console.log(`Using existing USDC at ${usdcAddress} for chain ${chainId}`);
  }

  // Deploy AASharing contract
  const aaSharing = m.contract("AASharing", [usdcAddress]);

  return { 
    aaSharing,
    usdc: usdc || usdcAddress,
    chainId 
  };
});