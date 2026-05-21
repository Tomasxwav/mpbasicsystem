import ProductosTable from "@/components/productos-table";

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-3 sm:px-5 2xl:px-8 2xl:py-6">

      {/* Filters placeholder */}
      <div className="mb-3 h-8 2xl:mb-6 2xl:h-12 rounded-lg border-2 border-dashed border-border" />

      {/* Products table */}
      <div className="mb-4 2xl:mb-8">
        <ProductosTable />
      </div>

      {/* Bottom section: form + second table */}
      <div className="grid grid-cols-1 gap-4 2xl:gap-6 lg:grid-cols-3">
        <div className="min-h-40 2xl:min-h-64 rounded-xl border-2 border-dashed border-border" />
        <div className="min-h-40 2xl:min-h-64 rounded-xl border-2 border-dashed border-border lg:col-span-2" />
      </div>

    </div>
  );
}
