"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";
  const [email, setEmail] = useState("admin@local");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("Неверный email или пароль");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card mx-auto w-full max-w-md space-y-4 p-6 shadow-sm">
      <div>
        <h1
          className="text-2xl font-semibold"
          style={{ fontFamily: "Literata, Georgia, serif" }}
        >
          Вход
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Админка учёта партий</p>
      </div>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="password">Пароль</label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
      <button type="submit" className="btn btn-primary w-full" disabled={loading}>
        {loading ? "Вход…" : "Войти"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main
      className="flex min-h-screen items-center px-4 py-10"
      style={{
        background:
          "radial-gradient(circle at 20% 20%, #d8f3e7 0%, transparent 40%), #f4f6f8",
      }}
    >
      <Suspense fallback={<div className="mx-auto text-[var(--muted)]">Загрузка…</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
