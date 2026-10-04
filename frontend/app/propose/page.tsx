"use client";

import { useState } from "react";
import { Contract, parseEther } from "ethers";
import Navbar from "../components/Navbar";
import { useWallet } from "../hooks/useWallet";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../contracts/config";
import Link from "next/link";

export default function Propose() {
  const { address, signer } = useWallet();
  const [to, setTo] = useState("");
  const [value, setValue] = useState("");
  const [data, setData] = useState("0x");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);
  const [txId, setTxId] = useState<number | null>(null);

  async function handlePropose(e: React.FormEvent) {
    e.preventDefault();
    if (!signer) return;

    setLoading(true);
    setMessage(null);

    try {
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const valueInWei = value ? parseEther(value) : BigInt(0);
      const txData = data || "0x";

      const tx = await contract.propose(to, valueInWei, txData);
      const receipt = await tx.wait();

      // Get the transaction ID from the event
      const event = receipt.logs[0];
      const proposedTxId = Number(event.topics[1]);
      setTxId(proposedTxId);

      setMessage({
        type: "success",
        text: `Transaction proposed successfully! TX ID: #${proposedTxId}`,
      });

      setTo("");
      setValue("");
      setData("0x");
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.reason || err.message || "Failed to propose transaction.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0D1117]">
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <p className="text-[#00D4AA] text-xs font-bold uppercase tracking-widest mb-1">
            New
          </p>
          <h1 className="text-3xl font-bold text-white">Propose Transaction</h1>
          <p className="text-[#8B949E] text-sm mt-2">
            Submit a transaction for the other owners to review and approve.
          </p>
        </div>

        {!address && (
          <div className="bg-[#161B27] border border-[#2D3748] rounded-2xl p-12 text-center">
            <div className="text-4xl mb-4">🔐</div>
            <p className="text-[#8B949E]">Connect your wallet to propose a transaction.</p>
          </div>
        )}

        {address && (
          <>
            {/* Message */}
            {message && (
              <div className={`mb-6 p-4 rounded-xl text-sm font-medium ${
                message.type === "success"
                  ? "bg-[#00D4AA]/10 text-[#00D4AA] border border-[#00D4AA]/20"
                  : "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20"
              }`}>
                {message.text}
                {txId !== null && message.type === "success" && (
                  <div className="mt-3">
                    <Link
                      href="/transactions"
                      className="text-[#00D4AA] underline text-sm font-semibold"
                    >
                      View pending transactions →
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Form */}
            <div className="bg-[#161B27] border border-[#2D3748] rounded-2xl p-6">
              <form onSubmit={handlePropose} className="space-y-5">

                {/* To Address */}
                <div>
                  <label className="block text-xs font-bold text-[#8B949E] uppercase tracking-widest mb-2">
                    Recipient Address
                  </label>
                  <input
                    type="text"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="0x..."
                    required
                    className="w-full bg-[#0D1117] border border-[#2D3748] rounded-xl px-4 py-3 text-white text-sm font-mono placeholder-[#4A5568] focus:outline-none focus:border-[#00D4AA] transition-all"
                  />
                  <p className="text-xs text-[#8B949E] mt-1">
                    The wallet address that will receive the ETH.
                  </p>
                </div>

                {/* Value */}
                <div>
                  <label className="block text-xs font-bold text-[#8B949E] uppercase tracking-widest mb-2">
                    Amount (ETH)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder="0.0"
                      step="0.0001"
                      min="0"
                      className="w-full bg-[#0D1117] border border-[#2D3748] rounded-xl px-4 py-3 text-white text-sm font-mono placeholder-[#4A5568] focus:outline-none focus:border-[#00D4AA] transition-all pr-16"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8B949E] text-sm font-semibold">
                      ETH
                    </span>
                  </div>
                  <p className="text-xs text-[#8B949E] mt-1">
                    Leave empty or 0 for contract interactions with no ETH transfer.
                  </p>
                </div>

                {/* Data */}
                <div>
                  <label className="block text-xs font-bold text-[#8B949E] uppercase tracking-widest mb-2">
                    Data (optional)
                  </label>
                  <input
                    type="text"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    placeholder="0x"
                    className="w-full bg-[#0D1117] border border-[#2D3748] rounded-xl px-4 py-3 text-white text-sm font-mono placeholder-[#4A5568] focus:outline-none focus:border-[#00D4AA] transition-all"
                  />
                  <p className="text-xs text-[#8B949E] mt-1">
                    For simple ETH transfers leave as 0x. For contract calls paste the encoded calldata.
                  </p>
                </div>

                {/* Summary */}
                {(to || value) && (
                  <div className="bg-[#0D1117] border border-[#2D3748] rounded-xl p-4">
                    <p className="text-xs font-bold text-[#8B949E] uppercase tracking-widest mb-3">
                      Summary
                    </p>
                    {to && (
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-[#8B949E]">To</span>
                        <span className="text-white font-mono">
                          {to.slice(0, 6)}...{to.slice(-4)}
                        </span>
                      </div>
                    )}
                    {value && (
                      <div className="flex justify-between text-sm">
                        <span className="text-[#8B949E]">Amount</span>
                        <span className="text-[#00D4AA] font-mono font-bold">
                          {value} ETH
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#00D4AA] text-[#0D1117] text-sm font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {loading ? "Submitting..." : "Submit Proposal"}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}