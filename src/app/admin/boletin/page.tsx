import { getAllSubscribers } from "@/lib/admin-data";
import { getConsentingSubscriberEmails } from "@/lib/db";
import { isEmailConfigured } from "@/lib/email";
import { formatDate } from "@/lib/format";
import { AdminHeader, EmptyState, StatusBadge, Table, Th, Td } from "../ui";
import BroadcastComposer from "./BroadcastComposer";

export const dynamic = "force-dynamic";

export default async function AdminBoletin() {
  const [subs, consenting] = await Promise.all([getAllSubscribers(), getConsentingSubscriberEmails()]);
  const active = subs.filter((s) => s.status === "subscribed").length;

  return (
    <>
      <AdminHeader
        eyebrow="Marketing"
        title="Boletín"
        action={
          subs.length > 0 ? (
            <a href="/admin/boletin/export" className="btn btn-ghost !px-5 !py-2.5 !text-[0.7rem]">
              Exportar CSV
            </a>
          ) : undefined
        }
      />

      <p className="mb-6 text-[0.85rem] text-ash-400">
        {subs.length} suscriptor(es) · <span className="text-bone-100">{active}</span> activos ·{" "}
        <span className="text-bone-100">{consenting.length}</span> con consentimiento
      </p>

      <BroadcastComposer recipientCount={consenting.length} emailConfigured={isEmailConfigured} />

      {subs.length === 0 ? (
        <EmptyState title="Aún no hay suscriptores" hint="Las altas desde el formulario del pie aparecerán aquí." />
      ) : (
        <Table
          head={
            <tr>
              <Th>Email</Th>
              <Th>Estado</Th>
              <Th>Origen</Th>
              <Th>Fecha</Th>
            </tr>
          }
        >
          {subs.map((s) => (
            <tr key={s.id}>
              <Td className="max-w-[20rem] truncate text-bone-100">{s.email}</Td>
              <Td><StatusBadge status={s.status} /></Td>
              <Td className="text-ash-400">{s.source ?? "—"}</Td>
              <Td className="whitespace-nowrap text-ash-400">{formatDate(s.createdAt)}</Td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
