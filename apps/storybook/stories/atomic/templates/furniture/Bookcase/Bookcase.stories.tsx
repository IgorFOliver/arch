import type { Meta, StoryObj } from "@storybook/react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { BookcaseConfiguration } from "@4basearch/furniture-types";
import { Bookcase } from "@4basearch/furniture-renderer";

const configuration: BookcaseConfiguration = {
  dimensions: { width: 0.8, height: 1.8, depth: 0.3 },
  shelves: 1,
  dividers: 3,
  material: { id: "oak", name: "Oak", thickness: 0.018, color: "#c8a165" },
};

const meta = {
  title: "Atomic/Templates/Furniture/Bookcase",
  component: Bookcase,
  render: (args) => (
    <Canvas
      camera={{ position: [1.8, 1.2, 2.6], fov: 45 }}
      style={{ height: "600px" }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 2]} intensity={1} />
      <Bookcase {...args} />
      <OrbitControls target={[0, configuration.dimensions.height / 2, 0]} />
    </Canvas>
  ),
  args: { configuration },
} satisfies Meta<typeof Bookcase>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
