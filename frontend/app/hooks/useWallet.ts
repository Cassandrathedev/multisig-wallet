"use client";

import { useState, useEffect, useCallback } from "react";
import { BrowserProvider, JsonRpcSigner } from "ethers";

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setError("MetaMask not found. Please install it.");
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);

      const provider = new BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);

      const network = await provider.getNetwork();
      if (network.chainId !== BigInt(11155111)) {
        setError("Please switch to Sepolia testnet.");
        setIsConnecting(false);
        return;
      }

      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      setSigner(signer);
      setAddress(address);
    } catch (err: any) {
      setError(err.message || "Failed to connect wallet.");
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setSigner(null);
  }, []);

  // Auto-reconnect on page load
  useEffect(() => {
    if (window.ethereum) {
      const provider = new BrowserProvider(window.ethereum);
      provider.listAccounts().then((accounts) => {
        if (accounts.length > 0) connect();
      });

      window.ethereum.on("accountsChanged", connect);
      window.ethereum.on("chainChanged", () => window.location.reload());
    }
  }, [connect]);

  return { address, signer, isConnecting, error, connect, disconnect };
}