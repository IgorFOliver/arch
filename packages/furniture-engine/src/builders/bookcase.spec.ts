import { BookcaseConfiguration } from '@4basearch/furniture-types';
import { buildBookcaseLayout } from './bookcase';

const configuration: BookcaseConfiguration = {
  depth: 300,
  material: { id: 'oak', name: 'Oak', thickness: 18 },
  rows: [
    { height: 400, columns: [{ width: 300 }, { width: 300 }] },
    { height: 350, columns: [{ width: 620 }] },
    { height: 300, columns: [{ width: 200 }, { width: 200 }, { width: 200 }] },
    { height: 250, columns: [{ width: 620 }] },
  ],
};

describe('buildBookcaseLayout', () => {
  it('produces one component per structural panel, shelf and divider', () => {
    const layout = buildBookcaseLayout(configuration);

    const shelves = configuration.rows.length - 1;
    const dividers = configuration.rows.reduce(
      (sum, row) => sum + (row.columns.length - 1),
      0,
    );

    // 2 sides + top + bottom + back + shelves (between rows) + dividers (within rows)
    expect(layout.components).toHaveLength(5 + shelves + dividers);
  });

  it('derives outer dimensions from the sum of rows/columns instead of a fixed size', () => {
    const layout = buildBookcaseLayout(configuration);
    const { material } = configuration;

    const widestRowInteriorWidth = Math.max(
      ...configuration.rows.map(
        (row) =>
          row.columns.reduce((sum, column) => sum + column.width, 0) +
          (row.columns.length - 1) * material.thickness,
      ),
    );
    const interiorHeight =
      configuration.rows.reduce((sum, row) => sum + row.height, 0) +
      (configuration.rows.length - 1) * material.thickness;

    expect(layout.outerDimensions).toEqual({
      width: widestRowInteriorWidth + 2 * material.thickness,
      height: interiorHeight + 2 * material.thickness,
      depth: configuration.depth,
    });
  });

  it("grows the outer height when a single row's height changes", () => {
    const base = buildBookcaseLayout(configuration);

    const taller: BookcaseConfiguration = {
      ...configuration,
      rows: configuration.rows.map((row, index) =>
        index === 0 ? { ...row, height: row.height + 100 } : row,
      ),
    };
    const tallerLayout = buildBookcaseLayout(taller);

    expect(tallerLayout.outerDimensions.height).toBe(
      base.outerDimensions.height + 100,
    );
  });

  it("keeps every component's center within the outer dimensions", () => {
    const layout = buildBookcaseLayout(configuration);
    const { outerDimensions } = layout;

    for (const component of layout.components) {
      expect(Math.abs(component.position.x)).toBeLessThanOrEqual(
        outerDimensions.width / 2,
      );
      expect(component.position.y).toBeGreaterThanOrEqual(0);
      expect(component.position.y).toBeLessThanOrEqual(outerDimensions.height);
      expect(Math.abs(component.position.z)).toBeLessThanOrEqual(
        outerDimensions.depth,
      );
    }
  });
});
