import { Panel, PanelProps } from "./Panel";

export type ShelfProps = PanelProps;

export function Shelf(props: ShelfProps) {
  return <Panel {...props} />;
}
