"use client";

import { useWallet } from "../hooks/useWallet";
import Link from "next/link";

export default function Navbar() {
  const { address, isConnecting, error, connect, disconnect } = useWallet();

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : null;

  return (
    <nav className="border-b border-[#2D3748] bg-[#0D1117] sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#00D4AA] flex items-center justify-center text-[#0D1117] font-bold text-sm">
            M
          </div>
          <span className="font-bold text-white text-lg">MultiSig</span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          <Link href="/" className="px-4 py-2 text-sm text-[#8B949E] hover:text-white rounded-lg hover:bg-[#161B27] transition-all">
            Dashboard
          </Link>
          <Link href="/transactions" className="px-4 py-2 text-sm text-[#8B949E] hover:text-white rounded-lg hover:bg-[#161B27] transition-all">
            Transactions
          </Link>
          <Link href="/propose" className="px-4 py-2 text-sm text-[#8B949E] hover:text-white rounded-lg hover:bg-[#161B27] transition-all">
            Propose
          </Link>
          <Link href="/history" className="px-4 py-2 text-sm text-[#8B949E] hover:text-white rounded-lg hover:bg-[#161B27] transition-all">
            History
          </Link>
        </div>

        {/* Wallet Button */}
        <div className="flex items-center gap-3">
          {error && (
            <span className="text-xs text-red-400">{error}</span>
          )}
          {address ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-[#161B27] border border-[#2D3748] rounded-lg px-3 py-2">
                <div className="w-2 h-2 rounded-full bg-[#00D4AA] animate-pulse"></div>
                <span className="text-sm text-white font-mono">{shortAddress}</span>
              </div>
              <button
                onClick={disconnect}
                className="px-3 py-2 text-sm text-[#8B949E] hover:text-white border border-[#2D3748] rounded-lg hover:border-[#4A5568] transition-all"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={connect}
              disabled={isConnecting}
              className="px-4 py-2 text-sm font-semibold bg-[#00D4AA] text-[#0D1117] rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
            >
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}