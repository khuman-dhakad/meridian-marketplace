/**
 * Custom application errors for clean error handling across boundaries.
 * None of these errors expose raw database strings, connection details, or stack traces to clients.
 */

export class DatabaseUnavailableError extends Error {
  constructor(message = "Database service is currently unavailable. Please try again shortly.") {
    super(message);
    this.name = "DatabaseUnavailableError";
  }
}

export class AuthorizationError extends Error {
  constructor(message = "You are not authorized to perform this operation.") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export class ValidationError extends Error {
  public readonly fieldErrors?: Record<string, string[]>;

  constructor(message: string, fieldErrors?: Record<string, string[]>) {
    super(message);
    this.name = "ValidationError";
    this.fieldErrors = fieldErrors;
  }
}

export class AuthenticationError extends Error {
  constructor(message = "Invalid email or password.") {
    super(message);
    this.name = "AuthenticationError";
  }
}
