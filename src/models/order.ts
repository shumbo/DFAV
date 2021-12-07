export const OrderList = [
  "Default" as const,
  "Reversed" as const,
  "PostOrder" as const,
  "Reverse Post-Order" as const,
  "Reverse Post-Order on Reverse CFG" as const,
];
export type Order = typeof OrderList[0];
