import type {} from "@react-three/fiber";
import { FurnitureComponent } from "@4basearch/furniture-types";

export type PanelProps = {
  component: FurnitureComponent;
};

export function Panel({ component }: PanelProps) {
  const { position, dimensions, material } = component;

  return (
    <mesh position={[position.x, position.y, position.z]}>
      <boxGeometry args={[dimensions.width, dimensions.height, dimensions.depth]} />
      <meshStandardMaterial color={material.color ?? "#c8a165"} />
    </mesh>
  );
}
