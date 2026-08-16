import { Panel, PanelProps } from "./Panel";

export type BackPanelProps = PanelProps;

export function BackPanel(props: BackPanelProps) {
  return <Panel {...props} />;
}
