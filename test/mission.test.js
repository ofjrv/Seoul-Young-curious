import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { createApp } from "../src/app.js";
import { resetStore } from "../src/receipt-store.js";

let server;
let baseUrl;

beforeEach(async () => {
  resetStore();
  server = createApp();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

afterEach(async () => {
  server.closeAllConnections?.();
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test("기본 실행: health API가 응답한다", async () => {
  const response = await fetch(`${baseUrl}/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: "ok" });
});

test("핵심 기능: 영수증을 등록하고 조회한다", async () => {
  const createResponse = await fetch(`${baseUrl}/receipts`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ storeName: "서울카페", amount: 8500 }),
  });
  assert.equal(createResponse.status, 201);

  const created = await createResponse.json();
  assert.equal(created.storeName, "서울카페");
  assert.equal(created.amount, 8500);
  assert.equal(created.status, "PENDING");

  const getResponse = await fetch(`${baseUrl}/receipts/${created.id}`);
  assert.equal(getResponse.status, 200);
  assert.deepEqual(await getResponse.json(), {
    id: created.id,
    storeName: "서울카페",
    amount: 8500,
    status: "PENDING",
  });
});

test("입력 통제: 잘못된 상호명과 금액을 거절한다", async () => {
  for (const invalidInput of [
    { storeName: "   ", amount: 8500 },
    { storeName: "서울카페", amount: 0 },
    { storeName: "서울카페", amount: "비쌈" },
  ]) {
    const response = await fetch(`${baseUrl}/receipts`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(invalidInput),
    });
    assert.equal(response.status, 400);
    assert.equal((await response.json()).error, "invalid_receipt");
  }
});

test("중복 통제: 같은 키는 같은 결과, 다른 키는 다른 결과를 만든다", async () => {
  async function createWithKey(key) {
    const response = await fetch(`${baseUrl}/receipts`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "idempotency-key": key,
      },
      body: JSON.stringify({ storeName: "서울카페", amount: 8500 }),
    });
    return { status: response.status, body: await response.json() };
  }

  const first = await createWithKey("same-request");
  const duplicate = await createWithKey("same-request");
  const different = await createWithKey("different-request");

  assert.equal(first.status, 201);
  assert.equal(duplicate.status, 200);
  assert.equal(duplicate.body.id, first.body.id);
  assert.equal(duplicate.body.duplicate, true);
  assert.equal(different.status, 201);
  assert.notEqual(different.body.id, first.body.id);
});
