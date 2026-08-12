import { validateUserMessage } from "../chat/validation";

export type ChatInputView = {
  container: HTMLDivElement;
  form: HTMLFormElement;
  input: HTMLTextAreaElement;
  validation: HTMLDivElement;
  getValue: () => string;
  clear: () => void;
};

export function createChatInput(): ChatInputView {
  const container = document.createElement("div");
  const form = document.createElement("form");
  const input = document.createElement("textarea");
  const button = document.createElement("button");
  const validation = document.createElement("div");

  input.setAttribute("data-testid", "chat-input");
  input.placeholder = "請輸入繁體中文訊息";
  input.rows = 4;
  input.style.width = "100%";

  button.type = "submit";
  button.textContent = "送出";

  validation.setAttribute("data-testid", "chat-validation");
  validation.style.color = "crimson";

  form.append(input, button);
  container.append(form, validation);

  return {
    container,
    form,
    input,
    validation,
    getValue: () => input.value,
    clear: () => {
      input.value = "";
      validation.textContent = "";
    },
  };
}

export function validateAndDisplay(inputView: ChatInputView): boolean {
  const result = validateUserMessage(inputView.getValue());
  if (result.valid) {
    inputView.validation.textContent = "";
    return true;
  }
  inputView.validation.textContent = result.message;
  return false;
}

