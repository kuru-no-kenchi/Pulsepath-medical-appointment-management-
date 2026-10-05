import { ApiErrorCode, ApiError } from "@/types/error";
import axios from "axios";

type BackendErrorResponse = {
  message?: string;
  error?: string;
  detail?: string;
  timestamp?: string;
  path?: string;
  status?: number;
};

function getErrorCode(status: number): ApiErrorCode {
  switch (status) {
    case 400:
      return "BAD_REQUEST";

    case 401:
      return "UNAUTHORIZED";

    case 403:
      return "FORBIDDEN";

    case 404:
      return "NOT_FOUND";

    case 409:
      return "CONFLICT";

    case 500:
    default:
      return status >= 500 ? "SERVER_ERROR" : "UNKNOWN";
  }
}

export function normalizeApiError(error: unknown): ApiError {
  // Already normalized
  if (error instanceof ApiError) {
    return error;
  }
  // Network / Axios error
  if (axios.isAxiosError<BackendErrorResponse>(error)) {
    // Request was sent but backend didn't respond
    if (!error.response) {
      return new ApiError(
        "Unable to connect to the server. Please check your connection and try again.",
        null,
        "NETWORK_ERROR"
      );
    }

    const status = error.response.status;
    const data = error.response.data;

    const message =
      data?.message ||
      data?.detail ||
      data?.error ||
      getDefaultMessage(status);

    return new ApiError(
      message,
      status,
      getErrorCode(status),
      data
    );
  }

  // Unknown JavaScript error
  if (error instanceof Error) {
    return new ApiError(
      error.message,
      null,
      "UNKNOWN"
    );
  }

  return new ApiError(
    "An unexpected error occurred.",
    null,
    "UNKNOWN"
  );
}

function getDefaultMessage(status: number): string {
  switch (status) {
    case 400:
      return "The request is invalid.";

    case 401:
      return "You are not authenticated.";

    case 403:
      return "You do not have permission to perform this action.";

    case 404:
      return "The requested resource was not found.";

    case 409:
      return "This action conflicts with the current state of the resource.";

    case 500:
      return "An unexpected server error occurred.";

    default:
      return "An unexpected error occurred.";
  }
}