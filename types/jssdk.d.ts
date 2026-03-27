declare module 'jssdk' {
  export interface JSSDKConfig {
    appId: string;
    timestamp: number;
    nonceStr: string;
    signature: string;
  }

  export function config(options: JSSDKConfig): void;
  export function ready(callback: () => void): void;
  export function error(callback: (err: Error) => void): void;
}
