import { Panel, PanelProps } from "./Panel";

export type DividerProps = PanelProps;

export function Divider(props: DividerProps) {
  return <Panel {...props} />;
}
