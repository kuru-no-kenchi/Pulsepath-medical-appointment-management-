export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "SERVER_ERROR"
  | "NETWORK_ERROR"
  | "UNKNOWN";

export class ApiError extends Error {
  status: number | null;
  code: ApiErrorCode;
  details?: unknown;

  constructor(
    message: string,
    status: number | null,
    code: ApiErrorCode,
    details?: unknown
  ) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}