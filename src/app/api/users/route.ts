import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/api-auth";
import { writeAuditLog } from "@/lib/audit";
import { ALL_ROLES, type Role } from "@/lib/constants";

export async function GET() {
  const authz = await requirePermission("users:manage");
  if (authz.error) return authz.error;

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const authz = await requirePermission("users:manage");
  if (authz.error) return authz.error;

  const body = await req.json();
  const email = String(body.email || "").trim().toLowerCase();
  const name = body.name ? String(body.name).trim() : null;
  const password = String(body.password || "");
  const role = String(body.role || "VIEWER") as Role;

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email и пароль обязательны" },
      { status: 400 }
    );
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: "Пароль должен быть не короче 6 символов" },
      { status: 400 }
    );
  }
  if (!ALL_ROLES.includes(role)) {
    return NextResponse.json({ error: "Некорректная роль" }, { status: 400 });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, name, role, passwordHash },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    await writeAuditLog({
      userId: authz.session!.user.id,
      entity: "User",
      entityId: user.id,
      action: "CREATE",
      diff: { email, name, role },
    });

    return NextResponse.json(user, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Пользователь с таким email уже существует" },
      { status: 409 }
    );
  }
}
