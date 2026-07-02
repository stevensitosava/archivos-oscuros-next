import { getAllOrders } from "@/lib/admin-data";
import { formatPrice, formatDate } from "@/lib/format";
import { AdminHeader, EmptyState, StatusBadge, Table, Th, Td } from "../ui";

export const dynamic = "force-dynamic";

export default async function AdminPedidos() {
  const orders = await getAllOrders();
  const paidTotal = orders.filter((o) => o.status === "paid").reduce((s, o) => s + o.totalCents, 0);

  return (
    <>
      <AdminHeader
        eyebrow="Ventas"
        title="Pedidos"
        action={
          <p className="text-[0.85rem] text-ash-400">
            {orders.length} pedido(s) · <span className="text-bone-100">{formatPrice(paidTotal)}</span> cobrados
          </p>
        }
      />

      {orders.length === 0 ? (
        <EmptyState title="Aún no hay pedidos" hint="Cuando un cliente compre, el pedido aparecerá aquí con su estado." />
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
          {orders.map((o) => (
            <tr key={o.id}>
              <Td className="whitespace-nowrap text-ash-400">{formatDate(o.createdAt)}</Td>
              <Td className="max-w-[16rem] truncate">{o.email ?? o.userId ?? "—"}</Td>
              <Td className="text-ash-300">
                {o.items.length ? o.items.map((i) => i.title).join(", ") : "—"}
              </Td>
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
