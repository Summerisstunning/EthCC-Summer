# EthCC-Summer
# 💖 AA Sharing

> _"A shared emotional ledger and wallet — to record love, grow gratitude, and fulfill dreams, onchain."_

AA Sharing is a consumer-facing Web3 application that helps couples, families, or close friends record what they are grateful for in each other daily, contribute small stablecoin amounts into a shared wallet, and work toward shared goals like traveling together or buying a gift. It brings intimacy and transparency into financial + emotional relationships — powered by **Flow**, **Privy**, and **Avail Nexus SDK**.

---


## 🧩 How It Works

1. **Create a Shared Ledger**
   - Two people connect via wallet/email (using [Privy](https://privy.io)).
   - A joint "Gratitude Ledger" is created.

2. **Daily Gratitude Logging**
   - Each user logs 1–3 things they feel grateful for, with an optional USDC amount (e.g. “She brought me soup – $2”).

3. **Joint Wallet & Shared Goals**
   - Gratitude amounts go into a shared wallet.
   - Users can create goal-based milestones like “Trip to Bali – $2000”.

4. **Cross-chain Support**
   - Users can use wallets on **different chains** (e.g. Arbitrum and Ethereum) and still contribute to the same shared wallet — powered by [Avail Nexus SDK](https://docs.availproject.org/).

5. **Split or Celebrate**
   - If users choose to end the relationship, the smart contract lets them fairly split the wallet.
   - If a goal is reached, they can "unlock" the funds and plan the event — and optionally **mint an NFT** memory using **Flow**.

---

## 🛠️ Tech Stack

| Layer        | Stack |
|-------------|-------|
| Frontend     | Next.js + Tailwind CSS |
| Wallet Auth  | **Privy SDK** |
| Smart Contract Platform | **Flow (EVM)** |
| Cross-chain Fund Routing | **Avail Nexus SDK** |
| Stablecoin | USDC / ETH-native stablecoins |

---

## 🧪 Core SDK Integrations

### 🔐 1. Privy — Embedded Wallet + Auth

We used Privy to handle **email-based embedded wallet creation** and **authentication**, enabling even non-crypto-native users to participate.

**Integration Steps:**

```ts
import { PrivyProvider } from '@privy-io/react-auth';

<PrivyProvider
  appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID}
  config={{ embeddedWallets: { createOnLogin: true } }}
>
  <YourApp />
</PrivyProvider>
