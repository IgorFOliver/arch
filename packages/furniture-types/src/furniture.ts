import { Dimensions } from './dimensions';
import { Material } from './materials';
import { FurnitureComponent } from './components';

export type BookcaseColumn = {
  width: number;
};

export type BookcaseRow = {
  height: number;
  columns: BookcaseColumn[];
};

export type BookcaseConfiguration = {
  depth: number;
  rows: BookcaseRow[];
  material: Material;
};

export type FurnitureLayout = {
  components: FurnitureComponent[];
  outerDimensions: Dimensions;
};
