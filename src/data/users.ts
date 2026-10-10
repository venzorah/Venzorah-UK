export type Role = "customer" | "vendor" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // demo only — production stores an Argon2 hash server-side
  role: Role;
  vendorId?: string;
  phone?: string;
  marketingConsent: boolean;
  createdAt: string;
}

export const seedUsers: User[] = [
{ id: "u-customer", name: "Chioma Okafor", email: "customer@venzorah.demo", password: "demo1234", role: "customer", phone: "07700 900100", marketingConsent: false, createdAt: "2026-06-02" },
{ id: "u-ada", name: "Ada Nwosu", email: "ada@venzorah.demo", password: "demo1234", role: "vendor", vendorId: "v-ada", marketingConsent: false, createdAt: "2026-03-11" },
{ id: "u-tola", name: "Tola Adeyemi", email: "tola@venzorah.demo", password: "demo1234", role: "vendor", vendorId: "v-crown", marketingConsent: false, createdAt: "2026-04-20" },
{ id: "u-admin", name: "Super Admin", email: "admin@venzorah.demo", password: "demo1234", role: "admin", marketingConsent: false, createdAt: "2026-01-01" }];


export const demoAccounts = [
{ label: "Customer", email: "customer@venzorah.demo" },
{ label: "Food vendor", email: "ada@venzorah.demo" },
{ label: "Salon vendor", email: "tola@venzorah.demo" },
{ label: "Admin", email: "admin@venzorah.demo" }];