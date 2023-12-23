import { createContext, ReactNode, useContext } from 'react';

import { SetupResult } from '../mud/setup';

const MUDContext = createContext<SetupResult | null>(null);

type Props = {
  children: ReactNode;
  value: SetupResult;
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const MUDProvider = ({ children, value }: Props) => {
  const currentValue = useContext(MUDContext);
  if (currentValue) throw new Error('MUDProvider can only be used once');
  return <MUDContext.Provider value={value}>{children}</MUDContext.Provider>;
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useMUD = () => {
  const value = useContext(MUDContext);
  if (!value) throw new Error('Must be used within a MUDProvider');
  return value;
};
