import { cloneDeep, isEqual } from "lodash";
import { FlowNode } from "../models/flow";
import { Graph, Node } from "../models/graph";
import { Mode } from "../models/mode";
import { AlgorithmHelpers, AlgorithmSnapshot } from "./algorithm";
import { dominator } from "./dominator";
import { liveout } from "./liveout";

export function runAlgorithm(
  graph: Graph<FlowNode>,
  nodesInOrder: Node<FlowNode>[],
  mode: Mode
): Map<string, string>[] {
  let nodes = nodesInOrder;
  const entry = nodes.find((x) => x.data.type === "entry");
  const exit = nodes.find((x) => x.data.type === "exit");
  const universal = nodes.map((x) => x.data.id);
  if (!entry || !exit) {
    console.warn("Error: entry or exit is not in the graph!");
    return [];
  }

  const helpers: AlgorithmHelpers = {
    entry,
    exit,
    universal,
    fixedPoint(initial, fn) {
      const snapshots: AlgorithmSnapshot[] = [initial];
      let changed = true;
      let state = initial;
      while (changed) {
        const snapshot = cloneDeep(state);
        for (const node of nodes) {
          snapshot[node.data.id] = fn(node, snapshot);
        }
        changed = !isEqual(state, snapshot);
        state = snapshot;
        snapshots.push(state);
      }
      return snapshots;
    },
  };

  switch (mode) {
    case "Dominator":
      return dominator(graph, nodes, helpers);
    case "LiveOut":
      return liveout(graph, nodes, helpers);
    default:
      break;
  }
  return [];
}
