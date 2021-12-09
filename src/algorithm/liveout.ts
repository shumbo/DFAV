import { full } from "acorn-walk";
import { difference, get, union } from "lodash";
import { Algorithm, AlgorithmSnapshot } from "./algorithm";

export const liveout: Algorithm = (graph, nodes, helpers) => {
  const varKill: { [nodeId: string]: string[] } = {};
  for (const node of nodes) {
    varKill[node.data.id] = [];
    if (node.data.type === "entry" || node.data.type === "exit") {
      continue;
    }
    full(node.data.astNode, (astNode, state, type) => {
      switch (astNode.type) {
        case "VariableDeclarator": {
          const v = get(astNode, "id.name");
          if (v) {
            varKill[node.data.id]!.push(v);
          }
        }
        case "AssignmentExpression": {
          const v = get(astNode, "left.name");
          if (v) {
            varKill[node.data.id]!.push(v);
          }
        }
      }
    });
  }

  const ueVar: { [nodeId: string]: string[] } = {};
  for (const node of nodes) {
    ueVar[node.data.id] = [];
    if (node.data.type === "entry" || node.data.type === "exit") {
      continue;
    }
    full(node.data.astNode, (astNode, state, type) => {
      switch (astNode.type) {
        case "Identifier": {
          const v = get(astNode, "name");
          if (v) {
            ueVar[node.data.id]!.push(v);
          }
        }
      }
    });
    // TODO: Are there `Identifier` that doesn't read?
    ueVar[node.data.id] = difference(
      ueVar[node.data.id]!,
      varKill[node.data.id]!
    );
  }

  let liveout: AlgorithmSnapshot = {}; // ID to IDs
  for (const node of nodes) {
    // set all nodes to empty
    liveout[node.data.id] = [];
  }

  const snapshots = helpers.fixedPoint(liveout, (node, state) => {
    let tmp: string[] = [];
    const successors = graph.successors(node.data);
    for (const s of successors) {
      tmp = union(
        tmp,
        union(
          ueVar[s.data.id]!,
          difference(state[s.data.id], varKill[s.data.id]!)
        )
      );
    }
    return tmp;
  });

  return snapshots.map((snapshot) => {
    const m = new Map<string, string>();
    for (const [id, arr] of Object.entries(snapshot)) {
      m.set(id, "{" + arr.join(", ") + "}");
    }
    return m;
  });
};
