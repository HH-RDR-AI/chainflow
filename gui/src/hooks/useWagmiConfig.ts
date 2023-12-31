import { useMemo } from "react";
import { getDefaultWallets } from "@rainbow-me/rainbowkit";
import { publicProvider } from "@wagmi/core/providers/public";
import { configureChains, createConfig } from "wagmi";
import { polygonMumbai } from "@wagmi/chains";
import { WALLET_CONNECT_PROJECT_ID } from "../constants";
export const useWagmiConfig = () => {
  const polygonMumbaiChain = {
    ...polygonMumbai,
    rpcUrls: {
      ...polygonMumbai.rpcUrls,
      default: {
        http: ["https://endpoints.omniatech.io/v1/matic/mumbai/public"],
      },
      public: {
        http: ["https://endpoints.omniatech.io/v1/matic/mumbai/public"],
      },
    },
  };
  const { chains, publicClient } = configureChains(
    [polygonMumbaiChain],
    [publicProvider()]
  );

  const { connectors } = useMemo(
    () =>
      getDefaultWallets({
        appName: "CAMUNDA SAAS GUI",
        chains,
        projectId: WALLET_CONNECT_PROJECT_ID,
      }),
    [chains]
  );

  const wagmiConfig = useMemo(
    () =>
      createConfig({
        autoConnect: true,
        connectors,
        publicClient,
      }),
    [connectors, publicClient]
  );

  return { wagmiConfig, chains, publicClient, publicProvider };
};
