import { prisma } from "@/lib/prisma";
import { formatDateTimeRu } from "@/lib/utils";

export default async function AuditPage() {
  const logs = await prisma.auditLog.findMany({
    include: {
      user: { select: { email: true, name: true } },
      batch: { select: { batchNumber: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const actionLabels: Record<string, string> = {
    CREATE: "Создание",
    UPDATE: "Изменение",
    DELETE: "Удаление",
    YOUTUBE_UPLOAD: "YouTube",
    ARCHIVE: "Архив",
    ARCHIVE_PURGE: "Очистка архива",
  };

  const entityLabels: Record<string, string> = {
    Product: "Товар",
    Batch: "Партия",
    Media: "Медиа",
    User: "Пользователь",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="admin-page-title">Журнал изменений</h1>
        <p className="mt-1 text-[var(--muted)]">Кто, что и когда изменил</p>
      </div>

      <div className="mobile-card-list md:hidden">
        {logs.length === 0 && (
          <div className="mobile-card text-[var(--muted)]">Записей пока нет</div>
        )}
        {logs.map((log) => (
          <div key={log.id} className="mobile-card">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="badge badge-muted">
                {actionLabels[log.action] || log.action}
              </span>
              <span className="text-xs text-[var(--muted)]">
                {formatDateTimeRu(log.createdAt)}
              </span>
            </div>
            <div className="mt-2 font-semibold">
              {entityLabels[log.entity] || log.entity}
              {log.batch?.batchNumber ? ` · ${log.batch.batchNumber}` : ""}
            </div>
            <div className="mobile-card-meta">{log.user?.email || "—"}</div>
            {log.diff && (
              <pre className="mt-2 max-h-28 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-[#f8fafc] p-2 text-xs text-[var(--muted)]">
                {log.diff}
              </pre>
            )}
          </div>
        ))}
      </div>

      <div className="card hidden overflow-hidden md:block">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Когда</th>
                <th>Кто</th>
                <th>Сущность</th>
                <th>Действие</th>
                <th>Партия</th>
                <th>Детали</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-[var(--muted)]">
                    Записей пока нет
                  </td>
                </tr>
              )}
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="whitespace-nowrap">{formatDateTimeRu(log.createdAt)}</td>
                  <td>{log.user?.email || "—"}</td>
                  <td>
                    {entityLabels[log.entity] || log.entity}
                    <div className="text-xs text-[var(--muted)]">{log.entityId}</div>
                  </td>
                  <td>{actionLabels[log.action] || log.action}</td>
                  <td>{log.batch?.batchNumber || "—"}</td>
                  <td>
                    <pre className="max-w-xs overflow-x-auto whitespace-pre-wrap text-xs text-[var(--muted)]">
                      {log.diff || "—"}
                    </pre>
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
