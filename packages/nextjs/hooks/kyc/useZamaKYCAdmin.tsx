"use client";

import { useState, useEffect, useCallback } from "react";
import { useWriteContract } from 'wagmi';
import { useDeployedContractInfo } from "../helper";
import { useWagmiEthers } from "../wagmi/useWagmiEthers";
import { ethers } from "ethers";

interface PendingApp {
  user_address: string;
  nameHash: string;
  addressHash: string;
  documentHash: string;
  submittedAt: number;
}

export const useZamaKYCAdmin = (parameters: {
  initialMockChains?: Readonly<Record<number, string>>;
}) => {
  const { initialMockChains } = parameters;
  const { chainId, accounts, isConnected, ethersReadonlyProvider, ethersSigner } = useWagmiEthers(initialMockChains);
  const [pendingApplications, setPendingApplications] = useState<PendingApp[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isAdmin] = useState(true);
  const zamaKYC = useDeployedContractInfo("ZamaKYC");

  const getContract = (mode: "read" | "write") => {
    if (!zamaKYC?.data) return undefined;
    const providerOrSigner = mode === "read" ? ethersReadonlyProvider : ethersSigner;
    if (!providerOrSigner) return undefined;
    return new ethers.Contract(zamaKYC.data.address, zamaKYC.data.abi as any, providerOrSigner);
  };

  // FAST: Fetch from cache API
  useEffect(() => {
    const fetchPending = async () => {
      try {
        console.log("🔍 Fetching from cache API...");
        const res = await fetch("/api/kyc/pending");
        const data = await res.json();
        
        console.log(`✅ Got ${data.pending} pending (${data.total} total)`);
        setPendingApplications(data.applications);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };
    fetchPending();
  }, [refreshTrigger]);

  const { writeContractAsync } = useWriteContract();
  
  const approveKYC = useCallback(
    async (applicant: string) => {
      if (!zamaKYC?.data) return;
      setIsProcessing(true);
      setMessage("Approving...");
      try {
        const hash = await writeContractAsync({
          address: zamaKYC.data.address as `0x${string}`,
          abi: zamaKYC.data.abi,
          functionName: 'approveKYC',
          args: [applicant],
        });
        setMessage("Confirming...");
        setMessage("✅ Approved!");
        setTimeout(() => setRefreshTrigger(p => p + 1), 2000);
      } catch (e: any) {
        setMessage(`❌ ${e?.message || e}`);
      } finally {
        setIsProcessing(false);
      }
    },
    [writeContractAsync, zamaKYC],
  );

  const rejectKYC = useCallback(
    async (applicant: string, reason: string) => {
      if (!ethersSigner) return;
      setIsProcessing(true);
      setMessage("Rejecting...");
      try {
        const writeContract = getContract("write");
        if (!writeContract) return;
        const tx = await writeContract.rejectKYC(applicant, reason);
        setMessage("Confirming...");
        await tx.wait();
        setMessage("✅ Rejected!");
        setTimeout(() => setRefreshTrigger(p => p + 1), 2000);
      } catch (e: any) {
        setMessage(`❌ ${e?.message || e}`);
      } finally {
        setIsProcessing(false);
      }
    },
    [ethersSigner],
  );

  const refreshPendingList = useCallback(() => {
    setRefreshTrigger(p => p + 1);
  }, []);

  return {
    pendingApplications,
    approveKYC,
    rejectKYC,
    refreshPendingList,
    message,
    isProcessing,
    chainId,
    accounts,
    isConnected,
    isAdmin,
    ethersSigner,
  };
};

