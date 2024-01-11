import '@rainbow-me/rainbowkit/styles.css';
import './styles.css';

import { ChakraProvider } from '@chakra-ui/react';
import { Global } from '@emotion/react';
import { darkTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import mudConfig from 'contracts/mud.config';
import ReactDOM from 'react-dom/client';
import { WagmiConfig } from 'wagmi';

import { App } from './App';
import { GamesProvider } from './contexts/GamesContext';
import { MUDProvider } from './contexts/MUDContext';
import { SUPPORTED_CHAINS, wagmiConfig } from './lib/web3';
import { setup } from './mud/setup';
import { globalStyles, theme } from './utils/theme';

const rootElement = document.getElementById('react-root');
if (!rootElement) throw new Error('React root not found');
const root = ReactDOM.createRoot(rootElement);

// TODO: figure out if we actually want this to be async or if we should render something else in the meantime
setup().then(async result => {
  root.render(
    <MUDProvider value={result}>
      <ChakraProvider resetCSS theme={theme}>
        <Global styles={globalStyles} />
        <WagmiConfig config={wagmiConfig}>
          <RainbowKitProvider chains={SUPPORTED_CHAINS} theme={darkTheme()}>
            <GamesProvider>
              <App />
            </GamesProvider>
          </RainbowKitProvider>
        </WagmiConfig>
      </ChakraProvider>
    </MUDProvider>,
  );

  // https://vitejs.dev/guide/env-and-mode.html
  // if (import.meta.env.DEV) {
  const { mount: mountDevTools } = await import('@latticexyz/dev-tools');
  mountDevTools({
    config: mudConfig,
    publicClient: result.network.publicClient,
    walletClient: result.network.walletClient,
    latestBlock$: result.network.latestBlock$,
    storedBlockLogs$: result.network.storedBlockLogs$,
    worldAddress: result.network.worldContract.address,
    worldAbi: result.network.worldContract.abi,
    write$: result.network.write$,
    recsWorld: result.network.world,
  });
  // }
});
