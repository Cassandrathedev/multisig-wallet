"use client";

import { useState } from "react";
import { parseEther } from "ethers";
import { CONTRACT_ADDRESS } from "../contracts/config";
import { useWallet } from "../hooks/useWallet";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function DepositModal({ onClose, onSuccess }: Props) {
  const { signer } = useWallet();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDeposit() {
    if (!signer || !amount) return;
    setLoading(true);
    setError(null);

    try {
      const tx = await signer.sendTransaction({
        to: CONTRACT_ADDRESS,
        value: parseEther(amount),
      });
      await tx.wait();
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.reason || err.message || "Deposit failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4">
      <div className="bg-[#161B27] border border-[#2D3748] rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Deposit ETH</h2>
          <button
            onClick={onClose}
            className="text-[#8B949E] hover:text-white transition-all"
          >
            ✕
          </button>
        </div>

        <p className="text-[#8B949E] text-sm mb-5">
          Send ETH from your wallet to the MultiSig contract.
        </p>

        <div className="mb-4">
          <label className="block text-xs font-bold text-[#8B949E] uppercase tracking-widest mb-2">
            Amount (ETH)
          </label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.001"
              step="0.001"
              min="0"
              className="w-full bg-[#0D1117] border border-[#2D3748] rounded-xl px-4 py-3 text-white text-sm font-mono placeholder-[#4A5568] focus:outline-none focus:border-[#00D4AA] transition-all pr-16"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8B949E] text-sm font-semibold">
              ETH
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl text-sm text-[#EF4444]">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-[#2D3748] text-sm text-[#8B949E] rounded-xl hover:border-[#4A5568] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleDeposit}
            disabled={loading || !amount}
            className="flex-1 py-3 bg-[#00D4AA] text-[#0D1117] text-sm font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
          >
            {loading ? "Depositing..." : "Deposit"}
          </button>
        </div>
      </div>
    </div>
  );
}