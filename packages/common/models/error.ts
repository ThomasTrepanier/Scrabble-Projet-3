export declare type ValidationError =
    | {
          param: '_error';
          msg: unknown;
          nestedErrors: ValidationError[];
          location?: undefined;
          value?: undefined;
      }
    | {
          location: string;
          param: string;
          value: unknown;
          msg: unknown;
          nestedErrors?: unknown[];
      };

export interface ErrorResponse {
    message: string;
    error: string;
    validationErrors?: ValidationError[];
    stack?: string[];
}

export interface SocketErrorResponse extends ErrorResponse {
    status: number;
}

export interface StatusError {
    message: string;
    status: number;
}
