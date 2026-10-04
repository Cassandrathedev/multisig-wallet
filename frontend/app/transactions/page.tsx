"use client";

import { useEffect, useState } from "react";
import { Contract, BrowserProvider } from "ethers";
import Navbar from "../components/Navbar";
import { useWallet } from "../hooks/useWallet";
import { CONTRACT_ADDRESS, CONTRACT_ABI, REQUIRED } from "../contracts/config";

interface Transaction {
  id: number;
  to: string;
  value: string;
  data: string;
  executed: boolean;
  approvalCount: number;
  hasApproved: boolean;
}

export default function Transactions() {
  const { address, signer } = useWallet();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  async function fetchTransactions() {
    if (!window.ethereum || !address) return;

    try {
      const provider = new BrowserProvider(window.ethereum);
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const count = Number(await contract.getTransactionCount());

      const txs: Transaction[] = [];
      for (let i = 0; i < count; i++) {
        const tx = await contract.getTransaction(i);
        const hasApproved = await contract.hasApproved(i, address);

        if (!tx.executed) {
          txs.push({
            id: i,
            to: tx.to,
            value: tx.value.toString(),
            data: tx.data,
            executed: tx.executed,
            approvalCount: Number(tx.approvalCount),
            hasApproved,
          });
        }
      }

      setTransactions(txs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTransactions();
  }, [address]);

  async function handleApprove(txId: number) {
    if (!signer) return;
    setActionLoading(txId);
    try {
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.approve(txId);
      await tx.wait();
      setMessage({ type: "success", text: "Transaction approved successfully!" });
      fetchTransactions();
    } catch (err: any) {
      setMessage({ type: "error", text: err.reason || "Approval failed." });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRevoke(txId: number) {
    if (!signer) return;
    setActionLoading(txId);
    try {
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.revoke(txId);
      await tx.wait();
      setMessage({ type: "success", text: "Approval revoked." });
      fetchTransactions();
    } catch (err: any) {
      setMessage({ type: "error", text: err.reason || "Revoke failed." });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleExecute(txId: number) {
    if (!signer) return;
    setActionLoading(txId);
    try {
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.execute(txId);
      await tx.wait();
      setMessage({ type: "success", text: "Transaction executed successfully!" });
      fetchTransactions();
    } catch (err: any) {
      setMessage({ type: "error", text: err.reason || "Execution failed." });
    } finally {
      setActionLoading(null);
    }
  }

  const shortAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const formatValue = (val: string) => {
    const eth = Number(val) / 1e18;
    return eth.toFixed(6);
  };

  return (
    <div className="min-h-screen bg-[#0D1117]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <p className="text-[#00D4AA] text-xs font-bold uppercase tracking-widest mb-1">
            Pending
          </p>
          <h1 className="text-3xl font-bold text-white">Transactions</h1>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl text-sm font-medium ${
            message.type === "success"
              ? "bg-[#00D4AA]/10 text-[#00D4AA] border border-[#00D4AA]/20"
              : "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20"
          }`}>
            {message.text}
            <button onClick={() => setMessage(null)} className="ml-4 opacity-60 hover:opacity-100">✕</button>
          </div>
        )}

        {!address && (
          <div className="bg-[#161B27] border border-[#2D3748] rounded-2xl p-12 text-center">
            <p className="text-[#8B949E]">Connect your wallet to view transactions.</p>
          </div>
        )}

        {address && loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#161B27] border border-[#2D3748] rounded-2xl p-6 animate-pulse">
                <div className="h-4 bg-[#2D3748] rounded w-1/3 mb-3"></div>
                <div className="h-3 bg-[#2D3748] rounded w-1/2"></div>
              </div>
            ))}
          </div>
        )}

        {address && !loading && transactions.length === 0 && (
          <div className="bg-[#161B27] border border-[#2D3748] rounded-2xl p-12 text-center">
            <div className="text-4xl mb-4">📭</div>
            <h2 className="text-lg font-bold text-white mb-2">No pending transactions</h2>
            <p className="text-[#8B949E] text-sm">All caught up! Propose a new transaction to get started.</p>
          </div>
        )}

        {address && !loading && transactions.length > 0 && (
          <div className="space-y-4">
            {transactions.map((tx) => {
              const canExecute = tx.approvalCount >= REQUIRED;
              const isLoading = actionLoading === tx.id;

              return (
                <div key={tx.id} className="bg-[#161B27] border border-[#2D3748] rounded-2xl p-6">
                  
                  {/* Top row */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono bg-[#2D3748] text-[#8B949E] px-2 py-0.5 rounded">
                          TX #{tx.id}
                        </span>
                        {canExecute && (
                          <span className="text-xs bg-[#00D4AA]/10 text-[#00D4AA] px-2 py-0.5 rounded-full font-semibold">
                            Ready to execute
                          </span>
                        )}
                      </div>
                      <p className="text-white font-mono text-sm mt-2">
                        To: {shortAddress(tx.to)}
                      </p>
                      <p className="text-[#8B949E] text-sm mt-1">
                        Value: <span className="text-white font-mono">{formatValue(tx.value)} ETH</span>
                      </p>
                    </div>

                    {/* Approval progress */}
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white font-mono">
                        {tx.approvalCount}
                        <span className="text-[#8B949E] text-base">/{REQUIRED}</span>
                      </p>
                      <p className="text-xs text-[#8B949E]">approvals</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-[#2D3748] rounded-full h-1.5 mb-4">
                    <div
                      className="h-1.5 rounded-full bg-[#00D4AA] transition-all"
                      style={{ width: `${Math.min((tx.approvalCount / REQUIRED) * 100, 100)}%` }}
                    ></div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    {!tx.hasApproved ? (
                      <button
                        onClick={() => handleApprove(tx.id)}
                        disabled={isLoading}
                        className="px-4 py-2 bg-[#00D4AA] text-[#0D1117] text-sm font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
                      >
                        {isLoading ? "Processing..." : "Approve"}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRevoke(tx.id)}
                        disabled={isLoading}
                        className="px-4 py-2 border border-[#EF4444]/30 text-[#EF4444] text-sm font-semibold rounded-xl hover:bg-[#EF4444]/10 transition-all disabled:opacity-50"
                      >
                        {isLoading ? "Processing..." : "Revoke"}
                      </button>
                    )}

                    {canExecute && (
                      <button
                        onClick={() => handleExecute(tx.id)}
                        disabled={isLoading}
                        className="px-4 py-2 bg-[#6366F1] text-white text-sm font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
                      >
                        {isLoading ? "Executing..." : "Execute"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}