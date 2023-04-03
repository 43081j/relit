declare module 'dlv' {
  export default function dlv(
    obj: unknown,
    key: string,
    defaultValue?: unknown
  ): unknown;
}
