'use client';

import { createContext, ReactNode } from 'react';
import type { Dictionary } from './dictionaries';

export const DictionaryContext = createContext<Dictionary | undefined>(
  undefined,
);

interface DictionaryProviderProps {
  dict: Dictionary;
  children: ReactNode;
}

export function DictionaryProvider({
  dict,
  children,
}: DictionaryProviderProps) {
  return (
    <DictionaryContext.Provider value={dict}>
      {children}
    </DictionaryContext.Provider>
  );
}
