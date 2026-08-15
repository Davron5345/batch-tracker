import { Role } from "./constants";

export type Permission =
  | "products:read"
  | "products:write"
  | "batches:read"
  | "batches:write"
  | "media:write"
  | "directories:read"
  | "directories:write"
  | "users:manage"
  | "audit:read";

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  VIEWER: ["products:read", "batches:read", "directories:read", "audit:read"],
  EDITOR: [
    "products:read",
    "batches:read",
    "batches:write",
    "media:write",
    "directories:read",
    "audit:read",
  ],
  ADMIN: [
    "products:read",
    "products:write",
    "batches:read",
    "batches:write",
    "media:write",
    "directories:read",
    "directories:write",
    "audit:read",
  ],
  SUPER_ADMIN: [
    "products:read",
    "products:write",
    "batches:read",
    "batches:write",
    "media:write",
    "directories:read",
    "directories:write",
    "users:manage",
    "audit:read",
  ],
};

export function hasPermission(role: Role | string, permission: Permission): boolean {
  const perms = ROLE_PERMISSIONS[role as Role];
  return perms?.includes(permission) ?? false;
}

export function canWriteProducts(role: Role | string): boolean {
  return hasPermission(role, "products:write");
}

export function canWriteBatches(role: Role | string): boolean {
  return hasPermission(role, "batches:write");
}

export function canWriteDirectories(role: Role | string): boolean {
  return hasPermission(role, "directories:write");
}

export function canManageUsers(role: Role | string): boolean {
  return hasPermission(role, "users:manage");
}

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Супер-админ",
  ADMIN: "Админ",
  EDITOR: "Редактор",
  VIEWER: "Наблюдатель",
};
