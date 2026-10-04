"use client";

import { useEffect, useState } from "react";
import { Contract, BrowserProvider, formatEther, parseEther } from "ethers";
import Navbar from "./components/Navbar";
import DepositModal from "./components/DepositModal"
import { useWallet } from "./hooks/useWallet";
import { CONTRACT_ADDRESS, CONTRACT_ABI, REQUIRED } from "./contracts/config";
import Link from "next/link";


export default function Dashboard() {
  const { address, signer } = useWallet();
  const [balance, setBalance] = useState<string>("0");
  const [owners, setOwners] = useState<string[]>([]);
  const [txCount, setTxCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [showDeposit, setShowDeposit] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const provider = new BrowserProvider(window.ethereum!);
        const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

        const [bal, ownerList, count] = await Promise.all([
          provider.getBalance(CONTRACT_ADDRESS),
          contract.getOwners(),
          contract.getTransactionCount(),
        ]);

        setBalance(formatEther(bal));
        setOwners(ownerList);
        setTxCount(Number(count));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (window.ethereum) fetchData();
  }, [address]);

  const isOwner = address
    ? owners.map((o) => o.toLowerCase()).includes(address.toLowerCase())
    : false;

  const shortAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div className="min-h-screen bg-[#0D1117]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <p className="text-[#00D4AA] text-xs font-bold uppercase tracking-widest mb-1">
            Multisig Wallet
          </p>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        </div>

        {/* Not connected state */}
        {!address && (
          <div className="bg-[#161B27] border border-[#2D3748] rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-[#00D4AA]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
              🔐
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Connect your wallet</h2>
            <p className="text-[#8B949E] text-sm">
              Connect MetaMask to interact with the MultiSig Wallet
            </p>
          </div>
        )}

        {/* Connected state */}
        {address && (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              
              <div className="bg-[#161B27] border border-[#2D3748] rounded-2xl p-6">
                <p className="text-[#8B949E] text-xs font-semibold uppercase tracking-widest mb-3">
                  Wallet Balance
                </p>
                {loading ? (
                  <div className="h-8 w-24 bg-[#2D3748] rounded animate-pulse"></div>
                ) : (
                  <p className="text-3xl font-bold text-white font-mono">
                    {parseFloat(balance).toFixed(4)}
                    <span className="text-[#8B949E] text-lg ml-1">ETH</span>
                  </p>
                )}
                <p className="text-xs text-[#8B949E] mt-2">Sepolia Testnet</p>
              </div>

              <div className="bg-[#161B27] border border-[#2D3748] rounded-2xl p-6">
                <p className="text-[#8B949E] text-xs font-semibold uppercase tracking-widest mb-3">
                  Total Transactions
                </p>
                {loading ? (
                  <div className="h-8 w-16 bg-[#2D3748] rounded animate-pulse"></div>
                ) : (
                  <p className="text-3xl font-bold text-white font-mono">{txCount}</p>
                )}
                <p className="text-xs text-[#8B949E] mt-2">All time proposals</p>
              </div>

              <div className="bg-[#161B27] border border-[#2D3748] rounded-2xl p-6">
                <p className="text-[#8B949E] text-xs font-semibold uppercase tracking-widest mb-3">
                  Threshold
                </p>
                <p className="text-3xl font-bold text-white font-mono">
                  {REQUIRED}
                  <span className="text-[#8B949E] text-lg ml-1">
                    / {owners.length}
                  </span>
                </p>
                <p className="text-xs text-[#8B949E] mt-2">Required approvals</p>
              </div>
            </div>

            {/* Owner status + Owners list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">

              {/* Your status */}
              <div className="bg-[#161B27] border border-[#2D3748] rounded-2xl p-6">
                <p className="text-[#8B949E] text-xs font-semibold uppercase tracking-widest mb-4">
                  Your Status
                </p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${isOwner ? "bg-[#00D4AA]/10" : "bg-[#EF4444]/10"}`}>
                    {isOwner ? "✓" : "✗"}
                  </div>
                  <div>
                    <p className={`font-bold ${isOwner ? "text-[#00D4AA]" : "text-[#EF4444]"}`}>
                      {isOwner ? "Verified Owner" : "Not an Owner"}
                    </p>
                    <p className="text-xs text-[#8B949E] font-mono mt-0.5">
                      {shortAddress(address)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Owners list */}
              <div className="bg-[#161B27] border border-[#2D3748] rounded-2xl p-6">
                <p className="text-[#8B949E] text-xs font-semibold uppercase tracking-widest mb-4">
                  Owners ({owners.length})
                </p>
                <div className="space-y-2">
                  {loading ? (
                    [1, 2].map((i) => (
                      <div key={i} className="h-8 bg-[#2D3748] rounded animate-pulse"></div>
                    ))
                  ) : (
                    owners.map((owner, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#6366F1]/20 flex items-center justify-center text-xs text-[#6366F1] font-bold">
                          {i + 1}
                        </div>
                        <span className="text-sm font-mono text-[#E6EDF3]">
                          {shortAddress(owner)}
                        </span>
                        {owner.toLowerCase() === address.toLowerCase() && (
                          <span className="text-xs bg-[#00D4AA]/10 text-[#00D4AA] px-2 py-0.5 rounded-full">
                            You
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-[#161B27] border border-[#2D3748] rounded-2xl p-6">
              <p className="text-[#8B949E] text-xs font-semibold uppercase tracking-widest mb-4">
                Quick Actions
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/propose"
                  className="px-5 py-2.5 bg-[#00D4AA] text-[#0D1117] text-sm font-bold rounded-xl hover:opacity-90 transition-all"
                >
                  + Propose Transaction
                </Link>
                <Link
                  href="/transactions"
                  className="px-5 py-2.5 border border-[#2D3748] text-sm text-white rounded-xl hover:border-[#4A5568] transition-all"
                >
                  View Pending
                </Link>
                <Link
                  href="/history"
                  className="px-5 py-2.5 border border-[#2D3748] text-sm text-white rounded-xl hover:border-[#4A5568] transition-all"
                >
                  View History
                </Link>

      <button
        onClick={() => setShowDeposit(true)}
        className="px-5 py-2.5 border border-[#00D4AA]/30 text-[#00D4AA] text-sm font-bold rounded-xl hover:bg-[#00D4AA]/10 transition-all"
        >
       + Deposit ETH
     </button>
              </div>
            </div>
          </>
        )}
     {showDeposit && (
      <DepositModal
      onClose={() => setShowDeposit(false)}
      onSuccess={() => window.location.reload()}
       />
     )}
      </div>
    </div>
  );
}