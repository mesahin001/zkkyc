"use client";

import { useMemo, useState } from "react";
import { useFhevm } from "@zkkyc/fhevm-sdk";
import { useAccount } from "wagmi";
import { RainbowKitCustomConnectButton } from "~~/components/helper/RainbowKitCustomConnectButton";
import { useZamaKYC } from "~~/hooks/kyc/useZamaKYC";

export const ZamaKYCForm = () => {
  const { isConnected, chain } = useAccount();
  const chainId = chain?.id;

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [document, setDocument] = useState("");
  const [age, setAge] = useState("");

  const provider = useMemo(() => {
    if (typeof window === "undefined") return undefined;
    return (window as any).ethereum;
  }, []);

  const initialMockChains = { 31337: "http://localhost:8545" };

  const { instance: fhevmInstance, status: fhevmStatus } = useFhevm({
    provider,
    chainId,
    initialMockChains,
    enabled: true,
  });

  const zamaKYC = useZamaKYC({
    instance: fhevmInstance,
    initialMockChains,
  });

  const handleSubmit = async () => {
    if (!name || !address || !document || !age) {
      alert("Please fill all fields!");
      return;
    }

    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 0 || ageNum > 150) {
      alert("Invalid age!");
      return;
    }

    await zamaKYC.submitKYC({ name, address, document, age: ageNum });

    setName("");
    setAddress("");
    setDocument("");
    setAge("");
  };

  if (!isConnected) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center">
          <div className="bg-white shadow-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Wallet not connected</h2>
            <p className="text-gray-700 mb-6">Connect your wallet to use zkKYC</p>
            <RainbowKitCustomConnectButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">🔐 zkKYC System</h1>
        <p className="text-gray-600">Confidential Identity Verification with FHE</p>
      </div>

      {/* Status Card */}
      <div className="bg-white shadow-lg p-6">
        <h3 className="font-bold text-xl mb-4">Your KYC Status</h3>
        <div className="space-y-2">
          <div className="flex justify-between p-3 bg-gray-50 border">
            <span>Status:</span>
            <span className="font-bold">{zamaKYC.statusText}</span>
          </div>
          <div className="flex justify-between p-3 bg-gray-50 border">
            <span>FHEVM:</span>
            <span className="font-mono text-sm">{fhevmStatus}</span>
          </div>
        </div>
      </div>

      {/* KYC Form */}
      <div className="bg-white shadow-lg p-6">
        <h3 className="font-bold text-xl mb-4">Submit KYC</h3>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full p-3 border rounded"
            disabled={zamaKYC.isProcessing}
          />
          <input
            type="text"
            placeholder="Address"
            value={address}
            onChange={e => setAddress(e.target.value)}
            className="w-full p-3 border rounded"
            disabled={zamaKYC.isProcessing}
          />
          <input
            type="text"
            placeholder="Document Number"
            value={document}
            onChange={e => setDocument(e.target.value)}
            className="w-full p-3 border rounded"
            disabled={zamaKYC.isProcessing}
          />
          <input
            type="number"
            placeholder="Age (encrypted with FHE)"
            value={age}
            onChange={e => setAge(e.target.value)}
            className="w-full p-3 border rounded"
            disabled={zamaKYC.isProcessing}
          />

          <button
            onClick={handleSubmit}
            disabled={!zamaKYC.canSubmit}
            className="w-full bg-black text-white py-3 px-6 font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {zamaKYC.isProcessing ? "Processing..." : "📤 Submit KYC"}
          </button>
        </div>

        {zamaKYC.message && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200">
            <p className="text-sm">{zamaKYC.message}</p>
          </div>
        )}
      </div>
    </div>
  );
};
