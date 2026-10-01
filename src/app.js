import http from "node:http";
import { ValidationError, validateReceiptInput } from "./receipt-policy.js";
import { createReceipt, getReceipt } from "./receipt-store.js";

function writeJson(response, statusCode, body) {
  response.writeHead(statusCode, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}

async function readJson(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  const rawBody = Buffer.concat(chunks).toString("utf8");
  return rawBody ? JSON.parse(rawBody) : {};
}

export function createApp() {
  return http.createServer(async (request, response) => {
    const url = new URL(request.url, "http://localhost");

    try {
      if (request.method === "GET" && url.pathname === "/health") {
        writeJson(response, 200, { status: "ok" });
        return;
      }

      if (request.method === "POST" && url.pathname === "/receipts") {
        const input = validateReceiptInput(await readJson(request));
        const idempotencyKey = request.headers["idempotency-key"] ?? null;
        const result = createReceipt(input, idempotencyKey);

        writeJson(response, result.created ? 201 : 200, {
          ...result.receipt,
          duplicate: !result.created,
        });
        return;
      }

      const receiptMatch = url.pathname.match(/^\/receipts\/([^/]+)$/);
      if (request.method === "GET" && receiptMatch) {
        const receipt = getReceipt(receiptMatch[1]);

        if (!receipt) {
          writeJson(response, 404, { error: "receipt_not_found" });
          return;
        }

        writeJson(response, 200, receipt);
        return;
      }

      writeJson(response, 404, { error: "not_found" });
    } catch (error) {
      if (error instanceof ValidationError) {
        writeJson(response, 400, { error: "invalid_receipt", message: error.message });
        return;
      }

      if (error instanceof SyntaxError) {
        writeJson(response, 400, { error: "invalid_json" });
        return;
      }

      writeJson(response, 500, { error: "internal_error" });
    }
  });
}
