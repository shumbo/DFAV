import { Box } from "@chakra-ui/react";
import { generate } from "astring";
import { ReactElement, useEffect, useRef } from "react";
import { DataSet } from "vis-data";
import { Network } from "vis-network";
import { FlowNode } from "../models/flow";
import { Graph } from "../models/graph";
import { Identifiable } from "../models/identifiable";

export type GraphVizProps<T extends Identifiable> = {
  graph: Graph<FlowNode>;
  set?: Map<string, string>;
  highlight?: string;
};

export function GraphViz<T extends Identifiable>(
  props: GraphVizProps<T>
): ReactElement {
  const visJsRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network>();
  useEffect(() => {
    if (props.graph.nodes.size === 0) {
      return;
    }
    // nodes in a raw representation
    const n = Array.from(props.graph.nodes.values());
    // nodes for vis-js
    const nodes = new DataSet(
      n.map((node) => ({
        id: node.data.id,
        label: (() => {
          let c: string = `${node.data.index}: `;
          switch (node.data.type) {
            case "entry":
              c += "Entry";
              break;
            case "exit":
              c += "Exit";
              break;
            default: {
              try {
                if (node.data.astNode.type === "SwitchCase") {
                  if ((node.data.astNode as any)["test"]) {
                    c +=
                      "switch-case " +
                      generate((node.data.astNode as any)["test"]);
                  } else {
                    c += "switch-case default";
                  }
                } else {
                  c += generate(node.data.astNode);
                }
              } catch {}
              break;
            }
          }
          const s = props.set?.get(node.data.id);
          if (s) {
            c += "\n" + s;
          }
          return c;
        })(),
      }))
    );
    // edges for vis-js
    const edges = new DataSet<any>(
      n
        .map((node) =>
          node.adjacent.map(([t, label]) => ({
            from: node.data.id,
            to: t.data.id,
            label,
          }))
        )
        .flat()
    );
    if (visJsRef.current) {
      networkRef.current = new Network(
        visJsRef.current,
        { nodes, edges },
        {
          physics: { enabled: false },
          edges: {
            arrows: {
              to: { enabled: true },
            },
          },
          nodes: {
            shape: "box",
            chosen: {
              node: (values, id, selected, hovering) => {
                values.color = "#F4FFF4";
                values.size = 100;
              },
              label: (values, id, selected, hovering) => {
                values.size = 16;
                values.mod = "bold";
              },
            },
          },
          interaction: {
            zoomSpeed: 0.3,
          },
          autoResize: true,
          height: "100%",
          width: "100%",
          layout: {
            randomSeed: 100,
            improvedLayout: true,
            clusterThreshold: 100,
            shakeTowards: "leaves",
          },
        }
      );
    }
  }, [props.graph, props.set]);
  useEffect(() => {
    if (!networkRef.current || !props.highlight) {
      return;
    }
    networkRef.current.selectNodes([props.highlight]);
  }, [props.highlight, props.graph]);
  return (
    <Box height="100%">
      <Box height="100%" ref={visJsRef} />
    </Box>
  );
}
