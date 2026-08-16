import { BookcaseConfiguration, FurnitureComponent, FurnitureLayout } from "@4basearch/furniture-types";

export function buildBookcaseLayout(configuration: BookcaseConfiguration): FurnitureLayout {
  const {
    dimensions: { width, height, depth },
    shelves,
    dividers,
    material,
  } = configuration;
  const thickness = material.thickness;
  const backThickness = thickness / 2;

  const interiorWidth = width - 2 * thickness;
  const interiorHeight = height - 2 * thickness;

  const components: FurnitureComponent[] = [
    {
      type: "panel",
      position: { x: -width / 2 + thickness / 2, y: height / 2, z: -depth / 2 },
      dimensions: { width: thickness, height, depth },
      material,
    },
    {
      type: "panel",
      position: { x: width / 2 - thickness / 2, y: height / 2, z: -depth / 2 },
      dimensions: { width: thickness, height, depth },
      material,
    },
    {
      type: "panel",
      position: { x: 0, y: thickness / 2, z: -depth / 2 },
      dimensions: { width: interiorWidth, height: thickness, depth },
      material,
    },
    {
      type: "panel",
      position: { x: 0, y: height - thickness / 2, z: -depth / 2 },
      dimensions: { width: interiorWidth, height: thickness, depth },
      material,
    },
    {
      type: "backPanel",
      position: { x: 0, y: height / 2, z: -depth + backThickness / 2 },
      dimensions: { width, height, depth: backThickness },
      material,
    },
  ];

  const shelfGap = interiorHeight / (shelves + 1);
  for (let i = 1; i <= shelves; i++) {
    components.push({
      type: "shelf",
      position: { x: 0, y: thickness + shelfGap * i, z: -depth / 2 },
      dimensions: { width: interiorWidth, height: thickness, depth },
      material,
    });
  }

  const dividerGap = interiorWidth / (dividers + 1);
  for (let i = 1; i <= dividers; i++) {
    components.push({
      type: "divider",
      position: { x: -interiorWidth / 2 + dividerGap * i, y: height / 2, z: -depth / 2 },
      dimensions: { width: thickness, height: interiorHeight, depth },
      material,
    });
  }

  return { components };
}
