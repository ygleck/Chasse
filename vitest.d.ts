declare module 'vitest' {
  type MaybePromise<T = void> = T | Promise<T>;

  interface Assertion {
    toBe(expected: unknown): void;
    toEqual(expected: unknown): void;
    toBeGreaterThan(expected: number): void;
    toBeLessThan(expected: number): void;
  }

  export function describe(name: string, fn: () => MaybePromise): void;
  export function it(name: string, fn: () => MaybePromise): void;
  export function expect(value: unknown): Assertion;
}

declare module 'vitest/config' {
  export function defineConfig(config: Record<string, unknown>): Record<string, unknown>;
}
