const fcl = require("@onflow/fcl");
const { send, decode } = require("@onflow/fcl");

// Configure FCL
fcl.config({
  "accessNode.api": "https://rest-testnet.onflow.org", // Testnet
  "0xFungibleToken": "0x9a0766d93b6608b7", // Testnet FungibleToken
  "0xFlowToken": "0x7e60df042a9c0868", // Testnet FlowToken
});

// Deploy contract transaction
const deployContract = `
transaction(code: String) {
  prepare(acct: AuthAccount) {
    acct.contracts.add(name: "AALedger", code: code.utf8)
  }
}
`;

// Initialize partnership transaction
const initPartnership = `
import AALedger from 0xAALedger

transaction {
  prepare(acct: AuthAccount) {
    // Create partnership collection
    let collection <- AALedger.createPartnershipCollection()
    
    // Save to storage
    acct.save(<-collection, to: AALedger.PartnershipStoragePath)
    
    // Create public capability
    acct.link<&AALedger.PartnershipCollection{AALedger.PartnershipPublic}>(
      AALedger.PartnershipPublicPath,
      target: AALedger.PartnershipStoragePath
    )
  }
}
`;

// Get partnership script
const getPartnership = `
import AALedger from 0xAALedger

pub fun main(account: Address): AALedger.Partnership? {
  let publicRef = AALedger.getPartnershipPublic(account: account)
  return publicRef?.getPartnership()
}
`;

// Deposit gratitude transaction
const depositGratitude = `
import AALedger from 0xAALedger

transaction(content: String, amount: UFix64) {
  prepare(acct: AuthAccount) {
    let partnershipRef = acct.borrow<&AALedger.PartnershipCollection>(
      from: AALedger.PartnershipStoragePath
    ) ?? panic("Partnership collection not found")
    
    // Get the partnership resource (assuming first partnership)
    let keys = partnershipRef.partnerships.keys
    if keys.length > 0 {
      let partnership = partnershipRef.partnerships[keys[0]]
      partnership.depositGratitude(content: content, amount: amount, author: acct.address)
    }
  }
}
`;

// Create goal transaction
const createGoal = `
import AALedger from 0xAALedger

transaction(name: String, description: String, targetAmount: UFix64) {
  prepare(acct: AuthAccount) {
    let partnershipRef = acct.borrow<&AALedger.PartnershipCollection>(
      from: AALedger.PartnershipStoragePath
    ) ?? panic("Partnership collection not found")
    
    let keys = partnershipRef.partnerships.keys
    if keys.length > 0 {
      let partnership = partnershipRef.partnerships[keys[0]]
      partnership.createGoal(name: name, description: description, targetAmount: targetAmount)
    }
  }
}
`;

// Export transactions and scripts
module.exports = {
  deployContract,
  initPartnership,
  getPartnership,
  depositGratitude,
  createGoal,
  fcl
};