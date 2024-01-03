import { useComponentValue } from '@latticexyz/react';
import { createContext, useContext, useMemo } from 'react';
import { useAccount } from 'wagmi';

import { useMUD } from '../contexts/MUDContext';
import { getPlayerEntity } from '../utils/helpers';

type RaidPartyContextType = {
  avatarClassId: string;
};

const RaidPartyContext = createContext<RaidPartyContextType>({
  avatarClassId: '-1',
});

export const useRaidParty = (): RaidPartyContextType =>
  useContext(RaidPartyContext);

export const RaidPartyProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { address } = useAccount();
  const {
    components: { AvatarClass },
  } = useMUD();

  const playerEntity = useMemo(() => {
    return getPlayerEntity(address);
  }, [address]);

  const avatarClassId =
    useComponentValue(AvatarClass, playerEntity)?.value?.toString() ?? '-1';

  return (
    <RaidPartyContext.Provider
      value={{
        avatarClassId,
      }}
    >
      {children}
    </RaidPartyContext.Provider>
  );
};
