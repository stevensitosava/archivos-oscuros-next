import { getAllCustomers } from "@/lib/admin-data";
import { formatPrice, formatDate } from "@/lib/format";
import { AdminHeader, EmptyState, Table, Th, Td } from "../ui";

export const dynamic = "force-dynamic";

export default async function AdminClientes() {
  const customers = await getAllCustomers();

  return (
    <>
      <AdminHeader
        eyebrow="CRM"
        title="Clientes"
        action={<p className="text-[0.85rem] text-ash-400">{customers.length} cliente(s)</p>}
      />

      {customers.length === 0 ? (
        <EmptyState title="Aún no hay clientes" hint="Aparecerán aquí en cuanto alguien cree una cuenta o compre." />
      ) : (
        <Table
          head={
            <tr>
              <Th>Cliente</Th>
              <Th className="text-right">Pedidos</Th>
              <Th className="text-right">Gastado</Th>
              <Th className="text-right">Libros</Th>
              <Th>Alta</Th>
            </tr>
          }
        >
          {customers.map((c) => (
            <tr key={c.userId}>
              <Td className="max-w-[22rem]">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-bone-100/12 bg-ink-800 text-[0.85rem] font-medium text-gold-300">
                    {(c.displayName ?? c.email ?? "?").charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <span className="block truncate text-bone-50">
                      {c.displayName ?? c.email ?? "Cliente sin datos"}
                    </span>
                    <span className="block truncate font-mono text-[0.7rem] text-ash-500">
                      {c.displayName && c.email ? c.email : c.userId}
                    </span>
                  </div>
                </div>
              </Td>
              <Td className="text-right text-ash-300">{c.orders}</Td>
              <Td className="whitespace-nowrap text-right font-medium text-bone-50">{formatPrice(c.spentCents)}</Td>
              <Td className="text-right text-ash-300">{c.ownedBooks}</Td>
              <Td className="whitespace-nowrap text-ash-400">{c.joinedAt ? formatDate(c.joinedAt) : "—"}</Td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
