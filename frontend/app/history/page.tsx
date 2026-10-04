"use client";

import { useEffect, useState } from "react";
import { Contract, BrowserProvider, formatEther } from "ethers";
import Navbar from "../components/Navbar";
import { useWallet } from "../hooks/useWallet";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../contracts/config";

interface Transaction {
  id: number;
  to: string;
  value: string;
  data: string;
  executed: boolean;
  approvalCount: number;
}

export default function History() {
  const { address } = useWallet();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      if (!window.ethereum) return;

      try {
        const provider = new BrowserProvider(window.ethereum);
        const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        const count = Number(await contract.getTransactionCount());

        const txs: Transaction[] = [];
        for (let i = 0; i < count; i++) {
          const tx = await contract.getTransaction(i);
          if (tx.executed) {
            txs.push({
              id: i,
              to: tx.to,
              value: tx.value.toString(),
              data: tx.data,
              executed: tx.executed,
              approvalCount: Number(tx.approvalCount),
            });
          }
        }

        setTransactions(txs.reverse());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [address]);

  const shortAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div className="min-h-screen bg-[#0D1117]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <p className="text-[#00D4AA] text-xs font-bold uppercase tracking-widest mb-1">
            Completed
          </p>
          <h1 className="text-3xl font-bold text-white">History</h1>
          <p className="text-[#8B949E] text-sm mt-2">
            All executed transactions from this wallet.
          </p>
        </div>

        {!address && (
          <div className="bg-[#161B27] border border-[#2D3748] rounded-2xl p-12 text-center">
            <p className="text-[#8B949E]">
              Connect your wallet to view transaction history.
            </p>
          </div>
        )}

        {address && loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-[#161B27] border border-[#2D3748] rounded-2xl p-6 animate-pulse"
              >
                <div className="h-4 bg-[#2D3748] rounded w-1/3 mb-3"></div>
                <div className="h-3 bg-[#2D3748] rounded w-1/2"></div>
              </div>
            ))}
          </div>
        )}

        {address && !loading && transactions.length === 0 && (
          <div className="bg-[#161B27] border border-[#2D3748] rounded-2xl p-12 text-center">
            <div className="text-4xl mb-4">📂</div>
            <h2 className="text-lg font-bold text-white mb-2">
              No executed transactions yet
            </h2>
            <p className="text-[#8B949E] text-sm">
              Executed transactions will appear here.
            </p>
          </div>
        )}

        {address && !loading && transactions.length > 0 && (
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="bg-[#161B27] border border-[#2D3748] rounded-2xl p-6"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-mono bg-[#2D3748] text-[#8B949E] px-2 py-0.5 rounded">
                        TX #{tx.id}
                      </span>
                      <span className="text-xs bg-[#00D4AA]/10 text-[#00D4AA] border border-[#00D4AA]/20 px-2 py-0.5 rounded-full font-semibold">
                        ✓ Executed
                      </span>
                    </div>
                    <p className="text-white font-mono text-sm mt-2">
                      To:{" "}
                      <span className="text-[#E6EDF3]">
                        {shortAddress(tx.to)}
                      </span>
                    </p>
                    <p className="text-[#8B949E] text-sm mt-1">
                      Value:{" "}
                      <span className="text-white font-mono">
                        {formatEther(tx.value)} ETH
                      </span>
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-white font-mono">
                      {tx.approvalCount}
                    </p>
                    <p className="text-xs text-[#8B949E]">approvals</p>
                  </div>
                </div>

                {tx.data && tx.data !== "0x" && (
                  <div className="mt-4 pt-4 border-t border-[#2D3748]">
                    <p className="text-xs font-bold text-[#8B949E] uppercase tracking-widest mb-1">
                      Data
                    </p>
                    <p className="text-xs font-mono text-[#8B949E] break-all">
                      {tx.data}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}