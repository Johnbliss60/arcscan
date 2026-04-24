import { createConfig, http } from "wagmi";
import { metaMask, walletConnect } from "wagmi/connectors";
import { arcTestnet } from "./chain";

export const wagmiConfig = createConfig({
  chains: [arcTestnet],
  connectors: [
    metaMask(),
    // Optional: WalletConnect (needs project ID from cloud.walletconnect.com)
    // walletConnect({ projectId: import.meta.env.VITE_WC_PROJECT_ID }),
  ],
  transports: {
    [arcTestnet.id]: http("https://rpc.testnet.arc.network"),
  },
});
