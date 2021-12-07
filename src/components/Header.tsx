import { Box, Flex, Heading, Select, Spacer } from "@chakra-ui/react";
import { VFC } from "react";
import { Mode, ModeList } from "../models/mode";
import { Order, OrderList } from "../models/order";

export type HeaderProps = {
  mode: Mode | undefined;
  onModeChange(mode: Mode): void;
  order: Order | undefined;
  onOrderChange(order: Order): void;
};

export const Header: VFC<HeaderProps> = (props) => {
  return (
    <Flex as="nav" width="100%" padding={6} bgColor="green.50">
      <Flex align="center" mr={5}>
        <Heading as="h1" size="lg" letterSpacing={"tighter"} mr={5}>
          DFAV
        </Heading>
        <Heading as="h2" size="md" letterSpacing={"tighter"} color="gray.600">
          Data-Flow Analysis Visualizer
        </Heading>
      </Flex>
      <Spacer />
      <Flex align="center" mr={2}>
        <Select
          bgColor="white"
          value={props.order}
          onChange={(v) => props.onOrderChange(v.currentTarget.value as Order)}
          placeholder="Select Order"
        >
          {OrderList.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </Select>
      </Flex>
      <Flex align="center">
        <Select
          bgColor="white"
          value={props.mode}
          onChange={(v) => props.onModeChange(v.currentTarget.value as Mode)}
          placeholder="Select Analysis"
        >
          {ModeList.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </Select>
      </Flex>
    </Flex>
  );
};
