import { Graph } from "../models/graph";
import { parse, Node } from "acorn";
import * as esgraph from "esgraph";
import { FlowNode } from "../models/flow";

/**
 * getIdForAstNode takes a ESTree Node and returns a unique ID
 * @param astNode
 * @returns unique ID
 */
export function getIdForAstNode(astNode: Node): string {
  return astNode.start + "-" + astNode.end;
}

export function codeToGraph(code: string): Graph<FlowNode> {
  let tree: Node;
  try {
    tree = parse(code, { ecmaVersion: 2020 });
  } catch {
    return new Graph();
  }

  let entry: unknown;
  let exit: unknown;
  let nodes;
  try {
    [entry, exit, nodes] = esgraph(tree) as [unknown, unknown, any[]];
  } catch {
    return new Graph();
  }

  // move exit to the last
  if (nodes[nodes.length - 1] !== exit) {
    const l = nodes[nodes.length - 1];
    const i = nodes.findIndex((x) => x === exit);
    nodes[i] = l;
    nodes[nodes.length - 1] = exit;
  }

  const g = new Graph<FlowNode>();
  nodes.forEach((node, index) => {
    if (node === entry) {
      g.addNode({
        id: "ENTRY",
        index,
        prev: node.prev ?? [],
        next: node.next ?? [],
        type: "entry",
      });
      return;
    }
    if (node === exit) {
      g.addNode({
        id: "EXIT",
        index,
        prev: node.prev ?? [],
        next: node.next ?? [],
        type: "exit",
      });
      return;
    }
    g.addNode({
      id: getIdForAstNode(node.astNode as Node),
      index,
      type: "normal",
      astNode: node.astNode as Node,
      prev: node.prev ?? [],
      next: node.next ?? [],
      true: node.true,
      false: node.false,
      exception: node.exception,
    });
  });
  nodes.forEach((node, i) => {
    [node.normal, node.true, node.false]
      .filter((x) => !!x)
      .forEach((s: any) => {
        // TODO: Make this check better
        g.addEdgeById(
          node !== entry ? getIdForAstNode(node.astNode) : "ENTRY",
          s.astNode ? getIdForAstNode(s.astNode) : "EXIT",
          s === node.normal
            ? ""
            : s === node.true
            ? "True"
            : s === node.false
            ? "False"
            : "Unknown"
        );
      });
  });
  return g;
}
