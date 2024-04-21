class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong in the API",
    errors = [],
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null; // read about this
    this.message = message;
    this.errors = errors;
    this.success = false;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// we can throw this as an error and also send as a response

export default ApiError;
