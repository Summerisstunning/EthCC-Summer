require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const FLOW_PRIVATE_KEY = process.env.FLOW_PRIVATE_KEY || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    "flow-mainnet": {
      url: "https://mainnet.evm.nodes.onflow.org",
      accounts: FLOW_PRIVATE_KEY ? [FLOW_PRIVATE_KEY] : [],
      chainId: 747
    },
    "flow-testnet": {
      url: "https://testnet.evm.nodes.onflow.org", 
      accounts: FLOW_PRIVATE_KEY ? [FLOW_PRIVATE_KEY] : [],
      chainId: 545
    }
  },
  etherscan: {
    customChains: [
      {
        network: "flow-mainnet",
        chainId: 747,
        urls: {
          apiURL: "https://evm.flowscan.org/api",
          browserURL: "https://evm.flowscan.org"
        }
      }
    ]
  }
};