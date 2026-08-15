"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useState, type ReactNode } from "react";
import { ROLE_LABELS, canManageUsers, canWriteProducts } from "@/lib/rbac";
import type { Role } from "@/lib/constants";

type NavItem = {
  href: string;
  label: string;
  short: string;
  match: (p: string) => boolean;
};

const primaryLinks: NavItem[] = [
  {
    href: "/admin",
    label: "Дашборд",
    short: "Главная",
    match: (p) => p === "/admin",
  },
  {
    href: "/admin/batches",
    label: "Партии",
    short: "Партии",
    match: (p) => p.startsWith("/admin/batches"),
  },
  {
    href: "/admin/products",
    label: "Товары",
    short: "Товары",
    match: (p) => p.startsWith("/admin/products"),
  },
];

const secondaryBase: NavItem[] = [
  {
    href: "/admin/audit",
    label: "Журнал",
    short: "Журнал",
    match: (p) => p.startsWith("/admin/audit"),
  },
];

function IconHome({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.12 : 0}
      />
    </svg>
  );
}

function IconBatch({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="4"
        y="5"
        width="16"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.12 : 0}
      />
      <path d="M8 9h8M8 12h8M8 15h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconBox({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3 20 7.5v9L12 21l-8-4.5v-9L12 3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.12 : 0}
      />
      <path d="M12 12 20 7.5M12 12v9M12 12 4 7.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function IconMenu() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

const tabIcons: Record<string, (p: { active?: boolean }) => ReactNode> = {
  "/admin": IconHome,
  "/admin/batches": IconBatch,
  "/admin/products": IconBox,
};

export function AdminNav({
  user,
}: {
  user: { email: string; name?: string | null; role: Role };
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const secondary = [
    ...secondaryBase,
    ...(canManageUsers(user.role)
      ? [
          {
            href: "/admin/users",
            label: "Пользователи",
            short: "Юзеры",
            match: (p: string) => p.startsWith("/admin/users"),
          } satisfies NavItem,
        ]
      : []),
  ];

  const allLinks = [...primaryLinks, ...secondary];
  const moreActive = secondary.some((item) => item.match(pathname));

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  function NavLinks({
    items,
    stacked,
  }: {
    items: NavItem[];
    stacked?: boolean;
  }) {
    return (
      <nav className={stacked ? "flex flex-col gap-1" : "flex flex-col gap-1"}>
        {items.map((item) => {
          const active = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${
                active
                  ? "bg-[#e8f5f0] text-[var(--accent)]"
                  : "text-[var(--foreground)] hover:bg-[#f4f6f8]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    );
  }

  function UserBlock() {
    return (
      <div className="space-y-3 border-t border-[var(--border)] pt-4 text-sm">
        <div>
          <div className="font-semibold">{user.name || user.email}</div>
          <div className="text-[var(--muted)]">{ROLE_LABELS[user.role]}</div>
        </div>
        {!canWriteProducts(user.role) && (
          <p className="text-xs text-[var(--muted)]">Права ограничены ролью</p>
        )}
        <Link
          href="/scan"
          onClick={() => setOpen(false)}
          className="btn btn-secondary w-full"
        >
          Сканер QR
        </Link>
        <button
          type="button"
          className="btn btn-secondary w-full"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          Выйти
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col gap-6 border-r border-[var(--border)] bg-white p-4 lg:flex lg:min-h-screen">
        <div>
          <div
            className="text-xl font-semibold tracking-tight"
            style={{ fontFamily: "Literata, Georgia, serif" }}
          >
            Партии
          </div>
          <p className="mt-1 text-sm text-[var(--muted)]">Учёт товаров и QR</p>
        </div>
        <NavLinks items={allLinks} stacked />
        <div className="mt-auto">
          <UserBlock />
        </div>
      </aside>

      {/* Mobile / tablet top bar */}
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-white/95 backdrop-blur lg:hidden"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="flex h-14 items-center justify-between gap-3 px-4">
          <div className="min-w-0">
            <div
              className="truncate text-lg font-semibold"
              style={{ fontFamily: "Literata, Georgia, serif" }}
            >
              Партии
            </div>
            <p className="truncate text-xs text-[var(--muted)]">
              {ROLE_LABELS[user.role]}
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary !min-h-11 !px-3"
            aria-label={open ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <IconClose /> : <IconMenu />}
          </button>
        </div>
      </header>

      {/* Drawer overlay */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-black/35"
            aria-label="Закрыть"
            onClick={() => setOpen(false)}
          />
          <div
            className="absolute right-0 top-0 flex h-full w-[min(100%,20rem)] flex-col gap-4 bg-white p-4 shadow-xl"
            style={{ paddingTop: "calc(1rem + env(safe-area-inset-top))" }}
          >
            <div className="flex items-center justify-between">
              <div
                className="text-lg font-semibold"
                style={{ fontFamily: "Literata, Georgia, serif" }}
              >
                Меню
              </div>
              <button
                type="button"
                className="btn btn-secondary !min-h-11 !px-3"
                aria-label="Закрыть"
                onClick={() => setOpen(false)}
              >
                <IconClose />
              </button>
            </div>
            <NavLinks items={allLinks} stacked />
            <div className="mt-auto">
              <UserBlock />
            </div>
          </div>
        </div>
      )}

      {/* Mobile / tablet bottom tabs */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-white/95 backdrop-blur lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label="Основная навигация"
      >
        <div className="mx-auto grid max-w-lg grid-cols-4">
          {primaryLinks.map((item) => {
            const active = item.match(pathname);
            const Icon = tabIcons[item.href] || IconHome;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-[3.5rem] flex-col items-center justify-center gap-0.5 px-1 text-[11px] font-semibold ${
                  active ? "text-[var(--accent)]" : "text-[var(--muted)]"
                }`}
              >
                <Icon active={active} />
                <span>{item.short}</span>
              </Link>
            );
          })}
          <button
            type="button"
            className={`flex min-h-[3.5rem] flex-col items-center justify-center gap-0.5 px-1 text-[11px] font-semibold ${
              moreActive || open ? "text-[var(--accent)]" : "text-[var(--muted)]"
            }`}
            onClick={() => setOpen(true)}
          >
            <IconMenu />
            <span>Ещё</span>
          </button>
        </div>
      </nav>
    </>
  );
}
