import { BookcaseConfiguration, FurnitureComponent, FurnitureLayout } from "@4basearch/furniture-types";

function rowInteriorWidth(row: BookcaseConfiguration["rows"][number], thickness: number): number {
  const columnsWidth = row.columns.reduce((sum, column) => sum + column.width, 0);
  return columnsWidth + (row.columns.length - 1) * thickness;
}

export function buildBookcaseLayout(configuration: BookcaseConfiguration): FurnitureLayout {
  const { depth, rows, material } = configuration;
  const thickness = material.thickness;
  const backThickness = thickness / 2;

  const caseInteriorWidth = Math.max(...rows.map((row) => rowInteriorWidth(row, thickness)));
  const caseOuterWidth = caseInteriorWidth + 2 * thickness;

  const caseInteriorHeight =
    rows.reduce((sum, row) => sum + row.height, 0) + (rows.length - 1) * thickness;
  const caseOuterHeight = caseInteriorHeight + 2 * thickness;

  const components: FurnitureComponent[] = [
    {
      type: "panel",
      position: { x: -caseOuterWidth / 2 + thickness / 2, y: caseOuterHeight / 2, z: -depth / 2 },
      dimensions: { width: thickness, height: caseOuterHeight, depth },
      material,
    },
    {
      type: "panel",
      position: { x: caseOuterWidth / 2 - thickness / 2, y: caseOuterHeight / 2, z: -depth / 2 },
      dimensions: { width: thickness, height: caseOuterHeight, depth },
      material,
    },
    {
      type: "panel",
      position: { x: 0, y: thickness / 2, z: -depth / 2 },
      dimensions: { width: caseInteriorWidth, height: thickness, depth },
      material,
    },
    {
      type: "panel",
      position: { x: 0, y: caseOuterHeight - thickness / 2, z: -depth / 2 },
      dimensions: { width: caseInteriorWidth, height: thickness, depth },
      material,
    },
    {
      type: "backPanel",
      position: { x: 0, y: caseOuterHeight / 2, z: -depth + backThickness / 2 },
      dimensions: { width: caseOuterWidth, height: caseOuterHeight, depth: backThickness },
      material,
    },
  ];

  let cursorY = thickness;
  rows.forEach((row, rowIndex) => {
    const interiorWidth = rowInteriorWidth(row, thickness);
    let cursorX = -interiorWidth / 2;

    row.columns.forEach((column, columnIndex) => {
      cursorX += column.width;

      const isLastColumn = columnIndex === row.columns.length - 1;
      if (!isLastColumn) {
        components.push({
          type: "divider",
          position: { x: cursorX + thickness / 2, y: cursorY + row.height / 2, z: -depth / 2 },
          dimensions: { width: thickness, height: row.height, depth },
          material,
        });
        cursorX += thickness;
      }
    });

    cursorY += row.height;

    const isLastRow = rowIndex === rows.length - 1;
    if (!isLastRow) {
      components.push({
        type: "shelf",
        position: { x: 0, y: cursorY + thickness / 2, z: -depth / 2 },
        dimensions: { width: caseInteriorWidth, height: thickness, depth },
        material,
      });
      cursorY += thickness;
    }
  });

  return {
    components,
    outerDimensions: { width: caseOuterWidth, height: caseOuterHeight, depth },
  };
}
