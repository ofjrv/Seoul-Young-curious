import { randomUUID } from "node:crypto";

const receipts = new Map();
const idempotencyIndex = new Map();

export function createReceipt(input, idempotencyKey) {
  if (idempotencyKey && idempotencyIndex.has(idempotencyKey)) {
    const receipt = receipts.get(idempotencyIndex.get(idempotencyKey));
    return { receipt, created: false };
  }

  const receipt = {
    id: randomUUID(),
    storeName: input.storeName,
    amount: input.amount,
    status: "PENDING",
  };

  receipts.set(receipt.id, receipt);

  if (idempotencyKey) {
    idempotencyIndex.set(idempotencyKey, receipt.id);
  }

  return { receipt, created: true };
}

export function getReceipt(id) {
  return receipts.get(id) ?? null;
}

export function resetStore() {
  receipts.clear();
  idempotencyIndex.clear();
}
