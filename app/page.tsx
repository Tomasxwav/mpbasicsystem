import ProductosTable from "@/components/productos-table";

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

      {/* Filters placeholder */}
      <div className="mb-6 h-12 rounded-lg border-2 border-dashed border-border" />

      {/* Products table */}
      <div className="mb-8">
        <ProductosTable />
      </div>

      {/* Bottom section: form + second table */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="min-h-64 rounded-xl border-2 border-dashed border-border" />
        <div className="min-h-64 rounded-xl border-2 border-dashed border-border lg:col-span-2" />
      </div>

    </div>
  );
}
