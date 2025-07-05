AA Sharing Project Requirement Document
Project Overview
AA Sharing is a Web3-inspired application designed to help couples, friends, or families record daily gratitude for each other and contribute small amounts to a shared wallet. Users can set shared goals (such as a trip or gift) and track their contributions over time. The project is designed to enhance relationships by recording gratitude, making joint financial decisions, and fulfilling shared dreams.

This document outlines the requirements for both front-end functionality and Web3 integration (Flow, Privy, and Avail).

1. Frontend Pages Requirements
1.1 Homepage (Hero Section)
Functionality:

Display a brief introduction to AA Sharing, its purpose, and the value it provides.

Include a "Start Recording Gratitude" button that leads to the next step.

Text to Display:

Title: "Record Your Love. Share Gratitude. Onchain."

Subtitle: "A shared emotional ledger and wallet — to record love, grow gratitude, and fulfill dreams, onchain."

Call-to-Action buttons: "Join the Waitlist", "Start Recording Gratitude"

Integration Requirements:

Button: "Start Recording Gratitude"

Background Image: A warm image of a couple or family sharing a meaningful moment.

Button Action: On click, navigate to the Gratitude Logging Page (Step 1).

1.2 Gratitude Logging Page (Step 1)
Functionality:

Allow users to log daily gratitude for 1-3 items and specify an optional donation amount (e.g., $1, $5).

Next Button: After logging gratitude and setting an amount, click to proceed to the next page.

Text to Display:

Heading: "Log your gratitude for today."

Instruction: "Record up to 3 things you're grateful for today."

Input Fields: Text inputs for gratitude items, and donation fields for each item.

Integration Requirements:

Input Fields: Allow users to input 1-3 gratitude items.

Amount Fields: Each item has an adjacent input field for donation amounts (e.g., $1, $5). Ensure only valid amounts are entered.

Button: "Next" (clicking will navigate to the Wallet Contribution Page).

Web3 Integration:

Use Privy SDK for wallet login, allowing users to sign transactions for donations.

1.3 Wallet Contribution Page (Step 2)
Functionality:

Display the shared wallet balance.

Allow users to add additional amounts to the shared wallet.

Show the updated balance after each donation, and provide a confirmation button.

Text to Display:

Heading: "Shared Wallet Contribution"

Instruction: "Add an amount to the shared wallet."

Balance Display: Show current wallet balance (e.g., "Wallet balance: $10").

Input Field: Allow users to specify the amount to add to the wallet (e.g., $5).

Button: "Confirm Contribution" (clicking will confirm the donation and proceed to the next page).

Integration Requirements:

Wallet Balance Display: Display the current wallet balance from Flow smart contract.

Amount Field: Users should be able to specify how much to contribute.

Button: After confirmation, update the wallet balance and navigate to the Shared Wallet and Goal Display Page.

Web3 Integration:

Use Flow Smart Contracts to record donations into the shared wallet and update the balance.

Privy SDK for signing and confirming the transaction.

1.4 Shared Wallet and Goal Display Page
Functionality:

Display the current shared wallet balance and goal progress (e.g., "Trip to Bali: $2000 goal").

Show a progress bar indicating how much of the goal has been achieved based on wallet balance.

Provide a "View Wallet" button to allow users to revisit the wallet and see transaction history.

Text to Display:

Heading: "Shared Wallet Balance"

Goal Progress: "Trip to Bali: $2000 goal - $500 collected (25%)"

Balance: Display wallet balance (e.g., "$500").

Progress Bar: Show a visual representation of goal progress.

Button: "View Wallet" (clicking will allow users to see detailed wallet history).

Integration Requirements:

Goal Progress Bar: Display the progress towards the shared goal based on the wallet balance.

Balance Display: Continuously update the wallet balance from Flow smart contract.

Button: Clicking the button shows the full transaction history and wallet details.

Web3 Integration:

Use Flow Smart Contracts to display wallet balances and update progress toward shared goals.

Privy SDK for user authentication and transaction confirmation.

2. Web3 Integration Requirements
2.1 Flow Smart Contracts Integration
Contract Functionality:

