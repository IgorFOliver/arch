import type {} from '@react-three/fiber';
import { BookcaseConfiguration } from '@4basearch/furniture-types';
import { buildBookcaseLayout } from '@4basearch/furniture-engine';
import { Module } from './Module';

export type BookcaseProps = {
  configuration: BookcaseConfiguration;
};

export function Bookcase({ configuration }: BookcaseProps) {
  const layout = buildBookcaseLayout(configuration);

  return (
    <group>
      <Module components={layout.components} />
    </group>
  );
}
