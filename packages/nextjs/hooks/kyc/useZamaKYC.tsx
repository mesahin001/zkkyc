"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDeployedContractInfo } from "../helper";
import { useWagmiEthers } from "../wagmi/useWagmiEthers";
import { FhevmInstance } from "@zkkyc/fhevm-sdk";
import { useFHEEncryption } from "@zkkyc/fhevm-sdk";
import { ethers } from "ethers";
import type { AllowedChainIds } from "~~/utils/helper/networks";

export const useZamaKYC = (parameters: {
  instance: FhevmInstance | undefined;
  initialMockChains?: Readonly<Record<number, string>>;
}) => {
  const { instance, initialMockChains } = parameters;

  const { chainId, accounts, isConnected, ethersReadonlyProvider, ethersSigner } = useWagmiEthers(initialMockChains);

  const allowedChainId = typeof chainId === "number" ? (chainId as AllowedChainIds) : undefined;
  const { data: zamaKYC } = useDeployedContractInfo({ contractName: "ZamaKYC", chainId: allowedChainId });

  const [message, setMessage] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [kycStatus, setKycStatus] = useState<number | undefined>(undefined);

  const hasContract = Boolean(zamaKYC?.address && zamaKYC?.abi);
  const hasSigner = Boolean(ethersSigner);
  const hasProvider = Boolean(ethersReadonlyProvider);

  const getContract = (mode: "read" | "write") => {
    if (!hasContract) return undefined;
    const providerOrSigner = mode === "read" ? ethersReadonlyProvider : ethersSigner;
    if (!providerOrSigner) return undefined;
    return new ethers.Contract(zamaKYC!.address, zamaKYC!.abi as any, providerOrSigner);
  };

  const { encryptWith } = useFHEEncryption({
    instance,
    ethersSigner: ethersSigner as any,
    contractAddress: zamaKYC?.address,
  });

  const canSubmit = useMemo(
    () => Boolean(hasContract && instance && hasSigner && !isProcessing && accounts?.[0]),
    [hasContract, instance, hasSigner, isProcessing, accounts],
  );

  const hashString = (str: string): bigint => {
    const hash = ethers.keccak256(ethers.toUtf8Bytes(str));
    return BigInt(hash) % 2n ** 64n;
  };

  const submitKYC = useCallback(
    async (data: { name: string; address: string; document: string; age: number }) => {
      if (!canSubmit) return;

      setIsProcessing(true);
      setMessage("Starting KYC submission...");

      try {
        setMessage("Encrypting age with FHE...");
        const enc = await encryptWith(builder => {
          builder.add64(data.age);
        });

        if (!enc) {
          setMessage("Encryption failed");
          return;
        }

        const writeContract = getContract("write");
        if (!writeContract) {
          setMessage("Contract not available");
          return;
        }

        const nameHash = hashString(data.name);
        const addressHash = hashString(data.address);
        const documentHash = hashString(data.document);

        // Extract encrypted data from encryption result
        const encryptedAge = enc.handles[0]; // bytes32 handle
        const inputProof = enc.inputProof; // bytes proof

        setMessage("Submitting to blockchain...");

        // Call contract with correct parameter order
        const tx = await writeContract.submitKYC(
          nameHash, // uint64
          addressHash, // uint64
          documentHash, // uint64
          encryptedAge, // bytes32
          inputProof, // bytes
        );

        setMessage("Waiting for confirmation...");
        await tx.wait();

        setMessage("✅ KYC submitted successfully!");
        await checkKYCStatus();
      } catch (e) {
        console.error("Submission error:", e);
        setMessage(`❌ Submission failed: ${e instanceof Error ? e.message : String(e)}`);
      } finally {
        setIsProcessing(false);
      }
    },
    [canSubmit, encryptWith, getContract],
  );

  const checkKYCStatus = useCallback(async () => {
    if (!hasProvider || !accounts?.[0]) return;

    try {
      const readContract = getContract("read");
      if (!readContract) return;

      const status = await readContract.getKYCStatus(accounts[0]);
      setKycStatus(Number(status));
    } catch (e) {
      console.error("Failed to check KYC status:", e);
    }
  }, [hasProvider, accounts, getContract]);

  useEffect(() => {
    if (hasProvider && accounts?.[0]) {
      checkKYCStatus();
    }
  }, [hasProvider, accounts, checkKYCStatus]);

  const statusText = useMemo(() => {
    if (kycStatus === undefined) return "Unknown";
    return ["None", "Pending", "Approved", "Rejected"][kycStatus] || "Unknown";
  }, [kycStatus]);

  return {
    contractAddress: zamaKYC?.address,
    canSubmit,
    submitKYC,
    checkKYCStatus,
    message,
    isProcessing,
    kycStatus,
    statusText,
    chainId,
    accounts,
    isConnected,
  };
};
