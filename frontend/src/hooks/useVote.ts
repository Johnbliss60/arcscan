import { useState } from "react";
import { useAccount, useWriteContract, useReadContract } from "wagmi";
import { CONTRACTS, VOTE_FEE_RAW, arcTestnet } from "../utils/chain";
import { ARCSCAN_ABI, USDC_ABI } from "../abi/ArcScan";

export type VoteStep = "idle" | "approving" | "voting" | "confirming" | "done" | "error";
export type VoteSignal = 0 | 1 | 2; // Bullish | Bearish | Neutral

export function useVote(tokenAddress?: `0x${string}`) {
  const { address } = useAccount();
  const [step, setStep] = useState<VoteStep>("idle");
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);

  const { writeContractAsync } = useWriteContract();

  // Check if user already voted
  const { data: alreadyVoted, refetch: refetchVoted } = useReadContract({
    address: CONTRACTS.ARCSCAN,
    abi: ARCSCAN_ABI,
    functionName: "hasVoted",
    args: [address!, tokenAddress!],
    query: { enabled: !!address && !!tokenAddress },
  });

  // Get current votes for token
  const { data: votes, refetch: refetchVotes } = useReadContract({
    address: CONTRACTS.ARCSCAN,
    abi: ARCSCAN_ABI,
    functionName: "getVotes",
    args: [tokenAddress!],
    query: { enabled: !!tokenAddress },
  });

  // USDC allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: CONTRACTS.USDC,
    abi: USDC_ABI,
    functionName: "allowance",
    args: [address!, CONTRACTS.ARCSCAN],
    query: { enabled: !!address },
  });

  async function castVote(signal: VoteSignal) {
    if (!address || !tokenAddress) {
      setError("Wallet not connected or no token selected");
      return;
    }

    try {
      setError(null);
      await refetchAllowance();
      const currentAllowance = (allowance as bigint) ?? 0n;

      // Approve USDC if needed
      if (currentAllowance < VOTE_FEE_RAW) {
        setStep("approving");
        await writeContractAsync({
          address: CONTRACTS.USDC,
          abi: USDC_ABI,
          functionName: "approve",
          args: [CONTRACTS.ARCSCAN, VOTE_FEE_RAW],
          chainId: arcTestnet.id,
        });
        await new Promise((r) => setTimeout(r, 1500));
      }

      // Cast vote
      setStep("voting");
      const voteTx = await writeContractAsync({
        address: CONTRACTS.ARCSCAN,
        abi: ARCSCAN_ABI,
        functionName: "castVote",
        args: [tokenAddress, signal],
        chainId: arcTestnet.id,
      });

      setTxHash(voteTx);
      setStep("confirming");
      await new Promise((r) => setTimeout(r, 2000));
      setStep("done");

      // Refresh vote counts
      await refetchVotes();
      await refetchVoted();
    } catch (err: any) {
      console.error("Vote error:", err);
      setError(err?.shortMessage || err?.message || "Vote failed");
      setStep("error");
    }
  }

  // Parse votes into readable format
  const parsedVotes = votes
    ? {
        bullish: Number((votes as any)[0]),
        bearish: Number((votes as any)[1]),
        neutral: Number((votes as any)[2]),
        total: Number((votes as any)[3]),
      }
    : { bullish: 0, bearish: 0, neutral: 0, total: 0 };

  function reset() {
    setStep("idle");
    setError(null);
    setTxHash(null);
  }

  return {
    step,
    error,
    txHash,
    alreadyVoted: alreadyVoted as boolean | undefined,
    votes: parsedVotes,
    castVote,
    reset,
  };
}
