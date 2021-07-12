import { AxiosError } from "axios";
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
  f: (...args: T) => Promise<R>,
  logMessageLabel = "Error",
) {
  return async (...args: T) => {
    try {
      return (await f(...args)) as R;
    } catch (error) {
      console.log(`${logMessageLabel}:`, args, error, error?.response);

      if (error?.isAxiosError) {
        const axiosError = error as AxiosError;
        const { detail = "An unknown error has occurred." } =
          axiosError?.response?.data ?? {};

        throw new ApiResponseError(detail, "error");
      } else if (error?.toString() !== "Cancel") {
        throw new ApiResponseError(
          error?.message || "An unknown error has occurred.",
          "error",
        );
      } else {
        throw new ApiResponseError(error);
      }
    }
  };
}
