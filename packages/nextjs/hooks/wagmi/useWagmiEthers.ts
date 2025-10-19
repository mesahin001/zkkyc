"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { ethers } from "ethers";
import { useAccount, useWalletClient } from "wagmi";

export const useWagmiEthers = (initialMockChains?: Readonly<Record<number, string>>) => {
  const { address, isConnected, chain } = useAccount();
  const { data: walletClient } = useWalletClient();

  const chainId = chain?.id ?? walletClient?.chain?.id;
  const accounts = address ? [address] : undefined;

  const ethersProvider = useMemo(() => {
    if (!walletClient) return undefined;

    const eip1193Provider = {
      request: async (args: any) => {
        return await walletClient.request(args);
      },
      on: () => {
        console.log("Provider events not fully implemented for wagmi");
      },
      removeListener: () => {
        console.log("Provider removeListener not fully implemented for wagmi");
      },
    } as ethers.Eip1193Provider;

    return new ethers.BrowserProvider(eip1193Provider);
  }, [walletClient]);

  const ethersReadonlyProvider = useMemo(() => {
    if (!ethersProvider) return undefined;

    const rpcUrl = initialMockChains?.[chainId || 0];
    if (rpcUrl) {
      return new ethers.JsonRpcProvider(rpcUrl);
    }

    return ethersProvider;
  }, [ethersProvider, initialMockChains, chainId]);

  const [ethersSigner, setEthersSigner] = useState<ethers.JsonRpcSigner | undefined>(undefined);

  useEffect(() => {
    const loadSigner = async () => {
      if (!ethersProvider || !address) {
        setEthersSigner(undefined);
        return;
      }
      try {
        const signer = await ethersProvider.getSigner(address);
        setEthersSigner(signer);
      } catch (e) {
        console.error('getSigner error:', e);
        setEthersSigner(undefined);
      }
    };
    loadSigner();
  }, [ethersProvider, address]);

  const ropRef = useRef<typeof ethersReadonlyProvider>(ethersReadonlyProvider);
  const chainIdRef = useRef<number | undefined>(chainId);

  useEffect(() => {
    ropRef.current = ethersReadonlyProvider;
    chainIdRef.current = chainId;
  }, [ethersReadonlyProvider, chainId]);

  return {
    chainId,
    accounts,
    isConnected,
    ethersProvider,
    ethersReadonlyProvider,
    ethersSigner,
    ropRef,
    chainIdRef,
  } as const;
};
