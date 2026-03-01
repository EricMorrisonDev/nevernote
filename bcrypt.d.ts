declare module 'bcrypt' {
  export function hash(data: string, saltRounds: number): Promise<string>
  export function compare(data: string, hash: string): Promise<boolean>
}
