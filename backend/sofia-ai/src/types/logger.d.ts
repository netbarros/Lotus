/**
 * Custom logger type definitions to handle flexible pino signatures
 */

declare module '../utils/logger' {
  export const logger: {
    info(msg: string, obj?: any, ...args: any[]): void;
    error(msg: string, obj?: any, ...args: any[]): void;
    warn(msg: string, obj?: any, ...args: any[]): void;
    debug(msg: string, obj?: any, ...args: any[]): void;
    trace(msg: string, obj?: any, ...args: any[]): void;
    fatal(msg: string, obj?: any, ...args: any[]): void;
  };
}
