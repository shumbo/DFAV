import { reverse } from "lodash";
import { FlowNode } from "../models/flow";
import { Graph, Node } from "../models/graph";
import { Identifiable } from "../models/identifiable";
import { Order } from "../models/order";

export function sortNodesInOrder(
  graph: Graph<FlowNode>,
  order: Order
): Node<FlowNode>[] {
  let nodes = [...graph.nodes.values()]; // default order
  switch (order) {
    case "Default":
      break;
    case "Reversed":
      nodes = reverse(nodes);
      break;
    case "PostOrder":
      nodes = postOrder(graph, nodes[0]!);
      break;
    case "Reverse Post-Order":
      nodes = reverse(postOrder(graph, nodes[0]!));
      break;
    case "Reverse Post-Order on Reverse CFG": {
      const reversed = reverseGraph(graph);
      const exit = nodes[nodes.length - 1]!;
      nodes = reverse(postOrder(reversed, exit));
      break;
    }
  }
  return nodes;
}

function postOrder<T extends Identifiable>(
  graph: Graph<T>,
  start: Node<T>
): Node<T>[] {
  if (!start) {
    return [];
  }
  const visited = new Set<string>();
  const order: Node<T>[] = [];
  function walk(node: Node<T>) {
    visited.add(node.data.id);
    const successors = graph.successors(node.data);
    for (const s of successors) {
      if (!visited.has(s.data.id)) {
        walk(s);
      }
    }
    order.push(node);
  }
  walk(start);
  return order;
}

function reverseGraph<T extends Identifiable>(graph: Graph<T>): Graph<T> {
  const reversed = new Graph<T>();
  const nodes = [...graph.nodes.values()];
  for (const node of nodes) {
    reversed.addNode(node.data);
  }
  for (const src of nodes) {
    for (const [dest, label] of src.adjacent) {
      reversed.addEdgeById(dest.data.id, src.data.id, label);
    }
  }
  return reversed;
}
