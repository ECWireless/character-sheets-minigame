import { overridableComponent } from '@latticexyz/recs';

import { SetupNetworkResult } from './setupNetwork';

export type ClientComponents = ReturnType<typeof createClientComponents>;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function createClientComponents({ components }: SetupNetworkResult) {
  return {
    ...components,
    Health: overridableComponent(components.Health),
    Player: overridableComponent(components.Player),
    Position: overridableComponent(components.Position),
  };
}
