import { ConnectButton, getDefaultWallets, RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { useEffect } from "react";
import { Trans } from "react-i18next";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { useAccount, useSignMessage } from "wagmi";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import showToast from "@calcom/lib/notification";
import { trpc } from "@calcom/trpc/react";
import { Icon } from "@calcom/ui/Icon";
import Loader from "@calcom/ui/Loader";

import { getProviders, ETH_MESSAGE, SUPPORTED_CHAINS } from "../utils/ethereum";

const { chains, provider } = configureChains(SUPPORTED_CHAINS, getProviders());

const { connectors } = getDefaultWallets({
  appName: "Cal.com",
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

type RainbowGateProps = {
  children: React.ReactNode;
  setToken: (_: string) => void;
  chainId: number;
  tokenAddress: string;
};

const RainbowGate: React.FC<RainbowGateProps> = (props) => {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider
        chains={chains.filter((chain) => chain.id === props.chainId)}
        theme={darkTheme({ overlayBlur: "small" })}>
        <BalanceCheck {...props} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
};

// The word "token" is used for two differenct concepts here: `setToken` is the token for
// the Gate while `useToken` is a hook used to retrieve the Ethereum token.
const BalanceCheck: React.FC<RainbowGateProps> = ({ chainId, setToken, tokenAddress }) => {
  const { t } = useLocale();
  const { address } = useAccount();
  const {
    data: signedMessage,
    isLoading: isSignatureLoading,
    isError: isSignatureError,
    signMessage,
  } = useSignMessage({
    message: ETH_MESSAGE,
  });
  const { data: contractData, isLoading: isContractLoading } = trpc.useQuery([
    "viewer.eth.contract",
    { address: tokenAddress, chainId },
  ]);
  const { data: balanceData, isLoading: isBalanceLoading } = trpc.useQuery(
    ["viewer.eth.balance", { address: address || "", tokenAddress, chainId }],
    {
      enabled: !!address,
    }
  );

  const isLoading = isContractLoading || isBalanceLoading;

  // Any logic here will unlock the gate by setting the token to the user's wallet signature
  useEffect(() => {
    if (balanceData && balanceData.data) {
      if (balanceData.data.hasBalance) {
        if (signedMessage) {
          showToast("Wallet verified.", "success");
          setToken(signedMessage);
        } else {
          signMessage();
        }
      }
    }
  }, [balanceData, setToken, signedMessage, signMessage]);

  return (
    <main className="mx-auto max-w-3xl py-24 px-4">
      <div
        className="rounded-md border border-neutral-200 dark:border-neutral-700 dark:hover:border-neutral-600"
        data-testid="event-types">
        <div className="hover:border-brand dark:bg-darkgray-100 flex flex-col items-center border-b border-neutral-200 bg-white p-4 text-center first:rounded-t-md last:rounded-b-md last:border-b-0 hover:bg-white dark:border-neutral-700 dark:hover:border-neutral-600 md:flex-row md:text-left ">
          <span className="mb-4 grow md:mb-0">
            <h2 className="mb-2 grow font-semibold text-neutral-900 dark:text-white">Token Gate</h2>
            {isLoading && <Loader />}
            {contractData && contractData.data && (
              <>
                <p className="text-neutral-300 dark:text-white">
                  <Trans i18nKey="rainbow_connect_wallet_gate" t={t}>
                    Connect your wallet if you own {contractData.data.name} ({contractData.data.symbol}) .
                  </Trans>
                </p>

                {balanceData && balanceData.data && (
                  <>
                    {!balanceData.data.hasBalance && (
                      <div className="mt-2 flex flex-row items-center">
                        <Icon.FiAlertTriangle className="h-5 w-5 text-red-600" />
                        <p className="ml-2 text-red-600">
                          <Trans i18nKey="rainbow_insufficient_balance" t={t}>
                            Your connected wallet doesn&apos;t contain enough {contractData.data.symbol}.
                          </Trans>
                        </p>
                      </div>
                    )}

                    {balanceData.data.hasBalance && isSignatureLoading && (
                      <div className="mt-2 flex flex-row items-center">
                        <Icon.FiLoader className="h-5 w-5 text-green-600" />
                        <p className="ml-2 text-green-600">{t("rainbow_sign_message_request")}</p>
                      </div>
                    )}
                  </>
                )}

                {isSignatureError && (
                  <div className="mt-2 flex flex-row items-center">
                    <Icon.FiAlertTriangle className="h-5 w-5 text-red-600" />
                    <p className="ml-2 text-red-600">
                      <Trans i18nKey="rainbow_signature_error" t={t}>
                        {t("rainbow_signature_error")}
                      </Trans>
                    </p>
                  </div>
                )}
              </>
            )}
          </span>
          <ConnectButton chainStatus="icon" showBalance={false} />
        </div>
      </div>
    </main>
  );
};

export default RainbowGate;
