import { intersection, union } from "lodash";
import { Algorithm, AlgorithmSnapshot } from "./algorithm";

export const dominator: Algorithm = (graph, nodes, helpers) => {
  let dominator: AlgorithmSnapshot = {};

  // initialize each node with universal set
  for (const node of nodes) {
    dominator[node.data.id] = helpers.universal;
  }

  // set the entry node to only contain itself
  dominator[helpers.entry.data.id] = [helpers.entry.data.id];
  const snapshots = helpers.fixedPoint(dominator, (state) => {
    for (const node of nodes) {
      const predsDoms = [...graph.predecessors(node.data)].map(
        (x) => state[x.data.id]
      );
      state[node.data.id] = union([node.data.id], intersection(...predsDoms));
    }
    return state;
  });

  // convert it to presentable data structure
  return snapshots.map((dom) => {
    const m = new Map<string, string>();
    for (const [id, arr] of Object.entries(dom)) {
      const n = graph.getNodeById(id);
      if (!n) {
        continue;
      }
      if (arr.length === nodes.length) {
        m.set(n.data.id, "N");
      } else {
        m.set(
          n.data.id,
          `{${arr
            .map((x) => graph.getNodeById(x)?.data.index)
            .sort()
            .join(",")}}`
        );
      }
    }
    return m;
  });
};
