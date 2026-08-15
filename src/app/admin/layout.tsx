import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminNav } from "@/components/AdminNav";
import type { Role } from "@/lib/constants";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/admin");
  }

  return (
    <div className="admin-shell min-h-screen lg:flex">
      <AdminNav
        user={{
          email: session.user.email,
          name: session.user.name,
          role: session.user.role as Role,
        }}
      />
      <main className="admin-main flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
