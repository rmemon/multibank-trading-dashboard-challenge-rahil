/**
 * In-memory mock users (passwords stored as bcrypt hashes).
 * Passwords: demo@trading.local → demo1234, trader@example.com → secret123
 */
export type MockUserRecord = {
  id: string;
  email: string;
  /** bcrypt hash */
  passwordHash: string;
};

export const MOCK_USERS: MockUserRecord[] = [
  {
    id: "usr_demo_1",
    email: "demo@trading.local",
    passwordHash: "$2b$10$vfOf5whR5fbxu10EzbAak.4AqG1jb/kXIu4qEKTHMbav3oOvt63HS",
  },
  {
    id: "usr_trader_2",
    email: "trader@example.com",
    passwordHash: "$2b$10$kfmgoE/6rrMYiy0DiGMp3ei03u72R2GrcZ/VyeDbro8HySFcU6nuq",
  },
];

export function findUserByEmail(email: string): MockUserRecord | undefined {
  const normalized = email.trim().toLowerCase();
  return MOCK_USERS.find((u) => u.email.toLowerCase() === normalized);
}
