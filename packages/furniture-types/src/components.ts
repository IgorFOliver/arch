import { Dimensions } from './dimensions';
import { Material } from './materials';

export type Position3D = {
  x: number;
  y: number;
  z: number;
};

export type FurnitureComponentType =
  | 'panel'
  | 'shelf'
  | 'divider'
  | 'backPanel';

export type FurnitureComponent = {
  type: FurnitureComponentType;
  position: Position3D;
  dimensions: Dimensions;
  material: Material;
};
