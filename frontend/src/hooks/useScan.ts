import { useState } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";
import { parseUnits } from "viem";
import { CONTRACTS, SCAN_TIERS, arcTestnet } from "../utils/chain";
import { ARCSCAN_ABI, USDC_ABI } from "../abi/ArcScan";

export type ScanStep =
  | "idle"
  | "checking_allowance"
  | "approving"
  | "approved"
  | "purchasing"
  | "confirming"
  | "done"
  | "error";

export function useScan() {
  const { address } = useAccount();
  const [step, setStep] = useState<ScanStep>("idle");
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [scanId, setScanId] = useState<bigint | null>(null);

  const { writeContractAsync } = useWriteContract();

  // Read current USDC allowance for ArcScan contract
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: CONTRACTS.USDC,
    abi: USDC_ABI,
    functionName: "allowance",
    args: [address!, CONTRACTS.ARCSCAN],
    query: { enabled: !!address },
  });

  // Read USDC balance
  const { data: usdcBalance } = useReadContract({
    address: CONTRACTS.USDC,
    abi: USDC_ABI,
    functionName: "balanceOf",
    args: [address!],
    query: { enabled: !!address },
  });

  async function executeScan(tokenAddress: `0x${string}`, tierIndex: number) {
    if (!address) {
      setError("Wallet not connected");
      return;
    }

    const tier = SCAN_TIERS[tierIndex];
    const fee = tier.priceRaw; // e.g. 500_000n for $0.50 USDC (6 decimals)

    try {
      setError(null);
      setStep("checking_allowance");

      await refetchAllowance();
      const currentAllowance = (allowance as bigint) ?? 0n;

      // Step 1: Approve USDC if needed
      if (currentAllowance < fee) {
        setStep("approving");
        const approveTx = await writeContractAsync({
          address: CONTRACTS.USDC,
          abi: USDC_ABI,
          functionName: "approve",
          args: [CONTRACTS.ARCSCAN, fee],
          chainId: arcTestnet.id,
        });
        setTxHash(approveTx);
        setStep("approved");
        // Wait briefly for approval to propagate
        await new Promise((r) => setTimeout(r, 1500));
      }

      // Step 2: Call purchaseScan
      setStep("purchasing");
      const scanTx = await writeContractAsync({
        address: CONTRACTS.ARCSCAN,
        abi: ARCSCAN_ABI,
        functionName: "purchaseScan",
        args: [tokenAddress, tierIndex],
        chainId: arcTestnet.id,
      });

      setTxHash(scanTx);
      setStep("confirming");

      // You can poll for the receipt here if needed
      // For now we optimistically move to done
      await new Promise((r) => setTimeout(r, 2000));
      setStep("done");
    } catch (err: any) {
      console.error("Scan error:", err);
      setError(err?.shortMessage || err?.message || "Transaction failed");
      setStep("error");
    }
  }

  function reset() {
    setStep("idle");
    setError(null);
    setTxHash(null);
    setScanId(null);
  }

  return {
    step,
    error,
    txHash,
    scanId,
    usdcBalance: usdcBalance as bigint | undefined,
    executeScan,
    reset,
  };
}
