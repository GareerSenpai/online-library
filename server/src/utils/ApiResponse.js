class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    super();
    this.statusCode = statusCode;
    this.data = data;
    this.success = statusCode < 400;
    this.message = message;
  }
}

export default ApiResponse;