Log user donations for daily gratitude entries.

Store contributions in a shared wallet and manage funds.

Implement goal-based funding (e.g., travel funds).

Balance Split: In case of a relationship break-up, automatically split the wallet balance between both parties.

Flow Smart Contract Code Example (Cadence):

cadence
复制
编辑
pub contract AALedger {
    pub var partnerA: Address
    pub var partnerB: Address
    pub var goalAmount: UFix64
    pub var walletBalance: UFix64

    pub fun depositGratitude(amount: UFix64) {
        self.walletBalance = self.walletBalance + amount
    }

    pub fun splitFunds(): [Address: UFix64] {
        let halfBalance = self.walletBalance / 2.0
        let split = { partnerA: halfBalance, partnerB: halfBalance }
        self.walletBalance = 0.0
        return split
    }
}
Integration Requirements:

Deploy the smart contract to Flow Testnet or Mainnet.

Use Flow SDK to interact with the contract, including calling depositGratitude and splitFunds.

2.2 Privy SDK Integration
Functionality:

Enable users to log in using email-based wallet creation via Privy SDK.

Ensure user wallet interactions are secure, with the ability to sign transactions for donations.

Integration Steps:

Install Privy SDK and configure it in the app.

Use Privy Provider to enable wallet login and creation.

js
复制
编辑
import { PrivyProvider } from '@privy-io/react-auth';

<PrivyProvider
  appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID}
  config={{ embeddedWallets: { createOnLogin: true } }}
>
  <YourApp />
</PrivyProvider>
Web3 Integration:

Ensure that all transactions (e.g., gratitude donations, wallet contributions) are confirmed and signed via Privy.

2.3 Avail Nexus SDK Integration
Functionality:

Support cross-chain donations (e.g., moving USDC from Ethereum or Arbitrum to Flow).

Consolidate assets across chains and display unified wallet balances.

Integration Steps:

Install Avail Nexus SDK.

Integrate bridgeAndExecute() method to handle cross-chain transactions.

js
复制
编辑
import { nexus } from '@availproject/avail-nexus';

await nexus.bridgeAndExecute({
  sourceChain: 'ethereum',
  destinationChain: 'flow',
  token: 'usdc',
  amount: 100,
  callData: {
    to: goalSmartContractAddress,
    data: encodeUnlockGoal('Trip to Bali'),
  }
});
Web3 Integration:

Use Avail Nexus SDK to move funds across chains and execute relevant smart contract calls.

3. Backend Requirements (Go)
Backend Functionality:
Handle Donation Requests: Accept user donation requests and interact with Flow contracts.

Manage Wallet State: Track wallet balances and donation amounts for each user.

Cross-Chain Transactions: Use Avail Nexus SDK to handle cross-chain transactions.

Backend Code Example (Go):

go
复制
编辑
package main

import (
    "github.com/ethereum/go-ethereum"
    "github.com/ethereum/go-ethereum/accounts/abi"
    "github.com/ethereum/go-ethereum/common"
    "github.com/ethereum/go-ethereum/ethclient"
)

func main() {
    client, err := ethclient.Dial("https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID")
    if err != nil {
        log.Fatal(err)
    }

    contractAddress := common.HexToAddress("0xYourContractAddress")
    instance, err := abi.JSON(strings.NewReader(YourABI))
    if err != nil {
        log.Fatal(err)
    }

    // Interact with contract
    result, err := instance.Call(client, "functionName", contractAddress, params...)
    if err != nil {
        log.Fatal(err)
    }
}
4. Summary and Timeline
Frontend Functionality:
Login and User Authentication (Privy SDK)

Gratitude Logging and Donations (Frontend Form + Flow Contract)

Shared Wallet and Goal Progress (Flow Contract)

Cross-Chain Donations (Avail Nexus SDK)

Development Steps:
Implement Frontend Pages and Interactivity (Gratitude Logging, Wallet Contributions).

Integrate Privy SDK for wallet login.

Deploy Flow Smart Contracts and integrate with frontend.

Integrate Avail Nexus SDK for cross-chain donations.

Implement Backend Services (Go) to manage wallet operations and smart contract interactions.