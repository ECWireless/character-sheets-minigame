import ReactDOM from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";
import { Global } from "@emotion/react";
import { Provider } from "urql";
import { App } from "./App";
import { setup } from "./mud/setup";
import { MUDProvider } from "./MUDContext";
import mudConfig from "contracts/mud.config";
import { client } from "./graphql/client";
import { GamesProvider } from "./contexts/GamesContext";
import { globalStyles, theme } from "./utils/theme";

const rootElement = document.getElementById("react-root");
if (!rootElement) throw new Error("React root not found");
const root = ReactDOM.createRoot(rootElement);

// TODO: figure out if we actually want this to be async or if we should render something else in the meantime
setup().then(async (result) => {
  root.render(
    <MUDProvider value={result}>
      <ChakraProvider resetCSS theme={theme}>
        <Global styles={globalStyles} />
        <Provider value={client}>
          <GamesProvider>
            <App />
          </GamesProvider>
        </Provider>
      </ChakraProvider>
    </MUDProvider>
  );

  // https://vitejs.dev/guide/env-and-mode.html
  if (import.meta.env.DEV) {
    const { mount: mountDevTools } = await import("@latticexyz/dev-tools");
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
  }
});
