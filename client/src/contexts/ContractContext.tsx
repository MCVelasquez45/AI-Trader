// ✅ File: context/ContractContext.tsx

import React, { createContext, useContext, useState, useMemo } from 'react';
import type { OptionContract, ClosestITMContract } from '../types/OptionContract';

interface ContractMap {
  [ticker: string]: OptionContract | ClosestITMContract;
}

/**
 * 🔐 ContractMap — Used to store the closest ITM contract for each validated ticker.
 * Keyed by ticker symbol (e.g., "AAPL") with value being a contract object.
 */

/**
 * 🧠 ContractContextType — Defines shape of the context state
 * Includes:
 * - validatedContracts: current saved contracts for each ticker
 * - setValidatedContracts: state updater
 */
interface ContractContextType {
  validatedContracts: ContractMap;
  setValidatedContracts: React.Dispatch<React.SetStateAction<ContractMap>>;
}

// 🎯 Initialize React Context with undefined default
const ContractContext = createContext<ContractContextType | undefined>(undefined);

/**
 * 🔁 useContractContext — Custom hook for easy access to context
 * Throws an error if accessed outside of a provider scope.
 */
export const useContractContext = () => {
  const context = useContext(ContractContext);
  if (!context) {
    console.error('❌ useContractContext must be used inside <ContractProvider>');
    throw new Error('useContractContext must be used within ContractProvider');
  }
  console.log('📦 useContractContext accessed');
  return context;
};

/**
 * ✅ ContractProvider — Wraps children in contract context
 * Initializes context state and exposes it to all children.
 */
export const ContractProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [validatedContracts, setValidatedContracts] = useState<ContractMap>({});

  console.log('🧪 <ContractProvider> mounted with empty validatedContracts');

  // 🎯 Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    validatedContracts,
    setValidatedContracts
  }), [validatedContracts]);

  return (
    <ContractContext.Provider value={contextValue}>
      {children}
    </ContractContext.Provider>
  );
};
