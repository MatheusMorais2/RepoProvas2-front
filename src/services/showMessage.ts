import { AxiosError } from "axios";
import { AlertMessage } from "../contexts/AlertContext";

export function showMessage(
  error: Error | AxiosError | any,
  setMessage: (newMessage: AlertMessage | null) => void
) {
  if (error.response) {
    setMessage({
      type: "error",
      text: error.response.data,
    });
    return;
  }

  setMessage({
    type: "error",
    text: "Erro, tente novamente em alguns segundos!",
  });
}
