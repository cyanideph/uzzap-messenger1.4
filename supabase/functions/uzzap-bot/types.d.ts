// Type declarations for Deno environment
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

declare module 'http/server' {
  export function serve(handler: (req: Request) => Promise<Response>): void;
}

declare module 'supabase' {
  export interface SupabaseClient {
    auth: {
      signInWithPassword(credentials: { email: string; password: string }): Promise<{
        data: any;
        error: any;
      }>;
    };
    from(table: string): {
      select(columns?: string, options?: any): this;
      insert(values: any): this;
      update(values: any): this;
      delete(): this;
      eq(column: string, value: any): this;
      or(filter: string): this;
      order(column: string, options?: { ascending: boolean }): this;
      single(): Promise<{ data: any; error: any }>;
      count?: string;
    };
  }
  
  export function createClient(url: string, key: string): SupabaseClient;
}
