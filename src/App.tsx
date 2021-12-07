import { useEffect, useMemo, useState } from "react";
import { Header } from "./components/Header";
import { Editor } from "./components/Editor";
import "./App.css";
import { Order } from "./models/order";
import { Mode } from "./models/mode";
import {
  Box,
  Flex,
  Table,
  Thead,
  Td,
  Th,
  Tr,
  Tbody,
  Text,
  Button,
  HStack,
  ButtonGroup,
  Spacer,
} from "@chakra-ui/react";
import { GraphViz } from "./components/GraphViz";
import { codeToGraph } from "./adapters/codeToGraph";
import { runAlgorithm } from "./algorithm/runAlgorithm";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import { sortNodesInOrder } from "./algorithm/sort";

function App() {
  const [order, setOrder] = useState<Order>("Default");
  const [mode, setMode] = useState<Mode>("Dominator");
  const [code, setCode] = useState<string>("");

  const graphScreenHandle = useFullScreenHandle();
  const rightPaneFullScreenHandle = useFullScreenHandle();

  const graph = useMemo(() => codeToGraph(code), [code]);
  const nodes = useMemo(() => sortNodesInOrder(graph, "Default"), [graph]);
  const nodesInOrder = useMemo(() => sortNodesInOrder(graph, order), [
    graph,
    order,
  ]);

  const count = useMemo(() => nodes.length, [nodes]);
  const table = useMemo(() => runAlgorithm(graph, nodesInOrder, mode), [
    graph,
    mode,
    nodesInOrder,
  ]);
  const [step, setStep] = useState(0);

  const minStep = useMemo(() => nodes.length, [nodes]);
  const maxStep = useMemo(() => table.length * nodes.length, [table, nodes]);

  const rowIndex = useMemo(() => Math.floor(step / count), [step, count]);
  const colIndex = useMemo(() => step % count, [step, count]);

  const fixedRows = useMemo(() => table.filter((_, i) => i < rowIndex), [
    table,
    rowIndex,
  ]);

  const currentView = useMemo(() => {
    // rowIndex > 0
    const prevRow = table[rowIndex - 1];
    const currentRow = table[rowIndex];
    const view: Map<string, string> = new Map();
    for (const [i, node] of nodesInOrder.entries()) {
      if (i <= colIndex) {
        view.set(node.data.id, currentRow?.get(node.data.id) ?? "");
      } else {
        view.set(node.data.id, prevRow?.get(node.data.id) ?? "");
      }
    }
    return view;
  }, [rowIndex, table, colIndex, nodesInOrder]);

  useEffect(() => {
    setStep(maxStep - 1);
  }, [maxStep]);

  return (
    <Flex height="100%" direction="column">
      <Header
        order={order}
        onOrderChange={setOrder}
        mode={mode}
        onModeChange={setMode}
      />
      <Flex flex="1">
        <Box flex="1" flexBasis={"400px"} flexGrow={0} flexShrink={0}>
          <Editor value={code} onChange={setCode} />
        </Box>
        <Flex
          flex="2"
          direction="column"
          flexGrow={0}
          minWidth={0}
          position="relative"
        >
          <FullScreen handle={rightPaneFullScreenHandle}>
            <Flex
              alignItems="center"
              position="absolute"
              top={2}
              left={2}
              right={2}
              zIndex={100}
            >
              <HStack width="100%">
                <ButtonGroup>
                  <Button onClick={() => setStep(minStep)}>{"<<"}</Button>
                  <Button
                    onClick={() => setStep((i) => Math.max(minStep, i - 1))}
                  >
                    {"<"}
                  </Button>
                  <Button>
                    {step + 1 - minStep}/{maxStep - minStep}
                  </Button>
                  <Button
                    onClick={() => setStep((i) => Math.min(i + 1, maxStep - 1))}
                  >
                    {">"}
                  </Button>
                  <Button onClick={() => setStep(maxStep - 1)}>{">>"}</Button>
                </ButtonGroup>
                <Spacer />
                <Text>Full Screen: </Text>
                <Button onClick={() => graphScreenHandle.enter()}>Graph</Button>
                <Button onClick={() => rightPaneFullScreenHandle.enter()}>
                  Graph + Table
                </Button>
              </HStack>
            </Flex>

            <Flex direction="column" flex="1" height="100%">
              <Box flex="1">
                <FullScreen handle={graphScreenHandle}>
                  <GraphViz
                    graph={graph}
                    set={currentView}
                    highlight={nodesInOrder[colIndex]?.data.id ?? ""}
                  />
                </FullScreen>
              </Box>
              <Box>
                <Table>
                  <Thead>
                    <Tr>
                      <Th>#</Th>
                      {nodesInOrder.map((f) => (
                        <Th key={f.data.id}>{f.data.index}</Th>
                      ))}
                    </Tr>
                  </Thead>

                  <Tbody>
                    {useMemo(
                      () =>
                        [...fixedRows, currentView].map((m, i) => (
                          <Tr key={i}>
                            <Td>{i === 0 ? "Init" : i}</Td>
                            {nodesInOrder.map((n, j) => {
                              const cellChanged =
                                i > 0 &&
                                m.get(n.data.id) !==
                                  table[i - 1]?.get(n.data.id);
                              return (
                                <Td
                                  key={i + n.data.id}
                                  fontWeight={cellChanged ? 600 : undefined}
                                  color={cellChanged ? "red.400" : undefined}
                                  backgroundColor={
                                    rowIndex === i && colIndex === j
                                      ? "green.100"
                                      : undefined
                                  }
                                >
                                  {i === rowIndex && j > colIndex
                                    ? ""
                                    : m.get(n.data.id) ?? ""}
                                </Td>
                              );
                            })}
                          </Tr>
                        )),
                      [
                        fixedRows,
                        currentView,
                        nodesInOrder,
                        step,
                        rowIndex,
                        colIndex,
                      ]
                    )}
                  </Tbody>
                </Table>
              </Box>
            </Flex>
          </FullScreen>
        </Flex>
      </Flex>
    </Flex>
  );
}

export default App;
