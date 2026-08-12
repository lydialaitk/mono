export function validateUserMessage(input: string): { valid: true } | { valid: false; message: string } {
  if (input.trim().length === 0) {
    return { valid: false, message: "請輸入訊息" };
  }

  return { valid: true };
}

