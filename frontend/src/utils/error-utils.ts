import axios, { AxiosError } from "axios";
import { StatusCodes } from "http-status-codes";
import { toast, TypeOptions } from "react-toastify";

export class ApiResponseError extends Error {
  messageType?: TypeOptions;

  constructor(message: string, messageType?: TypeOptions) {
    super(message);
    this.name = "ApiResponseError";
    this.messageType = messageType;
  }
}

export function isForbiddenOrNotAuthenticated(error: AxiosError) {
  return [StatusCodes.UNAUTHORIZED, StatusCodes.FORBIDDEN].some(
    (statusCode) => error?.response?.status === statusCode,
  );
}

export function resolveApiError(error: ApiResponseError) {
  const { message, messageType } = error;
  messageType && toast(message, { type: messageType });
}

export function errorHandlerWrapper<T extends unknown[], R = unknown>(
  fn: (...args: T) => Promise<R>,
  {
    logMessageLabel = "Error",
    defaultErrorMessage = "An unknown error has occurred.",
  }: { logMessageLabel?: string; defaultErrorMessage?: string } = {},
) {
  return async (...args: T) => {
    try {
      return (await fn(...args)) as R;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log(`${logMessageLabel}:`, args, error, error?.response);

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        const { detail = defaultErrorMessage } =
          axiosError?.response?.data ?? {};

        throw new ApiResponseError(detail, "error");
      } else if (error?.toString() !== "Cancel") {
        throw new ApiResponseError(
          error?.message || defaultErrorMessage,
          "error",
        );
      } else {
        throw new ApiResponseError(error);
      }
    }
  };
}
