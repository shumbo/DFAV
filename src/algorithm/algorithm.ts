import { FlowNode } from "../models/flow";
import { Graph, Node } from "../models/graph";

export type AlgorithmSnapshot = { [id: string]: string[] };

export type AlgorithmHelpers = {
  entry: Node<FlowNode>;
  exit: Node<FlowNode>;
  universal: string[];
  fixedPoint: (
    initial: AlgorithmSnapshot,
    fn: (state: AlgorithmSnapshot) => AlgorithmSnapshot
  ) => AlgorithmSnapshot[];
};

export type Algorithm = (
  graph: Graph<FlowNode>,
  orderedNodes: Node<FlowNode>[],
  helpers: AlgorithmHelpers
) => Map<string, string>[];
