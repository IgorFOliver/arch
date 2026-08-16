import { Dimensions } from "./dimensions";
import { Material } from "./materials";
import { FurnitureComponent } from "./components";

export type BookcaseConfiguration = {
  dimensions: Dimensions;
  shelves: number;
  dividers: number;
  material: Material;
};

export type FurnitureLayout = {
  components: FurnitureComponent[];
};
