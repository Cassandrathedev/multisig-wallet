# Multisig Wallet dApp

A production-grade multi-signature wallet dApp built with Solidity, Foundry, Next.js and ether.js. Requires X of Y owner approvals before any transaction executes. 
The same security model used by Gnosis Safe and major DAO treasuries.

## Live Demo



## Contract on Etherscan

[View on Sepolia Etherscan](https://sepolia.etherscan.io/address/0xDa4AdA2552B4c4dDf68b99383cC1E3586ffEDD78)

## How It Works

1. **Propose**: Any owner submits a transaction (recipient, amount, data).
2. **Approve**: Other owners review and approve it.
3. **Execute**: Once the approval threshold is met, any owner executes it.
4. **Revoke**: Owners can revoke their approval before execution.
5. **Deposit**: Any owner can deposit ETH to the wallet dashboard at any time.

## Features

- Multi-owner wallet with configurable approval threshold.
- Propose, approve, revoke and execute transactions on-chain.
- Real-time approval progress tracking.
- Deposit ETH directly from the dashboard.
- Transaction history of all executed transfers.
- MetaMask wallet connection with Sepolia network check.
- Reentrancy protection with dual-layer security
- Fully tested smart contract with Foundry.

## Smart Contract Security

- **Reentrancy Guard** - custom nonReentrant modifier blocks reentrant calls
- **Checks-Effects-Interactions** - state updated before external calls
- **Access Control** - all functions gated behind onlyOwner modifier
- **Input Validation** - zero address checks, duplicate owner prevention, threshold validation

## Tech Stack

- **Smart Contract** - Solidity 0.8.20, Foundry
- **Frontend** - Next.js 14, TypeScript, Tailwind CSS
- **Web3** - ethers.js v6
- **Network** - Ethereum Sepolia Testnet


## Getting Started

```bash
# Clone the repo
git clone https://github.com/Cassandrathedev/multisig-wallet.git
cd multisig-wallet

# Run tests
forge test -vv

# Run frontend
cd frontend
npm install
npm run dev
