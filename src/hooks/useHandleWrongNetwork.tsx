import { useConfig, useSwitchChain } from "wagmi";
import { getAccount } from "wagmi/actions";
import { CHAIN } from "@/data/constants";

interface HandleWrongNetworkParams {
  chainId?: number;
}

const useHandleWrongNetwork = () => {
  const config = useConfig();
  const { switchChainAsync } = useSwitchChain();

  const handleWrongNetwork = async (params?: HandleWrongNetworkParams) => {
    const chainId = params?.chainId ?? CHAIN.id;
    const {
      chainId: activeChainId,
      connector,
      isConnected
    } = getAccount(config);

    if (!isConnected) {
      throw new Error("No active wallet connection found.");
    }

    if (activeChainId !== chainId) {
      if (connector?.id === "familyAccountsProvider") {
        const targetChain = config.chains.find(
          (configuredChain) => configuredChain.id === chainId
        );
        if (!targetChain) {
          throw new Error(`Chain ${chainId} is not configured in this app.`);
        }

        const activeChainName =
          config.chains.find(
            (configuredChain) => configuredChain.id === activeChainId
          )?.name ?? "an unknown network";

        throw new Error(
          `Switch your Family wallet from ${activeChainName} (chain ID ${activeChainId ?? "unknown"}) to ${targetChain.name} (chain ID ${targetChain.id}), then try again.`
        );
      }

      await switchChainAsync({ chainId });
    }
  };

  return handleWrongNetwork;
};

export default useHandleWrongNetwork;
