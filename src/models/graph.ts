import { Identifiable } from "./identifiable";

export class Node<T extends Identifiable> {
  data: T;
  adjacent: [Node<T>, string][];

  constructor(data: T) {
    this.data = data;
    this.adjacent = [];
  }

  addAdjacent(node: Node<T>, label: string): void {
    this.adjacent.push([node, label]);
  }

  removeAdjacent(data: T): Node<T> | null {
    const index = this.adjacent.findIndex(([node]) => node.data.id === data.id);

    if (index > -1) {
      return this.adjacent.splice(index, 1)[0]![0];
    }

    return null;
  }
}

export class Graph<T extends Identifiable> {
  nodes: Map<T, Node<T>> = new Map();
  /**
   * Add a new node if it was not added before
   *
   * @param {T} data
   * @returns {Node<T>}
   */
  addNode(data: T): Node<T> {
    let node = this.nodes.get(data);

    if (node) return node;

    node = new Node(data);
    this.nodes.set(data, node);

    return node;
  }

  /**
   * Remove a node, also remove it from other nodes adjacency list
   *
   * @param {T} data
   * @returns {Node<T> | null}
   */
  removeNode(data: T): Node<T> | null {
    const nodeToRemove = this.nodes.get(data);

    if (!nodeToRemove) return null;

    this.nodes.forEach((node) => {
      node.removeAdjacent(nodeToRemove.data);
    });

    this.nodes.delete(data);

    return nodeToRemove;
  }

  getNodeById(id: string): Node<T> | undefined {
    return Array.from(this.nodes.values()).find((x) => x.data.id === id);
  }

  /**
   * Create an edge between two nodes
   *
   * @param {T} source
   * @param {T} destination
   */
  addEdge(source: T, destination: T, label: string): void {
    const sourceNode = this.addNode(source);
    const destinationNode = this.addNode(destination);

    sourceNode.addAdjacent(destinationNode, label);
  }

  addEdgeById(sourceId: string, destinationId: string, label: string): void {
    const source = this.getNodeById(sourceId);
    const destination = this.getNodeById(destinationId);
    if (!source || !destination) {
      return;
    }
    this.addEdge(source.data, destination.data, label);
  }

  /**
   * Remove an edge between two nodes
   *
   * @param {T} source
   * @param {T} destination
   */
  removeEdge(source: T, destination: T): void {
    const sourceNode = this.nodes.get(source);
    const destinationNode = this.nodes.get(destination);

    if (sourceNode && destinationNode) {
      sourceNode.removeAdjacent(destination);
    }
  }

  /**
   * Get a set of successors of the node
   * @param {T} node
   * @returns {Node<T>}
   */
  successors(data: T): Set<Node<T>> {
    let node: Node<T> | null = null;
    for (const [, n] of this.nodes) {
      if (n.data.id === data.id) {
        node = n;
      }
    }
    if (node === null) {
      return new Set();
    }
    return new Set(node.adjacent.map(([n]) => n));
  }

  /**
   * Get a set of predecessors of the node
   * @param {T} node
   * @returns {Node<T>}
   */
  predecessors(data: T): Set<Node<T>> {
    const s = new Set<Node<T>>();
    for (const [, n] of this.nodes) {
      for (const [to] of n.adjacent) {
        if (to.data.id === data.id) {
          s.add(n);
        }
      }
    }
    return s;
  }
}
