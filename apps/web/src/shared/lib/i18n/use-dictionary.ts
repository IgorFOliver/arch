'use client';

import { useContext } from 'react';
import { DictionaryContext } from './DictionaryProvider';
import type { Dictionary } from './dictionaries';

type DictionaryBase = keyof Dictionary;

export function useDictionary(): Dictionary;
export function useDictionary<Base extends DictionaryBase>(
  base: Base,
): Dictionary[Base];
export function useDictionary<Base extends DictionaryBase>(
  base?: Base,
): Dictionary | Dictionary[Base] {
  const dict = useContext(DictionaryContext);

  if (!dict) {
    throw new Error('useDictionary must be used within DictionaryProvider');
  }

  return base === undefined ? dict : dict[base];
}
