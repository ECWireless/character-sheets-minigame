import { createConfig } from "wagmi";
import { getDefaultWallets } from "@rainbow-me/rainbowkit";

import {
  chains,
  PROJECT_ID,
  publicClient,
  webSocketPublicClient,
} from "./config";

const { connectors } = getDefaultWallets({
  appName: "CharacterSheets Minigame",
  projectId: PROJECT_ID,
  chains,
});

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

export { DEFAULT_CHAIN } from "./config";
