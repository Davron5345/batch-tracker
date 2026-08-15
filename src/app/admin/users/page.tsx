"use client";

import { FormEvent, useEffect, useState } from "react";
import { ROLE_LABELS } from "@/lib/rbac";
import { ALL_ROLES, type Role } from "@/lib/constants";
import { formatDateTimeRu } from "@/lib/utils";

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  createdAt: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("VIEWER");
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await fetch("/api/users");
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Нет доступа");
      return;
    }
    setUsers(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, password, role }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Ошибка создания");
      return;
    }
    setEmail("");
    setName("");
    setPassword("");
    setRole("VIEWER");
    await load();
  }

  async function onRoleChange(id: string, nextRole: Role) {
    const res = await fetch(`/api/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: nextRole }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Ошибка обновления");
      return;
    }
    await load();
  }

  async function onResetPassword(id: string) {
    const next = prompt("Новый пароль (мин. 6 символов):");
    if (!next) return;
    const res = await fetch(`/api/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: next }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Ошибка смены пароля");
      return;
    }
    alert("Пароль обновлён");
  }

  async function onDelete(id: string) {
    if (!confirm("Удалить пользователя?")) return;
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Ошибка удаления");
      return;
    }
    await load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="admin-page-title">Пользователи</h1>
        <p className="mt-1 text-[var(--muted)]">Только для супер-админа</p>
      </div>

      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

      <form onSubmit={onCreate} className="card grid gap-3 p-4 sm:p-5 sm:grid-cols-2">
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="off"
          />
        </div>
        <div className="field">
          <label htmlFor="name">Имя</label>
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="password">Пароль</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        <div className="field">
          <label htmlFor="role">Роль</label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
          >
            {ALL_ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={loading}>
            {loading ? "Создание…" : "Добавить пользователя"}
          </button>
        </div>
      </form>

      <div className="mobile-card-list md:hidden">
        {users.map((user) => (
          <div key={user.id} className="mobile-card space-y-3">
            <div>
              <div className="font-semibold">{user.email}</div>
              <div className="mobile-card-meta">
                {user.name || "—"} · {formatDateTimeRu(user.createdAt)}
              </div>
            </div>
            <div className="field">
              <label htmlFor={`role-${user.id}`}>Роль</label>
              <select
                id={`role-${user.id}`}
                value={user.role}
                onChange={(e) => onRoleChange(user.id, e.target.value as Role)}
              >
                {ALL_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-secondary flex-1"
                onClick={() => onResetPassword(user.id)}
              >
                Пароль
              </button>
              <button
                type="button"
                className="btn btn-danger flex-1"
                onClick={() => onDelete(user.id)}
              >
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="card hidden overflow-hidden md:block">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Имя</th>
                <th>Роль</th>
                <th>Создан</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="font-medium">{user.email}</td>
                  <td>{user.name || "—"}</td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(e) => onRoleChange(user.id, e.target.value as Role)}
                      className="min-h-11 rounded-lg border border-[var(--border)] px-2 py-1 text-base"
                    >
                      {ALL_ROLES.map((r) => (
                        <option key={r} value={r}>
                          {ROLE_LABELS[r]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>{formatDateTimeRu(user.createdAt)}</td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => onResetPassword(user.id)}
                      >
                        Пароль
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => onDelete(user.id)}
                      >
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
