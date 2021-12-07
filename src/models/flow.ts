import { Node as AstNode } from "acorn";

type FlowNodeBase = {
  id: string;
  index: number;
  prev: FlowNode[];
  next: FlowNode[];

  normal?: FlowNode;
  true?: FlowNode;
  false?: FlowNode;
  exception?: FlowNode;
};

type Node = FlowNodeBase & {
  type: "normal";
  astNode: AstNode;
};

type EntryNode = FlowNodeBase & {
  type: "entry";
};

type ExitNode = FlowNodeBase & {
  type: "exit";
};

export type FlowNode = Node | EntryNode | ExitNode;
