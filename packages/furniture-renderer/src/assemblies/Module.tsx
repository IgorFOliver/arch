import type {} from "@react-three/fiber";
import { FurnitureComponent } from "@4basearch/furniture-types";
import { Panel } from "../primitives/Panel";
import { Shelf } from "../primitives/Shelf";
import { Divider } from "../primitives/Divider";
import { BackPanel } from "../primitives/BackPanel";

export type ModuleProps = {
  components: FurnitureComponent[];
};

export function Module({ components }: ModuleProps) {
  return (
    <group>
      {components.map((component, index) => {
        switch (component.type) {
          case "shelf":
            return <Shelf key={index} component={component} />;
          case "divider":
            return <Divider key={index} component={component} />;
          case "backPanel":
            return <BackPanel key={index} component={component} />;
          case "panel":
            return <Panel key={index} component={component} />;
        }
      })}
    </group>
  );
}
