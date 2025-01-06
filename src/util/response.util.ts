export class ApiResponse<T> {
  success: boolean;
  code: number;
  message: string;
  data?: T;
  timestamp: string;
  meta?: Record<string, number>;

  constructor(
    success: boolean,
    code: number,
    message: string,
    data?: T,
    meta?: Record<string, any>,
  ) {
    this.success = success;
    this.code = code;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
    this.meta = meta;
  }

  static successResponse<T>(
    message: string,
    data?: T,
    code: number = 200,
    meta?: Record<string, number | string>,
  ): ApiResponse<T> {
    return new ApiResponse(true, code, message, data, meta);
  }
}
