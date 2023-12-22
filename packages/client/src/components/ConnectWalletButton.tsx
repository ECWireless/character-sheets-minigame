import { Button, Flex } from '@chakra-ui/react';
import { useComponentValue } from '@latticexyz/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useMemo } from 'react';
import { useAccount, useDisconnect } from 'wagmi';

import { useMUD } from '../contexts/MUDContext';
import { getPlayerEntity } from '../utils/helpers';

export const ConnectWalletButton: React.FC = () => {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const {
    components: { Player },
    systemCalls: { logout },
  } = useMUD();

  const playerEntity = useMemo(() => {
    return getPlayerEntity(address);
  }, [address]);

  const playerExists = useComponentValue(Player, playerEntity)?.value === true;

  return (
    <ConnectButton.Custom>
      {({ account, chain, openChainModal, openConnectModal, mounted }) => {
        const connected = mounted && account && chain;

        return (
          <Flex
            align="center"
            cursor="pointer"
            gap={3}
            w="100%"
            _hover={{
              p: {
                borderBottom: '2px solid black',
              },
            }}
            {...(!mounted && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
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
                  onClick={() => {
                    if (playerExists) {
                      logout(address ?? '');
                    }
                    (disconnect as () => void)();
                  }}
                  type="button"
                  variant="solid"
                  w="100%"
                >
                  Logout ({account.displayName})
                </Button>
              );
            })()}
          </Flex>
        );
      }}
    </ConnectButton.Custom>
  );
};
