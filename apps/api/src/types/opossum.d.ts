declare module 'opossum' {
  import { EventEmitter } from 'events';

  export interface CircuitBreakerOptions {
    timeout?: number;
    errorThresholdPercentage?: number;
    resetTimeout?: number;
    name?: string;
    [key: string]: any;
  }

  export default class CircuitBreaker extends EventEmitter {
    constructor(action: (...args: any[]) => Promise<any>, options?: CircuitBreakerOptions);
    fire(...args: any[]): Promise<any>;
    opened: boolean;
    halfOpen: boolean;
    closed: boolean;
    fallback(fn: (...args: any[]) => any): this;
  }
}
