import { Button, Flex } from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export const ConnectWalletButton: React.FC = () => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const connected = mounted && account && chain;

        return (
          <Flex
            align="center"
            cursor="pointer"
            gap={3}
            w="100%"
            _hover={{
              p: {
                borderBottom: "2px solid black",
              },
            }}
            {...(!mounted && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button
                    onClick={openConnectModal}
                    type="button"
                    variant="solid"
                    w="100%"
                  >
                    Login
                  </Button>
                );
              }

              if (chain.unsupported) {
                return (
                  <Button
                    onClick={openChainModal}
                    type="button"
                    variant="solid"
                    w="100%"
                  >
                    Wrong network
                  </Button>
                );
              }

              return (
                <Button
                  onClick={openAccountModal}
                  type="button"
                  variant="solid"
                  w="100%"
                >
                  {account.displayName}
                </Button>
              );
            })()}
          </Flex>
        );
      }}
    </ConnectButton.Custom>
  );
};
