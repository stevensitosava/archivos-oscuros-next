import Link from "next/link";
import { getAllBooksAdmin } from "@/lib/admin-data";
import { formatPrice } from "@/lib/format";
import { AdminHeader, EmptyState, Table, Th, Td } from "../ui";

export const dynamic = "force-dynamic";

export default async function AdminCatalogo() {
  const books = await getAllBooksAdmin();

  return (
    <>
      <AdminHeader
        eyebrow="Contenido"
        title="Catálogo"
        action={
          <Link href="/admin/catalogo/new" className="btn btn-ember !px-5 !py-2.5 !text-[0.7rem]">
            + Nuevo libro
          </Link>
        }
      />

      {books.length === 0 ? (
        <EmptyState title="No hay libros" hint="Crea el primero con “Nuevo libro”." />
      ) : (
        <Table
          head={
            <tr>
              <Th></Th>
              <Th>Título</Th>
              <Th>Categoría</Th>
              <Th className="text-right">Precio</Th>
              <Th>Estado</Th>
              <Th></Th>
            </tr>
          }
        >
          {books.map((b) => (
            <tr key={b.id}>
              <Td>
                <div className="h-14 w-10 overflow-hidden rounded-sm bg-ink-700">
                  {b.cover_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={b.cover_image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="grid h-full w-full place-items-center text-[0.6rem] text-ash-500">
                      {b.cover_motif}
                    </span>
                  )}
                </div>
              </Td>
              <Td>
                <span className="block text-bone-100">{b.title}</span>
                <span className="block font-mono text-[0.72rem] text-ash-500">{b.slug}</span>
              </Td>
              <Td className="capitalize text-ash-300">{b.category}</Td>
              <Td className="whitespace-nowrap text-right text-bone-50">
                {b.price_cents > 0 ? formatPrice(b.price_cents, b.currency) : "Gratis"}
              </Td>
              <Td>
                <span className="flex flex-wrap gap-1.5">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[0.65rem] uppercase ${
                      b.published
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                        : "border-ash-500/30 bg-ash-500/10 text-ash-400"
                    }`}
                  >
                    {b.published ? "Publicado" : "Oculto"}
                  </span>
                  {b.featured && (
                    <span className="rounded-full border border-bone-100/15 px-2 py-0.5 text-[0.65rem] uppercase text-ash-300">
                      Destacado
                    </span>
                  )}
                </span>
              </Td>
              <Td className="text-right">
                <Link href={`/admin/catalogo/${b.id}`} className="text-[0.85rem] text-ash-400 transition-colors hover:text-bone-100">
                  Editar →
                </Link>
              </Td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
