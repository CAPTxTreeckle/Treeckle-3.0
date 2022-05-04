import axios from "axios";
import { StatusCodes } from "http-status-codes";
import { toast, TypeOptions } from "react-toastify";
import { resetAppState } from "../redux/store";
import { isRecord } from "./transform-utils";

export const EXPIRED_SESSION_MSG =
  "Your current session has expired. Please log in again.";

export class ApiResponseError extends Error {
  messageType?: TypeOptions;

  constructor(message: string, messageType?: TypeOptions) {
    super(message);
    this.name = "ApiResponseError";
    this.messageType = messageType;
  }
}

export function isErrorWithMessage(
  error: unknown,
): error is { message: string } {
  return (
    isRecord(error) && "message" in error && typeof error.message === "string"
  );
}

export function isErrorWithDetail(error: unknown): error is { detail: string } {
  return (
    isRecord(error) && "detail" in error && typeof error.detail === "string"
  );
}

export function isForbiddenOrNotAuthenticated(error: unknown) {
  return (
    axios.isAxiosError(error) &&
    [StatusCodes.UNAUTHORIZED, StatusCodes.FORBIDDEN].some(
      (statusCode) => error.response?.status === statusCode,
    )
  );
}

export function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    return isErrorWithDetail(error.response?.data)
      ? error.response?.data.detail
      : JSON.stringify(error.response?.data);
  }

  if (isErrorWithMessage(error)) {
    return error.message;
  }

  return undefined;
}

export function resolveApiError(error: ApiResponseError) {
  const { message, messageType } = error;

  messageType && toast(message, { type: messageType });

  if (message === EXPIRED_SESSION_MSG) {
    resetAppState();
  }
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
    } catch (error) {
      console.log(`${logMessageLabel}:`, args, error);

      const message = getErrorMessage(error) ?? defaultErrorMessage;

      throw new ApiResponseError(message, "error");
    }
  };
}
