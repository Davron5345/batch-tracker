import { auth } from "@/lib/auth";
import { hasPermission, type Permission } from "@/lib/rbac";
import type { Role } from "@/lib/constants";
import { NextResponse } from "next/server";

export async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "Требуется авторизация" }, { status: 401 }) };
  }
  return { session };
}

export async function requirePermission(permission: Permission) {
  const result = await requireSession();
  if ("error" in result && result.error) return result;

  const role = result.session!.user.role as Role;
  if (!hasPermission(role, permission)) {
    return {
      error: NextResponse.json({ error: "Недостаточно прав" }, { status: 403 }),
      session: result.session,
    };
  }
  return { session: result.session! };
}
