import Link from "next/link";
import { getDashboardStats, getAllOrders } from "@/lib/admin-data";
import { formatPrice, formatDate } from "@/lib/format";
import { AdminHeader, StatCard, EmptyState, StatusBadge, Table, Th, Td } from "./ui";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [stats, orders] = await Promise.all([getDashboardStats(), getAllOrders()]);
  const recent = orders.slice(0, 6);

  return (
    <>
      <AdminHeader eyebrow="Resumen" title="Panel" />

      {!stats.configured && (
        <div className="panel mb-6 p-4 text-[0.9rem] text-ash-400">
          Base de datos no conectada — mostrando datos de demostración.
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Ingresos" value={formatPrice(stats.revenueCents)} hint="Pedidos pagados" />
        <StatCard label="Pedidos" value={String(stats.paidOrders)} hint="Pagados" />
        <StatCard label="Clientes" value={String(stats.customers)} hint="Con compras" />
        <StatCard label="Suscriptores" value={String(stats.subscribers)} hint="Boletín" />
      </div>

      <div className="mt-10 mb-4 flex items-center justify-between">
        <h2 className="text-[1.2rem] text-bone-50">Pedidos recientes</h2>
        <Link href="/admin/pedidos" className="text-[0.85rem] text-ash-400 transition-colors hover:text-bone-100">
          Ver todos →
        </Link>
      </div>

      {recent.length === 0 ? (
        <EmptyState title="Aún no hay pedidos" hint="Las compras aparecerán aquí en cuanto se realicen." />
      ) : (
        <Table
          head={
            <tr>
              <Th>Fecha</Th>
              <Th>Cliente</Th>
              <Th>Títulos</Th>
              <Th className="text-right">Total</Th>
              <Th>Estado</Th>
            </tr>
          }
        >
          {recent.map((o) => (
            <tr key={o.id}>
              <Td className="whitespace-nowrap text-ash-400">{formatDate(o.createdAt)}</Td>
              <Td className="max-w-[14rem] truncate">{o.email ?? o.userId ?? "—"}</Td>
              <Td className="text-ash-300">{o.items.map((i) => i.title).join(", ") || "—"}</Td>
              <Td className="whitespace-nowrap text-right font-medium text-bone-50">
                {formatPrice(o.totalCents, o.currency)}
              </Td>
              <Td><StatusBadge status={o.status} /></Td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
