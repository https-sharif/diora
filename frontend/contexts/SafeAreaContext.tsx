import React, { createContext, useContext } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SafeAreaContext = createContext({ top: 0, bottom: 0 });

export const SafeAreaProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaContext.Provider
      value={{ top: insets.top, bottom: insets.bottom }}
    >
      {children}
    </SafeAreaContext.Provider>
  );
};

export const useSafeArea = () => useContext(SafeAreaContext);
