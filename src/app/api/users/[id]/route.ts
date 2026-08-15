import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/api-auth";
import { writeAuditLog } from "@/lib/audit";
import { ALL_ROLES, type Role } from "@/lib/constants";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const authz = await requirePermission("users:manage");
  if (authz.error) return authz.error;

  const { id } = await params;
  const body = await req.json();
  const name = body.name !== undefined ? String(body.name || "").trim() || null : undefined;
  const role = body.role !== undefined ? (String(body.role) as Role) : undefined;
  const password = body.password ? String(body.password) : undefined;

  if (role && !ALL_ROLES.includes(role)) {
    return NextResponse.json({ error: "Некорректная роль" }, { status: 400 });
  }
  if (password && password.length < 6) {
    return NextResponse.json(
      { error: "Пароль должен быть не короче 6 символов" },
      { status: 400 }
    );
  }

  const data: {
    name?: string | null;
    role?: string;
    passwordHash?: string;
  } = {};
  if (name !== undefined) data.name = name;
  if (role) data.role = role;
  if (password) data.passwordHash = await bcrypt.hash(password, 12);

  try {
    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        updatedAt: true,
      },
    });

    await writeAuditLog({
      userId: authz.session!.user.id,
      entity: "User",
      entityId: id,
      action: "UPDATE",
      diff: { name, role, passwordChanged: !!password },
    });

    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const authz = await requirePermission("users:manage");
  if (authz.error) return authz.error;

  const { id } = await params;
  if (id === authz.session!.user.id) {
    return NextResponse.json(
      { error: "Нельзя удалить собственную учётную запись" },
      { status: 400 }
    );
  }

  try {
    await prisma.user.delete({ where: { id } });
    await writeAuditLog({
      userId: authz.session!.user.id,
      entity: "User",
      entityId: id,
      action: "DELETE",
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
  }
}
