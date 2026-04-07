/**
 * Demo accounts (must match backend mock users — see backend `mockUsers.ts`).
 * Shown on the login page only; authentication is performed by the API.
 */
export type DemoAccount = {
  label: string;
  email: string;
  password: string;
};

export const DEMO_ACCOUNTS: DemoAccount[] = [
  { label: "Demo", email: "demo@trading.local", password: "demo1234" },
  { label: "Trader", email: "trader@example.com", password: "secret123" },
];
