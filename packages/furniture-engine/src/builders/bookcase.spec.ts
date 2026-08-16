import { BookcaseConfiguration } from "@4basearch/furniture-types";
import { buildBookcaseLayout } from "./bookcase";

const configuration: BookcaseConfiguration = {
  dimensions: { width: 800, height: 1800, depth: 300 },
  shelves: 3,
  dividers: 1,
  material: { id: "oak", name: "Oak", thickness: 18 },
};

describe("buildBookcaseLayout", () => {
  it("produces one component per structural panel, shelf and divider", () => {
    const layout = buildBookcaseLayout(configuration);

    // 2 sides + top + bottom + back + shelves + dividers
    expect(layout.components).toHaveLength(5 + configuration.shelves + configuration.dividers);
  });

  it("keeps every component's center within the outer dimensions", () => {
    const { dimensions } = configuration;
    const layout = buildBookcaseLayout(configuration);

    for (const component of layout.components) {
      expect(Math.abs(component.position.x)).toBeLessThanOrEqual(dimensions.width / 2);
      expect(component.position.y).toBeGreaterThanOrEqual(0);
      expect(component.position.y).toBeLessThanOrEqual(dimensions.height);
      expect(Math.abs(component.position.z)).toBeLessThanOrEqual(dimensions.depth);
    }
  });
});
