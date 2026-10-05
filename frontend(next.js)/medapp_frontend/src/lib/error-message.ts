import { ApiError } from "@/types/error";


export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  if (!(error instanceof ApiError)) {
    return fallback;
  }

  switch (error.code) {
    case "BAD_REQUEST":
      return error.message || "Please check the information you entered.";

    case "UNAUTHORIZED":
      return "Your session has expired. Please sign in again.";

    case "FORBIDDEN":
      return "You do not have permission to perform this action.";

    case "NOT_FOUND":
      return "The requested resource could not be found.";

    case "CONFLICT":
      return error.message || "This action conflicts with the current state.";

    case "SERVER_ERROR":
      return "Something went wrong on the server. Please try again later.";

    case "NETWORK_ERROR":
      return "Unable to connect to the server. Please check your connection.";

    default:
      return error.message || fallback;
  }
}