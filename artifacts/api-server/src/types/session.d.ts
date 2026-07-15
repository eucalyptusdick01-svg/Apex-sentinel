import "express-session";

declare module "express-session" {
  interface SessionData {
    userId: string;
    isAdmin: boolean;
    email: string;
    pwVersion: number;
  }
}
