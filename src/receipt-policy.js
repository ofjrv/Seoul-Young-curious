export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

export function validateReceiptInput(input) {
  const storeName = input?.storeName;
  const amount = input?.amount;

  if (typeof storeName !== "string" || storeName.trim() === "") {
    throw new ValidationError("storeName은 공백이 아닌 문자열이어야 합니다.");
  }

  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
    throw new ValidationError("amount는 0보다 큰 숫자여야 합니다.");
  }

  return {
    storeName,
    amount,
  };
}
